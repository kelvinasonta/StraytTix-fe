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
import type { Event, TicketAttendee } from '../../types/api';
import { 
  Search, 
  UserCheck, 
  Users, 
  QrCode, 
  Camera, 
  CameraOff, 
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
  ArrowRight
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
  const role = resolveOrganizerRole(organizer);
  const perms = getRolePermissions(role);
  const currentStaffName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Gate Staff' : 'Gate Staff';

  // If user cannot monitor check-ins or scan tickets, bounce
  if (!perms.canMonitorCheckInCounts && !perms.canScanGateTickets && !perms.canViewOrders) {
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

  // Scanner Modal & Camera State
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualCodeInput, setManualCodeInput] = useState('');
  const [scanResult, setScanResult] = useState<{
    status: 'success' | 'already_checked' | 'not_found';
    attendee?: AttendeeRecord;
    message: string;
  } | null>(null);

  // Guest Detail Modal
  const [selectedAttendee, setSelectedAttendee] = useState<AttendeeRecord | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

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
  const handleToggleCheckIn = (id: string) => {
    const updated = attendees.map(att => {
      if (att.id === id) {
        const nextStatus = att.checkInStatus === 'Checked In' ? 'Pending' : 'Checked In';
        const now = new Date().toISOString();
        showNotification(
          `${att.name} (${att.ticketType}) ${nextStatus === 'Checked In' ? 'granted entry at gate' : 'check-in revoked'}.`,
          nextStatus === 'Checked In' ? 'success' : 'info'
        );
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

    if (selectedAttendee?.id === id) {
      const match = updated.find(a => a.id === id);
      if (match) setSelectedAttendee(match);
    }
  };

  // Start Camera Stream
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Camera access not supported on this device/browser.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });

      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setCameraActive(true);
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      setCameraError('Could not access camera. Please check browser permissions or use manual code entry.');
      setCameraActive(false);
    }
  };

  // Stop Camera Stream
  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setCameraActive(false);
  };

  // Open Scanner Modal
  const handleOpenScanner = () => {
    setIsScannerOpen(true);
    setScanResult(null);
    setManualCodeInput('');
    startCamera();
  };

  // Close Scanner Modal
  const handleCloseScanner = () => {
    stopCamera();
    setIsScannerOpen(false);
    setScanResult(null);
  };

  // Process a scanned or typed ticket code
  const handleVerifyTicketCode = async (codeToVerify: string) => {
    const cleanCode = codeToVerify.trim().toUpperCase();
    if (!cleanCode) return;

    // Optional call to backend API check-in
    const targetEventId = selectedEventId !== 'all' ? selectedEventId : (events[0]?.id || '');
    if (organizer?.id && targetEventId) {
      try {
        await attendeesApi.checkInAttendee(organizer.id, targetEventId, cleanCode);
      } catch (err: any) {
        console.warn('Backend check-in notice:', err?.response?.data?.message || err?.message);
      }
    }

    // Search by ticket code, order ID, or attendee email
    const match = attendees.find(a => 
      a.ticketCode.toUpperCase() === cleanCode ||
      a.orderId.toUpperCase() === cleanCode ||
      a.email.toLowerCase() === cleanCode.toLowerCase()
    );

    if (!match) {
      setScanResult({
        status: 'not_found',
        message: `Ticket pass "${cleanCode}" was not found in registered guest list.`
      });
      return;
    }

    if (match.checkInStatus === 'Checked In') {
      setScanResult({
        status: 'already_checked',
        attendee: match,
        message: `Already checked in at ${match.checkedInAt ? new Date(match.checkedInAt).toLocaleTimeString() : 'earlier today'} by ${match.checkedInBy || 'Staff'}.`
      });
      return;
    }

    // Mark as Checked In
    const now = new Date().toISOString();
    const updated = attendees.map(a => {
      if (a.id === match.id) {
        return {
          ...a,
          checkInStatus: 'Checked In' as const,
          checkedInAt: now,
          checkedInBy: currentStaffName || 'Gate Scanner'
        };
      }
      return a;
    });

    saveAttendees(updated);
    const updatedAttendee = updated.find(a => a.id === match.id)!;

    setScanResult({
      status: 'success',
      attendee: updatedAttendee,
      message: `Verified! Entry Granted for ${updatedAttendee.name}.`
    });

    showNotification(`Gate Entry Granted: ${updatedAttendee.name} (${updatedAttendee.ticketType})`, 'success');
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
        <div className="border-b border-zinc-200/80 pb-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Gate Operations
                </span>
                <span className="text-xs font-semibold text-zinc-400">•</span>
                <span className="text-xs font-bold text-zinc-500 font-mono">Live Check-In</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight flex items-center gap-2.5">
                <UserCheck className="w-7 h-7 text-[#E31B23]" />
                Guest Check-In & Gate Scanner
              </h1>
              <p className="text-zinc-500 text-xs sm:text-sm font-medium mt-1">
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
                className="gap-2 bg-white"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#E31B23]' : ''}`} />
                <span>Refresh</span>
              </Button>

              {perms.canDownloadAttendees && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportCSV}
                  className="gap-2 bg-white"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Roster</span>
                </Button>
              )}

              {perms.canScanGateTickets && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleOpenScanner}
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
            icon={<Users className="w-5 h-5 text-zinc-700" />}
          />

          <StatCard
            title="Checked In at Gate"
            value={metrics.checkedIn.toString()}
            description={`${metrics.checkInRate}% attendance rate`}
            trend={{ value: metrics.checkInRate, type: 'up' }}
            icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          />

          <StatCard
            title="Awaiting Arrival"
            value={metrics.pending.toString()}
            description="Tickets yet to be scanned"
            icon={<Clock className="w-5 h-5 text-amber-600" />}
          />

          <StatCard
            title="VIP All-Access"
            value={metrics.vipCount.toString()}
            description="Priority access guests"
            icon={<Sparkles className="w-5 h-5 text-indigo-600" />}
          />
        </div>

        {/* Live Attendance Progress Bar */}
        <div className="p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-zinc-700 flex items-center gap-1.5">
              <ScanLine className="w-4 h-4 text-[#E31B23]" />
              Live Venue Occupancy & Gate Clearance
            </span>
            <span className="text-zinc-950 font-mono">
              {metrics.checkedIn} / {metrics.total} Guests ({metrics.checkInRate}%)
            </span>
          </div>
          <div className="w-full bg-zinc-100 rounded-full h-2.5 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${metrics.checkInRate}%` }}
            />
          </div>
        </div>

        {/* Gate Quick Scanner Bar */}
        {perms.canScanGateTickets && (
          <div className="bg-gradient-to-r from-red-50/60 via-zinc-50 to-emerald-50/60 border border-zinc-200/80 rounded-2xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-[#E31B23]" />
                <h3 className="text-sm font-black text-zinc-950">Gate Scanner & Quick Check-In Bar</h3>
              </div>
              <span className="text-[11px] font-bold text-zinc-500">Scan QR or enter ticket voucher code</span>
            </div>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleVerifyTicketCode(manualCodeInput);
                setManualCodeInput('');
              }} 
              className="flex flex-col sm:flex-row gap-2.5"
            >
              <div className="relative flex-1">
                <ScanLine className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Scan QR barcode or enter ticket code or order reference..."
                  value={manualCodeInput}
                  onChange={(e) => setManualCodeInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-xs sm:text-sm font-mono font-bold text-zinc-900 focus:ring-2 focus:ring-[#E31B23]/20 focus:border-[#E31B23] outline-none uppercase"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={!manualCodeInput.trim()}
                  className="bg-[#E31B23] hover:bg-[#c9171e] text-white font-bold px-5 py-2.5 text-xs rounded-xl shadow-xs"
                >
                  Verify & Enter
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleOpenScanner}
                  className="gap-2 bg-white text-xs py-2.5 rounded-xl border-zinc-200"
                >
                  <Camera className="w-3.5 h-3.5 text-zinc-600" />
                  <span>Use Camera</span>
                </Button>
              </div>
            </form>

            {scanResult && (
              <div
                className={`p-3 rounded-xl flex items-center justify-between gap-2 text-xs font-bold border transition-all ${
                  scanResult.status === 'success'
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                    : scanResult.status === 'already_checked'
                    ? 'bg-amber-50 text-amber-900 border-amber-200'
                    : 'bg-rose-50 text-rose-900 border-rose-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  {scanResult.status === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />}
                  <span>{scanResult.message}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setScanResult(null)}
                  className="text-zinc-400 hover:text-zinc-600 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-2xs space-y-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1 min-w-[280px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search guest by name, email, voucher code, or order ID..."
                className="w-full bg-zinc-50/70 hover:bg-zinc-50 focus:bg-white border border-zinc-200 hover:border-zinc-300 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 text-xs sm:text-sm rounded-xl pl-10 pr-4 py-2.5 outline-none transition-all text-zinc-900"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 p-1 rounded-md"
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
                      ? 'bg-zinc-900 text-white shadow-xs'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200/70'
                  }`}
                >
                  {st === 'all' ? 'All Guests' : st === 'Checked In' ? 'Verified Entry' : 'Awaiting Arrival'}
                  <span className={`ml-1.5 px-1.5 py-0.2 rounded-md text-[10px] font-black ${
                    statusFilter === st ? 'bg-white/20 text-white' : 'bg-zinc-200 text-zinc-700'
                  }`}>
                    {st === 'all' ? attendees.length : attendees.filter(a => a.checkInStatus === st).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Secondary Filter: Event & Ticket Tier */}
          <div className="pt-3 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              {/* Event Filter */}
              <div className="flex items-center gap-2">
                <span className="font-bold text-zinc-500">Event:</span>
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-zinc-800 outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/30"
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
                <span className="font-bold text-zinc-500">Category:</span>
                <select
                  value={ticketTierFilter}
                  onChange={(e) => setTicketTierFilter(e.target.value)}
                  className="bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-zinc-800 outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/30"
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

            <div className="text-zinc-500 font-medium">
              Showing <strong className="text-zinc-900 font-bold">{filteredAttendees.length}</strong> of {attendees.length} guests
            </div>
          </div>
        </div>

        {/* Attendees List Table */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-50/80 border-b border-zinc-200 text-zinc-500 font-black uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Attendee Guest</th>
                  <th className="py-3.5 px-4">Ticket Tier</th>
                  <th className="py-3.5 px-4">Ticket Voucher Code</th>
                  <th className="py-3.5 px-4">Order Ref</th>
                  <th className="py-3.5 px-4">Gate Status</th>
                  <th className="py-3.5 px-4 text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 font-semibold text-zinc-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-zinc-500">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Loader2 className="w-7 h-7 animate-spin text-[#E31B23]" />
                        <span className="text-xs font-bold text-zinc-700">Loading attendee roster...</span>
                      </div>
                    </td>
                  </tr>
                ) : attendees.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-zinc-500">
                      <div className="flex flex-col items-center justify-center gap-3 max-w-md mx-auto">
                        <div className="w-14 h-14 rounded-2xl bg-zinc-100 text-zinc-400 flex items-center justify-center border border-zinc-200/80">
                          <Users className="w-7 h-7 text-zinc-400" />
                        </div>
                        <p className="text-base font-bold text-zinc-950">No attendees yet</p>
                        <p className="text-xs text-zinc-500 leading-relaxed max-w-sm">
                          When attendees purchase tickets or register for your events, they will automatically appear here for check-in and roster management.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : filteredAttendees.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-zinc-500">
                      <div className="flex flex-col items-center justify-center gap-3 max-w-md mx-auto">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-400 flex items-center justify-center">
                          <Users className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-black text-zinc-950">No attendees match your search</p>
                        <p className="text-xs text-zinc-500">
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
                        className="hover:bg-zinc-50/70 transition-all cursor-pointer group"
                      >
                        {/* Guest Info */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-full font-black text-xs flex items-center justify-center flex-shrink-0 border ${
                              isCheckedIn ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-zinc-100 text-zinc-700 border-zinc-200'
                            }`}>
                              {att.name?.charAt(0) || 'G'}
                            </div>
                            <div className="min-w-0">
                              <p className="text-zinc-950 font-bold truncate max-w-[170px] group-hover:text-[#E31B23] transition-colors">
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
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-zinc-100 text-zinc-700'
                          }`}>
                            {att.ticketType}
                          </span>
                        </td>

                        {/* Ticket Voucher Code */}
                        <td className="py-3.5 px-4 font-mono font-bold text-zinc-900">
                          <span className="bg-zinc-100 px-2 py-1 rounded-md text-[11px] border border-zinc-200">
                            {att.ticketCode}
                          </span>
                        </td>

                        {/* Order ID */}
                        <td className="py-3.5 px-4 font-mono text-zinc-500">
                          #{att.orderId}
                        </td>

                        {/* Gate Status */}
                        <td className="py-3.5 px-4">
                          {isCheckedIn ? (
                            <div>
                              <Badge variant="success" className="font-bold gap-1 inline-flex items-center">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
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
                              <Clock className="w-3 h-3 text-amber-600" />
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
                                ? 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-700'
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
        <Modal
          isOpen={isScannerOpen}
          onClose={handleCloseScanner}
          title="Live QR Gate Ticket Scanner"
        >
          <div className="space-y-5">
            
            {/* Camera Viewfinder */}
            <div className="relative rounded-2xl overflow-hidden bg-zinc-950 aspect-video flex items-center justify-center border border-zinc-800 shadow-inner">
              <video
                ref={videoRef}
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Viewfinder Target Box Overlay */}
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                <div className="w-48 h-48 border-2 border-emerald-400 rounded-2xl relative animate-pulse shadow-lg flex items-center justify-center">
                  <div className="w-full h-0.5 bg-emerald-400/80 absolute top-1/2 -translate-y-1/2" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 bg-black/60 px-2 py-0.5 rounded-full">
                    Align QR Voucher
                  </span>
                </div>
              </div>

              {!cameraActive && (
                <div className="absolute inset-0 bg-zinc-950/90 flex flex-col items-center justify-center text-center p-6 text-zinc-400 space-y-3">
                  <CameraOff className="w-10 h-10 text-zinc-500" />
                  <p className="text-xs font-semibold text-zinc-300 max-w-xs">
                    {cameraError || 'Camera view paused or not accessible.'}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={startCamera}
                    className="text-xs bg-zinc-900 border-zinc-700 text-white"
                  >
                    Retry Camera Access
                  </Button>
                </div>
              )}
            </div>

            {/* Scan Feedback Banner */}
            {scanResult && (
              <div className={`p-4 rounded-xl border text-xs flex items-start gap-3 transition-all ${
                scanResult.status === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : scanResult.status === 'already_checked'
                  ? 'bg-amber-50 border-amber-200 text-amber-950'
                  : 'bg-rose-50 border-rose-200 text-rose-950'
              }`}>
                {scanResult.status === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />}
                {scanResult.status === 'already_checked' && <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />}
                {scanResult.status === 'not_found' && <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />}

                <div className="space-y-1">
                  <strong className="block font-black text-sm">
                    {scanResult.status === 'success' ? 'PASS VERIFIED: ENTRY GRANTED' : scanResult.status === 'already_checked' ? 'DUPLICATE SCAN DETECTED' : 'TICKET NOT FOUND'}
                  </strong>
                  <p>{scanResult.message}</p>
                  {scanResult.attendee && (
                    <div className="pt-1.5 font-semibold text-[11px] space-y-0.5">
                      <div>Guest: <strong>{scanResult.attendee.name}</strong></div>
                      <div>Tier: <strong>{scanResult.attendee.ticketType}</strong> • Code: <strong className="font-mono">{scanResult.attendee.ticketCode}</strong></div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Manual Code Entry Fallback */}
            <div className="space-y-2 pt-2 border-t border-zinc-100">
              <label className="text-xs font-bold text-zinc-700">Manual Code or Barcode Lookup</label>
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleVerifyTicketCode(manualCodeInput);
                  setManualCodeInput('');
                }}
                className="flex items-center gap-2"
              >
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={manualCodeInput}
                    onChange={(e) => setManualCodeInput(e.target.value)}
                    placeholder="Enter voucher code (e.g. TKT-VIP-4821)..."
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-zinc-900 outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 uppercase"
                  />
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={!manualCodeInput.trim()}
                  className="bg-zinc-900 text-white font-bold"
                >
                  Verify Code
                </Button>
              </form>
            </div>

            {/* Footer Done Button */}
            <div className="pt-2 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCloseScanner}
              >
                Close Scanner
              </Button>
            </div>

          </div>
        </Modal>

        {/* ----------------- GUEST DETAIL MODAL ----------------- */}
        <Modal
          isOpen={!!selectedAttendee}
          onClose={() => setSelectedAttendee(null)}
          title={`Guest Details: ${selectedAttendee?.name || ''}`}
        >
          {selectedAttendee && (
            <div className="space-y-6">
              
              {/* Status Header */}
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-between">
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
                  <span className="font-mono font-bold text-sm bg-zinc-200 px-2 py-0.5 rounded-md text-zinc-950">
                    {selectedAttendee.ticketCode}
                  </span>
                </div>
              </div>

              {/* Guest Profile Details */}
              <div className="p-4 rounded-xl border border-zinc-200 bg-white grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-zinc-500 font-medium block">Full Name</span>
                  <strong className="text-zinc-950 font-bold">{selectedAttendee.name}</strong>
                </div>
                <div>
                  <span className="text-zinc-500 font-medium block">Email Address</span>
                  <strong className="text-zinc-950 font-bold">{selectedAttendee.email}</strong>
                </div>
                <div>
                  <span className="text-zinc-500 font-medium block">Ticket Category</span>
                  <span className="font-bold text-zinc-900">{selectedAttendee.ticketType}</span>
                </div>
                <div>
                  <span className="text-zinc-500 font-medium block">Order Reference</span>
                  <span className="font-mono font-bold text-zinc-900">#{selectedAttendee.orderId}</span>
                </div>
                {selectedAttendee.checkedInAt && (
                  <div>
                    <span className="text-zinc-500 font-medium block">Gate Check-In Time</span>
                    <span className="font-mono text-emerald-700 font-bold">
                      {new Date(selectedAttendee.checkedInAt).toLocaleString()}
                    </span>
                  </div>
                )}
                {selectedAttendee.checkedInBy && (
                  <div>
                    <span className="text-zinc-500 font-medium block">Verified By Staff</span>
                    <strong className="text-zinc-900">{selectedAttendee.checkedInBy}</strong>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="pt-2 border-t border-zinc-200 flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleCheckIn(selectedAttendee.id)}
                  className={selectedAttendee.checkInStatus === 'Checked In' ? 'text-rose-600 border-rose-200 hover:bg-rose-50' : 'text-emerald-700 border-emerald-200 hover:bg-emerald-50'}
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
