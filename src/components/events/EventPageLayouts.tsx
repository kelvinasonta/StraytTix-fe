import React, { useState } from 'react';
import {
  Calendar,
  MapPin,
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
  Building,
  Users,
  Share2,
  Heart,
  CheckCircle2,
  ChevronDown,
  Copy,
  Check,
  MessageCircle,
  HelpCircle,
  ArrowRight,
  Plus,
  Minus,
  Smartphone,
  CalendarCheck,
  Camera,
  X
} from 'lucide-react';
import type { Event, FaqItem, TicketType } from '../../types/api';
import { formatCurrency, formatEventDateTime, formatDate } from '../../utils/format';
import { resolveImageUrl, getOrganizerLogo } from '../../utils/imageUrl';
import { MobileAppPromoCard, type MobileAppPromoCardProps } from '../ui/MobileAppPromoCard';

export type EventLayoutTab = 'about' | 'tickets' | 'lineup' | 'schedule' | 'location' | 'organizer' | 'faq' | 'gallery';

export interface EventPageLayoutProps {
  event: Event;
  categoryLabel: string;
  activeTab: EventLayoutTab;
  setActiveTab: (tab: EventLayoutTab) => void;
  isPhysical: boolean;
  isTicketSalesActive: boolean;
  statusMessageType: 'none' | 'pre_sale' | 'post_sales';
  lowestPrice: number;
  directionsUrl: string;
  mapsUrl: string;
  embedMapUrl: string;
  handleGetTickets: () => void;
  handleNativeShare: () => void;
  setCalendarModalOpen: (open: boolean) => void;
  handleToggleFavorite: () => void;
  favorited: boolean;
  openFaqIndex: number | null;
  setOpenFaqIndex: (idx: number | null) => void;
  handleCopyAddress: () => void;
  copiedAddress: boolean;
  setContactModalOpen: (open: boolean) => void;
  tickets?: TicketType[];
  selectedTickets?: Record<string, number>;
  onQtyChange?: (ticketId: string, delta: number) => void;
  onProceedToCheckout?: () => void;
}

export const DEFAULT_EVENT_FAQS: FaqItem[] = [
  {
    question: 'How do I receive and access my event tickets?',
    answer: 'Your digital passes and unique QR codes are delivered instantly to your registered email upon checkout. You can also view and download them anytime from your account dashboard.'
  },
  {
    question: 'What time do doors open and what are entry requirements?',
    answer: 'Check-in typically begins 45 minutes prior to the scheduled start time. Please have your mobile pass QR code ready on your phone along with a valid ID matching your ticket registration.'
  },
  {
    question: 'Can I transfer or share my ticket with someone else?',
    answer: 'Yes! Passes can be securely transferred directly from your attendee portal or shared with your guest before check-in.'
  },
  {
    question: 'What is the refund and cancellation policy?',
    answer: 'Refund policies are established by the event organizer. If an event is cancelled or postponed, pass holders will receive prompt email notifications and automatic resolution.'
  },
  {
    question: 'How can I contact the host for questions or special requests?',
    answer: 'Click the "Contact Host" button in the Host & Organizer section below to send a direct inquiry to the verified event organizer.'
  }
];

// =========================================================================
// TIX.AFRICA INSPIRED SECTIONS (Clean, Simple, Easy to Read)
// =========================================================================

/**
 * Helper to strip hardcoded inline dark text/background colors from pasted HTML
 * so descriptions remain crisp and legible in both Light and Dark themes.
 */
const sanitizeDescriptionHtml = (html: string): string => {
  return html
    .replace(/\bcolor\s*:\s*[^;"]+;?/gi, '')
    .replace(/\bbackground-color\s*:\s*[^;"]+;?/gi, '');
};

/**
 * 1. "About this event" Section (Framed Luxury Editorial Card)
 */
export const AboutThisEventSection: React.FC<{ event: Event }> = ({ event }) => {
  const s = event.settings || {};
  const m = event.meta || {};
  const ageRestriction = event.ageRestriction || s.ageRestriction || s.age_restriction || m.ageRestriction;
  const dressCode = event.dressCode || s.dressCode || s.dress_code || m.dressCode;
  const refundPolicy = event.refundPolicy || s.refundPolicy || s.refund_policy || m.refundPolicy;
  const eventRules = event.eventRules || s.eventRules || s.event_rules || m.eventRules;

  return (
    <section className="relative rounded-3xl bg-white dark:bg-[#0D0D12] border border-zinc-200/80 dark:border-white/[0.08] p-6 sm:p-8 shadow-xs space-y-5 overflow-hidden">
      {/* Subtle Top Crimson Accent Line */}
      <div className="absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-[#E31B23] via-[#E31B23]/40 to-transparent" />

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#E31B23]/10 border border-[#E31B23]/20 flex items-center justify-center text-[#E31B23] shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#E31B23] block">
              Event Overview
            </span>
            <h3 className="text-lg sm:text-xl font-black text-zinc-950 dark:text-white tracking-tight">
              About this event
            </h3>
          </div>
        </div>
        {event.eventFormat && (
          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-zinc-100 dark:bg-white/[0.06] text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-white/10">
            {event.eventFormat}
          </span>
        )}
      </div>

      <div className="text-zinc-700 dark:text-zinc-300 text-sm sm:text-base leading-relaxed font-normal">
        {event.description ? (
          <div
            className="space-y-3 [&_*]:!text-inherit [&_strong]:!text-zinc-950 dark:[&_strong]:!text-white [&_b]:!text-zinc-950 dark:[&_b]:!text-white [&_h3]:text-lg [&_h3]:font-bold [&_h3]:!text-zinc-950 dark:[&_h3]:!text-white [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
            dangerouslySetInnerHTML={{ __html: sanitizeDescriptionHtml(event.description) }}
          />
        ) : (
          <p className="text-zinc-500 dark:text-zinc-400">Join us for this exciting live event experience.</p>
        )}
      </div>

      {/* Event Info & Policies Badges */}
      {(ageRestriction || dressCode || refundPolicy || eventRules) && (
        <div className="pt-3 border-t border-zinc-100 dark:border-white/[0.06] space-y-3.5">
          <div className="flex flex-wrap items-center gap-2.5">
            {ageRestriction && (
              <div className="px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200/80 dark:border-white/10 text-xs flex items-center gap-2">
                <span className="text-zinc-400 dark:text-zinc-500 font-semibold">Age Entry:</span>
                <strong className="text-zinc-900 dark:text-white font-bold">{ageRestriction}</strong>
              </div>
            )}
            {dressCode && (
              <div className="px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200/80 dark:border-white/10 text-xs flex items-center gap-2">
                <span className="text-zinc-400 dark:text-zinc-500 font-semibold">Dress Code:</span>
                <strong className="text-zinc-900 dark:text-white font-bold">{dressCode}</strong>
              </div>
            )}
            {refundPolicy && (
              <div className="px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200/80 dark:border-white/10 text-xs flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="text-zinc-700 dark:text-zinc-300 font-semibold">{refundPolicy}</span>
              </div>
            )}
          </div>

          {eventRules && (
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/10 text-xs text-zinc-600 dark:text-zinc-400 space-y-1">
              <span className="font-bold text-zinc-900 dark:text-white block">Important Guidelines & House Rules</span>
              <p className="leading-relaxed whitespace-pre-line">{eventRules}</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

/**
 * 1b. Lineups Section (Performers, Keynote Speakers, Artists & Special Guests)
 */
export const EventLineupSection: React.FC<{ event: Event }> = ({ event }) => {
  const lineup = event.lineup && event.lineup.length > 0 ? event.lineup : [];

  if (lineup.length === 0) {
    return (
      <div className="p-8 rounded-2xl bg-zinc-50/70 dark:bg-white/[0.02] border border-dashed border-zinc-200 dark:border-white/10 text-center space-y-2">
        <Users className="w-8 h-8 text-zinc-300 dark:text-zinc-600 mx-auto" />
        <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Lineup to be announced</h4>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Performers, keynote speakers, and special guests will be published here soon.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base sm:text-lg font-black text-zinc-950 dark:text-white tracking-tight flex items-center gap-2">
            <Users className="w-4 h-4 text-[#E31B23]" />
            <span>Featured Lineup & Performers</span>
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Performers, keynote speakers, artists, and special guests
          </p>
        </div>
        <span className="px-3 py-1 rounded-full text-[11px] font-black bg-[#E31B23]/10 text-[#E31B23] border border-[#E31B23]/20">
          {lineup.length} {lineup.length === 1 ? 'Performer' : 'Performers'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {lineup.map((m, idx) => (
          <div
            key={idx}
            className="p-4 sm:p-5 rounded-2xl bg-zinc-50/80 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/10 flex items-start gap-4 hover:border-[#E31B23]/40 dark:hover:border-[#E31B23]/40 transition-all group"
          >
            <div className="w-15 h-15 rounded-2xl overflow-hidden bg-zinc-900 dark:bg-zinc-800 border-2 border-white/20 dark:border-white/10 shrink-0 flex items-center justify-center font-black text-base text-white shadow-md group-hover:scale-105 transition-transform">
              {m.avatarUrl ? (
                <img src={resolveImageUrl(m.avatarUrl)} alt={m.name} className="w-full h-full object-cover" />
              ) : (
                m.name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm sm:text-base font-black text-zinc-950 dark:text-white truncate">{m.name}</h4>
              </div>
              <span className="inline-block text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-lg bg-[#E31B23]/10 text-[#E31B23] border border-[#E31B23]/20 truncate max-w-full">
                {m.role || 'Featured Guest / Headliner'}
              </span>
              {m.bio && (
                <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-3 leading-relaxed pt-0.5">
                  {m.bio}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * 1c. Schedules Section (Event Agenda, Timetable & Session Breakdown)
 */
export const EventScheduleSection: React.FC<{ event: Event }> = ({ event }) => {
  const schedules = event.schedules && event.schedules.length > 0 ? event.schedules : [];

  if (schedules.length === 0) {
    return (
      <div className="p-8 rounded-2xl bg-zinc-50/70 dark:bg-white/[0.02] border border-dashed border-zinc-200 dark:border-white/10 text-center space-y-2">
        <Calendar className="w-8 h-8 text-zinc-300 dark:text-zinc-600 mx-auto" />
        <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Schedule to be announced</h4>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          The detailed timetable and session breakdown will be posted closer to the event date.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base sm:text-lg font-black text-zinc-950 dark:text-white tracking-tight flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#E31B23]" />
            <span>Event Schedule & Agenda</span>
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Confirmed timetable and program session breakdown
          </p>
        </div>
        <span className="px-3 py-1 rounded-full text-[11px] font-black bg-[#E31B23]/10 text-[#E31B23] border border-[#E31B23]/20">
          {schedules.length} {schedules.length === 1 ? 'Session' : 'Sessions'}
        </span>
      </div>

      <div className="space-y-3">
        {schedules.map((s, idx) => (
          <div
            key={idx}
            className="p-4 sm:p-5 rounded-2xl bg-zinc-50/80 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/10 flex items-start gap-4 hover:border-[#E31B23]/40 transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-[#E31B23] text-white flex items-center justify-center font-black text-xs shrink-0 mt-0.5 shadow-sm shadow-[#E31B23]/30">
              {String(idx + 1).padStart(2, '0')}
            </div>
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-md bg-[#E31B23]/10 text-[11px] font-black text-[#E31B23] border border-[#E31B23]/20">
                  {s.day || `Session ${idx + 1}`}
                </span>
                {(s.startTime || s.endTime) && (
                  <span className="px-2.5 py-0.5 rounded-md bg-zinc-200/70 dark:bg-white/10 text-[11px] font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#E31B23]" />
                    <span>
                      {s.startTime}
                      {s.endTime ? ` – ${s.endTime}` : ''}
                    </span>
                  </span>
                )}
              </div>
              <h4 className="text-sm sm:text-base font-black text-zinc-950 dark:text-white">
                {s.title}
              </h4>
              {s.description && (
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {s.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Combined helper for non-tabbed layouts
 */
export const ScheduleAndLineupSection: React.FC<{ event: Event }> = ({ event }) => {
  const hasSchedules = Boolean(event.schedules && event.schedules.length > 0);
  const hasLineup = Boolean(event.lineup && event.lineup.length > 0);
  if (!hasSchedules && !hasLineup) return null;

  return (
    <div className="space-y-8">
      {hasLineup && <EventLineupSection event={event} />}
      {hasSchedules && <EventScheduleSection event={event} />}
    </div>
  );
};

/**
 * 1d. Event Gallery & Media Section (with Full-Resolution Lightbox Modal)
 */
export const EventGallerySection: React.FC<{ event: Event }> = ({ event }) => {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const gallery =
    event.galleryUrls && event.galleryUrls.length > 0
      ? event.galleryUrls
      : event.settings?.galleryUrls && event.settings.galleryUrls.length > 0
        ? event.settings.galleryUrls
        : [];

  if (gallery.length === 0) {
    return (
      <div className="p-8 rounded-2xl bg-zinc-50/70 dark:bg-white/[0.02] border border-dashed border-zinc-200 dark:border-white/10 text-center space-y-2">
        <Camera className="w-8 h-8 text-zinc-300 dark:text-zinc-600 mx-auto" />
        <h4 className="text-sm font-bold text-zinc-900 dark:text-white">No media uploaded yet</h4>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Event photos and visual highlights will appear here once shared by the organizer.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base sm:text-lg font-black text-zinc-950 dark:text-white tracking-tight flex items-center gap-2">
            <Camera className="w-4 h-4 text-[#E31B23]" />
            <span>Gallery & Media Showcase</span>
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Click any photo to inspect full-resolution media
          </p>
        </div>
        <span className="px-3 py-1 rounded-full text-[11px] font-black bg-[#E31B23]/10 text-[#E31B23] border border-[#E31B23]/20">
          {gallery.length} {gallery.length === 1 ? 'Photo' : 'Photos'}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 sm:gap-4">
        {gallery.map((url, idx) => {
          const resolved = resolveImageUrl(url);
          return (
            <button
              key={idx}
              type="button"
              onClick={() => setLightboxImage(resolved)}
              className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 group shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#E31B23]"
            >
              <img
                src={resolved}
                alt={`${event.title} gallery ${idx + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-3">
                <span className="px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-md text-white text-[11px] font-bold flex items-center gap-1.5 border border-white/20">
                  <ExternalLink className="w-3 h-3 text-[#E31B23]" />
                  <span>View Fullscreen</span>
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Full-Resolution Image Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between pb-3 text-white">
              <span className="text-xs font-bold text-zinc-300 truncate">{event.title} — Media Showcase</span>
              <div className="flex items-center gap-2">
                <a
                  href={lightboxImage}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-colors border border-white/15"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#E31B23]" />
                  <span>Open Original</span>
                </a>
                <button
                  type="button"
                  onClick={() => setLightboxImage(null)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  aria-label="Close full resolution image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <img
              src={lightboxImage}
              alt="Full resolution preview"
              className="max-h-[82vh] w-auto max-w-full rounded-2xl object-contain border border-white/15 shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * 1e. Event FAQs & Rules Section
 */
export const EventFaqsSection: React.FC<{
  event: Event;
  openFaqIndex: number | null;
  setOpenFaqIndex: (idx: number | null) => void;
}> = ({ event, openFaqIndex, setOpenFaqIndex }) => {
  const faqs =
    event.faqs && event.faqs.length > 0
      ? event.faqs
      : event.faq && event.faq.length > 0
        ? event.faq
        : event.settings?.faqs && event.settings.faqs.length > 0
          ? event.settings.faqs
          : DEFAULT_EVENT_FAQS;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base sm:text-lg font-black text-zinc-950 dark:text-white tracking-tight flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-[#E31B23]" />
            <span>FAQs & House Rules</span>
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Common questions and important entry guidelines from the organizer
          </p>
        </div>
        <span className="px-3 py-1 rounded-full text-[11px] font-black bg-[#E31B23]/10 text-[#E31B23] border border-[#E31B23]/20">
          {faqs.length} {faqs.length === 1 ? 'Question' : 'Questions'}
        </span>
      </div>

      <div className="space-y-2.5">
        {faqs.map((faq, idx) => {
          const isOpen = openFaqIndex === idx;
          return (
            <div
              key={idx}
              className={`rounded-2xl border overflow-hidden transition-all ${isOpen
                ? 'bg-zinc-50 dark:bg-white/[0.04] border-[#E31B23]/50 shadow-xs'
                : 'bg-zinc-50/60 dark:bg-white/[0.02] border-zinc-200/80 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20'
                }`}
            >
              <button
                type="button"
                onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                className="w-full p-4 text-left flex items-center justify-between gap-4 text-xs sm:text-sm font-bold text-zinc-950 dark:text-white cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-mono font-black text-[#E31B23]">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span>{faq.question}</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#E31B23]' : ''
                    }`}
                />
              </button>
              {isOpen && (
                <div className="px-4 pb-4 pt-2 pl-10 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-200/60 dark:border-white/5 whitespace-pre-line">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * 2. Mobile App Promo Banner (Luxury reusable component)
 */
export const OrbitAppPromoBanner: React.FC<MobileAppPromoCardProps> = (props) => (
  <MobileAppPromoCard {...props} />
);

/**
 * 2b. Interactive Click-to-Show Tabs Section (Framed Luxury Card)
 * Organizes:
 * - Lineups (Users icon)
 * - Schedules (Calendar icon)
 * - Gallery & Media (Camera icon)
 * - FAQs & Rules (HelpCircle icon)
 */
export const EventInteractiveTabsSection: React.FC<{
  event: Event;
  openFaqIndex: number | null;
  setOpenFaqIndex: (idx: number | null) => void;
  activeTab?: EventLayoutTab;
  onTabChange?: (tab: EventLayoutTab) => void;
}> = ({ event, openFaqIndex, setOpenFaqIndex, activeTab: propActiveTab, onTabChange }) => {
  const lineup = event.lineup && event.lineup.length > 0 ? event.lineup : [];
  const schedules = event.schedules && event.schedules.length > 0 ? event.schedules : [];
  const gallery =
    event.galleryUrls && event.galleryUrls.length > 0
      ? event.galleryUrls
      : event.settings?.galleryUrls && event.settings.galleryUrls.length > 0
        ? event.settings.galleryUrls
        : [];
  const faqs =
    event.faqs && event.faqs.length > 0
      ? event.faqs
      : event.faq && event.faq.length > 0
        ? event.faq
        : event.settings?.faqs && event.settings.faqs.length > 0
          ? event.settings.faqs
          : DEFAULT_EVENT_FAQS;

  const tabs = [
    {
      id: 'lineup' as const,
      label: 'Lineups',
      icon: Users,
    },
    {
      id: 'schedule' as const,
      label: 'Schedules',
      icon: Calendar,
    },
    {
      id: 'gallery' as const,
      label: 'Gallery & Media',
      icon: Camera,
    },
    {
      id: 'faq' as const,
      label: 'FAQs & Rules',
      icon: HelpCircle,
    }
  ];

  // Default active tab: prioritize first tab with items, fallback to faq
  const [selectedTab, setSelectedTab] = useState<'lineup' | 'schedule' | 'gallery' | 'faq'>(() => {
    if (propActiveTab && ['lineup', 'schedule', 'gallery', 'faq'].includes(propActiveTab)) {
      return propActiveTab as 'lineup' | 'schedule' | 'gallery' | 'faq';
    }
    if (lineup.length > 0) return 'lineup';
    if (schedules.length > 0) return 'schedule';
    if (gallery.length > 0) return 'gallery';
    return 'faq';
  });

  const handleSelectTab = (tabId: 'lineup' | 'schedule' | 'gallery' | 'faq') => {
    setSelectedTab(tabId);
    if (onTabChange) {
      onTabChange(tabId);
    }
  };

  return (
    <section className="rounded-3xl bg-white dark:bg-[#0D0D12] border border-zinc-200/80 dark:border-white/[0.08] p-5 sm:p-8 shadow-xs space-y-6">
      {/* Click-to-Show Segmented Tab Switcher */}
      <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 p-1.5 rounded-2xl bg-zinc-100/90 dark:bg-[#070709] border border-zinc-200/80 dark:border-white/10">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = selectedTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleSelectTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all cursor-pointer ${isActive
                ? 'bg-[#E31B23] text-white shadow-md shadow-[#E31B23]/25'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-white dark:hover:bg-white/5'
                }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Click to Show Active Tab Container */}
      <div className="animate-in fade-in duration-200 min-h-[140px]">
        {selectedTab === 'lineup' && <EventLineupSection event={event} />}
        {selectedTab === 'schedule' && <EventScheduleSection event={event} />}
        {selectedTab === 'gallery' && <EventGallerySection event={event} />}
        {selectedTab === 'faq' && (
          <EventFaqsSection
            event={event}
            openFaqIndex={openFaqIndex}
            setOpenFaqIndex={setOpenFaqIndex}
          />
        )}
      </div>
    </section>
  );
};

/**
 * 3. "Hosted by" Section (Framed Organizer Showcase Card)
 */
export const HostedBySection: React.FC<{
  event: Event;
  setContactModalOpen: (open: boolean) => void;
}> = ({ event, setContactModalOpen }) => {
  const organizerName = event.organizer?.name || 'Event Host';
  const org = event.organizer as any;
  const handleOrRole = org?.handle ? `@${org.handle}` : (org?.email ? `@${org.email.split('@')[0]}` : (org?.slug ? `@${org.slug}` : '@host'));
  const organizerLogo = getOrganizerLogo(event.organizer);

  return (
    <section className="rounded-3xl bg-white dark:bg-[#0D0D12] border border-zinc-200/80 dark:border-white/[0.08] p-6 sm:p-7 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
          Host & Organizer
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
          <ShieldCheck className="w-3 h-3" />
          <span>Verified Organizer</span>
        </span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-zinc-900 dark:bg-zinc-800 border border-zinc-200 dark:border-white/15 overflow-hidden flex items-center justify-center font-black text-lg text-white flex-shrink-0 shadow-sm">
            {organizerLogo ? (
              <img src={organizerLogo} alt={organizerName} className="w-full h-full object-cover" />
            ) : (
              organizerName.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <h4 className="text-base sm:text-lg font-black text-zinc-950 dark:text-white">{organizerName}</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">{handleOrRole} • Official Event Host</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setContactModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border border-zinc-200 dark:bg-white/[0.06] dark:hover:bg-white/15 dark:text-white text-xs font-extrabold dark:border-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <MessageCircle className="w-4 h-4 text-[#E31B23]" />
          <span>Contact Host</span>
        </button>
      </div>
    </section>
  );
};

/**
 * 4. "Directions" Section (Framed Venue & Map Card)
 */
export const DirectionsSection: React.FC<{
  event: Event;
  isPhysical: boolean;
  directionsUrl: string;
  embedMapUrl: string;
  handleCopyAddress: () => void;
  copiedAddress: boolean;
}> = ({ event, isPhysical, directionsUrl, embedMapUrl, handleCopyAddress, copiedAddress }) => {
  if (!isPhysical) {
    return (
      <section className="rounded-3xl bg-white dark:bg-[#0D0D12] border border-zinc-200/80 dark:border-white/[0.08] p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
            <Video className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 block">
              Virtual Access
            </span>
            <h3 className="text-lg font-black text-zinc-950 dark:text-white tracking-tight">
              Online Virtual Event
            </h3>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Direct streaming links and access credentials will be delivered to your registered email address upon checkout.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl bg-white dark:bg-[#0D0D12] border border-zinc-200/80 dark:border-white/[0.08] p-6 sm:p-8 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#E31B23]/10 border border-[#E31B23]/20 flex items-center justify-center text-[#E31B23] shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#E31B23] block">
              Venue & Navigation
            </span>
            <h3 className="text-lg sm:text-xl font-black text-zinc-950 dark:text-white tracking-tight">
              {event.venue || 'Venue & Directions'}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyAddress}
            className="px-3.5 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-white/[0.06] dark:hover:bg-white/10 text-zinc-800 dark:text-zinc-200 text-xs font-bold flex items-center gap-1.5 border border-zinc-200 dark:border-white/10 transition-colors cursor-pointer"
          >
            {copiedAddress ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedAddress ? 'Copied!' : 'Copy Address'}</span>
          </button>

          {directionsUrl && directionsUrl !== '#' && (
            <a
              href={directionsUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 rounded-xl bg-[#E31B23]/10 hover:bg-[#E31B23]/20 text-[#E31B23] text-xs font-black flex items-center gap-1.5 border border-[#E31B23]/20 transition-colors"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Directions</span>
            </a>
          )}
        </div>
      </div>

      {/* Interactive Map with Floating Glass Place Card */}
      <div className="relative rounded-2xl overflow-hidden border border-zinc-200 dark:border-white/10 h-72 sm:h-88 w-full shadow-md bg-zinc-100 dark:bg-zinc-950">
        <div className="absolute top-4 left-4 z-10 max-w-[260px] sm:max-w-xs bg-white/95 dark:bg-[#0D0D12]/95 text-zinc-900 dark:text-white p-3.5 rounded-2xl shadow-xl border border-zinc-200 dark:border-white/15 backdrop-blur-md">
          <h5 className="text-xs sm:text-sm font-black leading-tight line-clamp-1 text-zinc-950 dark:text-white">
            {event.venue || event.city}
          </h5>
          <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-1 line-clamp-2">
            {[event.address, event.city, event.state].filter(Boolean).join(', ')}
          </p>
        </div>

        {embedMapUrl ? (
          <iframe
            title="Event Directions Map"
            src={embedMapUrl}
            className="w-full h-full border-0 dark:grayscale opacity-95 contrast-125"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-500 text-xs font-mono">
            Map location coordinates loading...
          </div>
        )}
      </div>
    </section>
  );
};

/**
 * 5. Luxury Box Office Ticket Pass Selector Card
 */
export const CleanTicketPassCard: React.FC<{
  event: Event;
  tickets?: TicketType[];
  selectedTickets?: Record<string, number>;
  onQtyChange?: (ticketId: string, delta: number) => void;
  onProceedToCheckout?: () => void;
  handleGetTickets: () => void;
  isTicketSalesActive: boolean;
  lowestPrice: number;
}> = ({
  tickets = [],
  selectedTickets = {},
  onQtyChange,
  onProceedToCheckout,
  handleGetTickets,
  isTicketSalesActive,
  lowestPrice
}) => {
    const totalSelected = Object.values(selectedTickets).reduce((sum, q) => sum + q, 0);
    const totalPrice = Object.entries(selectedTickets).reduce((sum, [tid, qty]) => {
      const t = tickets.find(item => item.id === tid);
      return sum + (t ? (t.price || 0) * qty : 0);
    }, 0);

    return (
      <div id="tickets-section" className="relative bg-white dark:bg-[#0D0D12] border border-zinc-200/90 dark:border-white/12 rounded-3xl p-6 sm:p-7 shadow-xl dark:shadow-[0_24px_60px_rgba(0,0,0,0.6)] space-y-5 text-zinc-900 dark:text-white overflow-hidden">
        {/* Subtle Top Glow */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#E31B23] via-rose-500 to-amber-500" />

        <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-white/10 pb-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#E31B23] block">
              Official Box Office
            </span>
            <span className="text-xl sm:text-2xl font-black text-zinc-950 dark:text-white tracking-tight">
              {lowestPrice === 0 ? 'Free RSVP' : `From ${formatCurrency(lowestPrice)}`}
            </span>
          </div>
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Instant QR</span>
          </span>
        </div>

        {/* Ticket List */}
        <div className="space-y-3">
          {tickets.map((t) => {
            const qty = selectedTickets[t.id!] || 0;
            const isFree = t.price === 0;

            return (
              <div
                key={t.id}
                className={`p-4 rounded-2xl border transition-all ${qty > 0
                  ? 'bg-[#E31B23]/[0.06] dark:bg-[#E31B23]/10 border-[#E31B23] ring-1 ring-[#E31B23]/30'
                  : 'bg-zinc-50/80 dark:bg-white/[0.02] border-zinc-200/80 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20'
                  }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h5 className="text-xs sm:text-sm font-black text-zinc-950 dark:text-white truncate">{t.name}</h5>
                      {t.ticketCategory === 'group' && (
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase bg-zinc-200/80 dark:bg-white/10 text-zinc-700 dark:text-zinc-300">
                          Group ({t.groupSize || 5})
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-black text-[#E31B23]">
                      {isFree ? 'Free Pass' : formatCurrency(t.price)}
                    </p>
                    {t.description && (
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug pt-0.5">
                        {t.description}
                      </p>
                    )}
                    {t.perks && t.perks.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-1.5">
                        {t.perks.map((perk, pIdx) => (
                          <span
                            key={pIdx}
                            className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white dark:bg-white/5 border border-zinc-200/80 dark:border-white/10 text-zinc-600 dark:text-zinc-300"
                          >
                            <Check className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
                            <span>{perk}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {onQtyChange && (
                    <div className="flex items-center gap-2 bg-white dark:bg-black/60 border border-zinc-200 dark:border-white/15 rounded-xl p-1 shrink-0 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => onQtyChange(t.id!, -1)}
                        disabled={qty <= 0}
                        className="w-7 h-7 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-900 dark:bg-white/5 dark:hover:bg-white/15 dark:text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-5 text-center text-xs font-black font-mono text-zinc-950 dark:text-white">{qty}</span>
                      <button
                        type="button"
                        onClick={() => onQtyChange(t.id!, 1)}
                        className="w-7 h-7 rounded-lg bg-[#E31B23] hover:bg-[#B91C1C] text-white flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Selection Summary */}
        {totalSelected > 0 && (
          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200/80 dark:border-white/10 flex items-center justify-between text-xs">
            <span className="font-bold text-zinc-600 dark:text-zinc-300">
              {totalSelected} {totalSelected === 1 ? 'Pass' : 'Passes'} Selected
            </span>
            <span className="text-sm font-black text-zinc-950 dark:text-white">
              {totalPrice === 0 ? 'Free' : formatCurrency(totalPrice)}
            </span>
          </div>
        )}

        {/* Checkout Button */}
        <div className="space-y-3 pt-1">
          {isTicketSalesActive ? (
            <button
              type="button"
              onClick={onProceedToCheckout || handleGetTickets}
              className="w-full py-4 bg-gradient-to-r from-[#E31B23] via-[#DC2626] to-[#B91C1C] hover:brightness-110 text-white text-sm font-black rounded-2xl shadow-[0_8px_25px_rgba(227,27,35,0.35)] transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
            >
              <Ticket className="w-4 h-4" />
              <span>{totalSelected > 0 ? `Proceed to Checkout (${formatCurrency(totalPrice)})` : 'Select a Ticket Pass'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="text-center text-xs font-bold text-zinc-500 py-2.5 bg-zinc-100 dark:bg-white/5 rounded-xl">
              Ticket sales concluded
            </div>
          )}

          <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-400 dark:text-zinc-500 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>256-bit SSL Encrypted • Verified Pass Guarantee</span>
          </div>
        </div>
      </div>
    );
  };

// =========================================================================
// UNIFIED LAYOUT IMPLEMENTATIONS
// =========================================================================

export const SplitPageLayout: React.FC<EventPageLayoutProps> = (props) => {
  const {
    event,
    isPhysical,
    directionsUrl,
    embedMapUrl,
    handleCopyAddress,
    copiedAddress,
    setContactModalOpen,
    openFaqIndex,
    setOpenFaqIndex,
    activeTab,
    setActiveTab
  } = props;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* 1. About this event + Event Policies & Rules */}
      <AboutThisEventSection event={event} />

      {/* 2. Interactive Click-to-Show Tabs (Lineups, Schedules, Gallery & Media, FAQs & Rules) */}
      <EventInteractiveTabsSection
        event={event}
        openFaqIndex={openFaqIndex}
        setOpenFaqIndex={setOpenFaqIndex}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* 3. Directions & Map */}
      <DirectionsSection
        event={event}
        isPhysical={isPhysical}
        directionsUrl={directionsUrl}
        embedMapUrl={embedMapUrl}
        handleCopyAddress={handleCopyAddress}
        copiedAddress={copiedAddress}
      />

      {/* 4. Hosted by */}
      <HostedBySection event={event} setContactModalOpen={setContactModalOpen} />

      {/* 5. Full-Width Download App Banner at Bottom */}
      <OrbitAppPromoBanner className="!my-0" />
    </div>
  );
};

export const CinematicPageLayout: React.FC<EventPageLayoutProps> = (props) => {
  const {
    event,
    isPhysical,
    directionsUrl,
    embedMapUrl,
    handleCopyAddress,
    copiedAddress,
    setContactModalOpen,
    openFaqIndex,
    setOpenFaqIndex,
    activeTab,
    setActiveTab
  } = props;

  return (
    <div className="space-y-8 lg:space-y-10 animate-in fade-in duration-300">
      {/* ========================================================================= */}
      {/* 1. ARCHITECTURAL TELEMETRY STRIP (Quick-Glance Luxury Highlights)         */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
        <div className="bg-white dark:bg-[#0D0D12] border border-zinc-200/80 dark:border-white/[0.08] p-4 sm:p-5 rounded-2xl shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#E31B23]/10 border border-[#E31B23]/20 flex items-center justify-center text-[#E31B23] shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block">
              Date & Time
            </span>
            <p className="text-xs sm:text-sm font-black text-zinc-950 dark:text-white truncate">
              {formatDate(event.startDate)}
            </p>
            <p className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 truncate">
              {event.startTime ? `${event.startTime}${event.endTime ? ` – ${event.endTime}` : ''}` : 'Doors Open'}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0D0D12] border border-zinc-200/80 dark:border-white/[0.08] p-4 sm:p-5 rounded-2xl shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#E31B23]/10 border border-[#E31B23]/20 flex items-center justify-center text-[#E31B23] shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block">
              Location
            </span>
            <p className="text-xs sm:text-sm font-black text-zinc-950 dark:text-white truncate">
              {isPhysical ? (event.venue || event.city || 'Venue') : 'Online Stream'}
            </p>
            <p className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 truncate">
              {isPhysical ? ([event.city, event.state].filter(Boolean).join(', ') || 'Physical Venue') : 'Virtual Access'}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0D0D12] border border-zinc-200/80 dark:border-white/[0.08] p-4 sm:p-5 rounded-2xl shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#E31B23]/10 border border-[#E31B23]/20 flex items-center justify-center text-[#E31B23] shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block">
              Experience
            </span>
            <p className="text-xs sm:text-sm font-black text-zinc-950 dark:text-white truncate">
              {event.eventFormat || props.categoryLabel || 'Live Event'}
            </p>
            <p className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 truncate">
              {event.ageRestriction || 'All Ages Welcome'}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0D0D12] border border-zinc-200/80 dark:border-white/[0.08] p-4 sm:p-5 rounded-2xl shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
            <Ticket className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block">
              Admission Pass
            </span>
            <p className="text-xs sm:text-sm font-black text-zinc-950 dark:text-white truncate">
              {props.lowestPrice === 0 ? 'Free RSVP' : `From ${formatCurrency(props.lowestPrice)}`}
            </p>
            <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 truncate">
              Instant QR Delivery
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN 12-COLUMN EDITORIAL GRID                                          */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Left Column (7 cols): Overview + Interactive Tabs */}
        <div className="lg:col-span-7 space-y-8">
          {/* Overview: About this event + House rules */}
          <AboutThisEventSection event={event} />

          {/* Dedicated Tab Organization: Lineups, Schedules, Gallery & Media, FAQs & Rules (Click to Show) */}
          <EventInteractiveTabsSection
            event={event}
            openFaqIndex={openFaqIndex}
            setOpenFaqIndex={setOpenFaqIndex}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>

        {/* Right Column (5 cols): Sticky Venue & Map + Host Details */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-8">
          {/* Venue & Map */}
          <DirectionsSection
            event={event}
            isPhysical={isPhysical}
            directionsUrl={directionsUrl}
            embedMapUrl={embedMapUrl}
            handleCopyAddress={handleCopyAddress}
            copiedAddress={copiedAddress}
          />

          {/* Host Details */}
          <HostedBySection event={event} setContactModalOpen={setContactModalOpen} />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. FULL-WIDTH MOBILE APP PASS PROMO BANNER                                */}
      {/* ========================================================================= */}
      <OrbitAppPromoBanner className="!my-0" />
    </div>
  );
};

export const CompactPageLayout: React.FC<EventPageLayoutProps> = (props) => (
  <SplitPageLayout {...props} />
);

export const BentoPageLayout: React.FC<EventPageLayoutProps> = (props) => {
  const {
    event,
    categoryLabel,
    isPhysical,
    isTicketSalesActive,
    statusMessageType,
    lowestPrice,
    directionsUrl,
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
    setContactModalOpen,
    activeTab,
    setActiveTab
  } = props;

  const coverUrl = resolveImageUrl(event.imageUrl || event.bannerUrl);

  return (
    <div className="animate-in fade-in duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch lg:h-[calc(100vh-8.5rem)] lg:min-h-[600px]">
        {/* ========================================================================= */}
        {/* LEFT PANE: FIXED / NON-SCROLLABLE EVENT IMAGE SHOWCASE                    */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 h-[380px] sm:h-[460px] lg:h-full">
          <div className="relative h-full w-full rounded-3xl sm:rounded-[32px] overflow-hidden bg-zinc-950 border border-zinc-200/20 dark:border-white/10 shadow-2xl group">
            {/* Event Artwork */}
            <img
              src={coverUrl}
              alt={event.title}
              className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-black/45 pointer-events-none" />

            {/* Top Floating Glass Controls */}
            <div className="relative z-10 p-4 sm:p-6 flex items-start justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3.5 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-white/95 backdrop-blur-md text-zinc-950 shadow-md flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#E31B23]" />
                  <span>{categoryLabel}</span>
                </span>

                {isTicketSalesActive ? (
                  <span className="px-3 py-1.5 rounded-full text-[11px] font-extrabold bg-[#E31B23] text-white shadow-md flex items-center gap-1.5">
                    <Flame className="w-3 h-3 fill-white animate-pulse" />
                    <span>Tickets Live</span>
                  </span>
                ) : statusMessageType === 'pre_sale' ? (
                  <span className="px-3 py-1.5 rounded-full text-[11px] font-extrabold bg-amber-500 text-white shadow-md">
                    Pre-Sale
                  </span>
                ) : null}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-md text-white border border-white/20 hover:bg-white hover:text-zinc-950 transition-all flex items-center justify-center cursor-pointer shadow-md"
                  title="Share experience"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setCalendarModalOpen(true)}
                  className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-md text-white border border-white/20 hover:bg-white hover:text-zinc-950 transition-all flex items-center justify-center cursor-pointer shadow-md"
                  title="Add to Calendar"
                >
                  <Calendar className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleToggleFavorite}
                  className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-md text-white border border-white/20 hover:bg-white hover:text-[#E31B23] transition-all flex items-center justify-center cursor-pointer shadow-md"
                  title="Save to favorites"
                >
                  <Heart className={`w-4 h-4 ${favorited ? 'fill-[#E31B23] text-[#E31B23]' : ''}`} />
                </button>
              </div>
            </div>

            {/* Bottom Floating Glass Summary Strip */}
            <div className="absolute bottom-4 inset-x-4 sm:bottom-6 sm:inset-x-6 z-10 p-4 rounded-2xl bg-black/55 backdrop-blur-xl border border-white/15 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300 block">
                  {event.eventFormat || 'Featured Experience'}
                </span>
                <p className="text-sm font-black text-white truncate">
                  {lowestPrice === 0 ? 'Free Admission' : `Tickets from ${formatCurrency(lowestPrice)}`}
                </p>
              </div>
              {isTicketSalesActive && (
                <button
                  type="button"
                  onClick={handleGetTickets}
                  className="px-4 py-2.5 rounded-xl bg-[#E31B23] hover:bg-[#B91C1C] text-white text-xs font-black shadow-lg flex items-center gap-1.5 shrink-0 cursor-pointer transition-all active:scale-95"
                >
                  <Ticket className="w-3.5 h-3.5" />
                  <span>Get Tickets</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT PANE: INDEPENDENTLY SCROLLABLE BENTO EVENT DETAILS                  */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 lg:h-full lg:overflow-y-auto lg:pr-2 space-y-6 [scrollbar-width:thin]">
          {/* 1. Bento Title & Primary CTA Tile */}
          <div className="rounded-3xl bg-white dark:bg-[#0D0D12] border border-zinc-200/80 dark:border-white/[0.08] p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              {event.organizer?.name && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-white/[0.06] border border-zinc-200/80 dark:border-white/10 text-xs font-bold text-zinc-700 dark:text-zinc-200">
                  <Building className="w-3.5 h-3.5 text-[#E31B23]" />
                  <span>By {event.organizer.name}</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                </span>
              )}
              <span className="text-[11px] font-black uppercase tracking-widest text-[#E31B23]">
                {categoryLabel}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-zinc-950 dark:text-white tracking-tight leading-[1.1]">
              {event.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              {isTicketSalesActive ? (
                <button
                  type="button"
                  onClick={handleGetTickets}
                  className="px-7 py-3.5 bg-gradient-to-r from-[#E31B23] via-[#DC2626] to-[#B91C1C] hover:brightness-110 text-white text-sm font-black rounded-2xl shadow-lg shadow-[#E31B23]/25 flex items-center gap-2 transition-all cursor-pointer active:scale-98"
                >
                  <Ticket className="w-4 h-4" />
                  <span>Get Tickets Now</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <span className="px-5 py-3 rounded-2xl bg-zinc-100 dark:bg-white/10 text-zinc-500 dark:text-zinc-400 text-xs font-bold">
                  {statusMessageType === 'pre_sale' ? 'Pre-Sale Opening Soon' : 'Ticket Sales Closed'}
                </span>
              )}

              <button
                type="button"
                onClick={() => setCalendarModalOpen(true)}
                className="px-5 py-3.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-white/[0.06] dark:hover:bg-white/10 text-zinc-900 dark:text-white font-bold text-xs sm:text-sm rounded-2xl border border-zinc-200 dark:border-white/10 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-[#E31B23]" />
                <span>Add to Calendar</span>
              </button>
            </div>
          </div>

          {/* 2. 2x2 Bento Quick Telemetry Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl bg-white dark:bg-[#0D0D12] border border-zinc-200/80 dark:border-white/[0.08] p-4 sm:p-5 flex items-center gap-3.5 shadow-2xs">
              <div className="w-11 h-11 rounded-xl bg-[#E31B23]/10 border border-[#E31B23]/20 flex items-center justify-center text-[#E31B23] shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block">
                  Date & Time
                </span>
                <p className="text-xs sm:text-sm font-black text-zinc-950 dark:text-white truncate">
                  {formatDate(event.startDate)}
                  {event.endDate && event.endDate !== event.startDate ? ` — ${formatDate(event.endDate)}` : ''}
                </p>
                <p className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 truncate">
                  {event.startTime
                    ? `${event.startTime}${event.endTime ? ` – ${event.endTime}` : ''}${event.timezone ? ` (${event.timezone})` : ''}`
                    : 'Doors Open'}
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-white dark:bg-[#0D0D12] border border-zinc-200/80 dark:border-white/[0.08] p-4 sm:p-5 flex items-center gap-3.5 shadow-2xs">
              <div className="w-11 h-11 rounded-xl bg-[#E31B23]/10 border border-[#E31B23]/20 flex items-center justify-center text-[#E31B23] shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block">
                  Location
                </span>
                <p className="text-xs sm:text-sm font-black text-zinc-950 dark:text-white truncate">
                  {isPhysical ? (event.venue || event.city || 'Venue') : 'Online Virtual Stream'}
                </p>
                <p className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 truncate">
                  {isPhysical
                    ? ([event.address, event.city].filter(Boolean).join(', ') || 'Physical Venue')
                    : (event.streamProvider || 'Link delivered via email')}
                </p>
              </div>
            </div>
          </div>

          {/* 3. Overview Bento Tile */}
          <AboutThisEventSection event={event} />

          {/* 4. Interactive Click-to-Show Tabs Bento Tile */}
          <EventInteractiveTabsSection
            event={event}
            openFaqIndex={openFaqIndex}
            setOpenFaqIndex={setOpenFaqIndex}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {/* 5. Venue & Navigation Map Bento Tile */}
          <DirectionsSection
            event={event}
            isPhysical={isPhysical}
            directionsUrl={directionsUrl}
            embedMapUrl={embedMapUrl}
            handleCopyAddress={handleCopyAddress}
            copiedAddress={copiedAddress}
          />

          {/* 6. Host & Organizer Bento Tile */}
          <HostedBySection event={event} setContactModalOpen={setContactModalOpen} />
        </div>
      </div>

      {/* Full-Width Mobile App Pass Promo Banner Below the Bento Grid */}
      <div className="pt-8 lg:pt-10">
        <OrbitAppPromoBanner className="!my-0" />
      </div>
    </div>
  );
};
