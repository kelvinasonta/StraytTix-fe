import React, { useState } from 'react';
import { AdminLayout } from '../components/AdminLayout';
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
  ExternalLink
} from 'lucide-react';

interface FraudIndicator {
  rule: string;
  weight: number;
  description: string;
}

interface RiskIncident {
  id: string;
  incident_number: string;
  target_type: 'organizer' | 'buyer' | 'transaction' | 'event';
  target_id: string;
  target_name: string;
  target_email?: string;
  risk_score: number; // 0 - 100
  risk_tier: 'critical' | 'high' | 'medium' | 'low';
  status: 'under_investigation' | 'action_taken' | 'whitelisted' | 'escalated';
  indicators: FraudIndicator[];
  primary_reason: string;
  velocity_details: {
    cards_attempted?: number;
    failures_last_hour?: number;
    suspicious_volume?: string;
    ip_geolocation?: string;
    device_fingerprint?: string;
  };
  action_history?: {
    action: string;
    by: string;
    timestamp: string;
    notes: string;
  }[];
  created_at: string;
}

const INITIAL_INCIDENTS: RiskIncident[] = [
  {
    id: 'risk-001',
    incident_number: 'RSK-2026-108',
    target_type: 'buyer',
    target_id: 'usr-card-bot-91',
    target_name: 'David Adeleke Jr.',
    target_email: 'david.adeleke@sample.org',
    risk_score: 94,
    risk_tier: 'critical',
    status: 'under_investigation',
    primary_reason: 'Card velocity attack: 14 distinct credit cards tested within 4 minutes on VIP tables.',
    indicators: [
      { rule: 'BIN_ATTACK_PATTERN', weight: 40, description: 'Rapid sequential card PAN expiration and CVV permutations.' },
      { rule: 'TOR_EXIT_NODE_USED', weight: 30, description: 'Source IP detected as public TOR exit node.' },
      { rule: 'HIGH_VELOCITY_FAILURES', weight: 24, description: '12 failed authorization debits followed by 2 successes.' }
    ],
    velocity_details: {
      cards_attempted: 14,
      failures_last_hour: 12,
      suspicious_volume: '₦1,050,000 across 2 orders',
      ip_geolocation: 'Frankfurt, Germany (TOR Node)',
      device_fingerprint: 'fp_a98218903189'
    },
    created_at: '2026-10-15 05:12:00'
  },
  {
    id: 'risk-002',
    incident_number: 'RSK-2026-109',
    target_type: 'organizer',
    target_id: 'org-fake-fest-01',
    target_name: 'Golden Vibes Global Inc',
    target_email: 'finance@goldenvibes.xyz',
    risk_score: 82,
    risk_tier: 'high',
    status: 'under_investigation',
    primary_reason: 'Abnormal ticket sales spike on unverified brand-new organizer profile within 48h of creation.',
    indicators: [
      { rule: 'UNVERIFIED_HIGH_VOLUME', weight: 35, description: 'Generated >₦8.5M in sales within 2 days with pending CAC doc.' },
      { rule: 'DISPOSABLE_DOMAIN', weight: 25, description: 'Official email domain registered 5 days ago.' },
      { rule: 'IMMEDIATE_PAYOUT_REQUEST', weight: 22, description: 'Triggered maximum settlement request before event date.' }
    ],
    velocity_details: {
      suspicious_volume: '₦8,500,000 ticket gross',
      ip_geolocation: 'Lagos, Nigeria',
      device_fingerprint: 'fp_901239102830'
    },
    created_at: '2026-10-14 22:30:00'
  },
  {
    id: 'risk-003',
    incident_number: 'RSK-2026-110',
    target_type: 'transaction',
    target_id: 'ord-8109-2919',
    target_name: 'Chioma Okonkwo (Order EOS-2026-9022-BC)',
    target_email: 'chioma.o@outlook.com',
    risk_score: 48,
    risk_tier: 'medium',
    status: 'whitelisted',
    primary_reason: 'High transaction amount (₦150,000) from new IP address.',
    indicators: [
      { rule: 'FIRST_TIME_HIGH_VALUE', weight: 28, description: 'Single checkout > ₦100,000 from newly registered attendee.' },
      { rule: 'GEO_MISMATCH', weight: 20, description: 'Billing address in Abuja, browser IP in Port Harcourt.' }
    ],
    velocity_details: {
      suspicious_volume: '₦150,000 table pass',
      ip_geolocation: 'Port Harcourt, Nigeria',
      device_fingerprint: 'fp_449018239012'
    },
    action_history: [
      {
        action: 'Whitelisted Order',
        by: 'Sarah Connor (Trust & Safety)',
        timestamp: '2026-10-15 04:20:00',
        notes: 'Customer confirmed purchase via 2FA and verified ID.'
      }
    ],
    created_at: '2026-10-15 04:15:00'
  }
];

export const FraudMonitoringPage: React.FC = () => {
  const [incidents, setIncidents] = useState<RiskIncident[]>(INITIAL_INCIDENTS);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedIncident, setSelectedIncident] = useState<RiskIncident | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const filteredIncidents = incidents.filter((inc) => {
    const matchesSearch =
      inc.incident_number.toLowerCase().includes(search.toLowerCase()) ||
      inc.target_name.toLowerCase().includes(search.toLowerCase()) ||
      (inc.target_email && inc.target_email.toLowerCase().includes(search.toLowerCase())) ||
      inc.primary_reason.toLowerCase().includes(search.toLowerCase());

    const matchesTier = tierFilter === 'all' || inc.risk_tier === tierFilter;
    const matchesStatus = statusFilter === 'all' || inc.status === statusFilter;

    return matchesSearch && matchesTier && matchesStatus;
  });

  const handleFreezeEntity = (incidentId: string) => {
    setIncidents((prev) =>
      prev.map((i) =>
        i.id === incidentId
          ? {
              ...i,
              status: 'action_taken',
              action_history: [
                ...(i.action_history || []),
                {
                  action: 'Entity Suspended & Payouts Frozen',
                  by: 'Trust & Safety Administrator',
                  timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
                  notes: 'Immediate suspension executed based on critical risk indicator match.'
                }
              ]
            }
          : i
      )
    );
    if (selectedIncident && selectedIncident.id === incidentId) {
      setSelectedIncident((prev) =>
        prev ? { ...prev, status: 'action_taken' } : null
      );
    }
    setActionNotice('Target entity suspended, cards blocked, and payouts immediately frozen.');
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleWhitelist = (incidentId: string) => {
    setIncidents((prev) =>
      prev.map((i) =>
        i.id === incidentId
          ? {
              ...i,
              status: 'whitelisted',
              action_history: [
                ...(i.action_history || []),
                {
                  action: 'Flag Cleared (Whitelisted)',
                  by: 'Trust & Safety Administrator',
                  timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
                  notes: 'Manual verification confirmed legitimate user activity.'
                }
              ]
            }
          : i
      )
    );
    if (selectedIncident && selectedIncident.id === incidentId) {
      setSelectedIncident((prev) =>
        prev ? { ...prev, status: 'whitelisted' } : null
      );
    }
    setActionNotice('Risk incident cleared. Target whitelisted in heuristic engine.');
    setTimeout(() => setActionNotice(null), 4000);
  };

  const getTierBadge = (tier: RiskIncident['risk_tier'], score: number) => {
    switch (tier) {
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <Flame className="w-3 h-3" /> Critical ({score}/100)
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3 h-3" /> High ({score}/100)
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            Medium ({score}/100)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-zinc-800 text-zinc-400 border border-zinc-700">
            Low ({score}/100)
          </span>
        );
    }
  };

  const getStatusBadge = (status: RiskIncident['status']) => {
    switch (status) {
      case 'action_taken':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Lock className="w-3 h-3" /> Frozen / Action Taken
          </span>
        );
      case 'whitelisted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" /> Whitelisted
          </span>
        );
      case 'escalated':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-500/10 text-purple-400 border border-purple-500/20">
            Escalated to Legal
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Under Investigation
          </span>
        );
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-5">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
              <ShieldAlert className="w-6 h-6 text-rose-500" />
              <span>Fraud Detection & Risk Watchtower</span>
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Automated heuristics monitor card velocity, TOR exits, suspicious organizer volumes, and coordinated bot checkouts.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-3 py-1 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400">
              Active Alerts: <strong className="text-rose-400">2</strong>
            </span>
            <span className="px-3 py-1 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400">
              Heuristic Engine: <strong className="text-emerald-400">Shield v3.1 Live</strong>
            </span>
          </div>
        </div>

        {actionNotice && (
          <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{actionNotice}</span>
            </div>
            <button onClick={() => setActionNotice(null)} className="text-emerald-400 hover:text-white">✕</button>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by Incident #, Entity Name, Email, or Risk Pattern..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-900/60 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-rose-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-zinc-500" />
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="bg-zinc-900/60 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-hidden focus:border-rose-500"
            >
              <option value="all">All Risk Tiers</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-zinc-900/60 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-hidden focus:border-rose-500"
            >
              <option value="all">All Statuses</option>
              <option value="under_investigation">Under Investigation</option>
              <option value="action_taken">Frozen / Action Taken</option>
              <option value="whitelisted">Whitelisted</option>
            </select>
          </div>
        </div>

        {/* Incidents Table */}
        <div className="rounded-2xl bg-zinc-900/40 border border-zinc-850 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/80 border-b border-zinc-800 text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Incident #</th>
                  <th className="py-3 px-4">Target Entity</th>
                  <th className="py-3 px-4">Risk Severity</th>
                  <th className="py-3 px-4">Primary Heuristic Flag</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Detected At</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                {filteredIncidents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-zinc-500">
                      No security or fraud incidents found.
                    </td>
                  </tr>
                ) : (
                  filteredIncidents.map((inc) => (
                    <tr key={inc.id} className="hover:bg-zinc-850/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-white">
                        {inc.incident_number}
                        <span className="text-[10px] text-zinc-500 block uppercase font-normal">
                          {inc.target_type}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-white block">{inc.target_name}</span>
                        {inc.target_email && (
                          <span className="text-zinc-500 text-[11px] block">{inc.target_email}</span>
                        )}
                      </td>

                      <td className="py-3 px-4">{getTierBadge(inc.risk_tier, inc.risk_score)}</td>

                      <td className="py-3 px-4 max-w-xs">
                        <span className="text-zinc-300 text-xs block truncate font-medium">
                          {inc.primary_reason}
                        </span>
                      </td>

                      <td className="py-3 px-4">{getStatusBadge(inc.status)}</td>

                      <td className="py-3 px-4 font-mono text-[11px] text-zinc-500">{inc.created_at}</td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedIncident(inc)}
                          className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Investigate</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Investigation Modal */}
        {selectedIncident && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-zinc-900 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-lg text-white font-mono">{selectedIncident.incident_number}</span>
                    {getTierBadge(selectedIncident.risk_tier, selectedIncident.risk_score)}
                    {getStatusBadge(selectedIncident.status)}
                  </div>
                  <span className="text-xs text-zinc-500 block mt-0.5">
                    Target: {selectedIncident.target_name} ({selectedIncident.target_id})
                  </span>
                </div>
                <button
                  onClick={() => setSelectedIncident(null)}
                  className="text-zinc-500 hover:text-white p-1 rounded-lg"
                >
                  ✕
                </button>
              </div>

              {/* Heuristic Trigger Indicators */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                  Triggered Heuristic Indicators
                </span>
                <div className="space-y-2">
                  {selectedIncident.indicators.map((ind, i) => (
                    <div key={i} className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-850 flex items-center justify-between text-xs">
                      <div>
                        <strong className="text-rose-400 font-mono block text-[11px]">{ind.rule}</strong>
                        <span className="text-zinc-300">{ind.description}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono text-[10px] font-bold">
                        +{ind.weight} pts
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Telemetry & Device Data */}
              <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-850 space-y-2 text-xs">
                <span className="text-zinc-400 font-bold block uppercase text-[10px]">
                  Network & Geolocation Telemetry
                </span>
                <div className="grid grid-cols-2 gap-3 text-zinc-300 font-mono text-[11px]">
                  {selectedIncident.velocity_details.ip_geolocation && (
                    <div>
                      <span className="text-zinc-500 block uppercase text-[9px] font-sans">Origin Location</span>
                      <strong className="text-white">{selectedIncident.velocity_details.ip_geolocation}</strong>
                    </div>
                  )}
                  {selectedIncident.velocity_details.suspicious_volume && (
                    <div>
                      <span className="text-zinc-500 block uppercase text-[9px] font-sans">Involved Volume</span>
                      <strong className="text-rose-400">{selectedIncident.velocity_details.suspicious_volume}</strong>
                    </div>
                  )}
                  {selectedIncident.velocity_details.cards_attempted && (
                    <div>
                      <span className="text-zinc-500 block uppercase text-[9px] font-sans">Cards Attempted</span>
                      <strong className="text-white">{selectedIncident.velocity_details.cards_attempted} distinct PANs</strong>
                    </div>
                  )}
                  {selectedIncident.velocity_details.device_fingerprint && (
                    <div>
                      <span className="text-zinc-500 block uppercase text-[9px] font-sans">Device Fingerprint</span>
                      <strong className="text-zinc-400">{selectedIncident.velocity_details.device_fingerprint}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Prior Action History */}
              {selectedIncident.action_history && selectedIncident.action_history.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-zinc-900/30 border border-zinc-850 space-y-2 text-xs">
                  <span className="text-zinc-500 font-bold uppercase text-[10px] block">Investigation Decision Log</span>
                  {selectedIncident.action_history.map((act, idx) => (
                    <div key={idx} className="text-zinc-300 space-y-0.5 border-b border-zinc-900 pb-2 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between text-[11px]">
                        <strong className="text-emerald-400">{act.action}</strong>
                        <span className="text-zinc-500 font-mono">{act.timestamp}</span>
                      </div>
                      <p className="text-zinc-400">{act.notes} — <em>{act.by}</em></p>
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="border-t border-zinc-900 pt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {selectedIncident.status !== 'action_taken' && (
                    <button
                      onClick={() => handleFreezeEntity(selectedIncident.id)}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Freeze Account & Payouts</span>
                    </button>
                  )}

                  {selectedIncident.status !== 'whitelisted' && (
                    <button
                      onClick={() => handleWhitelist(selectedIncident.id)}
                      className="px-4 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Clear & Whitelist</span>
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setSelectedIncident(null)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
