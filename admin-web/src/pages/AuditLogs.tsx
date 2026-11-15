import React, { useEffect, useState } from 'react';
import { 
  FileText, 
  Search, 
  ShieldAlert, 
  User, 
  Clock, 
  Terminal, 
  Filter, 
  RefreshCw,
  Layers,
  ChevronRight,
  X
} from 'lucide-react';
import { adminApi } from '../api/admin';
import { Pagination, type PaginationMeta } from '../components/Pagination';

export interface AuditLogItem {
  id: number;
  action: string;
  description: string;
  reason?: string | null;
  target_type: string;
  target_id: string;
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, any>;
  created_at: string;
  user?: {
    id: number;
    uuid: string;
    name: string;
    email: string;
    is_admin: boolean;
    admin_role?: string;
  } | null;
  organizer?: {
    id: number;
    uuid: string;
    name: string;
  } | null;
}

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [actionFilter, setActionFilter] = useState<string>('');
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  const fetchLogs = async (targetPage = page) => {
    setLoading(true);
    try {
      const res = await adminApi.getAuditLogs({
        search: search || undefined,
        action: actionFilter || undefined,
        page: targetPage,
      });

      const payload = res?.data || res;
      if (payload && Array.isArray(payload.data)) {
        setLogs(payload.data);
        const metaObj = payload.meta || payload;
        setPaginationMeta({
          current_page: metaObj.current_page || 1,
          last_page: metaObj.last_page || 1,
          per_page: metaObj.per_page || 15,
          total: metaObj.total || payload.data.length,
          from: metaObj.from,
          to: metaObj.to,
        });
      } else {
        setLogs(Array.isArray(payload) ? payload : []);
        setPaginationMeta(null);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchLogs(1);
  }, [actionFilter]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchLogs(newPage);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLogs(1);
  };

  const getActionBadgeColor = (action: string) => {
    if (action.includes('suspend') || action.includes('cancel') || action.includes('reject') || action.includes('delist')) {
      return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    }
    if (action.includes('approve') || action.includes('verified') || action.includes('unsuspend')) {
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    }
    if (action.includes('login') || action.includes('auth')) {
      return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
    }
    return 'bg-zinc-800 text-zinc-300 border-zinc-700';
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-850 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Terminal className="w-6 h-6 text-rose-500" />
            <span>Immutable Audit Logs</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Complete cryptographic audit trail of all governance mutations, KYC reviews, and platform overrides.
          </p>
        </div>

        <button
          onClick={() => fetchLogs()}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white rounded-xl transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-rose-400' : ''}`} />
          <span>Refresh Feed</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by action, description, IP, or administrator..."
            className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500/60"
          />
        </form>

        <div className="flex gap-2 w-full sm:w-auto">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-zinc-900/80 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-rose-500"
          >
            <option value="">All Actions</option>
            <option value="user.">User Operations</option>
            <option value="organizer.">Organizer Actions</option>
            <option value="event.">Event Moderation</option>
            <option value="payout.">Payout Approvals</option>
            <option value="verification.">KYC Verifications</option>
            <option value="feature_flag.">Feature Flags</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl overflow-hidden backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/80 text-zinc-400 uppercase text-[10px] font-mono border-b border-zinc-800/80">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50 text-zinc-300">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-zinc-500">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-[11px] font-mono">Streaming audit feed...</span>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-zinc-500">
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-[11px] text-zinc-400 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-mono uppercase font-bold border ${getActionBadgeColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {log.user ? (
                        <div>
                          <div className="font-bold text-white text-xs">{log.user.name || log.user.email}</div>
                          <div className="text-[10px] text-zinc-500 font-mono">
                            {log.user.admin_role || 'Admin'}
                          </div>
                        </div>
                      ) : (
                        <span className="text-zinc-500 font-mono text-[11px]">System Daemon</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-zinc-300" title={log.description}>
                      {log.description}
                      {log.reason && (
                        <div className="text-[11px] text-rose-400 italic font-mono mt-0.5">
                          Reason: {log.reason}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-zinc-400 whitespace-nowrap">
                      <span className="text-zinc-500">{log.target_type}:</span> {log.target_id ? log.target_id.substring(0, 10) + '...' : 'Global'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-zinc-500 whitespace-nowrap">
                      {log.ip_address || '127.0.0.1'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-[11px] font-semibold transition"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination meta={paginationMeta} onPageChange={handlePageChange} loading={loading} />
      </div>

      {/* Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Terminal className="w-4 h-4 text-rose-500" />
                <span>Audit Entry #{selectedLog.id} • {selectedLog.action}</span>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80">
                <span className="text-zinc-500 block text-[10px] uppercase">Actor Identity</span>
                <span className="text-white font-bold">{selectedLog.user?.name || selectedLog.user?.email || 'System'}</span>
                <span className="text-zinc-400 block text-[10px]">{selectedLog.user?.admin_role || 'Daemon'}</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80">
                <span className="text-zinc-500 block text-[10px] uppercase">IP / Client Origin</span>
                <span className="text-white font-bold">{selectedLog.ip_address || 'Internal Network'}</span>
                <span className="text-zinc-400 block text-[10px] truncate" title={selectedLog.user_agent}>
                  {selectedLog.user_agent || 'Unknown UA'}
                </span>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-zinc-400 block mb-1">Human Description</span>
              <p className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white">
                {selectedLog.description}
              </p>
            </div>

            {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
              <div>
                <span className="text-[11px] font-semibold text-zinc-400 block mb-1">Payload Metadata & State Diff</span>
                <pre className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-[11px] text-emerald-400 font-mono overflow-x-auto max-h-48">
                  {JSON.stringify(selectedLog.metadata, null, 2)}
                </pre>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-semibold"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

