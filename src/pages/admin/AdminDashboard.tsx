import React, { useEffect, useState } from 'react';
import { 
  BadgeDollarSign, 
  Receipt, 
  Ticket, 
  Calendar, 
  Users, 
  Building, 
  ArrowUpRight,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { adminApi, type AdminDashboardStats, type AdminChartsResponse } from '../../api/admin';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [charts, setCharts] = useState<AdminChartsResponse | null>(null);
  const [period, setPeriod] = useState<string>('30d');
  const [loading, setLoading] = useState<boolean>(true);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const [statsData, chartsData] = await Promise.all([
        adminApi.getStats({ period }),
        adminApi.getCharts({ days: period === 'today' ? 1 : period === '7d' ? 7 : 30 }),
      ]);
      setStats(statsData);
      setCharts(chartsData);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [period]);

  const formatCurrency = (amount: number = 0) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white">Platform Health & KPIs</h2>
          <p className="text-xs text-slate-400 mt-0.5">Real-time financial reconciliation and platform velocity overview.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-1 flex gap-1 text-xs">
            {['today', '7d', '30d', 'all'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-all ${
                  period === p ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={fetchMetrics}
            disabled={loading}
            className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-rose-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Gross Merchandise Value</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <BadgeDollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white mt-3 font-mono">
            {formatCurrency(stats?.financials.gmv)}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 mt-2 font-mono">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{stats?.financials.paid_orders_count || 0} Paid Orders</span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Net Platform Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-400 mt-3 font-mono">
            {formatCurrency(stats?.financials.net_revenue)}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-2">
            <span>Collected platform fees</span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Escrow Balance</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-400 mt-3 font-mono">
            {formatCurrency(stats?.financials.active_escrow_balance)}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-2 font-mono">
            <span>Pending Payouts: {formatCurrency(stats?.financials.pending_payouts_amount)}</span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Tickets Sold</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Ticket className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white mt-3 font-mono">
            {(stats?.tickets.total_sold || 0).toLocaleString()}
          </p>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-2 font-mono">
            <span className="text-emerald-400">{stats?.tickets.paid_count || 0} Paid</span>
            <span>•</span>
            <span className="text-slate-400">{stats?.tickets.free_count || 0} Free</span>
          </div>
        </div>
      </div>

      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Events Ecosystem</span>
            <div className="text-lg font-bold text-white font-mono mt-0.5">
              {stats?.events.published || 0} Published <span className="text-xs text-slate-500">/ {stats?.events.total || 0} Total</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">{stats?.events.draft || 0} Drafts, {stats?.events.cancelled || 0} Cancelled</p>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Organizer Tenants</span>
            <div className="text-lg font-bold text-white font-mono mt-0.5">
              {stats?.community.total_organizers || 0} Registered
            </div>
            <p className="text-[11px] text-emerald-400 mt-0.5">
              {stats?.community.verified_organizers || 0} Verified • {stats?.community.pending_kyc_verifications || 0} Pending KYC
            </p>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">User Accounts</span>
            <div className="text-lg font-bold text-white font-mono mt-0.5">
              {stats?.community.total_users || 0} Registered
            </div>
            <p className="text-[11px] text-emerald-400 mt-0.5">{stats?.community.active_users || 0} Active accounts</p>
          </div>
        </div>
      </div>

      {/* Velocity Timeline Table */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 font-mono">
          Revenue & Ticket Sales Velocity (Past {charts?.days || 14} Days)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Daily GMV</th>
                <th className="py-2.5 px-3">Net Fee Revenue</th>
                <th className="py-2.5 px-3">Paid Orders</th>
                <th className="py-2.5 px-3">Tickets Issued</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-slate-300">
              {charts?.timeline.map((point) => (
                <tr key={point.date} className="hover:bg-slate-800/30">
                  <td className="py-2.5 px-3 text-slate-400">{point.date}</td>
                  <td className="py-2.5 px-3 font-semibold text-white">{formatCurrency(point.gmv)}</td>
                  <td className="py-2.5 px-3 text-rose-400">{formatCurrency(point.net_revenue)}</td>
                  <td className="py-2.5 px-3">{point.orders_count}</td>
                  <td className="py-2.5 px-3 text-emerald-400">{point.tickets_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

