import React, { useEffect, useState } from 'react';
import { 
  BadgeDollarSign, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Check, 
  X, 
  AlertTriangle 
} from 'lucide-react';
import { adminApi, type AdminOrderItem, type AdminPayoutItem } from '../api/admin';
import { Pagination, type PaginationMeta } from '../components/Pagination';

export const FinanceSettlement: React.FC = () => {
  const [tab, setTab] = useState<'orders' | 'payouts'>('payouts');
  const [orders, setOrders] = useState<AdminOrderItem[]>([]);
  const [payouts, setPayouts] = useState<AdminPayoutItem[]>([]);
  const [ordersMeta, setOrdersMeta] = useState<PaginationMeta | null>(null);
  const [payoutsMeta, setPayoutsMeta] = useState<PaginationMeta | null>(null);
  const [ordersPage, setOrdersPage] = useState<number>(1);
  const [payoutsPage, setPayoutsPage] = useState<number>(1);
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [reviewPayout, setReviewPayout] = useState<{ payout: AdminPayoutItem; action: 'approve' | 'reject' } | null>(null);
  const [noteOrReason, setNoteOrReason] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const fetchFinanceData = async (targetOrdersPage = ordersPage, targetPayoutsPage = payoutsPage) => {
    setLoading(true);
    try {
      if (tab === 'orders') {
        const data = await adminApi.getOrders({ search: search || undefined, page: targetOrdersPage });
        if (data && data.data && Array.isArray(data.data)) {
          setOrders(data.data);
          setOrdersMeta({
            current_page: data.current_page || 1,
            last_page: data.last_page || 1,
            per_page: data.per_page || 15,
            total: data.total || data.data.length,
            from: data.from,
            to: data.to,
          });
        } else {
          setOrders(Array.isArray(data) ? data : []);
          setOrdersMeta(null);
        }
      } else {
        const data = await adminApi.getPayouts({ page: targetPayoutsPage });
        if (data && data.data && Array.isArray(data.data)) {
          setPayouts(data.data);
          setPayoutsMeta({
            current_page: data.current_page || 1,
            last_page: data.last_page || 1,
            per_page: data.per_page || 15,
            total: data.total || data.data.length,
            from: data.from,
            to: data.to,
          });
        } else {
          setPayouts(Array.isArray(data) ? data : []);
          setPayoutsMeta(null);
        }
      }
    } catch (err) {
      console.error('Failed to load financial records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === 'orders') {
      fetchFinanceData(ordersPage, payoutsPage);
    } else {
      fetchFinanceData(ordersPage, payoutsPage);
    }
  }, [tab]);

  const handleOrdersPageChange = (newPage: number) => {
    setOrdersPage(newPage);
    fetchFinanceData(newPage, payoutsPage);
  };

  const handlePayoutsPageChange = (newPage: number) => {
    setPayoutsPage(newPage);
    fetchFinanceData(ordersPage, newPage);
  };

  const handleReviewPayout = async () => {
    if (!reviewPayout) return;
    setActionLoading(true);
    try {
      if (reviewPayout.action === 'approve') {
        await adminApi.approvePayout(reviewPayout.payout.uuid, noteOrReason);
      } else {
        await adminApi.rejectPayout(reviewPayout.payout.uuid, noteOrReason);
      }
      setReviewPayout(null);
      setNoteOrReason('');
      fetchFinanceData();
    } catch (err) {
      alert(`Failed to ${reviewPayout.action} payout.`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-white">Fintech, Orders & Settlement Governance</h2>
        <p className="text-xs text-zinc-400 mt-0.5">Approve organizer withdrawal requests, audit cross-tenant order ledgers, and reconcile platform fees.</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-zinc-800 pb-2">
        <button
          onClick={() => setTab('payouts')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            tab === 'payouts'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-950/40'
              : 'text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800'
          }`}
        >
          Payout Queue
        </button>
        <button
          onClick={() => setTab('orders')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            tab === 'orders'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-950/40'
              : 'text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800'
          }`}
        >
          All Platform Orders
        </button>
      </div>

      {/* Payouts Queue Tab */}
      {tab === 'payouts' && (
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/80 text-zinc-400 uppercase text-[10px] font-mono">
              <tr>
                <th className="py-3 px-4">Payout UUID</th>
                <th className="py-3 px-4">Organizer</th>
                <th className="py-3 px-4">Requested Amount</th>
                <th className="py-3 px-4">Bank Destination</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Settlement Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
              {payouts.map((p) => (
                <tr key={p.uuid} className="hover:bg-zinc-800/20">
                  <td className="py-3 px-4 font-mono text-zinc-400">{p.uuid.substring(0, 12)}...</td>
                  <td className="py-3 px-4 font-bold text-white">{p.organizer?.name || 'Organizer'}</td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-400 text-sm">
                    {p.currency} {Number(p.amount).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-zinc-400">
                    {p.bank_name ? `${p.bank_name} • ${p.account_number}` : 'Standard Bank'}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                      p.status === 'approved' || p.status === 'processed'
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                        : p.status === 'rejected'
                        ? 'bg-rose-950/60 text-rose-400 border border-rose-800/40'
                        : 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-1.5">
                    {p.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => setReviewPayout({ payout: p, action: 'approve' })}
                          className="px-2.5 py-1 bg-emerald-950/60 border border-emerald-800/50 text-emerald-300 hover:bg-emerald-900 rounded-lg text-[11px] font-semibold"
                        >
                          <Check className="w-3.5 h-3.5 inline mr-1" /> Approve
                        </button>
                        <button
                          onClick={() => setReviewPayout({ payout: p, action: 'reject' })}
                          className="px-2.5 py-1 bg-rose-950/60 border border-rose-800/50 text-rose-300 hover:bg-rose-900 rounded-lg text-[11px] font-semibold"
                        >
                          <X className="w-3.5 h-3.5 inline mr-1" /> Reject
                        </button>
                      </>
                    ) : (
                      <span className="text-[11px] text-zinc-500 font-mono">Reviewed</span>
                    )}
                  </td>
                </tr>
              ))}
              {payouts.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-zinc-500">
                    No pending or historical payout requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <Pagination meta={payoutsMeta} onPageChange={handlePayoutsPageChange} loading={loading} />
        </div>
      )}

      {/* Orders Tab */}
      {tab === 'orders' && (
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/80 text-zinc-400 uppercase text-[10px] font-mono">
              <tr>
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Buyer</th>
                <th className="py-3 px-4">Event</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Platform Fee</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
              {orders.map((o) => (
                <tr key={o.uuid} className="hover:bg-zinc-800/20">
                  <td className="py-3 px-4 font-mono text-rose-400 font-bold">{o.order_number}</td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white">{o.customer_name}</div>
                    <div className="text-[11px] text-zinc-500 font-mono">{o.customer_email}</div>
                  </td>
                  <td className="py-3 px-4 text-zinc-200">{o.event?.title || 'Event'}</td>
                  <td className="py-3 px-4 font-mono font-bold text-white">${o.total}</td>
                  <td className="py-3 px-4 font-mono text-emerald-400">${o.service_fee}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                      o.status === 'paid'
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-zinc-500">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <Pagination meta={ordersMeta} onPageChange={handleOrdersPageChange} loading={loading} />
        </div>
      )}

      {/* Payout Action Confirmation Modal */}
      {reviewPayout && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-2.5 text-white font-bold">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <span className="capitalize">{reviewPayout.action} Payout Request</span>
            </div>
            <p className="text-xs text-zinc-400 font-mono">
              Amount: {reviewPayout.payout.currency} {reviewPayout.payout.amount} for {reviewPayout.payout.organizer?.name}
            </p>

            <div className="space-y-1">
              <label className="text-[11px] text-zinc-300 font-semibold">
                {reviewPayout.action === 'approve' ? 'Optional Clearing / Settlement Notes' : 'Mandatory Rejection Reason'}
              </label>
              <textarea
                value={noteOrReason}
                onChange={(e) => setNoteOrReason(e.target.value)}
                placeholder={reviewPayout.action === 'approve' ? 'e.g., Transfer verified via bank wire...' : 'e.g., Discrepancy with ticket refund reserve...'}
                rows={3}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setReviewPayout(null)}
                className="px-3 py-2 bg-zinc-800 text-zinc-300 hover:text-white rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleReviewPayout}
                disabled={actionLoading || (reviewPayout.action === 'reject' && !noteOrReason)}
                className={`px-3 py-2 text-white rounded-xl text-xs font-semibold capitalize ${
                  reviewPayout.action === 'approve' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'
                }`}
              >
                {actionLoading ? 'Processing...' : `Confirm ${reviewPayout.action}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

