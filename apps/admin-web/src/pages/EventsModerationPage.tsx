import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { adminApi } from '../api/adminClient';
import type { ManagedEvent } from '../types/admin';
import {
  Calendar,
  Search,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  DollarSign,
  Ticket,
  Filter
} from 'lucide-react';

export const EventsModerationPage: React.FC = () => {
  const [events, setEvents] = useState<ManagedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getEvents();
      setEvents(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleUpdateStatus = async (eventId: string, status: 'Published' | 'Takedown' | 'Draft') => {
    await adminApi.updateEventStatus(eventId, status);
    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, status } : e))
    );
  };

  const filtered = events.filter((e) => {
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.organizer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const formatNaira = (amt: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0
    }).format(amt);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-5">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <Calendar className="w-6 h-6 text-rose-500" />
              <span>Events Moderation & Marketplace Oversight</span>
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm font-medium">
              Review flagged experiences, issue takedowns on scam events, and inspect marketplace ticket sales.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-900/50 p-3 rounded-2xl border border-zinc-800">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search event title or organizer..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-rose-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {['all', 'Published', 'Flagged', 'Takedown'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                  statusFilter === s
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Events Table */}
        <div className="bg-zinc-900/50 rounded-3xl border border-zinc-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950/60 border-b border-zinc-800 text-zinc-400 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Event Experience</th>
                  <th className="px-5 py-3.5">Organizer</th>
                  <th className="px-5 py-3.5">Sales / GMV</th>
                  <th className="px-5 py-3.5">Reports</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Moderator Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850">
                {filtered.map((evt) => (
                  <tr key={evt.id} className="hover:bg-zinc-850/40 transition-colors">
                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        <span className="font-bold text-white text-sm block">{evt.title}</span>
                        <span className="text-zinc-500 text-[11px] font-mono">
                          {evt.category} • {evt.date}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4 font-medium text-zinc-300">
                      {evt.organizer}
                    </td>

                    <td className="px-5 py-4 font-mono">
                      <span className="text-white font-bold block">{formatNaira(evt.revenue)}</span>
                      <span className="text-zinc-500 text-[11px]">{evt.ticketsSold.toLocaleString()} tickets sold</span>
                    </td>

                    <td className="px-5 py-4 font-mono">
                      {evt.reportsCount > 0 ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1 w-max">
                          <AlertTriangle className="w-3 h-3" />
                          <span>{evt.reportsCount} Reports</span>
                        </span>
                      ) : (
                        <span className="text-zinc-500">0 reports</span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          evt.status === 'Published'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : evt.status === 'Flagged'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {evt.status}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {evt.status !== 'Published' && (
                          <button
                            onClick={() => handleUpdateStatus(evt.id, 'Published')}
                            className="px-2.5 py-1 bg-zinc-800 hover:bg-emerald-600 text-white rounded-lg text-[11px] font-bold cursor-pointer transition-colors"
                          >
                            Reinstate
                          </button>
                        )}
                        {evt.status !== 'Takedown' && (
                          <button
                            onClick={() => handleUpdateStatus(evt.id, 'Takedown')}
                            className="px-2.5 py-1 bg-zinc-800 hover:bg-rose-600 text-rose-300 hover:text-white rounded-lg text-[11px] font-bold cursor-pointer transition-colors"
                          >
                            Take Down
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
