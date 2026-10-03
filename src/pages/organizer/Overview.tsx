import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import OrganizerDashboardLayout from '../../components/layout/OrganizerDashboardLayout';
import { formatCurrency, formatDate } from '../../utils/format';
import {
  Calendar,
  Ticket,
  DollarSign,
  ArrowRight,
  PlusCircle,
  CheckCircle2,
  Clock,
  ChevronRight,
  TrendingUp,
  Users,
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { eventApi, normalizeBackendEvent } from '../../api/events';
import { resolveOrganizerRole, getRolePermissions } from '../../utils/permissions';
import type { Event, Order } from '../../types/api';

export const Overview: React.FC = () => {
  const { user, organizer } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const role = resolveOrganizerRole(organizer);
  const perms = getRolePermissions(role);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      eventApi.getOrganizerEvents(organizer?.id).catch(() => ({ data: [] })),
      perms.canViewOrders ? eventApi.getOrders(organizer?.id).catch(() => ({ data: [] })) : Promise.resolve({ data: [] })
    ])
      .then(([eventsRes, ordersRes]) => {
        const rawEvents = eventsRes.data;
        const eventItems = Array.isArray(rawEvents)
          ? rawEvents
          : Array.isArray((rawEvents as any)?.data)
            ? (rawEvents as any).data
            : [];
        setEvents(eventItems.map(normalizeBackendEvent));

        const rawOrders = ordersRes.data;
        const orderItems = Array.isArray(rawOrders)
          ? rawOrders
          : Array.isArray((rawOrders as any)?.data)
            ? (rawOrders as any).data
            : [];
        setOrders(orderItems);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [organizer?.id, perms.canViewOrders]);

  const totalTicketsSold = orders.reduce((acc, o) => acc + (Number(o.ticketQuantity) || 1), 0);
  const totalRevenue = orders.filter(o => o.status === 'Paid').reduce((acc, o) => acc + Number(o.amount || 0), 0);
  const upcomingEventsCount = events.filter(e => {
    try {
      return new Date(e.startDate) >= new Date();
    } catch {
      return true;
    }
  }).length;

  const firstName = user?.firstName || '';

  return (
    <OrganizerDashboardLayout>
      <div className="space-y-8">

        {/* ========================================================================= */}
        {/* 1. WELCOME HEADER & CREATE EVENT RED ACTION BANNER */}
        {/* ========================================================================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-zinc-950 tracking-tight flex items-center gap-2">
              Good morning, {firstName} <Sparkles className="w-5 h-5 text-amber-500 fill-amber-400 inline-block" />
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 font-medium mt-1">
              {role === 'staff'
                ? 'Welcome to the gate check-in console.'
                : "Here's what's happening with your events and bookings."}
            </p>
          </div>

          {/* Top Right Red Promo Action Card - ONLY if user can create events */}
          {perms.canCreateEvents && (
            <Link
              to="/organizer/events/create"
              className="flex items-center justify-between gap-6 p-4 bg-[#E31B23] hover:bg-[#B91C1C] text-white rounded-2xl transition-all shadow-md hover:shadow-lg group flex-shrink-0"
            >
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold leading-tight">Create Event</h3>
                <p className="text-[11px] text-red-100 font-medium">
                  Get your event in front of thousands of people.
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-white text-[#E31B23] flex items-center justify-center group-hover:translate-x-1 transition-transform flex-shrink-0 shadow-xs">
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 2. STAT METRIC CARDS */}
        {/* ========================================================================= */}
        <div className={`grid gap-4 sm:gap-6 ${perms.canViewRevenue ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-2 lg:grid-cols-3'}`}>
          {/* Card 1: Total Events */}
          <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-500">
                {role === 'staff' ? 'Assigned Events' : 'My Events'}
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#FEF2F2] text-[#E31B23] flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
              {events.length}
            </p>
          </div>

          {/* Card 2: Tickets Sold (Only if can view orders) */}
          {perms.canViewOrders && (
            <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-500">Tickets Sold</span>
                <div className="w-8 h-8 rounded-xl bg-[#FEF2F2] text-[#E31B23] flex items-center justify-center">
                  <Ticket className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
                {totalTicketsSold}
              </p>
            </div>
          )}

          {/* Card 3: Total Revenue (ONLY if can view revenue) */}
          {perms.canViewRevenue && (
            <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-500">Total Revenue</span>
                <div className="w-8 h-8 rounded-xl bg-[#FEF2F2] text-[#E31B23] flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
                {formatCurrency(totalRevenue)}
              </p>
            </div>
          )}

          {/* Card 4: Upcoming Events */}
          <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-500">Upcoming Events</span>
              <div className="w-8 h-8 rounded-xl bg-[#FEF2F2] text-[#E31B23] flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
              {upcomingEventsCount}
            </p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. UPCOMING EVENTS TABLE SECTION */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 space-y-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-zinc-950">Upcoming Events</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Manage ticket availability and listings.</p>
            </div>

            <Link
              to="/organizer/events"
              className="text-xs font-bold text-[#E31B23] hover:text-[#B91C1C] flex items-center gap-1 transition-colors"
            >
              View all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Events List */}
          <div className="divide-y divide-zinc-100">
            {events.slice(0, 3).map((evt) => {
              const capacity = evt.tickets?.reduce((acc, t) => acc + t.quantity, 0) || 500;
              const sold = evt.ticketsSold || 0;

              return (
                <div key={evt.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 first:pt-0 last:pb-0 hover:bg-zinc-50/50 rounded-xl px-2 -mx-2 transition-colors">
                  {/* Event Thumbnail & Info */}
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

                  {/* Status & Progress & Manage Button */}
                  <div className="flex items-center gap-6 sm:gap-8 flex-shrink-0 self-end sm:self-auto">
                    {/* Status Pill */}
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${evt.status === 'Published'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                      : evt.status === 'Upcoming'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                        : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                      }`}>
                      {evt.status}
                    </span>

                    {/* Tickets Capacity */}
                    <div className="text-right min-w-[75px]">
                      <span className="text-[10px] text-zinc-400 font-semibold block">Tickets</span>
                      <span className="text-xs font-bold text-zinc-800">
                        {sold} / {capacity}
                      </span>
                    </div>

                    {/* Manage or Gate Scanner CTA */}
                    <Link
                      to={role === 'staff' ? `/organizer/events/${evt.id}?tab=attendees&sub=checkin` : `/organizer/events/${evt.id}`}
                      className="px-3 py-1.5 rounded-lg border border-zinc-200 hover:border-zinc-300 bg-white text-zinc-700 hover:text-zinc-950 text-xs font-bold hover:bg-zinc-50 transition-colors"
                    >
                      {role === 'staff' ? 'Gate Scanner' : 'Manage'}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. RECENT ORDERS TABLE SECTION (Only for roles with order access) */}
        {/* ========================================================================= */}
        {perms.canViewOrders && (
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 space-y-5 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-zinc-950">Recent Orders</h2>
                <p className="text-xs text-zinc-500 mt-0.5">Latest ticket sales transactions.</p>
              </div>

              <Link
                to="/organizer/orders"
                className="text-xs font-bold text-[#E31B23] hover:text-[#B91C1C] flex items-center gap-1 transition-colors"
              >
                View all <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-150 text-zinc-400 text-[11px] font-bold">
                    <th className="pb-3 font-bold">Order ID</th>
                    <th className="pb-3 font-bold">Event</th>
                    <th className="pb-3 font-bold">Date</th>
                    {perms.canViewRevenue && <th className="pb-3 font-bold">Amount</th>}
                    <th className="pb-3 text-right font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 font-medium text-zinc-700">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={perms.canViewRevenue ? 5 : 4} className="py-10 text-center text-zinc-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <ShoppingBag className="w-5 h-5 text-zinc-300" />
                          <p className="text-xs font-semibold text-zinc-600">No recent orders yet</p>
                          <p className="text-[11px] text-zinc-400">Transactions will show up here once tickets are purchased.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    orders.slice(0, 5).map((order) => (
                      <tr key={order.id} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="py-3.5 font-bold text-zinc-950 font-mono text-[11px]">
                          #{order.id}
                        </td>
                        <td className="py-3.5 font-bold text-zinc-900">
                          {order.eventTitle}
                        </td>
                        <td className="py-3.5 text-zinc-500 font-mono text-[11px]">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : order.eventDate || '—'}
                        </td>
                        {perms.canViewRevenue && (
                          <td className="py-3.5 font-bold text-zinc-950">
                            {formatCurrency(order.amount)}
                          </td>
                        )}
                        <td className="py-3.5 text-right">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${order.status === 'Paid'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                            : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                            }`}>
                            {order.status === 'Paid' ? 'Completed' : order.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </OrganizerDashboardLayout>
  );
};

export default Overview;
