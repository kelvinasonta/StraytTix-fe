import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Search, 
  ShieldCheck, 
  Ban, 
  CheckCircle2, 
  KeyRound, 
  MailCheck, 
  AlertTriangle 
} from 'lucide-react';
import { adminApi, type AdminUserItem } from '../../api/admin';

export const UsersGovernance: React.FC = () => {
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [search, setSearch] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [suspendModalUser, setSuspendModalUser] = useState<AdminUserItem | null>(null);
  const [suspendReason, setSuspendReason] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getUsers({ search, status: status || undefined });
      setUsers(data.data || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [status]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleSuspend = async () => {
    if (!suspendModalUser || !suspendReason) return;
    setActionLoading(true);
    try {
      await adminApi.suspendUser(suspendModalUser.uuid, suspendReason);
      setSuspendModalUser(null);
      setSuspendReason('');
      fetchUsers();
    } catch (err) {
      alert('Failed to suspend user.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnsuspend = async (user: AdminUserItem) => {
    if (!confirm(`Reactivate user "${user.first_name} ${user.last_name}"?`)) return;
    try {
      await adminApi.unsuspendUser(user.uuid);
      fetchUsers();
    } catch (err) {
      alert('Failed to reactivate user.');
    }
  };

  const handleRevokeSessions = async (user: AdminUserItem) => {
    if (!confirm(`Revoke all active sessions and access tokens for ${user.email}?`)) return;
    try {
      const res = await adminApi.revokeUserSessions(user.uuid);
      alert(res.message || 'Sessions revoked successfully.');
    } catch (err) {
      alert('Failed to revoke sessions.');
    }
  };

  const handleVerifyEmail = async (user: AdminUserItem) => {
    if (!confirm(`Manually mark email as verified for ${user.email}?`)) return;
    try {
      await adminApi.verifyUserEmail(user.uuid);
      fetchUsers();
    } catch (err) {
      alert('Failed to verify email.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-white">Global User Governance</h2>
        <p className="text-xs text-slate-400 mt-0.5">Audit identity accounts, revoke active security sessions, and moderate bad actors.</p>
      </div>

      {/* Search & Status Filters */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
        <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-80">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name, email or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
          </div>
          <button type="submit" className="px-3 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold hover:bg-slate-700">
            Search
          </button>
        </form>

        <div className="flex gap-2">
          {['', 'active', 'suspended'].map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-3 py-1.5 rounded-xl text-xs capitalize font-medium ${
                status === s ? 'bg-rose-600 text-white' : 'bg-slate-900 border border-slate-800 text-slate-400'
              }`}
            >
              {s || 'All Users'}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-mono">
            <tr>
              <th className="py-3 px-4">User</th>
              <th className="py-3 px-4">Account Type</th>
              <th className="py-3 px-4">Email Status</th>
              <th className="py-3 px-4">State</th>
              <th className="py-3 px-4 text-right">Security Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {users.map((u) => {
              const isSuspended = Boolean(u.suspended_at) || u.status === 'suspended';
              return (
                <tr key={u.uuid} className="hover:bg-slate-800/20">
                  <td className="py-3 px-4">
                    <div className="font-bold text-white flex items-center gap-2">
                      <span>{u.first_name} {u.last_name}</span>
                      {u.is_admin && (
                        <span className="bg-rose-950 text-rose-300 border border-rose-800/40 text-[9px] uppercase px-1.5 py-0.2 rounded font-bold">
                          {u.admin_role || 'ADMIN'}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">{u.email}</div>
                  </td>
                  <td className="py-3 px-4 capitalize font-mono text-slate-400">{u.account_type}</td>
                  <td className="py-3 px-4">
                    {u.email_verified_at ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                        <CheckCircle2 className="w-3 h-3" /> Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-400 font-semibold text-[11px]">
                        Unverified
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {isSuspended ? (
                      <span className="inline-flex items-center gap-1 text-rose-400 font-semibold text-[11px]">
                        <Ban className="w-3 h-3" /> Suspended
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                        <CheckCircle2 className="w-3 h-3" /> Active
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right space-x-1.5">
                    {!u.email_verified_at && (
                      <button
                        onClick={() => handleVerifyEmail(u)}
                        title="Manually verify email"
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-semibold"
                      >
                        <MailCheck className="w-3.5 h-3.5 inline mr-1" />
                        Verify
                      </button>
                    )}
                    <button
                      onClick={() => handleRevokeSessions(u)}
                      title="Revoke all active tokens"
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-semibold"
                    >
                      <KeyRound className="w-3.5 h-3.5 inline mr-1" />
                      Revoke
                    </button>
                    {isSuspended ? (
                      <button
                        onClick={() => handleUnsuspend(u)}
                        className="px-2.5 py-1 bg-emerald-950/60 border border-emerald-800/50 text-emerald-300 hover:bg-emerald-900 rounded-lg text-[11px] font-semibold"
                      >
                        Reactivate
                      </button>
                    ) : (
                      <button
                        onClick={() => setSuspendModalUser(u)}
                        className="px-2.5 py-1 bg-rose-950/60 border border-rose-800/50 text-rose-300 hover:bg-rose-900 rounded-lg text-[11px] font-semibold"
                      >
                        Suspend
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {users.length === 0 && !loading && (
              <tr>
                <td colSpan={5} className="text-center py-8 text-slate-500">
                  No users found matching query.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Suspend Confirmation Modal */}
      {suspendModalUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-2.5 text-rose-400 font-bold">
              <AlertTriangle className="w-5 h-5" />
              <span>Suspend User: {suspendModalUser.email}</span>
            </div>
            <p className="text-xs text-slate-400">
              Suspension immediately revokes all active auth sessions and blocks login across attendee and organizer interfaces.
            </p>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-300 font-semibold">Audit Suspension Reason</label>
              <textarea
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="State account abuse, fraud investigation or safety policy reason..."
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSuspendModalUser(null)}
                className="px-3 py-2 bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSuspend}
                disabled={actionLoading || !suspendReason}
                className="px-3 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold"
              >
                {actionLoading ? 'Suspending...' : 'Confirm Suspension'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

