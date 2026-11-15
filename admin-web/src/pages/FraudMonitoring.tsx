import React, { useState } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  Lock,
  Unlock,
  Radio,
  Flame,
  UserX,
  CreditCard,
  Building,
  RefreshCw,
  TrendingUp,
  MapPin,
  ExternalLink,
  X
} from 'lucide-react';

interface RiskIncident {
  id: string;
  incident_number: string;
  target_type: 'organizer' | 'buyer' | 'transaction';
  target_name: string;
  target_email?: string;
  risk_score: number; // 0 - 100
  risk_tier: 'critical' | 'high' | 'medium' | 'low';
  status: 'under_investigation' | 'action_taken' | 'whitelisted';
  primary_reason: string;
  ip_address: string;
  country: string;
  created_at: string;
}

const SAMPLE_INCIDENTS: RiskIncident[] = [
  {
    id: 'inc-001',
    incident_number: 'RSK-2026-081',
    target_type: 'buyer',
    target_name: 'Card Velocity Probe',
    target_email: 'test_carder99@tempmail.com',
    risk_score: 94,
    risk_tier: 'critical',
    status: 'under_investigation',
    primary_reason: '14 failed BIN card testing authorizations within 180 seconds across 3 events.',
    ip_address: '185.220.101.44 (Tor Exit Node)',
    country: 'DE',
    created_at: '2026-11-12 09:12:00',
  },
  {
    id: 'inc-002',
    incident_number: 'RSK-2026-082',
    target_type: 'organizer',
    target_name: 'Vanguard VIP Pass Corp',
    target_email: 'vanguard.sales@fastmail.fm',
    risk_score: 78,
    risk_tier: 'high',
    status: 'under_investigation',
    primary_reason: 'High-ticket event launched 20 minutes after KYC submission with mismatched payout bank name.',
    ip_address: '102.89.22.14',
    country: 'NG',
    created_at: '2026-11-12 07:44:00',
  },
  {
    id: 'inc-003',
    incident_number: 'RSK-2026-083',
    target_type: 'transaction',
    target_name: 'Order #ORD-99120',
    target_email: 'buyer.samuel@gmail.com',
    risk_score: 45,
    risk_tier: 'medium',
    status: 'whitelisted',
    primary_reason: 'Mismatched billing postal code vs IP geo-location (Legitimate roaming attendee).',
    ip_address: '197.210.45.109',
    country: 'NG',
    created_at: '2026-11-11 16:30:00',
  },
];

export const FraudMonitoring: React.FC = () => {
  const [incidents, setIncidents] = useState<RiskIncident[]>(SAMPLE_INCIDENTS);
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [selectedIncident, setSelectedIncident] = useState<RiskIncident | null>(null);

  const filtered = incidents.filter((i) => {
    const matchesSearch =
      !search.trim() ||
      i.incident_number.toLowerCase().includes(search.toLowerCase()) ||
      i.target_name.toLowerCase().includes(search.toLowerCase()) ||
      (i.target_email && i.target_email.toLowerCase().includes(search.toLowerCase())) ||
      i.primary_reason.toLowerCase().includes(search.toLowerCase());
    const matchesTier = tierFilter === 'all' || i.risk_tier === tierFilter;
    return matchesSearch && matchesTier;
  });

  const handleMitigate = (id: string, action: 'block' | 'whitelist') => {
    setIncidents((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, status: action === 'block' ? 'action_taken' : 'whitelisted' }
          : i
      )
    );
    setSelectedIncident(null);
  };

  const getTierBadge = (tier: string, score: number) => {
    switch (tier) {
      case 'critical':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-rose-500/10 text-rose-400 border border-rose-500/30 font-bold flex items-center gap-1">
            <Flame className="w-3 h-3" />
            <span>Critical ({score})</span>
          </span>
        );
      case 'high':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-orange-500/10 text-orange-400 border border-orange-500/30 font-bold">
            High ({score})
          </span>
        );
      case 'medium':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold">
            Medium ({score})
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
            Low ({score})
          </span>
        );
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-850 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <ShieldAlert className="w-6 h-6 text-rose-500" />
            <span>Heuristic Risk & Fraud Sentinel</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Automated anomaly detection: card velocity probing, high-velocity chargeback vectors, and suspicious organizer activities.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 font-mono text-xs font-bold flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Sentinel Daemon Live</span>
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by incident #, target, reason, or IP..."
            className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500/60"
          />
        </div>

        <div className="flex gap-1.5">
          {['all', 'critical', 'high', 'medium', 'low'].map((tier) => (
            <button
              key={tier}
              onClick={() => setTierFilter(tier)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono uppercase font-bold transition border ${
                tierFilter === tier
                  ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                  : 'bg-zinc-900/60 text-zinc-400 border-zinc-800/80 hover:text-white'
              }`}
            >
              {tier}
            </button>
          ))}
        </div>
      </div>

      {/* Incidents Table */}
      <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl overflow-hidden backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/80 text-zinc-400 uppercase text-[10px] font-mono border-b border-zinc-800/80">
              <tr>
                <th className="py-3 px-4">Incident #</th>
                <th className="py-3 px-4">Entity Type</th>
                <th className="py-3 px-4">Target / Suspect</th>
                <th className="py-3 px-4">Risk Severity</th>
                <th className="py-3 px-4">Threat Description</th>
                <th className="py-3 px-4">Origin IP</th>
                <th className="py-3 px-4 text-right">Defense Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50 text-zinc-300">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-white whitespace-nowrap">
                    {item.incident_number}
                  </td>
                  <td className="py-3.5 px-4 uppercase font-mono text-[10px] text-zinc-400 whitespace-nowrap">
                    {item.target_type}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <p className="font-semibold text-white">{item.target_name}</p>
                    <p className="text-[10px] text-zinc-500 font-mono">{item.target_email || 'N/A'}</p>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {getTierBadge(item.risk_tier, item.risk_score)}
                  </td>
                  <td className="py-3.5 px-4 max-w-sm truncate text-zinc-300" title={item.primary_reason}>
                    {item.primary_reason}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-zinc-400 whitespace-nowrap">
                    {item.ip_address}
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-1.5">
                    <button
                      onClick={() => setSelectedIncident(item)}
                      className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-[11px] font-semibold transition"
                    >
                      Investigate
                    </button>
                    {item.status === 'under_investigation' && (
                      <button
                        onClick={() => handleMitigate(item.id, 'block')}
                        className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-400 border border-rose-500/20 rounded-lg text-[11px] font-semibold transition"
                      >
                        Blacklist
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Investigation Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                <span>Security Incident File • {selectedIncident.incident_number}</span>
              </h3>
              <button onClick={() => setSelectedIncident(null)} className="text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-mono text-zinc-500">Heuristic Violation Analysis</span>
                <p className="text-zinc-200">{selectedIncident.primary_reason}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono text-[11px]">
                <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl">
                  <span className="text-zinc-500 uppercase block text-[10px]">Client Fingerprint</span>
                  <span className="text-white font-bold">{selectedIncident.ip_address}</span>
                </div>
                <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl">
                  <span className="text-zinc-500 uppercase block text-[10px]">Heuristic Score</span>
                  <span className="text-rose-400 font-bold">{selectedIncident.risk_score} / 100</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => handleMitigate(selectedIncident.id, 'whitelist')}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-semibold"
              >
                Whitelist Entity
              </button>
              <button
                onClick={() => handleMitigate(selectedIncident.id, 'block')}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold"
              >
                Authorize Blacklist & Lock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

