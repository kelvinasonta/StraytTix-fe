import React, { useEffect, useState } from 'react';
import { 
  Building2, 
  Search, 
  ShieldAlert, 
  ShieldCheck, 
  CheckCircle2, 
  Ban, 
  AlertTriangle,
  Users,
  ChevronDown,
  ChevronUp,
  User,
  ExternalLink,
  RefreshCw,
  X
} from 'lucide-react';
import { adminApi, type AdminOrganizerItem } from '../api/admin';
import { Pagination, type PaginationMeta } from '../components/Pagination';

export const OrganizersList: React.FC = () => {
  const [organizers, setOrganizers] = useState<any[]>([]);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedOrgUuid, setExpandedOrgUuid] = useState<string | null>(null);
  const [selectedOrg, setSelectedOrg] = useState<any | null>(null);
  const [dossier, setDossier] = useState<any | null>(null);
  const [dossierLoading, setDossierLoading] = useState<boolean>(false);
  const [suspendModalOrg, setSuspendModalOrg] = useState<any | null>(null);
  const [suspendReason, setSuspendReason] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const fetchOrganizers = async (targetPage = page) => {
    setLoading(true);
    try {
      const data = await adminApi.getOrganizers({ 
        search: search || undefined, 
        status: status || undefined,
        page: targetPage,
      });

      if (data && data.data && Array.isArray(data.data)) {
        setOrganizers(data.data);
        setPaginationMeta({
          current_page: data.current_page || 1,
          last_page: data.last_page || 1,
          per_page: data.per_page || 15,
          total: data.total || data.data.length,
          from: data.from,
          to: data.to,
        });
      } else {
        setOrganizers(Array.isArray(data) ? data : []);
        setPaginationMeta(null);
      }
    } catch (err) {
      console.error('Failed to load organizers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchOrganizers(1);
  }, [status]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchOrganizers(newPage);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchOrganizers(1);
  };

  const openDossier = async (org: any) => {
    setSelectedOrg(org);
    setDossierLoading(true);
    try {
      const data = await adminApi.getOrganizerDossier(org.uuid);
      setDossier(data);
    } catch (err) {
      console.error('Failed to load dossier:', err);
    } finally {
      setDossierLoading(false);
    }
  };

  const handleSuspend = async () => {
    if (!suspendModalOrg || !suspendReason) return;
    setActionLoading(true);
    try {
      await adminApi.suspendOrganizer(suspendModalOrg.uuid, suspendReason);
      setSuspendModalOrg(null);
      setSuspendReason('');
      fetchOrganizers();
    } catch (err) {
      alert('Failed to suspend organizer.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnsuspend = async (org: any) => {
    if (!confirm(`Reactivate organizer "${org.name}"?`)) return;
    try {
      await adminApi.unsuspendOrganizer(org.uuid);
      fetchOrganizers();
    } catch (err) {
      alert('Failed to reactivate organizer.');
    }
  };

  const toggleExpand = (uuid: string) => {
    setExpandedOrgUuid(expandedOrgUuid === uuid ? null : uuid);
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-850 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-rose-500" />
            <span>Tenant & Organization Governance</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Directory of all registered organizer entities, member rosters, corporate KYC compliance, and audit dossiers.
          </p>
        </div>

        <button
          onClick={() => fetchOrganizers()}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white rounded-xl transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-rose-400' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
        <form onSubmit={handleSearch} className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by organization name, slug, or owner email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500/60"
          />
        </form>

        <div className="flex gap-1.5">
          {[
            { label: 'All Organizers', val: '' },
            { label: 'Active', val: 'active' },
            { label: 'Suspended', val: 'suspended' },
          ].map((s) => (
            <button
              key={s.val}
              onClick={() => setStatus(s.val)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono uppercase font-bold transition border ${
                status === s.val
                  ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                  : 'bg-zinc-900/60 text-zinc-500 border-zinc-800/80 hover:text-zinc-300'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Organizers Table */}
      <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl overflow-hidden backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/80 text-zinc-400 uppercase text-[10px] font-mono border-b border-zinc-800/80">
              <tr>
                <th className="py-3 px-4 w-10"></th>
                <th className="py-3 px-4">Organization Tenant</th>
                <th className="py-3 px-4">Owner / Contact</th>
                <th className="py-3 px-4">Members</th>
                <th className="py-3 px-4">KYC Compliance</th>
                <th className="py-3 px-4">State</th>
                <th className="py-3 px-4">Events</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50 text-zinc-300">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-zinc-500">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-[11px] font-mono">Loading organization ecosystem...</span>
                    </div>
                  </td>
                </tr>
              ) : organizers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-zinc-500">
                    No organizations found matching search criteria.
                  </td>
                </tr>
              ) : (
                organizers.map((org) => {
                  const isSuspended = !org.is_active || Boolean(org.suspended_at);
                  const isExpanded = expandedOrgUuid === org.uuid;
                  const membersCount = org.members?.length || 0;

                  return (
                    <React.Fragment key={org.uuid}>
                      <tr className="hover:bg-zinc-800/30 transition-colors">
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => toggleExpand(org.uuid)}
                            className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-white transition"
                            title="Inspect Organization Members"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4 text-rose-400" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white text-xs">{org.name}</div>
                          <div className="text-[11px] text-zinc-500 font-mono mt-0.5">/{org.slug}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="text-white text-xs">
                            {org.user ? `${org.user.first_name} ${org.user.last_name}` : 'N/A'}
                          </div>
                          <div className="text-[11px] text-zinc-500 font-mono mt-0.5">{org.email || org.user?.email}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => toggleExpand(org.uuid)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white text-[11px] font-mono transition"
                          >
                            <Users className="w-3.5 h-3.5 text-zinc-400" />
                            <span>{membersCount} Member{membersCount === 1 ? '' : 's'}</span>
                          </button>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold border ${
                              org.verification_status === 'verified'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : org.verification_status === 'pending'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                            }`}
                          >
                            {org.verification_status === 'verified' && <ShieldCheck className="w-3 h-3" />}
                            <span>{org.verification_status}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {isSuspended ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold">
                              <Ban className="w-3 h-3" /> Suspended
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                              <CheckCircle2 className="w-3 h-3" /> Active
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-zinc-300">
                          {org.events_count || 0}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-1.5">
                          <button
                            onClick={() => openDossier(org)}
                            className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-[11px] font-semibold transition"
                          >
                            Dossier
                          </button>
                          {isSuspended ? (
                            <button
                              onClick={() => handleUnsuspend(org)}
                              className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-lg text-[11px] font-semibold transition"
                            >
                              Reactivate
                            </button>
                          ) : (
                            <button
                              onClick={() => setSuspendModalOrg(org)}
                              className="px-2.5 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white rounded-lg text-[11px] font-semibold transition"
                            >
                              Suspend
                            </button>
                          )}
                        </td>
                      </tr>

                      {/* Accordion: Organization Members Sub-Table */}
                      {isExpanded && (
                        <tr className="bg-zinc-950/80 border-y border-zinc-800">
                          <td colSpan={8} className="p-5 pl-14">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                                  <Users className="w-4 h-4 text-rose-500" />
                                  <span>Active Organization Members ({org.name})</span>
                                </h4>
                                <span className="text-[11px] text-zinc-500 font-mono">Role-based access control</span>
                              </div>

                              {org.members && org.members.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                  {org.members.map((member: any) => (
                                    <div
                                      key={member.id}
                                      className="p-3 bg-zinc-900 border border-zinc-800/80 rounded-xl flex items-center justify-between"
                                    >
                                      <div className="min-w-0 pr-2">
                                        <p className="font-semibold text-white text-xs truncate">
                                          {member.user?.first_name} {member.user?.last_name}
                                        </p>
                                        <p className="text-[10px] text-zinc-500 font-mono truncate">{member.user?.email}</p>
                                      </div>
                                      <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-zinc-800 text-zinc-300 font-bold border border-zinc-700">
                                        {member.role || 'Member'}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-850 text-center text-xs text-zinc-500">
                                  No additional team members invited to this organization yet.
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <Pagination meta={paginationMeta} onPageChange={handlePageChange} loading={loading} />
      </div>

      {/* Dossier Drawer / Modal */}
      {selectedOrg && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-rose-500" />
                  <span>{selectedOrg.name}</span>
                </h3>
                <span className="text-xs text-zinc-500 font-mono">UUID: {selectedOrg.uuid}</span>
              </div>
              <button onClick={() => setSelectedOrg(null)} className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            {dossierLoading ? (
              <div className="py-12 text-center text-xs text-zinc-400">Loading comprehensive dossier...</div>
            ) : (
              <div className="space-y-6 text-xs">
                {/* Financial overview */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                  <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                    <span className="text-zinc-500 text-[10px] uppercase">ALL-TIME GMV</span>
                    <p className="text-sm font-bold text-white mt-1">${dossier?.financials?.gmv || 0}</p>
                  </div>
                  <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                    <span className="text-zinc-500 text-[10px] uppercase">NET EARNINGS</span>
                    <p className="text-sm font-bold text-emerald-400 mt-1">${dossier?.financials?.net_earnings || 0}</p>
                  </div>
                  <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                    <span className="text-zinc-500 text-[10px] uppercase">TOTAL FEES PAID</span>
                    <p className="text-sm font-bold text-rose-400 mt-1">${dossier?.financials?.total_fees_paid || 0}</p>
                  </div>
                  <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                    <span className="text-zinc-500 text-[10px] uppercase">AVAILABLE BALANCE</span>
                    <p className="text-sm font-bold text-amber-400 mt-1">${dossier?.financials?.available_balance || 0}</p>
                  </div>
                </div>

                {/* Bank account info */}
                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-1">
                  <h4 className="font-semibold text-white uppercase text-[11px] tracking-wider mb-2 font-mono">
                    Settlement Bank Account
                  </h4>
                  {dossier?.organizer?.bank ? (
                    <div className="font-mono text-zinc-300">
                      <div>Bank: <span className="text-white font-semibold">{dossier.organizer.bank.bank_name}</span></div>
                      <div>Account: <span className="text-white font-semibold">{dossier.organizer.bank.account_number}</span> ({dossier.organizer.bank.account_name})</div>
                    </div>
                  ) : (
                    <span className="text-zinc-500">No bank account linked.</span>
                  )}
                </div>

                {/* Team Members */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-white uppercase text-[11px] tracking-wider font-mono">
                    Registered Organization Members ({dossier?.members?.length || 0})
                  </h4>
                  <div className="bg-zinc-950 rounded-xl border border-zinc-800 divide-y divide-zinc-800/60 max-h-48 overflow-y-auto">
                    {dossier?.members?.map((m: any) => (
                      <div key={m.id} className="p-3 flex justify-between items-center">
                        <div>
                          <div className="text-white font-medium">{m.user?.first_name} {m.user?.last_name}</div>
                          <div className="text-zinc-500 text-[11px] font-mono">{m.user?.email}</div>
                        </div>
                        <span className="bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded text-[10px] uppercase font-bold border border-zinc-700">
                          {m.role || 'Member'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedOrg(null)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-semibold"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suspend Confirmation Modal */}
      {suspendModalOrg && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2.5 text-rose-400 font-bold">
              <AlertTriangle className="w-5 h-5" />
              <span>Suspend Tenant: {suspendModalOrg.name}</span>
            </div>
            <p className="text-xs text-zinc-400">
              Suspension immediately blocks the organizer from publishing new events, altering tickets, or requesting bank payouts.
            </p>

            <div className="space-y-1">
              <label className="text-[11px] text-zinc-300 font-semibold">Mandatory Audit Reason</label>
              <textarea
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="State violation details, KYC discrepancies, or dispute justification..."
                rows={3}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSuspendModalOrg(null)}
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
