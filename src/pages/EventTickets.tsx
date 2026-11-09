import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import {
  MapPin,
  ArrowLeft,
  ShieldCheck,
  Ticket,
  Clock,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  AlertCircle,
  Lock,
  Plus,
  Minus
} from 'lucide-react';
import { eventApi, normalizeBackendEvent, extractNameOrString } from '../api/events';
import type { Event } from '../types/api';
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
          setEvent(norm);

          // If preset ticket tier is passed in URL query param, initialize with quantity 1
          const presetTier = searchParams.get('tier');
          if (presetTier) {
            setSelectedTickets({ [presetTier]: 1 });
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.response?.data?.message || 'Could not load event ticket details.');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadEvent();
    return () => {
      isMounted = false;
    };
  }, [slug, searchParams]);

  const rawTickets = event?.tickets || [];
  const tickets = rawTickets.length > 0
    ? rawTickets
    : [
        {
          id: 'tkt-ga',
          name: 'General Admission',
          description: 'Standard access to main arena, live performances & food village.',
          price: 15000,
          quantity: 250,
          perks: ['Main arena pass', 'Fast-track gate lane', 'Digital pass QR']
        },
        {
          id: 'tkt-vip',
          name: 'VIP Experience Pass',
          description: 'Dedicated lounge, complimentary cocktail bar, and stage-side access.',
          price: 45000,
          quantity: 75,
          perks: ['VIP lounge access', 'Complimentary drinks bar', 'Stage front pit entry', 'VIP parking space']
        }
      ];

  const handleQtyChange = (tierId: string, delta: number) => {
    setSelectedTickets((prev) => {
      const current = prev[tierId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[tierId];
        return copy;
      }
      return { ...prev, [tierId]: next };
    });
  };

  const getSelectedCount = () => {
    return Object.values(selectedTickets).reduce((a, b) => a + b, 0);
  };

  const subtotal = Object.entries(selectedTickets).reduce((acc, [tid, qty]) => {
    const t = tickets.find((item) => item.id === tid);
    return acc + (t ? (t.price || 0) * qty : 0);
  }, 0);

  const serviceFee = subtotal > 0 ? Math.round(subtotal * 0.025) : 0;
  const total = subtotal + serviceFee;

  const handleProceedCheckout = () => {
    if (getSelectedCount() === 0) {
      showNotification('Please select at least one ticket pass to proceed.', 'error');
      return;
    }

    if (!isAuthenticated) {
      showNotification('Please log in or create an attendee pass to complete checkout.', 'info');
      navigate(`/login?redirect=/events/${event?.slug || event?.id}/tickets`);
      return;
    }

    navigate(`/events/${event?.slug || event?.id}/checkout`, {
      state: {
        selectedTickets,
        event,
        subtotal,
        serviceFee,
        total
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#070709] text-zinc-900 dark:text-white flex flex-col justify-between transition-colors">
        <Navbar />
        <div className="max-w-4xl mx-auto w-full px-4 py-16 animate-pulse space-y-6">
          <div className="h-6 w-32 bg-zinc-200 dark:bg-white/10 rounded-lg" />
          <div className="h-32 bg-zinc-200 dark:bg-white/10 rounded-3xl" />
          <div className="space-y-4">
            <div className="h-24 bg-zinc-200 dark:bg-white/10 rounded-2xl" />
            <div className="h-24 bg-zinc-200 dark:bg-white/10 rounded-2xl" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#070709] text-zinc-900 dark:text-white flex flex-col justify-between transition-colors">
        <Navbar />
        <div className="max-w-md mx-auto w-full px-4 py-20 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-[#E31B23] mx-auto" />
          <h2 className="text-xl font-black text-zinc-950 dark:text-white">Event Passes Unavailable</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{error || 'Could not find this event.'}</p>
          <Link
            to="/discover"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#E31B23] text-white text-xs font-bold rounded-2xl shadow-lg shadow-[#E31B23]/30"
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#070709] text-zinc-900 dark:text-white flex flex-col justify-between font-sans selection:bg-[#E31B23] selection:text-white transition-colors">
      <Navbar />

      <main className="max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-12 xl:px-16 2xl:px-20 py-8 sm:py-12 space-y-8">
        
        {/* Back navigation */}
        <div>
          <Link
            to={`/events/${event.slug || event.id}`}
            className="inline-flex items-center gap-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-colors bg-white dark:bg-white/[0.04] px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-white/10 shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#E31B23]" />
            <span>Back to Event Details</span>
          </Link>
        </div>

        {/* Event Header Banner Card */}
        <div className="bg-white dark:bg-zinc-950/80 border border-zinc-200 dark:border-white/10 rounded-3xl p-5 sm:p-7 shadow-lg dark:shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 backdrop-blur-md">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-200 dark:border-white/15 flex-shrink-0">
              <img
                src={event.bannerUrl || event.imageUrl}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 space-y-1">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 inline-flex items-center gap-1 shadow-md">
                <Sparkles className="w-3 h-3 text-[#E31B23]" />
                <span>{categoryLabel}</span>
              </span>
              <h1 className="text-lg sm:text-2xl font-black text-zinc-950 dark:text-white truncate">
                {event.title}
              </h1>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold flex items-center gap-1.5 truncate">
                <Clock className="w-3.5 h-3.5 text-[#E31B23] flex-shrink-0" />
                <span>{formatEventDateTime(event.startDate, event.startTime)}</span>
                <span>•</span>
                <MapPin className="w-3.5 h-3.5 text-[#E31B23] flex-shrink-0" />
                <span className="truncate">{event.venue || event.city || 'Online'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-2xl border border-emerald-500/25 self-start sm:self-center flex-shrink-0">
            <ShieldCheck className="w-4 h-4" />
            <span>100% Verified Pass Guarantee</span>
          </div>
        </div>

        {/* Main Two-Column Layout: Tickets Selection & Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Ticket Tiers (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/10 pb-3">
              <h2 className="text-base sm:text-lg font-black text-zinc-950 dark:text-white flex items-center gap-2">
                <Ticket className="w-4 h-4 text-[#E31B23]" />
                <span>Select Pass Tier</span>
              </h2>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                Direct host pricing
              </span>
            </div>

            <div className="space-y-4">
              {tickets.map((t) => {
                const qty = selectedTickets[t.id!] || 0;
                const isSelected = qty > 0;

                return (
                  <div
                    key={t.id}
                    className={`bg-white dark:bg-zinc-950/70 rounded-3xl border-2 p-6 transition-all space-y-4 backdrop-blur-md ${
                      isSelected
                        ? 'border-[#E31B23] shadow-lg shadow-[#E31B23]/15'
                        : 'border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/25'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base sm:text-lg font-black text-zinc-950 dark:text-white">
                            {t.name}
                          </h3>
                          {t.price === 0 && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                              Free
                            </span>
                          )}
                        </div>
                        {t.description && (
                          <p className="text-xs text-zinc-600 dark:text-zinc-400 font-normal leading-relaxed">
                            {t.description}
                          </p>
                        )}
                      </div>

                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-2.5 bg-zinc-50 dark:bg-white/[0.05] p-1.5 rounded-2xl border border-zinc-200 dark:border-white/10 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => handleQtyChange(t.id!, -1)}
                          disabled={qty === 0}
                          className="w-8 h-8 rounded-xl bg-zinc-200/70 dark:bg-white/10 text-zinc-900 dark:text-white hover:bg-zinc-300 dark:hover:bg-white/20 disabled:opacity-30 flex items-center justify-center transition-all cursor-pointer disabled:cursor-not-allowed"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-6 text-center text-xs font-mono font-black text-zinc-950 dark:text-white">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQtyChange(t.id!, 1)}
                          className="w-8 h-8 rounded-xl bg-[#E31B23] text-white hover:bg-[#B91C1C] flex items-center justify-center transition-all cursor-pointer shadow-md"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-white/10 text-xs">
                      <div className="space-y-1">
                        {t.perks && Array.isArray(t.perks) && t.perks.length > 0 && (
                          <ul className="space-y-1">
                            {t.perks.slice(0, 3).map((perk, pIdx) => (
                              <li key={pIdx} className="text-[11px] text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5 font-normal">
                                <CheckCircle2 className="w-3 h-3 text-[#E31B23] flex-shrink-0" />
                                <span>{perk}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <div className="text-right">
                        <span className="text-lg sm:text-xl font-black font-mono text-zinc-950 dark:text-white block">
                          {t.price === 0 ? 'FREE' : formatCurrency(t.price)}
                        </span>
                        <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
                          per pass
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Order Summary & Checkout (5 cols) */}
          <div className="lg:col-span-5 sticky top-28 space-y-4">
            <div className="bg-white dark:bg-zinc-950/80 border border-zinc-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-lg dark:shadow-2xl space-y-6 backdrop-blur-md">
              <div className="border-b border-zinc-200 dark:border-white/10 pb-3">
                <h3 className="text-lg font-black text-zinc-950 dark:text-white">Order Summary</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Instant mobile ticket issue</p>
              </div>

              {getSelectedCount() === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <Ticket className="w-10 h-10 text-zinc-400 dark:text-zinc-600 mx-auto" />
                  <p className="text-xs font-bold text-zinc-600 dark:text-zinc-400">No passes selected</p>
                  <p className="text-[11px] text-zinc-500">Choose your ticket tiers on the left to proceed</p>
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
                            <span className="font-bold text-zinc-700 dark:text-zinc-300">
                              {qty}x {tDef.name}
                            </span>
                            <span className="font-black font-mono text-zinc-950 dark:text-white">
                              {formatCurrency((tDef.price || 0) * qty)}
                            </span>
                          </div>
                        );
                      })}
                  </div>

                  <div className="pt-4 border-t border-zinc-200 dark:border-white/10 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
                      <span>Subtotal</span>
                      <span className="font-bold text-zinc-950 dark:text-white font-mono">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
                      <span>Service Fee (2.5%)</span>
                      <span className="font-bold text-zinc-950 dark:text-white font-mono">{formatCurrency(serviceFee)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm pt-3 border-t border-zinc-200 dark:border-white/10">
                      <span className="font-black text-zinc-950 dark:text-white">Total</span>
                      <span className="text-xl font-black font-mono text-[#E31B23]">{formatCurrency(total)}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleProceedCheckout}
                    className="w-full py-4 bg-[#E31B23] hover:bg-[#B91C1C] text-white text-sm font-bold rounded-2xl shadow-lg shadow-[#E31B23]/25 flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-102 active:scale-98"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Proceed to Checkout</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="pt-3 border-t border-white/10 flex items-center justify-center gap-2 text-[11px] font-bold text-zinc-400">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
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
