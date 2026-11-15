import React, { useEffect, useState } from 'react';
import { SlidersHorizontal, Save, ToggleLeft, ToggleRight, CheckCircle2, ShieldCheck, Key } from 'lucide-react';
import { adminApi } from '../../api/admin';
import type { AppSettings } from '../../types/api';

export const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<Partial<AppSettings>>({});
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [plans, setPlans] = useState<any[]>([]);
  const [savingPlanSlug, setSavingPlanSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [settingsData, flagsData, plansData] = await Promise.all([
        adminApi.getSettings(),
        adminApi.getFeatureFlags(),
        adminApi.getSubscriptionPlans().catch(() => []),
      ]);
      setSettings(settingsData || {});
      setFlags(flagsData || {});
      setPlans(plansData || []);
    } catch (err) {
      console.error('Failed to load system settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanFieldChange = (slug: string, field: string, value: any) => {
    setPlans((prev) => prev.map((p) => (p.slug === slug ? { ...p, [field]: value } : p)));
  };

  const handleSavePlan = async (plan: any) => {
    setSavingPlanSlug(plan.slug);
    try {
      await adminApi.updateSubscriptionPlan(plan.slug, {
        name: plan.name,
        monthly_price_ngn: Number(plan.monthly_price_ngn || 0),
        annual_price_ngn: Number(plan.annual_price_ngn || 0),
        monthly_cost_credits: Number(plan.monthly_cost_credits || 0),
        annual_cost_credits: Number(plan.annual_cost_credits || 0),
        fee_percentage: plan.fee_percentage === '' || plan.fee_percentage === null ? null : Number(plan.fee_percentage),
        fee_fixed: plan.fee_fixed === '' || plan.fee_fixed === null ? null : Number(plan.fee_fixed),
        max_staff_members: Number(plan.max_staff_members || 2),
        max_active_events: Number(plan.max_active_events || 10),
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      alert('Failed to update subscription plan.');
    } finally {
      setSavingPlanSlug(null);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleFlag = async (featureKey: string) => {
    const current = Boolean(flags[featureKey]);
    try {
      await adminApi.toggleFeatureFlag(featureKey, !current);
      setFlags((prev) => ({ ...prev, [featureKey]: !current }));
    } catch (err) {
      alert('Failed to toggle feature flag.');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminApi.updateSettings(settings);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      alert('Failed to save platform fee settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-white">System Settings & Platform Fee Engine</h2>
        <p className="text-xs text-slate-400 mt-0.5">Control global monetization parameters, default ticket currencies, and runtime feature toggles.</p>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-950/70 border border-emerald-800/60 p-3 rounded-xl flex items-center gap-2 text-xs text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Platform fee settings successfully saved and active across checkout pipelines.</span>
        </div>
      )}

      {/* Fee Settings Form */}
      <form onSubmit={handleSaveSettings} className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-5">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Platform Fee Engine</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Platform Fee Percentage (%)</label>
            <input
              type="number"
              step="0.01"
              value={settings.platform_fee_percentage ?? 5.0}
              onChange={(e) => setSettings({ ...settings, platform_fee_percentage: parseFloat(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-rose-500 font-mono"
            />
            <span className="text-[10px] text-slate-500">Calculated on gross ticket order subtotal.</span>
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Platform Fixed Fee ($)</label>
            <input
              type="number"
              step="0.01"
              value={settings.platform_fee_fixed ?? 0.50}
              onChange={(e) => setSettings({ ...settings, platform_fee_fixed: parseFloat(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-rose-500 font-mono"
            />
            <span className="text-[10px] text-slate-500">Flat rate added per paid transaction.</span>
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Ticket Fee Percentage (%)</label>
            <input
              type="number"
              step="0.01"
              value={settings.ticket_fee_percentage ?? 2.5}
              onChange={(e) => setSettings({ ...settings, ticket_fee_percentage: parseFloat(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-rose-500 font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Platform Fee Passthrough</label>
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setSettings({ ...settings, platform_fee_passthrough: !settings.platform_fee_passthrough })}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                  settings.platform_fee_passthrough
                    ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {settings.platform_fee_passthrough ? 'BUYER PAYS (PASSTHROUGH)' : 'ORGANIZER ABSORBS'}
              </button>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-2"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving Parameters...' : 'Update Platform Settings'}</span>
          </button>
        </div>
      </form>

      {/* Bot & OAuth Security: Captcha Protection */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Bot Verification & OAuth Security
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Defend OAuth redirects and authentication endpoints against automated bots using Google reCAPTCHA or Cloudflare Turnstile.
            </p>
          </div>
          <span className="text-[10px] font-mono px-2.5 py-1 rounded-full uppercase tracking-wider font-semibold border bg-indigo-950/60 text-indigo-400 border-indigo-800/50">
            Active: {settings.auth_captcha_provider || 'none'}
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Verification Provider</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'none', label: 'Disabled (None)', desc: 'No bot verification challenge' },
                { id: 'recaptcha', label: 'Google reCAPTCHA', desc: 'reCAPTCHA v2 / v3 integration' },
                { id: 'turnstile', label: 'Cloudflare Turnstile', desc: 'Privacy-focused Turnstile challenge' },
              ].map((item) => {
                const isSelected = (settings.auth_captcha_provider || 'none') === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSettings((prev) => ({ ...prev, auth_captcha_provider: item.id }))}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-indigo-950/50 border-indigo-500 text-white shadow-lg shadow-indigo-950/30 ring-1 ring-indigo-500/50'
                        : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center justify-between">
                      <span>{item.label}</span>
                      <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-indigo-400' : 'bg-slate-700'}`} />
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">{item.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {settings.auth_captcha_provider === 'recaptcha' && (
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-300">
                <Key className="w-3.5 h-3.5" />
                <span>Google reCAPTCHA API Keys</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] text-slate-400 font-mono mb-1">reCAPTCHA Site Key (Public)</label>
                  <input
                    type="text"
                    placeholder="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                    value={settings.recaptcha_site_key || ''}
                    onChange={(e) => setSettings((prev) => ({ ...prev, recaptcha_site_key: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-mono text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 font-mono mb-1">reCAPTCHA Secret Key (Private)</label>
                  <input
                    type="password"
                    placeholder="••••••••••••••••••••••••••••••••"
                    value={settings.recaptcha_secret_key || ''}
                    onChange={(e) => setSettings((prev) => ({ ...prev, recaptcha_secret_key: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-mono text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {settings.auth_captcha_provider === 'turnstile' && (
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-300">
                <Key className="w-3.5 h-3.5" />
                <span>Cloudflare Turnstile API Keys</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] text-slate-400 font-mono mb-1">Turnstile Site Key (Public)</label>
                  <input
                    type="text"
                    placeholder="0x4AAAAAA..."
                    value={settings.cloudflare_turnstile_site_key || ''}
                    onChange={(e) => setSettings((prev) => ({ ...prev, cloudflare_turnstile_site_key: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-mono text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 font-mono mb-1">Turnstile Secret Key (Private)</label>
                  <input
                    type="password"
                    placeholder="••••••••••••••••••••••••••••••••"
                    value={settings.cloudflare_turnstile_secret_key || ''}
                    onChange={(e) => setSettings((prev) => ({ ...prev, cloudflare_turnstile_secret_key: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-mono text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="button"
              disabled={saving}
              onClick={handleSaveSettings}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-2"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving Security Config...' : 'Save Bot Protection Settings'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Subscription Plans Pricing & Commission Tiers */}
      {plans.length > 0 && (
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Organizer Subscription Plans & Tier Commissions
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Customize monthly/annual credit costs, discounted ticket commission rates, and staff limits per tier.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {plans.map((plan) => (
              <div key={plan.slug} className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-white uppercase tracking-wide">{plan.name}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    {plan.slug}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-400 font-mono">Monthly Credits</label>
                    <input
                      type="number"
                      value={plan.monthly_cost_credits ?? 0}
                      onChange={(e) => handlePlanFieldChange(plan.slug, 'monthly_cost_credits', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-white font-mono mt-0.5"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 font-mono">Annual Credits</label>
                    <input
                      type="number"
                      value={plan.annual_cost_credits ?? 0}
                      onChange={(e) => handlePlanFieldChange(plan.slug, 'annual_cost_credits', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-white font-mono mt-0.5"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 font-mono">Ticket Fee %</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Global"
                      value={plan.fee_percentage ?? ''}
                      onChange={(e) => handlePlanFieldChange(plan.slug, 'fee_percentage', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-white font-mono mt-0.5"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 font-mono">Flat Fee (₦)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Global"
                      value={plan.fee_fixed ?? ''}
                      onChange={(e) => handlePlanFieldChange(plan.slug, 'fee_fixed', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-white font-mono mt-0.5"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 font-mono">Max Staff</label>
                    <input
                      type="number"
                      value={plan.max_staff_members ?? 2}
                      onChange={(e) => handlePlanFieldChange(plan.slug, 'max_staff_members', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-white font-mono mt-0.5"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 font-mono">Max Events</label>
                    <input
                      type="number"
                      value={plan.max_active_events ?? 10}
                      onChange={(e) => handlePlanFieldChange(plan.slug, 'max_active_events', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-white font-mono mt-0.5"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  disabled={savingPlanSlug === plan.slug}
                  onClick={() => handleSavePlan(plan)}
                  className="w-full py-1.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-lg text-[11px] font-semibold"
                >
                  {savingPlanSlug === plan.slug ? 'Saving...' : `Save ${plan.name}`}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feature Flags Section */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Runtime Feature Flags (Laravel Pennant)</h3>
        <p className="text-xs text-slate-400">Toggle modules and features live across all tenants with zero deployment required.</p>

        <div className="divide-y divide-slate-800/60 text-xs">
          {[
            { key: 'api-rate-limiting', label: 'Aggressive Rate Limiting', desc: 'Throttle public checkout and ticket reservation endpoints' },
            { key: 'stripe-payouts', label: 'Automated Stripe Transfers', desc: 'Direct-to-bank settlement gateway for verified organizers' },
            { key: 'credits-topup', label: 'Prepaid Wallet Engine', desc: 'Allows organizers to pre-fund ticket discounts via Credits module' },
            { key: 'gate-scanner-v2', label: 'Turnstile Offline Cache', desc: 'Enables indexedDB client caching of attendee gate rosters' },
          ].map((flag) => {
            const isActive = Boolean(flags[flag.key]);
            return (
              <div key={flag.key} className="py-3.5 flex items-center justify-between">
                <div>
                  <div className="text-white font-bold">{flag.label}</div>
                  <div className="text-slate-500 text-[11px] font-mono">{flag.key} — {flag.desc}</div>
                </div>
                <button
                  onClick={() => handleToggleFlag(flag.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    isActive
                      ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50'
                      : 'bg-slate-800 text-slate-400 border border-slate-700/50'
                  }`}
                >
                  {isActive ? <ToggleRight className="w-4 h-4 text-emerald-400" /> : <ToggleLeft className="w-4 h-4 text-slate-500" />}
                  <span>{isActive ? 'ENABLED' : 'DISABLED'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
