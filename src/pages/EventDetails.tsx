import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { resolveImageUrl } from '../utils/imageUrl';
import { 
  Calendar, 
  MapPin, 
  Share2, 
  Heart, 
  ArrowRight, 
  Loader2, 
  AlertCircle, 
  Clock, 
  ShieldCheck, 
  Building, 
  CheckCircle2,
  Sparkles,
  Navigation,
  Copy,
  Check,
  Users,
  Info,
  ExternalLink,
  MessageCircle,
  ChevronRight,
  ChevronDown,
  Image as ImageIcon,
  HelpCircle,
  X,
  Ticket,
  Flame,
  Radio,
  Download,
  RefreshCw,
  Video,
  Sun,
  Moon,
  Tag,
  Globe
} from 'lucide-react';
import { eventApi, normalizeBackendEvent, extractNameOrString } from '../api/events';
import { ticketApi } from '../api/tickets';
import { getApiErrorMessage } from '../api/client';
import type { Event } from '../types/api';
import { formatCurrency, formatEventDateTime } from '../utils/format';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { CheckoutModal } from '../components/checkout/CheckoutModal';
import { isEventFavorited, toggleFavoriteEvent } from '../utils/favorites';
import { favoritesApi } from '../api/favorites';
import HeroHeader from '../components/events/HeroHeader';
import {
  CinematicPageLayout,
  CompactPageLayout,
  SplitPageLayout,
  BentoPageLayout,
  type EventPageLayoutProps
} from '../components/events/EventPageLayouts';

export const EventDetails: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, user } = useAuth();
  const { showNotification } = useNotification();

  const isIframe = (() => {
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  })();
  const isEmbedMode = searchParams.get('embed') === 'true' || location.pathname.includes('/embed') || isIframe;
  
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'about' | 'schedule' | 'location' | 'organizer' | 'faq' | 'gallery'>('about');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Ticket quantities state
  const [selectedTickets, setSelectedTickets] = useState<Record<string, number>>({});
  const [favorited, setFavorited] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  // Embed Mode tab & theme state
  const [embedTab, setEmbedTab] = useState<'tickets' | 'info'>('tickets');
  const [embedTheme, setEmbedTheme] = useState<'light' | 'dark'>(() => {
    const qTheme = searchParams.get('theme');
    if (qTheme === 'dark' || qTheme === 'light') return qTheme;
    return 'light';
  });

  // Share & Calendar Modals
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [calendarModalOpen, setCalendarModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Contact form state
  const [contactMessage, setContactMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // Sync favorited status with user-scoped favorites
  useEffect(() => {
    if (event?.id && isAuthenticated && user?.id) {
      setFavorited(isEventFavorited(event.id, user.id));
    } else {
      setFavorited(false);
    }
  }, [event?.id, isAuthenticated, user?.id]);

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      showNotification('Please sign in to save events to your favorites.', 'warning');
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    if (!event) return;

    const prev = favorited;
    const next = !prev;
    setFavorited(next);

    try {
      if (next) {
        await favoritesApi.addFavorite(event.id);
        showNotification(`Saved "${event.title}" to favorites!`, 'success');
      } else {
        await favoritesApi.removeFavorite(event.id);
        showNotification(`Removed "${event.title}" from favorites.`, 'info');
      }
    } catch (err: any) {
      // Revert optimistic state and show clear API error
      setFavorited(prev);
      toggleFavoriteEvent(event.id, user?.id);
      showNotification(
        getApiErrorMessage(err) || 'Failed to update favorites: Error reaching API.',
        'error'
      );
    }
  };

  const loadEvent = useCallback(() => {
    if (!slug) return;
    setIsLoading(true);
    setError(null);
    eventApi.getEventBySlug(slug)
      .then(async (res) => {
        const raw = (res.data as any)?.data || res.data;
        if (raw) {
          const norm = normalizeBackendEvent(raw);
          try {
            const tktRes = await ticketApi.getEventTicketTypes(norm.id);
            const rawList = tktRes.data;
            if (Array.isArray(rawList) && rawList.length > 0) {
              norm.tickets = rawList.map((t: any) => ({
                id: t.id || t.uuid,
                uuid: t.id || t.uuid,
                name: t.name,
                type: t.type || (Number(t.price) === 0 ? 'free' : 'paid'),
                description: t.description || '',
                price: Number(t.price) || 0,
                quantity: Number(t.quantity) || 100,
                available: t.remainingQuantity ?? t.quantity ?? 100,
                soldQuantity: t.soldQuantity ?? 0,
                isUnlimited: t.ticketCapacity === 'unlimited',
                currency: t.currency || 'NGN',
                status: t.status || 'active',
                ticketCategory: (t.ticketType || t.ticket_type) === 'group' || (Number(t.groupSize || t.group_size) > 1) ? 'group' : 'single',
                groupSize: Number(t.groupSize || t.group_size || 1)
              }));
            }
          } catch (_) {}
          setEvent(norm);
        } else {
          setError('Event details not found.');
        }
      })
      .catch((err) => {
        setError(getApiErrorMessage(err));
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [slug]);

  useEffect(() => {
    loadEvent();
  }, [loadEvent]);

  // Standardize or augment tickets for luxury experience
  const rawTickets = event?.tickets && event.tickets.length > 0 ? event.tickets : [];
  const s = (event as any)?.settings || {};
  const meta = (event as any)?.meta || {};
  const statusMessageType: 'none' | 'pre_sale' | 'post_sales' = 
    (event?.statusMessageType || s.statusMessageType || s.status_message_type || meta.statusMessageType) === 'pre_sale' || 
    (event?.statusMessageType || s.statusMessageType || s.status_message_type || meta.statusMessageType) === 'post_sales'
      ? (event?.statusMessageType || s.statusMessageType || s.status_message_type || meta.statusMessageType)
      : ((event?.isStatusMsgEnabled ?? s.isStatusMsgEnabled ?? s.is_status_msg_enabled ?? meta.isStatusMsgEnabled)
          ? ((event?.statusMessage || s.statusMessage || s.status_message || meta.statusMessage) && 
             ((event?.statusMessage || s.statusMessage || s.status_message || meta.statusMessage).toLowerCase().includes('ended') || 
              (event?.statusMessage || s.statusMessage || s.status_message || meta.statusMessage).toLowerCase().includes('sold out')) ? 'post_sales' : 'pre_sale')
          : 'none');
  const isTicketSalesActive = statusMessageType === 'none';
  const isOnline = 
    event?.locationType === 'online' || 
    (event as any)?.eventType === 'virtual' || 
    Boolean((event as any)?.onlineMeetingUrl);
  const isPhysical = !isOnline;
  const categoryLabel = extractNameOrString(event?.category) || 'General';

  const layoutParam = searchParams.get('layout') as 'cinematic' | 'compact' | 'split' | 'bento' | null;
  const validLayouts = ['cinematic', 'compact', 'split', 'bento'];
  const bannerStyle: 'cinematic' | 'compact' | 'split' | 'bento' =
    (layoutParam && validLayouts.includes(layoutParam))
      ? layoutParam
      : (event?.bannerStyle as any) || (s.bannerStyle as any) || (s.banner_style as any) || (event?.meta?.bannerStyle as any) || 'cinematic';

  const handleGetTickets = () => {
    if (!event) return;
    navigate(`/events/${event.slug || event.id}/tickets`);
  };

  const pageBgClass = 'bg-[#F8F9FB] text-[#111827]';

  const telemetryCardClass = 'bg-white border border-[#E5E7EB] text-zinc-950';

  const telemetryIconClass = 'bg-red-50 text-[#E31B23]';

  const handshakeNavClass = 'bg-white/95 border-zinc-200/90 text-zinc-800 shadow-xs';

  const handshakePillActiveClass = 'bg-zinc-950 text-white shadow-xs';

  const tickets = rawTickets.length > 0
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

  const calculateTotal = () => {
    return Object.entries(selectedTickets).reduce((acc, [tid, qty]) => {
      const ticketDef = tickets.find((t) => t.id === tid);
      if (!ticketDef) return acc;
      return acc + ((ticketDef.price || 0) * qty);
    }, 0);
  };

  const getSelectedCount = () => {
    return Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0);
  };

  const handleCheckout = () => {
    if (!isTicketSalesActive) {
      showNotification(
        statusMessageType === 'pre_sale'
          ? 'Ticket sales have not started yet.'
          : 'Ticket sales have ended for this event.',
        'warning'
      );
      return;
    }

    if (getSelectedCount() === 0) {
      if (tickets.length === 0) {
        showNotification('No tickets available for this event.', 'warning');
        return;
      }
      // Auto-select 1 ticket of first tier
      const firstTicketId = tickets[0].id!;
      setSelectedTickets({ [firstTicketId]: 1 });
    }
    setCheckoutOpen(true);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    showNotification('Event link copied to clipboard!', 'success');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event?.title || 'Event on Eventa',
          text: `Check out ${event?.title} on Eventa!`,
          url: window.location.href
        });
      } catch {
        // Fallback to modal
        setShareModalOpen(true);
      }
    } else {
      setShareModalOpen(true);
    }
  };

  const generateGoogleCalendarUrl = () => {
    if (!event) return '#';
    const title = encodeURIComponent(event.title);
    const details = encodeURIComponent(`${event.description}\n\nBooked via Eventa: ${window.location.href}`);
    const locationStr = encodeURIComponent(
      isPhysical
        ? `${event.venue || 'Venue'}, ${event.address || event.city || ''}`
        : 'Virtual or Online Event'
    );
    const startIso = `${event.startDate.replace(/-/g, '')}T${(event.startTime || '18:00').replace(/:/g, '')}00Z`;
    const endIso = `${(event.endDate || event.startDate).replace(/-/g, '')}T${(event.endTime || '23:00').replace(/:/g, '')}00Z`;
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${locationStr}&dates=${startIso}/${endIso}`;
  };

  const downloadIcsFile = () => {
    if (!event) return;
    const locationValue = isPhysical 
      ? `${event.venue || 'Venue'}, ${event.city || ''}` 
      : 'Virtual or Online Event';
    const icsData = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Eventa//Event Experience//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${event.id || 'event'}@eventa.app`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTSTART:${event.startDate.replace(/-/g, '')}T${(event.startTime || '18:00').replace(/:/g, '')}00Z`,
      `DTEND:${(event.endDate || event.startDate).replace(/-/g, '')}T${(event.endTime || '23:00').replace(/:/g, '')}00Z`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description?.slice(0, 300).replace(/\n/g, ' ')}`,
      `LOCATION:${locationValue}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${event.slug || 'event-pass'}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setCalendarModalOpen(false);
    showNotification('Calendar invitation (.ics) downloaded!', 'success');
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactMessage.trim()) return;
    setIsSendingMessage(true);
    setTimeout(() => {
      setIsSendingMessage(false);
      setContactModalOpen(false);
      setContactMessage('');
      showNotification('Your message has been dispatched to the event organizer!', 'success');
    }, 800);
  };

  const locationTarget = event
    ? (event.latitude && event.longitude
        ? `${event.latitude},${event.longitude}`
        : `${event.venue || ''} ${event.address || ''} ${event.city || ''}`.trim())
    : '';

  const mapsUrl = event 
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationTarget)}`
    : '#';

  const directionsUrl = event
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(locationTarget)}`
    : '#';

  const embedMapUrl = event
    ? `https://maps.google.com/maps?q=${encodeURIComponent(locationTarget)}&t=&z=16&ie=UTF8&iwloc=&output=embed`
    : '';

  const [copiedAddress, setCopiedAddress] = useState(false);
  const handleCopyAddress = () => {
    if (!event) return;
    navigator.clipboard.writeText(`${event.venue}, ${event.address || ''} ${event.city}`);
    setCopiedAddress(true);
    showNotification('Venue address copied to clipboard!', 'success');
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  if (isLoading) {
    if (isEmbedMode) {
      return (
        <div className="w-full h-screen min-h-[460px] bg-[#F9FAFB] p-3.5 sm:p-4 flex flex-col justify-between font-sans animate-pulse box-border">
          <div className="space-y-3">
            <div className="bg-white rounded-2xl p-3.5 border border-zinc-200 shadow-xs flex items-center gap-3">
              <div className="w-13 h-13 rounded-xl bg-zinc-200 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-20 bg-zinc-200 rounded-full" />
                <div className="h-4 w-44 bg-zinc-200 rounded-lg" />
                <div className="h-3 w-32 bg-zinc-200 rounded-md" />
              </div>
            </div>
            <div className="h-9 bg-zinc-200/80 rounded-xl w-full" />
            <div className="space-y-2 pt-1">
              <div className="h-16 bg-white rounded-xl border border-zinc-200" />
              <div className="h-16 bg-white rounded-xl border border-zinc-200" />
            </div>
          </div>
          <div className="pt-3 border-t border-zinc-200 flex items-center justify-between">
            <div className="space-y-1">
              <div className="h-2.5 w-12 bg-zinc-200 rounded" />
              <div className="h-5 w-24 bg-zinc-300 rounded" />
            </div>
            <div className="h-10 w-36 bg-zinc-300 rounded-xl" />
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#F8F9FB] text-[#111827] flex flex-col justify-between">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 space-y-8 lg:space-y-12 pb-32 lg:pb-16 animate-pulse">
          {/* Breadcrumb Skeleton */}
          <div className="flex items-center gap-2">
            <div className="h-3.5 bg-zinc-200 rounded w-12" />
            <div className="h-3 bg-zinc-200 rounded w-3" />
            <div className="h-3.5 bg-zinc-200 rounded w-24" />
            <div className="h-3 bg-zinc-200 rounded w-3" />
            <div className="h-3.5 bg-zinc-200 rounded w-20" />
            <div className="h-3 bg-zinc-200 rounded w-3" />
            <div className="h-3.5 bg-zinc-200 rounded w-36" />
          </div>

          {/* Cinematic Hero Skeleton */}
          <div className="relative min-h-[360px] sm:min-h-[460px] lg:min-h-[540px] w-full rounded-3xl sm:rounded-[32px] overflow-hidden shadow-xl border border-zinc-200 bg-zinc-200 flex flex-col justify-between p-6 sm:p-10">
            {/* Top Badges & Action Buttons */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-24 rounded-full bg-zinc-300" />
                <div className="h-7 w-28 rounded-full bg-zinc-300" />
                <div className="hidden sm:block h-7 w-28 rounded-full bg-zinc-300" />
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-zinc-300" />
                <div className="w-10 h-10 rounded-full bg-zinc-300" />
                <div className="w-10 h-10 rounded-full bg-zinc-300" />
              </div>
            </div>

            {/* Bottom Hero Info */}
            <div className="space-y-4 max-w-3xl">
              <div className="h-5 w-36 rounded-full bg-zinc-300" />
              <div className="h-10 sm:h-14 w-4/5 rounded-2xl bg-zinc-300" />
              <div className="flex flex-wrap gap-4 pt-2">
                <div className="h-5 w-44 rounded-lg bg-zinc-300" />
                <div className="h-5 w-56 rounded-lg bg-zinc-300" />
              </div>
            </div>
          </div>

          {/* 4 Telemetry Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white border border-[#E5E7EB] p-4 sm:p-5 rounded-2xl shadow-xs flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-zinc-100 flex-shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-3 bg-zinc-100 rounded w-16" />
                  <div className="h-4 bg-zinc-100 rounded w-24" />
                </div>
              </div>
            ))}
          </div>

          {/* 2-Column Main Content Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start">
            {/* Left 2 Cols: About, Schedule, Venue */}
            <div className="lg:col-span-2 space-y-8">
              {/* About section card */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200 shadow-xs space-y-4">
                <div className="h-6 bg-zinc-100 rounded-lg w-40" />
                <div className="space-y-2.5 pt-2">
                  <div className="h-4 bg-zinc-100 rounded w-full" />
                  <div className="h-4 bg-zinc-100 rounded w-full" />
                  <div className="h-4 bg-zinc-100 rounded w-5/6" />
                  <div className="h-4 bg-zinc-100 rounded w-4/6" />
                </div>
              </div>

              {/* Schedule / lineup card */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200 shadow-xs space-y-4">
                <div className="h-6 bg-zinc-100 rounded-lg w-48" />
                <div className="space-y-3 pt-2">
                  <div className="h-16 bg-zinc-50 rounded-2xl border border-zinc-100" />
                  <div className="h-16 bg-zinc-50 rounded-2xl border border-zinc-100" />
                </div>
              </div>

              {/* Venue map card */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200 shadow-xs space-y-4">
                <div className="h-6 bg-zinc-100 rounded-lg w-44" />
                <div className="h-56 bg-zinc-100 rounded-2xl w-full" />
              </div>
            </div>

            {/* Right 1 Col: Ticket card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm space-y-5">
                <div className="flex justify-between items-center pb-4 border-b border-zinc-100">
                  <div className="h-5 bg-zinc-100 rounded w-24" />
                  <div className="h-6 bg-zinc-100 rounded w-20" />
                </div>
                <div className="space-y-3">
                  <div className="h-20 bg-zinc-50 rounded-2xl border border-zinc-100" />
                  <div className="h-20 bg-zinc-50 rounded-2xl border border-zinc-100" />
                </div>
                <div className="h-12 bg-zinc-200 rounded-2xl w-full mt-4" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!event || error) {
    if (isEmbedMode) {
      return (
        <div className="w-full h-screen min-h-[460px] bg-[#F9FAFB] flex flex-col items-center justify-center p-6 text-center space-y-3 box-border font-sans">
          <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 text-[#E31B23] flex items-center justify-center shadow-xs">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-black text-zinc-900">Event Experience Unavailable</h3>
            <p className="text-xs text-zinc-500 max-w-xs">{error || 'Unable to load tickets for this event. Please check your connection or link.'}</p>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={loadEvent}
              className="px-4 py-2 bg-[#E31B23] hover:bg-[#B91C1C] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-all active:scale-95"
            >
              Retry
            </button>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 border border-zinc-200 bg-white text-zinc-700 text-xs font-bold rounded-xl hover:bg-zinc-50 transition-all"
            >
              Browse Events
            </a>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#F8F9FB] flex flex-col justify-between">
        <Navbar />
        <main className="flex-1 max-w-xl w-full mx-auto px-6 py-28 text-center space-y-5">
          <div className="w-16 h-16 bg-red-50 border border-red-100 text-[#E31B23] rounded-3xl flex items-center justify-center mx-auto shadow-xs">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Error Reaching API</h2>
            <p className="text-sm text-zinc-600 leading-relaxed max-w-md mx-auto">{error || "Unable to reach the server to load this event experience. Please check your internet connection."}</p>
          </div>
          <div className="pt-3 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={loadEvent}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#E31B23] hover:bg-[#B91C1C] text-white text-xs font-bold rounded-full shadow-md transition-all cursor-pointer active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Connection</span>
            </button>
            <Link to="/discover">
              <button className="px-6 py-3 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-800 text-xs font-bold rounded-full shadow-xs transition-all cursor-pointer">
                Explore Available Events
              </button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const lowestPrice = Math.min(...tickets.map(t => t.price || 0));

  if (isEmbedMode) {
    const isDark = embedTheme === 'dark';
    const totalSelected = getSelectedCount();
    const totalPrice = calculateTotal();
    const dateObj = event.startDate ? new Date(event.startDate) : null;
    const monthShort = dateObj && !isNaN(dateObj.getTime())
      ? dateObj.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
      : 'EVENT';
    const dayNum = dateObj && !isNaN(dateObj.getTime())
      ? dateObj.toLocaleDateString('en-US', { day: 'numeric' })
      : '✦';
    const weekdayShort = dateObj && !isNaN(dateObj.getTime())
      ? dateObj.toLocaleDateString('en-US', { weekday: 'short' })
      : '';

    const googleMapsUrl = event.venue || event.address
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          [event.venue, event.address, event.city].filter(Boolean).join(', ')
        )}`
      : null;

    return (
      <div
        className={`w-full h-screen min-h-[460px] max-h-screen flex flex-col justify-between font-sans antialiased box-border select-none transition-colors duration-200 relative overflow-hidden ${
          isDark
            ? 'bg-[#0B0F19] text-zinc-100'
            : 'bg-[#F9FAFB] text-zinc-900'
        }`}
      >
        {/* Ambient Top Glow / Blurred Cover Backdrop */}
        {event.imageUrl && (
          <div
            className="absolute inset-x-0 top-0 h-28 pointer-events-none opacity-20 dark:opacity-25 blur-2xl transition-opacity bg-cover bg-center"
            style={{ backgroundImage: `url(${event.imageUrl})` }}
          />
        )}

        {/* Content Container (Header + Tabs + Body) */}
        <div className="flex-1 flex flex-col min-h-0 relative z-10 p-3 sm:p-4 space-y-2.5">
          
          {/* Top Hero Card */}
          <div
            className={`rounded-2xl p-3 sm:p-3.5 border transition-all shadow-xs ${
              isDark
                ? 'bg-zinc-900/90 border-white/10 backdrop-blur-md'
                : 'bg-white/95 border-zinc-200/90 backdrop-blur-md shadow-xs'
            }`}
          >
            {/* Upper Action Row: Tags & Controls */}
            <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-zinc-150 dark:border-white/10">
              <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-50 text-[#E31B23] border border-red-200/60 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20 flex-shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E31B23] animate-pulse" />
                  {categoryLabel}
                </span>
                <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${
                  isPhysical
                    ? 'bg-zinc-50 text-zinc-600 border-zinc-200 dark:bg-white/5 dark:text-zinc-300 dark:border-white/10'
                    : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20'
                }`}>
                  {isPhysical ? <MapPin className="w-2.5 h-2.5 text-[#E31B23]" /> : <Video className="w-2.5 h-2.5 text-blue-500" />}
                  {isPhysical ? (event.city || 'In-Person') : 'Virtual Event'}
                </span>
              </div>

              {/* Header Controls: Theme toggle & Open in new tab */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setEmbedTheme(isDark ? 'light' : 'dark')}
                  className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                    isDark
                      ? 'border-white/10 bg-white/5 text-amber-300 hover:bg-white/10'
                      : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                  }`}
                  title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
                >
                  {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                </button>
                <a
                  href={`/events/${event.slug || event.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-1.5 rounded-lg border transition-colors ${
                    isDark
                      ? 'border-white/10 bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                      : 'border-zinc-200 bg-zinc-50 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
                  }`}
                  title="Open full event experience in new tab"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Event Header Main Content */}
            <div className="flex items-center gap-3">
              {/* Thumbnail with Date Leaf Badge */}
              <div className="relative flex-shrink-0">
                <img
                  src={event.imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500'}
                  alt={event.title}
                  className="w-13 h-13 sm:w-14 sm:h-14 rounded-xl object-cover border border-zinc-200 dark:border-white/10 shadow-xs"
                />
                {dateObj && !isNaN(dateObj.getTime()) && (
                  <div className="absolute -bottom-1 -right-1 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-md shadow-xs border border-zinc-200 dark:border-white/10 px-1 py-0.2 flex flex-col items-center leading-none">
                    <span className="text-[7px] font-black text-[#E31B23] tracking-wider">{monthShort}</span>
                    <span className="text-[9px] font-black">{dayNum}</span>
                  </div>
                )}
              </div>

              {/* Title & Metadata */}
              <div className="min-w-0 flex-1 space-y-0.5">
                <h2 className="text-sm sm:text-base font-black truncate leading-snug tracking-tight">
                  {event.title}
                </h2>
                <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 font-medium truncate">
                  <span className="flex items-center gap-1 flex-shrink-0">
                    <Calendar className="w-3 h-3 text-[#E31B23]" />
                    {weekdayShort ? `${weekdayShort}, ` : ''}{formatEventDateTime(event.startDate, event.startTime)}
                  </span>
                  {event.venue && (
                    <span className="hidden sm:inline-flex items-center gap-1 truncate text-zinc-400 dark:text-zinc-500">
                      • {event.venue}
                    </span>
                  )}
                </div>
                {event.organizer?.name && (
                  <div className="flex items-center gap-1 text-[10px] text-zinc-400 dark:text-zinc-400 font-semibold truncate">
                    <span>By {event.organizer.name}</span>
                    <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Segmented Tab Switcher */}
          <div className={`p-1 rounded-xl flex items-center gap-1 text-xs font-bold border ${
            isDark
              ? 'bg-zinc-900/60 border-white/5'
              : 'bg-zinc-100 border-zinc-200/60'
          }`}>
            <button
              type="button"
              onClick={() => setEmbedTab('tickets')}
              className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                embedTab === 'tickets'
                  ? isDark
                    ? 'bg-white/15 text-white shadow-xs'
                    : 'bg-white text-zinc-950 shadow-xs'
                  : isDark
                    ? 'text-zinc-400 hover:text-white'
                    : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              <Ticket className="w-3.5 h-3.5 text-[#E31B23]" />
              <span>Tickets & Passes</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                embedTab === 'tickets'
                  ? 'bg-red-50 text-[#E31B23] dark:bg-red-500/20 dark:text-red-400'
                  : 'bg-zinc-200/60 text-zinc-600 dark:bg-white/10 dark:text-zinc-300'
              }`}>
                {tickets.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setEmbedTab('info')}
              className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                embedTab === 'info'
                  ? isDark
                    ? 'bg-white/15 text-white shadow-xs'
                    : 'bg-white text-zinc-950 shadow-xs'
                  : isDark
                    ? 'text-zinc-400 hover:text-white'
                    : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              <Info className="w-3.5 h-3.5 text-[#E31B23]" />
              <span>Event Details</span>
            </button>
          </div>

          {/* Scrollable Center Body Area */}
          <div className="flex-1 overflow-y-auto min-h-0 pr-1 space-y-2.5 [scrollbar-width:thin]">
            {embedTab === 'tickets' ? (
              <>
                {/* Pre-sale / Status Alert */}
                {!isTicketSalesActive && (
                  <div className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2.5 ${
                    statusMessageType === 'pre_sale'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-900 dark:text-rose-200'
                  }`}>
                    {statusMessageType === 'pre_sale' ? (
                      <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                    )}
                    <p className="leading-snug text-xs">
                      {event?.preSaleMessage || s.preSaleMessage || s.pre_sale_message || meta.preSaleMessage || 
                       event?.postSaleMessage || s.postSaleMessage || s.post_sale_message || meta.postSaleMessage || 
                       event?.statusMessage || s.statusMessage || s.status_message || meta.statusMessage || 
                       (statusMessageType === 'pre_sale' ? 'Ticket sales will begin soon!' : 'Ticket sales have concluded for this event.')}
                    </p>
                  </div>
                )}

                {/* Ticket Pass Cards */}
                {tickets.length === 0 ? (
                  <div className="text-center py-8 text-xs text-zinc-400">
                    No tickets currently listed for this event.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {tickets.map((t) => {
                      const qty = selectedTickets[t.id!] || 0;
                      const isFree = t.price === 0;
                      const isVip = t.name.toLowerCase().includes('vip');
                      const isTable = t.name.toLowerCase().includes('table');
                      const isEarlyBird = t.name.toLowerCase().includes('early');

                      return (
                        <div
                          key={t.id}
                          className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                            qty > 0
                              ? isDark
                                ? 'border-[#E31B23] bg-red-500/10 ring-1 ring-[#E31B23]/40 shadow-sm'
                                : 'border-[#E31B23] bg-red-500/[0.04] ring-1 ring-[#E31B23]/30 shadow-xs'
                              : isDark
                                ? 'border-white/10 bg-white/[0.03] hover:border-white/20'
                                : 'border-zinc-200/90 bg-white hover:border-zinc-300'
                          }`}
                        >
                          <div className="min-w-0 flex-1 space-y-0.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="text-xs sm:text-sm font-black truncate">{t.name}</h4>
                              {isVip && (
                                <span className="px-1.5 py-0.2 rounded text-[8px] font-black uppercase bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                                  VIP Pass
                                </span>
                              )}
                              {isTable && (
                                <span className="px-1.5 py-0.2 rounded text-[8px] font-black uppercase bg-purple-500/20 text-purple-800 dark:text-purple-300 border border-purple-500/30">
                                  Table
                                </span>
                              )}
                              {isEarlyBird && (
                                <span className="px-1.5 py-0.2 rounded text-[8px] font-black uppercase bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                                  Early Bird
                                </span>
                              )}
                            </div>

                            {t.description && (
                              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 line-clamp-1 max-w-[220px] sm:max-w-xs">
                                {t.description}
                              </p>
                            )}

                            <div className="flex items-center gap-2 pt-0.5">
                              <span className="text-xs sm:text-sm font-black text-[#E31B23] dark:text-red-400">
                                {isFree ? 'Free Pass' : formatCurrency(t.price)}
                              </span>
                              {t.perks && t.perks.length > 0 && (
                                <span className="hidden sm:inline-flex text-[9px] text-zinc-400 dark:text-zinc-500 font-medium">
                                  • {t.perks[0]}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Tactile Quantity Stepper */}
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => handleQtyChange(t.id!, -1)}
                              disabled={qty === 0}
                              className={`w-7 h-7 rounded-lg border font-black text-xs flex items-center justify-center transition-all cursor-pointer ${
                                qty === 0
                                  ? 'opacity-25 cursor-not-allowed border-transparent'
                                  : isDark
                                    ? 'bg-white/10 hover:bg-white/20 border-white/10 text-white active:scale-95'
                                    : 'bg-zinc-100 hover:bg-zinc-200 border-zinc-200 text-zinc-800 active:scale-95'
                              }`}
                            >
                              -
                            </button>
                            <span className="text-xs font-black w-5 text-center">{qty}</span>
                            <button
                              type="button"
                              onClick={() => handleQtyChange(t.id!, 1)}
                              className={`w-7 h-7 rounded-lg border font-black text-xs flex items-center justify-center transition-all cursor-pointer ${
                                isDark
                                  ? 'bg-white/10 hover:bg-white/20 border-white/10 text-white active:scale-95'
                                  : 'bg-zinc-100 hover:bg-zinc-200 border-zinc-200 text-zinc-800 active:scale-95'
                              }`}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Trust Badges */}
                <div className="pt-1 flex items-center justify-between text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">
                  <span className="flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-500" />
                    Instant E-Ticket Delivery
                  </span>
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                    Guaranteed Valid Entry
                  </span>
                </div>
              </>
            ) : (
              /* Embed Tab: Event Details & Location */
              <div className="space-y-2.5">
                {/* About Summary */}
                <div className={`p-3 rounded-xl border text-xs ${
                  isDark ? 'bg-white/[0.03] border-white/10' : 'bg-white border-zinc-200/90'
                }`}>
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                    About This Event
                  </h4>
                  <p className="text-zinc-600 dark:text-zinc-300 line-clamp-3 leading-relaxed">
                    {event.description || 'Join us for this exciting live event experience. Reserve your passes today.'}
                  </p>
                </div>

                {/* Venue & Location Details */}
                <div className={`p-3 rounded-xl border text-xs space-y-2 ${
                  isDark ? 'bg-white/[0.03] border-white/10' : 'bg-white border-zinc-200/90'
                }`}>
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    Location & Access
                  </h4>
                  {isPhysical ? (
                    <div className="space-y-1.5">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-[#E31B23] flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-zinc-900 dark:text-white leading-snug">
                            {event.venue || 'Venue Address'}
                          </p>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                            {[event.address, event.city, event.state, event.country].filter(Boolean).join(', ')}
                          </p>
                        </div>
                      </div>
                      {googleMapsUrl && (
                        <a
                          href={googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#E31B23] hover:underline pt-0.5"
                        >
                          <span>Open in Google Maps</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-start gap-2">
                      <Video className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-zinc-900 dark:text-white leading-snug">
                          Live Virtual Stream
                        </p>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          Secure stream credentials & calendar invitations are automatically dispatched to your email address upon registration.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Organizer Card */}
                {event.organizer && (
                  <div className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                    isDark ? 'bg-white/[0.03] border-white/10' : 'bg-white border-zinc-200/90'
                  }`}>
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-500/20 text-[#E31B23] font-black text-xs flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {event.organizer.logo ? (
                          <img 
                            src={resolveImageUrl(event.organizer.logo)} 
                            alt={event.organizer.name} 
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display = 'none';
                            }}
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          event.organizer.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <p className="font-bold truncate text-zinc-900 dark:text-white">{event.organizer.name}</p>
                          <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                        </div>
                        <p className="text-[10px] text-zinc-400">Verified Event Host</p>
                      </div>
                    </div>
                    <Link
                      to={`/organizers/${event.organizer.slug || event.organizer.id}`}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-colors inline-flex items-center gap-1.5 flex-shrink-0 ${
                        isDark
                          ? 'border-white/10 bg-white/5 text-white hover:bg-white/10'
                          : 'border-zinc-200 bg-zinc-50 text-zinc-800 hover:bg-zinc-100'
                      }`}
                    >
                      <Building className="w-3 h-3 text-[#E31B23]" />
                      <span>View Organizer Profile</span>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sticky Luxury Checkout Bottom Bar */}
        <div
          className={`p-3 sm:p-3.5 border-t relative z-20 backdrop-blur-lg transition-colors ${
            isDark
              ? 'bg-[#090D16]/95 border-white/10'
              : 'bg-white/95 border-zinc-200/80 shadow-[0_-4px_16px_rgba(0,0,0,0.03)]'
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide block leading-tight">
                {totalSelected > 0 ? `${totalSelected} Pass${totalSelected > 1 ? 'es' : ''}` : 'Total'}
              </span>
              <span className="text-base sm:text-lg font-black text-zinc-950 dark:text-white leading-tight">
                {totalPrice === 0 && totalSelected > 0 ? 'Free' : formatCurrency(totalPrice)}
              </span>
            </div>

            {isTicketSalesActive ? (
              <button
                type="button"
                onClick={handleCheckout}
                className="py-2.5 px-4 sm:px-5 bg-gradient-to-r from-[#E31B23] via-[#DC2626] to-[#B91C1C] hover:brightness-110 text-white text-xs sm:text-sm font-black rounded-xl shadow-[0_4px_14px_rgba(227,27,35,0.3)] transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 flex-shrink-0"
              >
                <span>
                  {totalPrice === 0
                    ? totalSelected > 0
                      ? 'Claim Free Pass'
                      : 'Register Free'
                    : 'Proceed to Checkout'}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <a
                href={`/events/${event.slug || event.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-3.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl transition-all inline-flex items-center gap-1.5"
              >
                <span>View Event</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {/* Trust Guarantee & Powered by Line */}
          <div className="flex items-center justify-between text-[10px] text-zinc-400 dark:text-zinc-500 font-medium pt-2">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              SSL 256-bit Secure
            </span>
            <a
              href={`/events/${event.slug || event.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-900 dark:hover:text-white font-bold inline-flex items-center gap-0.5 transition-colors"
            >
              Powered by Eventa &rarr;
            </a>
          </div>
        </div>

        {/* Checkout Modal Flow within Embed */}
        <CheckoutModal
          isOpen={checkoutOpen}
          onClose={() => setCheckoutOpen(false)}
          event={event}
          selectedTickets={selectedTickets}
        />
      </div>
    );
  }

  const layoutProps: EventPageLayoutProps = {
    event,
    categoryLabel,
    activeTab,
    setActiveTab,
    isPhysical,
    isTicketSalesActive,
    statusMessageType,
    lowestPrice,
    directionsUrl,
    mapsUrl,
    embedMapUrl,
    handleGetTickets,
    handleNativeShare,
    setCalendarModalOpen,
    handleToggleFavorite,
    favorited,
    openFaqIndex,
    setOpenFaqIndex,
    handleCopyAddress,
    copiedAddress,
    setContactModalOpen
  };

  return (
    <div className={`min-h-screen ${pageBgClass} flex flex-col justify-between transition-colors duration-500`}>
      <Navbar />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 space-y-8 lg:space-y-12 pb-32 lg:pb-16">
        
        {/* ========================================================================= */}
        {/* 1. BREADCRUMBS NAVIGATION */}
        {/* ========================================================================= */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-zinc-400 overflow-x-auto whitespace-nowrap">
          <Link to="/" className="hover:text-zinc-900 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-300 flex-shrink-0" />
          <Link to="/discover" className="hover:text-zinc-900 transition-colors">Discover Events</Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-300 flex-shrink-0" />
          <span className="text-zinc-600 font-bold">{categoryLabel}</span>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-300 flex-shrink-0" />
          <span className="text-zinc-950 font-bold truncate max-w-[220px]">{event.title}</span>
        </nav>

        {/* ========================================================================= */}
        {/* EVENT STATUS MESSAGE BANNER */}
        {/* ========================================================================= */}
        {(() => {
          const s = (event as any)?.settings || {};
          const m = (event as any)?.meta || {};
          const msgType = event?.statusMessageType || s.statusMessageType || s.status_message_type || m.statusMessageType || 
            ((event?.isStatusMsgEnabled ?? s.isStatusMsgEnabled ?? s.is_status_msg_enabled ?? m.isStatusMsgEnabled) 
              ? ((event?.statusMessage || s.statusMessage || s.status_message || m.statusMessage)?.toLowerCase().includes('ended') || 
                 (event?.statusMessage || s.statusMessage || s.status_message || m.statusMessage)?.toLowerCase().includes('sold out') ? 'post_sales' : 'pre_sale') 
              : 'none');
          if (msgType === 'none' && !event?.isStatusMsgEnabled && !s.isStatusMsgEnabled && !m.isStatusMsgEnabled) return null;

          const isPreSale = msgType === 'pre_sale';
          const displayMsg = isPreSale 
            ? (event?.preSaleMessage || s.preSaleMessage || s.pre_sale_message || m.preSaleMessage || event?.statusMessage || s.statusMessage || s.status_message || m.statusMessage || 'Tickets will go on sale soon. Join our waitlist to be notified first!')
            : (event?.postSaleMessage || s.postSaleMessage || s.post_sale_message || m.postSaleMessage || event?.statusMessage || s.statusMessage || s.status_message || m.statusMessage || 'Ticket sales have ended. Thank you for your interest and support!');

          if (!displayMsg) return null;

          return (
            <div className={`p-4 sm:p-5 rounded-2xl border shadow-xs flex items-center justify-between gap-4 transition-all ${
              isPreSale
                ? 'bg-amber-50/90 border-amber-300/80 text-amber-950'
                : 'bg-rose-50/90 border-rose-300/80 text-rose-950'
            }`}>
              <div className="flex items-start sm:items-center gap-3.5">
                <div className={`p-2.5 rounded-xl flex-shrink-0 ${
                  isPreSale ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                }`}>
                  {isPreSale ? <Clock className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                </div>
                <div className="space-y-0.5">
                  <span className={`text-[10px] font-black uppercase tracking-wider block ${
                    isPreSale ? 'text-amber-800' : 'text-rose-800'
                  }`}>
                    {isPreSale ? 'Pre-Sale Announcement' : 'Ticket Sales Notice'}
                  </span>
                  <p className="text-xs sm:text-sm font-semibold leading-snug text-zinc-900">
                    {displayMsg}
                  </p>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ========================================================================= */}
        {/* 2. DYNAMIC HERO HEADER SECTION (Cinematic Full | Compact Header | Split Visual) */}
        {/* ========================================================================= */}
        <HeroHeader
          layout={bannerStyle}
          event={event}
          categoryLabel={categoryLabel}
          isTicketSalesActive={isTicketSalesActive}
          statusMessageType={statusMessageType}
          isPhysical={isPhysical}
          favorited={favorited}
          directionsUrl={directionsUrl}
          mapsUrl={mapsUrl}
          onShare={handleNativeShare}
          onCalendar={() => setCalendarModalOpen(true)}
          onToggleFavorite={handleToggleFavorite}
          onSelectTickets={handleGetTickets}
        />

        {/* ========================================================================= */}
        {/* 3. FOUR-COLUMN KEY TELEMETRY STRIP */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          <div className={`${telemetryCardClass} p-4 sm:p-5 rounded-2xl shadow-xs flex items-center gap-3.5`}>
            <div className={`w-11 h-11 rounded-xl ${telemetryIconClass} flex items-center justify-center flex-shrink-0`}>
              <Calendar className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold opacity-60 uppercase tracking-wider block">Date & Time</span>
              <p className="text-xs sm:text-sm font-black truncate">
                {formatEventDateTime(event.startDate, event.startTime)}
              </p>
            </div>
          </div>

          <div className={`${telemetryCardClass} p-4 sm:p-5 rounded-2xl shadow-xs flex items-center justify-between gap-3`}>
            <div className="flex items-center gap-3.5 min-w-0">
              <div className={`w-11 h-11 rounded-xl ${telemetryIconClass} flex items-center justify-center flex-shrink-0`}>
                {isPhysical ? <MapPin className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold opacity-60 uppercase tracking-wider block">
                  {isPhysical ? 'Venue' : 'Event Format'}
                </span>
                <p className="text-xs sm:text-sm font-black truncate">
                  {isPhysical ? (event.venue || 'Venue') : 'Virtual or Online Event'}
                </p>
              </div>
            </div>

            {isPhysical && (
              <a
                href={directionsUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-red-50 hover:bg-[#E31B23] text-[#E31B23] hover:text-white transition-colors flex-shrink-0 cursor-pointer shadow-2xs"
                title="Get Directions"
              >
                <Navigation className="w-4 h-4" />
              </a>
            )}
          </div>

          <div className={`${telemetryCardClass} p-4 sm:p-5 rounded-2xl shadow-xs flex items-center gap-3.5`}>
            <div className={`w-11 h-11 rounded-xl ${telemetryIconClass} flex items-center justify-center flex-shrink-0`}>
              <Users className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold opacity-60 uppercase tracking-wider block">Audience</span>
              <p className="text-xs sm:text-sm font-black truncate">
                {event.capacity ? `${event.capacity}+ Attendees` : 'High Attendance'}
              </p>
            </div>
          </div>

          <div className={`${telemetryCardClass} p-4 sm:p-5 rounded-2xl shadow-xs flex items-center gap-3.5`}>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold opacity-60 uppercase tracking-wider block">Box Office</span>
              <p className="text-xs sm:text-sm font-black truncate">100% Verified Pass</p>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3.5 STICKY HANDSHAKE QUICK NAVIGATION & PASS CONCIERGE BAR */}
        {/* ========================================================================= */}
        <div className={`sticky top-16 z-30 backdrop-blur-md border p-2 sm:p-2.5 rounded-2xl sm:rounded-3xl flex items-center justify-between gap-3 overflow-x-auto ${handshakeNavClass}`}>
          {/* Section Filter Quick Jump Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none flex-shrink-0">
            {[
              { id: 'about', label: 'About Experience' },
              { id: 'schedule', label: 'Lineup & Schedule' },
              { id: 'location', label: isPhysical ? 'Venue & Directions' : 'Virtual or Online Event' },
              { id: 'organizer', label: 'Host & Organizer' },
              ...(event.galleryUrls && event.galleryUrls.length > 0 ? [{ id: 'gallery', label: 'Media & Gallery' }] : []),
              { id: 'faq', label: 'Guidelines & FAQs' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  const el = document.getElementById('details-tab-content');
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }}
                className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? handshakePillActiveClass
                    : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Handshake Direct Ticket Booking Pod */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {isTicketSalesActive ? (
              <button
                type="button"
                onClick={handleGetTickets}
                className="px-4 py-2 sm:py-2.5 text-xs font-black rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all hover:scale-102 active:scale-98 whitespace-nowrap bg-[#E31B23] hover:bg-[#B91C1C] text-white"
              >
                <Ticket className="w-3.5 h-3.5" />
                <span>Get Tickets</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleNativeShare}
                className="px-3.5 py-2 sm:py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </button>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. DYNAMIC WHOLE-PAGE STRUCTURE & EXPERIENCE LAYOUT SWITCHER */}
        {/* ========================================================================= */}
        <div id="details-tab-content" className="pt-2">
          {bannerStyle === 'cinematic' && (
            <CinematicPageLayout {...layoutProps} />
          )}
          {bannerStyle === 'compact' && (
            <CompactPageLayout {...layoutProps} />
          )}
          {bannerStyle === 'split' && (
            <SplitPageLayout {...layoutProps} />
          )}
          {bannerStyle === 'bento' && (
            <BentoPageLayout {...layoutProps} />
          )}
        </div>

      </main>

      {/* ========================================================================= */}
      {/* 5. MOBILE FLOATING STICKY ACTION BAR (Visible only on < lg screens) */}
      {/* ========================================================================= */}
      {isTicketSalesActive ? (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 backdrop-blur-xl border-t p-3.5 shadow-2xl bg-white/95 border-zinc-200/80">
          <div className="max-w-md mx-auto flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wide block text-zinc-400">
                Tickets From
              </span>
              <span className="text-base sm:text-lg font-black text-[#E31B23]">
                {lowestPrice === 0 ? 'Free RSVP' : formatCurrency(lowestPrice)}
              </span>
            </div>

            <button
              onClick={handleGetTickets}
              className="flex-1 py-3 px-5 text-xs sm:text-sm font-black rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer bg-[#E31B23] hover:bg-[#B91C1C] text-white"
            >
              <Ticket className="w-4 h-4" />
              <span>Get Tickets</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 backdrop-blur-xl border-t p-3 shadow-2xl bg-white/95 border-zinc-200/80">
          <div className="max-w-md mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {statusMessageType === 'pre_sale' ? (
                <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
              )}
              <span className="text-xs font-bold truncate text-zinc-800">
                {statusMessageType === 'pre_sale' ? 'Pre-Sale: Opening soon' : 'Ticket sales closed'}
              </span>
            </div>
            <button
              onClick={handleNativeShare}
              className="px-3.5 py-1.5 bg-zinc-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer flex-shrink-0"
            >
              <Share2 className="w-3 h-3" />
              <span>Share</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. SHARE MODAL DIALOG */}
      {/* ========================================================================= */}
      {shareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setShareModalOpen(false)} />
          <div className="relative z-10 max-w-sm w-full bg-white rounded-3xl p-6 shadow-2xl space-y-5 border border-zinc-150">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h4 className="text-base font-black text-zinc-950">Share Experience</h4>
              <button onClick={() => setShareModalOpen(false)} className="p-1 rounded-full text-zinc-400 hover:text-zinc-900 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-500 font-medium">Invite friends or share {event.title} across your network.</p>

            <div className="grid grid-cols-2 gap-3">
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out ${event.title} on Eventa: ${window.location.href}`)}`}
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold text-center transition-colors"
              >
                WhatsApp
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`I'm attending ${event.title}! Get tickets on Eventa: ${window.location.href}`)}`}
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 text-xs font-bold text-center transition-colors"
              >
                Twitter / X
              </a>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-50 border border-zinc-200">
              <input 
                type="text" 
                readOnly 
                value={window.location.href} 
                className="w-full bg-transparent text-xs text-zinc-700 outline-none truncate font-medium pl-2"
              />
              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex-shrink-0 flex items-center gap-1"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. ADD TO CALENDAR MODAL */}
      {/* ========================================================================= */}
      {calendarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setCalendarModalOpen(false)} />
          <div className="relative z-10 max-w-sm w-full bg-white rounded-3xl p-6 shadow-2xl space-y-5 border border-zinc-150">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h4 className="text-base font-black text-zinc-950">Add to Calendar</h4>
              <button onClick={() => setCalendarModalOpen(false)} className="p-1 rounded-full text-zinc-400 hover:text-zinc-900 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-500 font-medium">Never miss {event.title}. Add the schedule directly into your favorite calendar app.</p>

            <div className="space-y-2.5">
              <a
                href={generateGoogleCalendarUrl()}
                target="_blank"
                rel="noreferrer"
                onClick={() => setCalendarModalOpen(false)}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-xs font-bold text-zinc-900 transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-[#E31B23]" />
                  <span>Google Calendar</span>
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
              </a>

              <button
                onClick={downloadIcsFile}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-xs font-bold text-zinc-900 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2.5">
                  <Download className="w-4 h-4 text-[#E31B23]" />
                  <span>Apple iCal / Outlook (.ics)</span>
                </span>
                <span className="text-[10px] text-zinc-400 uppercase font-bold">Download</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. CONTACT HOST MODAL */}
      {/* ========================================================================= */}
      {contactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setContactModalOpen(false)} />
          <form onSubmit={handleSendMessage} className="relative z-10 max-w-md w-full bg-white rounded-3xl p-6 shadow-2xl space-y-4 border border-zinc-150">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-[#E31B23]" />
                <h4 className="text-base font-black text-zinc-950">Contact Event Host</h4>
              </div>
              <button type="button" onClick={() => setContactModalOpen(false)} className="p-1 rounded-full text-zinc-400 hover:text-zinc-900 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-500 font-medium">
              Have questions regarding {event.title}? Send a direct inquiry to <strong>{event.organizer?.name}</strong>.
            </p>

            <textarea
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              placeholder="Type your question or request here (e.g., VIP parking details, accessibility accommodations)..."
              rows={4}
              required
              className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl p-3.5 text-xs text-zinc-900 placeholder-zinc-400 outline-none focus:border-[#E31B23] transition-all resize-none font-medium"
            />

            <button
              type="submit"
              disabled={isSendingMessage}
              className="w-full py-3 bg-[#E31B23] hover:bg-[#B91C1C] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSendingMessage ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
              <span>{isSendingMessage ? 'Transmitting Message...' : 'Send Message to Host'}</span>
            </button>
          </form>
        </div>
      )}

      {/* Checkout Modal Flow */}
      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        event={event}
        selectedTickets={selectedTickets}
      />

      <Footer />
    </div>
  );
};

export default EventDetails;
