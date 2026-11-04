import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { eventApi, normalizeBackendEvent } from '../../api/events';
import { ticketApi } from '../../api/tickets';
import type { Event, TicketInstance } from '../../types/api';
import { formatCurrency, formatDate } from '../../utils/format';
import {
  Calendar,
  Ticket,
  DollarSign,
  ArrowRight,
  ChevronRight,
  Sparkles,
  ShoppingBag,
  Clock,
  Loader2,
  Compass,
  Heart
} from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { favoritesApi } from '../../api/favorites';

export const Overview: React.FC = () => {
  const { user } = useAuth();

  // If an organizer accesses /dashboard, route them strictly to their organizer console
  if (user?.accountType === 'organizer') {
    return <Navigate to="/organizer" replace />;
  }

  const firstName = user?.firstName || '';

  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [myTickets, setMyTickets] = useState<TicketInstance[]>([]);
  const [savedCount, setSavedCount] = useState<number>(0);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);

  useEffect(() => {
    setIsLoadingEvents(true);
    eventApi.getEvents({ perPage: 3 })
      .then((res) => {
        const resData: any = res.data;
        const items = Array.isArray(resData?.data) ? resData.data : Array.isArray(resData) ? resData : [];
        setUpcomingEvents(items.map(normalizeBackendEvent));
      })
      .catch((err) => {
        console.error('Failed to load upcoming events for overview:', err);
        setUpcomingEvents([]);
      })
      .finally(() => {
        setIsLoadingEvents(false);
      });

    // Load customer tickets strictly from API
    ticketApi.getCustomerTickets()
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : (res.data as any)?.data || [];
        setMyTickets(list);
      })
      .catch((err) => {
        console.error('Failed to load customer tickets from API:', err);
        setMyTickets([]);
      });

    // Load saved favorites count strictly from API
    favoritesApi.getFavoriteIds()
      .then((ids) => {
        setSavedCount(Array.isArray(ids) ? ids.length : 0);
      })
      .catch(() => {
        setSavedCount(0);
      });
  }, []);

  const ticketsPurchasedCount = myTickets.length;
  const totalSpent = myTickets.reduce((acc, t) => acc + (Number(t.price) || 0), 0);
  const upcomingCount = myTickets.filter(t => t.status === 'Upcoming' || !t.status || (t.status as string) === 'Valid').length;

  return (
    <DashboardLayout>
      <div className="space-y-8">

        {/* Welcome Header + Action Banner */}
        <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#0F0F14] border border-[#E5E7EB] dark:border-white/10 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6 transition-colors">
          <div className="space-y-1.5 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-[#E31B23] border border-red-500/20 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Attendee Dashboard</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-white tracking-tight">
              Welcome back, {firstName || 'there'} 👋
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium">
              Manage your upcoming admission passes, saved experiences, and bookings.
            </p>
          </div>

          <div className="flex items-center gap-3 z-10 flex-wrap">
            <Link
              to="/dashboard/tickets"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-zinc-100 dark:bg-white/10 hover:bg-zinc-200 dark:hover:bg-white/15 text-zinc-900 dark:text-white text-xs font-bold rounded-xl transition-all shadow-xs"
            >
              <Ticket className="w-4 h-4 text-[#E31B23]" />
              <span>My Passes</span>
            </Link>

            <Link
              to="/discover"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#E31B23] hover:bg-[#B91C1C] text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Events</span>
            </Link>
          </div>

          {/* Atmospheric background accent blur */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#E31B23]/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* 4 Key Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white dark:bg-[#0F0F14] p-5 rounded-2xl border border-[#E5E7EB] dark:border-white/10 shadow-xs space-y-3 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Upcoming Events</span>
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-white">{upcomingCount}</p>
              <span className="text-[11px] font-medium text-zinc-400 mt-0.5 block">Active reservations</span>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0F0F14] p-5 rounded-2xl border border-[#E5E7EB] dark:border-white/10 shadow-xs space-y-3 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Tickets Purchased</span>
              <div className="w-9 h-9 rounded-xl bg-[#E31B23]/10 text-[#E31B23] flex items-center justify-center border border-[#E31B23]/20">
                <Ticket className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-white">{ticketsPurchasedCount}</p>
              <span className="text-[11px] font-medium text-zinc-400 mt-0.5 block">Delivered to wallet</span>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0F0F14] p-5 rounded-2xl border border-[#E5E7EB] dark:border-white/10 shadow-xs space-y-3 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Saved Experiences</span>
              <div className="w-9 h-9 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center border border-pink-500/20">
                <Heart className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-white">{savedCount}</p>
              <span className="text-[11px] font-medium text-zinc-400 mt-0.5 block">Favorited line-ups</span>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0F0F14] p-5 rounded-2xl border border-[#E5E7EB] dark:border-white/10 shadow-xs space-y-3 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Total Spent</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-white">
                {formatCurrency(totalSpent)}
              </p>
              <span className="text-[11px] font-medium text-zinc-400 mt-0.5 block">Across all bookings</span>
            </div>
          </div>
        </div>

        {/* Featured Live Experiences */}
        <div className="bg-white dark:bg-[#0F0F14] rounded-3xl border border-[#E5E7EB] dark:border-white/10 p-6 sm:p-7 space-y-5 shadow-xs transition-colors">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-white/10 pb-4">
            <div>
              <h2 className="text-base sm:text-lg font-black text-zinc-950 dark:text-white">Discover Upcoming Live Events</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Curated concerts, festivals, and tech stages you might like</p>
            </div>
            <Link to="/discover" className="text-xs font-bold text-[#E31B23] hover:underline flex items-center gap-1">
              Browse all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-zinc-100 dark:divide-white/10">
            {isLoadingEvents ? (
              <div className="py-12 text-center text-xs text-zinc-400 font-semibold flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#E31B23]" />
                Loading events...
              </div>
            ) : upcomingEvents.length === 0 ? (
              <div className="py-12 text-center text-xs text-zinc-400">
                No events currently discovered.
              </div>
            ) : (
              upcomingEvents.map((evt) => (
                <div key={evt.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 first:pt-1 last:pb-1 hover:bg-zinc-50/80 dark:hover:bg-white/[0.03] rounded-2xl px-3 -mx-3 transition-colors">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <img
                      src={evt.imageUrl}
                      alt={evt.title}
                      className="w-14 h-14 rounded-2xl object-cover border border-zinc-200 dark:border-white/10 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-zinc-950 dark:text-white truncate">{evt.title}</h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                        {formatDate(evt.startDate)} • {evt.city || evt.venue || 'Nigeria'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0 self-end sm:self-auto">
                    <span className="text-xs sm:text-sm font-black text-zinc-900 dark:text-white">
                      {evt.tickets && evt.tickets.length > 0 && evt.tickets[0].price === 0
                        ? 'Free'
                        : evt.tickets && evt.tickets.length > 0
                          ? formatCurrency(evt.tickets[0].price)
                          : 'Free Entry'}
                    </span>
                    <Link
                      to={`/events/${evt.slug || evt.id}`}
                      className="px-3.5 py-1.5 rounded-xl border border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20 bg-white dark:bg-[#15161C] text-zinc-800 dark:text-zinc-200 text-xs font-bold hover:bg-zinc-50 dark:hover:bg-white/10 transition-colors shadow-2xs"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Orders Section */}
        <div className="bg-white dark:bg-[#0F0F14] rounded-3xl border border-[#E5E7EB] dark:border-white/10 p-6 sm:p-7 space-y-5 shadow-xs transition-colors">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-white/10 pb-4">
            <div>
              <h2 className="text-base sm:text-lg font-black text-zinc-950 dark:text-white">Recent Ticket Orders</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Verified gate tickets and admission records</p>
            </div>
            <Link to="/dashboard/tickets" className="text-xs font-bold text-[#E31B23] hover:underline flex items-center gap-1">
              View all stubs <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-150 dark:border-white/10 text-zinc-400 dark:text-zinc-500 text-[11px] font-mono uppercase tracking-wider">
                  <th className="pb-3 font-bold">Ticket Tier</th>
                  <th className="pb-3 font-bold">Event Title</th>
                  <th className="pb-3 font-bold">Event Date</th>
                  <th className="pb-3 font-bold">Price Paid</th>
                  <th className="pb-3 text-right font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-white/5 font-medium text-zinc-700 dark:text-zinc-300">
                {myTickets.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-zinc-400">
                      <div className="flex flex-col items-center justify-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-white/5 flex items-center justify-center text-zinc-400">
                          <ShoppingBag className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">No ticket purchases yet</p>
                        <p className="text-[11px] text-zinc-400 max-w-sm">Explore live music, tech conferences, and nightlife experiences to get your first ticket pass.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  myTickets.slice(0, 5).map((tkt) => (
                    <tr key={tkt.id} className="hover:bg-zinc-50/60 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 font-bold text-zinc-950 dark:text-white font-mono text-[11px]">
                        {tkt.ticketTypeName || tkt.id}
                      </td>
                      <td className="py-4 font-bold text-zinc-900 dark:text-zinc-100">
                        {tkt.eventTitle}
                      </td>
                      <td className="py-4 text-zinc-500 dark:text-zinc-400 font-mono text-[11px]">
                        {tkt.eventDate ? formatDate(tkt.eventDate) : 'Upcoming'}
                      </td>
                      <td className="py-4 font-bold text-zinc-950 dark:text-white">
                        {Number(tkt.price) === 0 ? 'Free' : formatCurrency(tkt.price || 0)}
                      </td>
                      <td className="py-4 text-right">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          {tkt.status || 'Valid'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default Overview;
