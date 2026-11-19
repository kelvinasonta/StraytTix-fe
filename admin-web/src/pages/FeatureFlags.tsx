import React, { useEffect, useState } from 'react';
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
  Lock,
  Layers,
  Sparkles
} from 'lucide-react';
import { adminApi, type FeatureFlagItem } from '../api/admin';

export const FeatureFlags: React.FC = () => {
  const [flags, setFlags] = useState<FeatureFlagItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [togglingKey, setTogglingKey] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const loadFlags = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getFeatureFlagsDetailed();
      setFlags(data);
    } catch (err: any) {
      console.error('Failed to load feature flags:', err);
      setNotification({ message: 'Failed to load feature flags from server.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFlags();
  }, []);

  const handleToggle = async (flag: FeatureFlagItem) => {
    setTogglingKey(flag.key);
    const nextState = !flag.active;
    try {
      await adminApi.toggleFeatureFlag(flag.key, nextState);
      setFlags((prev) =>
        prev.map((f) => (f.key === flag.key ? { ...f, active: nextState, isActive: nextState } : f))
      );
      setNotification({
        message: `Feature flag '${flag.label}' is now ${nextState ? 'ACTIVE' : 'DISABLED'} across all tenants.`,
        type: 'success',
      });
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      console.error('Failed to toggle feature flag:', err);
      setNotification({ message: `Failed to toggle feature flag: ${err.message || 'Error'}`, type: 'error' });
    } finally {
      setTogglingKey(null);
    }
  };

  const categories = ['all', ...Array.from(new Set(flags.map((f) => f.category)))];

  const filtered = flags.filter((f) => {
    const matchesSearch =
      !searchQuery.trim() ||
      f.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || f.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-850 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Flag className="w-6 h-6 text-rose-500" />
            <span>Platform Feature Flags (Laravel Pennant)</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Dynamic runtime switches powered by Redis/Pennant. Control critical platform mechanisms without deploying code.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 px-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2 text-amber-400 text-xs font-bold font-mono">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Real-time Global Impact</span>
          </div>

          <button
            onClick={loadFlags}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white rounded-xl transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-rose-400' : ''}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {notification && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center gap-3 ${
            notification.type === 'success'
              ? 'bg-emerald-950/70 border-emerald-800/60 text-emerald-300'
              : 'bg-rose-950/70 border-rose-800/60 text-rose-300'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Search and Category Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter flags by name, key, or description..."
            className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500/60"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono uppercase font-bold transition whitespace-nowrap border ${
                selectedCategory === cat
                  ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                  : 'bg-zinc-900/60 text-zinc-400 border-zinc-800/80 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Flags Grid */}
      {loading ? (
        <div className="p-16 rounded-2xl bg-zinc-900/40 border border-zinc-800 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-3 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-zinc-500 text-xs font-mono uppercase tracking-wider">Querying Pennant Gateway...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center text-zinc-500 rounded-2xl bg-zinc-900/30 border border-zinc-850">
          No feature flags matching your filter criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((flag) => {
            const isToggling = togglingKey === flag.key;
            return (
              <div
                key={flag.key}
                className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 hover:border-zinc-700/80 transition-all space-y-4 backdrop-blur-xl relative"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-800/80 text-zinc-400 border border-zinc-700/50">
                        {flag.category}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500 truncate" title={flag.key}>
                        {flag.key}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white tracking-tight">{flag.label}</h3>
                  </div>

                  {/* Toggle Pill Switch */}
                  <button
                    type="button"
                    disabled={isToggling}
                    onClick={() => handleToggle(flag)}
                    className={`w-12 h-6 rounded-full transition-all relative cursor-pointer shrink-0 disabled:opacity-50 ${
                      flag.active ? 'bg-gradient-to-r from-rose-600 to-rose-500 shadow-lg shadow-rose-600/30' : 'bg-zinc-800 border border-zinc-700'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                        flag.active ? 'left-6.5' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed">
                  {flag.description}
                </p>

                <div className="flex items-center justify-between text-[11px] font-mono border-t border-zinc-850/80 pt-3">
                  <span className={flag.active ? 'text-emerald-400 font-bold flex items-center gap-1.5' : 'text-zinc-500 flex items-center gap-1.5'}>
                    <span className={`w-1.5 h-1.5 rounded-full ${flag.active ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'}`}></span>
                    <span>{flag.active ? 'ACTIVATED IN RUNTIME' : 'DEACTIVATED'}</span>
                  </span>
                  <span className="text-zinc-500">Pennant Global</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

