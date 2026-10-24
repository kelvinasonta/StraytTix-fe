import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { adminApi } from '../api/adminClient';
import type { FeatureFlag } from '../types/admin';
import {
  Flag,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Zap,
  Sliders,
  AlertTriangle,
  RefreshCw,
  Search,
  Lock
} from 'lucide-react';

export const FeatureFlagsPage: React.FC = () => {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [togglingKey, setTogglingKey] = useState<string | null>(null);

  const loadFlags = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getFeatureFlags();
      setFlags(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFlags();
  }, []);

  const handleToggle = async (flag: FeatureFlag) => {
    setTogglingKey(flag.key);
    try {
      const nextState = !flag.isActive;
      await adminApi.toggleFeatureFlag(flag.key, nextState);
      setFlags((prev) =>
        prev.map((f) => (f.key === flag.key ? { ...f, isActive: nextState } : f))
      );
    } finally {
      setTogglingKey(null);
    }
  };

  const filtered = flags.filter(
    (f) =>
      !searchQuery.trim() ||
      f.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-5">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <Flag className="w-6 h-6 text-rose-500" />
              <span>Global Feature Flags & Control Switches</span>
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm font-medium">
              Dynamically enable or kill features across attendee and organizer interfaces without redeploying code.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2 text-amber-400 text-xs font-bold">
              <AlertTriangle className="w-4 h-4" />
              <span>Production Affecting Engine</span>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search feature flags by key or label..."
            className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-rose-500"
          />
        </div>

        {/* Flags Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((flag) => {
            const isToggling = togglingKey === flag.key;
            return (
              <div
                key={flag.key}
                className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-all space-y-4 relative"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                        {flag.group}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500 font-bold">
                        key: {flag.key}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white">{flag.label}</h3>
                  </div>

                  {/* Switch */}
                  <button
                    type="button"
                    disabled={isToggling}
                    onClick={() => handleToggle(flag)}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer flex-shrink-0 ${
                      flag.isActive ? 'bg-rose-600' : 'bg-zinc-800'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                        flag.isActive ? 'left-6.5' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                  {flag.description}
                </p>

                <div className="flex items-center justify-between text-[11px] font-mono border-t border-zinc-850 pt-3">
                  <span className={flag.isActive ? 'text-emerald-400 font-bold' : 'text-zinc-500'}>
                    STATUS: {flag.isActive ? 'ACTIVE IN PRODUCTION' : 'DISABLED'}
                  </span>
                  <span className="text-zinc-500">Live Gateway</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
};
