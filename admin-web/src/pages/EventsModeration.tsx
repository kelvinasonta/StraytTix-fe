import React, { useEffect, useState } from 'react';
import { 
  Calendar, 
  Search, 
  Star, 
  Ban, 
  EyeOff, 
  AlertTriangle, 
  Users, 
  X 
} from 'lucide-react';
import { adminApi, type AdminEventItem } from '../api/admin';
import { Pagination, type PaginationMeta } from '../components/Pagination';

export const EventsModeration: React.FC = () => {
  const [events, setEvents] = useState<AdminEventItem[]>([]);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [moderatingEvent, setModeratingEvent] = useState<{ event: AdminEventItem; action: 'delist' | 'cancel' } | null>(null);
  const [reason, setReason] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [attendeeEvent, setAttendeeEvent] = useState<AdminEventItem | null>(null);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [attendeesLoading, setAttendeesLoading] = useState<boolean>(false);

  const fetchEvents = async (targetPage = page) => {
    setLoading(true);
    try {
      const data = await adminApi.getEvents({ 
        search: search || undefined, 
        status: status || undefined,
        page: targetPage,
      });

      if (data && data.data && Array.isArray(data.data)) {
        setEvents(data.data);
        setPaginationMeta({
          current_page: data.current_page || 1,
          last_page: data.last_page || 1,
          per_page: data.per_page || 15,
          total: data.total || data.data.length,
          from: data.from,
          to: data.to,
        });
      } else {
        setEvents(Array.isArray(data) ? data : []);
        setPaginationMeta(null);
      }
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchEvents(1);
  }, [status]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchEvents(newPage);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchEvents(1);
  };

  const handleToggleFeature = async (event: AdminEventItem) => {
    try {
      await adminApi.featureEvent(event.uuid, !event.is_featured);
      fetchEvents();
    } catch (err) {
      alert('Failed to update featured flag.');
    }
  };

  const handleModerationAction = async () => {
    if (!moderatingEvent || !reason) return;
    setActionLoading(true);
    try {
      if (moderatingEvent.action === 'delist') {
        await adminApi.delistEvent(moderatingEvent.event.uuid, reason);
      } else {
        await adminApi.cancelEvent(moderatingEvent.event.uuid, reason);
      }
      setModeratingEvent(null);
      setReason('');
      fetchEvents();
    } catch (err) {
      alert(`Failed to ${moderatingEvent.action} event.`);
    } finally {
      setActionLoading(false);
    }
  };

  const openAttendees = async (event: AdminEventItem) => {
    setAttendeeEvent(event);
    setAttendeesLoading(true);
    try {
      const data = await adminApi.getEventAttendees(event.uuid);
      setAttendees(data.data || []);
    } catch (err) {
      console.error('Failed to load attendees:', err);
    } finally {
      setAttendeesLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-white">Global Event Content Moderation</h2>
        <p className="text-xs text-zinc-400 mt-0.5">Audit live events across all organizers, delist policy violators, and feature curated showcases.</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
        <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-80">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -tranzinc-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by event title, slug or UUID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
            />
          </div>
          <button type="submit" className="px-3 py-2 bg-zinc-800 text-white rounded-xl text-xs font-semibold hover:bg-zinc-700">
            Search
          </button>
        </form>

        <div className="flex gap-2">
          {['', 'published', 'draft', 'cancelled'].map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-3 py-1.5 rounded-xl text-xs capitalize font-medium ${
                status === s ? 'bg-rose-600 text-white' : 'bg-zinc-900 border border-zinc-800 text-zinc-400'
              }`}
            >
              {s || 'All Statuses'}
            </button>
          ))}
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-950/80 text-zinc-400 uppercase text-[10px] font-mono">
            <tr>
              <th className="py-3 px-4">Event</th>
              <th className="py-3 px-4">Organizer</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Tickets</th>
              <th className="py-3 px-4">Featured</th>
              <th className="py-3 px-4 text-right">Moderation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
            {events.map((ev) => (
              <tr key={ev.uuid} className="hover:bg-zinc-800/20">
                <td className="py-3 px-4">
                  <div className="font-bold text-white">{ev.title}</div>
                  <div className="text-[11px] text-zinc-500 font-mono">/{ev.slug}</div>
                </td>
                <td className="py-3 px-4">
                  <span className="text-white font-medium">{ev.organizer?.name || 'Unknown'}</span>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                    ev.status === 'published'
                      ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                      : ev.status === 'cancelled'
                      ? 'bg-rose-950/60 text-rose-400 border border-rose-800/40'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {ev.status}
                  </span>
                </td>
                <td className="py-3 px-4 font-mono">{ev.tickets_count || 0}</td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => handleToggleFeature(ev)}
                    className={`p-1.5 rounded-lg border transition-colors ${
                      ev.is_featured
                        ? 'bg-amber-950/60 border-amber-800/50 text-amber-400'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-600 hover:text-zinc-400'
                    }`}
                    title={ev.is_featured ? 'Remove from featured' : 'Promote to featured'}
                  >
                    <Star className="w-3.5 h-3.5 fill-current" />
                  </button>
                </td>
                <td className="py-3 px-4 text-right space-x-1.5">
                  <button
                    onClick={() => openAttendees(ev)}
                    className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-[11px] font-semibold"
                  >
                    <Users className="w-3.5 h-3.5 inline mr-1" /> Manifest
                  </button>
                  {ev.status === 'published' && (
                    <button
                      onClick={() => setModeratingEvent({ event: ev, action: 'delist' })}
                      className="px-2.5 py-1 bg-amber-950/60 border border-amber-800/50 text-amber-300 hover:bg-amber-900 rounded-lg text-[11px] font-semibold"
                    >
                      <EyeOff className="w-3.5 h-3.5 inline mr-1" /> Delist
                    </button>
                  )}
                  {ev.status !== 'cancelled' && (
                    <button
                      onClick={() => setModeratingEvent({ event: ev, action: 'cancel' })}
                      className="px-2.5 py-1 bg-rose-950/60 border border-rose-800/50 text-rose-300 hover:bg-rose-900 rounded-lg text-[11px] font-semibold"
                    >
                      <Ban className="w-3.5 h-3.5 inline mr-1" /> Force Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {events.length === 0 && !loading && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-zinc-500">
                  No events found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <Pagination meta={paginationMeta} onPageChange={handlePageChange} loading={loading} />
      </div>

      {/* Moderation Reason Modal */}
      {moderatingEvent && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-2.5 text-rose-400 font-bold">
              <AlertTriangle className="w-5 h-5" />
              <span className="capitalize">Admin {moderatingEvent.action}: {moderatingEvent.event.title}</span>
            </div>
            <p className="text-xs text-zinc-400">
              This administrative action directly updates the live event status and dispatches an immutable governance audit log.
            </p>

            <div className="space-y-1">
              <label className="text-[11px] text-zinc-300 font-semibold">Mandatory Moderation Reason</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="State policy violation, misleading advertising or safety reason..."
                rows={3}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setModeratingEvent(null)}
                className="px-3 py-2 bg-zinc-800 text-zinc-300 hover:text-white rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleModerationAction}
                disabled={actionLoading || !reason}
                className="px-3 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold capitalize"
              >
                {actionLoading ? 'Executing...' : `Confirm ${moderatingEvent.action}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attendees Manifest Modal */}
      {attendeeEvent && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-base">Attendee Manifest: {attendeeEvent.title}</h3>
                <span className="text-[11px] text-zinc-500 font-mono">Emergency administrative roster inspection</span>
              </div>
              <button onClick={() => setAttendeeEvent(null)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {attendeesLoading ? (
              <div className="py-8 text-center text-xs text-zinc-400">Loading attendee records...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-950/80 text-zinc-400 uppercase text-[10px] font-mono">
                    <tr>
                      <th className="py-2.5 px-3">Ticket #</th>
                      <th className="py-2.5 px-3">Attendee</th>
                      <th className="py-2.5 px-3">Tier</th>
                      <th className="py-2.5 px-3">Price Paid</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50 text-zinc-300 font-mono">
                    {attendees.map((a: any) => (
                      <tr key={a.id}>
                        <td className="py-2.5 px-3 text-rose-400">{a.ticket_number}</td>
                        <td className="py-2.5 px-3 font-sans">
                          <div className="font-bold text-white">{a.attendee_name || 'N/A'}</div>
                          <div className="text-[11px] text-zinc-500">{a.attendee_email}</div>
                        </td>
                        <td className="py-2.5 px-3 font-sans text-zinc-300">{a.ticket_type?.name || 'General'}</td>
                        <td className="py-2.5 px-3 text-emerald-400">${a.price_paid || 0}</td>
                      </tr>
                    ))}
                    {attendees.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center py-6 text-zinc-500 font-sans">
                          No tickets issued for this event yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

