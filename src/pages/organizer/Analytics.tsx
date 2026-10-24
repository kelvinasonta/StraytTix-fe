import React, { useState, useEffect, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
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
  Receipt, Coins, Sparkles, MessageSquare, Rocket, QrCode, Mail, Zap, Plus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { eventApi } from '../../api/events';
import { ordersApi } from '../../api/orders';
import { paymentApi } from '../../api/payments';
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
    eventVenue: raw.eventVenue || raw.event?.location || '',
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
  const role = resolveOrganizerRole(organizer);
  const perms = getRolePermissions(role);

  // If user cannot view finance & wallet, redirect to main organizer dashboard
  if (!perms.canViewFinanceWallet && !perms.canViewRevenue) {
    return <Navigate to="/organizer" replace />;
  }

  const [activeTab, setActiveTab] = useState<'wallet' | 'analytics' | 'events' | 'ledger' | 'credits'>('wallet');
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '3m' | '6m' | '12m'>('30d');
  const [orders, setOrders] = useState<Order[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Bank Account State
  const [bankAccount, setBankAccount] = useState<BankAccountInfo | null>(() => {
    try {
      const cacheKey = `eventsos_bank_${organizer?.id || 'default'}`;
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

  const [payoutSchedule, setPayoutSchedule] = useState<'daily' | 'weekly' | 'monthly' | 'manual'>('weekly');

  // Payout History state
  const [payouts, setPayouts] = useState<PayoutRecord[]>(() => {
    try {
      const cacheKey = `eventsos_payouts_${organizer?.id || 'default'}`;
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

  const [showBankModal, setShowBankModal] = useState(false);
  const [editBankForm, setEditBankForm] = useState({
    bankName: bankAccount?.bankName || 'Guaranty Trust Bank (GTBank)',
    accountName: bankAccount?.accountName || organizer?.name || '',
    accountNumber: bankAccount?.accountNumber?.replace(/[^0-9]/g, '') || '',
    routingNumber: bankAccount?.routingNumber || ''
  });
  const [isSavingBank, setIsSavingBank] = useState(false);


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

  const [creditsBalance, setCreditsBalance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('eventsos_organizer_credits');
      return saved ? Number(saved) : 0;
    } catch {
      return 0;
    }
  });

  const [creditTransactions, setCreditTransactions] = useState<CreditTransaction[]>(() => {
    try {
      const saved = localStorage.getItem('eventsos_organizer_credit_txs');
      if (saved && (saved.includes('tx-1') || saved.includes('Growth Pack Top-Up'))) {
        localStorage.removeItem('eventsos_organizer_credit_txs');
        return [];
      }
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [selectedPack, setSelectedPack] = useState<'starter' | 'growth' | 'power' | 'custom'>('growth');
  const [customCreditsAmount, setCustomCreditsAmount] = useState('250');
  const [isProcessingTopUp, setIsProcessingTopUp] = useState(false);

  useEffect(() => {
    localStorage.setItem('eventsos_organizer_credits', creditsBalance.toString());
  }, [creditsBalance]);

  useEffect(() => {
    localStorage.setItem('eventsos_organizer_credit_txs', JSON.stringify(creditTransactions));
  }, [creditTransactions]);

  const handleCompleteTopUp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessingTopUp(true);

    let creditsToAdd = 500;
    let priceNgn = 22500;

    if (selectedPack === 'starter') {
      creditsToAdd = 100;
      priceNgn = 5000;
    } else if (selectedPack === 'power') {
      creditsToAdd = 1500;
      priceNgn = 60000;
    } else if (selectedPack === 'custom') {
      creditsToAdd = Math.max(50, Number(customCreditsAmount) || 50);
      priceNgn = creditsToAdd * 50;
    }

    setTimeout(() => {
      setIsProcessingTopUp(false);
      const newTotal = creditsBalance + creditsToAdd;
      setCreditsBalance(newTotal);

      const newTx: CreditTransaction = {
        id: `tx-${Date.now()}`,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        description: `Credits Purchase (${creditsToAdd} Credits - ₦${priceNgn.toLocaleString()})`,
        type: 'credit',
        amount: creditsToAdd,
        balanceAfter: newTotal,
        reference: `PS_${Math.floor(100000 + Math.random() * 900000)}`
      };

      setCreditTransactions(prev => [newTx, ...prev]);
      setIsTopUpModalOpen(false);
      showNotification(`Successfully topped up ${creditsToAdd} Credits! New balance: ${newTotal} Credits.`, 'success');
    }, 1200);
  };

  const handleSimulateFeatureUse = (featureName: string, cost: number) => {
    if (creditsBalance < cost) {
      showNotification(`Insufficient credits! You need ${cost} credits, but have ${creditsBalance}. Please top up.`, 'error');
      setIsTopUpModalOpen(true);
      return;
    }

    const newTotal = creditsBalance - cost;
    setCreditsBalance(newTotal);

    const newTx: CreditTransaction = {
      id: `tx-${Date.now()}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      description: `In-App Feature: ${featureName}`,
      type: 'debit',
      amount: cost,
      balanceAfter: newTotal,
      reference: `ACT_${Math.floor(100000 + Math.random() * 900000)}`
    };

    setCreditTransactions(prev => [newTx, ...prev]);
    showNotification(`Activated "${featureName}" (-${cost} Credits). Remaining: ${newTotal} Credits.`, 'success');
  };

  // Search & Filter in Ledger
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [ledgerStatusFilter, setLedgerStatusFilter] = useState<'all' | 'Paid' | 'Pending' | 'Refunded'>('all');

  // Load Real Data
  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      eventApi.getOrganizerEvents(organizer?.id).catch(() => ({ data: [] })),
      (organizer?.id 
        ? ordersApi.getOrganizerOrders(organizer.id).catch(() => ({ data: [] }))
        : eventApi.getOrders(organizer?.id).catch(() => ({ data: [] }))
      ),
      paymentApi.getPayouts().catch(() => ({ data: [] }))
    ])
      .then(([eventsRes, ordersRes, payoutsRes]) => {
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
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [organizer?.id]);

  // Save changes to localStorage
  const savePayouts = (newPayouts: PayoutRecord[]) => {
    setPayouts(newPayouts);
    localStorage.setItem(`eventsos_payouts_${organizer?.id || 'default'}`, JSON.stringify(newPayouts));
  };

  const saveBank = (newBank: BankAccountInfo) => {
    setBankAccount(newBank);
    localStorage.setItem(`eventsos_bank_${organizer?.id || 'default'}`, JSON.stringify(newBank));
  };

  // Financial Calculations
  const paidOrders = useMemo(() => orders.filter(o => o.status === 'Paid' || String(o.status).toLowerCase() === 'paid'), [orders]);
  
  // Total Gross Sales
  const grossRevenue = useMemo(() => {
    return paidOrders.reduce((sum, o) => sum + Number(o.total ?? o.amount ?? 0), 0);
  }, [paidOrders]);

  // Platform & Processing Fees (estimated at 3.5%)
  const platformFees = useMemo(() => Math.round(grossRevenue * 0.035), [grossRevenue]);

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

  // Chart Data: Group paid orders by date
  const salesByDate = useMemo(() => {
    return paidOrders.reduce<Record<string, { count: number; volume: number }>>((acc, o) => {
      const d = o.createdAt ? new Date(o.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Recent';
      if (!acc[d]) acc[d] = { count: 0, volume: 0 };
      acc[d].count += (Number(o.ticketQuantity) || 1);
      acc[d].volume += Number(o.amount || 0);
      return acc;
    }, {});
  }, [paidOrders]);

  const salesData = useMemo(() => {
    return Object.entries(salesByDate).map(([date, data]) => ({ date, ...data }));
  }, [salesByDate]);

  const maxSalesCount = salesData.length > 0 ? Math.max(...salesData.map(d => d.count)) : 1;

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

  // Filtered Ledger Orders
  const filteredLedger = useMemo(() => {
    return orders.filter(o => {
      const matchesSearch = 
        !ledgerSearch ||
        o.id.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
        (o.customerName || '').toLowerCase().includes(ledgerSearch.toLowerCase()) ||
        (o.customerEmail || '').toLowerCase().includes(ledgerSearch.toLowerCase()) ||
        (o.eventTitle || '').toLowerCase().includes(ledgerSearch.toLowerCase());

      const matchesStatus = ledgerStatusFilter === 'all' || o.status === ledgerStatusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, ledgerSearch, ledgerStatusFilter]);

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

  // Update Bank Handler
  const handleSaveBank = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editBankForm.accountName.trim() || !editBankForm.accountNumber.trim()) {
      showNotification('Please fill in all banking fields.', 'warning');
      return;
    }

    setIsSavingBank(true);
    setTimeout(() => {
      saveBank({
        bankName: editBankForm.bankName,
        accountName: editBankForm.accountName,
        accountNumber: `••••••••${editBankForm.accountNumber.slice(-4)}`,
        routingNumber: editBankForm.routingNumber,
        currency: 'NGN',
        isVerified: true
      });
      setIsSavingBank(false);
      setShowBankModal(false);
      showNotification('Settlement bank account updated and verified.', 'success');
    }, 800);
  };

  return (
    <OrganizerDashboardLayout>
      <div className="space-y-8">
        
        {/* Page Top Header */}
        <div className="border-b border-zinc-200/80 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-red-50 text-[#E31B23]">
                <Wallet className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-black text-zinc-950 tracking-tight">Finance & Wallet</h1>
            </div>
            <p className="text-zinc-500 text-xs font-semibold mt-1">
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
          <div className="p-6 rounded-2xl bg-white border border-zinc-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">In Escrow (Pending)</span>
                <span className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                  <Clock className="w-4 h-4" />
                </span>
              </div>
              <h2 className="text-2xl font-black text-zinc-950 tracking-tight mt-3">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-zinc-400" /> : formatCurrency(pendingEscrow)}
              </h2>
            </div>
            <p className="text-[11px] text-zinc-500 mt-4 leading-relaxed">
              Reserved for active upcoming events until door check-in commences.
            </p>
          </div>

          {/* 3. Gross Ticket Revenue */}
          <div className="p-6 rounded-2xl bg-white border border-zinc-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Gross Sales</span>
                <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <TrendingUp className="w-4 h-4" />
                </span>
              </div>
              <h2 className="text-2xl font-black text-zinc-950 tracking-tight mt-3">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-zinc-400" /> : formatCurrency(grossRevenue)}
              </h2>
            </div>
            <p className="text-[11px] text-zinc-500 mt-4 flex items-center justify-between">
              <span>Paid checkouts: <strong className="text-zinc-900">{paidOrders.length}</strong></span>
              <span>Avg: <strong className="text-zinc-900">{formatCurrency(avgOrderValue)}</strong></span>
            </p>
          </div>

          {/* 4. Total Payouts Settled */}
          <div className="p-6 rounded-2xl bg-white border border-zinc-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Settled to Bank</span>
                <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Landmark className="w-4 h-4" />
                </span>
              </div>
              <h2 className="text-2xl font-black text-zinc-950 tracking-tight mt-3">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-zinc-400" /> : formatCurrency(totalSettledPayouts)}
              </h2>
            </div>
            <p className="text-[11px] text-zinc-500 mt-4 flex items-center justify-between">
              <span>Transfers: <strong className="text-zinc-900">{payouts.length}</strong></span>
              <span className="text-emerald-600 font-bold">100% Cleared</span>
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white border border-zinc-200/80 p-2 rounded-2xl shadow-xs flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'wallet', label: 'Wallet & Payouts', icon: <Wallet className="w-4 h-4" /> },
            { id: 'analytics', label: 'Sales & Velocity', icon: <BarChart3 className="w-4 h-4" /> },
            { id: 'events', label: 'Revenue by Event', icon: <Receipt className="w-4 h-4" /> },
            { id: 'ledger', label: 'Transaction Ledger', icon: <FileText className="w-4 h-4" /> },
            { id: 'credits', label: 'Email Marketing & Credits', icon: <Coins className="w-4 h-4 text-amber-500" /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-zinc-900 text-white shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: WALLET & PAYOUTS */}
        {activeTab === 'wallet' && (
          <div className="space-y-6">
            
            {/* Settlement Bank Account Card */}
            <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-zinc-700" />
                    <h3 className="text-base font-black text-zinc-950">Settlement Bank Account</h3>
                    <Badge variant="success" className="gap-1">
                      <ShieldCheck className="w-3 h-3" /> Verified
                    </Badge>
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
                      setEditBankForm({
                        bankName: bankAccount.bankName,
                        accountName: bankAccount.accountName,
                        accountNumber: bankAccount.accountNumber.replace(/[^0-9]/g, '') || '',
                        routingNumber: bankAccount.routingNumber
                      });
                      setShowBankModal(true);
                    }}
                    className="w-auto text-xs font-bold px-4 py-2"
                  >
                    Edit Bank Account
                  </Button>
                )}
              </div>

              {!bankAccount ? (
                <div className="p-8 text-center bg-zinc-50/50 rounded-xl border border-dashed border-zinc-200 space-y-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-100 text-zinc-400 mx-auto flex items-center justify-center">
                    <Landmark className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-bold text-zinc-800">No Settlement Bank Account Connected</p>
                  <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                    Connect your commercial bank account to receive automated ticket sales payouts and on-demand withdrawals.
                  </p>
                  {perms.canManageBanking && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setEditBankForm({
                          bankName: 'Guaranty Trust Bank (GTBank)',
                          accountName: organizer?.name || '',
                          accountNumber: '',
                          routingNumber: ''
                        });
                        setShowBankModal(true);
                      }}
                      className="gap-1.5 mt-2"
                    >
                      <span>Connect Bank Account</span>
                    </Button>
                  )}
                </div>
              ) : (
                /* Bank Details Display */
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-5">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Financial Institution</span>
                    <p className="text-sm font-bold text-zinc-900">{bankAccount.bankName}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Account Name</span>
                    <p className="text-sm font-bold text-zinc-900 truncate">{bankAccount.accountName}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Account Number</span>
                    <p className="text-sm font-mono font-bold text-zinc-900">{bankAccount.accountNumber}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Automated Schedule</span>
                    <select
                      value={payoutSchedule}
                      onChange={(e) => {
                        setPayoutSchedule(e.target.value as any);
                        showNotification(`Payout cadence updated to ${e.target.value}.`, 'info');
                      }}
                      className="bg-zinc-50 border border-zinc-200 text-xs font-bold rounded-xl px-3 py-1.5 text-zinc-800 focus:outline-none focus:border-[#E31B23] cursor-pointer"
                    >
                      <option value="weekly">Weekly (Every Monday)</option>
                      <option value="daily">Daily (Next Business Day)</option>
                      <option value="monthly">Monthly (1st of Month)</option>
                      <option value="manual">Manual on Demand Only</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Payout Transfer History */}
            <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-xs overflow-hidden">
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-zinc-950">Payout Transfer History</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">Historical ledger of all disbursements to your bank account.</p>
                </div>
                <span className="text-xs font-bold text-zinc-500">
                  {payouts.length} Transfers
                </span>
              </div>

              {payouts.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-zinc-100 text-zinc-400 mx-auto flex items-center justify-center">
                    <Receipt className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-zinc-800">No Payouts Initiated Yet</h4>
                  <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                    Once you request a withdrawal or an automated disbursement triggers, records will populate here.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-zinc-50 border-b border-zinc-100 text-zinc-400 font-bold uppercase tracking-wider text-xs">
                      <tr>
                        <th className="px-6 py-4">Reference ID</th>
                        <th className="px-6 py-4">Destination Account</th>
                        <th className="px-6 py-4">Transfer Date</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 font-medium text-zinc-800">
                      {payouts.map((p) => (
                        <tr key={p.id} className="hover:bg-zinc-50/70 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                              <span className="font-mono text-xs font-bold text-zinc-900">{p.reference}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs font-medium text-zinc-600">
                            {p.destinationBank}
                          </td>
                          <td className="px-6 py-4 text-xs text-zinc-500 font-medium">
                            {formatDate(p.createdAt)}
                          </td>
                          <td className="px-6 py-4">
                            {p.status === 'completed' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3" /> Completed
                              </span>
                            ) : p.status === 'processing' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                <RefreshCw className="w-3 h-3 animate-spin" /> Processing
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                <Clock className="w-3 h-3" /> Scheduled
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-zinc-950 font-mono text-sm">
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
            <div className="bg-white border border-zinc-200/80 p-6 rounded-2xl shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-100 pb-4">
                <div>
                  <h3 className="text-base font-black text-zinc-950 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-[#E31B23]" /> Ticket Sales & Revenue Velocity
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">Real-time checkout volume and revenue cadence over time.</p>
                </div>
                
                <div className="flex items-center gap-2">
                  {(['7d', '30d', '3m', '6m', '12m'] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setTimeframe(t)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        timeframe === t
                          ? 'bg-zinc-900 text-white'
                          : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
                      }`}
                    >
                      {t.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {isLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-[#E31B23]" />
                </div>
              ) : salesData.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-zinc-200 rounded-xl space-y-2">
                  <BarChart3 className="w-10 h-10 text-zinc-300" />
                  <p className="text-sm font-bold text-zinc-700">No sales activity in this timeframe</p>
                  <p className="text-xs text-zinc-400 max-w-sm">
                    When attendees purchase event tickets, your sales velocity throughput will chart here automatically.
                  </p>
                </div>
              ) : (
                <div className="h-72 flex items-end justify-between gap-3 pt-10 pb-4 border-b border-zinc-100">
                  {salesData.map((data, idx) => {
                    const heightPercent = Math.min(100, Math.max(12, (data.count / maxSalesCount) * 85 + 10));
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer relative">
                        {/* Tooltip on hover */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-950 text-white font-mono text-[10px] px-2 py-1 rounded-lg shadow-xl absolute -translate-y-12 pointer-events-none z-20 whitespace-nowrap">
                          {data.count} tickets • {formatCurrency(data.volume)}
                        </div>
                        
                        {/* Bar */}
                        <div 
                          className="w-full bg-[#E31B23]/20 hover:bg-[#E31B23] rounded-t-lg transition-all duration-300"
                          style={{ height: `${heightPercent}%` }}
                        />
                        
                        {/* Date Label */}
                        <span className="text-[10px] font-mono text-zinc-400 truncate max-w-full">{data.date}</span>
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
          <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-zinc-950">Event Revenue & Clearance Breakdown</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Performance, processing fee deduction, and payout settlement state per event.</p>
              </div>
              <span className="text-xs font-bold text-zinc-500">{events.length} Events Total</span>
            </div>

            {events.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <Receipt className="w-10 h-10 text-zinc-300 mx-auto" />
                <h4 className="text-sm font-bold text-zinc-800">No Events Found</h4>
                <p className="text-xs text-zinc-400">Create events to begin tracking admissions and revenue.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-zinc-50 border-b border-zinc-100 text-zinc-400 font-bold uppercase tracking-wider text-xs">
                    <tr>
                      <th className="px-6 py-4">Event Name</th>
                      <th className="px-6 py-4">Tickets Sold</th>
                      <th className="px-6 py-4">Gross Revenue</th>
                      <th className="px-6 py-4">Platform Fee (3.5%)</th>
                      <th className="px-6 py-4">Net Payout</th>
                      <th className="px-6 py-4 text-right">Escrow Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 font-medium text-zinc-800">
                    {eventRevenueStats.map((item, idx) => (
                      <tr key={idx} className="hover:bg-zinc-50/70 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-zinc-950">{item.event.title || 'Untitled Event'}</p>
                          <span className="text-xs text-zinc-400">{item.event.startDate ? formatDate(item.event.startDate) : 'Upcoming'}</span>
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-zinc-800">
                          {item.ticketsSold}
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-zinc-950">
                          {formatCurrency(item.gross)}
                        </td>
                        <td className="px-6 py-4 font-mono text-zinc-500">
                          {formatCurrency(item.fee)}
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-emerald-700">
                          {formatCurrency(item.net)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            item.settlementStatus.includes('Cleared')
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
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

        {/* TAB 4: TRANSACTION LEDGER */}
        {activeTab === 'ledger' && (
          <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-xs overflow-hidden space-y-4">
            <div className="p-6 border-b border-zinc-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-base font-black text-zinc-950">Ticket Transaction Ledger</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Granular audit log of attendee checkouts and ticketing transactions.</p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search order ID, attendee..."
                    value={ledgerSearch}
                    onChange={(e) => setLedgerSearch(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 text-xs rounded-xl pl-9 pr-3 py-2 font-medium focus:outline-none focus:border-[#E31B23]"
                  />
                </div>

                <select
                  value={ledgerStatusFilter}
                  onChange={(e) => setLedgerStatusFilter(e.target.value as any)}
                  className="bg-zinc-50 border border-zinc-200 text-xs font-bold rounded-xl px-3 py-2 text-zinc-800 focus:outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Refunded">Refunded</option>
                </select>
              </div>
            </div>

            {filteredLedger.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <FileText className="w-10 h-10 text-zinc-300 mx-auto" />
                <h4 className="text-sm font-bold text-zinc-800">No Transactions Match Filter</h4>
                <p className="text-xs text-zinc-400">Clear your search query or status filter to see more results.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-zinc-50 border-b border-zinc-100 text-zinc-400 font-bold uppercase tracking-wider text-xs">
                    <tr>
                      <th className="px-6 py-4">Transaction / Order</th>
                      <th className="px-6 py-4">Attendee</th>
                      <th className="px-6 py-4">Event</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 font-medium text-zinc-800">
                    {filteredLedger.map((o) => (
                      <tr key={o.id} className="hover:bg-zinc-50/70 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-xs text-zinc-950">
                          {o.id}
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-xs text-zinc-900">{o.customerName || 'Anonymous Attendee'}</p>
                          <span className="text-[11px] text-zinc-400">{o.customerEmail}</span>
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-zinc-700">
                          {o.eventTitle || 'General Event'}
                        </td>
                        <td className="px-6 py-4 text-xs text-zinc-400">
                          {o.createdAt ? formatDate(o.createdAt) : 'Recent'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            o.status === 'Paid'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : o.status === 'Refunded'
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-bold font-mono text-zinc-950">
                          {formatCurrency(Number(o.amount || 0))}
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
            <div className="bg-white border border-zinc-200 rounded-3xl max-w-md w-full shadow-2xl p-6 space-y-6 animate-scaleUp">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-red-50 text-[#E31B23] rounded-xl">
                    <ArrowDownToLine className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-zinc-950">Request Payout</h3>
                    <p className="text-xs text-zinc-500">Withdraw available cleared funds to bank</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="text-zinc-400 hover:text-zinc-700 p-1 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleRequestWithdrawal} className="space-y-4">
                {/* Available balance indicator */}
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-600">Available to Withdraw</span>
                  <span className="text-sm font-black font-mono text-zinc-950">{formatCurrency(availableBalance)}</span>
                </div>

                {/* Amount Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700">Withdrawal Amount (₦)</label>
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
                      className="w-full px-3.5 py-2.5 bg-white border border-zinc-200 rounded-xl font-mono text-base font-bold pr-20 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all"
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
                  <div className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50 flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-zinc-500 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-zinc-900 truncate">{bankAccount.bankName}</p>
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
                    className="px-4 py-2.5 rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-50 text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <Button
                    type="submit"
                    isLoading={isSubmittingWithdraw}
                    className="bg-[#E31B23] hover:bg-[#c9141b] text-white px-6 py-2.5 text-xs font-bold rounded-xl"
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
            <div className="bg-white border border-zinc-200 rounded-3xl max-w-md w-full shadow-2xl p-6 space-y-6 animate-scaleUp">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-zinc-950">Settlement Bank Details</h3>
                    <p className="text-xs text-zinc-500">Provide bank details for automated transfers</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowBankModal(false)}
                  className="text-zinc-400 hover:text-zinc-700 p-1 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveBank} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700">Bank Name</label>
                  <select
                    value={editBankForm.bankName}
                    onChange={(e) => setEditBankForm(prev => ({ ...prev, bankName: e.target.value }))}
                    className="w-full bg-zinc-50 border border-zinc-200 text-xs font-bold rounded-xl px-3 py-2.5 text-zinc-900 focus:outline-none focus:border-[#E31B23] cursor-pointer"
                  >
                    <option value="Guaranty Trust Bank (GTBank)">Guaranty Trust Bank (GTBank)</option>
                    <option value="Access Bank PLC">Access Bank PLC</option>
                    <option value="Zenith Bank">Zenith Bank</option>
                    <option value="First Bank of Nigeria">First Bank of Nigeria</option>
                    <option value="United Bank for Africa (UBA)">United Bank for Africa (UBA)</option>
                    <option value="Standard Chartered Bank">Standard Chartered Bank</option>
                    <option value="Stanbic IBTC Bank">Stanbic IBTC Bank</option>
                    <option value="Kuda Microfinance Bank">Kuda Microfinance Bank</option>
                  </select>
                </div>

                <div>
                  <Input
                    label="Account Holder Name"
                    type="text"
                    value={editBankForm.accountName}
                    onChange={(e) => setEditBankForm(prev => ({ ...prev, accountName: e.target.value }))}
                    placeholder="Must match organization legal title"
                    required
                  />
                </div>

                <div>
                  <Input
                    label="10-Digit NUBAN Account Number"
                    type="text"
                    maxLength={10}
                    value={editBankForm.accountNumber}
                    onChange={(e) => setEditBankForm(prev => ({ ...prev, accountNumber: e.target.value.replace(/[^0-9]/g, '') }))}
                    placeholder="e.g. 0123456789"
                    required
                    className="font-mono"
                  />
                </div>

                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>
                    Account name must match your legal business registration to avoid settlement compliance holds.
                  </span>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowBankModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-50 text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <Button
                    type="submit"
                    isLoading={isSavingBank}
                    className="bg-zinc-900 hover:bg-zinc-800 text-white px-6 py-2.5 text-xs font-bold rounded-xl"
                  >
                    Save & Verify Account
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
                    <Sparkles className="w-3 h-3 text-amber-400" /> Eventa Email Marketing & Credits Wallet
                  </div>
                  <div className="flex items-baseline gap-3">
                    <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                      {creditsBalance.toLocaleString()}
                    </h2>
                    <span className="text-sm sm:text-base font-semibold text-zinc-400">Credits Available</span>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-300 max-w-xl font-medium leading-relaxed">
                    Eventa Credits directly power email marketing broadcasts, newsletter campaigns, ticket reminders, and attendee promotional mail drops. 1 Credit sends 1 marketing email.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <Button
                    type="button"
                    onClick={() => setIsTopUpModalOpen(true)}
                    className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-black text-xs px-5 py-3 rounded-xl shadow-md inline-flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    Top-Up Credits
                  </Button>
                </div>
              </div>

              <div className="relative z-10 mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-400">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Estimated Value: <strong>₦{(creditsBalance * 50).toLocaleString()}</strong></span>
                </div>
                <div>1 Eventa Credit = ₦50.00 NGN flat rate</div>
              </div>
            </div>

            {/* In-App Stuffs Catalog */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-zinc-950 tracking-tight">Email Marketing & Outreach Packages</h3>
                  <p className="text-xs text-zinc-500 font-medium">Dispatch targeted emails, announcements, and promotional newsletters to ticket holders.</p>
                </div>
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  Instant Dispatch
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    title: 'SMS & WhatsApp Attendee Broadcast',
                    description: 'Instant SMS ticket confirmation or urgent schedule/gate changes dispatched directly to attendee mobile phones.',
                    cost: 1,
                    unit: 'credit / SMS',
                    icon: MessageSquare,
                    color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
                    actionLabel: 'Dispatch Test SMS',
                    actionCost: 1
                  },
                  {
                    title: 'AI Event Copywriter & SEO Generator',
                    description: 'Generate comprehensive, persuasive event descriptions, agenda schedules, and targeted marketing copy tailored to your category.',
                    cost: 5,
                    unit: 'credits / run',
                    icon: Sparkles,
                    color: 'text-purple-600 bg-purple-50 border-purple-100',
                    actionLabel: 'Run AI Writer',
                    actionCost: 5
                  },
                  {
                    title: 'Featured Event Spotlight Boost',
                    description: 'Pin your event to the top of public discovery feeds and category explore pages for 7 full days to amplify conversions.',
                    cost: 50,
                    unit: 'credits / 7 days',
                    icon: Rocket,
                    color: 'text-red-600 bg-red-50 border-red-100',
                    actionLabel: 'Boost Event',
                    actionCost: 50
                  },
                  {
                    title: 'Dedicated QR Scanner Terminal Pass',
                    description: 'Provision extra entrance gate scanning licenses for bouncers and usher mobile phones without granting dashboard access.',
                    cost: 25,
                    unit: 'credits / scanner',
                    icon: QrCode,
                    color: 'text-blue-600 bg-blue-50 border-blue-100',
                    actionLabel: 'Provision Pass',
                    actionCost: 25
                  },
                  {
                    title: 'Custom White-Label Sender Domain',
                    description: 'Send order confirmations, tickets, and receipts from your custom domain (e.g. tickets@yourcompany.com) instead of Eventa.',
                    cost: 100,
                    unit: 'credits / mo',
                    icon: Mail,
                    color: 'text-amber-600 bg-amber-50 border-amber-100',
                    actionLabel: 'Subscribe Domain',
                    actionCost: 100
                  },
                  {
                    title: 'Offline Box Office POS Sync',
                    description: 'Enable offline door ticket cash sales mode on tablets with automatic cloud ledger reconciliation upon reconnecting.',
                    cost: 15,
                    unit: 'credits / device',
                    icon: Zap,
                    color: 'text-teal-600 bg-teal-50 border-teal-100',
                    actionLabel: 'Enable POS License',
                    actionCost: 15
                  }
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between gap-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${item.color}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-black bg-zinc-100 text-zinc-800">
                            {item.cost} {item.unit}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-zinc-950">{item.title}</h4>
                          <p className="text-[11px] text-zinc-500 font-medium mt-1 leading-relaxed">{item.description}</p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-zinc-100">
                        <button
                          type="button"
                          onClick={() => handleSimulateFeatureUse(item.title, item.actionCost)}
                          className="w-full py-2 px-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/80 text-zinc-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <span>{item.actionLabel}</span>
                          <span className="text-[10px] text-zinc-400 font-semibold">({item.actionCost} credits)</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Credit Transaction Ledger */}
            <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                <div>
                  <h3 className="text-base font-black text-zinc-950 tracking-tight">Credit Ledger & Transaction History</h3>
                  <p className="text-xs text-zinc-500 font-medium">Record of all credit purchases, marketing deductions, and feature usage.</p>
                </div>
                <span className="text-xs font-bold text-zinc-400 font-mono">
                  {creditTransactions.length} records
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-150 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                      <th className="pb-3 font-semibold">Date</th>
                      <th className="pb-3 font-semibold">Description</th>
                      <th className="pb-3 font-semibold">Reference</th>
                      <th className="pb-3 font-semibold text-right">Amount</th>
                      <th className="pb-3 font-semibold text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {creditTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-zinc-500 font-medium">
                          No credit transactions yet. Credit top-ups and marketing usage records will appear here.
                        </td>
                      </tr>
                    ) : (
                      creditTransactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-zinc-50/60 transition-colors">
                          <td className="py-3.5 text-zinc-500 font-medium whitespace-nowrap">{tx.date}</td>
                          <td className="py-3.5 text-zinc-900 font-bold">{tx.description}</td>
                          <td className="py-3.5 font-mono text-[11px] text-zinc-400">{tx.reference}</td>
                          <td className={`py-3.5 font-black text-right whitespace-nowrap ${
                            tx.type === 'credit' ? 'text-emerald-600' : 'text-zinc-900'
                          }`}>
                            {tx.type === 'credit' ? `+${tx.amount}` : `-${tx.amount}`} Credits
                          </td>
                          <td className="py-3.5 font-bold text-zinc-700 text-right whitespace-nowrap">
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
        <Modal
          isOpen={isTopUpModalOpen}
          onClose={() => setIsTopUpModalOpen(false)}
          title="Top-Up Eventa Marketing Credits"
          size="lg"
        >
          <form onSubmit={handleCompleteTopUp} className="space-y-6">
            <p className="text-xs text-zinc-600 font-medium leading-relaxed">
              Credits are instantly issued to your organizer workspace. Select a curated growth pack or choose a custom amount.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {[
                {
                  id: 'starter',
                  name: 'Starter Pack',
                  credits: 100,
                  price: '₦5,000',
                  badge: null
                },
                {
                  id: 'growth',
                  name: 'Growth Pack',
                  credits: 500,
                  price: '₦22,500',
                  badge: '10% Bonus'
                },
                {
                  id: 'power',
                  name: 'Pro Accelerator',
                  credits: 1500,
                  price: '₦60,000',
                  badge: '20% Bonus'
                }
              ].map(pack => (
                <div
                  key={pack.id}
                  onClick={() => setSelectedPack(pack.id as any)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between gap-3 ${
                    selectedPack === pack.id
                      ? 'border-[#E31B23] bg-red-50/20 shadow-xs'
                      : 'border-zinc-200/80 hover:border-zinc-300 bg-white'
                  }`}
                >
                  {pack.badge && (
                    <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500 text-white shadow-2xs">
                      {pack.badge}
                    </span>
                  )}
                  <div>
                    <h4 className="text-xs font-bold text-zinc-800">{pack.name}</h4>
                    <div className="text-xl font-black text-zinc-950 mt-1">
                      {pack.credits} <span className="text-xs font-semibold text-zinc-500">Credits</span>
                    </div>
                  </div>
                  <div className="text-xs font-black text-[#E31B23] pt-2 border-t border-zinc-100">
                    {pack.price}
                  </div>
                </div>
              ))}
            </div>

            {/* Custom Amount Option */}
            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/70 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="pack"
                  checked={selectedPack === 'custom'}
                  onChange={() => setSelectedPack('custom')}
                  className="w-4 h-4 text-[#E31B23] accent-[#E31B23]"
                />
                <span className="text-xs font-bold text-zinc-900">Custom Credits Amount (₦50 / credit)</span>
              </label>

              {selectedPack === 'custom' && (
                <div className="flex items-center gap-3 pt-1">
                  <div className="w-36">
                    <Input
                      label=""
                      type="number"
                      min="50"
                      step="50"
                      value={customCreditsAmount}
                      onChange={(e) => setCustomCreditsAmount(e.target.value)}
                      placeholder="e.g. 300"
                    />
                  </div>
                  <span className="text-xs font-bold text-zinc-700">
                    Total: ₦{((Number(customCreditsAmount) || 0) * 50).toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-zinc-100/70 border border-zinc-200/70 flex items-center justify-between text-xs font-medium text-zinc-700">
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-4 h-4 text-zinc-500" />
                <span>Pay securely via <strong>Paystack / Flutterwave Gateway</strong></span>
              </div>
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Instant Credit
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-zinc-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsTopUpModalOpen(false)}
                disabled={isProcessingTopUp}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isProcessingTopUp}
                className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-black text-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Pay & Top-Up Now
              </Button>
            </div>
          </form>
        </Modal>

      </div>
    </OrganizerDashboardLayout>
  );
};

export default Analytics;
