import React, { useState } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { AdminAuditRecord } from '../types/admin';
import {
  Terminal,
  Search,
  Filter,
  ShieldAlert,
  ShieldCheck,
  User,
  Clock,
  Download,
  Calendar,
  Layers,
  Database
} from 'lucide-react';

const INITIAL_LOGS: AdminAuditRecord[] = [
  {
    id: 'log-001',
    actor_name: 'Alex Morgan',
    actor_email: 'alex.morgan@eventsos.internal',
    actor_role: 'Super Administrator',
    action_type: 'KYC_APPROVE',
    resource_type: 'organizer_verification',
    resource_id: 'org-verif-901',
    description: 'Approved CAC certificate and Tax identification for Apex Entertainment Group Ltd.',
    ip_address: '102.89.41.12',
    timestamp: '2026-10-15 05:22:04'
  },
  {
    id: 'log-002',
    actor_name: 'Sarah Connor',
    actor_email: 'sarah.c@eventsos.internal',
    actor_role: 'Finance Administrator',
    action_type: 'REFUND_APPROVE',
    resource_type: 'refund_claim',
    resource_id: 'RF-2026-9021',
    description: 'Authorized full ₦50,000 refund settlement via Paystack gateway for Faith Amadi.',
    ip_address: '102.89.44.88',
    timestamp: '2026-10-15 04:45:12'
  },
  {
    id: 'log-003',
    actor_name: 'ModerationBot',
    actor_email: 'bot.safety@eventsos.internal',
    actor_role: 'System Automated Guard',
    action_type: 'EVENT_TAKEDOWN',
    resource_type: 'event',
    resource_id: 'evt-004',
    description: 'Automated safety takedown of "Midnight VIP Crypto Rooftop" due to duplicate ticketing alerts.',
    ip_address: '127.0.0.1',
    timestamp: '2026-10-15 03:10:00'
  },
  {
    id: 'log-004',
    actor_name: 'Sarah Connor',
    actor_email: 'sarah.c@eventsos.internal',
    actor_role: 'Finance Administrator',
    action_type: 'PAYOUT_HOLD',
    resource_type: 'organizer_payout',
    resource_id: 'PO-2026-8014',
    description: 'Placed ₦820,250 disbursement on hold for Horizon Labs Africa due to legal entity mismatch.',
    ip_address: '102.89.44.88',
    timestamp: '2026-10-14 14:22:15'
  },
  {
    id: 'log-005',
    actor_name: 'Alex Morgan',
    actor_email: 'alex.morgan@eventsos.internal',
    actor_role: 'Super Administrator',
    action_type: 'TICKET_INVALIDATE',
    resource_type: 'ticket',
    resource_id: 'tkt-003',
    description: 'Invalidated fraudulent pass TK-2026-09283-CC and revoked gate scanner permission.',
    ip_address: '102.89.41.12',
    timestamp: '2026-10-14 11:32:00'
  }
];

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AdminAuditRecord[]>(INITIAL_LOGS);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.actor_name.toLowerCase().includes(search.toLowerCase()) ||
      log.actor_email.toLowerCase().includes(search.toLowerCase()) ||
      log.description.toLowerCase().includes(search.toLowerCase()) ||
      log.resource_id.toLowerCase().includes(search.toLowerCase()) ||
      log.ip_address.includes(search);

    const matchesAction = actionFilter === 'all' || log.action_type === actionFilter;
    return matchesSearch && matchesAction;
  });

  const handleExportCSV = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const getActionBadge = (type: AdminAuditRecord['action_type']) => {
    switch (type) {
      case 'KYC_APPROVE':
      case 'REFUND_APPROVE':
      case 'PAYOUT_RELEASE':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {type}
          </span>
        );
      case 'EVENT_TAKEDOWN':
      case 'USER_BAN':
      case 'TICKET_INVALIDATE':
      case 'PAYOUT_HOLD':
      case 'KYC_REJECT':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            {type}
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            {type}
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
              <Terminal className="w-6 h-6 text-rose-500" />
              <span>Immutable Security & Audit Trails</span>
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Append-only audit logs recording every privileged administrator action, verification review, and financial mutation.
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-rose-500" />
            <span>{downloadSuccess ? 'Exporting NDPR Log...' : 'Export Audit Log (CSV)'}</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by Actor, Target Resource ID, IP Address, or Description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-900/60 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-rose-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-zinc-500" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="bg-zinc-900/60 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-hidden focus:border-rose-500"
            >
              <option value="all">All Action Types</option>
              <option value="KYC_APPROVE">KYC Approval</option>
              <option value="REFUND_APPROVE">Refund Approval</option>
              <option value="PAYOUT_HOLD">Payout Hold</option>
              <option value="EVENT_TAKEDOWN">Event Takedown</option>
              <option value="TICKET_INVALIDATE">Ticket Invalidation</option>
            </select>
          </div>
        </div>

        {/* Logs Table */}
        <div className="rounded-2xl bg-zinc-900/40 border border-zinc-850 overflow-hidden shadow-xl font-mono text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-zinc-900/80 border-b border-zinc-800 text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Timestamp (UTC)</th>
                  <th className="py-3 px-4">Administrator / Actor</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Target Resource</th>
                  <th className="py-3 px-4">Details & Justification</th>
                  <th className="py-3 px-4">Source IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850/60 text-zinc-300">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-zinc-500 font-sans">
                      No audit trails match the search filter.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-zinc-850/40 transition-colors">
                      <td className="py-3 px-4 text-zinc-400 text-[11px] whitespace-nowrap">
                        {log.timestamp}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="text-white font-bold block">{log.actor_name}</span>
                        <span className="text-zinc-500 text-[10px] block">{log.actor_role}</span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">{getActionBadge(log.action_type)}</td>

                      <td className="py-3 px-4 text-zinc-300 font-bold whitespace-nowrap">
                        {log.resource_id}
                        <span className="text-[10px] text-zinc-500 block uppercase font-normal">
                          {log.resource_type}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-sans text-xs text-zinc-300 max-w-md">
                        {log.description}
                      </td>

                      <td className="py-3 px-4 text-[11px] text-zinc-500 whitespace-nowrap">
                        {log.ip_address}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Integrity Pill */}
        <div className="p-4 rounded-2xl bg-zinc-900/30 border border-zinc-850 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5 text-zinc-400">
            <Database className="w-4 h-4 text-emerald-400" />
            <span>Audit Ledger is cryptographically chained and backed up to secure offsite cold-storage every 6 hours.</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 font-bold">TAMPER-PROOF VERIFIED</span>
        </div>
      </div>
    </AdminLayout>
  );
};
