import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import OrganizerDashboardLayout from '../../components/layout/OrganizerDashboardLayout';
import { formatCurrency, formatDate } from '../../utils/format';
import { 
  PlusCircle, 
  Eye, 
  Edit, 
  Trash2, 
  RefreshCw, 
  AlertCircle, 
  Calendar, 
  Search, 
  Ticket, 
  QrCode, 
  LayoutGrid, 
  List, 
  MapPin, 
  Users,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Badge from '../../components/ui/Badge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { eventApi, normalizeBackendEvent } from '../../api/events';
import { getApiErrorMessage } from '../../api/client';
import { resolveOrganizerRole, getRolePermissions } from '../../utils/permissions';
import type { Event } from '../../types/api';

type EventFilterStatus = 'All' | 'Published' | 'Draft' | 'Ended';

export const Events: React.FC = () => {
  const { organizer } = useAuth();
  const { showNotification } = useNotification();

  const role = resolveOrganizerRole(organizer);
  const perms = getRolePermissions(role);

  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<EventFilterStatus>('All');

  // View mode switcher: 'grid' or 'list' (persisted in localStorage)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    try {
      const saved = localStorage.getItem('strayttix_organizer_events_view');
      return saved === 'grid' || saved === 'list' ? saved : 'list';
    } catch {
      return 'list';
    }
  });

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
    try {
      localStorage.setItem('strayttix_organizer_events_view', mode);
    } catch {
      // ignore
    }
  };

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

  // Determine whether an event has concluded
  const isEventEnded = useCallback((evt: Event): boolean => {
    const s = evt.status?.toLowerCase();
    if (s === 'ended' || s === 'completed' || s === 'past' || s === 'archived') {
      return true;
    }
    const dateStr = evt.endDate || evt.startDate;
    if (!dateStr) return false;

    try {
      const timeStr = evt.endTime || evt.startTime || '23:59';
      const endDateTime = new Date(`${dateStr}T${timeStr.length === 5 ? timeStr + ':00' : timeStr}`);
      if (!isNaN(endDateTime.getTime())) {
        return endDateTime.getTime() < Date.now();
      }
      const endOnly = new Date(dateStr);
      if (!isNaN(endOnly.getTime())) {
        endOnly.setHours(23, 59, 59, 999);
        return endOnly.getTime() < Date.now();
      }
    } catch {
      return false;
    }
    return false;
  }, []);

  // Compute status display label and color badge
  const getEventDisplayStatus = useCallback((evt: Event): {
    label: string;
    variant: 'default' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
  } => {
    if (isEventEnded(evt) && evt.status !== 'Draft') {
      return { label: 'Ended', variant: 'default' };
    }
    switch (evt.status) {
      case 'Published': return { label: 'Published', variant: 'success' };
      case 'Upcoming': return { label: 'Upcoming', variant: 'info' };
      case 'Draft': return { label: 'Draft', variant: 'default' };
      case 'Cancelled': return { label: 'Cancelled', variant: 'error' };
      case 'Ended': return { label: 'Ended', variant: 'default' };
      default: return { label: evt.status || 'Draft', variant: 'default' };
    }
  }, [isEventEnded]);

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


  const getStatusCount = useCallback((status: EventFilterStatus) => {
    if (status === 'All') return events.length;
    if (status === 'Ended') return events.filter(e => (isEventEnded(e) && e.status !== 'Draft') || e.status === 'Ended' || e.status === 'Completed').length;
    if (status === 'Draft') return events.filter(e => e.status === 'Draft').length;
    if (status === 'Published') return events.filter(e => (e.status === 'Published' || e.status === 'Upcoming') && !isEventEnded(e)).length;
    return 0;
  }, [events, isEventEnded]);

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const ended = (isEventEnded(e) && e.status !== 'Draft') || e.status === 'Ended' || e.status === 'Completed';
      let matchStatus = true;
      if (selectedStatus === 'Ended') {
        matchStatus = ended;
      } else if (selectedStatus === 'Draft') {
        matchStatus = e.status === 'Draft';
      } else if (selectedStatus === 'Published') {
        matchStatus = (e.status === 'Published' || e.status === 'Upcoming') && !ended;
      }

      const matchQuery = !searchQuery.trim() ||
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.venue && e.venue.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (e.category && e.category.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchStatus && matchQuery;
    });
  }, [events, selectedStatus, searchQuery, isEventEnded]);

  const ITEMS_PER_PAGE = 9;
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to first page when filtering or searching
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStatus, searchQuery]);

  const totalItems = filteredEvents.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedEvents = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return filteredEvents.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredEvents, safePage]);

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

        {/* Search, Filter Tabs and View Mode Toolbar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Status Filter Tabs (including Ended) */}
          <div className="flex items-center gap-1.5 bg-zinc-100/80 p-1.5 rounded-2xl border border-zinc-200/80 overflow-x-auto no-scrollbar">
            {(['All', 'Published', 'Draft', 'Ended'] as const).map((status) => {
              const count = getStatusCount(status);
              const isActive = selectedStatus === status;
              return (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${isActive
                    ? 'bg-white text-zinc-950 shadow-xs border border-zinc-200'
                    : 'text-zinc-500 hover:text-zinc-900'
                    }`}
                >
                  <span>{status}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${isActive ? 'bg-[#E31B23] text-white' : 'bg-zinc-200/80 text-zinc-600'
                    }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Toolbar Controls: Search Input + Grid/List View Switcher */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-64 md:w-72">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search title, venue, genre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#E31B23] focus:ring-1 focus:ring-[#E31B23] transition-all shadow-2xs"
              />
            </div>

            {/* View Mode Switcher (Grid vs List - Matching Discover page) */}
            <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl border border-zinc-200/70 shrink-0">
              <button
                onClick={() => handleViewModeChange('grid')}
                className={`p-2 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white text-zinc-950 shadow-xs' : 'text-zinc-400 hover:text-zinc-700'
                }`}
                title="Grid view"
                aria-label="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleViewModeChange('list')}
                className={`p-2 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'list' ? 'bg-white text-zinc-950 shadow-xs' : 'text-zinc-400 hover:text-zinc-700'
                }`}
                title="List view"
                aria-label="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
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

        {/* Events Content: Loading / Empty / Grid / Modern List */}
        {isLoading ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-3xl p-4 border border-zinc-200 animate-pulse space-y-4 shadow-xs">
                  <div className="h-48 bg-zinc-100 rounded-2xl w-full" />
                  <div className="space-y-2 px-1">
                    <div className="h-5 bg-zinc-100 rounded-md w-3/4" />
                    <div className="h-4 bg-zinc-100 rounded-md w-1/2" />
                  </div>
                  <div className="pt-3 border-t border-zinc-100 flex justify-between items-center px-1">
                    <div className="h-4 bg-zinc-100 rounded-md w-1/4" />
                    <div className="h-8 bg-zinc-100 rounded-xl w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white border border-zinc-200/90 rounded-3xl p-5 shadow-xs animate-pulse flex flex-col md:flex-row gap-5 items-center">
                  <div className="w-full sm:w-48 h-32 bg-zinc-100 rounded-2xl shrink-0" />
                  <div className="flex-1 space-y-2.5 w-full">
                    <div className="h-5 bg-zinc-100 rounded-md w-1/2" />
                    <div className="h-4 bg-zinc-100 rounded-md w-1/3" />
                    <div className="h-3 bg-zinc-100 rounded-md w-2/3" />
                  </div>
                  <div className="w-full md:w-56 h-20 bg-zinc-100 rounded-2xl shrink-0" />
                </div>
              ))}
            </div>
          )
        ) : filteredEvents.length === 0 ? (
          <div className="bg-white border border-zinc-150 rounded-2xl shadow-sm py-16 px-4 text-center flex flex-col items-center justify-center">
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
        ) : viewMode === 'grid' ? (
          /* ========================================================================= */
          /* GRID VIEW (Matching Discover page aesthetics + organizer management)       */
          /* ========================================================================= */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedEvents.map((evt) => {
              const eventId = evt.id || (evt as any).uuid;
              const sold = evt.ticketsSold ?? 0;
              const totalCap = evt.capacity;
              const hasCap = typeof totalCap === 'number' && totalCap > 0;
              const pct = hasCap ? Math.min(100, Math.round((sold / totalCap) * 100)) : 0;

              const targetManageUrl = role === 'staff'
                ? `/organizer/events/${eventId}?tab=attendees&sub=checkin`
                : `/organizer/events/${eventId}`;

              const displayStatus = getEventDisplayStatus(evt);

              return (
                <div
                  key={eventId}
                  className="group bg-white border border-zinc-200/90 rounded-3xl overflow-hidden shadow-xs hover:shadow-md hover:border-zinc-300 transition-all flex flex-col justify-between"
                >
                  {/* Card Top Banner with Cover Image and Badges */}
                  <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-zinc-100">
                    <img
                      src={evt.imageUrl || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=600&q=80'}
                      alt={evt.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                    {/* Category Tag (Top Left) */}
                    <span className="absolute top-3.5 left-3.5 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-zinc-800 shadow-xs border border-white/60">
                      {evt.category || 'Event'}
                    </span>

                    {/* Status Badge (Top Right) */}
                    <div className="absolute top-3.5 right-3.5 shadow-xs">
                      <Badge variant={displayStatus.variant}>
                        {displayStatus.label}
                      </Badge>
                    </div>

                    {/* Date and Event Format (Bottom Overlay on Cover) */}
                    <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-xs font-semibold text-white">
                      <span className="flex items-center gap-1.5 drop-shadow-sm truncate">
                        <Calendar className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        <span className="truncate">{formatDate(evt.startDate) || 'Date TBA'}</span>
                        {evt.startTime && <span>• {evt.startTime}</span>}
                      </span>
                      {evt.eventFormat && (
                        <span className="bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/20 text-[10px] uppercase font-mono shrink-0 ml-2">
                          {evt.eventFormat}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <Link
                        to={targetManageUrl}
                        className="block"
                      >
                        <h3 className="text-lg font-black text-zinc-950 truncate group-hover:text-[#E31B23] transition-colors" title={evt.title}>
                          {evt.title}
                        </h3>
                      </Link>
                      <p className="text-xs text-zinc-500 font-medium flex items-center gap-1.5 mt-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                        <span className="truncate">
                          {evt.venue || evt.city || (evt.locationType === 'online' ? 'Virtual / Livestream' : 'Location TBA')}
                        </span>
                      </p>
                    </div>

                    {/* Capacity and Sales Metric */}
                    {hasCap ? (
                      <div className="space-y-1.5 pt-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-zinc-800 flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-zinc-400" />
                            {role === 'staff' ? `${totalCap} Capacity` : `${sold} / ${totalCap} sold`}
                          </span>
                          <span className="font-semibold text-zinc-500">{pct}%</span>
                        </div>
                        <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#E31B23] rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="pt-1 flex justify-between items-center text-xs">
                        <span className="font-bold text-zinc-800 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-zinc-400" />
                          {role === 'staff' ? 'Open Capacity' : `${sold} sold`}
                        </span>
                      </div>
                    )}

                    {/* Revenue Stat */}
                    {perms.canViewRevenue && (
                      <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-xs">
                        <span className="text-zinc-500 font-medium">Gross Revenue</span>
                        <span className="text-zinc-950 font-black text-sm">
                          {formatCurrency(evt.revenue || 0)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Footer Actions */}
                  <div className="px-5 py-3.5 bg-zinc-50/80 border-t border-zinc-100 flex items-center justify-between gap-2">
                    {role === 'staff' ? (
                      <Link
                        to={`/organizer/events/${eventId}?tab=attendees&sub=checkin`}
                        className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 bg-[#E31B23] hover:bg-[#B91C1C] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                      >
                        <QrCode className="w-4 h-4" />
                        <span>Scan Gate</span>
                      </Link>
                    ) : (
                      <>
                        <Link
                          to={`/organizer/events/${eventId}`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-zinc-100 border border-zinc-200 hover:border-zinc-300 text-zinc-900 text-xs font-bold rounded-xl transition-all shadow-2xs"
                        >
                          <Edit className="w-3.5 h-3.5 text-zinc-500" />
                          <span>Manage</span>
                        </Link>

                        <div className="flex items-center gap-1">
                          {perms.canConfigureTickets && (
                            <Link
                              to={`/organizer/events/${eventId}?tab=tickets`}
                              className="p-2 text-zinc-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                              title="Configure Tickets"
                            >
                              <Ticket className="w-4 h-4" />
                            </Link>
                          )}

                          {evt.status === 'Published' && (
                            <a
                              href={`/events/${evt.slug || eventId}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/60 rounded-xl transition-colors"
                              title="View Public Page"
                            >
                              <Eye className="w-4 h-4" />
                            </a>
                          )}

                          {perms.canDeleteEvents && (
                            <button
                              onClick={() => handleDeletePrompt(eventId, evt.title)}
                              className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl cursor-pointer transition-colors"
                              title="Delete Listing"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ========================================================================= */
          /* MODERN LIST VIEW (Horizontal cards matching Discover page aesthetic)      */
          /* ========================================================================= */
          <div className="space-y-4">
            {paginatedEvents.map((evt) => {
              const eventId = evt.id || (evt as any).uuid;
              const sold = evt.ticketsSold ?? 0;
              const totalCap = evt.capacity;
              const hasCap = typeof totalCap === 'number' && totalCap > 0;
              const pct = hasCap ? Math.min(100, Math.round((sold / totalCap) * 100)) : 0;

              const targetManageUrl = role === 'staff'
                ? `/organizer/events/${eventId}?tab=attendees&sub=checkin`
                : `/organizer/events/${eventId}`;

              const displayStatus = getEventDisplayStatus(evt);

              return (
                <div
                  key={eventId}
                  className="group bg-white hover:bg-zinc-50/60 border border-zinc-200/90 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-2xs hover:shadow-md hover:border-zinc-300 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 sm:gap-5"
                >
                  {/* Left Block: Thumbnail + Title + Meta Details */}
                  <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 flex-1 min-w-0">
                    {/* Thumbnail with overlay badges */}
                    <Link
                      to={targetManageUrl}
                      className="relative w-24 h-24 sm:w-48 sm:h-32 rounded-xl sm:rounded-2xl overflow-hidden shrink-0 bg-zinc-100 block group/thumb"
                    >
                      <img
                        src={evt.imageUrl || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=500&q=80'}
                        alt={evt.title}
                        className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent hidden sm:block" />

                      {/* Category Badge on thumbnail (tablet/desktop) */}
                      <span className="hidden sm:inline-block absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-bold text-zinc-800 shadow-xs border border-white/60">
                        {evt.category || 'Event'}
                      </span>

                      {/* Status Badge on thumbnail (tablet/desktop) */}
                      <div className="hidden sm:block absolute top-2.5 right-2.5 shadow-xs">
                        <Badge variant={displayStatus.variant} className="text-[10px] px-2 py-0.5">
                          {displayStatus.label}
                        </Badge>
                      </div>

                      {/* Format pill bottom */}
                      {evt.eventFormat && (
                        <span className="hidden sm:inline-block absolute bottom-2 left-2.5 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-md text-[9px] uppercase font-mono text-zinc-200 border border-white/20">
                          {evt.eventFormat}
                        </span>
                      )}
                    </Link>

                    {/* Event Title & Metadata */}
                    <div className="flex-1 min-w-0 space-y-1 sm:space-y-2">
                      {/* Mobile Top Badges: Status + Category */}
                      <div className="flex sm:hidden items-center gap-1.5 flex-wrap">
                        <Badge variant={displayStatus.variant} className="text-[9px] px-2 py-0.5 font-bold">
                          {displayStatus.label}
                        </Badge>
                        <span className="text-[10px] font-bold text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded-full">
                          {evt.category || 'Event'}
                        </span>
                        {evt.eventFormat && (
                          <span className="text-[9px] font-mono uppercase text-zinc-400 bg-zinc-50 border border-zinc-200/80 px-1.5 py-0.5 rounded">
                            {evt.eventFormat}
                          </span>
                        )}
                      </div>

                      <Link to={targetManageUrl} className="block group/title">
                        <h3 className="text-sm sm:text-lg font-black text-zinc-950 line-clamp-2 sm:truncate group-hover/title:text-[#E31B23] transition-colors leading-snug" title={evt.title}>
                          {evt.title}
                        </h3>
                      </Link>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-x-4 sm:gap-y-1.5 text-xs font-semibold text-zinc-500">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#E31B23] shrink-0" />
                          <span className="truncate">{formatDate(evt.startDate) || 'Date TBA'}</span>
                          {evt.startTime && <span className="text-zinc-400">at {evt.startTime}</span>}
                        </span>

                        <span className="inline-flex items-center gap-1.5 truncate max-w-[200px] sm:max-w-[260px]">
                          <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span className="truncate">
                            {evt.venue || evt.city || (evt.locationType === 'online' ? 'Virtual Livestream' : 'Venue TBA')}
                          </span>
                        </span>
                      </div>

                      {/* Description snippet for larger screens */}
                      {evt.description && (
                        <p className="hidden md:block text-xs text-zinc-400 line-clamp-1 font-normal max-w-xl">
                          {evt.description.replace(/<[^>]*>/g, '')}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Middle Block: Sales, Capacity & Revenue (Organizer Metrics) */}
                  <div className="flex items-center justify-between lg:flex-col lg:items-stretch gap-3 w-full lg:w-52 shrink-0 bg-zinc-50/80 p-2.5 sm:p-3 rounded-2xl border border-zinc-200/70">
                    {/* Sales & Capacity Bar */}
                    {hasCap ? (
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-zinc-800 flex items-center gap-1 truncate">
                            <Users className="w-3 h-3 text-zinc-400 shrink-0" />
                            <span className="truncate">{role === 'staff' ? `${totalCap} Cap` : `${sold}/${totalCap} sold`}</span>
                          </span>
                          <span className="font-mono text-[11px] font-bold text-zinc-500 ml-1">{pct}%</span>
                        </div>
                        <div className="w-full h-1.5 sm:h-2 bg-zinc-200/80 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#E31B23] rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex items-center text-xs">
                        <span className="font-bold text-zinc-800 flex items-center gap-1">
                          <Users className="w-3 h-3 text-zinc-400" />
                          {role === 'staff' ? 'Open Cap' : `${sold} sold`}
                        </span>
                      </div>
                    )}

                    {/* Revenue Display */}
                    {perms.canViewRevenue && (
                      <div className="flex flex-col sm:flex-row lg:flex-row items-end sm:items-center justify-between text-xs pl-3 border-l border-zinc-200/70 shrink-0 lg:pl-0 lg:border-l-0 lg:border-t lg:pt-2">
                        <span className="text-[10px] sm:text-xs text-zinc-400 font-medium">Revenue</span>
                        <span className="text-zinc-950 font-black text-xs sm:text-sm">
                          {formatCurrency(evt.revenue || 0)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Right Block: Action Buttons */}
                  <div className="flex items-center justify-between sm:justify-end gap-2 w-full lg:w-auto shrink-0 border-t sm:border-t-0 pt-2.5 sm:pt-0 border-zinc-150">
                    {role === 'staff' ? (
                      <Link
                        to={`/organizer/events/${eventId}?tab=attendees&sub=checkin`}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 sm:py-2.5 bg-[#E31B23] hover:bg-[#B91C1C] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                        title="Open Gate Scanner"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Scan Gate</span>
                      </Link>
                    ) : (
                      <>
                        <Link
                          to={`/organizer/events/${eventId}`}
                          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 sm:py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
                        >
                          <Edit className="w-3.5 h-3.5 text-zinc-400" />
                          <span>Manage</span>
                        </Link>

                        <div className="flex items-center gap-1">
                          {perms.canConfigureTickets && (
                            <Link
                              to={`/organizer/events/${eventId}?tab=tickets`}
                              className="p-2 sm:p-2.5 text-zinc-500 hover:text-indigo-600 hover:bg-indigo-50 border border-zinc-200 hover:border-indigo-200 bg-white rounded-xl transition-colors shadow-2xs"
                              title="Configure Tickets"
                            >
                              <Ticket className="w-4 h-4" />
                            </Link>
                          )}

                          {evt.status === 'Published' && (
                            <a
                              href={`/events/${evt.slug || eventId}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 sm:p-2.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 border border-zinc-200 hover:border-zinc-300 bg-white rounded-xl transition-colors shadow-2xs"
                              title="View Public Page"
                            >
                              <Eye className="w-4 h-4" />
                            </a>
                          )}

                          {perms.canDeleteEvents && (
                            <button
                              onClick={() => handleDeletePrompt(eventId, evt.title)}
                              className="p-2 sm:p-2.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 border border-zinc-200 hover:border-red-200 bg-white rounded-xl cursor-pointer transition-colors shadow-2xs"
                              title="Delete Listing"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {!isLoading && totalItems > 0 && totalPages > 1 && (
          <div className="bg-white rounded-2xl border border-zinc-200/90 px-5 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
            <div className="text-xs text-zinc-500 font-semibold">
              Showing <span className="font-bold text-zinc-900">{(safePage - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
              <span className="font-bold text-zinc-900">{Math.min(safePage * ITEMS_PER_PAGE, totalItems)}</span> of{' '}
              <span className="font-bold text-zinc-900">{totalItems}</span> events
            </div>

            <div className="flex items-center gap-2">
              {/* Previous Button */}
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Previous</span>
              </button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                  if (totalPages > 7) {
                    if (p !== 1 && p !== totalPages && Math.abs(p - safePage) > 1) {
                      if (p === 2 && safePage > 3) return <span key={p} className="px-1 text-xs text-zinc-400">...</span>;
                      if (p === totalPages - 1 && safePage < totalPages - 2) return <span key={p} className="px-1 text-xs text-zinc-400">...</span>;
                      return null;
                    }
                  }
                  return (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`w-9 h-9 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        p === safePage
                          ? 'bg-[#E31B23] text-white shadow-xs scale-105'
                          : 'bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-200'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>

              {/* Next Button */}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                className="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

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
