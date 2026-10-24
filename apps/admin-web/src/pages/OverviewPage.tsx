import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '../components/AdminLayout';
import { adminApi } from '../api/adminClient';
import type { PlatformMetric } from '../types/admin';
import {
  DollarSign,
  Ticket,
  Calendar,
  Users,
  ShieldAlert,
  ArrowUpRight,
  TrendingUp,
  Activity,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const OverviewPage: React.FC = () => {
  const [metrics, setMetrics] = useState<PlatformMetric | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await adminApi.getMetrics();
        setMetrics(data);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <AdminLayout>
      <div className="space-y-8 animate-in fade-in duration-200">
        {/* Page Top Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-6">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Platform Operations & Governance
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm font-medium">
              Real-time telemetry, marketplace transaction volume, pending KYC verifications, and security flags.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-mono font-bold text-emerald-400">Telemetry Live Stream</span>
          </div>
        </div>

        {/* 1. Core Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Revenue */}
          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition-all space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Gross Platform GMV</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-black text-white tracking-tight">
                {metrics ? formatNaira(metrics.totalRevenue) : '...'}
              </h3>
              <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 mt-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+18.4% vs last cycle</span>
              </p>
            </div>
          </div>

          {/* Tickets Sold */}
          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition-all space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Tickets Processed</span>
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center font-bold">
                <Ticket className="w-4 h-4" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-black text-white tracking-tight">
                {metrics ? metrics.ticketsSold.toLocaleString() : '...'}
              </h3>
              <p className="text-[11px] text-zinc-400 font-medium mt-1">
                Across 412 active experiences
              </p>
            </div>
          </div>

          {/* Pending Verifications */}
          <Link
            to="/verifications"
            className="p-5 rounded-2xl bg-amber-950/20 border border-amber-800/40 hover:border-amber-700 transition-all space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">KYC Reviews Pending</span>
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-black text-amber-300 tracking-tight">
                {metrics ? `${metrics.pendingVerifications} Action Items` : '...'}
              </h3>
              <p className="text-[11px] text-amber-400/80 font-medium flex items-center gap-1 mt-1 group-hover:translate-x-0.5 transition-transform">
                <span>Inspect corporate documents</span>
                <ArrowRight className="w-3 h-3" />
              </p>
            </div>
          </Link>

          {/* Active Organizers */}
          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition-all space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Active Organizers</span>
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-black text-white tracking-tight">
                {metrics ? metrics.activeOrganizers : '...'}
              </h3>
              <p className="text-[11px] text-zinc-400 font-medium mt-1">
                98.2% healthy delivery score
              </p>
            </div>
          </div>
        </div>

        {/* 2. Visual Revenue Chart Simulation & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Revenue Velocity Bar Graph */}
          <div className="lg:col-span-7 p-6 rounded-3xl bg-zinc-900/50 border border-zinc-800/80 space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-800/60 pb-4">
              <div>
                <h4 className="text-sm font-black text-white tracking-tight">Weekly Transaction Velocity</h4>
                <p className="text-xs text-zinc-400">Total gross ticketing inflows per calendar day</p>
              </div>
              <span className="text-xs font-mono text-zinc-400 bg-zinc-800/60 px-2.5 py-1 rounded-md">Last 7 Days</span>
            </div>

            <div className="h-48 flex items-end gap-3 pt-6 px-2">
              {metrics?.dailyRevenue.map((d) => {
                const max = 32000000;
                const heightPct = Math.round((d.amount / max) * 100);
                return (
                  <div key={d.date} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="w-full bg-zinc-800/80 rounded-t-xl group-hover:bg-rose-500 transition-colors relative flex items-end" style={{ height: `${heightPct}%` }}>
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-900 border border-zinc-700 text-[10px] font-mono px-2 py-0.5 rounded text-white pointer-events-none whitespace-nowrap transition-opacity shadow-lg">
                        {formatNaira(d.amount)}
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-zinc-400 font-mono">{d.date}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Real-Time Audit Activity Log */}
          <div className="lg:col-span-5 p-6 rounded-3xl bg-zinc-900/50 border border-zinc-800/80 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800/60 pb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-rose-400" />
                <h4 className="text-sm font-black text-white">Live Governance Stream</h4>
              </div>
              <Link to="/audit-logs" className="text-xs font-bold text-rose-400 hover:text-rose-300">
                View All
              </Link>
            </div>

            <div className="space-y-3">
              {metrics?.recentActivity.map((act) => (
                <div key={act.id} className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800/70 space-y-1 text-xs">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-zinc-200">{act.actor}</span>
                    <span className="text-[10px] font-mono text-zinc-500">{act.timestamp}</span>
                  </div>
                  <p className="text-zinc-400 text-[11px] leading-relaxed">
                    {act.description}: <strong className="text-zinc-100">{act.target}</strong>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
