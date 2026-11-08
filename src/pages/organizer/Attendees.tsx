import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import OrganizerDashboardLayout from '../../components/layout/OrganizerDashboardLayout';
import StatCard from '../../components/ui/StatCard';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { formatCurrency, formatDate } from '../../utils/format';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { eventApi } from '../../api/events';
import { attendeesApi } from '../../api/attendees';
import { resolveOrganizerRole, getRolePermissions } from '../../utils/permissions';
import { useCan } from '../../hooks/useCan';
import { Can } from '../../components/auth/Can';
import type { Event, TicketAttendee, CheckInStats } from '../../types/api';
import CameraQrScannerModal from '../../components/events/CameraQrScannerModal';
import { 
  Search, 
  UserCheck, 
  Users, 
  QrCode, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  Clock, 
  ShieldCheck, 
  Tag, 
  Mail, 
  Calendar, 
  MapPin, 
  Check, 
  X, 
  Filter, 
  Sparkles, 
  Loader2,
  ScanLine,
  User,
  ArrowRight,
  RotateCcw
} from 'lucide-react';

interface AttendeeRecord {
  id: string;
  name: string;
  email: string;
  ticketType: string;
  orderId: string;
  ticketCode: string;
  eventTitle: string;
  checkInStatus: 'Checked In' | 'Pending';
  checkedInAt?: string;
  checkedInBy?: string;
  registeredAt: string;
  notes?: string;
}

export const Attendees: React.FC = () => {
  const { organizer, user } = useAuth();
  const { showNotification } = useNotification();
  const { can } = useCan();
  const role = resolveOrganizerRole(organizer);
  const perms = getRolePermissions(role);
  const currentStaffName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Gate Staff' : 'Gate Staff';

  // If user cannot monitor check-ins or scan tickets, bounce
  if (!perms.canMonitorCheckInCounts && !perms.canScanGateTickets && !perms.canViewOrders && !can(['org.attendees.view', 'org.events.view'])) {
    return <Navigate to="/organizer" replace />;
  }

  const [attendees, setAttendees] = useState<AttendeeRecord[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Search & Filter
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Checked In' | 'Pending'>('all');
  const [ticketTierFilter, setTicketTierFilter] = useState<string>('all');

  // Scanner Modal & Gate Stats State
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [gateStats, setGateStats] = useState<CheckInStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Guest Detail Modal
  const [selectedAttendee, setSelectedAttendee] = useState<AttendeeRecord | null>(null);

  // Load Attendees & Events
  const loadData = async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const eventsRes = await eventApi.getEvents({ organizerUuid: organizer?.id }).catch(() => ({ data: [] }));
      const rawEvents = Array.isArray(eventsRes.data) ? eventsRes.data : (eventsRes.data as any)?.data || [];
      setEvents(rawEvents);

      const targetEventId = selectedEventId !== 'all' ? selectedEventId : (rawEvents[0]?.id || '');
      let rawList: any[] = [];

      if (organizer?.id && targetEventId) {
        try {
          const res = await attendeesApi.getEventAttendees(organizer.id, targetEventId);
          rawList = Array.isArray(res) ? res : (res as any)?.data || [];
        } catch {
          const fallbackRes = await eventApi.getAttendees(targetEventId, organizer.id).catch(() => ({ data: [] }));
          rawList = Array.isArray(fallbackRes.data) ? fallbackRes.data : (fallbackRes.data as any)?.data || [];
        }

        // Fetch gate stats if specific event selected
        try {
          setIsLoadingStats(true);
          const stats = await attendeesApi.getGateStats(organizer.id, targetEventId);
          setGateStats(stats);
        } catch {
          // stats not critical
        } finally {
          setIsLoadingStats(false);
        }
      } else {
        const fallbackRes = await eventApi.getAttendees(undefined, organizer?.id).catch(() => ({ data: [] }));
        rawList = Array.isArray(fallbackRes.data) ? fallbackRes.data : (fallbackRes.data as any)?.data || [];
      }

      // Purge any legacy dummy sample attendees cached in browser storage
      try {
        const cacheKey = `strayttix_attendees_${organizer?.id || 'default'}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached && (cached.includes('att-101') || cached.includes('ORD-89421') || cached.includes('TechFest'))) {
          localStorage.removeItem(cacheKey);
        }
        localStorage.removeItem('strayttix_attendees_default');
      } catch {
        // Ignore localStorage access restrictions
      }

      if (rawList.length > 0) {
        const matchedEvt = rawEvents.find((e: any) => e.id === targetEventId);
        const mapped: AttendeeRecord[] = rawList.map((item: any, idx: number) => ({
          id: item.id || item.uuid || `att-${idx}`,
          name: item.attendeeName || item.name || `${item.firstName || ''} ${item.lastName || ''}`.trim() || 'Attendee Guest',
          email: item.attendeeEmail || item.email || `guest-${idx + 1}@example.com`,
          ticketType: item.ticketType?.name || item.ticket_type?.name || item.ticketType || 'General Admission',
          orderId: item.orderNumber || item.order_number || item.orderId || item.order_id || `ORD-${10000 + idx}`,
          ticketCode: item.ticketNumber || item.ticket_number || item.ticketCode || item.code || `TKT-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
          eventTitle: item.eventTitle || matchedEvt?.title || rawEvents[0]?.title || 'Main Event',
          checkInStatus: (item.status === 'used' || item.checkedInAt || item.checkInStatus === 'Checked In' || item.checked_in) ? 'Checked In' : 'Pending',
          checkedInAt: item.checkedInAt || (item.checked_in ? new Date().toISOString() : undefined),
          checkedInBy: item.checkedInBy || (item.checked_in ? currentStaffName : undefined),
          registeredAt: item.registeredAt || item.createdAt || new Date().toISOString()
        }));
        setAttendees(mapped);
      } else {
        setAttendees([]);
      }
    } catch (err: any) {
      console.warn('Error loading attendees:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [organizer?.id, selectedEventId]);

  // Persist local state
  const saveAttendees = (newAttendees: AttendeeRecord[]) => {
    setAttendees(newAttendees);
    localStorage.setItem(`strayttix_attendees_${organizer?.id || 'default'}`, JSON.stringify(newAttendees));
  };

  // Toggle Check-In status
  const handleToggleCheckIn = async (id: string) => {
    const targetAttendee = attendees.find(a => a.id === id);
    if (!targetAttendee) return;

    const targetEventId = selectedEventId !== 'all' ? selectedEventId : (events[0]?.id || '');
    const isCurrentlyCheckedIn = targetAttendee.checkInStatus === 'Checked In';
    const identifier = targetAttendee.ticketCode || targetAttendee.orderId || targetAttendee.id;

    if (organizer?.id && targetEventId) {
      try {
        if (isCurrentlyCheckedIn) {
          await attendeesApi.undoCheckInAttendee(organizer.id, targetEventId, identifier);
          showNotification(`${targetAttendee.name}: Check-in reversed.`, 'info');
        } else {
          await attendeesApi.checkInAttendee(organizer.id, targetEventId, identifier);
          showNotification(`${targetAttendee.name}: Gate entry verified!`, 'success');
        }

        const now = new Date().toISOString();
        const updated = attendees.map(att => {
          if (att.id === id) {
            return {
              ...att,
              checkInStatus: (isCurrentlyCheckedIn ? 'Pending' : 'Checked In') as 'Checked In' | 'Pending',
              checkedInAt: isCurrentlyCheckedIn ? undefined : now,
              checkedInBy: isCurrentlyCheckedIn ? undefined : currentStaffName
            };
          }
          return att;
        });

        saveAttendees(updated);
        // Refresh gate stats
        attendeesApi.getGateStats(organizer.id, targetEventId).then(setGateStats).catch(() => {});
        return;
      } catch (err: any) {
        showNotification(err?.response?.data?.message || err?.message || 'Failed to update check-in status.', 'error');
        return;
      }
    }

    const nextStatus = targetAttendee.checkInStatus === 'Checked In' ? 'Pending' : 'Checked In';
    const now = new Date().toISOString();
    const updated = attendees.map(att => {
      if (att.id === id) {
        return {
          ...att,
          checkInStatus: nextStatus as 'Checked In' | 'Pending',
          checkedInAt: nextStatus === 'Checked In' ? now : undefined,
          checkedInBy: nextStatus === 'Checked In' ? currentStaffName : undefined
        };
      }
      return att;
    });

    saveAttendees(updated);
  };

  // QR Modal Scan Handler
  const handleScanTicket = async (identifier: string): Promise<TicketAttendee> => {
    const targetEventId = selectedEventId !== 'all' ? selectedEventId : (events[0]?.id || '');
    if (!organizer?.id || !targetEventId) {
      throw new Error('Please select an event before scanning.');
    }

    const ticket = await attendeesApi.checkInAttendee(organizer.id, targetEventId, identifier);
    
    // Update local attendees
    const now = new Date().toISOString();
    const updated = attendees.map(a => {
      if (
        a.ticketCode.toUpperCase() === identifier.toUpperCase() ||
        a.orderId.toUpperCase() === identifier.toUpperCase() ||
        (ticket.ticketNumber && a.ticketCode.toUpperCase() === ticket.ticketNumber.toUpperCase())
      ) {
        return {
          ...a,
          checkInStatus: 'Checked In' as const,
          checkedInAt: ticket.checkedInAt || now,
          checkedInBy: currentStaffName
        };
      }
      return a;
    });
    saveAttendees(updated);
    attendeesApi.getGateStats(organizer.id, targetEventId).then(setGateStats).catch(() => {});

    return ticket;
  };

  // QR Modal Undo Handler
  const handleUndoCheckIn = async (identifier: string): Promise<TicketAttendee> => {
    const targetEventId = selectedEventId !== 'all' ? selectedEventId : (events[0]?.id || '');
    if (!organizer?.id || !targetEventId) {
      throw new Error('Please select an event.');
    }

    const ticket = await attendeesApi.undoCheckInAttendee(organizer.id, targetEventId, identifier);

    const updated = attendees.map(a => {
      if (
        a.ticketCode.toUpperCase() === identifier.toUpperCase() ||
        a.orderId.toUpperCase() === identifier.toUpperCase() ||
        (ticket.ticketNumber && a.ticketCode.toUpperCase() === ticket.ticketNumber.toUpperCase())
      ) {
        return {
          ...a,
          checkInStatus: 'Pending' as const,
          checkedInAt: undefined,
          checkedInBy: undefined
        };
      }
      return a;
    });
    saveAttendees(updated);
    attendeesApi.getGateStats(organizer.id, targetEventId).then(setGateStats).catch(() => {});

    return ticket;
  };

  // Filtered Attendees list
  const filteredAttendees = useMemo(() => {
    return attendees.filter(att => {
      // Event filter
      if (selectedEventId !== 'all') {
        if (att.eventTitle !== selectedEventId) return false;
      }

      // Status filter
      if (statusFilter !== 'all' && att.checkInStatus !== statusFilter) {
        return false;
      }

      // Ticket Tier filter
      if (ticketTierFilter !== 'all' && att.ticketType !== ticketTierFilter) {
        return false;
      }

      // Search keyword
      const query = search.toLowerCase().trim();
      if (query) {
        const matchesName = att.name.toLowerCase().includes(query);
        const matchesEmail = att.email.toLowerCase().includes(query);
        const matchesCode = att.ticketCode.toLowerCase().includes(query);
        const matchesOrder = att.orderId.toLowerCase().includes(query);
        if (!matchesName && !matchesEmail && !matchesCode && !matchesOrder) return false;
      }

      return true;
    });
  }, [attendees, selectedEventId, statusFilter, ticketTierFilter, search]);

  // Unique ticket types for filter dropdown
  const uniqueTicketTiers = useMemo(() => {
    const set = new Set<string>();
    attendees.forEach(a => set.add(a.ticketType));
    return Array.from(set);
  }, [attendees]);

  // Gate Metrics
  const metrics = useMemo(() => {
    const total = attendees.length;
    const checkedIn = attendees.filter(a => a.checkInStatus === 'Checked In').length;
    const pending = total - checkedIn;
    const checkInRate = total > 0 ? Math.round((checkedIn / total) * 100) : 0;
    const vipCount = attendees.filter(a => a.ticketType.toLowerCase().includes('vip')).length;

    return { total, checkedIn, pending, checkInRate, vipCount };
  }, [attendees]);

  // Export Attendees CSV
  const handleExportCSV = async () => {
    if (filteredAttendees.length === 0) {
      showNotification('No attendee records to export.', 'warning');
      return;
    }

    const targetEventId = selectedEventId !== 'all' ? selectedEventId : (events[0]?.id || '');
    if (organizer?.id && targetEventId) {
      try {
        const blob = await attendeesApi.exportAttendees(organizer.id, targetEventId);
        if (blob && blob.size > 0) {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `attendees-${targetEventId}-${new Date().toISOString().slice(0, 10)}.csv`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          showNotification('Attendee roster exported from server successfully.', 'success');
          return;
        }
      } catch {
        // Fall back to client-side CSV generation
      }
    }

    const headers = ['Attendee Name', 'Email', 'Ticket Tier', 'Ticket Code', 'Order ID', 'Gate Status', 'Check-In Time', 'Verified By'];
    const rows = filteredAttendees.map(a => [
      `"${a.name}"`,
      `"${a.email}"`,
      `"${a.ticketType}"`,
      `"${a.ticketCode}"`,
      `"${a.orderId}"`,
      a.checkInStatus,
      `"${a.checkedInAt ? new Date(a.checkedInAt).toLocaleString() : ''}"`,
      `"${a.checkedInBy || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `strayttix-attendees-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showNotification(`Exported ${filteredAttendees.length} attendee passes.`, 'success');
  };

  return (
    <OrganizerDashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto pb-16">
        
        {/* Top Header */}
        <div className="border-b border-zinc-200/80 dark:border-white/10 pb-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                  Gate Operations
                </span>
                <span className="text-xs font-semibold text-zinc-400">•</span>
                <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 font-mono">Live Check-In</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-white tracking-tight flex items-center gap-2.5">
                <UserCheck className="w-7 h-7 text-[#E31B23]" />
                Guest Check-In & Gate Scanner
              </h1>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm font-medium mt-1">
                Scan attendee QR vouchers, verify ticket passes at the door, and track live occupancy in real time.
              </p>
            </div>

            {/* Top Action Buttons */}
            <div className="flex items-center gap-2.5 self-start md:self-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadData(true)}
                disabled={isRefreshing || isLoading}
                className="gap-2 bg-white dark:bg-white/5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#E31B23]' : ''}`} />
                <span>Refresh</span>
              </Button>

              {perms.canDownloadAttendees && can(['org.attendees.manage', 'org.attendees.view']) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportCSV}
                  className="gap-2 bg-white dark:bg-white/5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Roster</span>
                </Button>
              )}

              {perms.canScanGateTickets && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsScannerOpen(true)}
                  className="bg-[#E31B23] hover:bg-[#c9171e] text-white gap-2 font-bold shadow-sm"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Scan QR Code</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Live Attendance Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Registered"
            value={metrics.total.toString()}
            description="Confirmed ticket holders"
            icon={<Users className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />}
          />

          <StatCard
            title="Checked In at Gate"
            value={metrics.checkedIn.toString()}
            description={`${metrics.checkInRate}% attendance rate`}
            trend={{ value: metrics.checkInRate, type: 'up' }}
            icon={<CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
          />

          <StatCard
            title="Awaiting Arrival"
            value={metrics.pending.toString()}
            description="Tickets yet to be scanned"
            icon={<Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
          />

          <StatCard
            title="VIP All-Access"
            value={metrics.vipCount.toString()}
            description="Priority access guests"
            icon={<Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
          />
        </div>

        {/* Live Attendance Progress Bar */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0D0E12] border border-zinc-200/80 dark:border-white/10 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <ScanLine className="w-4 h-4 text-[#E31B23]" />
              Live Venue Occupancy & Gate Clearance
            </span>
            <span className="text-zinc-950 dark:text-white font-mono">
              {metrics.checkedIn} / {metrics.total} Guests ({metrics.checkInRate}%)
            </span>
          </div>
          <div className="w-full bg-zinc-100 dark:bg-white/10 rounded-full h-2.5 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${metrics.checkInRate}%` }}
            />
          </div>
        </div>

        {/* Gate Quick Scanner Bar */}
        {perms.canScanGateTickets && (
          <div className="bg-gradient-to-r from-red-50/60 via-zinc-50 to-emerald-50/60 dark:from-[#E31B23]/10 dark:via-[#0D0E12] dark:to-emerald-500/10 border border-zinc-200/80 dark:border-white/10 rounded-2xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-[#E31B23]" />
                <h3 className="text-sm font-black text-zinc-950 dark:text-white">Gate Scanner & Quick Check-In Bar</h3>
              </div>
              <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">Scan QR or enter ticket voucher code</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <ScanLine className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search attendee by name, voucher code or order reference below, or open camera..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#14151B] text-xs sm:text-sm font-medium text-zinc-900 dark:text-white focus:ring-2 focus:ring-[#E31B23]/20 focus:border-[#E31B23] outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => setIsScannerOpen(true)}
                  className="bg-[#E31B23] hover:bg-[#c9171e] text-white font-bold px-5 py-2.5 text-xs rounded-xl shadow-xs flex items-center gap-2"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Launch Camera Scanner</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0D0E12] border border-zinc-200/80 dark:border-white/10 shadow-2xs space-y-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1 min-w-[280px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search guest by name, email, voucher code, or order ID..."
                className="w-full bg-zinc-50/70 dark:bg-[#14151B] hover:bg-zinc-50 dark:hover:bg-white/[0.06] focus:bg-white dark:focus:bg-[#14151B] border border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 text-xs sm:text-sm rounded-xl pl-10 pr-4 py-2.5 outline-none transition-all text-zinc-900 dark:text-white"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 rounded-md"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Status Filter Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
              {(['all', 'Checked In', 'Pending'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    statusFilter === st
                      ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 shadow-xs'
                      : 'bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/70 dark:hover:bg-white/10'
                  }`}
                >
                  {st === 'all' ? 'All Guests' : st === 'Checked In' ? 'Verified Entry' : 'Awaiting Arrival'}
                  <span className={`ml-1.5 px-1.5 py-0.2 rounded-md text-[10px] font-black ${
                    statusFilter === st ? 'bg-white/20 dark:bg-zinc-900/20 text-white dark:text-zinc-950' : 'bg-zinc-200 dark:bg-white/10 text-zinc-700 dark:text-zinc-300'
                  }`}>
                    {st === 'all' ? attendees.length : attendees.filter(a => a.checkInStatus === st).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Secondary Filter: Event & Ticket Tier */}
          <div className="pt-3 border-t border-zinc-100 dark:border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              {/* Event Filter */}
              <div className="flex items-center gap-2">
                <span className="font-bold text-zinc-500 dark:text-zinc-400">Event:</span>
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="bg-zinc-50 dark:bg-[#14151B] border border-zinc-200 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200 outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/30"
                >
                  <option value="all">All Events ({events.length})</option>
                  {events.map((evt) => (
                    <option key={evt.id} value={evt.title}>
                      {evt.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ticket Tier Filter */}
              <div className="flex items-center gap-2">
                <span className="font-bold text-zinc-500 dark:text-zinc-400">Category:</span>
                <select
                  value={ticketTierFilter}
                  onChange={(e) => setTicketTierFilter(e.target.value)}
                  className="bg-zinc-50 dark:bg-[#14151B] border border-zinc-200 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200 outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/30"
                >
                  <option value="all">All Tiers ({uniqueTicketTiers.length})</option>
                  {uniqueTicketTiers.map((tier) => (
                    <option key={tier} value={tier}>
                      {tier}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="text-zinc-500 dark:text-zinc-400 font-medium">
              Showing <strong className="text-zinc-900 dark:text-white font-bold">{filteredAttendees.length}</strong> of {attendees.length} guests
            </div>
          </div>
        </div>

        {/* Attendees List Table */}
        <div className="bg-white dark:bg-[#0D0E12] border border-zinc-200/80 dark:border-white/10 rounded-2xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-50/80 dark:bg-white/[0.03] border-b border-zinc-200 dark:border-white/10 text-zinc-500 dark:text-zinc-400 font-black uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Attendee Guest</th>
                  <th className="py-3.5 px-4">Ticket Tier</th>
                  <th className="py-3.5 px-4">Ticket Voucher Code</th>
                  <th className="py-3.5 px-4">Order Ref</th>
                  <th className="py-3.5 px-4">Gate Status</th>
                  <th className="py-3.5 px-4 text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-white/5 font-semibold text-zinc-700 dark:text-zinc-300">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-zinc-500 dark:text-zinc-400">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Loader2 className="w-7 h-7 animate-spin text-[#E31B23]" />
                        <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Loading attendee roster...</span>
                      </div>
                    </td>
                  </tr>
                ) : attendees.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-zinc-500 dark:text-zinc-400">
                      <div className="flex flex-col items-center justify-center gap-3 max-w-md mx-auto">
                        <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-white/5 text-zinc-400 flex items-center justify-center border border-zinc-200/80 dark:border-white/10">
                          <Users className="w-7 h-7 text-zinc-400" />
                        </div>
                        <p className="text-base font-bold text-zinc-950 dark:text-white">No attendees yet</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-sm">
                          When attendees purchase tickets or register for your events, they will automatically appear here for check-in and roster management.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : filteredAttendees.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-zinc-500 dark:text-zinc-400">
                      <div className="flex flex-col items-center justify-center gap-3 max-w-md mx-auto">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-white/5 text-zinc-400 flex items-center justify-center">
                          <Users className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-black text-zinc-950 dark:text-white">No attendees match your search</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          Try searching by attendee name, email, or clearing filter options.
                        </p>
                        {(search || statusFilter !== 'all' || ticketTierFilter !== 'all' || selectedEventId !== 'all') && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSearch('');
                              setStatusFilter('all');
                              setTicketTierFilter('all');
                              setSelectedEventId('all');
                            }}
                            className="mt-2"
                          >
                            Reset Filters
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAttendees.map((att) => {
                    const isCheckedIn = att.checkInStatus === 'Checked In';

                    return (
                      <tr 
                        key={att.id} 
                        onClick={() => setSelectedAttendee(att)}
                        className="hover:bg-zinc-50/70 dark:hover:bg-white/[0.03] transition-all cursor-pointer group"
                      >
                        {/* Guest Info */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-full font-black text-xs flex items-center justify-center flex-shrink-0 border ${
                              isCheckedIn ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50' : 'bg-zinc-100 dark:bg-white/10 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-white/10'
                            }`}>
                              {att.name?.charAt(0) || 'G'}
                            </div>
                            <div className="min-w-0">
                              <p className="text-zinc-950 dark:text-white font-bold truncate max-w-[170px] group-hover:text-[#E31B23] transition-colors">
                                {att.name}
                              </p>
                              <p className="text-[11px] text-zinc-400 font-normal truncate max-w-[170px]">
                                {att.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Ticket Tier */}
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md font-bold text-xs ${
                            att.ticketType.toLowerCase().includes('vip')
                              ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50'
                              : 'bg-zinc-100 dark:bg-white/10 text-zinc-700 dark:text-zinc-300'
                          }`}>
                            {att.ticketType}
                          </span>
                        </td>

                        {/* Ticket Voucher Code */}
                        <td className="py-3.5 px-4 font-mono font-bold text-zinc-900 dark:text-zinc-200">
                          <span className="bg-zinc-100 dark:bg-white/10 px-2 py-1 rounded-md text-[11px] border border-zinc-200 dark:border-white/10">
                            {att.ticketCode}
                          </span>
                        </td>

                        {/* Order ID */}
                        <td className="py-3.5 px-4 font-mono text-zinc-500 dark:text-zinc-400">
                          #{att.orderId}
                        </td>

                        {/* Gate Status */}
                        <td className="py-3.5 px-4">
                          {isCheckedIn ? (
                            <div>
                              <Badge variant="success" className="font-bold gap-1 inline-flex items-center">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                Checked In
                              </Badge>
                              {att.checkedInAt && (
                                <span className="block text-[10px] text-zinc-400 font-mono mt-0.5">
                                  {new Date(att.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              )}
                            </div>
                          ) : (
                            <Badge variant="warning" className="font-bold gap-1 inline-flex items-center">
                              <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                              Awaiting Entry
                            </Badge>
                          )}
                        </td>

                        {/* Action Toggle */}
                        <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => handleToggleCheckIn(att.id)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-2xs ${
                              isCheckedIn
                                ? 'bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 border-rose-200 dark:border-rose-800/50 text-rose-700 dark:text-rose-300'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white border-transparent'
                            }`}
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>{isCheckedIn ? 'Undo Entry' : 'Verify & Enter'}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ----------------- QR SCANNER MODAL ----------------- */}
        <CameraQrScannerModal
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          onScan={handleScanTicket}
          onUndo={handleUndoCheckIn}
          title={selectedEventId !== 'all' ? `Gate Scanner — ${selectedEventId}` : 'Gate QR Scanner'}
        />

        {/* ----------------- GUEST DETAIL MODAL ----------------- */}
        <Modal
          isOpen={!!selectedAttendee}
          onClose={() => setSelectedAttendee(null)}
          title={`Guest Details: ${selectedAttendee?.name || ''}`}
        >
          {selectedAttendee && (
            <div className="space-y-6">
              
              {/* Status Header */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block mb-0.5">Gate Status</span>
                  {selectedAttendee.checkInStatus === 'Checked In' ? (
                    <Badge variant="success" className="font-bold">Verified Entry</Badge>
                  ) : (
                    <Badge variant="warning" className="font-bold">Awaiting Arrival</Badge>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block mb-0.5">Ticket Voucher</span>
                  <span className="font-mono font-bold text-sm bg-zinc-200 dark:bg-white/10 px-2 py-0.5 rounded-md text-zinc-950 dark:text-white">
                    {selectedAttendee.ticketCode}
                  </span>
                </div>
              </div>

              {/* Guest Profile Details */}
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/[0.02] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-zinc-500 dark:text-zinc-400 font-medium block">Full Name</span>
                  <strong className="text-zinc-950 dark:text-white font-bold">{selectedAttendee.name}</strong>
                </div>
                <div>
                  <span className="text-zinc-500 dark:text-zinc-400 font-medium block">Email Address</span>
                  <strong className="text-zinc-950 dark:text-white font-bold">{selectedAttendee.email}</strong>
                </div>
                <div>
                  <span className="text-zinc-500 dark:text-zinc-400 font-medium block">Ticket Category</span>
                  <span className="font-bold text-zinc-900 dark:text-white">{selectedAttendee.ticketType}</span>
                </div>
                <div>
                  <span className="text-zinc-500 dark:text-zinc-400 font-medium block">Order Reference</span>
                  <span className="font-mono font-bold text-zinc-900 dark:text-white">#{selectedAttendee.orderId}</span>
                </div>
                {selectedAttendee.checkedInAt && (
                  <div>
                    <span className="text-zinc-500 dark:text-zinc-400 font-medium block">Gate Check-In Time</span>
                    <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                      {new Date(selectedAttendee.checkedInAt).toLocaleString()}
                    </span>
                  </div>
                )}
                {selectedAttendee.checkedInBy && (
                  <div>
                    <span className="text-zinc-500 dark:text-zinc-400 font-medium block">Verified By Staff</span>
                    <strong className="text-zinc-900 dark:text-white">{selectedAttendee.checkedInBy}</strong>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="pt-2 border-t border-zinc-200 dark:border-white/10 flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleCheckIn(selectedAttendee.id)}
                  className={selectedAttendee.checkInStatus === 'Checked In' ? 'text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/50 hover:bg-rose-50 dark:hover:bg-rose-950/50' : 'text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50 hover:bg-emerald-50 dark:hover:bg-emerald-950/50'}
                >
                  <UserCheck className="w-3.5 h-3.5 mr-1.5" />
                  <span>{selectedAttendee.checkInStatus === 'Checked In' ? 'Undo Entry' : 'Verify Entry'}</span>
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setSelectedAttendee(null)}
                >
                  Close
                </Button>
              </div>

            </div>
          )}
        </Modal>

      </div>
    </OrganizerDashboardLayout>
  );
};

export default Attendees;
