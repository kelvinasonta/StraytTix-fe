import React from 'react';
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
  CalendarCheck
} from 'lucide-react';
import type { Event, FaqItem, TicketType } from '../../types/api';
import { formatCurrency, formatEventDateTime, formatDate } from '../../utils/format';
import { resolveImageUrl, getOrganizerLogo } from '../../utils/imageUrl';

export interface EventPageLayoutProps {
  event: Event;
  categoryLabel: string;
  activeTab: 'about' | 'schedule' | 'location' | 'organizer' | 'faq' | 'gallery';
  setActiveTab: (tab: 'about' | 'schedule' | 'location' | 'organizer' | 'faq' | 'gallery') => void;
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
 * 1. "About this event" Section
 */
export const AboutThisEventSection: React.FC<{ event: Event }> = ({ event }) => (
  <section className="space-y-4 pt-2">
    <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
      About this event
    </h3>
    <div className="text-zinc-300 text-base leading-relaxed font-normal">
      {event.description ? (
        <div
          className="space-y-3 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-white [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
          dangerouslySetInnerHTML={{ __html: event.description }}
        />
      ) : (
        <p className="text-zinc-400">Join us for this exciting live event experience.</p>
      )}
    </div>
  </section>
);

/**
 * 2. Mobile App Promo Banner (Styled after Orbit app banner in screenshot)
 */
export const OrbitAppPromoBanner: React.FC = () => (
  <div className="rounded-3xl bg-[#0F0F14] border border-white/10 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden my-6">
    {/* Subtle glow circle */}
    <div className="absolute right-0 top-0 w-64 h-64 bg-[#E31B23]/10 rounded-full blur-3xl pointer-events-none" />

    <div className="space-y-2 relative z-10">
      <h4 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
        Never miss an event.
      </h4>
      <p className="text-sm font-semibold text-[#E31B23]">
        Get StraytTix Pass on Mobile
      </p>
    </div>

    <div className="flex items-center gap-3 relative z-10 flex-wrap">
      <a
        href="/download"
        className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold border border-white/15 transition-all flex items-center gap-2"
      >
        <Smartphone className="w-4 h-4 text-emerald-400" />
        <span>Google Play</span>
      </a>
      <a
        href="/download"
        className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold border border-white/15 transition-all flex items-center gap-2"
      >
        <Smartphone className="w-4 h-4 text-blue-400" />
        <span>App Store</span>
      </a>
    </div>
  </div>
);

/**
 * 3. "Hosted by" Section (Clean, circular avatar + name + handle)
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
    <section className="space-y-4 pt-4 border-t border-white/10">
      <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
        Hosted by
      </h3>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-full bg-zinc-800 border border-white/15 overflow-hidden flex items-center justify-center font-bold text-base text-white flex-shrink-0">
            {organizerLogo ? (
              <img src={organizerLogo} alt={organizerName} className="w-full h-full object-cover" />
            ) : (
              organizerName.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <h4 className="text-base font-bold text-white">{organizerName}</h4>
            <p className="text-xs text-zinc-400">{handleOrRole}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setContactModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/15 text-white text-xs font-bold border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <MessageCircle className="w-3.5 h-3.5 text-[#E31B23]" />
          <span>Contact</span>
        </button>
      </div>
    </section>
  );
};

/**
 * 4. "Directions" Section (Title + Venue info card + embedded interactive Google Map)
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
      <section className="space-y-4 pt-4 border-t border-white/10">
        <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
          Directions
        </h3>
        <div className="p-5 rounded-2xl bg-[#0F0F14] border border-white/10 space-y-2">
          <div className="flex items-center gap-2 text-indigo-400">
            <Video className="w-5 h-5" />
            <h4 className="text-sm font-bold text-white">Online Virtual Event</h4>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Direct streaming links will be sent to your registered email address upon getting your ticket.
          </p>
        </div>
      </section>
    );
  }

  const locationText = [event.venue, event.address, event.city].filter(Boolean).join(', ') || 'Venue Location';

  return (
    <section className="space-y-4 pt-4 border-t border-white/10">
      <div className="flex items-center justify-between">
        <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
          Directions
        </h3>
        <div className="flex items-center gap-2">
          {directionsUrl && directionsUrl !== '#' && (
            <a
              href={directionsUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-bold text-[#E31B23] hover:underline flex items-center gap-1"
            >
              <span>Open in Google Maps</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>

      {/* Map with Floating Address Card (Matching Screenshot exactly) */}
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 h-72 sm:h-96 w-full shadow-lg bg-zinc-950">
        {/* Floating Google Place Card on Top-Left */}
        <div className="absolute top-4 left-4 z-10 max-w-[280px] sm:max-w-xs bg-[#0F0F14]/95 text-white p-3 sm:p-4 rounded-xl shadow-2xl border border-white/10 backdrop-blur-md">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h5 className="text-xs sm:text-sm font-bold leading-tight line-clamp-2 text-white">
                {event.venue || event.city}
              </h5>
              <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">
                {event.address ? `${event.address}, ` : ''}{event.city || ''}
              </p>
            </div>
            {directionsUrl && directionsUrl !== '#' && (
              <a
                href={directionsUrl}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 flex-shrink-0"
                title="Navigate"
              >
                <Navigation className="w-4 h-4 text-[#E31B23]" />
              </a>
            )}
          </div>
          <div className="pt-2 mt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-zinc-400">
            <button
              type="button"
              onClick={handleCopyAddress}
              className="font-bold text-zinc-300 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
            >
              {copiedAddress ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedAddress ? 'Address Copied' : 'Copy Address'}</span>
            </button>
            <span className="font-semibold text-amber-400">★ 4.8</span>
          </div>
        </div>

        {/* Embedded Map */}
        {embedMapUrl ? (
          <iframe
            title="Event Directions Map"
            src={embedMapUrl}
            className="w-full h-full border-0 grayscale opacity-90 contrast-125"
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
 * 5. Ticket Pass Selector Modal / Card
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
    <div id="tickets-section" className="bg-[#0F0F14] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 text-white sticky top-24">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">Available Passes</span>
          <span className="text-lg font-black text-white">
            {lowestPrice === 0 ? 'Free RSVP' : `From ${formatCurrency(lowestPrice)}`}
          </span>
        </div>
        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
          Instant QR Delivery
        </span>
      </div>

      {/* Ticket List */}
      <div className="space-y-2.5">
        {tickets.map((t) => {
          const qty = selectedTickets[t.id!] || 0;
          const isFree = t.price === 0;

          return (
            <div
              key={t.id}
              className={`p-3 rounded-2xl border transition-all ${
                qty > 0
                  ? 'bg-red-500/10 border-[#E31B23]'
                  : 'bg-white/[0.02] border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h5 className="text-xs sm:text-sm font-bold text-white truncate">{t.name}</h5>
                  <p className="text-xs font-mono font-bold text-[#E31B23]">
                    {isFree ? 'Free' : formatCurrency(t.price)}
                  </p>
                </div>

                {onQtyChange && (
                  <div className="flex items-center gap-2 bg-black/50 border border-white/10 rounded-xl p-1">
                    <button
                      type="button"
                      onClick={() => onQtyChange(t.id!, -1)}
                      disabled={qty <= 0}
                      className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/15 text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-4 text-center text-xs font-bold font-mono">{qty}</span>
                    <button
                      type="button"
                      onClick={() => onQtyChange(t.id!, 1)}
                      className="w-6 h-6 rounded-lg bg-[#E31B23] hover:bg-[#B91C1C] text-white flex items-center justify-center cursor-pointer active:scale-95"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Checkout Button */}
      <div className="pt-2">
        {isTicketSalesActive ? (
          <button
            type="button"
            onClick={onProceedToCheckout || handleGetTickets}
            className="w-full py-3.5 bg-[#E31B23] hover:bg-[#B91C1C] text-white text-sm font-black rounded-2xl shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
          >
            <Ticket className="w-4 h-4" />
            <span>{totalSelected > 0 ? `Checkout (${formatCurrency(totalPrice)})` : 'Get a Ticket'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="text-center text-xs font-bold text-zinc-500 py-2">
            Ticket sales concluded
          </div>
        )}
      </div>
    </div>
  );
};

// =========================================================================
// UNIFIED LAYOUT IMPLEMENTATIONS
// All 4 styles now share this clean, intuitive flow matching your design reference
// =========================================================================

export const SplitPageLayout: React.FC<EventPageLayoutProps> = (props) => {
  const { event, isPhysical, directionsUrl, embedMapUrl, handleCopyAddress, copiedAddress, setContactModalOpen } = props;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* 1. About this event */}
      <AboutThisEventSection event={event} />

      {/* 2. Download App Banner */}
      <OrbitAppPromoBanner />

      {/* 3. Hosted by */}
      <HostedBySection event={event} setContactModalOpen={setContactModalOpen} />

      {/* 4. Directions & Map */}
      <DirectionsSection
        event={event}
        isPhysical={isPhysical}
        directionsUrl={directionsUrl}
        embedMapUrl={embedMapUrl}
        handleCopyAddress={handleCopyAddress}
        copiedAddress={copiedAddress}
      />

      {/* 5. Ticket Pass Selector */}
      <CleanTicketPassCard
        event={event}
        tickets={props.tickets}
        selectedTickets={props.selectedTickets}
        onQtyChange={props.onQtyChange}
        onProceedToCheckout={props.onProceedToCheckout}
        handleGetTickets={props.handleGetTickets}
        isTicketSalesActive={props.isTicketSalesActive}
        lowestPrice={props.lowestPrice}
      />
    </div>
  );
};

export const CinematicPageLayout: React.FC<EventPageLayoutProps> = (props) => (
  <SplitPageLayout {...props} />
);

export const CompactPageLayout: React.FC<EventPageLayoutProps> = (props) => (
  <SplitPageLayout {...props} />
);

export const BentoPageLayout: React.FC<EventPageLayoutProps> = (props) => (
  <SplitPageLayout {...props} />
);
