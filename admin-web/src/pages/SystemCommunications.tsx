import React, { useState } from 'react';
import {
  Megaphone,
  Search,
  Bell,
  Mail,
  Send,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Users,
  Radio,
  Clock,
  Sparkles,
  ExternalLink,
  X
} from 'lucide-react';

interface BroadcastMessage {
  id: string;
  title: string;
  target_audience: 'all_users' | 'organizers_only' | 'attendees_only';
  channel: 'in_app_banner' | 'transactional_email' | 'system_modal';
  severity: 'info' | 'warning' | 'critical';
  body: string;
  sent_at: string;
  delivered_count: number;
}

const SAMPLE_BROADCASTS: BroadcastMessage[] = [
  {
    id: 'bc-001',
    title: 'Scheduled Payment Gateway Maintenance (Paystack Direct Debit)',
    target_audience: 'organizers_only',
    channel: 'in_app_banner',
    severity: 'warning',
    body: 'Paystack will undergo core banking node updates on Sunday 02:00 AM UTC. Direct bank transfers may experience intermittent timeouts.',
    sent_at: '2026-11-12 06:00:00',
    delivered_count: 142,
  },
  {
    id: 'bc-002',
    title: 'High-Density Scanner V2 Offline Mode Released',
    target_audience: 'organizers_only',
    channel: 'in_app_banner',
    severity: 'info',
    body: 'Turnstile gate teams can now scan tickets in areas with poor cellular service using cached attendee rosters.',
    sent_at: '2026-11-10 14:30:00',
    delivered_count: 142,
  },
];

export const SystemCommunications: React.FC = () => {
  const [broadcasts, setBroadcasts] = useState<BroadcastMessage[]>(SAMPLE_BROADCASTS);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newBody, setNewBody] = useState<string>('');
  const [audience, setAudience] = useState<'all_users' | 'organizers_only' | 'attendees_only'>('all_users');
  const [channel, setChannel] = useState<'in_app_banner' | 'transactional_email' | 'system_modal'>('in_app_banner');
  const [severity, setSeverity] = useState<'info' | 'warning' | 'critical'>('info');
  const [isDispatching, setIsDispatching] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newBody.trim()) return;

    setIsDispatching(true);
    setTimeout(() => {
      const item: BroadcastMessage = {
        id: `bc-${Date.now()}`,
        title: newTitle,
        body: newBody,
        target_audience: audience,
        channel,
        severity,
        sent_at: new Date().toLocaleString(),
        delivered_count: audience === 'all_users' ? 840 : 142,
      };

      setBroadcasts([item, ...broadcasts]);
      setIsDispatching(false);
      setSuccess(true);
      setNewTitle('');
      setNewBody('');
      setTimeout(() => setSuccess(false), 4000);
    }, 700);
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-850 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Megaphone className="w-6 h-6 text-rose-500" />
            <span>Platform Communications & Global Broadcasts</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Dispatch urgent maintenance alerts, in-app notification banners, and mass emails across attendees and organizer tenants.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-zinc-400">Notification Dispatcher Online</span>
        </div>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>Global platform communication broadcast queued and dispatched across selected audience channels.</span>
        </div>
      )}

      {/* Broadcast Form */}
      <form onSubmit={handleDispatch} className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-7 space-y-5 backdrop-blur-xl">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Radio className="w-4 h-4 text-rose-500" />
          <span>Create New Urgent Platform Broadcast</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1">
            <label className="text-zinc-300 font-semibold">Target Audience</label>
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value as any)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
            >
              <option value="all_users">All Platform Users (Attendees + Organizers)</option>
              <option value="organizers_only">Organizer Tenants & Event Staff Only</option>
              <option value="attendees_only">Ticket Buyers & Attendees Only</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-zinc-300 font-semibold">Delivery Surface</label>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value as any)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
            >
              <option value="in_app_banner">Persistent In-App Top Banner</option>
              <option value="transactional_email">High-Priority Email Notification</option>
              <option value="system_modal">Login Interstitial Modal</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-zinc-300 font-semibold">Severity Level</label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value as any)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
            >
              <option value="info">Info (Blue/Zinc)</option>
              <option value="warning">Warning / Maintenance (Amber)</option>
              <option value="critical">Critical / Incident (Rose)</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5 text-xs">
          <label className="text-zinc-300 font-semibold">Broadcast Subject / Headline</label>
          <input
            type="text"
            required
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="e.g., Scheduled Maintenance Downtime or Emergency Policy Update..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-500"
          />
        </div>

        <div className="space-y-1.5 text-xs">
          <label className="text-zinc-300 font-semibold">Message Body</label>
          <textarea
            rows={3}
            required
            value={newBody}
            onChange={(e) => setNewBody(e.target.value)}
            placeholder="Detailed explanation of the announcement, required actions, or timeframe..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-rose-500"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isDispatching}
            className="px-6 py-2.5 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/30 flex items-center gap-2 transition disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{isDispatching ? 'Transmitting Broadcast...' : 'Dispatch Broadcast'}</span>
          </button>
        </div>
      </form>

      {/* Broadcast History Table */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold font-mono uppercase text-zinc-400 tracking-wider">
          Recent Platform Broadcast Transmissions
        </h3>

        <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl overflow-hidden backdrop-blur-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/80 text-zinc-400 uppercase text-[10px] font-mono border-b border-zinc-800/80">
              <tr>
                <th className="py-3 px-4">Headline</th>
                <th className="py-3 px-4">Target Group</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Dispatched At</th>
                <th className="py-3 px-4 text-right">Recipients</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50 text-zinc-300">
              {broadcasts.map((b) => (
                <tr key={b.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-white text-xs">{b.title}</p>
                    <p className="text-[11px] text-zinc-400 truncate max-w-md mt-0.5">{b.body}</p>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-zinc-300 whitespace-nowrap">
                    {b.target_audience.replace('_', ' ')}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-zinc-400 whitespace-nowrap">
                    {b.channel.replace(/_/g, ' ')}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                        b.severity === 'critical'
                          ? 'bg-rose-500/10 text-rose-400'
                          : b.severity === 'warning'
                          ? 'bg-amber-500/10 text-amber-400'
                          : 'bg-indigo-500/10 text-indigo-400'
                      }`}
                    >
                      {b.severity}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-zinc-500 whitespace-nowrap">
                    {b.sent_at}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-right font-bold text-white whitespace-nowrap">
                    {b.delivered_count} accounts
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

