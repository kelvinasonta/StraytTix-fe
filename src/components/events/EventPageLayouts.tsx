import React from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  MapPin,
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
  Share2,
  Heart,
  CheckCircle2,
  ChevronDown,
  Copy,
  Check,
  Users,
  MessageCircle,
  HelpCircle,
  Lock,
  ArrowRight
} from 'lucide-react';
import type { Event, ScheduleSession, LineupMember, FaqItem } from '../../types/api';
import { formatCurrency, formatEventDateTime, formatDate } from '../../utils/format';
import { resolveImageUrl } from '../../utils/imageUrl';

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
}

export const DEFAULT_EVENT_FAQS: FaqItem[] = [
  {
    question: 'How do I receive and access my event tickets?',
    answer: 'Your digital admission passes and unique QR codes are generated instantly upon reservation and delivered directly to your registered email and account dashboard. Simply display the QR code on your mobile device at the entrance for fast check-in.'
  },
  {
    question: 'What are the venue admission guidelines and entry requirements?',
    answer: 'Gates and check-in desks typically open 30 to 45 minutes prior to the scheduled start time. Please have your mobile ticket pass ready along with a valid ID matching your registration.'
  },
  {
    question: 'Can I transfer or share my ticket pass with someone else?',
    answer: 'Yes! Passes can be securely transferred directly from your attendee portal or shared with your guest before check-in.'
  },
  {
    question: 'What is the cancellation and refund policy?',
    answer: 'Ticket refunds and cancellations adhere to the event organizer\'s stated policy. In the unexpected event of a cancellation or rescheduling, all pass holders will receive prompt notifications and refund options.'
  },
  {
    question: 'Who do I contact for event questions or accessibility support?',
    answer: 'The event host and hospitality team are available to help. Click the "Contact Organizer" button in the Host & Organizer section or speak to support personnel stationed at the event entrance.'
  }
];

// =========================================================================
// 1. CINEMATIC FULL PAGE LAYOUT
// Full-width storytelling canvas, dark atmospheric styling, centered story
// =========================================================================
export const CinematicPageLayout: React.FC<EventPageLayoutProps> = (props) => {
  const {
    event,
    activeTab,
    setActiveTab,
    isPhysical,
    isTicketSalesActive,
    lowestPrice,
    directionsUrl,
    mapsUrl,
    embedMapUrl,
    handleGetTickets,
    handleNativeShare,
    setCalendarModalOpen,
    openFaqIndex,
    setOpenFaqIndex,
    handleCopyAddress,
    copiedAddress,
    setContactModalOpen
  } = props;

  const schedules = event.schedules && event.schedules.length > 0 ? event.schedules : [];
  const lineup = event.lineup && event.lineup.length > 0 ? event.lineup : [];
  const faqs = (event.faqs && event.faqs.length > 0)
    ? event.faqs
    : (event.faq && event.faq.length > 0 ? event.faq : DEFAULT_EVENT_FAQS);

  return (
    <div className="space-y-12 animate-in fade-in duration-300">
      {/* Centered Storytelling Container */}
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* TAB 1: ABOUT */}
        {activeTab === 'about' && (
          <div className="space-y-8">
            <div className="bg-zinc-900/90 border border-zinc-800 p-6 sm:p-10 rounded-3xl shadow-xl space-y-8 text-zinc-200">
              <div className="border-b border-zinc-800 pb-4 flex items-center justify-between">
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  The Experience
                </h2>
                <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-[#E31B23]/20 text-red-400 border border-red-500/30">
                  Featured Experience
                </span>
              </div>

              {event.description ? (
                <div
                  className="text-zinc-300 text-base sm:text-lg leading-relaxed font-normal space-y-4 [&_h3]:text-xl [&_h3]:font-black [&_h3]:text-white [&_blockquote]:border-l-4 [&_blockquote]:border-[#E31B23] [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-zinc-200 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
                  dangerouslySetInnerHTML={{ __html: event.description }}
                />
              ) : (
                <p className="text-zinc-400 text-base">No description provided for this experience.</p>
              )}

              {/* Perks Grid */}
              <div className="pt-6 border-t border-zinc-800 space-y-4">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                  Key Experience Perks
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {['Digital QR Mobile Pass', 'Official Verified Host', 'On-Site Security & Medical', 'Instant Ticket Transfer'].map((perk, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-[#E31B23] flex-shrink-0" />
                      <span className="text-xs font-bold text-zinc-200">{perk}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Cinematic Big CTA Banner */}
            <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-red-950 via-zinc-900 to-black border border-red-900/50 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 text-white">
              <div className="space-y-1.5 max-w-xl">
                <span className="text-xs font-black uppercase text-red-400 tracking-wider flex items-center gap-1.5">
                  <Flame className="w-4 h-4 fill-red-400" />
                  <span>Limited Availability</span>
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white">
                  Ready to Experience {event.title}?
                </h3>
                <p className="text-xs sm:text-sm text-zinc-300">
                  {lowestPrice === 0 ? 'Free registration available now.' : `Passes starting from ${formatCurrency(lowestPrice)}.`} Instant digital delivery to your wallet.
                </p>
              </div>

              <button
                type="button"
                onClick={handleGetTickets}
                className="px-8 py-4 bg-[#E31B23] hover:bg-[#B91C1C] text-white text-sm sm:text-base font-black rounded-2xl shadow-xl hover:shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95 flex-shrink-0"
              >
                <Ticket className="w-5 h-5" />
                <span>Get Tickets Now</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: SCHEDULE */}
        {activeTab === 'schedule' && (
          <div className="bg-zinc-900/90 border border-zinc-800 p-6 sm:p-10 rounded-3xl shadow-xl space-y-8 text-zinc-200">
            <div className="border-b border-zinc-800 pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-white">Program & Schedule</h3>
                <p className="text-xs text-zinc-400 mt-1">Confirmed timetable and lineup sessions</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-zinc-800 text-zinc-300">
                {schedules.length} Sessions
              </span>
            </div>

            {schedules.length > 0 ? (
              <div className="space-y-4">
                {schedules.map((s, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#E31B23] text-white flex items-center justify-center font-black text-xs flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black text-red-400">{s.day || `Session ${idx + 1}`}</span>
                        {s.startTime && (
                          <span className="text-xs text-zinc-400">
                            • {s.startTime} {s.endTime ? `- ${s.endTime}` : ''}
                          </span>
                        )}
                      </div>
                      <h4 className="text-base font-bold text-white">{s.title}</h4>
                      {s.description && (
                        <p className="text-xs text-zinc-400 leading-relaxed">{s.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-400">Schedule details will be updated shortly by the host.</p>
            )}

            {/* Lineup */}
            {lineup.length > 0 && (
              <div className="pt-6 border-t border-zinc-800 space-y-4">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                  Featured Lineup & Speakers
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {lineup.map((m, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-center space-y-2">
                      <div className="w-16 h-16 rounded-full mx-auto overflow-hidden bg-zinc-800 border-2 border-zinc-700">
                        {m.avatarUrl ? (
                          <img src={m.avatarUrl} alt={m.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-black text-lg text-white">
                            {m.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <h5 className="text-xs font-bold text-white truncate">{m.name}</h5>
                      <span className="text-[10px] text-red-400 block truncate">{m.role || 'Guest'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: LOCATION */}
        {activeTab === 'location' && (
          <div className="bg-zinc-900/90 border border-zinc-800 p-6 sm:p-10 rounded-3xl shadow-xl space-y-6 text-zinc-200">
            <div className="border-b border-zinc-800 pb-4">
              <h3 className="text-2xl font-black text-white">
                {isPhysical ? 'Venue & Directions' : 'Virtual Streaming Access'}
              </h3>
              <p className="text-xs text-zinc-400 mt-1">Arrival details and interactive location map</p>
            </div>

            {isPhysical ? (
              <div className="space-y-6">
                <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-black text-red-400 uppercase tracking-wider block">Official Venue</span>
                    <h4 className="text-lg font-bold text-white">{event.venue || event.city}</h4>
                    <p className="text-xs text-zinc-400">{event.address ? `${event.address}, ` : ''}{event.city || ''}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {directionsUrl && directionsUrl !== '#' && (
                      <a
                        href={directionsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 bg-[#E31B23] hover:bg-[#B91C1C] text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Get Directions</span>
                      </a>
                    )}
                    <button
                      onClick={handleCopyAddress}
                      className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedAddress ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedAddress ? 'Copied' : 'Copy Address'}</span>
                    </button>
                  </div>
                </div>

                {embedMapUrl && (
                  <div className="rounded-2xl overflow-hidden border border-zinc-800 h-80 sm:h-96 w-full shadow-inner bg-zinc-950">
                    <iframe
                      title="Event Location"
                      src={embedMapUrl}
                      className="w-full h-full border-0 grayscale opacity-90 contrast-125"
                      loading="lazy"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-zinc-950 border border-zinc-800 text-center space-y-3">
                <Video className="w-12 h-12 text-red-500 mx-auto" />
                <h4 className="text-lg font-bold text-white">Live Virtual Broadcast</h4>
                <p className="text-xs text-zinc-400 max-w-md mx-auto">
                  Access credentials and the high-definition streaming room link will be delivered directly to your ticket pass after registration.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: ORGANIZER */}
        {activeTab === 'organizer' && (
          <div className="bg-zinc-900/90 border border-zinc-800 p-6 sm:p-10 rounded-3xl shadow-xl space-y-6 text-zinc-200">
            <div className="border-b border-zinc-800 pb-4">
              <h3 className="text-2xl font-black text-white">Host & Organizer</h3>
              <p className="text-xs text-zinc-400 mt-1">Verified creator profile and contact info</p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 rounded-2xl bg-zinc-950 border border-zinc-800">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center font-black text-xl text-white overflow-hidden">
                  {event.organizer?.logo ? (
                    <img 
                      src={resolveImageUrl(event.organizer.logo)} 
                      alt={event.organizer.name} 
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                      }}
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    event.organizer?.name?.charAt(0) || 'O'
                  )}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">{event.organizer?.name || 'Event Host'}</h4>
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified Event Organizer
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <Link
                  to={`/@${event.organizer?.slug || event.organizer?.id || ''}`}
                  className="px-5 py-2.5 bg-[#E31B23] hover:bg-[#B91C1C] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-102"
                >
                  <Building className="w-4 h-4" />
                  <span>View Organizer Profile</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setContactModalOpen(true)}
                  className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Contact Organizer</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: FAQS */}
        {activeTab === 'faq' && (
          <div className="bg-zinc-900/90 border border-zinc-800 p-6 sm:p-10 rounded-3xl shadow-xl space-y-6 text-zinc-200">
            <div className="border-b border-zinc-800 pb-4">
              <h3 className="text-2xl font-black text-white">Guidelines & FAQs</h3>
              <p className="text-xs text-zinc-400 mt-1">Important attendee guidelines and answers</p>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <div key={idx} className="rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between gap-4 font-bold text-sm text-white"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${openFaqIndex === idx ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaqIndex === idx && (
                    <div className="p-4 pt-0 text-xs text-zinc-400 leading-relaxed border-t border-zinc-900">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: GALLERY */}
        {activeTab === 'gallery' && (
          <div className="bg-zinc-900/90 border border-zinc-800 p-6 sm:p-10 rounded-3xl shadow-xl space-y-6 text-zinc-200">
            <div className="border-b border-zinc-800 pb-4">
              <h3 className="text-2xl font-black text-white">Media & Event Gallery</h3>
              <p className="text-xs text-zinc-400 mt-1">Official highlights and photo gallery</p>
            </div>

            {event.galleryUrls && event.galleryUrls.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {event.galleryUrls.map((url, idx) => (
                  <div key={idx} className="rounded-2xl overflow-hidden aspect-[4/3] bg-zinc-950 border border-zinc-800 group">
                    <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-400">No media photos uploaded yet.</p>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

// =========================================================================
// 2. COMPACT HEADER PAGE LAYOUT
// Structured 2-column productivity layout: Executive Agenda + Sticky Sidebar
// =========================================================================
export const CompactPageLayout: React.FC<EventPageLayoutProps> = (props) => {
  const {
    event,
    activeTab,
    setActiveTab,
    isPhysical,
    isTicketSalesActive,
    lowestPrice,
    directionsUrl,
    mapsUrl,
    embedMapUrl,
    handleGetTickets,
    handleNativeShare,
    setCalendarModalOpen,
    openFaqIndex,
    setOpenFaqIndex,
    handleCopyAddress,
    copiedAddress,
    setContactModalOpen
  } = props;

  const schedules = event.schedules && event.schedules.length > 0 ? event.schedules : [];
  const lineup = event.lineup && event.lineup.length > 0 ? event.lineup : [];
  const faqs = (event.faqs && event.faqs.length > 0)
    ? event.faqs
    : (event.faq && event.faq.length > 0 ? event.faq : DEFAULT_EVENT_FAQS);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-300">
      
      {/* LEFT COLUMN: Executive Agenda & Core Details (8 cols) */}
      <div className="lg:col-span-8 space-y-6">
        <div className="bg-white border border-zinc-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          
          {/* Section Heading */}
          <div className="border-b border-zinc-100 pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-zinc-950">
                {activeTab === 'about'
                  ? 'Executive Overview'
                  : activeTab === 'schedule'
                  ? 'Conference & Lineup Schedule'
                  : activeTab === 'location'
                  ? 'Venue Logistics'
                  : activeTab === 'organizer'
                  ? 'Host & Organizer'
                  : activeTab === 'gallery'
                  ? 'Media & Event Gallery'
                  : activeTab === 'faq'
                  ? 'Guidelines & FAQs'
                  : 'Event Information'}
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                {activeTab === 'organizer'
                  ? 'Verified creator profile and contact info'
                  : activeTab === 'gallery'
                  ? 'Official event photo highlights'
                  : 'High-density agenda & attendee intelligence'}
              </p>
            </div>
          </div>

          {/* TAB 1: ABOUT */}
          {activeTab === 'about' && (
            <div className="space-y-6">
              {event.description ? (
                <div
                  className="text-zinc-600 text-sm sm:text-base leading-relaxed font-normal space-y-3"
                  dangerouslySetInnerHTML={{ __html: event.description }}
                />
              ) : (
                <p className="text-zinc-500 text-sm">No overview provided.</p>
              )}

              {/* Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-zinc-100">
                {['Direct Host Pricing', 'Instant Mobile QR Pass', 'Verified Entry Guaranteed', 'Flexible Transfer'].map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/70 flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#E31B23] flex-shrink-0" />
                    <span className="text-xs font-bold text-zinc-800">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: SCHEDULE */}
          {activeTab === 'schedule' && (
            <div className="space-y-6">
              {/* Lineup if available */}
              {lineup.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-zinc-400">Featured Lineup & Speakers</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {lineup.map((m, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/70 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-zinc-200 border border-zinc-300 overflow-hidden flex items-center justify-center font-bold text-xs flex-shrink-0">
                          {m.avatarUrl ? (
                            <img src={m.avatarUrl} alt={m.name} className="w-full h-full object-cover" />
                          ) : (
                            m.name.charAt(0)
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-zinc-900 truncate">{m.name}</p>
                          <span className="text-[10px] text-red-600 block truncate">{m.role || 'Guest'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Schedules Timeline */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-zinc-400">Session Schedule</h4>
                {schedules.length > 0 ? (
                  <div className="space-y-3">
                    {schedules.map((s, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/70 flex items-start gap-3">
                        <div className="px-2.5 py-1 rounded-md bg-zinc-900 text-white font-mono text-[11px] font-bold flex-shrink-0">
                          {s.startTime || `0${idx + 1}:00`}
                        </div>
                        <div className="space-y-0.5">
                          <h4 className="text-sm font-black text-zinc-950">{s.title}</h4>
                          {s.description && <p className="text-xs text-zinc-500">{s.description}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500">Timetable details will be updated shortly.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: LOCATION */}
          {activeTab === 'location' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-black text-zinc-950 block">{event.venue || event.city}</span>
                  <span className="text-xs text-zinc-500">{event.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  {directionsUrl && directionsUrl !== '#' && (
                    <a
                      href={directionsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-1.5 bg-[#E31B23] text-white text-xs font-bold rounded-lg inline-flex items-center gap-1"
                    >
                      <Navigation className="w-3 h-3" />
                      <span>Directions</span>
                    </a>
                  )}
                  <button
                    onClick={handleCopyAddress}
                    className="px-3.5 py-1.5 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 text-xs font-bold rounded-lg inline-flex items-center gap-1 cursor-pointer"
                  >
                    {copiedAddress ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedAddress ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
              {embedMapUrl && (
                <div className="rounded-xl overflow-hidden border border-zinc-200 h-64 w-full">
                  <iframe title="Map" src={embedMapUrl} className="w-full h-full border-0" loading="lazy" />
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ORGANIZER */}
          {activeTab === 'organizer' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center font-black text-xl text-zinc-900 overflow-hidden shadow-xs flex-shrink-0">
                    {event.organizer?.logo ? (
                      <img 
                        src={resolveImageUrl(event.organizer.logo)} 
                        alt={event.organizer.name} 
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      event.organizer?.name?.charAt(0) || 'O'
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-zinc-950">{event.organizer?.name || 'Event Host'}</h3>
                    <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified Event Organizer
                    </span>
                    {(event.organizer as any)?.bio && (
                      <p className="text-xs text-zinc-600 mt-1.5 max-w-md line-clamp-2">{(event.organizer as any).bio}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  <Link
                    to={`/@${event.organizer?.slug || event.organizer?.id || ''}`}
                    className="px-4 py-2.5 bg-[#E31B23] hover:bg-[#B91C1C] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all hover:scale-102"
                  >
                    <Building className="w-4 h-4" />
                    <span>View Organizer Profile</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => setContactModalOpen(true)}
                    className="px-4 py-2.5 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Contact Organizer</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: FAQS */}
          {activeTab === 'faq' && (
            <div className="space-y-2.5">
              {faqs.map((faq, idx) => (
                <div key={idx} className="rounded-xl border border-zinc-200 p-3.5">
                  <button
                    onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                    className="w-full text-left font-bold text-xs text-zinc-900 flex justify-between"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown className="w-4 h-4 text-zinc-400" />
                  </button>
                  {openFaqIndex === idx && (
                    <p className="mt-2 text-xs text-zinc-500 pt-2 border-t border-zinc-100">{faq.answer}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* TAB 6: GALLERY */}
          {activeTab === 'gallery' && (
            <div className="space-y-4">
              {event.galleryUrls && event.galleryUrls.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {event.galleryUrls.map((url, idx) => (
                    <div key={idx} className="rounded-xl overflow-hidden aspect-[4/3] bg-zinc-100 border border-zinc-200 group">
                      <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-500">No media photos uploaded yet.</p>
              )}
            </div>
          )}

        </div>
      </div>

      {/* RIGHT COLUMN: Sticky Executive Action & Logistics Card (4 cols) */}
      <div className="lg:col-span-4 sticky top-24 space-y-4">
        <div className="bg-white border border-zinc-200/90 rounded-3xl p-6 shadow-md space-y-5">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Registration</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-zinc-950">
                {lowestPrice === 0 ? 'Free RSVP' : formatCurrency(lowestPrice)}
              </span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                Instant Pass
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGetTickets}
            className="w-full py-3.5 bg-[#E31B23] hover:bg-[#B91C1C] text-white text-sm font-black rounded-xl shadow-md hover:shadow-red-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-102 active:scale-98"
          >
            <Ticket className="w-4 h-4" />
            <span>Get Tickets &rarr;</span>
          </button>

          <div className="space-y-3 pt-3 border-t border-zinc-100 text-xs">
            <div className="flex items-center gap-2.5 text-zinc-700">
              <Clock className="w-4 h-4 text-[#E31B23] flex-shrink-0" />
              <span>{formatEventDateTime(event.startDate, event.startTime)}</span>
            </div>
            <div className="flex items-center gap-2.5 text-zinc-700">
              <MapPin className="w-4 h-4 text-[#E31B23] flex-shrink-0" />
              <span className="truncate">{event.venue || event.city}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
            <button
              onClick={() => setCalendarModalOpen(true)}
              className="text-xs font-bold text-zinc-600 hover:text-zinc-950 flex items-center gap-1.5 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Add to Diary</span>
            </button>
            <button
              onClick={handleNativeShare}
              className="text-xs font-bold text-zinc-600 hover:text-zinc-950 flex items-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Event</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

// =========================================================================
// 3. SPLIT VISUAL PAGE LAYOUT
// Persistent Asymmetric 2-Column: Sticky Flyer Rail + Story Canvas
// =========================================================================
export const SplitPageLayout: React.FC<EventPageLayoutProps> = (props) => {
  const {
    event,
    activeTab,
    setActiveTab,
    isPhysical,
    isTicketSalesActive,
    lowestPrice,
    directionsUrl,
    mapsUrl,
    embedMapUrl,
    handleGetTickets,
    handleNativeShare,
    setCalendarModalOpen,
    openFaqIndex,
    setOpenFaqIndex,
    handleCopyAddress,
    copiedAddress,
    setContactModalOpen
  } = props;

  const flyerUrl = event.imageUrl || event.bannerUrl;
  const schedules = event.schedules && event.schedules.length > 0 ? event.schedules : [];
  const lineup = event.lineup && event.lineup.length > 0 ? event.lineup : [];
  const faqs = (event.faqs && event.faqs.length > 0)
    ? event.faqs
    : (event.faq && event.faq.length > 0 ? event.faq : DEFAULT_EVENT_FAQS);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start animate-in fade-in duration-300">
      
      {/* LEFT COLUMN: Sticky Framed Flyer & Action Rail (4 cols) */}
      <div className="lg:col-span-4 sticky top-24 space-y-5">
        <div className="rounded-3xl overflow-hidden aspect-[4/5] shadow-2xl border-2 border-zinc-200/80 bg-zinc-900 relative group">
          <img src={flyerUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
          <div className="absolute bottom-4 inset-x-4 space-y-1 text-white">
            <span className="text-[10px] font-black uppercase text-red-400">Featured Exhibition</span>
            <h4 className="text-base font-black truncate">{event.title}</h4>
          </div>
        </div>

        {/* Action Card */}
        <div className="bg-white border border-zinc-200/90 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500 font-bold">Pass Pricing</span>
            <span className="text-lg font-black text-zinc-950">
              {lowestPrice === 0 ? 'Free RSVP' : `From ${formatCurrency(lowestPrice)}`}
            </span>
          </div>

          <button
            type="button"
            onClick={handleGetTickets}
            className="w-full py-3 bg-[#E31B23] hover:bg-[#B91C1C] text-white text-xs font-black rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all hover:scale-102"
          >
            <Ticket className="w-4 h-4" />
            <span>Get Tickets &rarr;</span>
          </button>
        </div>
      </div>

      {/* RIGHT COLUMN: Rich Narrative & Exhibition Canvas (8 cols) */}
      <div className="lg:col-span-8 space-y-6">
        <div className="bg-white border border-zinc-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-zinc-100 pb-4">
            <h2 className="text-xl sm:text-2xl font-black text-zinc-950">
              {activeTab === 'organizer'
                ? 'Host & Organizer'
                : activeTab === 'schedule'
                ? 'Lineup & Schedule'
                : activeTab === 'location'
                ? 'Venue & Location'
                : activeTab === 'faq'
                ? 'Guidelines & FAQs'
                : activeTab === 'gallery'
                ? 'Media & Event Gallery'
                : 'Exhibition Notes'}
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              {activeTab === 'organizer'
                ? 'Verified creator profile and credentials'
                : activeTab === 'schedule'
                ? 'Confirmed schedule timeline and guest lineup'
                : activeTab === 'location'
                ? 'Venue logistics, directions and interactive map'
                : activeTab === 'faq'
                ? 'Frequently asked questions and attendee policies'
                : activeTab === 'gallery'
                ? 'Official photo highlights and event gallery'
                : 'Official curatorial text & program'}
            </p>
          </div>

          {/* TAB 1: ABOUT */}
          {activeTab === 'about' && (
            <div className="space-y-6">
              {event.description ? (
                <div
                  className="text-zinc-600 text-sm sm:text-base leading-relaxed space-y-3"
                  dangerouslySetInnerHTML={{ __html: event.description }}
                />
              ) : (
                <p className="text-zinc-500 text-sm">No description provided.</p>
              )}

              {/* Perks Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-4 border-t border-zinc-100">
                {['Direct Host Pricing', 'Instant Mobile QR Pass', 'Verified Entry Guaranteed', 'Flexible Transfer'].map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/70 flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#E31B23] flex-shrink-0" />
                    <span className="text-xs font-bold text-zinc-800">{item}</span>
                  </div>
                ))}
              </div>

              {/* Host Summary Card with View Organizer Profile */}
              <div className="pt-4 border-t border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-50 border border-zinc-200/70">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center font-bold text-xs text-zinc-900 overflow-hidden flex-shrink-0 shadow-2xs">
                    {event.organizer?.logo ? (
                      <img 
                        src={resolveImageUrl(event.organizer.logo)} 
                        alt={event.organizer.name} 
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      event.organizer?.name?.charAt(0) || 'O'
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Host & Organizer</span>
                    <p className="text-xs font-bold text-zinc-900 truncate">{event.organizer?.name || 'Event Host'}</p>
                  </div>
                </div>
                <Link
                  to={`/@${event.organizer?.slug || event.organizer?.id || ''}`}
                  className="px-3.5 py-1.5 bg-[#E31B23] hover:bg-[#B91C1C] text-white text-xs font-bold rounded-lg inline-flex items-center justify-center gap-1.5 shadow-xs transition-all hover:scale-102 flex-shrink-0"
                >
                  <Building className="w-3.5 h-3.5" />
                  <span>View Organizer Profile</span>
                </Link>
              </div>

              {/* Schedule Teaser */}
              {schedules.length > 0 && (
                <div className="pt-4 border-t border-zinc-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Program Teaser</h4>
                    <button
                      type="button"
                      onClick={() => setActiveTab('schedule')}
                      className="text-xs font-bold text-red-600 hover:text-red-700 cursor-pointer"
                    >
                      View Full Schedule &rarr;
                    </button>
                  </div>
                  <div className="space-y-2">
                    {schedules.slice(0, 3).map((s, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/70 flex items-center justify-between">
                        <div>
                          <span className="text-xs font-black text-zinc-950 block">{s.title}</span>
                          <span className="text-[11px] text-zinc-500">{s.day}</span>
                        </div>
                        <span className="text-xs font-mono font-bold text-red-600">{s.startTime}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SCHEDULE */}
          {activeTab === 'schedule' && (
            <div className="space-y-6">
              {/* Lineup if available */}
              {lineup.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-zinc-400">Featured Lineup & Speakers</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {lineup.map((m, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/70 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-zinc-200 border border-zinc-300 overflow-hidden flex items-center justify-center font-bold text-xs flex-shrink-0">
                          {m.avatarUrl ? (
                            <img src={m.avatarUrl} alt={m.name} className="w-full h-full object-cover" />
                          ) : (
                            m.name.charAt(0)
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-zinc-900 truncate">{m.name}</p>
                          <span className="text-[10px] text-red-600 block truncate">{m.role || 'Guest'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Schedules Timeline */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-zinc-400">Session Timeline</h4>
                {schedules.length > 0 ? (
                  <div className="space-y-3">
                    {schedules.map((s, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/70 flex items-start gap-3">
                        <div className="px-2.5 py-1 rounded-md bg-zinc-900 text-white font-mono text-[11px] font-bold flex-shrink-0">
                          {s.startTime || `0${idx + 1}:00`}
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-red-600">{s.day || `Session ${idx + 1}`}</span>
                            {s.endTime && <span className="text-xs text-zinc-400">• ends {s.endTime}</span>}
                          </div>
                          <h4 className="text-sm font-black text-zinc-950">{s.title}</h4>
                          {s.description && <p className="text-xs text-zinc-500 leading-relaxed">{s.description}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500">Program details will be updated shortly by the host.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: LOCATION */}
          {activeTab === 'location' && (
            <div className="space-y-5">
              <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <span className="text-xs font-black text-red-600 uppercase tracking-wider block">Official Venue</span>
                  <h4 className="text-base font-bold text-zinc-950">{event.venue || event.city}</h4>
                  <p className="text-xs text-zinc-500">{event.address ? `${event.address}, ` : ''}{event.city || ''}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
                  {directionsUrl && directionsUrl !== '#' && (
                    <a
                      href={directionsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 bg-[#E31B23] hover:bg-[#B91C1C] text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Directions</span>
                    </a>
                  )}
                  <button
                    onClick={handleCopyAddress}
                    className="px-4 py-2 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 text-xs font-bold rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedAddress ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedAddress ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {embedMapUrl && (
                <div className="rounded-2xl overflow-hidden border border-zinc-200 h-80 w-full shadow-inner bg-zinc-100">
                  <iframe
                    title="Location Map"
                    src={embedMapUrl}
                    className="w-full h-full border-0"
                    loading="lazy"
                  />
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ORGANIZER */}
          {activeTab === 'organizer' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center font-black text-xl text-zinc-900 overflow-hidden shadow-xs flex-shrink-0">
                    {event.organizer?.logo ? (
                      <img 
                        src={resolveImageUrl(event.organizer.logo)} 
                        alt={event.organizer.name} 
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      event.organizer?.name?.charAt(0) || 'O'
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-zinc-950">{event.organizer?.name || 'Event Host'}</h3>
                    <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified Event Organizer
                    </span>
                    {(event.organizer as any)?.bio && (
                      <p className="text-xs text-zinc-600 mt-1.5 max-w-md line-clamp-2">{(event.organizer as any).bio}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  <Link
                    to={`/@${event.organizer?.slug || event.organizer?.id || ''}`}
                    className="px-4 py-2.5 bg-[#E31B23] hover:bg-[#B91C1C] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all hover:scale-102"
                  >
                    <Building className="w-4 h-4" />
                    <span>View Organizer Profile</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => setContactModalOpen(true)}
                    className="px-4 py-2.5 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Contact Organizer</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: FAQS */}
          {activeTab === 'faq' && (
            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <div key={idx} className="rounded-xl border border-zinc-200 p-4">
                  <button
                    onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                    className="w-full text-left font-bold text-sm text-zinc-900 flex justify-between gap-3"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${openFaqIndex === idx ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaqIndex === idx && (
                    <p className="mt-3 text-xs text-zinc-600 pt-3 border-t border-zinc-100 leading-relaxed">{faq.answer}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* TAB 6: GALLERY */}
          {activeTab === 'gallery' && (
            <div className="space-y-4">
              {event.galleryUrls && event.galleryUrls.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {event.galleryUrls.map((url, idx) => (
                    <div key={idx} className="rounded-xl overflow-hidden aspect-[4/3] bg-zinc-100 border border-zinc-200 group">
                      <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-500">No media photos uploaded yet.</p>
              )}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

// =========================================================================
// 4. MODERN BENTO GRID PAGE LAYOUT
// Modular Asymmetrical Bento Board: Interactive Tiles & Fast Navigation
// =========================================================================
export const BentoPageLayout: React.FC<EventPageLayoutProps> = (props) => {
  const {
    event,
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
  } = props;

  const schedules = event.schedules && event.schedules.length > 0 ? event.schedules : [];
  const lineup = event.lineup && event.lineup.length > 0 ? event.lineup : [];
  const faqs = (event.faqs && event.faqs.length > 0)
    ? event.faqs
    : (event.faq && event.faq.length > 0 ? event.faq : DEFAULT_EVENT_FAQS);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      
      {/* ===================================================================== */}
      {/* 1. BENTO TAB: ABOUT (Signature Multi-Tile Dashboard) */}
      {/* ===================================================================== */}
      {activeTab === 'about' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* TILE 1: Experience Overview & Story (8 cols) */}
          <div className="lg:col-span-8 bg-white border border-zinc-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E31B23]" />
                <h2 className="text-xl sm:text-2xl font-black text-zinc-950 tracking-tight">
                  About The Experience
                </h2>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-zinc-100 text-zinc-700">
                Overview
              </span>
            </div>

            {event.description ? (
              <div
                className="text-zinc-600 text-sm sm:text-base leading-relaxed space-y-3 [&_h3]:text-lg [&_h3]:font-black [&_h3]:text-zinc-950 [&_blockquote]:border-l-3 [&_blockquote]:border-[#E31B23] [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-zinc-700 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
                dangerouslySetInnerHTML={{ __html: event.description }}
              />
            ) : (
              <p className="text-zinc-500 text-sm">No detailed description provided.</p>
            )}

            {/* Quick Highlights Pills */}
            <div className="pt-4 border-t border-zinc-100 space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-zinc-400 block">Experience Perks</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200/60 flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#E31B23] flex-shrink-0" />
                  <span className="text-xs font-bold text-zinc-800">Verified Admission</span>
                </div>
                <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200/60 flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-[#E31B23] flex-shrink-0" />
                  <span className="text-xs font-bold text-zinc-800">Early Gate Access</span>
                </div>
                <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200/60 flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span className="text-xs font-bold text-zinc-800">Instant QR Delivery</span>
                </div>
              </div>
            </div>
          </div>

          {/* TILE 2: Organizer Spotlight & Verified Host (4 cols) */}
          <div className="lg:col-span-4 bg-white border border-zinc-200/90 rounded-3xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <span className="text-xs font-black uppercase tracking-wider text-zinc-400">Host & Organizer</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Verified Host
              </span>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-zinc-100 border border-zinc-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                {(event.organizer?.logo || (event.organizer as any)?.avatar) ? (
                  <img
                    src={event.organizer?.logo || (event.organizer as any)?.avatar}
                    alt={event.organizer?.name || 'Organizer'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Building className="w-6 h-6 text-zinc-400" />
                )}
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-black text-zinc-950 truncate">
                  {event.organizer?.name || 'Official Organizer'}
                </h3>
                <p className="text-xs text-zinc-500 truncate">Event Producer & Curator</p>
              </div>
            </div>

            <p className="text-xs text-zinc-600 leading-relaxed line-clamp-3">
              {(event.organizer as any)?.bio || 'Dedicated to creating memorable communal gatherings, premier hospitality, and world-class live experiences.'}
            </p>

            <div className="flex flex-col gap-2 pt-1">
              <Link
                to={`/@${event.organizer?.slug || event.organizer?.id || ''}`}
                className="w-full py-2.5 bg-[#E31B23] hover:bg-[#B91C1C] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs hover:scale-102"
              >
                <Building className="w-3.5 h-3.5" />
                <span>View Organizer Profile</span>
              </Link>
              <button
                type="button"
                onClick={() => setContactModalOpen(true)}
                className="w-full py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5 text-zinc-500" />
                <span>Contact Organizer</span>
              </button>
            </div>
          </div>

          {/* TILE 3: Schedule & Lineup Preview (6 cols) */}
          <div className="lg:col-span-6 bg-white border border-zinc-200/90 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#E31B23]" />
                <h3 className="text-lg font-black text-zinc-950">Program & Agenda</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('schedule')}
                className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
              >
                <span>View Full Schedule</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {schedules.length > 0 ? (
              <div className="space-y-3">
                {schedules.slice(0, 3).map((session, sIdx) => (
                  <div key={(session as any).id || session.title || sIdx} className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/70 flex items-center justify-between gap-3">
                    <div className="space-y-0.5 min-w-0">
                      <span className="text-xs font-bold text-zinc-950 block truncate">{session.title}</span>
                      <span className="text-[11px] text-zinc-500 block truncate">{session.day || 'Scheduled Milestone'}</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-red-50 text-[#E31B23] text-xs font-black font-mono flex-shrink-0">
                      {session.startTime || 'TBD'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-zinc-400">
                Detailed session milestones will be updated closer to the event date.
              </div>
            )}
          </div>

          {/* TILE 4: Location, Directions & Map Preview (6 cols) */}
          <div className="lg:col-span-6 bg-white border border-zinc-200/90 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                <h3 className="text-lg font-black text-zinc-950">Venue & Location</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('location')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
              >
                <span>Full Directions</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/70 flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-zinc-900">{event.venue || event.city}</h4>
                  <p className="text-xs text-zinc-500 mt-0.5">{event.address ? `${event.address}, ` : ''}{event.city}</p>
                </div>
                {isPhysical && (
                  <button
                    type="button"
                    onClick={handleCopyAddress}
                    className="text-xs font-bold text-zinc-600 hover:text-zinc-950 flex items-center gap-1 cursor-pointer flex-shrink-0"
                  >
                    {copiedAddress ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedAddress ? 'Copied' : 'Copy'}</span>
                  </button>
                )}
              </div>

              {isPhysical ? (
                <div className="relative rounded-2xl overflow-hidden border border-zinc-200 h-[180px] bg-zinc-100">
                  <iframe
                    title="Bento Map Frame"
                    src={embedMapUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute bottom-2 right-2 px-2.5 py-1 bg-white/95 text-zinc-900 border border-zinc-200 text-[11px] font-bold rounded-lg shadow-sm flex items-center gap-1 hover:bg-white"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Google Maps</span>
                  </a>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-center space-y-1">
                  <Radio className="w-5 h-5 text-blue-600 mx-auto" />
                  <span className="text-xs font-bold text-blue-900 block">Virtual Livestream Access</span>
                  <p className="text-[11px] text-blue-700">Digital stream link provided upon pass reservation.</p>
                </div>
              )}
            </div>
          </div>

          {/* TILE 5: Key Guidelines & FAQs Preview (12 cols) */}
          <div className="lg:col-span-12 bg-white border border-zinc-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="text-lg font-black text-zinc-950">Important Guidelines & FAQs</h3>
              <button
                type="button"
                onClick={() => setActiveTab('faq')}
                className="text-xs font-bold text-zinc-600 hover:text-zinc-950 flex items-center gap-1 cursor-pointer"
              >
                <span>View All FAQs ({faqs.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {faqs.slice(0, 4).map((faqItem, fIdx) => (
                <div key={(faqItem as any).id || faqItem.question || fIdx} className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/70 space-y-1.5">
                  <span className="text-xs font-black text-zinc-950 block">{faqItem.question}</span>
                  <p className="text-xs text-zinc-600 leading-relaxed">{faqItem.answer}</p>
                </div>
              ))}
            </div>
          </div>

          {/* TILE 6: Direct Ticket Reservation Concierge Banner (12 cols) */}
          <div className="lg:col-span-12 rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-950 to-black text-white p-6 sm:p-8 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-md">
            <div className="space-y-1">
              <span className="text-xs font-black uppercase text-red-400 tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#E31B23]" />
                <span>Official Registration</span>
              </span>
              <h4 className="text-xl sm:text-2xl font-black text-white">
                Reserve Your Pass For {event.title}
              </h4>
              <p className="text-xs text-zinc-400">
                Admission from {lowestPrice === 0 ? 'Free RSVP' : formatCurrency(lowestPrice)} • Instant Digital Delivery
              </p>
            </div>

            {isTicketSalesActive ? (
              <button
                type="button"
                onClick={handleGetTickets}
                className="px-8 py-3.5 bg-[#E31B23] hover:bg-[#B91C1C] text-white text-xs sm:text-sm font-black rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-102 active:scale-98 flex-shrink-0"
              >
                <Ticket className="w-4 h-4" />
                <span>Get Tickets</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <span className="px-5 py-2.5 rounded-xl bg-zinc-800 text-zinc-400 text-xs font-bold">
                Ticket Sales Concluded
              </span>
            )}
          </div>

        </div>
      )}

      {/* ===================================================================== */}
      {/* 2. BENTO TAB: SCHEDULE & LINEUP */}
      {/* ===================================================================== */}
      {activeTab === 'schedule' && (
        <div className="space-y-6">
          <div className="bg-white border border-zinc-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-zinc-950">Lineup & Schedule</h2>
                <p className="text-xs text-zinc-500 mt-0.5">Confirmed timetable and guest lineup</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('about')}
                className="px-3.5 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                &larr; Bento Overview
              </button>
            </div>

            {/* Lineup if available */}
            {lineup.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-zinc-400">Featured Lineup & Speakers</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {lineup.map((m, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/70 text-center space-y-2">
                      <div className="w-14 h-14 rounded-full mx-auto overflow-hidden bg-zinc-200 border-2 border-white shadow-xs">
                        {m.avatarUrl ? (
                          <img src={m.avatarUrl} alt={m.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-black text-base text-zinc-700">
                            {m.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <h5 className="text-xs font-bold text-zinc-900 truncate">{m.name}</h5>
                      <span className="text-[10px] text-red-600 block truncate">{m.role || 'Guest'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Schedules Timeline */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-zinc-400">Detailed Timeline</h4>
              {schedules.length > 0 ? (
                <div className="space-y-3">
                  {schedules.map((s, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/70 flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-[#E31B23] text-white flex items-center justify-center font-black text-xs flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-red-600">{s.day || `Session ${idx + 1}`}</span>
                          {s.startTime && (
                            <span className="text-xs text-zinc-500 font-mono">
                              • {s.startTime} {s.endTime ? `- ${s.endTime}` : ''}
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-zinc-950">{s.title}</h4>
                        {s.description && (
                          <p className="text-xs text-zinc-500 leading-relaxed">{s.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-500">Program details will be announced soon.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 3. BENTO TAB: VENUE & DIRECTIONS */}
      {/* ===================================================================== */}
      {activeTab === 'location' && (
        <div className="space-y-6">
          <div className="bg-white border border-zinc-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-zinc-950">
                  {isPhysical ? 'Venue & Directions' : 'Virtual Streaming Access'}
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">Arrival logistics and interactive map</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('about')}
                className="px-3.5 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                &larr; Bento Overview
              </button>
            </div>

            {isPhysical ? (
              <div className="space-y-6">
                <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-black text-red-600 uppercase tracking-wider block">Official Venue</span>
                    <h4 className="text-lg font-bold text-zinc-950">{event.venue || event.city}</h4>
                    <p className="text-xs text-zinc-500">{event.address ? `${event.address}, ` : ''}{event.city || ''}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {directionsUrl && directionsUrl !== '#' && (
                      <a
                        href={directionsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 bg-[#E31B23] hover:bg-[#B91C1C] text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Get Directions</span>
                      </a>
                    )}
                    <button
                      onClick={handleCopyAddress}
                      className="px-4 py-2 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 text-xs font-bold rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedAddress ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedAddress ? 'Copied' : 'Copy Address'}</span>
                    </button>
                  </div>
                </div>

                {embedMapUrl && (
                  <div className="rounded-2xl overflow-hidden border border-zinc-200 h-96 w-full shadow-inner bg-zinc-100">
                    <iframe
                      title="Event Location"
                      src={embedMapUrl}
                      className="w-full h-full border-0"
                      loading="lazy"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-zinc-50 border border-zinc-200 text-center space-y-3">
                <Video className="w-12 h-12 text-red-500 mx-auto" />
                <h4 className="text-lg font-bold text-zinc-950">Live Virtual Broadcast</h4>
                <p className="text-xs text-zinc-500 max-w-md mx-auto">
                  Access credentials and the high-definition streaming room link will be delivered directly to your ticket pass after registration.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 4. BENTO TAB: HOST & ORGANIZER */}
      {/* ===================================================================== */}
      {activeTab === 'organizer' && (
        <div className="space-y-6">
          <div className="bg-white border border-zinc-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-zinc-950">Host & Organizer</h2>
                <p className="text-xs text-zinc-500 mt-0.5">Verified creator profile, credentials and contact</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('about')}
                className="px-3.5 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                &larr; Bento Overview
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 rounded-2xl bg-zinc-50 border border-zinc-200/80">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center font-black text-xl text-zinc-900 overflow-hidden shadow-xs flex-shrink-0">
                  {event.organizer?.logo ? (
                    <img 
                      src={resolveImageUrl(event.organizer.logo)} 
                      alt={event.organizer.name} 
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                      }}
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    event.organizer?.name?.charAt(0) || 'O'
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-black text-zinc-950">{event.organizer?.name || 'Event Host'}</h3>
                  <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified Event Organizer
                  </span>
                  {(event.organizer as any)?.bio && (
                    <p className="text-xs text-zinc-600 mt-1.5 max-w-md line-clamp-2">{(event.organizer as any).bio}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                <Link
                  to={`/@${event.organizer?.slug || event.organizer?.id || ''}`}
                  className="px-5 py-2.5 bg-[#E31B23] hover:bg-[#B91C1C] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all hover:scale-102"
                >
                  <Building className="w-4 h-4" />
                  <span>View Organizer Profile</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setContactModalOpen(true)}
                  className="px-4 py-2.5 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Contact Organizer</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 5. BENTO TAB: GUIDELINES & FAQS */}
      {/* ===================================================================== */}
      {activeTab === 'faq' && (
        <div className="space-y-6">
          <div className="bg-white border border-zinc-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-zinc-950">Guidelines & FAQs</h2>
                <p className="text-xs text-zinc-500 mt-0.5">Attendee guidelines, admission rules and answers</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('about')}
                className="px-3.5 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                &larr; Bento Overview
              </button>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <div key={idx} className="rounded-xl border border-zinc-200 p-4">
                  <button
                    onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                    className="w-full text-left font-bold text-sm text-zinc-900 flex justify-between gap-3"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${openFaqIndex === idx ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaqIndex === idx && (
                    <p className="mt-3 text-xs text-zinc-600 pt-3 border-t border-zinc-100 leading-relaxed">{faq.answer}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 6. BENTO TAB: MEDIA & GALLERY */}
      {/* ===================================================================== */}
      {activeTab === 'gallery' && (
        <div className="space-y-6">
          <div className="bg-white border border-zinc-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-zinc-950">Media & Event Gallery</h2>
                <p className="text-xs text-zinc-500 mt-0.5">Official photo highlights and media archive</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('about')}
                className="px-3.5 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                &larr; Bento Overview
              </button>
            </div>

            {event.galleryUrls && event.galleryUrls.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {event.galleryUrls.map((url, idx) => (
                  <div key={idx} className="rounded-2xl overflow-hidden aspect-[4/3] bg-zinc-100 border border-zinc-200 group">
                    <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-500">No media photos uploaded yet.</p>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

