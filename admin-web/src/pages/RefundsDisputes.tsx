import React, { useState } from 'react';
import {
  RotateCcw,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Receipt,
  Eye,
  ShieldAlert,
  ArrowRight,
  Filter,
  RefreshCw,
  ExternalLink,
  X
} from 'lucide-react';

interface AdminRefundItem {
  id: string;
  refund_reference: string;
  order_reference: string;
  event_title: string;
  customer_name: string;
  customer_email: string;
  requested_amount: number;
  currency: string;
  reason: string;
  status: 'settled' | 'pending_approval' | 'rejected';
  gateway_refund_id?: string;
  admin_notes?: string;
  created_at: string;
}

const SAMPLE_REFUNDS: AdminRefundItem[] = [
  {
    id: 'ref-001',
    refund_reference: 'RF-2026-9021',
    order_reference: 'EOS-2026-9024-ZK',
    event_title: 'Calabar Carnival VIP Experience',
    customer_name: 'Faith Amadi',
    customer_email: 'faith.amadi@gmail.com',
    requested_amount: 50000,
    currency: 'NGN',
    reason: 'Event schedule altered by organizer; attendee cannot attend new dates.',
    status: 'settled',
    gateway_refund_id: 'pstk_rf_99812039120',
    admin_notes: 'Approved under organizer rescheduled event refund policy.',
    created_at: '2026-11-10 19:10:00',
  },
  {
    id: 'ref-002',
    refund_reference: 'RF-2026-9022',
    order_reference: 'EOS-2026-9020-OP',
    event_title: 'Afrobeats Symphony & Soundscape',
    customer_name: 'Emeka Nwosu',
    customer_email: 'emeka.nwosu@gmail.com',
    requested_amount: 35000,
    currency: 'NGN',
    reason: 'Duplicate payment on mobile banking app during network latency.',
    status: 'pending_approval',
    created_at: '2026-11-11 11:24:00',
  },
  {
    id: 'ref-003',
    refund_reference: 'RF-2026-9023',
    order_reference: 'EOS-2026-8812-TX',
    event_title: 'Lagos Tech Innovators Summit 2026',
    customer_name: 'Tunde Bakare',
    customer_email: 'tunde.b@techcorp.ng',
    requested_amount: 75000,
    currency: 'NGN',
    reason: 'Buyer claims ticket tier unassigned after card checkout.',
    status: 'pending_approval',
    created_at: '2026-11-12 08:05:00',
  },
];

export const RefundsDisputes: React.FC = () => {
  const [refunds, setRefunds] = useState<AdminRefundItem[]>(SAMPLE_REFUNDS);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [selectedRefund, setSelectedRefund] = useState<AdminRefundItem | null>(null);
  const [reviewModal, setReviewModal] = useState<{ item: AdminRefundItem; action: 'approve' | 'reject' } | null>(null);
  const [adminNote, setAdminNote] = useState<string>('');
  const [processing, setProcessing] = useState<boolean>(false);

  const filtered = refunds.filter((r) => {
    const matchesSearch =
      !search.trim() ||
      r.refund_reference.toLowerCase().includes(search.toLowerCase()) ||
      r.order_reference.toLowerCase().includes(search.toLowerCase()) ||
      r.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      r.customer_email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAction = async () => {
    if (!reviewModal) return;
    setProcessing(true);
    await new Promise((res) => setTimeout(res, 600));

    setRefunds((prev) =>
      prev.map((r) => {
        if (r.id === reviewModal.item.id) {
          return {
            ...r,
            status: reviewModal.action === 'approve' ? 'settled' : 'rejected',
            admin_notes: adminNote,
            gateway_refund_id: reviewModal.action === 'approve' ? `pstk_rf_${Date.now().toString().slice(-8)}` : undefined,
          };
        }
        return r;
      })
    );

    setProcessing(false);
    setReviewModal(null);
    setAdminNote('');
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-850 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <RotateCcw className="w-6 h-6 text-rose-500" />
            <span>Refunds, Chargebacks & Disputes Arbitration</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Authorize attendee payment reversals, reconcile organizer escrow deductions, and inspect gateway refund tokens.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-xs font-bold">
            Arbitration Safe Ledger
          </span>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by refund #, order #, or customer email..."
            className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500/60"
          />
        </div>

        <div className="flex gap-1.5">
          {[
            { label: 'All Requests', val: 'all' },
            { label: 'Pending Review', val: 'pending_approval' },
            { label: 'Settled', val: 'settled' },
            { label: 'Rejected', val: 'rejected' },
          ].map((tab) => (
            <button
              key={tab.val}
              onClick={() => setStatusFilter(tab.val)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono uppercase font-bold transition border ${
                statusFilter === tab.val
                  ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                  : 'bg-zinc-900/60 text-zinc-400 border-zinc-800/80 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl overflow-hidden backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/80 text-zinc-400 uppercase text-[10px] font-mono border-b border-zinc-800/80">
              <tr>
                <th className="py-3 px-4">Claim Reference</th>
                <th className="py-3 px-4">Event & Order</th>
                <th className="py-3 px-4">Customer Details</th>
                <th className="py-3 px-4">Claim Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Submitted</th>
                <th className="py-3 px-4 text-right">Arbitration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50 text-zinc-300">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-white">
                    {item.refund_reference}
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-white truncate max-w-xs">{item.event_title}</p>
                    <p className="text-[10px] text-zinc-500 font-mono">Order: {item.order_reference}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="text-white font-medium">{item.customer_name}</p>
                    <p className="text-[11px] text-zinc-500 font-mono">{item.customer_email}</p>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-rose-400">
                    {item.currency} {item.requested_amount.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {item.status === 'settled' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                        Settled
                      </span>
                    )}
                    {item.status === 'pending_approval' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
                        Under Review
                      </span>
                    )}
                    {item.status === 'rejected' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold">
                        Rejected
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-zinc-400 whitespace-nowrap">
                    {item.created_at}
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-1.5">
                    <button
                      onClick={() => setSelectedRefund(item)}
                      className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-[11px] font-semibold transition"
                    >
                      Audit
                    </button>
                    {item.status === 'pending_approval' && (
                      <>
                        <button
                          onClick={() => setReviewModal({ item, action: 'approve' })}
                          className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500 hover:text-white text-emerald-400 border border-emerald-500/20 rounded-lg text-[11px] font-semibold transition"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => setReviewModal({ item, action: 'reject' })}
                          className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-400 border border-rose-500/20 rounded-lg text-[11px] font-semibold transition"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2.5 text-white font-bold">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <span className="capitalize">{reviewModal.action} Refund: {reviewModal.item.refund_reference}</span>
            </div>

            <p className="text-xs text-zinc-400">
              {reviewModal.action === 'approve'
                ? `Authorizing this refund will deduct ${reviewModal.item.currency} ${reviewModal.item.requested_amount.toLocaleString()} from organizer escrow and disburse reversal to ${reviewModal.item.customer_name}.`
                : 'Rejecting this claim denies payment reversal and archives the customer dispute.'}
            </p>

            <div className="space-y-1">
              <label className="text-[11px] text-zinc-300 font-semibold">Arbitration Notes</label>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Reason or gateway note..."
                rows={3}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setReviewModal(null)}
                className="px-3 py-2 bg-zinc-800 text-zinc-300 hover:text-white rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                disabled={processing}
                className={`px-4 py-2 text-white rounded-xl text-xs font-semibold capitalize ${
                  reviewModal.action === 'approve' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'
                }`}
              >
                {processing ? 'Processing...' : `Confirm ${reviewModal.action}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inspection Modal */}
      {selectedRefund && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Receipt className="w-4 h-4 text-rose-500" />
                <span>Dispute File • {selectedRefund.refund_reference}</span>
              </h3>
              <button onClick={() => setSelectedRefund(null)} className="text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-mono text-zinc-500">Claimant Stated Reason</span>
                <p className="text-zinc-200">{selectedRefund.reason}</p>
              </div>

              {selectedRefund.admin_notes && (
                <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-mono text-zinc-500">Admin Arbitration Record</span>
                  <p className="text-zinc-200">{selectedRefund.admin_notes}</p>
                </div>
              )}

              {selectedRefund.gateway_refund_id && (
                <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-mono text-zinc-500">Payment Gateway Reversal Token</span>
                  <p className="text-emerald-400 font-mono font-bold">{selectedRefund.gateway_refund_id}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedRefund(null)}
                className="px-4 py-2 bg-zinc-800 text-white rounded-xl text-xs font-semibold"
              >
                Close File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

