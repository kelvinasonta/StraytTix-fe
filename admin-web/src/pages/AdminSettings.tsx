import React, { useEffect, useState } from 'react';
import { 
  SlidersHorizontal, 
  Save, 
  ToggleLeft, 
  ToggleRight, 
  CheckCircle2, 
  Percent, 
  Coins, 
  CreditCard,
  Layers,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { adminApi } from '../api/admin';
import type { AppSettings } from '../types/api';

export const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<Partial<AppSettings>>({});
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [settingsData, flagsData] = await Promise.all([
        adminApi.getSettings(),
        adminApi.getFeatureFlags(),
      ]);
      setSettings(settingsData || {});
      setFlags(flagsData || {});
    } catch (err: any) {
      console.error('Failed to load system settings:', err);
      setError(err.message || 'Failed to communicate with settings repository.');
    } finally {
      setLoading(false);
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
    setError(null);
    try {
      const updated = await adminApi.updateSettings(settings);
      setSettings(updated || settings);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to update platform settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-850 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <SlidersHorizontal className="w-6 h-6 text-rose-500" />
            <span>Platform Settings & Monetization</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Global fee engine, settlement rules, currency defaults, and runtime feature toggles (Pennant).
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white rounded-xl transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-rose-400' : ''}`} />
          <span>Reload Config</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-950/70 border border-emerald-800/60 p-4 rounded-2xl flex items-center gap-3 text-xs text-emerald-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>Platform fee engine parameters saved. Updated take-rates are active for all subsequent checkouts.</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-950/70 border border-rose-800/60 p-4 rounded-2xl flex items-center gap-3 text-xs text-rose-300">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Fee Settings Form */}
      <form onSubmit={handleSaveSettings} className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-7 space-y-6 backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Coins className="w-4 h-4 text-rose-400" />
              <span>Platform Take-Rate & Pricing Engine</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">Parameters applied at checkout when generating ticket orders.</p>
          </div>
          <span className="text-[10px] font-mono uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-full font-bold">
            Live Gateway
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
          <div className="space-y-1.5">
            <label className="text-zinc-300 font-semibold flex items-center gap-1.5">
              <Percent className="w-3.5 h-3.5 text-zinc-500" />
              <span>Platform Percentage Fee (%)</span>
            </label>
            <input
              type="number"
              step="0.01"
              value={settings.platform_fee_percent ?? 5}
              onChange={(e) => setSettings({ ...settings, platform_fee_percent: parseFloat(e.target.value) || 0 })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white font-mono focus:outline-none focus:border-rose-500"
            />
            <p className="text-[11px] text-zinc-500">Percentage slice deducted per paid ticket tier (e.g. 5.00%).</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-zinc-300 font-semibold flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-zinc-500" />
              <span>Fixed Ticket Processing Fee (Per Order)</span>
            </label>
            <input
              type="number"
              step="1"
              value={settings.platform_fee_fixed ?? 100}
              onChange={(e) => setSettings({ ...settings, platform_fee_fixed: parseFloat(e.target.value) || 0 })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white font-mono focus:outline-none focus:border-rose-500"
            />
            <p className="text-[11px] text-zinc-500">Flat fixed service fee in base currency units (e.g., ₦100).</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-zinc-300 font-semibold">Default Settlement Currency</label>
            <input
              type="text"
              value={settings.currency ?? 'NGN'}
              onChange={(e) => setSettings({ ...settings, currency: e.target.value.toUpperCase() })}
              placeholder="NGN, USD, GHS, KES"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white font-mono uppercase focus:outline-none focus:border-rose-500"
            />
            <p className="text-[11px] text-zinc-500">Base currency symbol used for ledger reconciliation.</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-zinc-300 font-semibold">Fee Absorption Mode</label>
            <button
              type="button"
              onClick={() =>
                setSettings({
                  ...settings,
                  platform_fee_passthrough: !settings.platform_fee_passthrough,
                })
              }
              className={`w-full py-3 px-4 rounded-xl text-xs font-mono font-bold tracking-wider transition border ${
                settings.platform_fee_passthrough
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-zinc-950 text-zinc-400 border-zinc-800'
              }`}
            >
              {settings.platform_fee_passthrough ? 'BUYER PAYS (PASSTHROUGH AT CHECKOUT)' : 'ORGANIZER ABSORBS FROM NET PAYOUT'}
            </button>
            <p className="text-[11px] text-zinc-500">Determines whether attendees see the fee added or organizer nets less.</p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-600/30 flex items-center gap-2 transition"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Committing Parameters...' : 'Save Monetization Settings'}</span>
          </button>
        </div>
      </form>

      {/* Feature Flags Section */}
      <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-7 space-y-5 backdrop-blur-xl">
        <div className="border-b border-zinc-800/80 pb-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-rose-400" />
            <span>Runtime Feature Flags (Laravel Pennant)</span>
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">Dynamically enable or kill features across all tenants without redeployment.</p>
        </div>

        <div className="divide-y divide-zinc-800/50 text-xs">
          {[
            { key: 'api-rate-limiting', label: 'Aggressive Rate Limiting', desc: 'Throttles high-frequency public checkout & registration bots' },
            { key: 'stripe-payouts', label: 'Automated Payout Gateways', desc: 'Authorizes automated direct-to-bank payout disbursements' },
            { key: 'credits-topup', label: 'Organizer Credits Wallet', desc: 'Pre-funded organizer balance for promotions and fee subsiding' },
            { key: 'gate-scanner-v2', label: 'Offline Gate Scanner Sync', desc: 'Enables client IndexedDB cache for high-velocity gate check-ins' },
          ].map((flag) => {
            const isActive = Boolean(flags[flag.key]);
            return (
              <div key={flag.key} className="py-4 flex items-center justify-between">
                <div>
                  <div className="text-white font-bold flex items-center gap-2">
                    <span>{flag.label}</span>
                    <span className="font-mono text-[10px] text-zinc-500">({flag.key})</span>
                  </div>
                  <div className="text-zinc-400 text-[11px] mt-0.5">{flag.desc}</div>
                </div>
                <button
                  onClick={() => handleToggleFlag(flag.key)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition border ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-zinc-950 text-zinc-500 border-zinc-800'
                  }`}
                >
                  {isActive ? <ToggleRight className="w-4 h-4 text-emerald-400" /> : <ToggleLeft className="w-4 h-4 text-zinc-500" />}
                  <span>{isActive ? 'ACTIVE' : 'DISABLED'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
