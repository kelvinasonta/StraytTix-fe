import React, { useState } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import {
  Bell,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  Mail,
  Smartphone,
  Send,
  Eye,
  Radio,
  ExternalLink
} from 'lucide-react';

interface NotificationLog {
  id: string;
  channel: 'email' | 'sms' | 'push';
  recipient: string;
  recipient_name: string;
  template_type: 'ticket_issued' | 'kyc_approved' | 'payout_processed' | 'refund_approved' | 'order_confirmation' | 'security_alert';
  provider: 'Termii' | 'Resend' | 'Twilio' | 'FCM';
  status: 'delivered' | 'failed' | 'queued' | 'retrying';
  attempt_count: number;
  provider_reference?: string;
  error_message?: string;
  created_at: string;
  delivered_at?: string;
}

const INITIAL_LOGS: NotificationLog[] = [
  {
    id: 'notif-001',
    channel: 'sms',
    recipient: '+2348031234567',
    recipient_name: 'Tunde Adeleke',
    template_type: 'ticket_issued',
    provider: 'Termii',
    status: 'delivered',
    attempt_count: 1,
    provider_reference: 'termii_msg_901928310',
    created_at: '2026-10-15 03:41:48',
    delivered_at: '2026-10-15 03:41:52'
  },
  {
    id: 'notif-002',
    channel: 'email',
    recipient: 'chioma.o@outlook.com',
    recipient_name: 'Chioma Okonkwo',
    template_type: 'order_confirmation',
    provider: 'Resend',
    status: 'delivered',
    attempt_count: 1,
    provider_reference: 're_8901239012390',
    created_at: '2026-10-15 04:12:05',
    delivered_at: '2026-10-15 04:12:08'
  },
  {
    id: 'notif-003',
    channel: 'sms',
    recipient: '+2348024432190',
    recipient_name: 'Ibrahim Danladi',
    template_type: 'security_alert',
    provider: 'Termii',
    status: 'failed',
    attempt_count: 3,
    provider_reference: 'termii_err_4001',
    error_message: 'Telco Network Timeout (9mobile route unavailable)',
    created_at: '2026-10-15 04:55:12',
    delivered_at: undefined
  },
  {
    id: 'notif-004',
    channel: 'email',
    recipient: 'faith.amadi@gmail.com',
    recipient_name: 'Faith Amadi',
    template_type: 'refund_approved',
    provider: 'Resend',
    status: 'delivered',
    attempt_count: 1,
    provider_reference: 're_1120938102931',
    created_at: '2026-10-14 19:45:15',
    delivered_at: '2026-10-14 19:45:17'
  }
];

export const CommunicationsPage: React.FC = () => {
  const [logs, setLogs] = useState<NotificationLog[]>(INITIAL_LOGS);
  const [search, setSearch] = useState('');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<NotificationLog | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.recipient.toLowerCase().includes(search.toLowerCase()) ||
      log.recipient_name.toLowerCase().includes(search.toLowerCase()) ||
      log.template_type.toLowerCase().includes(search.toLowerCase()) ||
      (log.provider_reference && log.provider_reference.toLowerCase().includes(search.toLowerCase()));

    const matchesChannel = channelFilter === 'all' || log.channel === channelFilter;
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;

    return matchesSearch && matchesChannel && matchesStatus;
  });

  const handleRetryNotification = (id: string) => {
    setIsRetrying(true);
    setTimeout(() => {
      setLogs((prev) =>
        prev.map((log) =>
          log.id === id
            ? {
                ...log,
                status: 'delivered',
                attempt_count: log.attempt_count + 1,
                error_message: undefined,
                delivered_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
              }
            : log
        )
      );
      if (selectedLog && selectedLog.id === id) {
        setSelectedLog((prev) =>
          prev
            ? {
                ...prev,
                status: 'delivered',
                attempt_count: prev.attempt_count + 1,
                error_message: undefined,
                delivered_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
              }
            : null
        );
      }
      setIsRetrying(false);
      setActionNotice('Failed dispatch retried via secondary failover gateway and delivered.');
      setTimeout(() => setActionNotice(null), 4000);
    }, 700);
  };

  const getStatusBadge = (status: NotificationLog['status']) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" /> Delivered
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="w-3 h-3" /> Failed
          </span>
        );
      case 'retrying':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <RefreshCw className="w-3 h-3 animate-spin" /> Retrying
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Clock className="w-3 h-3" /> Queued
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
              <Mail className="w-6 h-6 text-rose-500" />
              <span>Communications & Notification Relays</span>
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Audit transactional emails and SMS dispatches, track telco DND failures, and execute safe secondary route retries.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-3 py-1 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400">
              SMS Delivery Rate: <strong className="text-emerald-400">98.8%</strong>
            </span>
            <span className="px-3 py-1 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400">
              Email Rate: <strong className="text-emerald-400">99.9%</strong>
            </span>
          </div>
        </div>

        {actionNotice && (
          <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{actionNotice}</span>
            </div>
            <button onClick={() => setActionNotice(null)} className="text-emerald-400 hover:text-white">✕</button>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by recipient phone, email, template, or provider reference..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-900/60 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-rose-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-zinc-500" />
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="bg-zinc-900/60 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-hidden focus:border-rose-500"
            >
              <option value="all">All Channels</option>
              <option value="sms">SMS (Termii)</option>
              <option value="email">Email (Resend)</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-zinc-900/60 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-hidden focus:border-rose-500"
            >
              <option value="all">All Statuses</option>
              <option value="delivered">Delivered</option>
              <option value="failed">Failed</option>
              <option value="queued">Queued</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl bg-zinc-900/40 border border-zinc-850 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/80 border-b border-zinc-800 text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Channel & Type</th>
                  <th className="py-3 px-4">Recipient</th>
                  <th className="py-3 px-4">Provider Ref</th>
                  <th className="py-3 px-4">Attempts</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-zinc-500">
                      No communications found matching filter.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-zinc-850/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {log.channel === 'sms' ? (
                            <Smartphone className="w-4 h-4 text-cyan-400" />
                          ) : (
                            <Mail className="w-4 h-4 text-rose-400" />
                          )}
                          <div>
                            <span className="font-bold text-white block capitalize font-mono text-[11px]">
                              {log.template_type.replace('_', ' ')}
                            </span>
                            <span className="text-[10px] text-zinc-500 uppercase">{log.provider}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-white block">{log.recipient_name}</span>
                        <span className="text-zinc-500 font-mono text-[11px] block">{log.recipient}</span>
                      </td>

                      <td className="py-3 px-4 font-mono text-zinc-400 text-[11px]">
                        {log.provider_reference || 'Pending'}
                      </td>

                      <td className="py-3 px-4 font-mono">{log.attempt_count}</td>

                      <td className="py-3 px-4">{getStatusBadge(log.status)}</td>

                      <td className="py-3 px-4 font-mono text-[11px] text-zinc-500">{log.created_at}</td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedLog(log)}
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
        {selectedLog && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-start justify-between border-b border-zinc-900 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-lg text-white font-mono uppercase">
                      {selectedLog.template_type.replace('_', ' ')}
                    </span>
                    {getStatusBadge(selectedLog.status)}
                  </div>
                  <span className="text-xs text-zinc-500 block mt-0.5">
                    Provider: {selectedLog.provider} • ID: {selectedLog.id}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-zinc-500 hover:text-white p-1 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-900/50 border border-zinc-850 space-y-1.5 text-xs">
                <div>
                  <strong className="text-zinc-400">Recipient:</strong> {selectedLog.recipient_name} ({selectedLog.recipient})
                </div>
                <div>
                  <strong className="text-zinc-400">Provider Reference:</strong>{' '}
                  <span className="font-mono text-zinc-200">{selectedLog.provider_reference}</span>
                </div>
                <div>
                  <strong className="text-zinc-400">Dispatched:</strong> {selectedLog.created_at}
                </div>
                {selectedLog.delivered_at && (
                  <div>
                    <strong className="text-zinc-400">Delivered:</strong> {selectedLog.delivered_at}
                  </div>
                )}
                {selectedLog.error_message && (
                  <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 mt-2">
                    <strong className="block text-rose-400 font-bold">Failure Diagnostics:</strong>
                    {selectedLog.error_message}
                  </div>
                )}
              </div>

              <div className="border-t border-zinc-900 pt-4 flex items-center justify-between">
                <div>
                  {selectedLog.status === 'failed' && (
                    <button
                      disabled={isRetrying}
                      onClick={() => handleRetryNotification(selectedLog.id)}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
                      <span>{isRetrying ? 'Retrying via Secondary Route...' : 'Retry Dispatch'}</span>
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
