import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { EventCard } from '../components/ui/EventCard';
import { eventApi, normalizeBackendEvent } from '../api/events';
import type { Event } from '../types/api';
import { 
  Search, 
  ArrowRight,
  Ticket,
  ShieldCheck,
  Smartphone,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  QrCode,
  Zap,
  Plus,
  ArrowUpRight,
  Users2,
  Layers,
  Code2,
  Radio,
  Workflow,
  Sparkles,
  Compass,
  Check,
  Calculator,
  TrendingUp,
  CreditCard,
  Building2,
  Lock,
  Sliders,
  DollarSign,
  ScanLine,
  CalendarCheck,
  Coins,
  BadgePercent,
  Star,
  Quote,
  ShieldAlert,
  HelpCircle,
  Clock,
  Flame,
  Award
} from 'lucide-react';
import { formatCurrency } from '../utils/format';

export const Home: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeShowcaseTab, setActiveShowcaseTab] = useState<'attendee' | 'organizer'>('organizer');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  
  // Interactive Revenue & Fee Calculator States
  const [calcTicketCount, setCalcTicketCount] = useState<number>(350);
  const [calcTicketPrice, setCalcTicketPrice] = useState<number>(5000); // ₦5,000 standard ticket
  const [calcAbsorbFee, setCalcAbsorbFee] = useState<boolean>(false);

  const navigate = useNavigate();
  const searchBarRef = useRef<HTMLElement>(null);
  const eventsTrackRef = useRef<HTMLDivElement>(null);

  // Live Explore Events loaded directly via API client without external QueryClientProvider dependency
  const [liveEvents, setLiveEvents] = useState<Event[]>([]);
  const [isEventsLoading, setIsEventsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setIsEventsLoading(true);
    eventApi.getExploreEvents({ limit: 8, per_page: 8 })
      .then((res) => {
        if (!isMounted) return;
        const rawList = res?.data?.data || (Array.isArray(res?.data) ? res?.data : []);
        const normalized = (rawList as any[]).map(normalizeBackendEvent);
        setLiveEvents(normalized);
      })
      .catch((err) => {
        console.warn('Home: error fetching explore events:', err);
      })
      .finally(() => {
        if (isMounted) setIsEventsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const scrollEventsTrack = (direction: 'left' | 'right') => {
    if (!eventsTrackRef.current) return;
    const offset = direction === 'left' ? -380 : 380;
    eventsTrackRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  // Fee calculation mechanics:
  // StraytTix platform fee: 2.5% + ₦100 flat processing per ticket (capped at ₦2,000 per ticket max)
  const grossRevenue = calcTicketCount * calcTicketPrice;
  const rawFeePerTicket = (calcTicketPrice * 0.025) + (calcTicketPrice > 0 ? 100 : 0);
  const cappedFeePerTicket = Math.min(rawFeePerTicket, 2000);
  const totalPlatformFees = calcTicketCount * cappedFeePerTicket;
  const organizerTakeHome = calcAbsorbFee ? Math.max(0, grossRevenue - totalPlatformFees) : grossRevenue;
  const buyerPaysPerTicket = calcAbsorbFee ? calcTicketPrice : calcTicketPrice + cappedFeePerTicket;

  // Smooth scroll exit animation: As the search bar scrolls out of view,
  // it gracefully scales down, tilts slightly, and fades out rather than abrupt cutoff
  const { scrollYProgress } = useScroll({
    target: searchBarRef,
    offset: ['start center', 'end start']
  });

  const searchBarOpacity = useTransform(scrollYProgress, [0.35, 0.85], [1, 0]);
  const searchBarScale = useTransform(scrollYProgress, [0.35, 0.85], [1, 0.94]);
  const searchBarY = useTransform(scrollYProgress, [0.35, 0.85], [0, -16]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    navigate(`/discover?${params.toString()}`);
  };

  const scrollToExplore = () => {
    const el = document.getElementById('explore');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen bg-[#08080A] text-zinc-900 flex flex-col justify-between selection:bg-[#E31B23] selection:text-white antialiased overflow-x-hidden">
      {/* Fixed top Navbar overlay */}
      <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
        <Navbar />
      </div>

      <main className="flex-1">
        {/* ========================================================================= */}
        {/* 1. HERO SECTION: Full-Bleed Viewport Atmosphere (Behind Navbar)          */}
        {/*    Direct reference to Jetron Ticket composition with luxury refinement   */}
        {/* ========================================================================= */}
        <section className="relative min-h-[100dvh] w-full flex flex-col justify-between bg-[#08080A] overflow-hidden text-center px-4 sm:px-6 lg:px-8">
          
          {/* Ambient Lighting & High-Fidelity Cinematic Festival Video Background */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            {/* Ambient Radial Mesh Glows */}
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] sm:w-[1000px] h-[500px] bg-gradient-to-b from-[#E31B23]/25 via-[#E31B23]/10 to-transparent blur-[120px] rounded-full z-1" />
            <div className="absolute top-1/3 left-1/4 w-[400px] h-[300px] bg-amber-500/10 blur-[140px] rounded-full z-1" />
            
            {/* Cinematic Background Video with Poster Fallback */}
            <video
              autoPlay
              muted
              loop
              playsInline
              poster="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=2600&q=85"
              className="w-full h-full object-cover object-center filter brightness-[0.62] contrast-[1.12] saturate-[1.15] scale-105"
            >
              <source src="/videos/hero-festival.mp4" type="video/mp4" />
              <source src="https://assets.mixkit.co/videos/14088/14088-720.mp4" type="video/mp4" />
            </video>

            {/* Deep studio vignette & gradient feathering */}
            <div className="absolute inset-0 z-2 bg-gradient-to-t from-[#08080A] via-[#08080A]/60 to-[#08080A]/85" />
            <div className="absolute inset-0 z-2 bg-radial from-transparent via-[#08080A]/35 to-[#08080A]/95" />
          </div>

          {/* Top Spacing to compensate for navbar height */}
          <div className="h-16 sm:h-20 shrink-0" />

          {/* Hero Center Text & Actions (Floating whimsical entrance) */}
          <motion.div 
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 max-w-4xl mx-auto py-8 sm:py-12 my-auto space-y-6 sm:space-y-7 flex flex-col items-center"
          >
            {/* Headline matching user reference image */}
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-white tracking-[-0.035em] leading-[1.12] sm:leading-[1.08] text-balance drop-shadow-lg px-2">
              Attending And Creating Events Has Never Been Easier.
            </h1>

            {/* Supporting Subtitle matching reference */}
            <p className="text-zinc-300/95 text-xs sm:text-base md:text-lg leading-relaxed max-w-2xl font-normal text-balance drop-shadow-sm px-3">
              Nigeria&apos;s #1 ticketing platform for discovering events, buying tickets, and creating, promoting, and selling tickets for your own events.
            </p>

            {/* Hero Action Button */}
            <div className="pt-3 flex items-center justify-center w-full sm:w-auto">
              {/* Primary: Discover Events */}
              <Link
                to="/discover"
                className="w-full sm:w-auto group inline-flex items-center justify-between sm:justify-start gap-3 bg-[#E31B23] hover:bg-[#C9141B] text-white font-bold rounded-full pl-7 pr-2.5 py-2 text-sm sm:text-base shadow-[0_12px_32px_-6px_rgba(227,27,35,0.5)] transition-all duration-300 hover:shadow-[0_16px_40px_-6px_rgba(227,27,35,0.7)] hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer"
              >
                <span>Discover Events</span>
                <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/20 group-hover:bg-black/30 flex items-center justify-center transition-transform duration-300 group-hover:translate-x-1.5 shrink-0">
                  <ArrowRight className="w-4 h-4 text-white" />
                </span>
              </Link>
            </div>

          </motion.div>

          {/* Bottom Downward Scroll Chevron matching reference */}
          <div className="relative z-10 pb-8 sm:pb-10 flex flex-col items-center">
            <button
              type="button"
              onClick={scrollToExplore}
              aria-label="Scroll down to browse platform features"
              className="inline-flex flex-col items-center gap-1.5 text-zinc-400 hover:text-white transition-colors cursor-pointer group"
            >
              <span className="text-[10px] font-mono tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-zinc-300">
                Explore Platform
              </span>
              <div className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/10 backdrop-blur-md flex items-center justify-center group-hover:border-white/30 transition-all">
                <ChevronDown className="w-4 h-4 text-white/80 animate-bounce group-hover:text-white" />
              </div>
            </button>
          </div>

        </section>

        {/* ========================================================================= */}
        {/* 2. FLOATING DISCOVERY ISLAND: Architectural Double-Bezel Console          */}
        {/*    Straddles exactly across the boundary line between Hero and Next Sec  */}
        {/* ========================================================================= */}
        <section 
          ref={searchBarRef}
          id="explore" 
          className="relative z-30 px-4 sm:px-6 lg:px-8 -my-8 sm:-my-10"
        >
          <motion.div 
            style={{ 
              opacity: searchBarOpacity, 
              scale: searchBarScale, 
              y: searchBarY 
            }}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-4xl mx-auto"
          >
            {/* Outer Clean Elevated Container with subtle refined focus glow */}
            <div className="p-1.5 sm:p-2 rounded-2xl sm:rounded-3xl bg-white shadow-[0_20px_50px_-10px_rgba(0,0,0,0.18)] transition-all duration-300 ring-1 ring-black/5 focus-within:ring-2 focus-within:ring-zinc-400/50 focus-within:shadow-[0_25px_60px_-10px_rgba(0,0,0,0.22)]">
              {/* Inner Form */}
              <form 
                onSubmit={handleSearchSubmit}
                className="flex flex-row items-center gap-2 p-1 sm:p-2"
              >
                {/* Search Keyword Input */}
                <div className="flex items-center gap-2 sm:gap-3 px-2.5 sm:px-3 py-1.5 sm:py-2 flex-1 min-w-0">
                  <Search className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-400 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Find events by name, location, or artist..."
                    className="w-full bg-transparent text-sm sm:text-base text-zinc-950 placeholder-zinc-400 outline-none border-none ring-0 focus:outline-none focus:ring-0 font-medium truncate"
                  />
                </div>

                {/* Execute Button */}
                <button
                  type="submit"
                  aria-label="Search events"
                  className="p-3 sm:px-7 sm:py-3 bg-[#E31B23] hover:bg-[#C9141B] text-white text-sm sm:text-base font-bold rounded-xl transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2 shrink-0"
                >
                  <Search className="w-4 h-4 sm:hidden" />
                  <span className="hidden sm:inline">Search</span>
                  <ArrowRight className="hidden sm:inline w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        </section>

        {/* ========================================================================= */}
        {/* 2.5 TRUST MARQUEE: Verified Promoters, Brands & Global Event Producers     */}
        {/*     Subtle luxury grayscale ribbon with reduced-motion safety             */}
        {/* ========================================================================= */}
        <section className="pt-20 pb-8 px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#070709] border-b border-zinc-150 dark:border-white/5 transition-colors duration-300">
          <div className="max-w-6xl mx-auto space-y-4">
            <p className="text-center text-[11px] font-mono uppercase tracking-[0.22em] text-zinc-400 dark:text-zinc-500 font-semibold">
              TRUSTED BY LEADING PROMOTERS, FESTIVALS &amp; VENUES ACROSS NIGERIA
            </p>

            <div className="relative overflow-hidden py-4 [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
              <div className="flex items-center gap-8 sm:gap-14 animate-marquee whitespace-nowrap will-change-transform">
                {[
                  'NATIVE SOUND SYSTEM',
                  'FLYTIME FEST',
                  'EKO CONVENTION CENTER',
                  'PALMWINE MUSIC FEST',
                  'LIVESPOT X FESTIVAL',
                  'THE BEAT 99.9 FM',
                  'HOMECOMING LAGOS',
                  'TERRA KULTURE ARENA',
                  'AFROCHELLA GLOBAL',
                  'MAINLAND BLOCKPARTY'
                ].concat([
                  'NATIVE SOUND SYSTEM',
                  'FLYTIME FEST',
                  'EKO CONVENTION CENTER',
                  'PALMWINE MUSIC FEST',
                  'LIVESPOT X FESTIVAL',
                  'THE BEAT 99.9 FM',
                  'HOMECOMING LAGOS',
                  'TERRA KULTURE ARENA',
                  'AFROCHELLA GLOBAL',
                  'MAINLAND BLOCKPARTY'
                ]).map((brand, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-2 text-xs sm:text-sm font-mono font-bold tracking-wider text-zinc-400/80 hover:text-zinc-950 dark:hover:text-white transition-colors cursor-default select-none"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E31B23]/40" />
                    {brand}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. LIVE UPCOMING EVENTS RAIL: High-Demand Real Drops (Direct from Backend)  */}
        {/*    Horizontal kinetic carousel directly wired to /explore/events          */}
        {/* ========================================================================= */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20 bg-zinc-50/60 dark:bg-[#09090D] border-b border-zinc-200/80 dark:border-white/5 transition-colors duration-300">
          <div className="max-w-6xl mx-auto space-y-8">
            
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-xs font-mono font-bold text-[#E31B23]">
                  <Flame className="w-3.5 h-3.5" />
                  <span>Happening Soon</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-black text-zinc-950 dark:text-white tracking-tight">
                  Featured Live Events
                </h2>
                <p className="text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm">
                  Curated concerts, rave nights, and tech summits on sale now with instant digital pass issuance.
                </p>
              </div>

              {/* Navigation Controls & Explore All Link */}
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => scrollEventsTrack('left')}
                    aria-label="Scroll left"
                    className="w-9 h-9 rounded-full bg-white dark:bg-white/10 border border-zinc-200 dark:border-white/15 flex items-center justify-center text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/15 transition-all shadow-sm cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollEventsTrack('right')}
                    aria-label="Scroll right"
                    className="w-9 h-9 rounded-full bg-white dark:bg-white/10 border border-zinc-200 dark:border-white/15 flex items-center justify-center text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/15 transition-all shadow-sm cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <Link
                  to="/discover"
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#E31B23] hover:text-[#C9141B] transition-colors"
                >
                  <span>See all events</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Events Track */}
            {isEventsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="rounded-3xl bg-zinc-200/50 dark:bg-white/5 animate-pulse h-96 border border-zinc-200 dark:border-white/10" />
                ))}
              </div>
            ) : liveEvents.length > 0 ? (
              <div 
                ref={eventsTrackRef}
                className="flex gap-6 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scrollbar-none scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0"
              >
                {liveEvents.map((event) => (
                  <div key={event.id} className="min-w-[280px] sm:min-w-[340px] max-w-[340px] snap-start shrink-0">
                    <EventCard event={event} variant="default" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 rounded-3xl bg-white dark:bg-white/[0.02] border border-zinc-200 dark:border-white/10 space-y-3">
                <Ticket className="w-10 h-10 text-zinc-400 mx-auto" />
                <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">No public events listed currently</p>
                <Link to="/organizer/events/create" className="text-xs font-bold text-[#E31B23] hover:underline inline-block">
                  Be the first to publish an event &rarr;
                </Link>
              </div>
            )}

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. THE STRAYTTIX HIGH-ASSURANCE STANDARD: Architectural Bento             */}
        {/* ========================================================================= */}
        <section className="px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16 sm:pb-24 bg-white dark:bg-[#070709] transition-colors duration-300">
          <div className="max-w-6xl mx-auto space-y-14">
            
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-2 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-xs font-bold text-zinc-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#E31B23]" />
                  <span>The StraytTix Standard</span>
                </div>
                <h2 className="text-3xl sm:text-5xl font-black text-zinc-950 dark:text-white tracking-[-0.03em] leading-tight">
                  Transparent, tamper-proof ticketing.
                </h2>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base font-normal">
                  Engineered with cryptographic barcodes so you never have to worry about fake tickets, double-entry, or venue delays.
                </p>
              </div>

              <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-zinc-500 bg-zinc-50 px-3.5 py-1.5 rounded-full border border-zinc-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>100% VERIFIED AUTHENTICITY</span>
              </div>
            </div>

            {/* 3 Hardware Bento Cards with Whimsical Hover Spring & Tilt */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              
              {/* Bento 1: 100% Verified Tickets */}
              <motion.div 
                initial={{ opacity: 0, y: 36 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
                whileHover={{ y: -8, scale: 1.01 }}
                className="group rounded-[1.75rem] border border-zinc-200/90 dark:border-white/10 bg-gradient-to-b from-white via-white to-zinc-50/70 dark:from-white/[0.04] dark:via-white/[0.02] dark:to-transparent p-7 sm:p-8 flex flex-col justify-between hover:border-zinc-300 dark:hover:border-white/20 hover:shadow-2xl transition-all duration-300 space-y-6"
              >
                
                {/* Visual Header Mockup */}
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-2.5 transition-transform duration-300 group-hover:scale-[1.02]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>DIRECT FROM ORGANIZER</span>
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">#ZERO-SCALPING</span>
                  </div>
                  <div className="flex items-center gap-3 pt-1">
                    <div className="w-9 h-9 rounded-xl bg-zinc-950 text-white flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-[#E31B23] transition-colors">
                      ✓
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-zinc-950 truncate">Cryptographic Barcode</p>
                      <p className="text-[10px] text-zinc-500 font-mono truncate">Tamper-Proof Single-Issue ID</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-black text-zinc-950 tracking-tight">
                    100% Verified Passes
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-normal">
                    Every ticket is issued directly by verified promoters. No duplicate passes, no inflated secondary resale markups.
                  </p>
                </div>

                <div className="pt-2 border-t border-zinc-150 flex items-center gap-2 text-xs text-zinc-500 font-medium">
                  <ShieldCheck className="w-4 h-4 text-[#E31B23]" />
                  <span>Full refund guarantee on organizer cancellations</span>
                </div>
              </motion.div>

              {/* Bento 2: Instant Mobile Passes */}
              <motion.div 
                initial={{ opacity: 0, y: 36 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
                whileHover={{ y: -8, scale: 1.01 }}
                className="group rounded-[1.75rem] border border-zinc-200/90 dark:border-white/10 bg-gradient-to-b from-white via-white to-zinc-50/70 dark:from-white/[0.04] dark:via-white/[0.02] dark:to-transparent p-7 sm:p-8 flex flex-col justify-between hover:border-zinc-300 dark:hover:border-white/20 hover:shadow-2xl transition-all duration-300 space-y-6"
              >
                
                {/* Visual Header Mockup */}
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-2.5 transition-transform duration-300 group-hover:scale-[1.02]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-800 bg-zinc-200/80 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <Smartphone className="w-3 h-3 text-zinc-600" />
                      <span>OFFLINE READY</span>
                    </span>
                    <span className="text-[10px] font-mono text-emerald-600 font-bold">DELIVERED</span>
                  </div>
                  <div className="flex items-center gap-3 pt-1">
                    <div className="w-9 h-9 rounded-xl bg-[#E31B23] text-white flex items-center justify-center shrink-0">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-zinc-950 truncate">Apple &amp; Google Wallet Pass</p>
                      <p className="text-[10px] text-zinc-500 font-mono truncate">One-Tap Gate Presentation</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-black text-zinc-950 tracking-tight">
                    Instant Mobile Passes
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-normal">
                    Tickets appear immediately in your account and arrive in your email with offline-cached QR access for zero-reception venues.
                  </p>
                </div>

                <div className="pt-2 border-t border-zinc-150 flex items-center gap-2 text-xs text-zinc-500 font-medium">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Works with zero mobile reception at packed venues</span>
                </div>
              </motion.div>

              {/* Bento 3: Smooth Gate Entry */}
              <motion.div 
                initial={{ opacity: 0, y: 36 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
                whileHover={{ y: -8, scale: 1.01 }}
                className="group rounded-[1.75rem] border border-zinc-200/90 dark:border-white/10 bg-gradient-to-b from-white via-white to-zinc-50/70 dark:from-white/[0.04] dark:via-white/[0.02] dark:to-transparent p-7 sm:p-8 flex flex-col justify-between hover:border-zinc-300 dark:hover:border-white/20 hover:shadow-2xl transition-all duration-300 space-y-6"
              >
                
                {/* Visual Header Mockup */}
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-2.5 transition-transform duration-300 group-hover:scale-[1.02]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <Zap className="w-3 h-3 text-emerald-600" />
                      <span>&lt; 0.2s SCAN SPEED</span>
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">TURNSTILE CLEAR</span>
                  </div>
                  <div className="flex items-center gap-3 pt-1">
                    <div className="w-9 h-9 rounded-xl bg-zinc-950 text-white flex items-center justify-center shrink-0 group-hover:bg-emerald-600 transition-colors">
                      <Ticket className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-zinc-950 truncate">Sub-Second Gate Clearance</p>
                      <p className="text-[10px] text-zinc-500 font-mono truncate">Free High-Density Check-In App</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-black text-zinc-950 tracking-tight">
                    Sub-Second Door Entry
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-normal">
                    Show your QR pass on your phone screen at the entrance for immediate check-in using our high-speed gate scanner.
                  </p>
                </div>

                <div className="pt-2 border-t border-zinc-150 flex items-center gap-2 text-xs text-zinc-500 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Zero physical paper printouts required</span>
                </div>
              </motion.div>

            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. TIX & JETRON DELIVERABLE: ALL-IN-ONE POWERFUL CAPABILITIES              */}
        {/*    Structured around what the platform delivers to Creators & Attendees   */}
        {/* ========================================================================= */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 sm:py-28 bg-[#090A0E] text-white relative overflow-hidden">
          {/* Subtle Dynamic Ambient Lighting */}
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#E31B23]/10 blur-[160px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none" />

          <div className="max-w-6xl mx-auto space-y-20 relative z-10">

            {/* Main Header */}
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.08] border border-white/15 text-xs font-mono font-bold text-zinc-300">
                <Sparkles className="w-3.5 h-3.5 text-[#E31B23]" />
                <span>What We Deliver</span>
              </div>
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-[-0.035em] leading-[1.12]">
                Everything you need to discover, sell, and run live events.
              </h2>
              <p className="text-zinc-400 text-sm sm:text-base md:text-lg leading-relaxed text-balance">
                Built specifically for creators, promoters, and event-goers across Nigeria and beyond. High-speed checkouts, zero gate queues, and instant bank settlements.
              </p>
            </div>

            {/* Split Deliverable Grid: Left (Attendees) & Right (Organizers) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Pillar A: For Attendees */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-[2.25rem] bg-white/[0.03] border border-white/10 p-8 sm:p-10 flex flex-col justify-between hover:border-white/20 transition-all duration-300 space-y-8"
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold">
                      FOR ATTENDEES
                    </span>
                    <Compass className="w-5 h-5 text-zinc-400" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                      Find your vibe. Lock your pass without hassle.
                    </h3>
                    <p className="text-sm text-zinc-400 leading-relaxed">
                      Discover music festivals, secret raves, comedy specials, and summits. Buy tickets in seconds using your preferred local payment methods.
                    </p>
                  </div>

                  {/* Feature Checklist */}
                  <div className="space-y-3.5 pt-2">
                    {[
                      { title: 'Zero Surprise Service Fees', desc: 'What you see is what you pay. Transparent pricing on every ticket tier.' },
                      { title: 'Multiple Local Payment Options', desc: 'Pay smoothly with Naira Debit Cards, Apple Pay, Bank Transfer, or USSD.' },
                      { title: 'Instant Offline Passes', desc: 'Access your ticket QR code anytime even when venue cellular reception drops.' },
                      { title: 'Anti-Scalp Protection', desc: 'Single-issuance cryptographic barcodes stop fraudulent ticket scalpers cold.' }
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                        <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3" />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-zinc-200">{item.title}</p>
                          <p className="text-[11px] sm:text-xs text-zinc-500">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  to="/discover"
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm transition-all border border-white/10 hover:border-white/25 active:scale-98"
                >
                  <span>Explore Live Events</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>

              {/* Pillar B: For Creators & Organizers */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                className="rounded-[2.25rem] bg-gradient-to-b from-[#E31B23]/10 to-white/[0.02] border border-[#E31B23]/25 p-8 sm:p-10 flex flex-col justify-between hover:border-[#E31B23]/40 transition-all duration-300 space-y-8"
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="px-3.5 py-1 rounded-full bg-[#E31B23]/20 border border-[#E31B23]/30 text-red-400 text-xs font-mono font-bold">
                      FOR CREATORS &amp; ORGANIZERS
                    </span>
                    <Workflow className="w-5 h-5 text-red-400" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                      Publish once. Sell out fast. Get paid instantly.
                    </h3>
                    <p className="text-sm text-zinc-400 leading-relaxed">
                      All the infrastructure required to host small community meetups or 50,000-capacity arena concerts with bank-grade reliability.
                    </p>
                  </div>

                  {/* Feature Checklist */}
                  <div className="space-y-3.5 pt-2">
                    {[
                      { title: 'Sub-5 Minute Setup', desc: 'Create custom ticket tiers, early-bird limits, and promo codes effortlessly.' },
                      { title: 'Automated Instant Bank Payouts', desc: 'Revenue settled directly into your Nigerian bank account with zero manual delays.' },
                      { title: 'High-Density Check-in Scanner', desc: 'Turn any smartphone into a gate terminal scanning passes in under 0.2 seconds.' },
                      { title: 'White-Label Embeds & APIs', desc: 'Embed our checkout directly on your custom website domain with zero code.' }
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                        <div className="w-5 h-5 rounded-full bg-[#E31B23]/20 text-[#E31B23] flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3" />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-zinc-200">{item.title}</p>
                          <p className="text-[11px] sm:text-xs text-zinc-500">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  to="/pricing"
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#E31B23] hover:bg-[#C9141B] text-white font-bold text-sm transition-all shadow-lg shadow-[#E31B23]/30 active:scale-98"
                >
                  <span>Explore Organizer Tools &amp; Pricing</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>

            </div>

            {/* 4 Feature Pillars Grid (Jetron + Tix Enterprise Capabilities) */}
            <div className="pt-8 space-y-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                    Enterprise Event Operations
                  </h3>
                  <p className="text-zinc-400 text-xs sm:text-sm">
                    Powerful features engineered for serious production crews, event agencies, and high-demand drops.
                  </p>
                </div>
                <div className="text-xs font-mono text-zinc-500">
                  POWERED BY THE STRAYTTIX PLATFORM
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* 1. Interactive 3D Seat Maps */}
                <motion.div 
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E31B23] to-[#B91C1C] flex items-center justify-center text-white shadow-md shadow-[#E31B23]/25">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-base font-bold text-white">Interactive Seat Maps</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Enable attendees to reserve exact rows, VIP tables, or floor zones with real-time seat locks.
                    </p>
                  </div>
                  <div className="pt-3 border-t border-white/5 text-[11px] font-mono text-zinc-500">
                    REAL-TIME SYNC
                  </div>
                </motion.div>

                {/* 2. Virtual Waiting Rooms */}
                <motion.div 
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white shadow-md shadow-amber-500/25">
                    <Radio className="w-5 h-5" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-base font-bold text-white">Traffic Waiting Rooms</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Handle 20,000+ simultaneous fans during viral ticket drops without checkout timeouts or crashes.
                    </p>
                  </div>
                  <div className="pt-3 border-t border-white/5 text-[11px] font-mono text-zinc-500">
                    BOT-PROOF QUEUES
                  </div>
                </motion.div>

                {/* 3. White-Label Checkout */}
                <motion.div 
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/25">
                    <Code2 className="w-5 h-5" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-base font-bold text-white">Embeddable Checkout</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Keep fans on your own domain with frictionless inline ticket checkout widgets, webhooks, and REST APIs.
                    </p>
                  </div>
                  <div className="pt-3 border-t border-white/5 text-[11px] font-mono text-zinc-500">
                    REST API &amp; WEBHOOKS
                  </div>
                </motion.div>

                {/* 4. Multi-Staff Door Control */}
                <motion.div 
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-purple-500/25">
                    <Users2 className="w-5 h-5" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-base font-bold text-white">Multi-Staff Scanner PINs</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Safely assign bouncers and check-in crew PIN codes to scan passes without access to finances.
                    </p>
                  </div>
                  <div className="pt-3 border-t border-white/5 text-[11px] font-mono text-zinc-500">
                    ROLE PERMISSIONS
                  </div>
                </motion.div>

              </div>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5.5 INTERACTIVE PRODUCT EXPERIENCE & REVENUE CALCULATOR                   */}
        {/*     Deep, tactile showcase: Attendee vs Organizer Mockups & Live Earnings  */}
        {/* ========================================================================= */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 sm:py-28 bg-[#07070A] text-white relative overflow-hidden border-t border-b border-white/5">
          {/* Subtle Ambient Radial Lighting */}
          <div className="absolute top-1/4 right-0 w-[550px] h-[550px] bg-[#E31B23]/10 blur-[180px] rounded-full pointer-events-none" />
          <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-red-950/20 blur-[160px] rounded-full pointer-events-none" />

          <div className="max-w-6xl mx-auto space-y-24 relative z-10">

            {/* PART 1: Interactive Product Showcase Tabs (Attendee vs Organizer UI) */}
            <div className="space-y-12">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-3 max-w-xl">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-xs font-mono font-bold text-zinc-300">
                    <Sparkles className="w-3.5 h-3.5 text-[#E31B23]" />
                    <span>Tactile Product Architecture</span>
                  </div>
                  <h2 className="text-3xl sm:text-5xl font-black text-white tracking-[-0.035em] leading-[1.12]">
                    Built for the stadium. Refined for your pocket.
                  </h2>
                  <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
                    Toggle between the attendee pass experience and the high-density organizer terminal to see how StraytTix runs in the field.
                  </p>
                </div>

                {/* Tab Switcher Pills */}
                <div className="p-1 rounded-2xl bg-zinc-900/90 border border-white/10 inline-flex items-center gap-1 self-start md:self-auto shadow-xl">
                  <button
                    type="button"
                    onClick={() => setActiveShowcaseTab('organizer')}
                    className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                      activeShowcaseTab === 'organizer'
                        ? 'bg-[#E31B23] text-white shadow-lg shadow-[#E31B23]/30'
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Workflow className="w-4 h-4" />
                    <span>Creator Console</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveShowcaseTab('attendee')}
                    className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                      activeShowcaseTab === 'attendee'
                        ? 'bg-[#E31B23] text-white shadow-lg shadow-[#E31B23]/30'
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Fan Mobile Pass</span>
                  </button>
                </div>
              </div>

              {/* Showcase Frame with AnimatePresence */}
              <AnimatePresence mode="wait">
                {activeShowcaseTab === 'organizer' ? (
                  <motion.div
                    key="organizer-showcase"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center rounded-3xl bg-zinc-950/80 border border-white/10 p-6 sm:p-10 lg:p-12 shadow-2xl backdrop-blur-xl"
                  >
                    {/* Left: Organizer Value & Live Metrics */}
                    <div className="lg:col-span-5 space-y-6">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono font-bold">
                        CREATOR CONTROL CENTER
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                        Instant sales telemetry with zero settlement wait.
                      </h3>
                      <p className="text-sm text-zinc-400 leading-relaxed font-normal">
                        Every ticket sold reflects instantly across your inventory. Create multiple ticket tiers, manage promotional flash sales, and trigger instant bank payouts straight to your Nigerian account.
                      </p>

                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
                          <p className="text-xs text-zinc-500 font-mono">AUTOMATED PAYOUT</p>
                          <p className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">T+0 Days</p>
                          <p className="text-[11px] text-zinc-400">Direct to Access, GTB, Zenith</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
                          <p className="text-xs text-zinc-500 font-mono">GATE TERMINALS</p>
                          <p className="text-xl sm:text-2xl font-black text-white font-mono">Unlimited</p>
                          <p className="text-[11px] text-zinc-400">Multi-staff PIN access</p>
                        </div>
                      </div>

                      <div className="pt-2 flex items-center gap-3">
                        <Link
                          to="/organizer/events/create"
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#E31B23] hover:bg-[#C9141B] text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-[#E31B23]/25"
                        >
                          <span>Launch An Event</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link
                          to="/pricing"
                          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white font-bold text-xs sm:text-sm transition-all border border-white/10"
                        >
                          <span>Fee Structure</span>
                        </Link>
                      </div>
                    </div>

                    {/* Right: Realistic Console Window UI Mockup */}
                    <div className="lg:col-span-7">
                      <div className="rounded-2xl bg-[#0C0D12] border border-white/15 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden font-sans">
                        {/* Chrome bar */}
                        <div className="px-4 py-3 bg-white/[0.04] border-b border-white/10 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                            <span className="ml-2 text-[11px] font-mono text-zinc-400">console.strayttix.com / pulse-festival-2026</span>
                          </div>
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            LIVE DROP ACTIVE
                          </span>
                        </div>

                        {/* Console Body */}
                        <div className="p-6 space-y-6">
                          {/* Top Metric Cards */}
                          <div className="grid grid-cols-3 gap-3">
                            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                              <span className="text-[10px] font-mono text-zinc-500 uppercase">Gross Volume</span>
                              <div className="text-lg sm:text-xl font-bold font-mono text-white">₦14,850,000</div>
                              <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                                <TrendingUp className="w-3 h-3" /> +38% vs target
                              </span>
                            </div>
                            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                              <span className="text-[10px] font-mono text-zinc-500 uppercase">Tickets Claimed</span>
                              <div className="text-lg sm:text-xl font-bold font-mono text-white">1,842 <span className="text-xs text-zinc-500 font-normal">/ 2,000</span></div>
                              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-1">
                                <div className="bg-[#E31B23] h-full w-[92%]" />
                              </div>
                            </div>
                            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                              <span className="text-[10px] font-mono text-zinc-500 uppercase">Gate Scans</span>
                              <div className="text-lg sm:text-xl font-bold font-mono text-emerald-400">1,210 IN</div>
                              <span className="text-[10px] text-zinc-400">62% turnout so far</span>
                            </div>
                          </div>

                          {/* Active Ticket Tiers Table */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs font-mono text-zinc-400 px-1">
                              <span>ACTIVE TIER INVENTORY</span>
                              <span>STATUS</span>
                            </div>
                            <div className="space-y-2">
                              {[
                                { name: 'Early Bird Regular', price: '₦5,000', sold: '500 / 500', status: 'SOLD OUT', color: 'text-zinc-400 bg-white/5' },
                                { name: 'Main Tier (Phase 1)', price: '₦8,000', sold: '1,042 / 1,200', status: '87% SOLD', color: 'text-amber-400 bg-amber-500/10' },
                                { name: 'VIP All-Access Backstage', price: '₦35,000', sold: '300 / 300', status: 'SOLD OUT', color: 'text-zinc-400 bg-white/5' }
                              ].map((tier, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs">
                                  <div className="flex items-center gap-3">
                                    <div className="w-7 h-7 rounded-lg bg-[#E31B23]/15 text-[#E31B23] flex items-center justify-center font-bold font-mono">
                                      T{idx + 1}
                                    </div>
                                    <div>
                                      <p className="font-bold text-white">{tier.name}</p>
                                      <p className="text-[10px] text-zinc-500 font-mono">{tier.price} per pass</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="font-mono text-zinc-300 text-[11px]">{tier.sold}</span>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${tier.color}`}>
                                      {tier.status}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Bottom Payout Status Bar */}
                          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 text-emerald-300">
                              <Building2 className="w-4 h-4 text-emerald-400" />
                              <span>Direct Payout Route: GTBank •••• 4091</span>
                            </div>
                            <span className="font-mono text-emerald-400 font-bold">AUTOMATED SETTLEMENT ACTIVE</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="attendee-showcase"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center rounded-3xl bg-zinc-950/80 border border-white/10 p-6 sm:p-10 lg:p-12 shadow-2xl backdrop-blur-xl"
                  >
                    {/* Left: Fan Mobile Pass Features */}
                    <div className="lg:col-span-5 space-y-6">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold">
                        FAN TICKETING COMPANION
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                        Zero scalping. Instant offline barcode presentation.
                      </h3>
                      <p className="text-sm text-zinc-400 leading-relaxed font-normal">
                        Your pass is cryptographically bound to your phone. Whether you add it to your Apple Wallet, Google Wallet, or view it offline inside StraytTix, entry takes under 0.2 seconds.
                      </p>

                      <div className="space-y-3 pt-2">
                        {[
                          { title: 'Offline-Cached QR Codes', desc: 'Works with zero cell service or Wi-Fi outside congested arenas.' },
                          { title: 'One-Tap Apple & Google Wallet', desc: 'Double-click your power button at the gate turnstile for instant admission.' },
                          { title: 'Peer-to-Peer Transfer Protection', desc: 'Send a ticket to a friend securely — the old QR voids immediately to block duplicates.' }
                        ].map((item, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                            <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                              <Check className="w-3 h-3" />
                            </div>
                            <div>
                              <p className="text-xs sm:text-sm font-bold text-zinc-200">{item.title}</p>
                              <p className="text-[11px] sm:text-xs text-zinc-400">{item.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 flex items-center gap-3">
                        <Link
                          to="/discover"
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#E31B23] hover:bg-[#C9141B] text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-[#E31B23]/25"
                        >
                          <span>Discover Events</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link
                          to="/download"
                          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white font-bold text-xs sm:text-sm transition-all border border-white/10"
                        >
                          <span>Get Mobile App</span>
                        </Link>
                      </div>
                    </div>

                    {/* Right: Luxury Phone Pass Frame Mockup */}
                    <div className="lg:col-span-7 flex justify-center">
                      <div className="w-full max-w-sm rounded-[2.5rem] bg-gradient-to-b from-zinc-800 via-zinc-900 to-black p-3.5 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.9)] border border-white/20">
                        {/* Inner Phone Screen */}
                        <div className="rounded-[2rem] bg-[#0A0B0E] p-5 space-y-5 border border-white/10 overflow-hidden relative">
                          {/* Phone Speaker Notch */}
                          <div className="flex justify-center -mt-1 mb-2">
                            <span className="w-16 h-1 rounded-full bg-white/20" />
                          </div>

                          {/* Pass Header */}
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-[#E31B23]" />
                              <span className="font-black tracking-tight text-white">StraytTix PASS</span>
                            </div>
                            <span className="text-[10px] font-mono text-zinc-400 bg-white/10 px-2 py-0.5 rounded-full">VIP ACCESS</span>
                          </div>

                          {/* Event Artwork Preview */}
                          <div className="relative rounded-2xl overflow-hidden aspect-video border border-white/10">
                            <img
                              src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80"
                              alt="Concert festival pass artwork"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-3 flex flex-col justify-end">
                              <span className="text-[10px] font-mono uppercase text-amber-400 font-bold">Lagos Mainland • Dec 18</span>
                              <h4 className="text-base font-black text-white leading-tight">Neon Horizon Live 2026</h4>
                            </div>
                          </div>

                          {/* Ticket Meta Grid */}
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/5">
                              <span className="text-[9px] font-mono text-zinc-400 block">TIER</span>
                              <span className="font-bold text-white">VIP All-Access</span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/5">
                              <span className="text-[9px] font-mono text-zinc-400 block">SEAT / ZONE</span>
                              <span className="font-bold text-white">Golden Circle B</span>
                            </div>
                          </div>

                          {/* Cryptographic QR Centerpiece */}
                          <div className="p-4 rounded-2xl bg-white text-zinc-950 flex flex-col items-center justify-center space-y-2 shadow-inner">
                            <div className="p-2 bg-white rounded-lg border-2 border-dashed border-zinc-300">
                              <QrCode className="w-28 h-28 text-zinc-950" />
                            </div>
                            <span className="text-[9px] font-mono text-zinc-500 tracking-wider font-bold">
                              PASS ID: #ST-8924-XQ91-2026
                            </span>
                            <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-bold">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Valid &amp; Ready for Turnstile Scan</span>
                            </div>
                          </div>

                          {/* Apple / Google Wallet Sync Button */}
                          <div className="pt-1">
                            <div className="w-full py-2.5 rounded-xl bg-zinc-900 border border-white/20 text-white text-xs font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors">
                              <Smartphone className="w-3.5 h-3.5 text-zinc-400" />
                              <span>Added to Apple Wallet</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* PART 2: Interactive Revenue & Transparent Fee Calculator */}
            <div className="pt-10 border-t border-white/10">
              <div className="rounded-[2.5rem] bg-gradient-to-br from-zinc-950 via-[#0B0B10] to-zinc-950 border border-white/10 p-8 sm:p-12 lg:p-14 shadow-2xl relative overflow-hidden">
                {/* Accent Background Glow */}
                <div className="absolute top-0 right-1/4 w-[400px] h-[300px] bg-[#E31B23]/10 blur-[130px] rounded-full pointer-events-none" />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
                  
                  {/* Left: Calculator Controls & Interactive Sliders */}
                  <div className="lg:col-span-6 space-y-7">
                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-xs font-mono font-bold text-zinc-300">
                        <Calculator className="w-3.5 h-3.5 text-[#E31B23]" />
                        <span>Interactive Earnings Simulator</span>
                      </div>
                      <h3 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                        Calculate your exact ticket earnings.
                      </h3>
                      <p className="text-sm text-zinc-400 leading-relaxed">
                        No hidden gate surcharges. No setup costs. Adjust ticket volume and price to see your instant payout.
                      </p>
                    </div>

                    {/* Slider 1: Expected Tickets Sold */}
                    <div className="space-y-3 p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/5">
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="font-bold text-zinc-300 flex items-center gap-2">
                          <Ticket className="w-4 h-4 text-[#E31B23]" />
                          Expected Attendees / Tickets
                        </span>
                        <span className="font-mono font-black text-white text-base">
                          {calcTicketCount.toLocaleString()} passes
                        </span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="5000"
                        step="10"
                        value={calcTicketCount}
                        onChange={(e) => setCalcTicketCount(Number(e.target.value))}
                        aria-label="Expected Attendees or Tickets Sold"
                        className="w-full accent-[#E31B23] h-2 bg-zinc-800 rounded-lg cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                        <span>20 (Intimate)</span>
                        <span>1,000 (Club / Hall)</span>
                        <span>5,000+ (Festival)</span>
                      </div>
                    </div>

                    {/* Slider 2: Average Ticket Price */}
                    <div className="space-y-3 p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/5">
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="font-bold text-zinc-300 flex items-center gap-2">
                          <Coins className="w-4 h-4 text-amber-400" />
                          Average Ticket Price (NGN)
                        </span>
                        <span className="font-mono font-black text-white text-base">
                          {formatCurrency(calcTicketPrice)}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="500"
                        max="50000"
                        step="500"
                        value={calcTicketPrice}
                        onChange={(e) => setCalcTicketPrice(Number(e.target.value))}
                        aria-label="Average Ticket Price"
                        className="w-full accent-[#E31B23] h-2 bg-zinc-800 rounded-lg cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                        <span>₦500 (Student)</span>
                        <span>₦15,000 (Concert)</span>
                        <span>₦50,000 (VIP Table)</span>
                      </div>
                    </div>

                    {/* Toggle: Who Pays Fees (Pass to buyer vs absorb) */}
                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="text-xs sm:text-sm font-bold text-zinc-200">Pass fee to attendee?</p>
                        <p className="text-[11px] text-zinc-500">
                          {calcAbsorbFee ? 'Organizer absorbs standard 2.5% fee' : 'Attendee covers fee at checkout (Organizer receives 100% of price)'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCalcAbsorbFee(!calcAbsorbFee)}
                        className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer p-0.5 ${
                          !calcAbsorbFee ? 'bg-[#E31B23]' : 'bg-zinc-800'
                        }`}
                        title="Toggle Fee Absorption"
                        aria-label="Toggle fee absorption"
                      >
                        <span className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                          !calcAbsorbFee ? 'translate-x-6' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                  </div>

                  {/* Right: Live Calculated Payout Summary Card */}
                  <div className="lg:col-span-6">
                    <div className="rounded-3xl bg-zinc-900/90 border border-white/15 p-6 sm:p-8 space-y-6 shadow-2xl">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                          YOUR ESTIMATED TAKE-HOME PAYOUT
                        </span>
                        <div className="text-3xl sm:text-5xl font-black font-mono text-emerald-400 tracking-tight">
                          {formatCurrency(organizerTakeHome)}
                        </div>
                        <p className="text-xs text-zinc-400">
                          Settled directly to your Nigerian bank account with automated T+0 transfers.
                        </p>
                      </div>

                      <hr className="border-white/10" />

                      {/* Detailed Fee Breakdown Ledger */}
                      <div className="space-y-3 text-xs sm:text-sm font-mono">
                        <div className="flex justify-between items-center text-zinc-400">
                          <span>Gross Ticket Volume:</span>
                          <span className="text-white font-bold">{formatCurrency(grossRevenue)}</span>
                        </div>
                        <div className="flex justify-between items-center text-zinc-400">
                          <span>StraytTix Standard Fee (2.5% + ₦100):</span>
                          <span className="text-zinc-300">{formatCurrency(totalPlatformFees)}</span>
                        </div>
                        <div className="flex justify-between items-center text-zinc-400">
                          <span>Fee Handler:</span>
                          <span className={`font-bold ${!calcAbsorbFee ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {!calcAbsorbFee ? 'Attendee Covers at Checkout' : 'Absorbed by Organizer'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-zinc-400">
                          <span>Attendee Final Ticket Price:</span>
                          <span className="text-white font-bold">{formatCurrency(buyerPaysPerTicket)}</span>
                        </div>
                      </div>

                      {/* Value Guarantees Box */}
                      <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1.5 text-xs">
                        <div className="flex items-center gap-2 text-zinc-300 font-bold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>Includes unlimited gate check-in scanner apps</span>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-300 font-bold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>Zero monthly maintenance or setup contracts</span>
                        </div>
                      </div>

                      <div className="pt-2">
                        <Link
                          to="/organizer/events/create"
                          className="w-full py-4 rounded-xl bg-[#E31B23] hover:bg-[#C9141B] text-white font-bold text-sm transition-all shadow-xl shadow-[#E31B23]/30 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                        >
                          <span>Start Selling at These Rates</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 6. COMPARISON: WHY CREATORS & ATTENDEES CHOOSE US OVER TRADITIONAL SITES   */}
        {/* ========================================================================= */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 sm:py-24 bg-white border-b border-zinc-100">
          <div className="max-w-6xl mx-auto space-y-14">
            
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-mono uppercase tracking-widest text-[#E31B23] font-bold">
                Why Switch to StraytTix
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-zinc-950 tracking-[-0.03em]">
                Built different. By design.
              </h2>
              <p className="text-zinc-600 text-sm sm:text-base">
                See how we compare against legacy ticketing platforms and manual transfer arrangements.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[640px]">
                <thead>
                  <tr className="border-b border-zinc-200">
                    <th className="py-4 px-6 text-sm font-bold text-zinc-500 uppercase tracking-wider font-mono">Platform Feature</th>
                    <th className="py-4 px-6 text-base font-black text-[#E31B23] bg-red-50/60 rounded-t-2xl">StraytTix</th>
                    <th className="py-4 px-6 text-sm font-bold text-zinc-500">Traditional Sites</th>
                    <th className="py-4 px-6 text-sm font-bold text-zinc-500">Manual Transfers</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-150 text-sm">
                  {[
                    { feature: 'Ticket Scalp & Duplicate Protection', us: '100% Cryptographic QR Locks', them: 'Basic static barcodes', manual: 'Zero protection' },
                    { feature: 'Payout Timeframe', us: 'Instant Automated Bank Transfers', them: '5 - 14 Business Days', manual: 'Messy manual tracking' },
                    { feature: 'High-Demand Drop Queue', us: 'Managed Virtual Waiting Room', them: 'Crashes on high traffic', manual: 'DMs flood & freeze' },
                    { feature: 'Door Check-in Latency', us: '< 0.2s with Offline Sync', them: 'Slow paper / web lookups', manual: 'Manual name paper list' },
                    { feature: 'Hidden Buyer Checkout Fees', us: 'Zero Surprise Markups', them: '10% - 25% added at payment', manual: 'None (high fraud risk)' },
                    { feature: 'Custom Website Embeds', us: 'Native 2-step Widget & REST API', them: 'Redirects off your website', manual: 'Not possible' }
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-zinc-50/80 transition-colors">
                      <td className="py-4 px-6 font-bold text-zinc-900">{row.feature}</td>
                      <td className="py-4 px-6 font-bold text-[#E31B23] bg-red-50/40">{row.us}</td>
                      <td className="py-4 px-6 text-zinc-500">{row.them}</td>
                      <td className="py-4 px-6 text-zinc-400">{row.manual}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 7. LIVE SCALE METRICS (Monochrome Authority)                              */}
        {/* ========================================================================= */}
        <section className="px-4 sm:px-6 lg:px-8 py-14 sm:py-18 bg-[#09090C] text-white border-b border-zinc-900">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 text-center lg:text-left"
          >
            <motion.div whileHover={{ scale: 1.04 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className="space-y-1">
              <p className="text-3xl sm:text-5xl font-black font-mono tracking-tight text-white">₦1.8B+</p>
              <p className="text-xs sm:text-sm text-zinc-400 font-medium">Ticket Gross Volume Processed</p>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className="space-y-1">
              <p className="text-3xl sm:text-5xl font-black font-mono tracking-tight text-white">180K+</p>
              <p className="text-xs sm:text-sm text-zinc-400 font-medium">Tickets Safely Scanned</p>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className="space-y-1">
              <p className="text-3xl sm:text-5xl font-black font-mono tracking-tight text-white">&lt;0.2s</p>
              <p className="text-xs sm:text-sm text-zinc-400 font-medium">Average Gate Clearance Latency</p>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className="space-y-1">
              <p className="text-3xl sm:text-5xl font-black font-mono tracking-tight text-white">0%</p>
              <p className="text-xs sm:text-sm text-zinc-400 font-medium">Counterfeit Ticket Incidents</p>
            </motion.div>
          </motion.div>
        </section>

        {/* ========================================================================= */}
        {/* 7.5 CURATED REVIEWS & TESTIMONIALS (Attendee & Organizer Trust)           */}
        {/* ========================================================================= */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 sm:py-28 bg-[#090A0E] text-white border-b border-white/5 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#E31B23]/5 blur-[180px] rounded-full pointer-events-none" />

          <div className="max-w-6xl mx-auto space-y-16 relative z-10">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-xs font-mono font-bold text-zinc-300">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>Verified Feedback</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                Trusted by 180,000+ fans and creators.
              </h2>
              <p className="text-zinc-400 text-sm sm:text-base">
                Here is why organizers and attendees rely on StraytTix for their biggest nights.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {[
                {
                  quote: "We scanned over 4,200 attendees at the gate in under 35 minutes using four phones. Zero ticket duplicates or scanner lag. The automated payout landed the exact same evening.",
                  author: "Chuka Obi",
                  role: "Head of Operations",
                  org: "Neon Soundwave Fest",
                  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
                  rating: 5,
                  tag: "ORGANIZER VERIFIED"
                },
                {
                  quote: "Buying tickets on StraytTix is a breath of fresh air. No surprise service fees added at the payment step, Apple Pay worked instantly, and my pass loaded offline inside the stadium.",
                  author: "Amina Yusuf",
                  role: "Festival Attendee",
                  org: "Lagos, Nigeria",
                  avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80",
                  rating: 5,
                  tag: "FAN VERIFIED"
                },
                {
                  quote: "We embedded the StraytTix checkout directly into our conference website. Over 1,200 tech passes sold without attendees ever leaving our branded domain. The developer APIs are top tier.",
                  author: "David Adeleke",
                  role: "Convener",
                  org: "AfroDev Summit 2026",
                  avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
                  rating: 5,
                  tag: "ORGANIZER VERIFIED"
                }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-3xl bg-white/[0.03] border border-white/10 p-7 sm:p-8 flex flex-col justify-between space-y-6 hover:border-white/20 transition-all"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-amber-400">
                        {[...Array(item.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-amber-400" />
                        ))}
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-zinc-300 font-bold">
                        {item.tag}
                      </span>
                    </div>
                    <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed italic">
                      &ldquo;{item.quote}&rdquo;
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                    <img
                      src={item.avatar}
                      alt={item.author}
                      className="w-10 h-10 rounded-full object-cover border border-white/10"
                    />
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-white leading-snug">{item.author}</p>
                      <p className="text-[11px] text-zinc-400">{item.role} • {item.org}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 7.6 FAQ ACCORDION: Enterprise Clarity on Security, Payouts & Transfers     */}
        {/* ========================================================================= */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 sm:py-28 bg-[#070709] text-white border-b border-white/5">
          <div className="max-w-4xl mx-auto space-y-12">
            
            <div className="text-center space-y-3 max-w-xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-xs font-mono font-bold text-zinc-300">
                <HelpCircle className="w-3.5 h-3.5 text-[#E31B23]" />
                <span>Frequently Asked Questions</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                Everything you need to know.
              </h2>
              <p className="text-zinc-400 text-xs sm:text-sm">
                Clear answers regarding ticket security, payouts, fees, and turnstile gate entry.
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  q: 'How fast do organizers receive ticket payouts?',
                  a: 'Payouts are automated via instant bank settlement. Once verified, sales revenue is transferred directly into your registered Nigerian bank account without waiting 7–14 days like legacy ticket brokers.'
                },
                {
                  q: 'How does StraytTix stop duplicate and scalped tickets?',
                  a: 'Every ticket contains a single-issue cryptographic barcode verified against our real-time database. When a ticket is scanned at the turnstile, it is immediately marked as redeemed across all gate scanners in under 0.2 seconds, making duplicate entry physically impossible.'
                },
                {
                  q: 'What if cellular reception drops at a packed venue?',
                  a: 'The StraytTix Companion Gate Terminal features intelligent offline caching. If internet connectivity drops at the venue gates, the app continues scanning and verifying valid attendee QR passes locally and synchronizes automatically once connection restores.'
                },
                {
                  q: 'Are there any hidden fees at attendee checkout?',
                  a: 'No. Unlike traditional ticketing sites that add 15–25% surprise fees on the final payment screen, StraytTix displays transparent, upfront pricing. Organizers also have the flexibility to absorb platform fees completely.'
                },
                {
                  q: 'Can attendees transfer tickets to friends?',
                  a: 'Yes. Secure peer-to-peer transfers are supported directly inside the Attendee Dashboard. Transferring a ticket re-encrypts and generates a brand-new barcode for the recipient while permanently voiding the sender’s pass.'
                },
                {
                  q: 'Do I need special turnstile hardware to scan passes?',
                  a: 'No special hardware is required. You and your security crew can use any standard smartphone running our high-speed gate scanner. You can also assign PIN codes to temporary bouncers so they can scan passes without accessing your financials.'
                }
              ].map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden transition-colors hover:border-white/20"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-white cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown className={`w-5 h-5 text-zinc-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-white' : ''}`} />
                    </button>
                    {isOpen && (
                      <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal border-t border-white/5">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 7.7 APP DOWNLOAD BAND: Apple & Google Companion Gateway                    */}
        {/* ========================================================================= */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20 bg-gradient-to-b from-[#070709] to-[#0A0A0F] text-white border-b border-white/5">
          <div className="max-w-5xl mx-auto rounded-3xl bg-zinc-950 border border-white/15 p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
            <div className="space-y-3 text-center md:text-left max-w-lg z-10">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#E31B23] font-bold">
                NATIVE MOBILE INFRASTRUCTURE
              </span>
              <h3 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                Take StraytTix anywhere.
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Download the attendee ticket wallet and the companion gate scanner terminal for iOS and Android.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 z-10">
              <Link
                to="/download"
                className="px-6 py-3.5 rounded-xl bg-white text-zinc-950 hover:bg-zinc-100 font-bold text-xs sm:text-sm transition-all flex items-center gap-2 shadow-lg"
              >
                <Smartphone className="w-4 h-4 text-[#E31B23]" />
                <span>iOS App Store</span>
              </Link>
              <Link
                to="/download"
                className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm transition-all border border-white/15 flex items-center gap-2"
              >
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>Google Play Store</span>
              </Link>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 8. FOR ORGANIZERS: Luxury Creator Monolith Card                            */}
        {/* ========================================================================= */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24 bg-zinc-100 dark:bg-[#070709] border-t border-zinc-200 dark:border-white/10 transition-colors duration-300">
          <div className="max-w-6xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.97, y: 36 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-[2.25rem] bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 text-white p-8 sm:p-14 lg:p-16 flex flex-col lg:flex-row lg:items-center justify-between gap-10 border border-white/15 shadow-2xl relative overflow-hidden"
            >
              
              {/* Subtle Ambient Radial Glow */}
              <div className="absolute -right-20 -bottom-20 w-[450px] h-[450px] bg-[#E31B23]/15 blur-[120px] rounded-full pointer-events-none" />

              <div className="max-w-xl space-y-4 relative z-10">
                <span className="text-xs font-mono uppercase tracking-widest text-[#E31B23] font-bold">
                  Event Infrastructure for Creators
                </span>
                <h2 className="text-3xl sm:text-5xl font-black tracking-[-0.03em] text-white leading-tight">
                  Hosting an event? Sell out with StraytTix.
                </h2>
                <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
                  Publish your event page in under 5 minutes. Manage ticket tiers, scan attendee passes with our companion gate terminal, and receive direct automated bank settlements.
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-mono text-zinc-400">
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Instant Bank Payouts</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Zero Surprise Buyer Fees</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Free Gate Check-in App</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 shrink-0 relative z-10">
                <Link
                  to="/organizer/events/create"
                  className="px-8 py-4 bg-[#E31B23] hover:bg-[#C9141B] text-white text-sm sm:text-base font-bold rounded-2xl transition-all shadow-xl hover:shadow-[0_12px_28px_-4px_rgba(227,27,35,0.6)] hover:-translate-y-0.5 active:scale-95 text-center cursor-pointer flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create an Event</span>
                </Link>
                <Link
                  to="/pricing"
                  className="px-8 py-4 bg-white/10 hover:bg-white/15 text-white text-sm sm:text-base font-semibold rounded-2xl transition-all border border-white/15 hover:border-white/30 hover:-translate-y-0.5 text-center cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>View Pricing</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>

            </motion.div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default Home;
