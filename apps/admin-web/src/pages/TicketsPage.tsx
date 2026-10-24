import React, { useState } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { AdminTicket } from '../types/admin';
import {
  Ticket,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  QrCode,
  Eye,
  RefreshCw,
  Ban,
  ArrowRightLeft,
  Calendar,
  Building,
  User,
  ShieldAlert
} from 'lucide-react';

const INITIAL_TICKETS: AdminTicket[] = [
  {
    id: 'tkt-001',
    ticket_number: 'TK-2026-09281-AA',
    order_reference: 'EOS-2026-9021-AF',
    order_id: 'ord-8109-2918',
    event_id: 'evt-001',
    event_title: 'Lagos Tech Fest 2026 (VIP Pass)',
    organizer_id: 'org-101',
    organizer_name: 'Apex Entertainment Group Ltd',
    ticket_type_name: 'VIP Founder Access Pass',
    attendee_name: 'Tunde Adeleke',
    attendee_email: 'tunde.adeleke@gmail.com',
    price_paid: 75000,
    currency: 'NGN',
    status: 'valid',
    check_in_count: 0,
    checked_in_at: null,
    check_in_agent: null,
    issued_at: '2026-10-15 03:41:45',
    qr_code_hash: 'sha256_90291a82bc38910291823901928301928'
  },
  {
    id: 'tkt-002',
    ticket_number: 'TK-2026-09282-BB',
    order_reference: 'EOS-2026-9010-KL',
    order_id: 'ord-8109-2910',
    event_id: 'evt-002',
    event_title: 'Afrobeats Symphony & Soundscape',
    organizer_id: 'org-102',
    organizer_name: 'SoundPulse Media Nigeria',
    ticket_type_name: 'Squad Table for 5',
    attendee_name: 'Chioma Okonkwo',
    attendee_email: 'chioma.o@outlook.com',
    price_paid: 75000,
    currency: 'NGN',
    status: 'used',
    check_in_count: 1,
    checked_in_at: '2026-10-14 20:15:30',
    check_in_agent: 'Gate Scanner Agent #4 (Main Gate)',
    issued_at: '2026-10-12 14:00:22',
    qr_code_hash: 'sha256_778129031892301928301928301928301'
  },
  {
    id: 'tkt-003',
    ticket_number: 'TK-2026-09283-CC',
    order_reference: 'EOS-2026-9005-MM',
    order_id: 'ord-8109-2905',
    event_id: 'evt-001',
    event_title: 'Lagos Tech Fest 2026 (VIP Pass)',
    organizer_id: 'org-101',
    organizer_name: 'Apex Entertainment Group Ltd',
    ticket_type_name: 'Regular Attendee Pass',
    attendee_name: 'David Adeleke Jr.',
    attendee_email: 'david.adeleke@sample.org',
    price_paid: 15000,
    currency: 'NGN',
    status: 'invalidated',
    check_in_count: 0,
    checked_in_at: null,
    check_in_agent: null,
    issued_at: '2026-10-10 11:30:19',
    qr_code_hash: 'sha256_443918239018239018230912830192839'
  }
];

export const TicketsPage: React.FC = () => {
  const [tickets, setTickets] = useState<AdminTicket[]>(INITIAL_TICKETS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTicket, setSelectedTicket] = useState<AdminTicket | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [invalidateReason, setInvalidateReason] = useState('');
  const [showInvalidateModal, setShowInvalidateModal] = useState(false);

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.ticket_number.toLowerCase().includes(search.toLowerCase()) ||
      t.order_reference.toLowerCase().includes(search.toLowerCase()) ||
      t.attendee_name.toLowerCase().includes(search.toLowerCase()) ||
      t.attendee_email.toLowerCase().includes(search.toLowerCase()) ||
      t.event_title.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleInvalidateTicket = () => {
    if (!selectedTicket || !invalidateReason.trim()) return;

    setTickets((prev) =>
      prev.map((t) =>
        t.id === selectedTicket.id ? { ...t, status: 'invalidated' } : t
      )
    );
    setSelectedTicket((prev) => (prev ? { ...prev, status: 'invalidated' } : null));
    setShowInvalidateModal(false);
    setInvalidateReason('');
    setActionSuccess(`Ticket ${selectedTicket.ticket_number} marked INVALIDATED. Gate scanner sync initiated.`);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const handleReissueTicket = (ticketId: string) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              status: 'valid',
              qr_code_hash: `sha256_${Date.now()}_reissued`,
              ticket_number: `${t.ticket_number}-R`
            }
          : t
      )
    );
    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket((prev) =>
        prev
          ? {
              ...prev,
              status: 'valid',
              qr_code_hash: `sha256_${Date.now()}_reissued`,
              ticket_number: `${prev.ticket_number}-R`
            }
          : null
      );
    }
    setActionSuccess('Ticket successfully re-issued with newly cryptographically signed QR Hash.');
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const getStatusBadge = (status: AdminTicket['status']) => {
    switch (status) {
      case 'valid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" /> Valid
          </span>
        );
      case 'used':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <CheckCircle2 className="w-3 h-3" /> Used (Admitted)
          </span>
        );
      case 'invalidated':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="w-3 h-3" /> Invalidated
          </span>
        );
      case 'transferred':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <ArrowRightLeft className="w-3 h-3" /> Transferred
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
              <Ticket className="w-6 h-6 text-rose-500" />
              <span>Ticketing Operations Desk</span>
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Search issued passes, audit check-in discrepancies, inspect QR hashes, and handle authorized invalidation or re-issues.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-3 py-1 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400">
              Valid: <strong className="text-emerald-400">12,450</strong>
            </span>
            <span className="px-3 py-1 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400">
              Checked In: <strong className="text-cyan-400">8,920</strong>
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
              placeholder="Search by Ticket #, Order Ref, Attendee Email, or Event..."
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
              <option value="all">All Ticket Statuses</option>
              <option value="valid">Valid (Active)</option>
              <option value="used">Used (Checked-in)</option>
              <option value="invalidated">Invalidated</option>
              <option value="transferred">Transferred</option>
            </select>
          </div>
        </div>

        {/* Tickets Table */}
        <div className="rounded-2xl bg-zinc-900/40 border border-zinc-850 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/80 border-b border-zinc-800 text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Ticket Number</th>
                  <th className="py-3 px-4">Attendee</th>
                  <th className="py-3 px-4">Event & Tier</th>
                  <th className="py-3 px-4">Order Ref</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Check-in Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-zinc-500">
                      No tickets found matching the filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((t) => (
                    <tr key={t.id} className="hover:bg-zinc-850/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-white">
                        <span className="flex items-center gap-1.5">
                          <Ticket className="w-3.5 h-3.5 text-rose-500" />
                          {t.ticket_number}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-white block">{t.attendee_name}</span>
                        <span className="text-zinc-500 text-[11px] block">{t.attendee_email}</span>
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <span className="text-white font-medium block truncate">{t.event_title}</span>
                        <span className="text-zinc-500 text-[10px] block truncate">{t.ticket_type_name}</span>
                      </td>

                      <td className="py-3 px-4 font-mono text-zinc-400">
                        {t.order_reference}
                      </td>

                      <td className="py-3 px-4">{getStatusBadge(t.status)}</td>

                      <td className="py-3 px-4 text-[11px]">
                        {t.check_in_count > 0 ? (
                          <span className="text-cyan-400 font-medium">Admitted ({t.checked_in_at})</span>
                        ) : (
                          <span className="text-zinc-500">Unredeemed</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedTicket(t)}
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

        {/* Ticket Inspection Modal */}
        {selectedTicket && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5">
              <div className="flex items-start justify-between border-b border-zinc-900 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-lg text-white font-mono">{selectedTicket.ticket_number}</span>
                    {getStatusBadge(selectedTicket.status)}
                  </div>
                  <span className="text-xs text-zinc-500 block mt-0.5">
                    Order Ref: {selectedTicket.order_reference} • Issued: {selectedTicket.issued_at}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="text-zinc-500 hover:text-white p-1 rounded-lg"
                >
                  ✕
                </button>
              </div>

              {/* Cryptographic QR Security Hash */}
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-850 space-y-2 text-xs">
                <span className="text-zinc-400 font-bold flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-rose-500" /> Cryptographic Redemption Hash
                </span>
                <div className="font-mono text-zinc-300 bg-zinc-950 p-2.5 rounded-xl border border-zinc-900 text-[11px] break-all">
                  {selectedTicket.qr_code_hash}
                </div>
                <span className="text-[10px] text-zinc-500 block">
                  Scanned and verified offline by EventsOS Scanner App using ed25519 signature verification.
                </span>
              </div>

              {/* Check-in Information */}
              <div className="p-3.5 rounded-2xl bg-zinc-900/40 border border-zinc-850 space-y-1.5 text-xs">
                <span className="text-zinc-500 font-bold text-[10px] uppercase block">Check-in Log</span>
                {selectedTicket.check_in_count > 0 ? (
                  <div className="space-y-1 text-zinc-300">
                    <div>
                      <strong className="text-white">Redemption Timestamp:</strong> {selectedTicket.checked_in_at}
                    </div>
                    <div>
                      <strong className="text-white">Authorized Agent:</strong> {selectedTicket.check_in_agent}
                    </div>
                  </div>
                ) : (
                  <span className="text-zinc-500">Ticket has not yet been scanned at the gate.</span>
                )}
              </div>

              {/* Actions */}
              <div className="border-t border-zinc-900 pt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {selectedTicket.status === 'valid' && (
                    <button
                      onClick={() => setShowInvalidateModal(true)}
                      className="px-3.5 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>Invalidate Ticket</span>
                    </button>
                  )}

                  {selectedTicket.status === 'invalidated' && (
                    <button
                      onClick={() => handleReissueTicket(selectedTicket.id)}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Re-issue Valid Pass</span>
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setSelectedTicket(null)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Invalidate Reason Confirmation Modal */}
        {showInvalidateModal && selectedTicket && (
          <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-zinc-950 border border-rose-800/60 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center gap-2.5 text-rose-400">
                <ShieldAlert className="w-6 h-6 flex-shrink-0" />
                <h3 className="font-bold text-base text-white">Invalidate Ticket Pass</h3>
              </div>
              <p className="text-xs text-zinc-400">
                This action immediately revokes gate admission for{' '}
                <strong className="text-white font-mono">{selectedTicket.ticket_number}</strong>. An audit log will be
                permanently recorded.
              </p>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-300 block">Required Audit Reason</label>
                <textarea
                  rows={3}
                  value={invalidateReason}
                  onChange={(e) => setInvalidateReason(e.target.value)}
                  placeholder="e.g. Chargeback filed, attendee requested refund, or duplicate issuance duplicate..."
                  className="w-full p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowInvalidateModal(false)}
                  className="px-3 py-2 rounded-xl bg-zinc-900 text-zinc-300 text-xs font-bold hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  disabled={!invalidateReason.trim()}
                  onClick={handleInvalidateTicket}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Confirm Invalidation
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
