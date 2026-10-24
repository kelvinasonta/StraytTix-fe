import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import {
  Calendar,
  MapPin,
  ArrowLeft,
  ShieldCheck,
  Ticket,
  Clock,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  AlertCircle,
  CreditCard,
  Lock,
  Plus,
  Minus
} from 'lucide-react';
import { eventApi, normalizeBackendEvent, extractNameOrString } from '../api/events';
import { ticketApi } from '../api/tickets';
import type { Event, TicketType } from '../types/api';
import { formatCurrency, formatEventDateTime } from '../utils/format';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export const EventTickets: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const { showNotification } = useNotification();

  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedTickets, setSelectedTickets] = useState<Record<string, number>>({});

  useEffect(() => {
    let isMounted = true;
    const loadEvent = async () => {
      if (!slug) return;
      setIsLoading(true);
      try {
        const res = await eventApi.getEventBySlug(slug);
        const raw = (res.data as any)?.data || res.data;
        if (isMounted) {
          const norm = normalizeBackendEvent(raw);
          if ((!norm.tickets || norm.tickets.length === 0) && norm.id) {
            try {
              const tktRes = await ticketApi.getEventTicketTypes(norm.id);
              const loadedTickets = (tktRes.data as any)?.data || tktRes.data || [];
              if (Array.isArray(loadedTickets) && loadedTickets.length > 0) {
                norm.tickets = loadedTickets;
              }
            } catch (tktErr) {
              console.warn('Could not fetch supplemental ticket types:', tktErr);
            }
          }
          setEvent(norm);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('Failed to load event:', err);
          setError('Could not load event passes. Please try again.');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadEvent();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  const rawTickets = event?.tickets && event.tickets.length > 0 ? event.tickets : [];
  const tickets: TicketType[] = rawTickets.length > 0
    ? rawTickets
    : [
        {
          id: 'tkt-ga',
          name: 'General Admission',
          description: 'Standard access to main arena, live performances & food village.',
          price: 15000,
          quantity: 250,
          perks: ['Main arena access', 'Digital QR mobile pass', 'Food & beverage court access']
        },
        {
          id: 'tkt-vip',
          name: 'VIP Experience Pass',
          description: 'Priority fast-track entry, elevated VIP lounge & complimentary drinks.',
          price: 50000,
          quantity: 80,
          perks: ['Fast-track priority gate', 'Dedicated VIP viewing deck', 'Complimentary welcome cocktails', 'Private restrooms']
        },
        {
          id: 'tkt-table',
          name: 'Premium Table of 4',
          description: 'Reserved elevated booth, premium bottle service & dedicated server.',
          price: 250000,
          quantity: 15,
          perks: ['Reserved table for 4 guests', 'Dedicated waitstaff & bottle service', 'Exclusive backstage tour access', 'Complimentary valet parking']
        }
      ];

  const handleQtyChange = (ticketId: string, delta: number) => {
    setSelectedTickets((prev) => {
      const current = prev[ticketId] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [ticketId]: next };
    });
  };

  const calculateSubtotal = () => {
    return Object.entries(selectedTickets).reduce((acc, [tid, qty]) => {
      const ticketDef = tickets.find((t) => t.id === tid);
      if (!ticketDef) return acc;
      return acc + ((ticketDef.price || 0) * qty);
    }, 0);
  };

  const getSelectedCount = () => {
    return Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0);
  };

  const subtotal = calculateSubtotal();
  const serviceFee = subtotal > 0 ? Math.round(subtotal * 0.025) : 0;
  const total = subtotal + serviceFee;

  const handleProceedCheckout = () => {
    if (getSelectedCount() === 0) {
      showNotification('Please select at least 1 ticket to proceed.', 'warning');
      return;
    }
    if (!event) return;
    navigate(`/events/${event.slug || event.id}/checkout`, {
      state: {
        event,
        selectedTickets,
      },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col justify-between">
        <Navbar />
        <div className="max-w-4xl mx-auto w-full px-4 py-16 animate-pulse space-y-6">
          <div className="h-6 w-32 bg-zinc-200 rounded-lg" />
          <div className="h-32 bg-zinc-200 rounded-3xl" />
          <div className="space-y-4">
            <div className="h-24 bg-zinc-200 rounded-2xl" />
            <div className="h-24 bg-zinc-200 rounded-2xl" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col justify-between">
        <Navbar />
        <div className="max-w-md mx-auto w-full px-4 py-20 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-black text-zinc-950">Event Passes Unavailable</h2>
          <p className="text-xs text-zinc-500">{error || 'Could not find this event.'}</p>
          <Link
            to="/discover"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#E31B23] text-white text-xs font-bold rounded-xl"
          >
            Explore Other Events
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const categoryLabel = extractNameOrString(event.category) || 'General';

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col justify-between font-sans">
      <Navbar />

      <main className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        
        {/* Back navigation */}
        <div>
          <Link
            to={`/events/${event.slug || event.id}`}
            className="inline-flex items-center gap-2 text-xs font-bold text-zinc-600 hover:text-zinc-950 transition-colors bg-white px-3 py-1.5 rounded-xl border border-zinc-200 shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#E31B23]" />
            <span>Back to Event Details</span>
          </Link>
        </div>

        {/* Event Header Banner Card */}
        <div className="bg-white border border-zinc-200/90 rounded-3xl p-5 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-200 flex-shrink-0">
              <img
                src={event.bannerUrl || event.imageUrl}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 space-y-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-red-50 text-[#E31B23] border border-red-200/60 inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>{categoryLabel}</span>
              </span>
              <h1 className="text-lg sm:text-2xl font-black text-zinc-950 truncate">
                {event.title}
              </h1>
              <p className="text-xs text-zinc-500 font-semibold flex items-center gap-1.5 truncate">
                <Clock className="w-3.5 h-3.5 text-[#E31B23] flex-shrink-0" />
                <span>{formatEventDateTime(event.startDate, event.startTime)}</span>
                <span>•</span>
                <MapPin className="w-3.5 h-3.5 text-[#E31B23] flex-shrink-0" />
                <span className="truncate">{event.venue || event.city || 'Online'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3.5 py-2 rounded-2xl border border-emerald-200/70 self-start sm:self-center flex-shrink-0">
            <ShieldCheck className="w-4 h-4" />
            <span>100% Verified Pass Guarantee</span>
          </div>
        </div>

        {/* Main Two-Column Layout: Tickets Selection & Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Ticket Tiers (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200/80 pb-3">
              <h2 className="text-base sm:text-lg font-black text-zinc-950 flex items-center gap-2">
                <Ticket className="w-4 h-4 text-[#E31B23]" />
                <span>Select Pass Tier</span>
              </h2>
              <span className="text-xs text-zinc-500 font-semibold">
                Direct host pricing
              </span>
            </div>

            <div className="space-y-3.5">
              {tickets.map((t) => {
                const qty = selectedTickets[t.id!] || 0;
                const isSelected = qty > 0;

                return (
                  <div
                    key={t.id}
                    className={`bg-white rounded-2xl border-2 p-5 transition-all space-y-4 ${
                      isSelected
                        ? 'border-[#E31B23] ring-2 ring-red-100 shadow-sm'
                        : 'border-zinc-200/90 hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-black text-zinc-950">
                            {t.name}
                          </h3>
                          {t.price === 0 && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
                              Free
                            </span>
                          )}
                        </div>
                        {t.description && (
                          <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                            {t.description}
                          </p>
                        )}
                      </div>

                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-2.5 bg-zinc-100 p-1 rounded-xl border border-zinc-200/80 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => handleQtyChange(t.id!, -1)}
                          disabled={qty === 0}
                          className="w-7 h-7 rounded-lg bg-white text-zinc-800 hover:bg-zinc-200 disabled:opacity-40 flex items-center justify-center transition-all cursor-pointer disabled:cursor-not-allowed shadow-2xs"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-6 text-center text-xs font-black text-zinc-950">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQtyChange(t.id!, 1)}
                          className="w-7 h-7 rounded-lg bg-[#E31B23] text-white hover:bg-[#B91C1C] flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-zinc-100 text-xs">
                      <div className="space-y-1">
                        {t.perks && Array.isArray(t.perks) && t.perks.length > 0 && (
                          <ul className="space-y-1">
                            {t.perks.slice(0, 3).map((perk, pIdx) => (
                              <li key={pIdx} className="text-[11px] text-zinc-600 flex items-center gap-1.5 font-medium">
                                <CheckCircle2 className="w-3 h-3 text-[#E31B23] flex-shrink-0" />
                                <span>{perk}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <div className="text-right">
                        <span className="text-lg font-black text-zinc-950 block">
                          {t.price === 0 ? 'FREE' : formatCurrency(t.price)}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-medium">
                          per attendee
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Order Summary & Checkout (5 cols) */}
          <div className="lg:col-span-5 sticky top-24 space-y-4">
            <div className="bg-white border border-zinc-200/90 rounded-3xl p-6 sm:p-7 shadow-lg space-y-5">
              <div className="border-b border-zinc-100 pb-3">
                <h3 className="text-lg font-black text-zinc-950">Order Summary</h3>
                <p className="text-xs text-zinc-400 mt-0.5">Instant mobile ticket issue</p>
              </div>

              {getSelectedCount() === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <Ticket className="w-10 h-10 text-zinc-300 mx-auto" />
                  <p className="text-xs font-bold text-zinc-500">No passes selected</p>
                  <p className="text-[11px] text-zinc-400">Choose your ticket tiers on the left to proceed</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                    {Object.entries(selectedTickets)
                      .filter(([_, qty]) => qty > 0)
                      .map(([tid, qty]) => {
                        const tDef = tickets.find((t) => t.id === tid);
                        if (!tDef) return null;
                        return (
                          <div key={tid} className="flex items-center justify-between text-xs">
                            <span className="font-bold text-zinc-800">
                              {qty}x {tDef.name}
                            </span>
                            <span className="font-black text-zinc-950">
                              {formatCurrency((tDef.price || 0) * qty)}
                            </span>
                          </div>
                        );
                      })}
                  </div>

                  <div className="pt-3 border-t border-zinc-100 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-zinc-500">
                      <span>Subtotal</span>
                      <span className="font-bold text-zinc-800">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between text-zinc-500">
                      <span>Service Fee (2.5%)</span>
                      <span className="font-bold text-zinc-800">{formatCurrency(serviceFee)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm pt-2 border-t border-zinc-100">
                      <span className="font-black text-zinc-950">Total</span>
                      <span className="text-lg font-black text-[#E31B23]">{formatCurrency(total)}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleProceedCheckout}
                    className="w-full py-3.5 bg-[#E31B23] hover:bg-[#B91C1C] text-white text-sm font-black rounded-xl shadow-md hover:shadow-red-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-102 active:scale-98"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Proceed to Checkout</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="pt-3 border-t border-zinc-100 flex items-center justify-center gap-2 text-[11px] font-bold text-zinc-400">
                <Lock className="w-3 h-3 text-emerald-600" />
                <span>256-bit Encrypted Secure Checkout</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EventTickets;
