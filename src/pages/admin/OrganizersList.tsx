import React, { useEffect, useState } from 'react';
import { 
  Building2, 
  Search, 
  ShieldAlert, 
  ShieldCheck, 
  CheckCircle2, 
  Ban, 
  AlertTriangle,
  X
} from 'lucide-react';
import { adminApi, type AdminOrganizerItem } from '../../api/admin';

export const OrganizersList: React.FC = () => {
  const [organizers, setOrganizers] = useState<AdminOrganizerItem[]>([]);
  const [search, setSearch] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedOrg, setSelectedOrg] = useState<AdminOrganizerItem | null>(null);
  const [dossier, setDossier] = useState<any | null>(null);
  const [dossierLoading, setDossierLoading] = useState<boolean>(false);
  const [suspendModalOrg, setSuspendModalOrg] = useState<AdminOrganizerItem | null>(null);
  const [suspendReason, setSuspendReason] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [planTier, setPlanTier] = useState<'free' | 'pro' | 'enterprise'>('free');
  const [durationDays, setDurationDays] = useState<string>('30');
  const [customFeePct, setCustomFeePct] = useState<string>('');
  const [customFeeFixed, setCustomFeeFixed] = useState<string>('');
  const [planSaving, setPlanSaving] = useState<boolean>(false);

  const fetchOrganizers = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getOrganizers({ search, status: status || undefined });
      setOrganizers(data.data || []);
    } catch (err) {
      console.error('Failed to load organizers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizers();
  }, [status]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrganizers();
  };

  const openDossier = async (org: AdminOrganizerItem) => {
    setSelectedOrg(org);
    setDossierLoading(true);
    try {
      const data = await adminApi.getOrganizerDossier(org.uuid);
      setDossier(data);
      const sub = data?.subscription;
      setPlanTier((sub?.effective_tier || data?.organizer?.plan_tier || 'free') as 'free' | 'pro' | 'enterprise');
      setCustomFeePct(
        sub?.custom_fee_percentage !== null && sub?.custom_fee_percentage !== undefined
          ? String(sub.custom_fee_percentage)
          : ''
      );
      setCustomFeeFixed(
        sub?.custom_fee_fixed !== null && sub?.custom_fee_fixed !== undefined
          ? String(sub.custom_fee_fixed)
          : ''
      );
    } catch (err) {
      console.error('Failed to load dossier:', err);
    } finally {
      setDossierLoading(false);
    }
  };

  const handleSavePlanAndFees = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrg) return;
    setPlanSaving(true);
    try {
      await adminApi.updateOrganizerPlan(selectedOrg.uuid, {
        plan_tier: planTier,
        duration_days: planTier === 'free' ? null : Number(durationDays) || 30,
        custom_fee_percentage: customFeePct.trim() === '' ? null : Number(customFeePct),
        custom_fee_fixed: customFeeFixed.trim() === '' ? null : Number(customFeeFixed),
      });
      const refreshed = await adminApi.getOrganizerDossier(selectedOrg.uuid);
      setDossier(refreshed);
      fetchOrganizers();
    } catch (err) {
      alert('Failed to update subscription plan and custom fees.');
    } finally {
      setPlanSaving(false);
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

  const handleUnsuspend = async (org: AdminOrganizerItem) => {
    if (!confirm(`Reactivate organizer "${org.name}"?`)) return;
    try {
      await adminApi.unsuspendOrganizer(org.uuid);
      fetchOrganizers();
    } catch (err) {
      alert('Failed to reactivate organizer.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-white">Tenant & Organizer Governance</h2>
        <p className="text-xs text-slate-400 mt-0.5">Audit organizer profiles, review KYC compliance, and enact tenant sanctions.</p>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
        <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-80">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name, slug or email..."
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
              {s || 'All Statuses'}
            </button>
          ))}
        </div>
      </div>

      {/* Organizers Table */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-mono">
            <tr>
              <th className="py-3 px-4">Organizer</th>
              <th className="py-3 px-4">Owner Contact</th>
              <th className="py-3 px-4">KYC Status</th>
              <th className="py-3 px-4">State</th>
              <th className="py-3 px-4">Events</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {organizers.map((org) => {
              const isSuspended = !org.is_active || Boolean(org.suspended_at);
              return (
                <tr key={org.uuid} className="hover:bg-slate-800/20">
                  <td className="py-3 px-4">
                    <div className="font-bold text-white">{org.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">/{org.slug}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-white">{org.user ? `${org.user.first_name} ${org.user.last_name}` : 'N/A'}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{org.email || org.user?.email}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                      org.verification_status === 'verified'
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                        : org.verification_status === 'pending'
                        ? 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {org.verification_status === 'verified' && <ShieldCheck className="w-3 h-3" />}
                      {org.verification_status}
                    </span>
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
                  <td className="py-3 px-4 font-mono">{org.events_count || 0}</td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      onClick={() => openDossier(org)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-semibold"
                    >
                      Dossier
                    </button>
                    {isSuspended ? (
                      <button
                        onClick={() => handleUnsuspend(org)}
                        className="px-2.5 py-1 bg-emerald-950/60 border border-emerald-800/50 text-emerald-300 hover:bg-emerald-900 rounded-lg text-[11px] font-semibold"
                      >
                        Reactivate
                      </button>
                    ) : (
                      <button
                        onClick={() => setSuspendModalOrg(org)}
                        className="px-2.5 py-1 bg-rose-950/60 border border-rose-800/50 text-rose-300 hover:bg-rose-900 rounded-lg text-[11px] font-semibold"
                      >
                        Suspend
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {organizers.length === 0 && !loading && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-slate-500">
                  No organizers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Dossier Drawer / Modal */}
      {selectedOrg && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">{selectedOrg.name}</h3>
                <span className="text-xs text-slate-500 font-mono">UUID: {selectedOrg.uuid}</span>
              </div>
              <button onClick={() => setSelectedOrg(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {dossierLoading ? (
              <div className="py-12 text-center text-xs text-slate-400">Loading comprehensive dossier...</div>
            ) : (
              <div className="space-y-6 text-xs">
                {/* Financial overview */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-[10px]">ALL-TIME GMV</span>
                    <p className="text-sm font-bold text-white mt-1">${dossier?.financials?.gmv || 0}</p>
                  </div>
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-[10px]">NET EARNINGS</span>
                    <p className="text-sm font-bold text-emerald-400 mt-1">${dossier?.financials?.net_earnings || 0}</p>
                  </div>
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-[10px]">TOTAL FEES PAID</span>
                    <p className="text-sm font-bold text-rose-400 mt-1">${dossier?.financials?.total_fees_paid || 0}</p>
                  </div>
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-[10px]">WALLET CREDITS</span>
                    <p className="text-sm font-bold text-amber-400 mt-1">${dossier?.financials?.credit_balance || 0}</p>
                  </div>
                </div>

                {/* Subscription Plan & Custom Fee Governance */}
                <form
                  onSubmit={handleSavePlanAndFees}
                  className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-white uppercase text-[11px] tracking-wider">
                        Subscription Tier & Custom Commission Override
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Active Tier:{' '}
                        <span className="text-emerald-400 font-bold uppercase">
                          {dossier?.subscription?.effective_tier_label || 'Free Starter'}
                        </span>
                        {dossier?.subscription?.plan_expires_at && (
                          <span className="text-slate-500 ml-2 font-mono">
                            (Expires: {new Date(dossier.subscription.plan_expires_at).toLocaleDateString()})
                          </span>
                        )}
                      </p>
                    </div>
                    <button
                      type="submit"
                      disabled={planSaving}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-lg text-[11px] font-semibold"
                    >
                      {planSaving ? 'Saving...' : 'Save Plan & Fees'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Plan Tier</label>
                      <select
                        value={planTier}
                        onChange={(e) => setPlanTier(e.target.value as 'free' | 'pro' | 'enterprise')}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      >
                        <option value="free">Free Starter (Global Fee)</option>
                        <option value="pro">Pro Growth (2.5% + ₦50)</option>
                        <option value="enterprise">Enterprise (1.5% + ₦0)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Duration (Days)</label>
                      <input
                        type="number"
                        min={1}
                        max={3650}
                        disabled={planTier === 'free'}
                        value={durationDays}
                        onChange={(e) => setDurationDays(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white disabled:opacity-40"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                        Custom Fee % (Optional)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min={0}
                        max={100}
                        placeholder="Inherit tier/global"
                        value={customFeePct}
                        onChange={(e) => setCustomFeePct(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-600"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                        Custom Flat Fee (Optional)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min={0}
                        placeholder="Inherit tier/global"
                        value={customFeeFixed}
                        onChange={(e) => setCustomFeeFixed(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-600"
                      />
                    </div>
                  </div>
                </form>

                {/* Bank account info */}
                <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 space-y-1">
                  <h4 className="font-semibold text-white uppercase text-[11px] tracking-wider mb-2">Settlement Bank</h4>
                  {dossier?.organizer?.bank ? (
                    <div className="font-mono text-slate-300">
                      <div>Bank: {dossier.organizer.bank.bank_name}</div>
                      <div>Account: {dossier.organizer.bank.account_number} ({dossier.organizer.bank.account_name})</div>
                    </div>
                  ) : (
                    <span className="text-slate-500">No bank account linked.</span>
                  )}
                </div>

                {/* Team Members */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-white uppercase text-[11px] tracking-wider">Team Members</h4>
                  <div className="bg-slate-950/40 rounded-xl border border-slate-800 divide-y divide-slate-800/60">
                    {dossier?.members?.map((m: any) => (
                      <div key={m.id} className="p-3 flex justify-between items-center">
                        <div>
                          <div className="text-white font-medium">{m.user?.first_name} {m.user?.last_name}</div>
                          <div className="text-slate-500 text-[11px] font-mono">{m.user?.email}</div>
                        </div>
                        <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] uppercase font-bold">
                          {m.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Suspend Confirmation Modal */}
      {suspendModalOrg && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-2.5 text-rose-400 font-bold">
              <AlertTriangle className="w-5 h-5" />
              <span>Suspend Tenant: {suspendModalOrg.name}</span>
            </div>
            <p className="text-xs text-slate-400">
              Suspension immediately revokes the organizer's ability to publish new events, alter ticket tiers, or request fund payouts.
            </p>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-300 font-semibold">Mandatory Audit Reason</label>
              <textarea
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="State policy violation, fraud report, or legal hold reason..."
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSuspendModalOrg(null)}
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

