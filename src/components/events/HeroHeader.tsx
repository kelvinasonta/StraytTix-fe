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
  AlertCircle,
  Radio,
  Video,
  Ticket,
  ChevronRight,
  ShieldCheck,
  Building,
  Crown,
  Cpu,
  Terminal,
  Shield,
  Layers
} from 'lucide-react';
import type { Event } from '../../types/api';
import { resolveImageUrl } from '../../utils/imageUrl';
import { formatEventDateTime } from '../../utils/format';
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
  // 1. CINEMATIC FULL HERO
  // =========================================================================
  if (layout === 'cinematic') {
    return (
      <div className="relative group">
        {/* Ambient Glow Backdrop Blur */}
        <div
          className="absolute -inset-2 rounded-[36px] opacity-25 blur-3xl transition-opacity duration-700 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at center, #E31B23, #4338CA, transparent 70%)`
          }}
        />

        {/* Primary Hero Container */}
        <div className="relative min-h-[380px] sm:min-h-[480px] lg:min-h-[540px] w-full rounded-3xl sm:rounded-[36px] overflow-hidden shadow-2xl border border-zinc-200/80 flex flex-col justify-between p-6 sm:p-10 lg:p-12 bg-zinc-950">
          <img
            src={coverUrl}
            alt={event.title}
            className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-1000 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 via-black/20 to-transparent" />

          {/* Top Floating Glass Badges & Action Pods */}
          <div className="relative z-10 flex items-start justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3.5 py-1.5 rounded-full text-xs font-black tracking-wider uppercase bg-white/90 backdrop-blur-md text-zinc-950 border border-white/40 shadow-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#E31B23]" />
                <span>{categoryLabel}</span>
              </span>

              {isTicketSalesActive ? (
                <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold tracking-wide bg-red-600/90 backdrop-blur-md text-white border border-red-500/40 shadow-xs flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 fill-white animate-pulse" />
                  <span>Selling Fast</span>
                </span>
              ) : statusMessageType === 'pre_sale' ? (
                <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold tracking-wide bg-amber-500/90 backdrop-blur-md text-white border border-amber-400/40 shadow-xs flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-white" />
                  <span>Pre-Sale Mode</span>
                </span>
              ) : (
                <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold tracking-wide bg-zinc-800/90 backdrop-blur-md text-white border border-zinc-700 shadow-xs flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-white" />
                  <span>Sales Closed</span>
                </span>
              )}

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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E31B23]/90 backdrop-blur-md text-white text-[11px] font-black uppercase tracking-wider">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>Confirmed Schedule</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.08] text-shadow-sm">
              {event.title}
            </h1>

            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs sm:text-sm font-semibold text-zinc-200">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{formatEventDateTime(event.startDate, event.startTime)}</span>
              </div>

              <div className="flex items-center gap-2">
                {isPhysical ? (
                  <>
                    <MapPin className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <span>{event.venue || event.city || 'Venue'}</span>
                    {directionsUrl && directionsUrl !== '#' && (
                      <a
                        href={directionsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded-full bg-[#E31B23] hover:bg-[#B91C1C] text-white text-[11px] font-black inline-flex items-center gap-1 ml-1.5 shadow-xs transition-transform hover:scale-105 cursor-pointer"
                      >
                        <Navigation className="w-3 h-3 fill-white" />
                        <span>Get Directions</span>
                      </a>
                    )}
                    {mapsUrl && mapsUrl !== '#' && (
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-red-400 hover:text-white underline text-xs font-bold inline-flex items-center gap-0.5 ml-1"
                      >
                        <span>View Map</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </>
                ) : (
                  <>
                    <Video className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <span>Virtual or Online Event</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-red-950/80 border border-red-500/40 text-red-300 text-[10px] font-bold uppercase tracking-wider ml-1">
                      Stream Link Sent on Order
                    </span>
                  </>
                )}
              </div>
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
        <div className="h-[220px] sm:h-[280px] lg:h-[320px] w-full rounded-2xl sm:rounded-3xl overflow-hidden relative shadow-lg bg-zinc-950 border border-zinc-200/60">
          <img
            src={coverUrl}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/60" />

          {/* Floating Top Banner Controls */}
          <div className="absolute top-4 sm:top-6 inset-x-4 sm:inset-x-6 flex items-center justify-between gap-3 z-10 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-white/95 backdrop-blur-md text-zinc-950 border border-white/50 shadow-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#E31B23]" />
                <span>{categoryLabel}</span>
              </span>

              {isTicketSalesActive ? (
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-red-600/90 backdrop-blur-md text-white border border-red-500/40 shadow-xs flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 fill-white animate-pulse" />
                  <span>Selling Fast</span>
                </span>
              ) : statusMessageType === 'pre_sale' ? (
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500/90 backdrop-blur-md text-white border border-amber-400/40 shadow-xs">
                  Pre-Sale Mode
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-zinc-800/90 backdrop-blur-md text-white">
                  Sales Closed
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onShare}
                className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-md text-white border border-white/20 hover:bg-white hover:text-zinc-950 transition-all flex items-center justify-center cursor-pointer shadow-sm hover:scale-105"
                title="Share"
              >
                <Share2 className="w-4 h-4" />
              </button>

              <button
                onClick={onCalendar}
                className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-md text-white border border-white/20 hover:bg-white hover:text-zinc-950 transition-all flex items-center justify-center cursor-pointer shadow-sm hover:scale-105"
                title="Add to Calendar"
              >
                <Calendar className="w-4 h-4" />
              </button>

              <button
                onClick={onToggleFavorite}
                className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-md text-white border border-white/20 hover:bg-white hover:text-[#E31B23] transition-all flex items-center justify-center cursor-pointer shadow-sm hover:scale-105"
                title="Save Favorite"
              >
                <Heart className={`w-4 h-4 ${favorited ? 'fill-[#E31B23] text-[#E31B23]' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Attached High-Contrast Information Card */}
        <div className="bg-white border border-zinc-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-7 lg:p-8 shadow-sm -mt-6 sm:-mt-10 mx-2 sm:mx-6 relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-100 text-[#E31B23] text-[10px] font-black uppercase tracking-wider">
                <Radio className="w-3 h-3 animate-pulse" />
                <span>Confirmed Schedule</span>
              </div>
              {event.eventFormat && (
                <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 text-[10px] font-bold">
                  {event.eventFormat}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-zinc-950 tracking-tight leading-tight">
              {event.title}
            </h1>

            <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-xs sm:text-sm font-semibold text-zinc-600">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#E31B23]" />
                <span className="text-zinc-900 font-bold">{formatEventDateTime(event.startDate, event.startTime)}</span>
              </div>

              <div className="flex items-center gap-2">
                {isPhysical ? (
                  <>
                    <MapPin className="w-4 h-4 text-[#E31B23]" />
                    <span className="text-zinc-900 font-bold">{event.venue || event.city || 'Venue'}</span>
                    {directionsUrl && directionsUrl !== '#' && (
                      <a
                        href={directionsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2 py-0.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-[11px] font-bold inline-flex items-center gap-1 ml-1"
                      >
                        <Navigation className="w-3 h-3 text-[#E31B23]" />
                        <span>Directions</span>
                      </a>
                    )}
                  </>
                ) : (
                  <>
                    <Video className="w-4 h-4 text-[#E31B23]" />
                    <span className="text-zinc-900 font-bold">Virtual / Online Event</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick CTA Pod */}
          <div className="flex items-center gap-3 lg:flex-col lg:items-end flex-shrink-0 border-t lg:border-t-0 pt-4 lg:pt-0 border-zinc-100">
            {isTicketSalesActive ? (
              <button
                type="button"
                onClick={scrollToTickets}
                className="w-full sm:w-auto px-6 py-3 bg-[#E31B23] hover:bg-[#B91C1C] text-white text-sm font-black rounded-xl shadow-md hover:shadow-red-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-102 active:scale-98"
              >
                <Ticket className="w-4 h-4" />
                <span>Select Passes</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={scrollToTickets}
                className="w-full sm:w-auto px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>View Event Details</span>
              </button>
            )}

            {event.organizer && (
              <span className="text-[11px] text-zinc-400 font-medium">
                Hosted by <strong className="text-zinc-700">{event.organizer.name}</strong>
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 3. SPLIT VISUAL HERO
  // =========================================================================
  if (layout === 'split') {
    return (
      <div className="relative group">
        <div
          className="absolute -inset-3 rounded-[40px] opacity-20 blur-3xl pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 40%, #E31B23, #4f46e5 50%, transparent 80%)`
          }}
        />

        <div className="relative rounded-3xl sm:rounded-[36px] bg-gradient-to-br from-zinc-950 via-zinc-900 to-black p-6 sm:p-8 lg:p-10 border border-zinc-800 shadow-2xl text-white overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* LEFT COLUMN: Elevated Poster Flyer Frame (5 cols) */}
            <div className="lg:col-span-5 relative group/poster">
              <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden aspect-[4/5] shadow-2xl border border-white/15 bg-zinc-900 ring-1 ring-white/10 group-hover/poster:border-red-500/40 transition-all duration-500">
                <img
                  src={flyerUrl}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover/poster:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30 pointer-events-none" />

                {/* Floating Flyer Badges */}
                <div className="absolute top-3.5 inset-x-3.5 flex items-center justify-between gap-2 z-10">
                  <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-white/90 backdrop-blur-md text-zinc-950 shadow-xs flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-[#E31B23]" />
                    <span>{categoryLabel}</span>
                  </span>

                  {isTicketSalesActive ? (
                    <span className="px-2.5 py-1 rounded-full text-xs font-black bg-red-600 text-white shadow-xs flex items-center gap-1">
                      <Flame className="w-3 h-3 fill-white" />
                      <span>Live</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-zinc-800 text-zinc-200">
                      Pre-Sale
                    </span>
                  )}
                </div>

                {/* Bottom Flyer Quick Actions */}
                <div className="absolute bottom-3.5 right-3.5 flex items-center gap-1.5 z-10">
                  <button
                    onClick={onShare}
                    className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20 hover:bg-white hover:text-zinc-950 transition-all flex items-center justify-center cursor-pointer shadow-sm"
                    title="Share"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={onCalendar}
                    className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20 hover:bg-white hover:text-zinc-950 transition-all flex items-center justify-center cursor-pointer shadow-sm"
                    title="Add to Calendar"
                  >
                    <Calendar className="w-4 h-4" />
                  </button>
                  <button
                    onClick={onToggleFavorite}
                    className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20 hover:bg-white hover:text-[#E31B23] transition-all flex items-center justify-center cursor-pointer shadow-sm"
                    title="Favorite"
                  >
                    <Heart className={`w-4 h-4 ${favorited ? 'fill-[#E31B23] text-[#E31B23]' : ''}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Editorial Event Showcase (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E31B23] text-white text-[11px] font-black uppercase tracking-wider">
                  <Radio className="w-3 h-3 animate-pulse" />
                  <span>Confirmed Schedule</span>
                </span>

                {event.eventFormat && (
                  <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-zinc-200 text-xs font-bold border border-white/10">
                    {event.eventFormat}
                  </span>
                )}

                <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-zinc-300 text-xs font-medium border border-white/10">
                  {isPhysical ? (event.city || 'Physical Venue') : 'Virtual Experience'}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.12]">
                {event.title}
              </h1>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/20 text-[#E31B23] flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-red-400" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">When</span>
                    <p className="text-xs sm:text-sm font-bold text-white truncate">
                      {formatEventDateTime(event.startDate, event.startTime)}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-red-500/20 text-[#E31B23] flex items-center justify-center flex-shrink-0">
                      {isPhysical ? <MapPin className="w-5 h-5 text-red-400" /> : <Video className="w-5 h-5 text-red-400" />}
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Where</span>
                      <p className="text-xs sm:text-sm font-bold text-white truncate">
                        {isPhysical ? (event.venue || event.city || 'Venue') : 'Online Stream'}
                      </p>
                    </div>
                  </div>

                  {isPhysical && directionsUrl && directionsUrl !== '#' && (
                    <a
                      href={directionsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl bg-white/10 hover:bg-[#E31B23] text-white transition-colors flex-shrink-0"
                      title="Get Directions"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-white/10">
                {event.organizer ? (
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-black text-xs text-white">
                      {event.organizer.logo ? (
                        <img 
                          src={resolveImageUrl(event.organizer.logo)} 
                          alt={event.organizer.name} 
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                          }}
                          className="w-full h-full object-cover rounded-full" 
                        />
                      ) : (
                        event.organizer.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold block">Presented by</span>
                      <span className="text-xs font-bold text-white">{event.organizer.name}</span>
                    </div>
                  </div>
                ) : <div />}

                {isTicketSalesActive ? (
                  <button
                    type="button"
                    onClick={scrollToTickets}
                    className="px-6 py-3.5 bg-[#E31B23] hover:bg-[#B91C1C] text-white text-sm font-black rounded-xl shadow-lg hover:shadow-red-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-102 active:scale-98"
                  >
                    <Ticket className="w-4 h-4" />
                    <span>Get Tickets</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={scrollToTickets}
                    className="px-5 py-2.5 bg-white/15 hover:bg-white/20 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>View Details</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  // =========================================================================
  // 4. MODERN BENTO GRID HERO
  // =========================================================================
  if (layout === 'bento') {
    return (
      <div className="rounded-3xl sm:rounded-[36px] bg-white border border-zinc-200/90 p-4 sm:p-6 lg:p-8 shadow-xs space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Main Visual Tile (7 cols) */}
          <div className="lg:col-span-7 rounded-2xl sm:rounded-3xl overflow-hidden relative min-h-[300px] sm:min-h-[380px] bg-zinc-950 border border-zinc-100 group shadow-xs flex flex-col justify-between p-5 sm:p-7">
            <img
              src={coverUrl}
              alt={event.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-103 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

            {/* Top badges */}
            <div className="relative z-10 flex items-center justify-between gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-white/95 text-zinc-950 shadow-sm backdrop-blur-xs">
                {categoryLabel}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={onShare}
                  className="w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white flex items-center justify-center cursor-pointer transition-all shadow-sm"
                  title="Share"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  onClick={onToggleFavorite}
                  className="w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white flex items-center justify-center cursor-pointer transition-all shadow-sm"
                  title="Save"
                >
                  <Heart className={`w-4 h-4 ${favorited ? 'fill-red-500 text-red-500' : ''}`} />
                </button>
              </div>
            </div>

            {/* Bottom title & date overlay */}
            <div className="relative z-10 space-y-1.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#E31B23] text-white">
                <Flame className="w-3 h-3 fill-white" />
                <span>Featured Experience</span>
              </span>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight">
                {event.title}
              </h1>
              {(event as any).subtitle && (
                <p className="text-xs sm:text-sm text-zinc-200 line-clamp-1">
                  {(event as any).subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Quick Metrics & Pass Access Tile (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-4">
            
            {/* Essential Info Cards */}
            <div className="space-y-3">
              <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-[#E31B23] flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">Date & Time</span>
                  <p className="text-xs sm:text-sm font-bold text-zinc-900 mt-0.5">{formatEventDateTime(event.startDate, event.startTime)}</p>
                </div>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">Location</span>
                  <p className="text-xs sm:text-sm font-bold text-zinc-900 mt-0.5 truncate">{event.venue || event.city}</p>
                  {isPhysical && (
                    <a
                      href={directionsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-bold text-[#E31B23] hover:underline inline-flex items-center gap-1 mt-1"
                    >
                      <span>Open Directions</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">Host & Security</span>
                  <p className="text-xs sm:text-sm font-bold text-zinc-900 mt-0.5">Verified Organizer Passes</p>
                </div>
              </div>
            </div>

            {/* Direct Ticket CTA Tile */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#E31B23]/5 border border-[#E31B23]/20 flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">Passes</span>
                <span className="text-xs font-bold text-zinc-800">Direct Online Checkout</span>
              </div>
              {isTicketSalesActive ? (
                <button
                  type="button"
                  onClick={scrollToTickets}
                  className="py-3 px-5 bg-[#E31B23] hover:bg-[#B91C1C] text-white text-xs font-black rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer hover:scale-102 active:scale-98"
                >
                  <Ticket className="w-4 h-4" />
                  <span>Get Tickets</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <span className="text-xs font-bold text-zinc-500">Sales Closed</span>
              )}
            </div>

          </div>

        </div>
      </div>
    );
  }

  return null;
};

export default HeroHeader;
