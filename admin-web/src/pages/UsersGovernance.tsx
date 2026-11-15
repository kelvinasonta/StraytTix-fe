import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Search, 
  ShieldCheck, 
  Ban, 
  CheckCircle2, 
  KeyRound, 
  MailCheck, 
  AlertTriangle,
  User,
  Building2,
  Shield,
  Ticket,
  ExternalLink,
  RefreshCw,
  X
} from 'lucide-react';
import { adminApi, type AdminUserItem } from '../api/admin';
import { Pagination, type PaginationMeta } from '../components/Pagination';

export const UsersGovernance: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [category, setCategory] = useState<string>(''); // '' = all, 'attendee', 'organizer', 'admin'
  const [loading, setLoading] = useState<boolean>(true);
  const [suspendModalUser, setSuspendModalUser] = useState<any | null>(null);
  const [suspendReason, setSuspendReason] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [selectedUserDetails, setSelectedUserDetails] = useState<any | null>(null);
  const [detailsLoading, setDetailsLoading] = useState<boolean>(false);

  const fetchUsers = async (targetPage = page) => {
    setLoading(true);
    try {
      const data = await adminApi.getUsers({ 
        search: search || undefined, 
        status: status || undefined,
        category: category || undefined,
        page: targetPage,
      });

      if (data && data.data && Array.isArray(data.data)) {
        setUsers(data.data);
        setPaginationMeta({
          current_page: data.current_page || 1,
          last_page: data.last_page || 1,
          per_page: data.per_page || 15,
          total: data.total || data.data.length,
          from: data.from,
          to: data.to,
        });
      } else {
        setUsers(Array.isArray(data) ? data : []);
        setPaginationMeta(null);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchUsers(1);
  }, [status, category]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchUsers(newPage);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers(1);
  };

  const handleOpenDetails = async (u: any) => {
    setSelectedUserDetails(u);
    setDetailsLoading(true);
    try {
      const data = await adminApi.getUserDetails(u.uuid);
      setSelectedUserDetails(data);
    } catch (err) {
      console.error('Failed to load user details:', err);
    } finally {
      setDetailsLoading(false);
    }
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

  const handleUnsuspend = async (user: any) => {
    if (!confirm(`Reactivate user account "${user.first_name} ${user.last_name}"?`)) return;
    try {
      await adminApi.unsuspendUser(user.uuid);
      fetchUsers();
    } catch (err) {
      alert('Failed to reactivate user.');
    }
  };

  const handleRevokeSessions = async (user: any) => {
    if (!confirm(`Force-revoke all active sessions and access tokens for ${user.email}?`)) return;
    try {
      const res = await adminApi.revokeUserSessions(user.uuid);
      alert(res.message || 'Sessions revoked successfully.');
    } catch (err) {
      alert('Failed to revoke sessions.');
    }
  };

  const handleVerifyEmail = async (user: any) => {
    if (!confirm(`Manually mark email as verified for ${user.email}?`)) return;
    try {
      await adminApi.verifyUserEmail(user.uuid);
      fetchUsers();
    } catch (err) {
      alert('Failed to verify email.');
    }
  };

  const getAccountTypeBadge = (u: any) => {
    if (u.is_admin || u.admin_role) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold">
          <Shield className="w-3 h-3" />
          <span>Admin ({u.admin_role || 'Staff'})</span>
        </span>
      );
    }
    if ((u.organizers && u.organizers.length > 0) || u.account_type === 'organizer') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold">
          <Building2 className="w-3 h-3" />
          <span>Organizer Entity</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-zinc-800 text-zinc-300 border border-zinc-700 font-semibold">
        <User className="w-3 h-3 text-zinc-400" />
        <span>Attendee</span>
      </span>
    );
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-850 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Users className="w-6 h-6 text-rose-500" />
            <span>User Identity & Categorized Governance</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Segmented user directory across Attendees, Organizers, and Administrators with session revocation and security controls.
          </p>
        </div>

        <button
          onClick={() => fetchUsers()}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white rounded-xl transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-rose-400' : ''}`} />
          <span>Refresh Directory</span>
        </button>
      </div>

      {/* Segmented Category Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {[
            { label: 'All Users', val: '', icon: Users },
            { label: 'Attendees', val: 'attendee', icon: User },
            { label: 'Organizers & Staff', val: 'organizer', icon: Building2 },
            { label: 'Administrators', val: 'admin', icon: Shield },
          ].map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.val}
                onClick={() => setCategory(cat.val)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition border ${
                  category === cat.val
                    ? 'bg-rose-500/15 text-rose-400 border-rose-500/30 shadow-sm'
                    : 'bg-zinc-900/60 text-zinc-400 border-zinc-800/80 hover:text-white hover:bg-zinc-800/40'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Status Filter */}
        <div className="flex gap-1.5">
          {[
            { label: 'All Statuses', val: '' },
            { label: 'Active', val: 'active' },
            { label: 'Suspended', val: 'suspended' },
          ].map((s) => (
            <button
              key={s.val}
              onClick={() => setStatus(s.val)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono uppercase font-bold transition border ${
                status === s.val
                  ? 'bg-zinc-800 text-white border-zinc-700'
                  : 'bg-zinc-950 text-zinc-500 border-zinc-850 hover:text-zinc-300'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative w-full max-w-md">
        <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by first name, last name, email or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500/60"
        />
      </form>

      {/* Users Table */}
      <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl overflow-hidden backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/80 text-zinc-400 uppercase text-[10px] font-mono border-b border-zinc-800/80">
              <tr>
                <th className="py-3 px-4">User Identity</th>
                <th className="py-3 px-4">Role Classification</th>
                <th className="py-3 px-4">Associated Entity / Tickets</th>
                <th className="py-3 px-4">Account State</th>
                <th className="py-3 px-4">Joined Date</th>
                <th className="py-3 px-4 text-right">Security Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50 text-zinc-300">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-zinc-500">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-[11px] font-mono">Querying categorized directory...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-zinc-500">
                    No accounts found matching your selected criteria.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isSuspended = u.status === 'suspended' || Boolean(u.suspended_at);
                  return (
                    <tr key={u.uuid} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white text-xs">
                          {u.first_name} {u.last_name}
                        </div>
                        <div className="text-[11px] text-zinc-500 font-mono mt-0.5">{u.email}</div>
                        {u.phone && <div className="text-[10px] text-zinc-600 font-mono">{u.phone}</div>}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getAccountTypeBadge(u)}
                      </td>
                      <td className="py-3.5 px-4 text-zinc-400">
                        {u.organizers && u.organizers.length > 0 ? (
                          <div className="space-y-0.5">
                            {u.organizers.map((org: any) => (
                              <span key={org.id} className="inline-block px-2 py-0.5 rounded bg-zinc-800/80 text-zinc-300 font-mono text-[10px] mr-1">
                                {org.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="font-mono text-[11px] text-zinc-500">
                            {u.tickets_count !== undefined ? `${u.tickets_count} Tickets Purchased` : 'Direct Attendee'}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isSuspended ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold">
                            <Ban className="w-3 h-3" />
                            <span>Suspended</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Active</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-zinc-400 whitespace-nowrap">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-1.5">
                        <button
                          onClick={() => handleOpenDetails(u)}
                          className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-[11px] font-semibold transition"
                        >
                          Profile
                        </button>
                        {!u.email_verified_at && (
                          <button
                            onClick={() => handleVerifyEmail(u)}
                            title="Manually mark email verified"
                            className="px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white rounded-lg text-[11px] font-semibold transition"
                          >
                            <MailCheck className="w-3.5 h-3.5 inline mr-1" />
                            Verify
                          </button>
                        )}
                        <button
                          onClick={() => handleRevokeSessions(u)}
                          title="Revoke all active tokens"
                          className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-[11px] font-semibold transition"
                        >
                          <KeyRound className="w-3.5 h-3.5 inline mr-1" />
                          Revoke
                        </button>
                        {isSuspended ? (
                          <button
                            onClick={() => handleUnsuspend(u)}
                            className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-lg text-[11px] font-semibold transition"
                          >
                            Reactivate
                          </button>
                        ) : (
                          <button
                            onClick={() => setSuspendModalUser(u)}
                            className="px-2.5 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white rounded-lg text-[11px] font-semibold transition"
                          >
                            Suspend
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <Pagination meta={paginationMeta} onPageChange={handlePageChange} loading={loading} />
      </div>

      {/* Deep-Dive User Profile Modal */}
      {selectedUserDetails && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-rose-500" />
                  <span>
                    {selectedUserDetails.user?.first_name || selectedUserDetails.first_name}{' '}
                    {selectedUserDetails.user?.last_name || selectedUserDetails.last_name}
                  </span>
                </h3>
                <span className="text-xs text-zinc-500 font-mono">
                  UUID: {selectedUserDetails.user?.uuid || selectedUserDetails.uuid}
                </span>
              </div>
              <button onClick={() => setSelectedUserDetails(null)} className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            {detailsLoading ? (
              <div className="py-12 text-center text-xs text-zinc-400">Loading user profile dossier...</div>
            ) : (
              <div className="space-y-5 text-xs">
                {/* Security metrics */}
                <div className="grid grid-cols-3 gap-3 font-mono">
                  <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl">
                    <span className="text-zinc-500 text-[10px] uppercase block">Active Sessions</span>
                    <span className="text-base font-bold text-white mt-1 block">
                      {selectedUserDetails.active_sessions_count || 0} Devices
                    </span>
                  </div>
                  <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl">
                    <span className="text-zinc-500 text-[10px] uppercase block">Email Status</span>
                    <span className="text-base font-bold text-emerald-400 mt-1 block">
                      {selectedUserDetails.user?.email_verified_at ? 'Verified' : 'Unverified'}
                    </span>
                  </div>
                  <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl">
                    <span className="text-zinc-500 text-[10px] uppercase block">Account Role</span>
                    <span className="text-base font-bold text-indigo-400 mt-1 block">
                      {selectedUserDetails.user?.admin_role || selectedUserDetails.user?.role || 'Attendee'}
                    </span>
                  </div>
                </div>

                {/* Organization Memberships */}
                {selectedUserDetails.memberships && selectedUserDetails.memberships.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-white uppercase text-[11px] tracking-wider mb-2 font-mono">
                      Associated Organizer Entities
                    </h4>
                    <div className="bg-zinc-950 border border-zinc-800 rounded-xl divide-y divide-zinc-800/60">
                      {selectedUserDetails.memberships.map((m: any) => (
                        <div key={m.id} className="p-3 flex items-center justify-between">
                          <div>
                            <p className="font-bold text-white text-xs">{m.organizer?.name}</p>
                            <p className="text-[11px] text-zinc-500 font-mono">/{m.organizer?.slug}</p>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-zinc-800 text-zinc-300 font-bold">
                            {m.role || 'Member'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Ticket Orders */}
                {selectedUserDetails.recent_tickets && selectedUserDetails.recent_tickets.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-white uppercase text-[11px] tracking-wider mb-2 font-mono">
                      Recent Ticket Bookings
                    </h4>
                    <div className="bg-zinc-950 border border-zinc-800 rounded-xl divide-y divide-zinc-800/60 max-h-48 overflow-y-auto">
                      {selectedUserDetails.recent_tickets.map((t: any) => (
                        <div key={t.id} className="p-3 flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-white text-xs">{t.event?.title || 'Event Ticket'}</p>
                            <p className="text-[10px] text-zinc-500 font-mono">Tier: {t.ticketType?.name || 'Standard'}</p>
                          </div>
                          <span className="font-mono text-emerald-400 font-bold text-xs">
                            ${t.price_paid || 0}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedUserDetails(null)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-semibold"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suspend Confirmation Modal */}
      {suspendModalUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2.5 text-rose-400 font-bold">
              <AlertTriangle className="w-5 h-5" />
              <span>Suspend User: {suspendModalUser.email}</span>
            </div>
            <p className="text-xs text-zinc-400">
              Suspension immediately revokes all active auth tokens and prevents login across all consumer and organizer portals.
            </p>

            <div className="space-y-1">
              <label className="text-[11px] text-zinc-300 font-semibold">Audit Suspension Reason</label>
              <textarea
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="State account abuse, chargeback dispute, or platform violation..."
                rows={3}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSuspendModalUser(null)}
                className="px-3 py-2 bg-zinc-800 text-zinc-300 hover:text-white rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSuspend}
                disabled={actionLoading || !suspendReason}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold"
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
