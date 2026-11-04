import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import TicketCard from '../../components/ui/TicketCard';
import Modal from '../../components/ui/Modal';
import { ticketApi } from '../../api/tickets';
import type { TicketInstance } from '../../types/api';
import { 
  QrCode, 
  Download, 
  Calendar, 
  MapPin, 
  Ticket, 
  History, 
  Search, 
  Compass, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import { formatDate } from '../../utils/format';
import { useNotification } from '../../context/NotificationContext';

export const Tickets: React.FC = () => {
  const { showNotification } = useNotification();
  const [selectedTicket, setSelectedTicket] = useState<TicketInstance | null>(null);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const [allTickets, setAllTickets] = useState<TicketInstance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    ticketApi.getCustomerTickets()
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : (res.data as any)?.data || [];
        setAllTickets(list);
      })
      .catch((err) => {
        console.error('Failed to load tickets from API:', err);
        setAllTickets([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Helper to categorize tickets
  const isTicketUpcoming = (ticket: TicketInstance): boolean => {
    if (ticket.status === 'Upcoming') return true;
    if (ticket.status === 'Used' || ticket.status === 'Expired' || ticket.status === 'Cancelled') {
      return false;
    }
    try {
      const eventDate = new Date(ticket.eventDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return eventDate >= today;
    } catch {
      return true;
    }
  };

  // Split into Upcoming and Past
  const upcomingTickets = useMemo(() => {
    return allTickets.filter((t) => isTicketUpcoming(t));
  }, [allTickets]);

  const pastTickets = useMemo(() => {
    return allTickets.filter((t) => !isTicketUpcoming(t));
  }, [allTickets]);

  // Active list based on tab
  const tabTickets = activeTab === 'upcoming' ? upcomingTickets : pastTickets;

  // Filter by search query if typed
  const filteredTickets = useMemo(() => {
    if (!searchQuery.trim()) return tabTickets;
    const q = searchQuery.toLowerCase();
    return tabTickets.filter(
      (t) =>
        t.eventTitle.toLowerCase().includes(q) ||
        t.ticketTypeName.toLowerCase().includes(q) ||
        t.ticketId.toLowerCase().includes(q) ||
        t.eventVenue.toLowerCase().includes(q)
    );
  }, [tabTickets, searchQuery]);

  // Reset page when tab or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  // Pagination calculation
  const totalItems = filteredTickets.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTickets = filteredTickets.slice(startIndex, startIndex + itemsPerPage);

  const handleDownloadTicket = (ticket: TicketInstance) => {
    const ticketContent = `
========================================
           EVENTA PASS ENTRY STUB
========================================
EVENT:       ${ticket.eventTitle}
TIER:        ${ticket.ticketTypeName}
TICKET ID:   ${ticket.ticketId}
DATE:        ${formatDate(ticket.eventDate)}
VENUE:       ${ticket.eventVenue}
STATUS:      ${ticket.status.toUpperCase()}
VERIFY URL:  ${ticket.qrCodeValue}
ISSUED BY:   Eventa Authenticated Box Office
========================================
`.trim();

    const blob = new Blob([ticketContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${ticket.ticketId}-entry-pass.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification(`Ticket stub for ${ticket.eventTitle} downloaded!`, 'success');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 sm:space-y-8">
        
        {/* ========================================================================= */}
        {/* 1. TOP HEADER WITH TELEMETRY & DISCOVER ACTION */}
        {/* ========================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 dark:border-white/10 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-white tracking-tight">
                My Ticket Stubs
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-red-50 dark:bg-red-500/10 text-[#E31B23] border border-red-200/60 dark:border-red-500/20">
                {allTickets.length} Total Passes
              </span>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm font-medium">
              Access, download, and present your verified digital QR entry passes at the gate.
            </p>
          </div>

          <Link to="/discover">
            <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#E31B23] hover:bg-[#B91C1C] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all cursor-pointer">
              <Compass className="w-4 h-4" />
              <span>Discover More Events</span>
            </button>
          </Link>
        </div>

        {/* ========================================================================= */}
        {/* 2. TABS: UPCOMING AND PAST & SEARCH BAR */}
        {/* ========================================================================= */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Segmented Tab Controls */}
          <div className="bg-zinc-100 dark:bg-[#0F0F14] p-1.5 rounded-2xl flex items-center gap-1 border border-zinc-200/60 dark:border-white/10 max-w-fit">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                activeTab === 'upcoming'
                  ? 'bg-white dark:bg-white/10 text-zinc-950 dark:text-white shadow-xs'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <Ticket className={`w-4 h-4 ${activeTab === 'upcoming' ? 'text-[#E31B23]' : 'text-zinc-400 dark:text-zinc-500'}`} />
              <span>Upcoming Passes</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                activeTab === 'upcoming' 
                  ? 'bg-red-50 dark:bg-red-500/20 text-[#E31B23]' 
                  : 'bg-zinc-200 dark:bg-white/5 text-zinc-600 dark:text-zinc-400'
              }`}>
                {upcomingTickets.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('past')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                activeTab === 'past'
                  ? 'bg-white dark:bg-white/10 text-zinc-950 dark:text-white shadow-xs'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <History className={`w-4 h-4 ${activeTab === 'past' ? 'text-[#E31B23]' : 'text-zinc-400 dark:text-zinc-500'}`} />
              <span>Past Experiences</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                activeTab === 'past' 
                  ? 'bg-red-50 dark:bg-red-500/20 text-[#E31B23]' 
                  : 'bg-zinc-200 dark:bg-white/5 text-zinc-600 dark:text-zinc-400'
              }`}>
                {pastTickets.length}
              </span>
            </button>
          </div>

          {/* Search Query Input */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by event or ticket ID..."
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#0F0F14] border border-zinc-200 dark:border-white/10 rounded-xl text-xs font-semibold text-zinc-800 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 outline-none focus:border-[#E31B23] transition-colors shadow-2xs"
            />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. TICKET LIST OR "IF NO TICKETS SHOW NO TICKETS" */}
        {/* ========================================================================= */}
        {isLoading ? (
          <div className="text-center py-20 px-6 bg-white dark:bg-[#0F0F14] border border-zinc-200/80 dark:border-white/10 rounded-3xl shadow-xs flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#E31B23]" />
            <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Loading your tickets...</span>
          </div>
        ) : filteredTickets.length === 0 ? (
          /* ================= EMPTY STATE: NO TICKETS FOUND ================= */
          <div className="text-center py-16 sm:py-20 px-6 bg-white dark:bg-[#0F0F14] border border-zinc-200/80 dark:border-white/10 rounded-3xl shadow-xs space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-red-50 dark:bg-red-500/10 text-[#E31B23] border border-red-100 dark:border-red-500/20 flex items-center justify-center mx-auto shadow-2xs">
              {activeTab === 'upcoming' ? (
                <Ticket className="w-8 h-8" />
              ) : (
                <History className="w-8 h-8" />
              )}
            </div>

            <div className="space-y-1.5 max-w-sm mx-auto">
              <h3 className="text-lg sm:text-xl font-black text-zinc-950 dark:text-white tracking-tight">
                {searchQuery
                  ? 'No matching ticket stubs'
                  : activeTab === 'upcoming'
                  ? 'No Upcoming Ticket Passes'
                  : 'No Past Experiences Yet'}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                {searchQuery
                  ? `No tickets match "${searchQuery}". Try searching for another event title or ticket ID.`
                  : activeTab === 'upcoming'
                  ? "You don't have any upcoming tickets booked. Explore trending live events and secure your pass."
                  : 'Your attended experiences and verified stubs will be archived here once past events conclude.'}
              </p>
            </div>

            <div className="pt-2">
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-5 py-2.5 bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-800 dark:text-zinc-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Clear Search Query
                </button>
              ) : (
                <Link to="/discover">
                  <button className="px-6 py-3 bg-[#E31B23] hover:bg-[#B91C1C] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer inline-flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Explore Events Now</span>
                  </button>
                </Link>
              )}
            </div>
          </div>
        ) : (
          /* ================= PAGINATED TICKET CARDS ================= */
          <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:gap-5">
              {paginatedTickets.map((ticket) => (
                <TicketCard 
                  key={ticket.id} 
                  ticket={ticket} 
                  onView={(t) => setSelectedTicket(t)}
                />
              ))}
            </div>

            {/* ========================================================================= */}
            {/* 4. PAGINATION BUTTONS (Only displayed when tickets exist) */}
            {/* ========================================================================= */}
            {totalPages > 1 && (
              <div className="bg-white dark:bg-[#0F0F14] border border-zinc-200/80 dark:border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
                <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
                  Showing <span className="font-black text-zinc-900 dark:text-white">{startIndex + 1}</span>–
                  <span className="font-black text-zinc-900 dark:text-white">
                    {Math.min(startIndex + itemsPerPage, totalItems)}
                  </span>{' '}
                  of <span className="font-black text-zinc-900 dark:text-white">{totalItems}</span> ticket passes
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-white/10 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/5 disabled:opacity-40 disabled:pointer-events-none transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }).map((_, idx) => {
                      const pageNum = idx + 1;
                      const isActive = currentPage === pageNum;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-9 h-9 rounded-xl text-xs font-black transition-all cursor-pointer ${
                            isActive
                              ? 'bg-[#E31B23] text-white shadow-xs'
                              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-white/10 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/5 disabled:opacity-40 disabled:pointer-events-none transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* 5. DIGITAL TICKET SCAN OVERLAY MODAL */}
        {/* ========================================================================= */}
        <Modal 
          isOpen={!!selectedTicket} 
          onClose={() => setSelectedTicket(null)}
          title="Digital Entry Pass"
          size="md"
        >
          {selectedTicket && (
            <div className="space-y-6 text-center py-2">
              <div className="space-y-1">
                <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-red-50 dark:bg-red-500/10 text-[#E31B23] border border-red-100 dark:border-red-500/20 inline-block">
                  {selectedTicket.ticketTypeName}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-zinc-950 dark:text-white leading-tight pt-1">
                  {selectedTicket.eventTitle}
                </h3>
              </div>

              {/* QR Code Pod */}
              <div className="flex flex-col items-center justify-center p-6 border border-zinc-200 dark:border-white/10 rounded-3xl bg-zinc-50 dark:bg-zinc-900 w-56 h-56 mx-auto shadow-inner">
                <QrCode className="w-40 h-40 text-zinc-900 dark:text-white" />
                <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 mt-2 font-black">
                  {selectedTicket.ticketId}
                </span>
              </div>

              {/* Event Metadata */}
              <div className="space-y-2.5 text-left bg-zinc-50 dark:bg-white/[0.03] p-4 sm:p-5 rounded-2xl border border-zinc-200 dark:border-white/10 text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-[#E31B23] flex-shrink-0" />
                  <span>{formatDate(selectedTicket.eventDate)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-[#E31B23] flex-shrink-0" />
                  <span className="truncate">{selectedTicket.eventVenue}</span>
                </div>
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">100% Genuine Box Office Pass</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => handleDownloadTicket(selectedTicket)}
                  className="w-full inline-flex items-center justify-center gap-2 text-xs sm:text-sm font-bold text-white bg-zinc-950 dark:bg-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 py-3 px-4 rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Save Stub</span>
                </button>

                <Link
                  to={selectedTicket.eventSlug ? `/events/${selectedTicket.eventSlug}` : '/discover'}
                  onClick={() => setSelectedTicket(null)}
                  className="w-full inline-flex items-center justify-center gap-2 text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-200 bg-white dark:bg-white/5 hover:bg-zinc-100 dark:hover:bg-white/10 border border-zinc-300 dark:border-white/10 py-3 px-4 rounded-xl transition-all cursor-pointer shadow-2xs"
                >
                  <span>Event Info</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </Modal>

      </div>
    </DashboardLayout>
  );
};

export default Tickets;
