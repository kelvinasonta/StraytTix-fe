import React, { useState } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { AdminPayout } from '../types/admin';
import {
  Banknote,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Lock,
  Unlock,
  Building,
  Eye,
  ShieldCheck,
  Send,
  EyeOff
} from 'lucide-react';

const INITIAL_PAYOUTS: AdminPayout[] = [
  {
    id: 'pay-001',
    payout_reference: 'PO-2026-8012',
    organizer_id: 'org-101',
    organizer_name: 'Apex Entertainment Group Ltd',
    bank_name: 'Guaranty Trust Bank (GTBank)',
    account_number_masked: '0123****89',
    account_name: 'Apex Entertainment Group Ltd',
    gross_revenue: 12500000,
    platform_fees: 437500,
    net_amount: 12062500,
    currency: 'NGN',
    status: 'pending_approval',
    hold_reason: null,
    authorized_by: null,
    created_at: '2026-10-15 01:00:00',
    settled_at: null
  },
  {
    id: 'pay-002',
    payout_reference: 'PO-2026-8013',
    organizer_id: 'org-102',
    organizer_name: 'SoundPulse Media Nigeria',
    bank_name: 'Access Bank PLC',
    account_number_masked: '0712****14',
    account_name: 'SoundPulse Media Ltd',
    gross_revenue: 4500000,
    platform_fees: 157500,
    net_amount: 4342500,
    currency: 'NGN',
    status: 'completed',
    hold_reason: null,
    authorized_by: 'Alex Morgan (Finance Admin)',
    created_at: '2026-10-14 10:00:00',
    settled_at: '2026-10-14 11:15:32'
  },
  {
    id: 'pay-003',
    payout_reference: 'PO-2026-8014',
    organizer_id: 'org-103',
    organizer_name: 'Horizon Labs Africa',
    bank_name: 'Zenith Bank',
    account_number_masked: '2019****99',
    account_name: 'Horizon Labs Innovations',
    gross_revenue: 850000,
    platform_fees: 29750,
    net_amount: 820250,
    currency: 'NGN',
    status: 'on_hold',
    hold_reason: 'KYC Document Renewal & Organizer Bank Name Discrepancy Investigation.',
    authorized_by: null,
    created_at: '2026-10-13 14:20:00',
    settled_at: null
  }
];

export const PayoutsPage: React.FC = () => {
  const [payouts, setPayouts] = useState<AdminPayout[]>(INITIAL_PAYOUTS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedPayout, setSelectedPayout] = useState<AdminPayout | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [holdModalOpen, setHoldModalOpen] = useState(false);
  const [holdReason, setHoldReason] = useState('');

  const filteredPayouts = payouts.filter((p) => {
    const matchesSearch =
      p.payout_reference.toLowerCase().includes(search.toLowerCase()) ||
      p.organizer_name.toLowerCase().includes(search.toLowerCase()) ||
      p.bank_name.toLowerCase().includes(search.toLowerCase()) ||
      p.account_name.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleApprovePayout = (payoutId: string) => {
    setIsProcessing(true);
    setTimeout(() => {
      setPayouts((prev) =>
        prev.map((p) =>
          p.id === payoutId
            ? {
                ...p,
                status: 'completed',
                authorized_by: 'Active Finance Administrator',
                settled_at: new Date().toISOString()
              }
            : p
        )
      );
      if (selectedPayout && selectedPayout.id === payoutId) {
        setSelectedPayout((prev) =>
          prev
            ? {
                ...prev,
                status: 'completed',
                authorized_by: 'Active Finance Administrator',
                settled_at: new Date().toISOString()
              }
            : null
        );
      }
      setIsProcessing(false);
      setActionSuccess('Payout approved and dispatched via Paystack Transfer API.');
      setTimeout(() => setActionSuccess(null), 4000);
    }, 800);
  };

  const handleApplyHold = () => {
    if (!selectedPayout || !holdReason.trim()) return;

    setPayouts((prev) =>
      prev.map((p) =>
        p.id === selectedPayout.id
          ? {
              ...p,
              status: 'on_hold',
              hold_reason: holdReason
            }
          : p
      )
    );
    setSelectedPayout((prev) =>
      prev
        ? {
            ...prev,
            status: 'on_hold',
            hold_reason: holdReason
          }
        : null
    );
    setHoldModalOpen(false);
    setHoldReason('');
    setActionSuccess('Disbursement placed ON HOLD. Audit incident created.');
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const handleReleaseHold = (payoutId: string) => {
    setPayouts((prev) =>
      prev.map((p) =>
        p.id === payoutId
          ? {
              ...p,
              status: 'pending_approval',
              hold_reason: null
            }
          : p
      )
    );
    setSelectedPayout((prev) =>
      prev
        ? {
            ...prev,
            status: 'pending_approval',
            hold_reason: null
          }
        : null
    );
    setActionSuccess('Hold released. Payout returned to Pending Authorization queue.');
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const getStatusBadge = (status: AdminPayout['status']) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" /> Dispatched & Settled
          </span>
        );
      case 'pending_approval':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3 h-3" /> Pending Authorization
          </span>
        );
      case 'on_hold':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Lock className="w-3 h-3" /> On Hold (Frozen)
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Clock className="w-3 h-3" /> Gateway Processing
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">
            <XCircle className="w-3 h-3" /> Failed
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
              <Banknote className="w-6 h-6 text-rose-500" />
              <span>Organizer Payouts & Settlement Desk</span>
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Review organizer account balances, masked Nigerian banking details, and approve settlement transfers.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-3 py-1 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400">
              Pending Payouts: <strong className="text-amber-400">₦12,062,500</strong>
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
              placeholder="Search by Payout Ref, Organizer, Bank, or Account..."
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
              <option value="all">All Settlement Statuses</option>
              <option value="pending_approval">Pending Approval</option>
              <option value="completed">Completed (Settled)</option>
              <option value="on_hold">On Hold (Frozen)</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl bg-zinc-900/40 border border-zinc-850 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/80 border-b border-zinc-800 text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Payout Ref</th>
                  <th className="py-3 px-4">Organizer</th>
                  <th className="py-3 px-4">Recipient Bank</th>
                  <th className="py-3 px-4">Gross Revenue</th>
                  <th className="py-3 px-4">Net Disbursement</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                {filteredPayouts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-zinc-500">
                      No payout records found.
                    </td>
                  </tr>
                ) : (
                  filteredPayouts.map((p) => (
                    <tr key={p.id} className="hover:bg-zinc-850/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-white">
                        <span>{p.payout_reference}</span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-white block">{p.organizer_name}</span>
                        <span className="text-zinc-500 text-[11px] block">{p.organizer_id}</span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-white block font-medium">{p.bank_name}</span>
                        <span className="text-zinc-500 font-mono text-[11px] block">
                          {p.account_number_masked} ({p.account_name})
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-zinc-400">
                        ₦{p.gross_revenue.toLocaleString()}
                        <span className="text-[10px] text-zinc-600 block">
                          Fee: ₦{p.platform_fees.toLocaleString()}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                        ₦{p.net_amount.toLocaleString()}
                      </td>

                      <td className="py-3 px-4">{getStatusBadge(p.status)}</td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedPayout(p)}
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

        {/* Modal */}
        {selectedPayout && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5">
              <div className="flex items-start justify-between border-b border-zinc-900 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-lg text-white font-mono">{selectedPayout.payout_reference}</span>
                    {getStatusBadge(selectedPayout.status)}
                  </div>
                  <span className="text-xs text-zinc-500 block mt-0.5">
                    Organizer: {selectedPayout.organizer_name} ({selectedPayout.organizer_id})
                  </span>
                </div>
                <button
                  onClick={() => setSelectedPayout(null)}
                  className="text-zinc-500 hover:text-white p-1 rounded-lg"
                >
                  ✕
                </button>
              </div>

              {/* Disbursement Amounts */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-850">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block">Gross Sales</span>
                  <span className="text-base font-black text-white font-mono">
                    ₦{selectedPayout.gross_revenue.toLocaleString()}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-850">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block">Platform Commission</span>
                  <span className="text-base font-black text-rose-400 font-mono">
                    ₦{selectedPayout.platform_fees.toLocaleString()}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-850">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block">Net Payout</span>
                  <span className="text-base font-black text-emerald-400 font-mono">
                    ₦{selectedPayout.net_amount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Masked Bank Destination */}
              <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-850 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 font-bold flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-rose-500" /> Destination Nigerian Bank Account
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded">
                    CBN Verified
                  </span>
                </div>
                <div className="space-y-1 text-zinc-300">
                  <div>
                    <strong className="text-zinc-400">Financial Institution:</strong> {selectedPayout.bank_name}
                  </div>
                  <div>
                    <strong className="text-zinc-400">Account Name:</strong> {selectedPayout.account_name}
                  </div>
                  <div className="font-mono text-zinc-200 flex items-center gap-1.5">
                    <strong className="text-zinc-400">Account Number:</strong> {selectedPayout.account_number_masked}
                    <span className="text-[10px] text-zinc-500">(NDPR Masked)</span>
                  </div>
                </div>
              </div>

              {/* Hold Reason if on hold */}
              {selectedPayout.status === 'on_hold' && selectedPayout.hold_reason && (
                <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs space-y-1">
                  <strong className="block font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" /> Settlement Frozen (On Hold)
                  </strong>
                  <p className="text-[11px] text-rose-200">{selectedPayout.hold_reason}</p>
                </div>
              )}

              {/* Actions */}
              <div className="border-t border-zinc-900 pt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {selectedPayout.status === 'pending_approval' && (
                    <>
                      <button
                        disabled={isProcessing}
                        onClick={() => handleApprovePayout(selectedPayout.id)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isProcessing ? 'Authorizing...' : 'Authorize Disbursement'}</span>
                      </button>

                      <button
                        onClick={() => setHoldModalOpen(true)}
                        className="px-3.5 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Freeze / Hold Payout</span>
                      </button>
                    </>
                  )}

                  {selectedPayout.status === 'on_hold' && (
                    <button
                      onClick={() => handleReleaseHold(selectedPayout.id)}
                      className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Release Hold</span>
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setSelectedPayout(null)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Hold Modal */}
        {holdModalOpen && selectedPayout && (
          <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-zinc-950 border border-rose-800/60 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center gap-2.5 text-rose-400">
                <AlertTriangle className="w-6 h-6 flex-shrink-0" />
                <h3 className="font-bold text-base text-white">Freeze Settlement Disbursement</h3>
              </div>
              <p className="text-xs text-zinc-400">
                Holding payout <strong className="text-white font-mono">{selectedPayout.payout_reference}</strong> will
                suspend automated transfer execution. Provide justification for legal & compliance audits.
              </p>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-300 block">Compliance Reason for Hold</label>
                <textarea
                  rows={3}
                  value={holdReason}
                  onChange={(e) => setHoldReason(e.target.value)}
                  placeholder="e.g. Bank account name mismatch, organizer KYC review, or high chargeback velocity..."
                  className="w-full p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setHoldModalOpen(false)}
                  className="px-3 py-2 rounded-xl bg-zinc-900 text-zinc-300 text-xs font-bold hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  disabled={!holdReason.trim()}
                  onClick={handleApplyHold}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Confirm Hold
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
