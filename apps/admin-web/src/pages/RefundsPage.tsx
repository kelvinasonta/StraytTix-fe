import React, { useState } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { AdminRefund } from '../types/admin';
import {
  RotateCcw,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Receipt,
  Eye,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

const INITIAL_REFUNDS: AdminRefund[] = [
  {
    id: 'ref-001',
    refund_reference: 'RF-2026-9021',
    order_reference: 'EOS-2026-9024-ZK',
    order_id: 'ord-8109-2921',
    event_title: 'Calabar Carnival VIP Experience',
    customer_name: 'Faith Amadi',
    customer_email: 'faith.amadi@gmail.com',
    requested_amount: 50000,
    currency: 'NGN',
    reason: 'Event schedule altered by organizer; attendee cannot travel on new dates.',
    status: 'settled',
    gateway_refund_id: 'pstk_rf_99812039120',
    reviewer_name: 'Alex Morgan (Finance Admin)',
    admin_notes: 'Approved under organizer rescheduled event refund policy.',
    created_at: '2026-10-14 19:10:00',
    processed_at: '2026-10-14 19:45:10'
  },
  {
    id: 'ref-002',
    refund_reference: 'RF-2026-9022',
    order_reference: 'EOS-2026-9020-OP',
    order_id: 'ord-8109-2900',
    event_title: 'Afrobeats Symphony & Soundscape',
    customer_name: 'Emeka Nwosu',
    customer_email: 'emeka.nwosu@gmail.com',
    requested_amount: 35000,
    currency: 'NGN',
    reason: 'Duplicate payment debited twice by banking network.',
    status: 'pending',
    gateway_refund_id: null,
    reviewer_name: null,
    admin_notes: null,
    created_at: '2026-10-15 02:15:00',
    processed_at: null
  },
  {
    id: 'ref-003',
    refund_reference: 'RF-2026-9023',
    order_reference: 'EOS-2026-8990-TR',
    order_id: 'ord-8109-2890',
    event_title: 'Lagos Tech Fest 2026 (VIP Pass)',
    customer_name: 'Bolaji Adeleke',
    customer_email: 'bolaji.a@techhub.ng',
    requested_amount: 75000,
    currency: 'NGN',
    reason: 'Attendee claims change of mind 24 hours prior to live event.',
    status: 'rejected',
    gateway_refund_id: null,
    reviewer_name: 'Alex Morgan (Finance Admin)',
    admin_notes: 'Rejected strictly based on strict No-Refund policy stated on ticket tier.',
    created_at: '2026-10-13 10:00:00',
    processed_at: '2026-10-13 11:30:20'
  }
];

export const RefundsPage: React.FC = () => {
  const [refunds, setRefunds] = useState<AdminRefund[]>(INITIAL_REFUNDS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRefund, setSelectedRefund] = useState<AdminRefund | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const filteredRefunds = refunds.filter((r) => {
    const matchesSearch =
      r.refund_reference.toLowerCase().includes(search.toLowerCase()) ||
      r.order_reference.toLowerCase().includes(search.toLowerCase()) ||
      r.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      r.customer_email.toLowerCase().includes(search.toLowerCase()) ||
      r.event_title.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleApproveRefund = (refundId: string) => {
    setIsProcessing(true);
    setTimeout(() => {
      setRefunds((prev) =>
        prev.map((r) =>
          r.id === refundId
            ? {
                ...r,
                status: 'settled',
                gateway_refund_id: `pstk_rf_${Date.now()}`,
                reviewer_name: 'Active Administrator',
                processed_at: new Date().toISOString()
              }
            : r
        )
      );
      if (selectedRefund && selectedRefund.id === refundId) {
        setSelectedRefund((prev) =>
          prev
            ? {
                ...prev,
                status: 'settled',
                gateway_refund_id: `pstk_rf_${Date.now()}`,
                reviewer_name: 'Active Administrator',
                processed_at: new Date().toISOString()
              }
            : null
        );
      }
      setIsProcessing(false);
      setActionSuccess('Refund approved and settled with payment gateway. Ledger updated.');
      setTimeout(() => setActionSuccess(null), 4000);
    }, 800);
  };

  const handleRejectRefund = () => {
    if (!selectedRefund || !rejectionReason.trim()) return;

    setRefunds((prev) =>
      prev.map((r) =>
        r.id === selectedRefund.id
          ? {
              ...r,
              status: 'rejected',
              reviewer_name: 'Active Administrator',
              admin_notes: rejectionReason,
              processed_at: new Date().toISOString()
            }
          : r
      )
    );
    setSelectedRefund((prev) =>
      prev
        ? {
            ...prev,
            status: 'rejected',
            reviewer_name: 'Active Administrator',
            admin_notes: rejectionReason,
            processed_at: new Date().toISOString()
          }
        : null
    );
    setRejectionModalOpen(false);
    setRejectionReason('');
    setActionSuccess('Refund request formally rejected with recorded policy reason.');
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const getStatusBadge = (status: AdminRefund['status']) => {
    switch (status) {
      case 'settled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" /> Settled (Refunded)
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3 h-3" /> Pending Review
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="w-3 h-3" /> Rejected
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <CheckCircle2 className="w-3 h-3" /> Approved
          </span>
        );
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-5">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
              <RotateCcw className="w-6 h-6 text-rose-500" />
              <span>Refunds & Disputes Desk</span>
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Investigate disputed transactions, review eligibility against event policies, and trigger gateway refund settlements.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-3 py-1 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400">
              Pending Claims: <strong className="text-amber-400">1</strong>
            </span>
            <span className="px-3 py-1 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400">
              Total Settled: <strong className="text-emerald-400">₦50,000</strong>
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

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by Refund Ref, Order Ref, Customer Email or Event..."
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
              <option value="pending">Pending Review</option>
              <option value="settled">Settled</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Refunds Table */}
        <div className="rounded-2xl bg-zinc-900/40 border border-zinc-850 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/80 border-b border-zinc-800 text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Refund Ref</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Event</th>
                  <th className="py-3 px-4">Requested Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Requested On</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                {filteredRefunds.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-zinc-500">
                      No refund requests found.
                    </td>
                  </tr>
                ) : (
                  filteredRefunds.map((r) => (
                    <tr key={r.id} className="hover:bg-zinc-850/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-white">
                        <span>{r.refund_reference}</span>
                        <span className="text-[10px] text-zinc-500 block">{r.order_reference}</span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-white block">{r.customer_name}</span>
                        <span className="text-zinc-500 text-[11px] block">{r.customer_email}</span>
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <span className="text-white font-medium block truncate">{r.event_title}</span>
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-rose-400">
                        ₦{r.requested_amount.toLocaleString()}
                      </td>

                      <td className="py-3 px-4">{getStatusBadge(r.status)}</td>

                      <td className="py-3 px-4 text-[11px] text-zinc-400 font-mono">
                        {r.created_at}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedRefund(r)}
                          className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Review</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Review Modal */}
        {selectedRefund && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5">
              <div className="flex items-start justify-between border-b border-zinc-900 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-lg text-white font-mono">{selectedRefund.refund_reference}</span>
                    {getStatusBadge(selectedRefund.status)}
                  </div>
                  <span className="text-xs text-zinc-500 block mt-0.5">
                    Linked Order: {selectedRefund.order_reference} • {selectedRefund.event_title}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedRefund(null)}
                  className="text-zinc-500 hover:text-white p-1 rounded-lg"
                >
                  ✕
                </button>
              </div>

              {/* Amount & Reason */}
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-850 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 font-bold uppercase text-[10px]">Claim Amount</span>
                  <span className="text-base font-black text-white font-mono">
                    ₦{selectedRefund.requested_amount.toLocaleString()}
                  </span>
                </div>
                <div className="border-t border-zinc-800/80 pt-2 text-zinc-300">
                  <strong className="text-zinc-400 block mb-1">Customer Justification:</strong>
                  <p className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-900 text-zinc-300 italic">
                    "{selectedRefund.reason}"
                  </p>
                </div>
              </div>

              {/* Resolution details if already resolved */}
              {selectedRefund.reviewer_name && (
                <div className="p-3.5 rounded-2xl bg-zinc-900/40 border border-zinc-850 space-y-1 text-xs">
                  <span className="text-zinc-500 font-bold text-[10px] uppercase block">Audit Resolution Trace</span>
                  <div className="text-zinc-300">
                    <strong className="text-white">Reviewer:</strong> {selectedRefund.reviewer_name}
                  </div>
                  {selectedRefund.gateway_refund_id && (
                    <div className="text-zinc-400 font-mono text-[11px]">
                      Gateway Settlement ID: {selectedRefund.gateway_refund_id}
                    </div>
                  )}
                  {selectedRefund.admin_notes && (
                    <div className="text-zinc-400 text-[11px] pt-1">
                      Notes: {selectedRefund.admin_notes}
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="border-t border-zinc-900 pt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {selectedRefund.status === 'pending' && (
                    <>
                      <button
                        disabled={isProcessing}
                        onClick={() => handleApproveRefund(selectedRefund.id)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isProcessing ? 'Settling Gateway...' : 'Approve & Settle'}</span>
                      </button>

                      <button
                        onClick={() => setRejectionModalOpen(true)}
                        className="px-3.5 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject Claim</span>
                      </button>
                    </>
                  )}
                </div>

                <button
                  onClick={() => setSelectedRefund(null)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Rejection Justification Modal */}
        {rejectionModalOpen && selectedRefund && (
          <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-zinc-950 border border-rose-800/60 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center gap-2.5 text-rose-400">
                <ShieldAlert className="w-6 h-6 flex-shrink-0" />
                <h3 className="font-bold text-base text-white">Reject Refund Request</h3>
              </div>
              <p className="text-xs text-zinc-400">
                Please provide the policy justification for rejecting{' '}
                <strong className="text-white font-mono">{selectedRefund.refund_reference}</strong>.
              </p>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-300 block">Policy Rejection Reason</label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Ineligible according to event organizer non-refundable policy..."
                  className="w-full p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setRejectionModalOpen(false)}
                  className="px-3 py-2 rounded-xl bg-zinc-900 text-zinc-300 text-xs font-bold hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  disabled={!rejectionReason.trim()}
                  onClick={handleRejectRefund}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
