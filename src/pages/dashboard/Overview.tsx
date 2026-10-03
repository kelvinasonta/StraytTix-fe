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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-zinc-950 tracking-tight flex items-center gap-2">
              Good morning, {firstName} <Sparkles className="w-5 h-5 text-amber-500 fill-amber-400 inline-block" />
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 font-medium mt-1">
              Here's what's happening with your events and tickets.
            </p>
          </div>

          <Link
            to="/discover"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#E31B23] hover:bg-[#B91C1C] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex-shrink-0"
          >
            <Compass className="w-4 h-4" />
            <span>Explore Events</span>
          </Link>
        </div>

        {/* 4 Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-500">Upcoming Events</span>
              <div className="w-8 h-8 rounded-xl bg-[#FEF2F2] text-[#E31B23] flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-zinc-950">{upcomingCount}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-500">Tickets Purchased</span>
              <div className="w-8 h-8 rounded-xl bg-[#FEF2F2] text-[#E31B23] flex items-center justify-center">
                <Ticket className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-zinc-950">{ticketsPurchasedCount}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-500">Saved Experiences</span>
              <div className="w-8 h-8 rounded-xl bg-[#FEF2F2] text-[#E31B23] flex items-center justify-center">
                <Heart className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-zinc-950">
              {savedCount}
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-500">Total Spent</span>
              <div className="w-8 h-8 rounded-xl bg-[#FEF2F2] text-[#E31B23] flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-zinc-950">
              {formatCurrency(totalSpent)}
            </p>
          </div>
        </div>

        {/* Upcoming Events List */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 space-y-5 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-zinc-950">Your Upcoming Events</h2>
            <Link to="/dashboard/tickets" className="text-xs font-bold text-[#E31B23] hover:underline flex items-center gap-1">
              View all stubs <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-zinc-100">
            {isLoadingEvents ? (
              <div className="py-8 text-center text-xs text-zinc-400 font-semibold flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#E31B23]" />
                Loading upcoming events...
              </div>
            ) : upcomingEvents.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-400">
                No events currently discovered.
              </div>
            ) : (
              upcomingEvents.map((evt) => (
                <div key={evt.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 first:pt-0 last:pb-0 hover:bg-zinc-50/50 rounded-xl px-2 -mx-2 transition-colors">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <img
                      src={evt.imageUrl}
                      alt={evt.title}
                      className="w-12 h-12 rounded-xl object-cover border border-zinc-100 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-zinc-950 truncate">{evt.title}</h4>
                      <p className="text-[11px] text-zinc-400 mt-0.5 truncate">
                        {formatDate(evt.startDate)} • {evt.city || evt.venue || 'Nigeria'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0 self-end sm:self-auto">
                    <span className="text-xs font-bold text-zinc-900">
                      {evt.tickets && evt.tickets.length > 0 && evt.tickets[0].price === 0
                        ? 'Free'
                        : evt.tickets && evt.tickets.length > 0
                          ? formatCurrency(evt.tickets[0].price)
                          : 'Free Entry'}
                    </span>
                    <Link
                      to={`/events/${evt.slug || evt.id}`}
                      className="px-3 py-1.5 rounded-lg border border-zinc-200 hover:border-zinc-300 bg-white text-zinc-700 text-xs font-bold hover:bg-zinc-50 transition-colors"
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
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 space-y-5 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-zinc-950">Recent Bookings</h2>
            <Link to="/dashboard/tickets" className="text-xs font-bold text-[#E31B23] hover:underline flex items-center gap-1">
              View all tickets <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-150 text-zinc-400 text-[11px] font-bold">
                  <th className="pb-3 font-bold">Ticket / Pass</th>
                  <th className="pb-3 font-bold">Event</th>
                  <th className="pb-3 font-bold">Date</th>
                  <th className="pb-3 font-bold">Price</th>
                  <th className="pb-3 text-right font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 font-medium text-zinc-700">
                {myTickets.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-zinc-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-zinc-300" />
                        <p className="text-xs font-semibold text-zinc-600">No ticket purchases yet</p>
                        <p className="text-[11px] text-zinc-400">Explore events to find and book your next experience.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  myTickets.slice(0, 5).map((tkt) => (
                    <tr key={tkt.id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="py-3.5 font-bold text-zinc-950 font-mono text-[11px]">
                        {tkt.ticketTypeName || tkt.id}
                      </td>
                      <td className="py-3.5 font-bold text-zinc-900">
                        {tkt.eventTitle}
                      </td>
                      <td className="py-3.5 text-zinc-500 font-mono text-[11px]">
                        {tkt.eventDate ? formatDate(tkt.eventDate) : 'Upcoming'}
                      </td>
                      <td className="py-3.5 font-bold text-zinc-950">
                        {Number(tkt.price) === 0 ? 'Free' : formatCurrency(tkt.price || 0)}
                      </td>
                      <td className="py-3.5 text-right">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
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
