import React from 'react';
import {
  Calendar,
  MapPin,
  Share2,
  Heart,
  Clock,
  Sparkles,
  Navigation,
  ExternalLink,
  Flame,
  Radio,
  Video,
  Ticket,
  ChevronRight,
  ShieldCheck,
  Building
} from 'lucide-react';
import type { Event } from '../../types/api';
import { resolveImageUrl } from '../../utils/imageUrl';
import { formatEventDateTime, formatDate } from '../../utils/format';
import type { HeroBannerStyle } from './HeroHeaderPicker';

interface HeroHeaderProps {
  layout?: HeroBannerStyle;
  event: Event;
  categoryLabel: string;
  isTicketSalesActive: boolean;
  statusMessageType: 'none' | 'pre_sale' | 'post_sales';
  isPhysical: boolean;
  favorited: boolean;
  directionsUrl: string;
  mapsUrl: string;
  onShare: () => void;
  onCalendar: () => void;
  onToggleFavorite: () => void;
  onSelectTickets?: () => void;
}

export const HeroHeader: React.FC<HeroHeaderProps> = ({
  layout = 'cinematic',
  event,
  categoryLabel,
  isTicketSalesActive,
  statusMessageType,
  isPhysical,
  favorited,
  directionsUrl,
  mapsUrl,
  onShare,
  onCalendar,
  onToggleFavorite,
  onSelectTickets
}) => {
  const coverUrl = event.bannerUrl || event.imageUrl;
  const flyerUrl = event.imageUrl || event.bannerUrl;

  const scrollToTickets = () => {
    if (onSelectTickets) {
      onSelectTickets();
      return;
    }
    const ticketsEl = document.getElementById('tickets-section');
    if (ticketsEl) {
      ticketsEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // =========================================================================
  // TIX.AFRICA INSPIRED HERO (Used for Split / Clean Card Banner)
  // Vibrant curved container with left overlapping poster & clean right details
  // =========================================================================
  if (layout === 'split') {
    return (
      <div className="relative w-full mb-6">
        {/* Curved Card Container */}
        <div className="relative rounded-3xl sm:rounded-[32px] overflow-hidden bg-gradient-to-r from-[#E31B23] via-[#DC2626] to-[#B91C1C] p-6 sm:p-10 lg:p-12 text-white shadow-2xl">
          {/* Subtle Decorative Pattern Background */}
          <div 
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, white 1.5px, transparent 1.5px), radial-gradient(circle at 80% 80%, white 1.5px, transparent 1.5px)`,
              backgroundSize: '28px 28px'
            }}
          />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* LEFT: Clean Overlapping Poster Thumbnail */}
            <div className="lg:col-span-5 flex justify-center lg:justify-start">
              <div className="relative w-full max-w-[340px] aspect-[4/5] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20 bg-zinc-950 group">
                <img
                  src={flyerUrl}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                />
                {/* Subtle top floating favorite & share */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                  <button
                    type="button"
                    onClick={onShare}
                    className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white flex items-center justify-center cursor-pointer transition-all"
                    title="Share event"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={onToggleFavorite}
                    className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white flex items-center justify-center cursor-pointer transition-all"
                    title="Save to favorites"
                  >
                    <Heart className={`w-3.5 h-3.5 ${favorited ? 'fill-[#E31B23] text-[#E31B23]' : ''}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT: Clear Typography & Event Metadata */}
            <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-white/20 backdrop-blur-md text-white border border-white/20 shadow-xs">
                  {categoryLabel}
                </span>
                {event.eventFormat && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-black/20 text-white border border-white/10">
                    {event.eventFormat}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight uppercase leading-tight">
                {event.title}
              </h1>

              {/* Date, Time & Location list exactly as in tix.africa */}
              <div className="space-y-3 pt-2 text-sm sm:text-base font-medium text-white/95 max-w-lg mx-auto lg:mx-0">
                <div className="flex items-center justify-center lg:justify-start gap-3">
                  <Calendar className="w-5 h-5 text-white/80 shrink-0" />
                  <span>{formatDate(event.startDate)}</span>
                </div>

                <div className="flex items-center justify-center lg:justify-start gap-3">
                  <Clock className="w-5 h-5 text-white/80 shrink-0" />
                  <span>{event.startTime ? `${event.startTime} ${event.endTime ? `- ${event.endTime}` : ''}` : '2:00 PM - 7:00 PM WAT'}</span>
                </div>

                <div className="flex items-center justify-center lg:justify-start gap-3">
                  <MapPin className="w-5 h-5 text-white/80 shrink-0" />
                  <span className="truncate">{isPhysical ? (event.venue || event.address || event.city || 'Venue Location') : 'Virtual or Online Event'}</span>
                </div>
              </div>

              {/* Primary "Get a Ticket" CTA (White Pill Button as shown in screenshot) */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
                {isTicketSalesActive ? (
                  <button
                    type="button"
                    onClick={scrollToTickets}
                    className="w-full sm:w-auto px-10 py-4 bg-white hover:bg-zinc-100 text-[#E31B23] font-black text-sm sm:text-base rounded-2xl shadow-xl hover:shadow-2xl transition-all cursor-pointer hover:scale-102 active:scale-98 flex items-center justify-center gap-2"
                  >
                    <Ticket className="w-4 h-4 text-[#E31B23]" />
                    <span>Get a Ticket</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="w-full sm:w-auto px-8 py-3.5 bg-white/20 text-white font-bold text-sm rounded-2xl cursor-not-allowed"
                  >
                    Ticket sales closed
                  </button>
                )}

                <button
                  type="button"
                  onClick={onCalendar}
                  className="w-full sm:w-auto px-5 py-4 bg-black/20 hover:bg-black/30 text-white font-bold text-xs sm:text-sm rounded-2xl border border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Add to Calendar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 1. CINEMATIC FULL HERO
  // =========================================================================
  if (layout === 'cinematic') {
    return (
      <div className="relative group">
        <div
          className="absolute -inset-2 rounded-[36px] opacity-25 blur-3xl transition-opacity duration-700 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at center, #E31B23, #4338CA, transparent 70%)`
          }}
        />

        <div className="relative min-h-[380px] sm:min-h-[480px] lg:min-h-[540px] w-full rounded-3xl sm:rounded-[36px] overflow-hidden shadow-2xl border border-white/10 flex flex-col justify-between p-6 sm:p-10 lg:p-12 bg-zinc-950">
          <img
            src={coverUrl}
            alt={event.title}
            className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-1000 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 via-black/20 to-transparent" />

          {/* Top Floating Glass Badges */}
          <div className="relative z-10 flex items-start justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3.5 py-1.5 rounded-full text-xs font-black tracking-wider uppercase bg-white/90 backdrop-blur-md text-zinc-950 border border-white/40 shadow-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#E31B23]" />
                <span>{categoryLabel}</span>
              </span>

              {isTicketSalesActive ? (
                <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-[#E31B23] text-white shadow-xs flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 fill-white animate-pulse" />
                  <span>Tickets Available</span>
                </span>
              ) : statusMessageType === 'pre_sale' ? (
                <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-amber-500/90 text-white shadow-xs">
                  Pre-Sale Mode
                </span>
              ) : null}

              <span className="hidden sm:inline-flex px-3 py-1.5 rounded-full text-xs font-bold bg-black/50 backdrop-blur-md text-zinc-200 border border-white/15">
                {isPhysical ? (event.venue || 'Venue') : 'Virtual or Online Event'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onShare}
                className="w-10 h-10 rounded-full bg-black/45 backdrop-blur-md text-white border border-white/20 hover:bg-white hover:text-zinc-950 transition-all flex items-center justify-center cursor-pointer shadow-md hover:scale-105 active:scale-95"
                title="Share experience"
              >
                <Share2 className="w-4 h-4" />
              </button>

              <button
                onClick={onCalendar}
                className="w-10 h-10 rounded-full bg-black/45 backdrop-blur-md text-white border border-white/20 hover:bg-white hover:text-zinc-950 transition-all flex items-center justify-center cursor-pointer shadow-md hover:scale-105 active:scale-95"
                title="Add to Calendar"
              >
                <Calendar className="w-4 h-4" />
              </button>

              <button
                onClick={onToggleFavorite}
                className="w-10 h-10 rounded-full bg-black/45 backdrop-blur-md text-white border border-white/20 hover:bg-white hover:text-[#E31B23] transition-all flex items-center justify-center cursor-pointer shadow-md hover:scale-105 active:scale-95"
                title="Save to favorites"
              >
                <Heart className={`w-4 h-4 transition-transform ${favorited ? 'fill-[#E31B23] text-[#E31B23] scale-110' : ''}`} />
              </button>
            </div>
          </div>

          {/* Bottom Hero Information */}
          <div className="relative z-10 max-w-4xl space-y-4 pt-16">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.08]">
              {event.title}
            </h1>

            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs sm:text-sm font-semibold text-zinc-200">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{formatEventDateTime(event.startDate, event.startTime)}</span>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{isPhysical ? (event.venue || event.city || 'Venue') : 'Online Stream'}</span>
              </div>
            </div>

            <div className="pt-3">
              <button
                type="button"
                onClick={scrollToTickets}
                className="px-8 py-3.5 bg-[#E31B23] hover:bg-[#B91C1C] text-white text-sm font-black rounded-2xl shadow-xl hover:shadow-red-600/30 flex items-center gap-2 transition-all cursor-pointer hover:scale-102 active:scale-98"
              >
                <Ticket className="w-4 h-4" />
                <span>Get a Ticket</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. COMPACT HEADER
  // =========================================================================
  if (layout === 'compact') {
    return (
      <div className="relative group space-y-0">
        <div className="h-[220px] sm:h-[280px] lg:h-[320px] w-full rounded-2xl sm:rounded-3xl overflow-hidden relative shadow-lg bg-zinc-950 border border-white/10">
          <img
            src={coverUrl}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700 ease-out brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        </div>

        {/* Attached Details Card */}
        <div className="bg-[#0F0F14]/95 backdrop-blur-xl border border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-7 lg:p-8 shadow-2xl -mt-6 sm:-mt-10 mx-2 sm:mx-6 relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 text-white">
          <div className="space-y-3 max-w-3xl">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-white/10 text-zinc-300 border border-white/10">
              {categoryLabel}
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
              {event.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-zinc-300">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#E31B23]" />
                {formatDate(event.startDate)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#E31B23]" />
                {event.startTime || 'Time TBA'}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#E31B23]" />
                {event.venue || event.city || 'Location TBA'}
              </span>
            </div>
          </div>

          <div className="shrink-0">
            <button
              type="button"
              onClick={scrollToTickets}
              className="px-8 py-3.5 bg-[#E31B23] hover:bg-[#B91C1C] text-white text-sm font-black rounded-2xl shadow-xl transition-all cursor-pointer hover:scale-102 active:scale-98"
            >
              Get a Ticket
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 4. MODERN BENTO GRID
  // =========================================================================
  return (
    <div className="rounded-3xl sm:rounded-[36px] bg-[#0F0F14]/95 backdrop-blur-xl border border-white/10 p-4 sm:p-6 lg:p-8 shadow-2xl space-y-6 text-white">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 rounded-2xl sm:rounded-3xl overflow-hidden relative min-h-[300px] sm:min-h-[380px] bg-zinc-950 border border-white/10 group shadow-xs flex flex-col justify-between p-5 sm:p-7">
          <img
            src={coverUrl}
            alt={event.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-103 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
          <div className="relative z-10 flex items-center justify-between gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-white/95 text-zinc-950 shadow-sm backdrop-blur-xs">
              {categoryLabel}
            </span>
          </div>

          <div className="relative z-10 space-y-2">
            <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">{event.title}</h1>
            <p className="text-xs text-zinc-300">{formatEventDateTime(event.startDate, event.startTime)}</p>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col justify-between p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
          <div className="space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">Host & Security</span>
            <h4 className="text-lg font-bold text-white">Verified Pass Admission</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Admission passes are secured and delivered directly to your wallet upon checkout.
            </p>
          </div>

          <button
            type="button"
            onClick={scrollToTickets}
            className="w-full py-3.5 bg-[#E31B23] hover:bg-[#B91C1C] text-white text-sm font-black rounded-2xl shadow-xl transition-all cursor-pointer active:scale-98"
          >
            Get a Ticket
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroHeader;
