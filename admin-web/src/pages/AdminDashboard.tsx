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
  RefreshCw,
  Landmark,
  Coins,
  CreditCard,
  PieChart,
  ArrowDownRight,
  Activity,
  Layers,
  ShieldCheck
} from 'lucide-react';
import { adminApi, type AdminDashboardStats, type AdminChartsResponse } from '../api/admin';

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

  const gmv = stats?.financials.gmv || 0;
  const netRevenue = stats?.financials.net_revenue || 0;
  const escrow = stats?.financials.active_escrow_balance || 0;
  const paidOut = stats?.financials.total_paid_out || 0;
  const pendingPayouts = stats?.financials.pending_payouts_amount || 0;
  const takeRate = gmv > 0 ? ((netRevenue / gmv) * 100).toFixed(1) : '5.0';

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-zinc-850 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Activity className="w-6 h-6 text-rose-500" />
            <span>Platform Financial Health & Executive KPIs</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time ledger audit, company net revenue reconciliation, escrow liability, and ecosystem velocity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-1 flex gap-1 text-xs">
            {['today', '7d', '30d', 'all'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-all ${
                  period === p ? 'bg-rose-600 text-white shadow' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={fetchMetrics}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition text-xs font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-rose-500' : ''}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Primary Financial Overview Cards (Where The Company Revenue Is) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold font-mono uppercase text-zinc-400 tracking-wider flex items-center gap-2">
            <Landmark className="w-4 h-4 text-emerald-400" />
            <span>Treasury & Company Earnings Breakdown</span>
          </h3>
          <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            Real-time Ledger Connected
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Net Platform Revenue (Company Money) */}
          <div className="bg-zinc-900/60 border border-rose-500/30 rounded-2xl p-6 relative overflow-hidden backdrop-blur-xl shadow-lg shadow-rose-950/20 group">
            <div className="absolute top-0 right-0 w-28 h-28 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-all"></div>
            <div className="flex justify-between items-start relative z-10">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider font-mono">
                Company Net Revenue
              </span>
              <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
                <Coins className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-black text-white mt-3 font-mono tracking-tight relative z-10">
              {formatCurrency(netRevenue)}
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mt-2 font-mono relative z-10">
              <span className="text-emerald-400 font-bold">100% Retained</span>
              <span>•</span>
              <span>Platform Take-Rate: ~{takeRate}%</span>
            </div>
            <p className="text-[10px] text-zinc-500 mt-2">
              Non-refundable platform service fees deducted during ticket transactions.
            </p>
          </div>

          {/* Gross Merchandise Value */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 relative overflow-hidden backdrop-blur-xl">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">
                Gross Merch. Value (GMV)
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <BadgeDollarSign className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-black text-white mt-3 font-mono tracking-tight">
              {formatCurrency(gmv)}
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 mt-2 font-mono">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{stats?.financials.paid_orders_count || 0} Paid Orders Processed</span>
            </div>
            <p className="text-[10px] text-zinc-500 mt-2">
              Total transaction volume transacted across all organizer ticket tiers.
            </p>
          </div>

          {/* Active Escrow Balance */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 relative overflow-hidden backdrop-blur-xl">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">
                Active Escrow Vault
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                <Landmark className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-black text-amber-400 mt-3 font-mono tracking-tight">
              {formatCurrency(escrow)}
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mt-2 font-mono">
              <span>Pending Release: {formatCurrency(pendingPayouts)}</span>
            </div>
            <p className="text-[10px] text-zinc-500 mt-2">
              Organizer earnings secured in escrow until event execution and payout review.
            </p>
          </div>

          {/* Total Disbursed / Paid Out */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 relative overflow-hidden backdrop-blur-xl">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">
                Total Disbursed Payouts
              </span>
              <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-black text-white mt-3 font-mono tracking-tight">
              {formatCurrency(paidOut)}
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mt-2 font-mono">
              <span className="text-sky-400 font-bold">{stats?.financials.pending_payouts_count || 0} In Review Queue</span>
            </div>
            <p className="text-[10px] text-zinc-500 mt-2">
              Completed bank settlements released to verified organizer accounts.
            </p>
          </div>
        </div>
      </div>

      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Ticket Volume */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-zinc-400 font-medium">Tickets Issued</span>
            <div className="text-lg font-bold text-white font-mono mt-0.5">
              {(stats?.tickets.total_sold || 0).toLocaleString()} Passes
            </div>
            <p className="text-[11px] text-emerald-400 mt-0.5 font-mono">
              {stats?.tickets.paid_count || 0} Paid • {stats?.tickets.free_count || 0} Free
            </p>
          </div>
        </div>

        {/* Events Ecosystem */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/20">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-zinc-400 font-medium">Events Catalog</span>
            <div className="text-lg font-bold text-white font-mono mt-0.5">
              {stats?.events.published || 0} Live
            </div>
            <p className="text-[11px] text-zinc-500 mt-0.5 font-mono">
              {stats?.events.total || 0} Total • {stats?.events.draft || 0} Drafts
            </p>
          </div>
        </div>

        {/* Organizer Tenants */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/20">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-zinc-400 font-medium">Organizer Tenants</span>
            <div className="text-lg font-bold text-white font-mono mt-0.5">
              {stats?.community.total_organizers || 0} Verified
            </div>
            <p className="text-[11px] text-emerald-400 mt-0.5 font-mono">
              {stats?.community.verified_organizers || 0} KYC Approved
            </p>
          </div>
        </div>

        {/* User Accounts */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-zinc-400 font-medium">User Directory</span>
            <div className="text-lg font-bold text-white font-mono mt-0.5">
              {stats?.community.total_users || 0} Registered
            </div>
            <p className="text-[11px] text-emerald-400 mt-0.5 font-mono">
              {stats?.community.active_users || 0} Active Identities
            </p>
          </div>
        </div>
      </div>

      {/* Velocity Timeline Table */}
      <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-6 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-rose-500" />
            <span>Revenue Velocity Ledger (Past {charts?.days || 14} Days)</span>
          </h3>
          <span className="text-[11px] text-zinc-500 font-mono">Daily Settlement Points</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-zinc-950/60 text-zinc-400 uppercase text-[10px] border-b border-zinc-800">
              <tr>
                <th className="py-3 px-4">Settlement Date</th>
                <th className="py-3 px-4">Daily GMV</th>
                <th className="py-3 px-4">Company Net Revenue</th>
                <th className="py-3 px-4">Paid Orders</th>
                <th className="py-3 px-4 text-right">Tickets Issued</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50 text-zinc-300">
              {charts?.timeline.map((point) => (
                <tr key={point.date} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="py-3 px-4 text-zinc-400">{point.date}</td>
                  <td className="py-3 px-4 font-semibold text-white">{formatCurrency(point.gmv)}</td>
                  <td className="py-3 px-4 text-rose-400 font-bold">{formatCurrency(point.net_revenue)}</td>
                  <td className="py-3 px-4 text-zinc-300">{point.orders_count} orders</td>
                  <td className="py-3 px-4 text-right text-emerald-400 font-bold">{point.tickets_count} passes</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
