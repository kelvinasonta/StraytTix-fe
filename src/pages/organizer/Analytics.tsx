import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Navigate, Link } from 'react-router-dom';
import OrganizerDashboardLayout from '../../components/layout/OrganizerDashboardLayout';
import StatCard from '../../components/ui/StatCard';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { formatCurrency, formatDate } from '../../utils/format';
import {
  Wallet,
  Landmark,
  ArrowUpRight,
  ArrowDownToLine,
  CheckCircle2,
  Clock,
  AlertCircle,
  CreditCard,
  Download,
  Search,
  Building2,
  ShieldCheck,
  BarChart3,
  LineChart,
  PieChart,
  Loader2,
  X,
  FileText,
  Calendar,
  Lock,
  RefreshCw,
  TrendingUp,
  Receipt,
  Coins,
  Sparkles,
  Plus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { useSettings } from '../../context/SettingsContext';
import { getFeeConfig } from '../../utils/fees';
import { eventApi } from '../../api/events';
import { ordersApi } from '../../api/orders';
import { paymentApi } from '../../api/payments';
import { organizerApi } from '../../api/organizers';
import { creditsApi } from '../../api/credits';
import { CreditTopupModal } from '../../components/credits/CreditTopupModal';
import { getApiErrorMessage } from '../../api/client';
import { resolveOrganizerRole, getRolePermissions } from '../../utils/permissions';
import type { Order, Event, OrderStatus } from '../../types/api';

const normalizeOrder = (raw: any): Order => {
  const rawStatus = String(raw.status || 'Pending').toLowerCase();
  let normalizedStatus: OrderStatus = 'Pending';
  if (rawStatus === 'paid') normalizedStatus = 'Paid';
  else if (rawStatus === 'refunded') normalizedStatus = 'Refunded';
  else if (rawStatus === 'failed' || rawStatus === 'cancelled') normalizedStatus = 'Failed';
  else normalizedStatus = 'Pending';

  const ticketQty = Number(
    raw.ticketQuantity ??
    (Array.isArray(raw.items) && raw.items.length > 0
      ? raw.items.reduce((sum: number, it: any) => sum + (Number(it.quantity) || 1), 0)
      : (Array.isArray(raw.tickets) && raw.tickets.length > 0 ? raw.tickets.length : 1))
  );

  const amountVal = Number(raw.total ?? raw.amount ?? raw.subtotal ?? 0);

  const rawVenue = raw.eventVenue || raw.event?.venue || raw.event?.location;
  const eventVenueStr = typeof rawVenue === 'string'
    ? rawVenue
    : (rawVenue?.venueName || rawVenue?.venue_name || rawVenue?.streetAddress || rawVenue?.street_address || rawVenue?.city || '');

  return {
    id: raw.orderNumber || raw.order_number || raw.id || `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
    orderNumber: raw.orderNumber || raw.order_number || raw.id,
    order_number: raw.order_number || raw.orderNumber || raw.id,
    customerName: raw.customerName || raw.customer_name || raw.customer?.name || raw.user?.name || 'Guest Customer',
    customerEmail: raw.customerEmail || raw.customer_email || raw.customer?.email || raw.user?.email || 'guest@example.com',
    customerPhone: raw.customerPhone || raw.customer_phone || null,
    eventTitle: raw.eventTitle || raw.event?.title || 'General Event',
    eventSlug: raw.eventSlug || raw.event?.slug || '',
    eventImageUrl: raw.eventImageUrl || raw.event?.coverImage || raw.event?.cover_image || raw.event?.imageUrl || '',
    eventDate: raw.eventDate || raw.event?.startDate || '',
    eventVenue: eventVenueStr,
    amount: amountVal,
    total: amountVal,
    subtotal: Number(raw.subtotal ?? amountVal),
    serviceFee: Number(raw.serviceFee ?? raw.service_fee ?? 0),
    discount: Number(raw.discount ?? 0),
    currency: raw.currency || 'NGN',
    ticketQuantity: ticketQty,
    status: normalizedStatus,
    reservedUntil: raw.reservedUntil || raw.reserved_until || null,
    paidAt: raw.paidAt || raw.paid_at || null,
    createdAt: raw.createdAt || raw.created_at || new Date().toISOString(),
    items: raw.items || [],
    tickets: raw.tickets || []
  };
};

interface PayoutRecord {
  id: string;
  reference: string;
  amount: number;
  fee: number;
  netAmount: number;
  destinationBank: string;
  accountEnding: string;
  status: 'completed' | 'processing' | 'scheduled';
  createdAt: string;
  completedAt?: string;
}

interface BankAccountInfo {
  bankName: string;
  accountName: string;
  accountNumber: string;
  routingNumber: string;
  currency: string;
  isVerified: boolean;
}

export const Analytics: React.FC = () => {
  const { organizer, user } = useAuth();
  const { showNotification } = useNotification();
  const { settings } = useSettings();
  const sitename = settings?.sitename || 'StraytTix';
  const role = resolveOrganizerRole(organizer);
  const perms = getRolePermissions(role);

  // If user cannot view finance & wallet, redirect to main organizer dashboard
  if (!perms.canViewFinanceWallet && !perms.canViewRevenue) {
    return <Navigate to="/organizer" replace />;
  }

  const [activeTab, setActiveTab] = useState<'wallet' | 'analytics' | 'events' | 'credits'>('wallet');
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '3m' | '6m' | '12m'>('30d');
  const [velocityMetric, setVelocityMetric] = useState<'revenue' | 'tickets'>('revenue');
  const [orders, setOrders] = useState<Order[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Bank Account State
  const [bankAccount, setBankAccount] = useState<BankAccountInfo | null>(() => {
    try {
      const cacheKey = `strayttix_bank_${organizer?.id || 'default'}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached && (cached.includes('••••••••4829') || cached.includes('058152062') || cached.includes('Primary Account'))) {
        localStorage.removeItem(cacheKey);
        return null;
      }
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  // Payout History state
  const [payouts, setPayouts] = useState<PayoutRecord[]>(() => {
    try {
      const cacheKey = `strayttix_payouts_${organizer?.id || 'default'}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached && (cached.includes('pay-001') || cached.includes('PAY-202609-0821'))) {
        localStorage.removeItem(cacheKey);
        return [];
      }
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  // Modal States
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [isSubmittingWithdraw, setIsSubmittingWithdraw] = useState(false);
  const [withdrawPin, setWithdrawPin] = useState('');

  const FALLBACK_BANKS = [
    { name: 'Guaranty Trust Bank (GTBank)', code: '058' },
    { name: 'Access Bank PLC', code: '044' },
    { name: 'Zenith Bank', code: '057' },
    { name: 'First Bank of Nigeria', code: '011' },
    { name: 'United Bank for Africa (UBA)', code: '033' },
    { name: 'Standard Chartered Bank', code: '068' },
    { name: 'Stanbic IBTC Bank', code: '221' },
    { name: 'Kuda Microfinance Bank', code: '50211' },
    { name: 'OPay Digital Services', code: '999992' },
    { name: 'PalmPay', code: '999991' },
  ];

  const [banksList, setBanksList] = useState<Array<{ name: string; code: string; slug?: string }>>(FALLBACK_BANKS);
  const [showBankModal, setShowBankModal] = useState(false);
  const [editBankForm, setEditBankForm] = useState({
    bankName: bankAccount?.bankName || 'Guaranty Trust Bank (GTBank)',
    bankCode: '058',
    accountName: bankAccount?.accountName || '',
    accountNumber: bankAccount?.accountNumber?.replace(/[^0-9]/g, '') || '',
    routingNumber: bankAccount?.routingNumber || ''
  });
  const [isSavingBank, setIsSavingBank] = useState(false);
  const [isResolvingBank, setIsResolvingBank] = useState(false);
  const [bankResolveStatus, setBankResolveStatus] = useState<'idle' | 'verified' | 'error'>('idle');
  const [bankResolveFailureType, setBankResolveFailureType] = useState<'none' | 'invalid' | 'gateway_error'>('none');
  const [bankResolveError, setBankResolveError] = useState<string | null>(null);
  const [allowUnverifiedSave, setAllowUnverifiedSave] = useState(false);
  const resolveSeqRef = useRef(0);


  // In-App Credits & Add-ons States
  interface CreditTransaction {
    id: string;
    date: string;
    description: string;
    type: 'credit' | 'debit';
    amount: number;
    balanceAfter: number;
    reference: string;
  }

  const [creditsBalance, setCreditsBalance] = useState<number>(0);
  const [creditTransactions, setCreditTransactions] = useState<CreditTransaction[]>([]);
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);

  const loadCreditsData = async () => {
    if (!organizer?.id) return;
    try {
      const [walletRes, ledgerRes] = await Promise.allSettled([
        creditsApi.getWallet(organizer.id),
        creditsApi.getLedger({ limit: 15 }, organizer.id),
      ]);

      if (walletRes.status === 'fulfilled') {
        const rawWallet = (walletRes.value as any)?.data ?? walletRes.value;
        const balance = Number(rawWallet?.available_balance ?? rawWallet?.balance ?? 0);
        setCreditsBalance(Number.isFinite(balance) ? balance : 0);
      }

      if (ledgerRes.status === 'fulfilled') {
        const rawLedger = (ledgerRes.value as any)?.data ?? ledgerRes.value;
        const items = Array.isArray(rawLedger) ? rawLedger : Array.isArray(rawLedger?.items) ? rawLedger.items : [];
        setCreditTransactions(
          items.map((item: any) => ({
            id: String(item.id),
            date: item.created_at
              ? new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : '—',
            description: item.description || item.reason || (item.type === 'credit' ? 'Credit Top-Up' : 'Credit Usage'),
            type: item.type === 'debit' ? 'debit' : 'credit',
            amount: Number(item.amount ?? 0),
            balanceAfter: Number(item.balance_after ?? 0),
            reference: item.reference || String(item.id),
          }))
        );
      }
    } catch {
      // Non-blocking: wallet/ledger remain empty until backend responds
    }
  };

  useEffect(() => {
    loadCreditsData();
  }, [organizer?.id]);

  // Load Real Data
  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      eventApi.getOrganizerEvents(organizer?.id).catch(() => ({ data: [] })),
      (organizer?.id
        ? ordersApi.getOrganizerOrders(organizer.id, undefined, { per_page: 100 }).catch(() => ({ data: [] }))
        : eventApi.getOrders(organizer?.id).catch(() => ({ data: [] }))
      ),
      paymentApi.getPayouts().catch(() => ({ data: [] })),
      organizerApi.getBanks().catch(() => ({ data: [] })),
      organizer?.id ? organizerApi.getBankAccount(organizer.id).catch(() => ({ data: null })) : Promise.resolve({ data: null })
    ])
      .then(([eventsRes, ordersRes, payoutsRes, banksRes, bankAcctRes]) => {
        const rawEvents = eventsRes.data;
        const eventItems = Array.isArray(rawEvents)
          ? rawEvents
          : Array.isArray((rawEvents as any)?.data)
            ? (rawEvents as any).data
            : [];
        setEvents(eventItems);

        const rawOrders = (ordersRes as any)?.data || ordersRes || [];
        const orderItems = Array.isArray(rawOrders)
          ? rawOrders
          : Array.isArray((rawOrders as any)?.data)
            ? (rawOrders as any).data
            : [];
        setOrders(orderItems.map((o: any) => normalizeOrder(o)));

        const rawPayouts = (payoutsRes as any)?.data || payoutsRes || [];
        const payoutItems = Array.isArray(rawPayouts)
          ? rawPayouts
          : Array.isArray((rawPayouts as any)?.data)
            ? (rawPayouts as any).data
            : [];
        if (payoutItems.length > 0) {
          setPayouts(payoutItems);
        }

        const rawBanks = (banksRes as any)?.data?.data ?? (banksRes as any)?.data ?? [];
        if (Array.isArray(rawBanks) && rawBanks.length > 0) {
          setBanksList(rawBanks);
        }

        const rawBankAcct = (bankAcctRes as any)?.data?.data ?? (bankAcctRes as any)?.data ?? null;
        if (rawBankAcct && rawBankAcct.account_number) {
          const synced: BankAccountInfo = {
            bankName: rawBankAcct.bank_name,
            accountName: rawBankAcct.account_name,
            accountNumber: `••••••••${String(rawBankAcct.account_number).slice(-4)}`,
            routingNumber: rawBankAcct.bank_code || '',
            currency: 'NGN',
            isVerified: true
          };
          setBankAccount(synced);
          localStorage.setItem(`strayttix_bank_${organizer?.id || 'default'}`, JSON.stringify(synced));
          setEditBankForm(prev => ({
            ...prev,
            bankName: rawBankAcct.bank_name || prev.bankName,
            bankCode: rawBankAcct.bank_code || prev.bankCode,
            accountName: rawBankAcct.account_name || '',
            accountNumber: String(rawBankAcct.account_number || '').replace(/[^0-9]/g, ''),
          }));
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [organizer?.id]);

  // Auto-resolve 10-digit NUBAN account number via Paystack / Flutterwave (with stale-response guard)
  const handleResolveBankAccount = async (acctNum = editBankForm.accountNumber, bCode = editBankForm.bankCode) => {
    if (acctNum.length !== 10 || !bCode) return;
    const reqSeq = ++resolveSeqRef.current;
    setIsResolvingBank(true);
    setBankResolveError(null);
    setBankResolveFailureType('none');
    setAllowUnverifiedSave(false);

    try {
      const res = await organizerApi.resolveBankAccount({
        account_number: acctNum,
        bank_code: bCode
      });
      if (reqSeq !== resolveSeqRef.current) return;

      const resolved = (res as any)?.data?.data ?? (res as any)?.data;
      if (resolved?.account_name) {
        setEditBankForm(prev => ({ ...prev, accountName: resolved.account_name }));
        setBankResolveStatus('verified');
        setBankResolveFailureType('none');
        setBankResolveError(null);
      } else {
        setBankResolveStatus('error');
        setBankResolveFailureType('invalid');
        setBankResolveError('Could not match this account number with the selected bank.');
      }
    } catch (err: any) {
      if (reqSeq !== resolveSeqRef.current) return;
      const status = err?.response?.status;
      const isGatewayOutage = !err?.response || status >= 500 || status === 429 || status === 408;

      setBankResolveStatus('error');
      setBankResolveFailureType(isGatewayOutage ? 'gateway_error' : 'invalid');
      setBankResolveError(
        isGatewayOutage
          ? 'Bank verification service is temporarily unavailable. Retry or save for manual review.'
          : getApiErrorMessage(err, 'Account number does not match the selected bank.')
      );
    } finally {
      if (reqSeq === resolveSeqRef.current) {
        setIsResolvingBank(false);
      }
    }
  };

  useEffect(() => {
    if (!showBankModal) return;
    if (editBankForm.accountNumber.length !== 10 || !editBankForm.bankCode) {
      resolveSeqRef.current += 1;
      setIsResolvingBank(false);
      setBankResolveStatus('idle');
      setBankResolveFailureType('none');
      setBankResolveError(null);
      setAllowUnverifiedSave(false);
      return;
    }
    const timer = setTimeout(() => {
      handleResolveBankAccount(editBankForm.accountNumber, editBankForm.bankCode);
    }, 350);
    return () => clearTimeout(timer);
  }, [showBankModal, editBankForm.accountNumber, editBankForm.bankCode]);

  // Save changes to localStorage
  const savePayouts = (newPayouts: PayoutRecord[]) => {
    setPayouts(newPayouts);
    localStorage.setItem(`strayttix_payouts_${organizer?.id || 'default'}`, JSON.stringify(newPayouts));
  };

  const saveBank = (newBank: BankAccountInfo) => {
    setBankAccount(newBank);
    localStorage.setItem(`strayttix_bank_${organizer?.id || 'default'}`, JSON.stringify(newBank));
  };

  // Financial Calculations
  const paidOrders = useMemo(() => orders.filter(o => o.status === 'Paid' || String(o.status).toLowerCase() === 'paid'), [orders]);

  // Total Gross Sales
  const grossRevenue = useMemo(() => {
    return paidOrders.reduce((sum, o) => sum + Number(o.total ?? o.amount ?? 0), 0);
  }, [paidOrders]);

  // Platform & Processing Fees (dynamically fetched from AppSettings)
  const { percentage: feePct } = getFeeConfig(settings);
  const platformFees = useMemo(() => Math.round(grossRevenue * (feePct / 100)), [grossRevenue, feePct]);

  // Net Lifetime Earnings
  const netEarnings = useMemo(() => Math.max(0, grossRevenue - platformFees), [grossRevenue, platformFees]);

  // Total Completed Payouts
  const totalSettledPayouts = useMemo(() => {
    return payouts
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);
  }, [payouts]);

  // In-flight Payouts
  const inFlightPayouts = useMemo(() => {
    return payouts
      .filter(p => p.status === 'processing' || p.status === 'scheduled')
      .reduce((sum, p) => sum + p.amount, 0);
  }, [payouts]);

  // Pending Clearance (Escrow: funds from upcoming events, approx 25% of net or recent orders)
  const pendingEscrow = useMemo(() => {
    // If no orders, zero; otherwise compute active events' proportion
    if (netEarnings === 0) return 0;
    return Math.round(netEarnings * 0.2);
  }, [netEarnings]);

  // Available Payout Balance = Net Earnings - Total Settled - In-Flight - Escrow
  const availableBalance = useMemo(() => {
    const raw = netEarnings - totalSettledPayouts - inFlightPayouts - pendingEscrow;
    return Math.max(0, raw);
  }, [netEarnings, totalSettledPayouts, inFlightPayouts, pendingEscrow]);

  // Average Order Value
  const avgOrderValue = paidOrders.length > 0 ? grossRevenue / paidOrders.length : 0;

  // Sales & Velocity Chart Data: Filter by selected timeframe and sort chronologically
  const timeframeDaysMap: Record<'7d' | '30d' | '3m' | '6m' | '12m', number> = {
    '7d': 7,
    '30d': 30,
    '3m': 90,
    '6m': 180,
    '12m': 365,
  };

  const timeframeOrders = useMemo(() => {
    const cutoff = Date.now() - timeframeDaysMap[timeframe] * 86400000;
    return paidOrders.filter((o) => {
      if (!o.createdAt) return true;
      const ts = new Date(o.createdAt).getTime();
      return !isNaN(ts) && ts >= cutoff;
    });
  }, [paidOrders, timeframe]);

  const salesData = useMemo(() => {
    const useMonthlyBuckets = timeframe === '3m' || timeframe === '6m' || timeframe === '12m';
    const buckets: Record<string, { sortKey: string; date: string; count: number; volume: number; orders: number }> = {};

    timeframeOrders.forEach((o) => {
      const dt = o.createdAt ? new Date(o.createdAt) : new Date();
      if (isNaN(dt.getTime())) return;

      const sortKey = useMonthlyBuckets
        ? `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`
        : `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;

      const label = useMonthlyBuckets
        ? dt.toLocaleDateString(undefined, { month: 'short', year: '2-digit' })
        : dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

      if (!buckets[sortKey]) {
        buckets[sortKey] = { sortKey, date: label, count: 0, volume: 0, orders: 0 };
      }
      buckets[sortKey].count += Number(o.ticketQuantity) || 1;
      buckets[sortKey].volume += Number(o.total ?? o.amount ?? 0);
      buckets[sortKey].orders += 1;
    });

    return Object.values(buckets).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  }, [timeframeOrders, timeframe]);

  const maxSalesCount = salesData.length > 0 ? Math.max(...salesData.map(d => d.count), 1) : 1;
  const maxSalesVolume = salesData.length > 0 ? Math.max(...salesData.map(d => d.volume), 1) : 1;

  const velocitySummary = useMemo(() => {
    const totalRevenue = timeframeOrders.reduce((sum, o) => sum + Number(o.total ?? o.amount ?? 0), 0);
    const totalTickets = timeframeOrders.reduce((sum, o) => sum + (Number(o.ticketQuantity) || 1), 0);
    const activeBuckets = Math.max(salesData.length, 1);
    const peakBucket = salesData.reduce<(typeof salesData)[0] | null>((best, cur) => {
      if (!best) return cur;
      return (velocityMetric === 'revenue' ? cur.volume > best.volume : cur.count > best.count) ? cur : best;
    }, null);

    return {
      totalRevenue,
      totalTickets,
      orderCount: timeframeOrders.length,
      avgPerBucketRevenue: totalRevenue / activeBuckets,
      avgPerBucketTickets: totalTickets / activeBuckets,
      peakBucket,
    };
  }, [timeframeOrders, salesData, velocityMetric]);

  // Revenue by Event breakdown
  const eventRevenueStats = useMemo(() => {
    return events.map(evt => {
      const eventOrders = paidOrders.filter(o =>
        (o.eventId && o.eventId === evt.id) ||
        (o.event_id && o.event_id === evt.id) ||
        (o.eventTitle && o.eventTitle === evt.title) ||
        (evt.slug && o.eventSlug === evt.slug)
      );
      const ticketsSold = eventOrders.reduce((sum, o) => sum + (Number(o.ticketQuantity) || 1), 0);
      const gross = eventOrders.reduce((sum, o) => sum + Number(o.total ?? o.amount ?? 0), 0);
      const fee = Math.round(gross * 0.035);
      const net = gross - fee;
      const isPastEvent = evt.startDate ? new Date(evt.startDate).getTime() < Date.now() : false;

      return {
        event: evt,
        ticketsSold,
        gross,
        fee,
        net,
        settlementStatus: isPastEvent ? 'Cleared for Payout' : 'In Event Escrow'
      };
    });
  }, [events, paidOrders]);

  // Withdrawal Handler
  const handleRequestWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(withdrawAmount);
    if (!amountNum || isNaN(amountNum) || amountNum <= 0) {
      showNotification('Enter a valid withdrawal amount.', 'warning');
      return;
    }

    if (amountNum > availableBalance) {
      showNotification(`Requested amount exceeds available balance of ${formatCurrency(availableBalance)}.`, 'error');
      return;
    }

    if (amountNum < 5000) {
      showNotification('Minimum withdrawal threshold is ₦5,000.', 'warning');
      return;
    }

    if (!bankAccount) {
      showNotification('Please connect a settlement bank account first.', 'warning');
      setShowWithdrawModal(false);
      setShowBankModal(true);
      return;
    }

    if (!bankAccount.isVerified) {
      showNotification('Your settlement bank account is pending verification. Please verify it before requesting a payout.', 'warning');
      setShowWithdrawModal(false);
      setShowBankModal(true);
      return;
    }

    setIsSubmittingWithdraw(true);
    try {
      const newRecord: PayoutRecord = {
        id: `pay-${Date.now().toString().slice(-4)}`,
        reference: `PAY-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`,
        amount: amountNum,
        fee: 0,
        netAmount: amountNum,
        destinationBank: `${bankAccount.bankName} (${bankAccount.accountNumber.slice(-4)})`,
        accountEnding: bankAccount.accountNumber.slice(-4),
        status: 'processing',
        createdAt: new Date().toISOString()
      };

      savePayouts([newRecord, ...payouts]);
      showNotification(`Payout transfer of ${formatCurrency(amountNum)} initiated to ${bankAccount.bankName}!`, 'success');
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      setWithdrawPin('');
    } catch {
      showNotification('Failed to process payout request. Please try again.', 'error');
    } finally {
      setIsSubmittingWithdraw(false);
    }
  };

  // Update Bank Handler (persists verified or pending-review bank account)
  const handleSaveBank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editBankForm.accountNumber.length !== 10 || !editBankForm.bankCode) {
      showNotification('Please select a bank and enter a valid 10-digit NUBAN account number.', 'warning');
      return;
    }

    const isVerified = bankResolveStatus === 'verified';
    const hasManualDetails = editBankForm.accountName.trim().length >= 3;

    if (!isVerified && !hasManualDetails) {
      showNotification('Please verify the account number or enter the account holder name manually.', 'warning');
      return;
    }

    setIsSavingBank(true);
    try {
      if (organizer?.id) {
        await organizerApi.saveBankAccount(organizer.id, {
          bank_name: editBankForm.bankName,
          bank_code: editBankForm.bankCode,
          account_number: editBankForm.accountNumber,
          account_name: editBankForm.accountName.trim(),
        });
      }

      saveBank({
        bankName: editBankForm.bankName,
        accountName: editBankForm.accountName.trim(),
        accountNumber: `••••••••${editBankForm.accountNumber.slice(-4)}`,
        routingNumber: editBankForm.bankCode,
        currency: 'NGN',
        isVerified
      });
      setShowBankModal(false);
      showNotification(
        isVerified
          ? 'Settlement bank account verified and saved.'
          : 'Bank account saved as Pending Verification. Payouts remain locked until verified.',
        isVerified ? 'success' : 'info'
      );
    } catch (err: any) {
      showNotification(getApiErrorMessage(err, 'Failed to save settlement bank account.'), 'error');
    } finally {
      setIsSavingBank(false);
    }
  };

  return (
    <OrganizerDashboardLayout>
      <div className="space-y-8">

        {/* Page Top Header */}
        <div className="border-b border-zinc-200/80 dark:border-white/10 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-red-50 dark:bg-red-500/10 text-[#E31B23] border border-red-100 dark:border-red-500/20">
                <Wallet className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-black text-zinc-950 dark:text-white tracking-tight">Finance & Wallet</h1>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs font-semibold mt-1">
              Manage cleared revenue, settlement bank accounts, escrow, and payout transfers.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {perms.canManageBanking && (
              <Button
                type="button"
                onClick={() => {
                  if (!bankAccount) {
                    showNotification('Please connect a settlement bank account first.', 'warning');
                    setShowBankModal(true);
                    return;
                  }
                  setShowWithdrawModal(true);
                }}
                disabled={availableBalance < 5000}
                className="w-full sm:w-auto bg-[#E31B23] hover:bg-[#c9141b] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <ArrowDownToLine className="w-4 h-4" /> Request Payout
              </Button>
            )}
          </div>
        </div>

        {/* Financial Highlights Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Available for Payout */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 text-white shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 -mr-6 -mt-6 w-28 h-28 bg-[#E31B23]/20 rounded-full blur-2xl pointer-events-none" />
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Available Balance</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Ready to Transfer
                </span>
              </div>
              <h2 className="text-2xl lg:text-3xl font-black tracking-tight mt-3 text-white">
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin text-white/50" /> : formatCurrency(availableBalance)}
              </h2>
            </div>
            <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
              <span>Clears instantly</span>
              <span className="font-bold text-zinc-300">Min. ₦5,000</span>
            </div>
          </div>

          {/* 2. Pending Clearance / Escrow */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0F0F14] border border-zinc-200/80 dark:border-white/10 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">In Escrow (Pending)</span>
                <span className="p-2 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-100 dark:border-amber-500/20">
                  <Clock className="w-4 h-4" />
                </span>
              </div>
              <h2 className="text-2xl font-black text-zinc-950 dark:text-white tracking-tight mt-3">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-zinc-400" /> : formatCurrency(pendingEscrow)}
              </h2>
            </div>
            <p className="text-[11px] text-zinc-500 mt-4 leading-relaxed">
              Reserved for active upcoming events until door check-in commences.
            </p>
          </div>

          {/* 3. Gross Ticket Revenue */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0F0F14] border border-zinc-200/80 dark:border-white/10 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Gross Sales</span>
                <span className="p-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-100 dark:border-blue-500/20">
                  <TrendingUp className="w-4 h-4" />
                </span>
              </div>
              <h2 className="text-2xl font-black text-zinc-950 dark:text-white tracking-tight mt-3">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-zinc-400" /> : formatCurrency(grossRevenue)}
              </h2>
            </div>
            <p className="text-[11px] text-zinc-500 mt-4 flex items-center justify-between">
              <span>Paid checkouts: <strong className="text-zinc-900 dark:text-white">{paidOrders.length}</strong></span>
              <span>Avg: <strong className="text-zinc-900 dark:text-white">{formatCurrency(avgOrderValue)}</strong></span>
            </p>
          </div>

          {/* 4. Total Payouts Settled */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0F0F14] border border-zinc-200/80 dark:border-white/10 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Settled to Bank</span>
                <span className="p-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-100 dark:border-emerald-500/20">
                  <Landmark className="w-4 h-4" />
                </span>
              </div>
              <h2 className="text-2xl font-black text-zinc-950 dark:text-white tracking-tight mt-3">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-zinc-400" /> : formatCurrency(totalSettledPayouts)}
              </h2>
            </div>
            <p className="text-[11px] text-zinc-500 mt-4 flex items-center justify-between">
              <span>Transfers: <strong className="text-zinc-900 dark:text-white">{payouts.length}</strong></span>
              <span className="text-emerald-600 font-bold">100% Cleared</span>
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white dark:bg-[#0F0F14] border border-zinc-200/80 dark:border-white/10 p-2 rounded-2xl shadow-xs flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5">
            {[
              { id: 'wallet', label: 'Wallet & Payouts', icon: <Wallet className="w-4 h-4" /> },
              { id: 'analytics', label: 'Sales & Velocity', icon: <BarChart3 className="w-4 h-4" /> },
              { id: 'events', label: 'Revenue by Event', icon: <Receipt className="w-4 h-4" /> },
              { id: 'credits', label: `${sitename} Credits`, icon: <Coins className="w-4 h-4 text-amber-500" /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${activeTab === tab.id
                  ? 'bg-[#E31B23] text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-white/5'
                  }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <Link
            to="/organizer/orders"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors whitespace-nowrap shrink-0"
          >
            <span>Customer Orders</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#E31B23]" />
          </Link>
        </div>

        {/* TAB 1: WALLET & PAYOUTS */}
        {activeTab === 'wallet' && (
          <div className="space-y-6">

            {/* Settlement Bank Account Card */}
            <div className="bg-white dark:bg-[#0F0F14] border border-zinc-200/80 dark:border-white/10 rounded-2xl p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-white/10 dark:border-white/10 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
                    <h3 className="text-base font-black text-zinc-950 dark:text-white">Settlement Bank Account</h3>
                    {bankAccount && (
                      bankAccount.isVerified ? (
                        <Badge variant="success" className="gap-1">
                          <ShieldCheck className="w-3 h-3" /> Verified
                        </Badge>
                      ) : (
                        <Badge variant="warning" className="gap-1">
                          <Clock className="w-3 h-3" /> Pending Verification
                        </Badge>
                      )
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">
                    Funds requested for withdrawal are settled into this verified commercial account.
                  </p>
                </div>

                {perms.canManageBanking && bankAccount && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const matchedBank = banksList.find(b => b.name === bankAccount.bankName || b.code === bankAccount.routingNumber);
                      setEditBankForm({
                        bankName: bankAccount.bankName,
                        bankCode: matchedBank?.code || bankAccount.routingNumber || banksList[0]?.code || '058',
                        accountName: bankAccount.accountName,
                        accountNumber: bankAccount.accountNumber.replace(/[^0-9]/g, '') || '',
                        routingNumber: bankAccount.routingNumber
                      });
                      setBankResolveStatus('idle');
                      setBankResolveError(null);
                      setShowBankModal(true);
                    }}
                    fullWidth={false} className="w-auto text-xs font-bold px-4 py-2"
                  >
                    Edit Bank Account
                  </Button>
                )}
              </div>

              {!bankAccount ? (
                <div className="p-8 text-center bg-zinc-50/50 dark:bg-white/[0.02] rounded-xl border border-dashed border-zinc-200 dark:border-white/15 space-y-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-white/10 text-zinc-400 mx-auto flex items-center justify-center">
                    <Landmark className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">No Settlement Bank Account Connected</p>
                  <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                    Connect your commercial bank account to receive automated ticket sales payouts and on-demand withdrawals.
                  </p>
                  {perms.canManageBanking && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setEditBankForm({
                          bankName: banksList[0]?.name || 'Guaranty Trust Bank (GTBank)',
                          bankCode: banksList[0]?.code || '058',
                          accountName: '',
                          accountNumber: '',
                          routingNumber: ''
                        });
                        setBankResolveStatus('idle');
                        setBankResolveError(null);
                        setShowBankModal(true);
                      }}
                      fullWidth={false} className="w-auto gap-1.5 mt-2 px-5"
                    >
                      <span>Connect Bank Account</span>
                    </Button>
                  )}
                </div>
              ) : (
                /* Bank Details Display */
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-5">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Financial Institution</span>
                    <p className="text-sm font-bold text-zinc-900 dark:text-white">{bankAccount.bankName}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Account Name</span>
                    <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">{bankAccount.accountName}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Account Number</span>
                    <p className="text-sm font-mono font-bold text-zinc-900 dark:text-white">{bankAccount.accountNumber}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Payout Transfer History */}
            <div className="bg-white dark:bg-[#0F0F14] border border-zinc-200/80 dark:border-white/10 rounded-2xl shadow-xs overflow-hidden">
              <div className="p-6 border-b border-zinc-100 dark:border-white/10 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-zinc-950 dark:text-white">Payout Transfer History</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">Historical ledger of all disbursements to your bank account.</p>
                </div>
                <span className="text-xs font-bold text-zinc-500">
                  {payouts.length} Transfers
                </span>
              </div>

              {payouts.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-white/10 text-zinc-400 mx-auto flex items-center justify-center">
                    <Receipt className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">No Payouts Initiated Yet</h4>
                  <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                    Once you request a withdrawal or an automated disbursement triggers, records will populate here.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-zinc-50 dark:bg-white/[0.03] border-b border-zinc-100 dark:border-white/10 text-zinc-400 font-bold uppercase tracking-wider text-xs">
                      <tr>
                        <th className="px-6 py-4">Reference ID</th>
                        <th className="px-6 py-4">Destination Account</th>
                        <th className="px-6 py-4">Transfer Date</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-white/10 font-medium text-zinc-800 dark:text-zinc-200">
                      {payouts.map((p) => (
                        <tr key={p.id} className="hover:bg-zinc-50/70 dark:hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                              <span className="font-mono text-xs font-bold text-zinc-900 dark:text-white">{p.reference}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs font-medium text-zinc-600 dark:text-zinc-300">
                            {p.destinationBank}
                          </td>
                          <td className="px-6 py-4 text-xs text-zinc-500 font-medium">
                            {formatDate(p.createdAt)}
                          </td>
                          <td className="px-6 py-4">
                            {p.status === 'completed' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                                <CheckCircle2 className="w-3 h-3" /> Completed
                              </span>
                            ) : p.status === 'processing' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                                <RefreshCw className="w-3 h-3 animate-spin" /> Processing
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
                                <Clock className="w-3 h-3" /> Scheduled
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-zinc-950 dark:text-white dark:text-white font-mono text-sm">
                            {formatCurrency(p.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: SALES & VELOCITY */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Velocity Summary Strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Period Revenue"
                value={formatCurrency(velocitySummary.totalRevenue)}
                description={`${velocitySummary.orderCount} completed ${velocitySummary.orderCount === 1 ? 'order' : 'orders'}`}
                icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
              />
              <StatCard
                title="Tickets Sold"
                value={velocitySummary.totalTickets.toLocaleString()}
                description={`Last ${timeframe.toUpperCase()} window`}
                icon={<Receipt className="w-5 h-5 text-blue-600" />}
              />
              <StatCard
                title={timeframe === '7d' || timeframe === '30d' ? 'Daily Sales Pace' : 'Monthly Sales Pace'}
                value={formatCurrency(Math.round(velocitySummary.avgPerBucketRevenue))}
                description={`~${velocitySummary.avgPerBucketTickets.toFixed(1)} tickets / active ${timeframe === '7d' || timeframe === '30d' ? 'day' : 'month'}`}
                icon={<BarChart3 className="w-5 h-5 text-[#E31B23]" />}
              />
              <StatCard
                title="Peak Period"
                value={velocitySummary.peakBucket ? velocitySummary.peakBucket.date : '—'}
                description={
                  velocitySummary.peakBucket
                    ? `${velocitySummary.peakBucket.count} tickets • ${formatCurrency(velocitySummary.peakBucket.volume)}`
                    : 'No sales recorded yet'
                }
                icon={<Sparkles className="w-5 h-5 text-amber-500" />}
              />
            </div>

            <div className="bg-white dark:bg-[#0F0F14] border border-zinc-200/80 dark:border-white/10 p-6 rounded-2xl shadow-xs space-y-6">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-zinc-100 dark:border-white/10 pb-4">
                <div>
                  <h3 className="text-base font-black text-zinc-950 dark:text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-[#E31B23]" /> Ticket Sales & Revenue Velocity
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">Real-time checkout volume and revenue cadence over time.</p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Metric Switcher */}
                  <div className="flex items-center gap-1 bg-zinc-100 dark:bg-white/5 p-1 rounded-xl border border-zinc-200/70 dark:border-white/10">
                    <button
                      type="button"
                      onClick={() => setVelocityMetric('revenue')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${velocityMetric === 'revenue'
                        ? 'bg-white dark:bg-[#0F0F14] text-zinc-950 dark:text-white shadow-2xs'
                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white'
                        }`}
                    >
                      Revenue
                    </button>
                    <button
                      type="button"
                      onClick={() => setVelocityMetric('tickets')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${velocityMetric === 'tickets'
                        ? 'bg-white dark:bg-[#0F0F14] text-zinc-950 dark:text-white shadow-2xs'
                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white'
                        }`}
                    >
                      Tickets
                    </button>
                  </div>

                  {/* Timeframe Filter */}
                  <div className="flex items-center gap-1.5">
                    {(['7d', '30d', '3m', '6m', '12m'] as const).map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTimeframe(t)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${timeframe === t
                          ? 'bg-[#E31B23] text-white shadow-xs'
                          : 'bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-700 dark:text-zinc-300'
                          }`}
                      >
                        {t.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {isLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-[#E31B23]" />
                </div>
              ) : salesData.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-zinc-200 dark:border-white/15 rounded-xl space-y-2">
                  <BarChart3 className="w-10 h-10 text-zinc-300 dark:text-zinc-600" />
                  <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">No sales activity in this timeframe</p>
                  <p className="text-xs text-zinc-400 max-w-sm">
                    When attendees purchase event tickets in the last {timeframe.toUpperCase()}, your sales velocity throughput will chart here automatically.
                  </p>
                </div>
              ) : (
                <div className="h-72 flex items-end justify-around gap-3 pt-12 pb-3 border-b border-zinc-100 dark:border-white/10 overflow-x-auto">
                  {salesData.map((data) => {
                    const ratio = velocityMetric === 'revenue'
                      ? (data.volume / maxSalesVolume)
                      : (data.count / maxSalesCount);
                    const heightPercent = Math.min(100, Math.max(12, Math.round(ratio * 88 + 10)));

                    return (
                      <div key={data.sortKey} className="flex-1 min-w-[42px] max-w-[72px] h-full flex flex-col items-center justify-end gap-2 group cursor-pointer relative">
                        {/* Tooltip on hover */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-mono text-[10px] font-bold px-2.5 py-1.5 rounded-lg shadow-xl absolute top-0 pointer-events-none z-20 whitespace-nowrap">
                          {data.count} {data.count === 1 ? 'ticket' : 'tickets'} • {formatCurrency(data.volume)}
                        </div>

                        {/* Value label above bar */}
                        <span className="text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400 group-hover:text-[#E31B23] transition-colors">
                          {velocityMetric === 'revenue' ? formatCurrency(data.volume) : data.count}
                        </span>

                        {/* Bar */}
                        <div
                          className="w-full max-w-[44px] bg-gradient-to-t from-[#E31B23]/80 to-[#E31B23] group-hover:brightness-110 rounded-t-xl transition-all duration-300 shadow-xs"
                          style={{ height: `${heightPercent}%` }}
                        />

                        {/* Date Label */}
                        <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 truncate max-w-full">{data.date}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: REVENUE BY EVENT */}
        {activeTab === 'events' && (
          <div className="bg-white dark:bg-[#0F0F14] border border-zinc-200/80 dark:border-white/10 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-6 border-b border-zinc-100 dark:border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-zinc-950 dark:text-white">Event Revenue & Clearance Breakdown</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Performance, processing fee deduction, and payout settlement state per event.</p>
              </div>
              <span className="text-xs font-bold text-zinc-500">{events.length} Events Total</span>
            </div>

            {events.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <Receipt className="w-10 h-10 text-zinc-300 mx-auto" />
                <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">No Events Found</h4>
                <p className="text-xs text-zinc-400">Create events to begin tracking admissions and revenue.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-zinc-50 dark:bg-white/[0.03] border-b border-zinc-100 dark:border-white/10 text-zinc-400 font-bold uppercase tracking-wider text-xs">
                    <tr>
                      <th className="px-6 py-4">Event Name</th>
                      <th className="px-6 py-4">Tickets Sold</th>
                      <th className="px-6 py-4">Gross Revenue</th>
                      <th className="px-6 py-4">Platform Fee (3.5%)</th>
                      <th className="px-6 py-4">Net Payout</th>
                      <th className="px-6 py-4 text-right">Escrow Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-white/10 font-medium text-zinc-800 dark:text-zinc-200">
                    {eventRevenueStats.map((item, idx) => (
                      <tr key={idx} className="hover:bg-zinc-50/70 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-zinc-950 dark:text-white">{item.event.title || 'Untitled Event'}</p>
                          <span className="text-xs text-zinc-400">{item.event.startDate ? formatDate(item.event.startDate) : 'Upcoming'}</span>
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-zinc-800 dark:text-zinc-200">
                          {item.ticketsSold}
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-zinc-950 dark:text-white">
                          {formatCurrency(item.gross)}
                        </td>
                        <td className="px-6 py-4 font-mono text-zinc-500">
                          {formatCurrency(item.fee)}
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                          {formatCurrency(item.net)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${item.settlementStatus.includes('Cleared')
                            ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                            : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20'
                            }`}>
                            {item.settlementStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* MODAL 1: REQUEST PAYOUT */}
        {showWithdrawModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white dark:bg-[#0F0F14] border border-zinc-200 dark:border-white/10 rounded-3xl max-w-md w-full shadow-2xl p-6 space-y-6 animate-scaleUp text-zinc-900 dark:text-white">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-red-50 text-[#E31B23] rounded-xl">
                    <ArrowDownToLine className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-zinc-950 dark:text-white">Request Payout</h3>
                    <p className="text-xs text-zinc-500">Withdraw available cleared funds to bank</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="text-zinc-400 hover:text-zinc-700 dark:hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleRequestWithdrawal} className="space-y-4">
                {/* Available balance indicator */}
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Available to Withdraw</span>
                  <span className="text-sm font-black font-mono text-zinc-950 dark:text-white">{formatCurrency(availableBalance)}</span>
                </div>

                {/* Amount Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Withdrawal Amount (₦)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="1000"
                      min="5000"
                      max={availableBalance}
                      placeholder="e.g. 50000"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl font-mono text-base font-bold pr-20 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setWithdrawAmount(availableBalance.toString())}
                      className="absolute right-2.5 top-2.5 text-[10px] font-black uppercase tracking-wider px-2 py-1 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      MAX
                    </button>
                  </div>
                  <p className="text-[11px] text-zinc-500">Minimum withdrawal is ₦5,000. Maximum is cleared available balance.</p>
                </div>

                {/* Destination Bank Preview */}
                {bankAccount ? (
                  <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-zinc-500 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">{bankAccount.bankName}</p>
                      <p className="text-[11px] font-mono text-zinc-500">{bankAccount.accountNumber} • {bankAccount.accountName}</p>
                    </div>
                    <Badge variant="success" className="text-[9px]">Connected</Badge>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl border border-dashed border-amber-300 bg-amber-50 text-amber-900 text-xs font-medium">
                    No bank account connected. Please connect your bank account first.
                  </div>
                )}

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowWithdrawModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/5 text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <Button
                    type="submit"
                    isLoading={isSubmittingWithdraw}
                    fullWidth={false} className="w-auto bg-[#E31B23] hover:bg-[#c9141b] text-white px-6 py-2.5 text-xs font-bold rounded-xl"
                  >
                    Confirm Payout
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: EDIT BANK ACCOUNT */}
        {showBankModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white dark:bg-[#0F0F14] border border-zinc-200 dark:border-white/10 rounded-3xl max-w-md w-full shadow-2xl p-6 space-y-6 animate-scaleUp text-zinc-900 dark:text-white">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-zinc-950 dark:text-white">Settlement Bank Details</h3>
                    <p className="text-xs text-zinc-500">Provide bank details for automated transfers</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowBankModal(false)}
                  className="text-zinc-400 hover:text-zinc-700 dark:hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveBank} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Bank Name</label>
                  <select
                    value={editBankForm.bankCode}
                    onChange={(e) => {
                      const code = e.target.value;
                      const match = banksList.find(b => b.code === code);
                      setEditBankForm(prev => ({
                        ...prev,
                        bankCode: code,
                        bankName: match?.name || prev.bankName,
                        accountName: ''
                      }));
                      setBankResolveStatus('idle');
                      setBankResolveError(null);
                    }}
                    className="w-full bg-zinc-50 dark:bg-[#070709] border border-zinc-200 dark:border-white/10 text-xs font-bold rounded-xl px-3 py-2.5 text-zinc-900 dark:text-white focus:outline-none focus:border-[#E31B23] cursor-pointer"
                  >
                    {banksList.map((b) => (
                      <option key={`${b.code}-${b.name}`} value={b.code}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      10-Digit NUBAN Account Number
                    </label>
                    {isResolvingBank && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-zinc-500">
                        <Loader2 className="w-3 h-3 animate-spin text-[#E31B23]" />
                        Verifying...
                      </span>
                    )}
                    {!isResolvingBank && bankResolveStatus === 'verified' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <Input
                        label=""
                        type="text"
                        maxLength={10}
                        value={editBankForm.accountNumber}
                        onChange={(e) => {
                          const num = e.target.value.replace(/[^0-9]/g, '');
                          setEditBankForm(prev => ({ ...prev, accountNumber: num, accountName: '' }));
                          setBankResolveStatus('idle');
                          setBankResolveError(null);
                        }}
                        placeholder="e.g. 0123456789"
                        required
                        className="font-mono"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleResolveBankAccount()}
                      disabled={editBankForm.accountNumber.length !== 10 || isResolvingBank}
                      className="px-3.5 py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-opacity shrink-0"
                    >
                      Verify
                    </button>
                  </div>
                  {bankResolveError && (
                    <div className={`p-3 rounded-xl border text-[11px] space-y-2 ${bankResolveFailureType === 'gateway_error'
                      ? 'bg-amber-50/80 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-800 dark:text-amber-200'
                      : 'bg-rose-50/80 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-300'
                      }`}>
                      <p className="font-semibold flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{bankResolveError}</span>
                      </p>
                      {bankResolveFailureType === 'gateway_error' && (
                        <label className="flex items-center gap-2 cursor-pointer font-bold pt-0.5">
                          <input
                            type="checkbox"
                            checked={allowUnverifiedSave}
                            onChange={(e) => setAllowUnverifiedSave(e.target.checked)}
                            className="rounded border-amber-400 text-[#E31B23] focus:ring-[#E31B23]"
                          />
                          <span>Save manually as Pending Verification (payouts locked until verified)</span>
                        </label>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Input
                    label={bankResolveStatus === 'verified' ? 'Verified Account Holder Name' : 'Account Holder Name'}
                    type="text"
                    value={editBankForm.accountName}
                    onChange={(e) => {
                      setEditBankForm(prev => ({ ...prev, accountName: e.target.value }));
                      if (bankResolveStatus === 'verified') {
                        setBankResolveStatus('idle');
                      }
                    }}
                    placeholder={
                      isResolvingBank
                        ? 'Resolving account name...'
                        : 'Auto-fills on verification, or type manually'
                    }
                    required
                    className={bankResolveStatus === 'verified'
                      ? 'bg-emerald-50/70 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30 font-bold text-emerald-900 dark:text-emerald-200'
                      : ''}
                  />
                </div>

                <div className="p-3 bg-blue-50/70 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>
                    Account name is auto-verified via Paystack / Flutterwave. If you enter it manually, it will be saved as Pending Verification.
                  </span>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowBankModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/5 text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <Button
                    type="submit"
                    isLoading={isSavingBank}
                    disabled={
                      isResolvingBank ||
                      editBankForm.accountNumber.length !== 10 ||
                      editBankForm.accountName.trim().length < 3
                    }
                    fullWidth={false} className="w-auto bg-[#E31B23] hover:bg-[#c9141b] text-white px-6 py-2.5 text-xs font-bold rounded-xl disabled:opacity-50"
                  >
                    {bankResolveStatus === 'verified' ? 'Save Verified Account' : 'Save Account Details'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}


        {/* TAB 5: APP CREDITS & MARKETING UTILITIES */}
        {activeTab === 'credits' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Credits Hero Banner */}
            <div className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-12 -mr-12 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-1/3 -mb-16 w-60 h-60 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-wider border border-amber-500/30">
                    <Sparkles className="w-3 h-3 text-amber-400" /> {sitename} Credits Wallet
                  </div>
                  <div className="flex items-baseline gap-3">
                    <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                      {creditsBalance.toLocaleString()}
                    </h2>
                    <span className="text-sm sm:text-base font-semibold text-zinc-400">Credits Available</span>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-300 max-w-xl font-medium leading-relaxed">
                    {sitename} Credits directly power email marketing broadcasts, newsletter campaigns, ticket reminders, and attendee promotional mail drops. 1 Credit sends 1 marketing email.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <Button
                    type="button"
                    onClick={() => setIsTopUpModalOpen(true)}
                    fullWidth={false} className="w-auto bg-amber-500 hover:bg-amber-600 text-zinc-950 font-black text-xs px-5 py-3 rounded-xl shadow-md inline-flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    Top-Up Credits
                  </Button>
                </div>
              </div>

              <div className="relative z-10 mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-400">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Estimated Value: <strong>₦{(creditsBalance * 10).toLocaleString()}</strong></span>
                </div>
                <div>1 {sitename} Credit = ₦10.00 NGN</div>
              </div>
            </div>

            {/* Credit Transaction Ledger */}
            <div className="bg-white dark:bg-[#0F0F14] border border-zinc-200/80 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-white/10 pb-4">
                <div>
                  <h3 className="text-base font-black text-zinc-950 dark:text-white tracking-tight">Credit Ledger & Transaction History</h3>
                  <p className="text-xs text-zinc-500 font-medium">Record of all credit purchases, marketing deductions, and feature usage.</p>
                </div>
                <span className="text-xs font-bold text-zinc-400 font-mono">
                  {creditTransactions.length} records
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-150 dark:border-white/10 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                      <th className="pb-3 font-semibold">Date</th>
                      <th className="pb-3 font-semibold">Description</th>
                      <th className="pb-3 font-semibold">Reference</th>
                      <th className="pb-3 font-semibold text-right">Amount</th>
                      <th className="pb-3 font-semibold text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-white/10">
                    {creditTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-zinc-500 font-medium">
                          No credit transactions yet. Credit top-ups and marketing usage records will appear here.
                        </td>
                      </tr>
                    ) : (
                      creditTransactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-zinc-50/60 dark:hover:bg-white/[0.02] transition-colors">
                          <td className="py-3.5 text-zinc-500 font-medium whitespace-nowrap">{tx.date}</td>
                          <td className="py-3.5 text-zinc-900 dark:text-white font-bold">{tx.description}</td>
                          <td className="py-3.5 font-mono text-[11px] text-zinc-400">{tx.reference}</td>
                          <td className={`py-3.5 font-black text-right whitespace-nowrap ${tx.type === 'credit' ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-900 dark:text-white'
                            }`}>
                            {tx.type === 'credit' ? `+${tx.amount}` : `-${tx.amount}`} Credits
                          </td>
                          <td className="py-3.5 font-bold text-zinc-700 dark:text-zinc-300 text-right whitespace-nowrap">
                            {tx.balanceAfter.toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: TOP-UP APP CREDITS */}
        <CreditTopupModal
          isOpen={isTopUpModalOpen}
          onClose={() => setIsTopUpModalOpen(false)}
          onSuccess={loadCreditsData}
          organizerUuid={organizer?.id}
        />

      </div>
    </OrganizerDashboardLayout>
  );
};

export default Analytics;
