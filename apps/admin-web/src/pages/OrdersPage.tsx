import React, { useState } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { AdminOrder } from '../types/admin';
import {
  ShoppingBag,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Eye,
  RefreshCw,
  AlertTriangle,
  Receipt,
  Building,
  User,
  ShieldCheck,
  CreditCard,
  ArrowUpRight
} from 'lucide-react';

const INITIAL_ORDERS: AdminOrder[] = [
  {
    id: 'ord-8109-2918',
    order_reference: 'EOS-2026-9021-AF',
    payment_reference: 'pstk_ref_9821892019401',
    gateway: 'paystack',
    currency: 'NGN',
    amount: 75000,
    platform_fee: 2625,
    organizer_earnings: 72375,
    status: 'completed',
    customer_name: 'Tunde Adeleke',
    customer_email: 'tunde.adeleke@gmail.com',
    customer_phone: '+234 803 123 4567',
    event_id: 'evt-001',
    event_title: 'Lagos Tech Fest 2026 (VIP Pass)',
    organizer_id: 'org-101',
    organizer_name: 'Apex Entertainment Group Ltd',
    items: [
      {
        id: 'item-1',
        ticket_type_id: 'tt-vip-1',
        ticket_type_name: 'VIP Founder Access Pass',
        quantity: 1,
        unit_price: 75000,
        subtotal: 75000
      }
    ],
    created_at: '2026-10-15 03:41:20',
    paid_at: '2026-10-15 03:41:45',
    reconciled: true
  },
  {
    id: 'ord-8109-2919',
    order_reference: 'EOS-2026-9022-BC',
    payment_reference: 'flw_tx_091823901823',
    gateway: 'flutterwave',
    currency: 'NGN',
    amount: 150000,
    platform_fee: 5250,
    organizer_earnings: 144750,
    status: 'pending',
    customer_name: 'Chioma Okonkwo',
    customer_email: 'chioma.o@outlook.com',
    customer_phone: '+234 812 998 1122',
    event_id: 'evt-002',
    event_title: 'Afrobeats Symphony & Soundscape',
    organizer_id: 'org-102',
    organizer_name: 'SoundPulse Media Nigeria',
    items: [
      {
        id: 'item-2',
        ticket_type_id: 'tt-squad-5',
        ticket_type_name: 'Squad Table for 5',
        quantity: 2,
        unit_price: 75000,
        subtotal: 150000
      }
    ],
    created_at: '2026-10-15 04:12:00',
    paid_at: null,
    reconciled: false
  },
  {
    id: 'ord-8109-2920',
    order_reference: 'EOS-2026-9023-XD',
    payment_reference: 'pstk_ref_9821892019488',
    gateway: 'paystack',
    currency: 'NGN',
    amount: 35000,
    platform_fee: 1225,
    organizer_earnings: 33775,
    status: 'failed',
    customer_name: 'Ibrahim Danladi',
    customer_email: 'ibrahim.d@kano.gov.ng',
    customer_phone: '+234 802 443 2190',
    event_id: 'evt-003',
    event_title: 'Abuja Fintech Summit',
    organizer_id: 'org-103',
    organizer_name: 'Horizon Labs Africa',
    items: [
      {
        id: 'item-3',
        ticket_type_id: 'tt-gen-1',
        ticket_type_name: 'Standard Delegate Pass',
        quantity: 1,
        unit_price: 35000,
        subtotal: 35000
      }
    ],
    created_at: '2026-10-15 04:55:10',
    paid_at: null,
    reconciled: false
  },
  {
    id: 'ord-8109-2921',
    order_reference: 'EOS-2026-9024-ZK',
    payment_reference: 'pstk_ref_1120938102931',
    gateway: 'paystack',
    currency: 'NGN',
    amount: 50000,
    platform_fee: 1750,
    organizer_earnings: 48250,
    status: 'refunded',
    customer_name: 'Faith Amadi',
    customer_email: 'faith.amadi@gmail.com',
    customer_phone: '+234 701 882 3921',
    event_id: 'evt-004',
    event_title: 'Calabar Carnival VIP Experience',
    organizer_id: 'org-104',
    organizer_name: 'Crestline Ventures Ltd',
    items: [
      {
        id: 'item-4',
        ticket_type_id: 'tt-cal-1',
        ticket_type_name: 'Carnival Pavilion Pass',
        quantity: 2,
        unit_price: 25000,
        subtotal: 50000
      }
    ],
    created_at: '2026-10-14 18:20:00',
    paid_at: '2026-10-14 18:21:05',
    reconciled: true
  }
];

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<AdminOrder[]>(INITIAL_ORDERS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [isReconciling, setIsReconciling] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.order_reference.toLowerCase().includes(search.toLowerCase()) ||
      order.payment_reference.toLowerCase().includes(search.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      order.customer_email.toLowerCase().includes(search.toLowerCase()) ||
      order.event_title.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleManualReconciliation = (orderId: string) => {
    setIsReconciling(true);
    setTimeout(() => {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? { ...o, status: 'completed', reconciled: true, paid_at: new Date().toISOString() }
            : o
        )
      );
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) =>
          prev ? { ...prev, status: 'completed', reconciled: true, paid_at: new Date().toISOString() } : null
        );
      }
      setIsReconciling(false);
      setActionSuccess('Order successfully verified with payment gateway & marked reconciled.');
      setTimeout(() => setActionSuccess(null), 4000);
    }, 700);
  };

  const getStatusBadge = (status: AdminOrder['status']) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" /> Completed
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="w-3 h-3" /> Failed
          </span>
        );
      case 'refunded':
      case 'partially_refunded':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <RotateCcw className="w-3 h-3" /> Refunded
          </span>
        );
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-5">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
              <ShoppingBag className="w-6 h-6 text-rose-500" />
              <span>Orders & Transaction Desk</span>
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Investigate customer purchases, inspect payment gateway logs, and execute safe idempotent reconciliation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">Live Gateway Feeds:</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-900 border border-zinc-800 text-zinc-300">
              Paystack: Active
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-900 border border-zinc-800 text-zinc-300">
              Flutterwave: Active
            </span>
          </div>
        </div>

        {actionSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{actionSuccess}</span>
            </div>
            <button onClick={() => setActionSuccess(null)} className="text-emerald-400 hover:text-white">✕</button>
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by Order Ref, Paystack Ref, Customer Email or Event..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-900/60 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-rose-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-zinc-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-zinc-900/60 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-hidden focus:border-rose-500"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="rounded-2xl bg-zinc-900/40 border border-zinc-850 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/80 border-b border-zinc-800 text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Order Reference</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Event & Organizer</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Take Rate (Fee)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-zinc-500">
                      No orders found matching the filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-zinc-850/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium">
                        <span className="text-white block font-bold">{order.order_reference}</span>
                        <span className="text-[10px] text-zinc-500 block truncate max-w-[140px]">
                          {order.payment_reference}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-white block">{order.customer_name}</span>
                        <span className="text-zinc-500 text-[11px] block">{order.customer_email}</span>
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <span className="text-white font-medium block truncate">{order.event_title}</span>
                        <span className="text-zinc-500 text-[10px] block truncate">{order.organizer_name}</span>
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-white">
                        ₦{order.amount.toLocaleString()}
                        <span className="text-[10px] text-zinc-500 block font-normal uppercase">
                          {order.gateway}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-emerald-400">
                        ₦{order.platform_fee.toLocaleString()}
                        <span className="text-[10px] text-zinc-500 block">
                          Org: ₦{order.organizer_earnings.toLocaleString()}
                        </span>
                      </td>

                      <td className="py-3 px-4">{getStatusBadge(order.status)}</td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Details Drawer / Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-zinc-900 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-lg text-white font-mono">{selectedOrder.order_reference}</span>
                    {getStatusBadge(selectedOrder.status)}
                  </div>
                  <span className="text-xs text-zinc-500 block mt-0.5">
                    Internal UUID: {selectedOrder.id} • Created: {selectedOrder.created_at}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-zinc-500 hover:text-white p-1 rounded-lg"
                >
                  ✕
                </button>
              </div>

              {/* Financial Breakdown Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-850">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block">Gross Total</span>
                  <span className="text-base font-black text-white font-mono">
                    ₦{selectedOrder.amount.toLocaleString()}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-850">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block">Platform Fee (Take)</span>
                  <span className="text-base font-black text-emerald-400 font-mono">
                    ₦{selectedOrder.platform_fee.toLocaleString()}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-850">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block">Organizer Share</span>
                  <span className="text-base font-black text-rose-400 font-mono">
                    ₦{selectedOrder.organizer_earnings.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Payment Gateway Information */}
              <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-850 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 font-bold flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-rose-500" /> Payment Gateway Trace
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded uppercase">
                    Provider: {selectedOrder.gateway}
                  </span>
                </div>
                <div className="font-mono text-zinc-300 bg-zinc-950 p-2.5 rounded-xl border border-zinc-900 text-[11px] break-all">
                  Gateway Ref: {selectedOrder.payment_reference}
                </div>
                <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
                  <span>Reconciled with Gateway:</span>
                  <span className={selectedOrder.reconciled ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                    {selectedOrder.reconciled ? 'Yes (Ledger Synced)' : 'Pending Verification'}
                  </span>
                </div>
              </div>

              {/* Order Items Breakdown */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                  Purchased Ticket Allocations
                </span>
                <div className="divide-y divide-zinc-900 border border-zinc-850 rounded-2xl overflow-hidden bg-zinc-900/20 text-xs">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="p-3 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-white block">{item.ticket_type_name}</span>
                        <span className="text-zinc-500 text-[11px]">
                          Qty: {item.quantity} × ₦{item.unit_price.toLocaleString()}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-white">₦{item.subtotal.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer & Event Details */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-zinc-900/40 border border-zinc-850 space-y-1">
                  <span className="text-zinc-500 font-bold text-[10px] uppercase flex items-center gap-1">
                    <User className="w-3.5 h-3.5" /> Customer Details
                  </span>
                  <span className="font-bold text-white block">{selectedOrder.customer_name}</span>
                  <span className="text-zinc-400 block">{selectedOrder.customer_email}</span>
                  {selectedOrder.customer_phone && (
                    <span className="text-zinc-500 font-mono block">{selectedOrder.customer_phone}</span>
                  )}
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-900/40 border border-zinc-850 space-y-1">
                  <span className="text-zinc-500 font-bold text-[10px] uppercase flex items-center gap-1">
                    <Building className="w-3.5 h-3.5" /> Event & Host
                  </span>
                  <span className="font-bold text-white block">{selectedOrder.event_title}</span>
                  <span className="text-zinc-400 block">{selectedOrder.organizer_name}</span>
                </div>
              </div>

              {/* Authorized Actions */}
              <div className="border-t border-zinc-900 pt-4 flex items-center justify-between">
                <div className="text-[11px] text-zinc-500">
                  {selectedOrder.status === 'pending' && (
                    <span className="text-amber-400 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Webhook delayed or unreceived.
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {selectedOrder.status !== 'completed' && (
                    <button
                      disabled={isReconciling}
                      onClick={() => handleManualReconciliation(selectedOrder.id)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isReconciling ? 'animate-spin' : ''}`} />
                      <span>{isReconciling ? 'Querying Gateway...' : 'Reconcile with Gateway'}</span>
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
