import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import OrganizerDashboardLayout from '../../components/layout/OrganizerDashboardLayout';
import { formatCurrency, formatDate } from '../../utils/format';
import { PlusCircle, Eye, Edit, Trash2, RefreshCw, Loader2, AlertCircle, Calendar, Search, Filter, Sparkles, Ticket } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { eventApi, normalizeBackendEvent } from '../../api/events';
import { getApiErrorMessage } from '../../api/client';
import { resolveOrganizerRole, getRolePermissions } from '../../utils/permissions';
import { QrCode } from 'lucide-react';
import type { Event } from '../../types/api';

export const Events: React.FC = () => {
  const { organizer } = useAuth();
  const { showNotification } = useNotification();

  const role = resolveOrganizerRole(organizer);
  const perms = getRolePermissions(role);

  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'All' | 'Published' | 'Draft' | 'Upcoming'>('All');

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    eventId?: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
  });

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await eventApi.getOrganizerEvents(organizer?.id);
      const rawData = res.data;
      const rawList: any[] = Array.isArray(rawData)
        ? rawData
        : Array.isArray((rawData as any)?.data)
          ? (rawData as any).data
          : Array.isArray((rawData as any)?.events)
            ? (rawData as any).events
            : [];
      const items = rawList.map(normalizeBackendEvent);
      setEvents(items);
    } catch (err: any) {
      console.error('Failed to load organizer events:', err);
      setEvents([]);
      setError(getApiErrorMessage(err, 'Unable to fetch organizer events.'));
    } finally {
      setIsLoading(false);
    }
  }, [organizer?.id]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Published': return 'success';
      case 'Upcoming': return 'info';
      case 'Draft': return 'default';
      case 'Cancelled': return 'error';
      default: return 'default';
    }
  };

  const handleDeletePrompt = (id: string, title: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Event Listing',
      message: `Are you sure you want to delete "${title}"? This action cannot be undone and will cancel all active ticket tiers.`,
      eventId: id,
    });
  };

  const handleConfirmDelete = async () => {
    if (!confirmDialog.eventId) return;
    const targetId = String(confirmDialog.eventId);
    // Immediately remove from list optimistically so UI updates without reload
    setEvents(prev => prev.filter(e =>
      String(e.id) !== targetId &&
      String((e as any).uuid) !== targetId &&
      String(e.slug) !== targetId
    ));
    try {
      await eventApi.deleteEvent(targetId, organizer?.id);
      showNotification('Event successfully deleted.', 'info');
    } catch (err: any) {
      showNotification(getApiErrorMessage(err, 'Failed to delete event.'), 'error');
      fetchEvents();
    } finally {
      setConfirmDialog({ isOpen: false, title: '', message: '' });
    }
  };

  const handlePublish = async (eventId: string, title: string, ticketsCount?: number) => {
    if (ticketsCount !== undefined && ticketsCount === 0) {
      showNotification('Cannot publish event: You must create at least one ticket tier before publishing live.', 'warning');
      return;
    }
    try {
      await eventApi.publishEvent(eventId, organizer?.id);
      showNotification(`"${title}" published successfully.`, 'success');
      fetchEvents();
    } catch (err: any) {
      const errMsg = getApiErrorMessage(err, 'Failed to publish event. Please ensure the event has at least one active ticket tier.');
      showNotification(errMsg, 'error');
    }
  };

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const matchStatus = selectedStatus === 'All' || e.status === selectedStatus;
      const matchQuery = !searchQuery.trim() ||
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.venue && e.venue.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (e.category && e.category.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchStatus && matchQuery;
    });
  }, [events, selectedStatus, searchQuery]);

  return (
    <OrganizerDashboardLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-150 pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
              {role === 'staff' ? 'Assigned Events' : 'Events'}
            </h1>
            <p className="text-zinc-500 text-sm font-semibold mt-1">
              {role === 'staff'
                ? 'Events assigned to you for live ticket scanning and gate check-in.'
                : 'Publish, preview, and edit your listings.'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchEvents()}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-sm font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50"
              title="Refresh listings"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
            </button>
            {perms.canCreateEvents && (
              <Link to="/organizer/events/create">
                <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#E31B23] hover:bg-[#B91C1C] text-white text-sm font-bold rounded-xl shadow-xs transition-all cursor-pointer">
                  <PlusCircle className="w-5 h-5" /> Create New Event
                </button>
              </Link>
            )}
          </div>
        </div>

        {/* Search and Filter Tabs Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 bg-zinc-100/80 p-1.5 rounded-2xl border border-zinc-200/80">
            {(['All', 'Published', 'Upcoming', 'Draft'] as const).map((status) => {
              const count = status === 'All' ? events.length : events.filter(e => e.status === status).length;
              const isActive = selectedStatus === status;
              return (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${isActive
                    ? 'bg-white text-zinc-950 shadow-xs border border-zinc-200'
                    : 'text-zinc-500 hover:text-zinc-900'
                    }`}
                >
                  {status}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${isActive ? 'bg-[#E31B23] text-white' : 'bg-zinc-200/80 text-zinc-600'
                    }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, venue, genre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#E31B23] focus:ring-1 focus:ring-[#E31B23] transition-all"
            />
          </div>
        </div>

        {/* Error message banner */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-sm text-red-700">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => fetchEvents()}
              className="font-bold underline hover:text-red-900 cursor-pointer ml-4"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Table / List */}
        <div className="bg-white border border-zinc-150 rounded-2xl overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center text-zinc-400 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#E31B23]" />
              <p className="text-sm font-semibold">Loading your events...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="py-16 px-4 text-center flex flex-col items-center justify-center">
              <div className="w-14 h-14 bg-zinc-100 rounded-2xl flex items-center justify-center text-zinc-400 mb-3">
                <Calendar className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-zinc-900">No events match your criteria</h3>
              <p className="text-sm text-zinc-500 max-w-sm mt-1 mb-4">
                {searchQuery ? `No results found for "${searchQuery}". Try clearing filters.` : `You haven't created any events in this tab.`}
              </p>
              {searchQuery ? (
                <button
                  onClick={() => { setSearchQuery(''); setSelectedStatus('All'); }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-sm font-bold rounded-xl transition-all cursor-pointer"
                >
                  Clear Filters
                </button>
              ) : perms.canCreateEvents ? (
                <Link to="/organizer/events/create">
                  <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#E31B23] hover:bg-[#B91C1C] text-white text-sm font-bold rounded-xl shadow-sm transition-all cursor-pointer">
                    <PlusCircle className="w-5 h-5" /> Create Your First Event
                  </button>
                </Link>
              ) : null}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-150 text-zinc-500 font-bold uppercase tracking-wider text-xs">
                    <th className="p-4">Event Details</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Date & Time</th>
                    <th className="p-4">{role === 'staff' ? 'Capacity' : 'Capacity / Sales'}</th>
                    {perms.canViewRevenue && <th className="p-4">Revenue</th>}
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 font-semibold text-zinc-700">
                  {filteredEvents.map((evt) => {
                    const eventId = evt.id || (evt as any).uuid;
                    const sold = evt.ticketsSold || 0;
                    const totalCap = evt.capacity || (sold > 0 ? Math.round(sold * 1.5) : 100);
                    const pct = Math.min(100, Math.round((sold / totalCap) * 100));

                    const targetManageUrl = role === 'staff'
                      ? `/organizer/events/${eventId}?tab=attendees&sub=checkin`
                      : `/organizer/events/${eventId}`;

                    return (
                      <tr key={eventId} className="hover:bg-zinc-50/50 transition-all">
                        <td className="p-4">
                          <Link
                            to={targetManageUrl}
                            className="flex items-center gap-3.5 group cursor-pointer"
                          >
                            <img
                              src={evt.imageUrl || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=400&q=80'}
                              alt={evt.title}
                              className="w-14 h-14 object-cover rounded-xl border border-zinc-100 bg-zinc-100 shadow-xs flex-shrink-0 group-hover:scale-105 transition-transform"
                            />
                            <div className="min-w-0">
                              <p className="text-zinc-950 font-black text-base truncate max-w-[240px] group-hover:text-[#E31B23] transition-colors">{evt.title}</p>
                              <span className="text-xs text-zinc-400 font-medium block truncate max-w-[240px] mt-0.5">
                                {evt.venue || 'TBD Venue'} • {evt.category || 'Event'}
                              </span>
                            </div>
                          </Link>
                        </td>
                        <td className="p-4">
                          <Badge variant={getStatusVariant(evt.status)}>
                            {evt.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-zinc-600 font-medium">
                          <p className="font-bold text-zinc-900 text-sm">{formatDate(evt.startDate) || 'Date TBA'}</p>
                          {evt.startTime && <span className="text-xs text-zinc-400">{evt.startTime}</span>}
                        </td>
                        <td className="p-4">
                          <div className="space-y-1.5 max-w-[140px]">
                            <div className="flex justify-between text-xs">
                              <span className="font-bold text-zinc-900">
                                {role === 'staff' ? `${totalCap} cap` : `${sold} sold`}
                              </span>
                              <span className="text-zinc-400">{pct}%</span>
                            </div>
                            <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#E31B23] rounded-full transition-all duration-500"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        {perms.canViewRevenue && (
                          <td className="p-4 text-zinc-950 font-black text-base">
                            {formatCurrency(evt.revenue || 0)}
                          </td>
                        )}
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {role === 'staff' ? (
                              <Link
                                to={`/organizer/events/${eventId}?tab=attendees&sub=checkin`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#E31B23] hover:bg-[#B91C1C] text-white text-xs font-bold rounded-lg shadow-2xs transition-colors"
                                title="Open Gate Ticket Scanner"
                              >
                                <QrCode className="w-3.5 h-3.5" />
                                <span>Scan Gate</span>
                              </Link>
                            ) : (
                              <>
                                {evt.status === 'Draft' && perms.canPublishEvents && (
                                  <button
                                    onClick={() => handlePublish(eventId, evt.title, evt.tickets?.length)}
                                    className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                                    title="Publish Event"
                                  >
                                    Publish
                                  </button>
                                )}
                                <Link
                                  to={`/organizer/events/${eventId}`}
                                  className="p-2.5 text-zinc-400 hover:text-[#E31B23] hover:bg-red-50 rounded-xl transition-colors"
                                  title="Manage & Edit Event"
                                >
                                  <Edit className="w-4 h-4" />
                                </Link>
                                {perms.canConfigureTickets && (
                                  <Link
                                    to={`/organizer/events/${eventId}?tab=tickets`}
                                    className="p-2.5 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                                    title="Configure Ticket Types & Pricing"
                                  >
                                    <Ticket className="w-4 h-4" />
                                  </Link>
                                )}
                                {evt.status === 'Published' && (
                                  <a
                                    href={`/events/${evt.slug || eventId}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-2.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-xl transition-colors"
                                    title="View Live Event"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </a>
                                )}
                                {perms.canDeleteEvents && (
                                  <button
                                    onClick={() => handleDeletePrompt(eventId, evt.title)}
                                    className="p-2.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl cursor-pointer transition-colors"
                                    title="Delete Listing"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Confirmation Modal */}
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmLabel="Delete Event"
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmDialog({ isOpen: false, title: '', message: '' })}
        />

      </div>
    </OrganizerDashboardLayout>
  );
};

export default Events;

