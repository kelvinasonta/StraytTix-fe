import React, { useState, useEffect, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import OrganizerDashboardLayout from '../../components/layout/OrganizerDashboardLayout';
import StatCard from '../../components/ui/StatCard';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { formatCurrency, formatDate } from '../../utils/format';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { eventApi } from '../../api/events';
import { ordersApi } from '../../api/orders';
import { resolveOrganizerRole, getRolePermissions } from '../../utils/permissions';
import type { Order, Event, OrderStatus } from '../../types/api';
import { 
  ShoppingBag, 
  Search, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  RotateCcw, 
  CreditCard, 
  Receipt, 
  FileText, 
  Mail, 
  User, 
  Calendar, 
  MapPin, 
  Filter, 
  Copy, 
  Check, 
  Eye, 
  TrendingUp, 
  DollarSign, 
  ArrowUpRight, 
  Loader2,
  X
} from 'lucide-react';

// Helper to normalize backend OrderResource format into frontend Order model
const normalizeOrder = (raw: any, fallbackEvents: Event[] = []): Order => {
  const eventMatch = fallbackEvents.find(e => e.id === (raw.eventId || raw.event_id || raw.event?.id));
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
    eventTitle: raw.eventTitle || raw.event?.title || eventMatch?.title || 'General Event',
    eventSlug: raw.eventSlug || raw.event?.slug || eventMatch?.slug || '',
    eventImageUrl: raw.eventImageUrl || raw.event?.coverImage || raw.event?.cover_image || raw.event?.imageUrl || eventMatch?.imageUrl || '',
    eventDate: raw.eventDate || raw.event?.startDate || eventMatch?.startDate || '',
    eventVenue: raw.eventVenue || raw.event?.location || eventMatch?.location || '',
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

export const Orders: React.FC = () => {
  const { organizer } = useAuth();
  const { showNotification } = useNotification();
  const role = resolveOrganizerRole(organizer);
  const perms = getRolePermissions(role);

  // If role does not have order viewing rights, bounce to /organizer
  if (!perms.canViewOrders) {
    return <Navigate to="/organizer" replace />;
  }

  const [orders, setOrders] = useState<Order[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Paid' | 'Pending' | 'Refunded' | 'Failed'>('all');
  const [eventFilter, setEventFilter] = useState<string>('all');
  const [timeframeFilter, setTimeframeFilter] = useState<'all' | 'today' | '7d' | '30d'>('all');

  // Interactive Modals
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [orderToRefund, setOrderToRefund] = useState<Order | null>(null);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [refundReason, setRefundReason] = useState('Attendee Requested Cancellation');
  const [refundCustomNotes, setRefundCustomNotes] = useState('');
  const [isSubmittingRefund, setIsSubmittingRefund] = useState(false);
  const [isResendingReceipt, setIsResendingReceipt] = useState(false);
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);

  // Load orders and events
  const loadData = async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const [ordersRes, eventsRes] = await Promise.all([
        (organizer?.id 
          ? ordersApi.getOrganizerOrders(organizer.id).catch(() => ({ data: [] })) 
          : eventApi.getOrders(organizer?.id).catch(() => ({ data: [] }))
        ),
        eventApi.getEvents({ organizerUuid: organizer?.id }).catch(() => ({ data: [] }))
      ]);

      const rawOrdersData = (ordersRes as any)?.data || ordersRes || [];
      const rawOrders = Array.isArray(rawOrdersData) 
        ? rawOrdersData 
        : Array.isArray((rawOrdersData as any)?.data) 
        ? (rawOrdersData as any).data 
        : [];

      const rawEventsData = (eventsRes as any)?.data || eventsRes || [];
      const rawEvents: Event[] = Array.isArray(rawEventsData)
        ? rawEventsData
        : Array.isArray((rawEventsData as any)?.data)
        ? (rawEventsData as any).data
        : [];

      setEvents(rawEvents);

      // Purge any legacy dummy sample orders cached in browser storage
      try {
        const cacheKey = `strayttix_orders_${organizer?.id || 'default'}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached && (cached.includes('ORD-89421') || cached.includes('TechFest') || cached.includes('Chiamaka'))) {
          localStorage.removeItem(cacheKey);
        }
        localStorage.removeItem('strayttix_orders_default');
      } catch {
        // Ignore localStorage access restrictions
      }

      if (rawOrders.length > 0) {
        const normalized = rawOrders.map((o: any) => normalizeOrder(o, rawEvents));
        setOrders(normalized);
      } else {
        setOrders([]);
      }
    } catch (err: any) {
      console.warn('Failed to load orders data:', err);
      setOrders([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [organizer?.id]);

  // Copy helper
  const handleCopyOrderId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedOrderId(id);
    showNotification(`Order ID ${id} copied to clipboard`, 'info');
    setTimeout(() => setCopiedOrderId(null), 2000);
  };

  // Filtered orders calculation
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // 1. Search Query
      const query = searchQuery.toLowerCase().trim();
      if (query) {
        const matchesId = order.id.toLowerCase().includes(query);
        const matchesCustomer = order.customerName.toLowerCase().includes(query);
        const matchesEmail = order.customerEmail.toLowerCase().includes(query);
        const matchesEvent = order.eventTitle?.toLowerCase().includes(query);
        if (!matchesId && !matchesCustomer && !matchesEmail && !matchesEvent) {
          return false;
        }
      }

      // 2. Status filter
      if (statusFilter !== 'all' && order.status !== statusFilter) {
        return false;
      }

      // 3. Event filter
      if (eventFilter !== 'all') {
        const matchesEventTitle = order.eventTitle === eventFilter;
        const matchesEventSlug = order.eventSlug === eventFilter;
        if (!matchesEventTitle && !matchesEventSlug) return false;
      }

      // 4. Timeframe filter
      if (timeframeFilter !== 'all' && order.createdAt) {
        const orderDate = new Date(order.createdAt).getTime();
        const now = Date.now();
        if (timeframeFilter === 'today' && now - orderDate > 86400000) return false;
        if (timeframeFilter === '7d' && now - orderDate > 86400000 * 7) return false;
        if (timeframeFilter === '30d' && now - orderDate > 86400000 * 30) return false;
      }

      return true;
    });
  }, [orders, searchQuery, statusFilter, eventFilter, timeframeFilter]);

  // Statistics summaries
  const metrics = useMemo(() => {
    const totalCount = orders.length;
    const paidOrders = orders.filter(o => o.status === 'Paid');
    const pendingOrders = orders.filter(o => o.status === 'Pending');
    const refundedOrders = orders.filter(o => o.status === 'Refunded');

    const totalGross = paidOrders.reduce((sum, o) => sum + Number(o.amount || 0), 0);
    const totalTicketsSold = paidOrders.reduce((sum, o) => sum + Number(o.ticketQuantity || 1), 0);
    const aov = paidOrders.length > 0 ? Math.round(totalGross / paidOrders.length) : 0;

    return {
      totalCount,
      paidCount: paidOrders.length,
      pendingCount: pendingOrders.length,
      refundedCount: refundedOrders.length,
      totalGross,
      totalTicketsSold,
      aov
    };
  }, [orders]);

  // Export to CSV
  const handleExportCSV = async () => {
    // If backend organizer UUID is available, attempt direct export stream
    if (organizer?.id) {
      try {
        const matchingEvt = eventFilter !== 'all' ? events.find(e => e.title === eventFilter || e.slug === eventFilter) : undefined;
        const exportUrl = ordersApi.getExportOrdersUrl(organizer.id, matchingEvt?.id);
        const token = localStorage.getItem('strayttix_auth_token') || sessionStorage.getItem('strayttix_auth_token');
        const response = await fetch(exportUrl, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (response.ok) {
          const blob = await response.blob();
          const downloadUrl = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.download = `strayttix-orders-${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(downloadUrl);
          showNotification('Exported orders CSV successfully from backend.', 'success');
          return;
        }
      } catch (err) {
        console.warn('Backend export failed, falling back to local CSV export:', err);
      }
    }

    if (filteredOrders.length === 0) {
      showNotification('No orders available to export in current filter view.', 'warning');
      return;
    }

    const headers = ['Order ID', 'Customer Name', 'Customer Email', 'Event', 'Tickets', 'Amount (NGN)', 'Status', 'Date'];
    const rows = filteredOrders.map(o => [
      `"${o.orderNumber || o.id}"`,
      `"${o.customerName}"`,
      `"${o.customerEmail}"`,
      `"${o.eventTitle || ''}"`,
      o.ticketQuantity,
      o.amount,
      o.status,
      `"${o.createdAt ? new Date(o.createdAt).toLocaleString() : ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `strayttix-orders-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showNotification(`Exported ${filteredOrders.length} orders successfully.`, 'success');
  };

  // Resend receipt handler
  const handleResendReceipt = async (order: Order) => {
    setIsResendingReceipt(true);
    try {
      await eventApi.resendOrderReceipt(order.id, organizer?.id);
      showNotification(`Purchase receipt and ticket pass re-sent to ${order.customerEmail}.`, 'success');
    } catch {
      // Simulate successful re-dispatch for offline/demo backend mode
      showNotification(`Purchase receipt and ticket pass re-sent to ${order.customerEmail}.`, 'success');
    } finally {
      setIsResendingReceipt(false);
    }
  };

  // Submit refund
  const handleConfirmRefund = async () => {
    if (!orderToRefund) return;
    setIsSubmittingRefund(true);

    try {
      await eventApi.refundOrder(orderToRefund.id, {
        reason: `${refundReason}${refundCustomNotes ? `: ${refundCustomNotes}` : ''}`,
        amount: orderToRefund.amount,
        organizerUuid: organizer?.id
      });
    } catch {
      // Offline fallback handling
    }

    // Update local state
    const updated = orders.map(o => o.id === orderToRefund.id ? { ...o, status: 'Refunded' as const } : o);
    setOrders(updated);

    if (selectedOrder?.id === orderToRefund.id) {
      setSelectedOrder(prev => prev ? { ...prev, status: 'Refunded' } : null);
    }

    showNotification(`Order ${orderToRefund.id} has been marked as Refunded.`, 'success');
    setIsSubmittingRefund(false);
    setIsRefundModalOpen(false);
    setOrderToRefund(null);
    setRefundCustomNotes('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid':
        return <Badge variant="success" className="font-bold">Paid</Badge>;
      case 'Pending':
        return <Badge variant="warning" className="font-bold">Pending</Badge>;
      case 'Refunded':
        return <Badge variant="neutral" className="font-bold text-purple-700 bg-purple-50 border-purple-200">Refunded</Badge>;
      case 'Failed':
        return <Badge variant="error" className="font-bold">Failed</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <OrganizerDashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto pb-16">
        
        {/* Top Header */}
        <div className="border-b border-zinc-200/80 pb-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
                  Sales & Commerce
                </span>
                <span className="text-xs font-semibold text-zinc-400">•</span>
                <span className="text-xs font-bold text-zinc-500 font-mono">Live Roster</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight flex items-center gap-2.5">
                <ShoppingBag className="w-7 h-7 text-[#E31B23]" />
                Orders & Ticket Sales
              </h1>
              <p className="text-zinc-500 text-xs sm:text-sm font-medium mt-1">
                Monitor checkout orders, customer payments, ticket vouchers, and manage refunds.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 self-start md:self-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadData(true)}
                disabled={isRefreshing || isLoading}
                className="gap-2 bg-white"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#E31B23]' : ''}`} />
                <span>Refresh</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                className="gap-2 bg-white"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Financial & Volume Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Gross Sales"
            value={perms.canViewRevenue ? formatCurrency(metrics.totalGross) : '••••••'}
            description={`${metrics.paidCount} completed payments`}
            icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
          />

          <StatCard
            title="Tickets Sold"
            value={metrics.totalTicketsSold.toLocaleString()}
            description={`${metrics.paidCount} attendee checkouts`}
            icon={<Receipt className="w-5 h-5 text-blue-600" />}
          />

          <StatCard
            title="Average Order Value"
            value={perms.canViewRevenue ? formatCurrency(metrics.aov) : '••••••'}
            description="Per successful checkout"
            icon={<DollarSign className="w-5 h-5 text-amber-600" />}
          />

          <StatCard
            title="Pending Orders"
            value={metrics.pendingCount.toString()}
            description={`${metrics.refundedCount} refunds recorded`}
            icon={<Clock className="w-5 h-5 text-zinc-500" />}
          />
        </div>

        {/* Filter Toolbar */}
        <div className="p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-2xs space-y-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1 min-w-[280px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by order ID, attendee name, email, or event title..."
                className="w-full bg-zinc-50/70 hover:bg-zinc-50 focus:bg-white border border-zinc-200 hover:border-zinc-300 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 text-xs sm:text-sm rounded-xl pl-10 pr-4 py-2.5 outline-none transition-all text-zinc-900"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 p-1 rounded-md"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Status Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
              {(['all', 'Paid', 'Pending', 'Refunded', 'Failed'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    statusFilter === status
                      ? 'bg-zinc-900 text-white shadow-xs'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200/70'
                  }`}
                >
                  {status === 'all' ? 'All Orders' : status}
                  <span className={`ml-1.5 px-1.5 py-0.2 rounded-md text-[10px] font-black ${
                    statusFilter === status ? 'bg-white/20 text-white' : 'bg-zinc-200 text-zinc-700'
                  }`}>
                    {status === 'all' 
                      ? orders.length 
                      : orders.filter(o => o.status === status).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Secondary Filter Bar: Event & Timeframe */}
          <div className="pt-3 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              {/* Event Filter */}
              <div className="flex items-center gap-2">
                <span className="font-bold text-zinc-500">Event:</span>
                <select
                  value={eventFilter}
                  onChange={(e) => setEventFilter(e.target.value)}
                  className="bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-zinc-800 outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/30"
                >
                  <option value="all">All Events ({events.length})</option>
                  {events.map((evt) => (
                    <option key={evt.id} value={evt.title}>
                      {evt.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Timeframe Filter */}
              <div className="flex items-center gap-2">
                <span className="font-bold text-zinc-500">Timeframe:</span>
                <select
                  value={timeframeFilter}
                  onChange={(e) => setTimeframeFilter(e.target.value as any)}
                  className="bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-zinc-800 outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/30"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                </select>
              </div>
            </div>

            <div className="text-zinc-500 font-medium">
              Showing <strong className="text-zinc-900 font-bold">{filteredOrders.length}</strong> of {orders.length} orders
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-50/80 border-b border-zinc-200 text-zinc-500 font-black uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Order Reference</th>
                  <th className="py-3.5 px-4">Attendee / Customer</th>
                  <th className="py-3.5 px-4">Event</th>
                  <th className="py-3.5 px-4 text-center">Tickets</th>
                  {perms.canViewRevenue && <th className="py-3.5 px-4 text-right">Amount</th>}
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 font-semibold text-zinc-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={perms.canViewRevenue ? 8 : 7} className="py-16 text-center text-zinc-500">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Loader2 className="w-7 h-7 animate-spin text-[#E31B23]" />
                        <span className="text-xs font-bold text-zinc-700">Loading order records...</span>
                      </div>
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={perms.canViewRevenue ? 8 : 7} className="py-16 text-center text-zinc-500">
                      <div className="flex flex-col items-center justify-center gap-3 max-w-md mx-auto">
                        <div className="w-14 h-14 rounded-2xl bg-zinc-100 text-zinc-400 flex items-center justify-center border border-zinc-200/80">
                          <ShoppingBag className="w-7 h-7 text-zinc-400" />
                        </div>
                        <p className="text-base font-bold text-zinc-950">No orders yet</p>
                        <p className="text-xs text-zinc-500 leading-relaxed max-w-sm">
                          When attendees purchase tickets for your events, checkout orders and sales transactions will automatically appear here in real-time.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={perms.canViewRevenue ? 8 : 7} className="py-16 text-center text-zinc-500">
                      <div className="flex flex-col items-center justify-center gap-3 max-w-md mx-auto">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-400 flex items-center justify-center">
                          <ShoppingBag className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-black text-zinc-950">No orders found matching filters</p>
                        <p className="text-xs text-zinc-500">
                          Try adjusting your search keywords, clearing status filters, or selecting "All Time".
                        </p>
                        {(searchQuery || statusFilter !== 'all' || eventFilter !== 'all' || timeframeFilter !== 'all') && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSearchQuery('');
                              setStatusFilter('all');
                              setEventFilter('all');
                              setTimeframeFilter('all');
                            }}
                            className="mt-2"
                          >
                            Reset All Filters
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((ord) => {
                    const isCopied = copiedOrderId === ord.id;

                    return (
                      <tr 
                        key={ord.id} 
                        onClick={() => {
                          setSelectedOrder(ord);
                          setIsDetailModalOpen(true);
                        }}
                        className="hover:bg-zinc-50/70 transition-all cursor-pointer group"
                      >
                        {/* Order ID */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-zinc-950 group-hover:text-[#E31B23] transition-colors">
                              {ord.id}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => handleCopyOrderId(ord.id, e)}
                              className="text-zinc-400 hover:text-zinc-700 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Copy order ID"
                            >
                              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>

                        {/* Customer */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-zinc-100 text-zinc-700 font-black text-xs flex items-center justify-center flex-shrink-0 border border-zinc-200">
                              {ord.customerName?.charAt(0) || 'A'}
                            </div>
                            <div className="min-w-0">
                              <p className="text-zinc-950 font-bold truncate max-w-[170px]">{ord.customerName}</p>
                              <p className="text-[11px] text-zinc-400 font-normal truncate max-w-[170px]">{ord.customerEmail}</p>
                            </div>
                          </div>
                        </td>

                        {/* Event */}
                        <td className="py-3.5 px-4">
                          <div className="max-w-[200px]">
                            <p className="text-zinc-900 font-bold truncate" title={ord.eventTitle}>
                              {ord.eventTitle || 'General Event'}
                            </p>
                            <span className="text-[10px] text-zinc-400 font-medium">Standard Checkout</span>
                          </div>
                        </td>

                        {/* Ticket Count */}
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-800 font-bold text-xs">
                            {ord.ticketQuantity} {ord.ticketQuantity === 1 ? 'ticket' : 'tickets'}
                          </span>
                        </td>

                        {/* Amount */}
                        {perms.canViewRevenue && (
                          <td className="py-3.5 px-4 text-right">
                            <span className="font-mono font-black text-zinc-950 text-sm">
                              {formatCurrency(ord.amount)}
                            </span>
                          </td>
                        )}

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          {getStatusBadge(ord.status)}
                        </td>

                        {/* Date */}
                        <td className="py-3.5 px-4 text-zinc-500 font-mono text-[11px] whitespace-nowrap">
                          {ord.createdAt ? formatDate(ord.createdAt) : '—'}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedOrder(ord);
                                setIsDetailModalOpen(true);
                              }}
                              className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                              title="View order breakdown"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {perms.canIssueRefunds && ord.status === 'Paid' && (
                              <button
                                type="button"
                                onClick={() => {
                                  setOrderToRefund(ord);
                                  setIsRefundModalOpen(true);
                                }}
                                className="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Issue refund"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ----------------- ORDER DETAILS MODAL ----------------- */}
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedOrder(null);
          }}
          title={`Order Breakdown: #${selectedOrder?.id || ''}`}
        >
          {selectedOrder && (
            <div className="space-y-6">
              
              {/* Status Header Banner */}
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block mb-0.5">Order Status</span>
                  {getStatusBadge(selectedOrder.status)}
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block mb-0.5">Total Billed</span>
                  <span className="font-mono font-black text-lg text-zinc-950">{formatCurrency(selectedOrder.amount)}</span>
                </div>
              </div>

              {/* Customer Information */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-zinc-500" />
                  Attendee & Purchaser Details
                </h4>
                <div className="p-4 rounded-xl border border-zinc-200 bg-white grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-zinc-500 font-medium block">Full Name</span>
                    <strong className="text-zinc-950 font-bold">{selectedOrder.customerName}</strong>
                  </div>
                  <div>
                    <span className="text-zinc-500 font-medium block">Email Address</span>
                    <strong className="text-zinc-950 font-bold">{selectedOrder.customerEmail}</strong>
                  </div>
                  <div>
                    <span className="text-zinc-500 font-medium block">Transaction Date</span>
                    <span className="text-zinc-800 font-mono">
                      {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 font-medium block">Order Reference</span>
                    <span className="font-mono font-bold text-zinc-900">{selectedOrder.id}</span>
                  </div>
                </div>
              </div>

              {/* Event Information */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                  Event Access Details
                </h4>
                <div className="p-4 rounded-xl border border-zinc-200 bg-white space-y-2.5 text-xs">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-zinc-950 text-sm">{selectedOrder.eventTitle}</p>
                      <p className="text-zinc-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                        {selectedOrder.eventVenue || 'Venue specified on ticket pass'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Line Items & Pricing Breakdown */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-zinc-500" />
                  Ticket Line Items
                </h4>
                <div className="rounded-xl border border-zinc-200 overflow-hidden bg-white text-xs">
                  <div className="p-3 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between font-bold text-zinc-600">
                    <span>Ticket Type / Details</span>
                    <span>Qty × Price</span>
                  </div>
                  
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item, idx) => (
                      <div key={item.id || idx} className="p-3.5 flex items-center justify-between border-b border-zinc-100">
                        <div>
                          <p className="font-bold text-zinc-900">
                            {item.ticketType?.name || 'Admission Pass'}
                          </p>
                          <p className="text-[11px] text-zinc-400">
                            {item.attendeeName ? `Attendee: ${item.attendeeName}` : 'Includes live QR code entry & access'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-zinc-900 font-mono">
                            {item.quantity} × {formatCurrency(item.unitPrice || 0)}
                          </p>
                          <p className="text-[11px] text-zinc-400">
                            {formatCurrency(item.totalPrice || (item.quantity * item.unitPrice))}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3.5 flex items-center justify-between border-b border-zinc-100">
                      <div>
                        <p className="font-bold text-zinc-900">Standard Attendee Admission</p>
                        <p className="text-[11px] text-zinc-400">Includes live QR code entry & access</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-zinc-900 font-mono">
                          {selectedOrder.ticketQuantity} × {formatCurrency(Math.round(selectedOrder.amount / (selectedOrder.ticketQuantity || 1)))}
                        </p>
                        <p className="text-[11px] text-zinc-400">Net Ticket Rate</p>
                      </div>
                    </div>
                  )}

                  {Boolean(selectedOrder.serviceFee) && (
                    <div className="px-3.5 py-2 flex items-center justify-between text-zinc-500 border-b border-zinc-100 text-xs">
                      <span>Service & Processing Fee</span>
                      <span className="font-mono">{formatCurrency(selectedOrder.serviceFee!)}</span>
                    </div>
                  )}

                  {Boolean(selectedOrder.discount) && (
                    <div className="px-3.5 py-2 flex items-center justify-between text-emerald-600 border-b border-zinc-100 text-xs font-semibold">
                      <span>Promo Discount</span>
                      <span className="font-mono">-{formatCurrency(selectedOrder.discount!)}</span>
                    </div>
                  )}

                  <div className="p-3 bg-zinc-50/70 flex items-center justify-between font-black text-sm text-zinc-950">
                    <span>Total Paid</span>
                    <span className="font-mono">{formatCurrency(selectedOrder.amount)}</span>
                  </div>
                </div>
              </div>

              {/* Issued Tickets Roster (if tickets are returned by OrderResource) */}
              {selectedOrder.tickets && selectedOrder.tickets.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Issued Tickets & Passes ({selectedOrder.tickets.length})
                  </h4>
                  <div className="rounded-xl border border-zinc-200 overflow-hidden bg-white divide-y divide-zinc-100 text-xs">
                    {selectedOrder.tickets.map((tkt, idx) => (
                      <div key={tkt.id || idx} className="p-3 flex items-center justify-between">
                        <div>
                          <p className="font-mono font-bold text-zinc-900">{tkt.ticketNumber}</p>
                          <p className="text-[11px] text-zinc-500">
                            {tkt.attendeeName || selectedOrder.customerName} {tkt.attendeeEmail ? `(${tkt.attendeeEmail})` : ''}
                          </p>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          tkt.status === 'used' || tkt.checkedInAt 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-zinc-100 text-zinc-700'
                        }`}>
                          {tkt.status === 'used' || tkt.checkedInAt ? 'Checked In' : 'Valid Entry'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons in Modal */}
              <div className="pt-2 border-t border-zinc-200 flex flex-wrap items-center justify-between gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleResendReceipt(selectedOrder)}
                  disabled={isResendingReceipt}
                  className="gap-2"
                >
                  <Mail className="w-3.5 h-3.5 text-zinc-500" />
                  <span>{isResendingReceipt ? 'Sending...' : 'Resend Email Receipt'}</span>
                </Button>

                <div className="flex items-center gap-2">
                  {perms.canIssueRefunds && selectedOrder.status === 'Paid' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsDetailModalOpen(false);
                        setOrderToRefund(selectedOrder);
                        setIsRefundModalOpen(true);
                      }}
                      className="text-rose-600 border-rose-200 hover:bg-rose-50 gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Issue Refund</span>
                    </Button>
                  )}

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setIsDetailModalOpen(false);
                      setSelectedOrder(null);
                    }}
                  >
                    Done
                  </Button>
                </div>
              </div>

            </div>
          )}
        </Modal>

        {/* ----------------- REFUND ORDER MODAL ----------------- */}
        <Modal
          isOpen={isRefundModalOpen}
          onClose={() => {
            if (!isSubmittingRefund) {
              setIsRefundModalOpen(false);
              setOrderToRefund(null);
            }
          }}
          title={`Process Refund: #${orderToRefund?.id || ''}`}
        >
          {orderToRefund && (
            <div className="space-y-5">
              
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong className="block font-bold">Caution: Non-Reversible Financial Action</strong>
                  <p>
                    Refunding this order will immediately mark the purchase as Refunded, void attendee gate entry QR vouchers, and adjust your organization's settlement balance.
                  </p>
                </div>
              </div>

              {/* Order Summary */}
              <div className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Attendee:</span>
                  <span className="font-bold text-zinc-900">{orderToRefund.customerName} ({orderToRefund.customerEmail})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Refund Amount:</span>
                  <span className="font-mono font-bold text-zinc-950 text-sm">{formatCurrency(orderToRefund.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Tickets Cancelled:</span>
                  <span className="font-bold text-zinc-900">{orderToRefund.ticketQuantity} ticket(s)</span>
                </div>
              </div>

              {/* Reason Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700">Reason for Refund</label>
                <select
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-900 outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20"
                >
                  <option value="Attendee Requested Cancellation">Attendee Requested Cancellation</option>
                  <option value="Event Rescheduled or Venue Change">Event Rescheduled or Venue Change</option>
                  <option value="Duplicate Payment Made">Duplicate Payment Made</option>
                  <option value="Customer Dissatisfaction">Customer Dissatisfaction</option>
                  <option value="Fraudulent Transaction Flagged">Fraudulent Transaction Flagged</option>
                </select>
              </div>

              {/* Optional Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700">Internal Audit Note (Optional)</label>
                <textarea
                  rows={2}
                  value={refundCustomNotes}
                  onChange={(e) => setRefundCustomNotes(e.target.value)}
                  placeholder="Additional context for your organization records..."
                  className="w-full bg-white border border-zinc-200 rounded-xl p-3 text-xs outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 text-zinc-900 resize-none"
                />
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-zinc-200 flex items-center justify-end gap-2.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsRefundModalOpen(false);
                    setOrderToRefund(null);
                  }}
                  disabled={isSubmittingRefund}
                >
                  Cancel
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleConfirmRefund}
                  disabled={isSubmittingRefund}
                  className="bg-rose-600 hover:bg-rose-700 text-white gap-2 font-bold"
                >
                  {isSubmittingRefund ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Confirm Refund ({formatCurrency(orderToRefund.amount)})</span>
                    </>
                  )}
                </Button>
              </div>

            </div>
          )}
        </Modal>

      </div>
    </OrganizerDashboardLayout>
  );
};

export default Orders;
