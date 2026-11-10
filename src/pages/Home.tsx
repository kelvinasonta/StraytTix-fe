import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import {
  Search,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  Building2,
  Smartphone,
  Wallet,
  Sparkles,
  Zap,
  Lock,
  ArrowUpRight
} from 'lucide-react';
import { formatCurrency } from '../utils/format';
import { useSettings } from '../context/SettingsContext';
import { getFeeConfig } from '../utils/fees';

export const Home: React.FC = () => {
  const { settings } = useSettings();
  const { percentage: feePct, fixed: feeFixed } = getFeeConfig(settings);

  const [searchQuery, setSearchQuery] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Interactive Revenue & Fee Calculator States
  const [calcTicketCount, setCalcTicketCount] = useState<number>(500);
  const [calcTicketPrice, setCalcTicketPrice] = useState<number>(10000); // ₦10,000 standard ticket
  const [calcAbsorbFee, setCalcAbsorbFee] = useState<boolean>(false);

  const navigate = useNavigate();

  // Fee calculation mechanics (dynamically fetched from AppSettings):
  const grossRevenue = calcTicketCount * calcTicketPrice;
  const rawFeePerTicket = (calcTicketPrice * (feePct / 100)) + (calcTicketPrice > 0 ? feeFixed : 0);
  const cappedFeePerTicket = Math.min(rawFeePerTicket, 5000);
  const totalPlatformFees = calcTicketCount * cappedFeePerTicket;
  const organizerTakeHome = calcAbsorbFee ? Math.max(0, grossRevenue - totalPlatformFees) : grossRevenue;
  const buyerPaysPerTicket = calcAbsorbFee ? calcTicketPrice : calcTicketPrice + cappedFeePerTicket;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    navigate(`/discover?${params.toString()}`);
  };

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-[#070709] text-zinc-900 dark:text-zinc-100 flex flex-col justify-between selection:bg-[#E31B23] selection:text-white antialiased transition-colors duration-300">
      <Navbar />

      <main className="flex-1 -mt-16">
        {/* ========================================================================= */}
        {/* 1. CINEMATIC HERO: Authentic Photography, Quiet Editorial Typographic Lockup */}
        {/*    Google / Stripe / Jetron Caliber: Clean, confident, 0 gimmicks         */}
        {/* ========================================================================= */}
        <section className="relative min-h-[90dvh] w-full flex flex-col justify-center items-center text-center px-4 sm:px-6 lg:px-8 pt-32 pb-24 overflow-hidden border-b border-zinc-200/80 dark:border-white/5 bg-[#070709]">
          {/* High-Fidelity Cinematic Background Video */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Background Video with Instant Black Surface Fallback (No Unsplash Flash) */}
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              className="w-full h-full object-cover object-center scale-100 opacity-80 transition-opacity duration-700 bg-[#070709]"
            >
              <source src="/videos/hero-festival.mp4" type="video/mp4" />
              <source src="https://assets.mixkit.co/videos/14088/14088-720.mp4" type="video/mp4" />
            </video>

            {/* Dark Overlay Layer - Subtle top fade allowing video to show right through transparent navbar */}
            <div className="absolute inset-0 bg-black/45 z-[1]" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#070709] via-black/30 to-black/20 z-[2]" />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto space-y-8 flex flex-col items-center">
            {/* Quiet, credible status pill */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E31B23]" />
              <span className="text-[11px] font-medium tracking-wide text-zinc-300">
                The trusted platform for live events &amp; instant ticketing
              </span>
            </div>

            {/* Main Editorial Headline: Clean, authoritative, balanced */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-[1.08] text-balance max-w-3xl">
              Attending and creating events has never been easier.
            </h1>

            {/* Supporting Sentence */}
            <p className="text-zinc-400 text-base sm:text-lg md:text-xl font-normal leading-relaxed max-w-2xl text-balance">
              Find your next concert, festival, or conference with zero surprise checkout fees. Or launch your own event and get paid directly to your bank account.
            </p>

            {/* Direct Dual CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 w-full sm:w-auto">
              <Link
                to="/discover"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-[#E31B23] hover:bg-[#C9141B] text-white font-medium text-sm sm:text-base transition-all shadow-[0_8px_24px_-4px_rgba(227,27,35,0.45)] hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer"
              >
                <span>Discover events</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/organizer/events/create"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-white/[0.05] hover:bg-white/[0.09] text-white font-medium text-sm sm:text-base border border-white/15 transition-all hover:-translate-y-0.5 active:scale-[0.98]"
              >
                <span>Create an event</span>
              </Link>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. FLOATING CLEAN SEARCH BAR                                              */}
        {/* ========================================================================= */}
        <section className="relative z-30 px-4 sm:px-6 lg:px-8 -my-7 sm:-my-8">
          <div className="max-w-3xl mx-auto">
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center gap-2 p-1.5 sm:p-2 rounded-2xl bg-white dark:bg-[#111217] border border-zinc-200/80 dark:border-white/15 shadow-xl dark:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.8)] focus-within:border-[#E31B23]/40 dark:focus-within:border-white/30 transition-all"
            >
              <div className="flex items-center gap-3 px-3 py-1 flex-1 min-w-0">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search events, artists, venues, or cities..."
                  className="w-full bg-transparent text-sm sm:text-base text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 outline-none border-none ring-0 focus:outline-none focus:ring-0 font-normal truncate"
                />
              </div>

              <button
                type="submit"
                aria-label="Search events"
                className="px-6 py-2.5 sm:py-3 bg-[#E31B23] hover:bg-[#C9141B] text-white text-xs sm:text-sm font-medium rounded-xl transition-all active:scale-95 cursor-pointer flex items-center gap-2 shrink-0"
              >
                <span>Search</span>
                <ArrowRight className="w-3.5 h-3.5 hidden sm:inline" />
              </button>
            </form>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. TRUSTED MARQUEE: Logos-Only Vector Stream                             */}
        {/* ========================================================================= */}
        <section className="pt-20 pb-14 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-[#070709] border-b border-zinc-200/80 dark:border-white/5 overflow-hidden transition-colors duration-300">
          <div className="max-w-6xl mx-auto space-y-7">
            <p className="text-center text-xs font-semibold tracking-widest text-zinc-500 dark:text-zinc-400 uppercase">
              Trusted by leading promoters and venues
            </p>

            <div className="relative w-full overflow-hidden py-3 [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
              <div className="animate-marquee items-center gap-12 sm:gap-16 will-change-transform opacity-75 hover:opacity-100 transition-opacity">
                {[
                  // 1. Native Sound System (clean editorial geometric badge)
                  (
                    <div key="native" className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-colors">
                      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-current stroke-2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M8 12h8M12 8v8" />
                      </svg>
                      <span className="font-black text-sm tracking-tighter uppercase font-mono">NATIVE</span>
                    </div>
                  ),
                  // 2. Flytime Fest
                  (
                    <div key="flytime" className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-colors">
                      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                        <polygon points="12,2 22,22 12,17 2,22" />
                      </svg>
                      <span className="font-extrabold text-sm tracking-tight uppercase">FLYTIME</span>
                    </div>
                  ),
                  // 3. Eko Convention Centre
                  (
                    <div key="eko" className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-colors">
                      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-current stroke-2">
                        <rect x="3" y="3" width="18" height="18" rx="3" />
                        <circle cx="12" cy="12" r="4" />
                      </svg>
                      <span className="font-black text-sm tracking-widest uppercase">EKO ARENA</span>
                    </div>
                  ),
                  // 4. Livespot X
                  (
                    <div key="livespot" className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-colors">
                      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                        <path d="M12 2L2 22h7l3-6 3 6h7z" />
                      </svg>
                      <span className="font-black text-sm tracking-tight uppercase">LIVESPOT X</span>
                    </div>
                  ),
                  // 5. Mainland BlockParty
                  (
                    <div key="mainland" className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-colors">
                      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-current stroke-2">
                        <rect x="2" y="2" width="9" height="9" rx="1.5" />
                        <rect x="13" y="2" width="9" height="9" rx="1.5" />
                        <rect x="2" y="13" width="9" height="9" rx="1.5" />
                        <rect x="13" y="13" width="9" height="9" rx="1.5" fill="currentColor" />
                      </svg>
                      <span className="font-extrabold text-sm tracking-tighter uppercase font-mono">BLOCKPARTY</span>
                    </div>
                  ),
                  // 6. Hard Rock Live
                  (
                    <div key="hardrock" className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-colors">
                      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-current stroke-2">
                        <circle cx="12" cy="12" r="9" />
                        <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" />
                      </svg>
                      <span className="font-black text-sm tracking-wide uppercase">HARD ROCK</span>
                    </div>
                  ),
                  // 7. Afrochella / AfroFuture
                  (
                    <div key="afrochella" className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-colors">
                      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                        <path d="M12 2l2.4 7.4h7.6l-6.2 4.5 2.4 7.4-6.2-4.5-6.2 4.5 2.4-7.4-6.2-4.5h7.6z" />
                      </svg>
                      <span className="font-black text-sm tracking-tight uppercase">AFROFUTURE</span>
                    </div>
                  ),
                  // 8. Terra Kulture
                  (
                    <div key="terra" className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-colors">
                      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-current stroke-2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                      <span className="font-bold text-sm tracking-wider uppercase">TERRA KULTURE</span>
                    </div>
                  )
                ].concat([
                  // Duplicate set for seamless continuous marquee loop
                  (
                    <div key="native-2" className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-colors">
                      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-current stroke-2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M8 12h8M12 8v8" />
                      </svg>
                      <span className="font-black text-sm tracking-tighter uppercase font-mono">NATIVE</span>
                    </div>
                  ),
                  (
                    <div key="flytime-2" className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-colors">
                      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                        <polygon points="12,2 22,22 12,17 2,22" />
                      </svg>
                      <span className="font-extrabold text-sm tracking-tight uppercase">FLYTIME</span>
                    </div>
                  ),
                  (
                    <div key="eko-2" className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-colors">
                      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-current stroke-2">
                        <rect x="3" y="3" width="18" height="18" rx="3" />
                        <circle cx="12" cy="12" r="4" />
                      </svg>
                      <span className="font-black text-sm tracking-widest uppercase">EKO ARENA</span>
                    </div>
                  ),
                  (
                    <div key="livespot-2" className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-colors">
                      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                        <path d="M12 2L2 22h7l3-6 3 6h7z" />
                      </svg>
                      <span className="font-black text-sm tracking-tight uppercase">LIVESPOT X</span>
                    </div>
                  ),
                  (
                    <div key="mainland-2" className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-colors">
                      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-current stroke-2">
                        <rect x="2" y="2" width="9" height="9" rx="1.5" />
                        <rect x="13" y="2" width="9" height="9" rx="1.5" />
                        <rect x="2" y="13" width="9" height="9" rx="1.5" />
                        <rect x="13" y="13" width="9" height="9" rx="1.5" fill="currentColor" />
                      </svg>
                      <span className="font-extrabold text-sm tracking-tighter uppercase font-mono">BLOCKPARTY</span>
                    </div>
                  ),
                  (
                    <div key="hardrock-2" className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-colors">
                      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-current stroke-2">
                        <circle cx="12" cy="12" r="9" />
                        <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" />
                      </svg>
                      <span className="font-black text-sm tracking-wide uppercase">HARD ROCK</span>
                    </div>
                  ),
                  (
                    <div key="afrochella-2" className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-colors">
                      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                        <path d="M12 2l2.4 7.4h7.6l-6.2 4.5 2.4 7.4-6.2-4.5-6.2 4.5 2.4-7.4-6.2-4.5h7.6z" />
                      </svg>
                      <span className="font-black text-sm tracking-tight uppercase">AFROFUTURE</span>
                    </div>
                  ),
                  (
                    <div key="terra-2" className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-colors">
                      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-current stroke-2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                      <span className="font-bold text-sm tracking-wider uppercase">TERRA KULTURE</span>
                    </div>
                  )
                ])}
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. PRODUCT PILLAR I: FOR ATTENDEES (Jetron Pacing & Tone)                 */}
        {/* ========================================================================= */}
        <section className="py-24 sm:py-32 px-4 sm:px-6 lg:px-12 xl:px-16 border-b border-zinc-200/80 dark:border-white/5 bg-slate-50 dark:bg-[#070709] transition-colors duration-300">
          <div className="max-w-6xl mx-auto space-y-16">
            <div className="max-w-2xl space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#E31B23]">
                For Attendees
              </span>
              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-zinc-950 dark:text-white leading-tight">
                A seamless way to experience the events you love.
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 text-base sm:text-lg leading-relaxed">
                From finding curated nightlife to walking through venue gates with one tap, every detail is engineered for simplicity.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Attendee Feature 1 */}
              <div className="space-y-4 p-8 rounded-3xl bg-white dark:bg-white/[0.02] border border-zinc-200/80 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20 shadow-xs dark:shadow-none transition-all flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-white/[0.05] border border-zinc-200/80 dark:border-white/10 flex items-center justify-center text-zinc-900 dark:text-white">
                    <ShieldCheck className="w-5 h-5 text-[#E31B23]" />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-950 dark:text-white tracking-tight">
                    Total price transparency
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    The price you see is the final price you pay. No hidden service charges, processing add-ons, or surprise costs added at checkout.
                  </p>
                </div>
                <div className="pt-4 border-t border-zinc-100 dark:border-white/5 text-xs text-zinc-500 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Guaranteed upfront checkout total</span>
                </div>
              </div>

              {/* Attendee Feature 2 */}
              <div className="space-y-4 p-8 rounded-3xl bg-white dark:bg-white/[0.02] border border-zinc-200/80 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20 shadow-xs dark:shadow-none transition-all flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-white/[0.05] border border-zinc-200/80 dark:border-white/10 flex items-center justify-center text-zinc-900 dark:text-white">
                    <Smartphone className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-950 dark:text-white tracking-tight">
                    Instant offline passes
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Access your tickets anytime, anywhere. Passes save directly to your account and mobile device, functioning seamlessly even with zero cellular signal.
                  </p>
                </div>
                <div className="pt-4 border-t border-zinc-100 dark:border-white/5 text-xs text-zinc-500 font-medium flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                  <span>Works without stadium Wi-Fi</span>
                </div>
              </div>

              {/* Attendee Feature 3 */}
              <div className="space-y-4 p-8 rounded-3xl bg-white dark:bg-white/[0.02] border border-zinc-200/80 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20 shadow-xs dark:shadow-none transition-all flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-white/[0.05] border border-zinc-200/80 dark:border-white/10 flex items-center justify-center text-zinc-900 dark:text-white">
                    <Wallet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-950 dark:text-white tracking-tight">
                    Safe peer-to-peer transfers
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Plans changed? Transfer your ticket directly to a friend. Each transfer re-generates an authentic pass for the recipient and retires the previous one.
                  </p>
                </div>
                <div className="pt-4 border-t border-zinc-100 dark:border-white/5 text-xs text-zinc-500 font-medium flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Anti-counterfeiting verification</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/discover"
                className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-950 dark:text-white hover:text-[#E31B23] dark:hover:text-[#E31B23] transition-colors group"
              >
                <span>Browse upcoming events in your city</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. PRODUCT PILLAR II: FOR ORGANIZERS (Jetron Pacing & Tone)               */}
        {/* ========================================================================= */}
        <section className="py-24 sm:py-32 px-4 sm:px-6 lg:px-12 xl:px-16 border-b border-zinc-200/80 dark:border-white/5 bg-white dark:bg-[#090A0E] transition-colors duration-300">
          <div className="max-w-6xl mx-auto space-y-16">
            <div className="max-w-2xl space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#E31B23]">
                For Organizers &amp; Promoters
              </span>
              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-zinc-950 dark:text-white leading-tight">
                Everything you need to sell out your next event.
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 text-base sm:text-lg leading-relaxed">
                Powerful tools to publish events in minutes, track live attendee check-ins, and receive automated bank settlements without multi-week delays.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Organizer Feature 1 */}
              <div className="space-y-4 p-8 rounded-3xl bg-zinc-50/70 dark:bg-white/[0.02] border border-zinc-200/80 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20 transition-all flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-white dark:bg-white/[0.05] border border-zinc-200/80 dark:border-white/10 flex items-center justify-center text-zinc-900 dark:text-white">
                    <Building2 className="w-5 h-5 text-[#E31B23]" />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-950 dark:text-white tracking-tight">
                    Direct automated payouts
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Ticket proceeds transfer straight to your verified bank account. No lengthy holding periods or escrow bottlenecks—receive your funds quickly and reliably.
                  </p>
                </div>
                <div className="pt-4 border-t border-zinc-200/80 dark:border-white/5 text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Direct settlement to any Nigerian bank</span>
                </div>
              </div>

              {/* Organizer Feature 2 */}
              <div className="space-y-4 p-8 rounded-3xl bg-zinc-50/70 dark:bg-white/[0.02] border border-zinc-200/80 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20 transition-all flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-white dark:bg-white/[0.05] border border-zinc-200/80 dark:border-white/10 flex items-center justify-center text-zinc-900 dark:text-white">
                    <Sparkles className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-950 dark:text-white tracking-tight">
                    Live check-in scanning
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Equip your gate crew with fast barcode scanning directly on their phones. Keep long admission lines moving with instantaneous validation.
                  </p>
                </div>
                <div className="pt-4 border-t border-zinc-200/80 dark:border-white/5 text-xs text-zinc-500 dark:text-zinc-400 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Sub-second gate verification</span>
                </div>
              </div>

              {/* Organizer Feature 3 */}
              <div className="space-y-4 p-8 rounded-3xl bg-zinc-50/70 dark:bg-white/[0.02] border border-zinc-200/80 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20 transition-all flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-white dark:bg-white/[0.05] border border-zinc-200/80 dark:border-white/10 flex items-center justify-center text-zinc-900 dark:text-white">
                    <Lock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-950 dark:text-white tracking-tight">
                    Multi-tier inventory &amp; codes
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Configure Early Bird, VIP, Backstage passes, and group packages with custom capacities, scheduled release times, and promo codes.
                  </p>
                </div>
                <div className="pt-4 border-t border-zinc-200/80 dark:border-white/5 text-xs text-zinc-500 dark:text-zinc-400 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Real-time inventory locks</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Link
                to="/organizer/events/create"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-[#E31B23] hover:bg-[#C9141B] text-white font-medium text-sm transition-all shadow-[0_8px_24px_-4px_rgba(227,27,35,0.4)]"
              >
                <span>Create an event in minutes</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/pricing"
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full bg-zinc-100 dark:bg-white/[0.04] hover:bg-zinc-200/80 dark:hover:bg-white/[0.08] text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white font-medium text-sm border border-zinc-200 dark:border-white/10 transition-all"
              >
                <span>Explore organizer pricing</span>
              </Link>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 6. TRANSPARENT FEE CALCULATOR: Crisp, Stripe-Level Precision              */}
        {/* ========================================================================= */}
        <section className="py-24 sm:py-32 px-4 sm:px-6 lg:px-12 xl:px-16 border-b border-zinc-200/80 dark:border-white/5 bg-slate-50 dark:bg-[#070709] transition-colors duration-300">
          <div className="max-w-5xl mx-auto space-y-12">
            <div className="text-center max-w-xl mx-auto space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#E31B23]">
                Transparent Pricing
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-950 dark:text-white leading-tight">
                Calculate your exact ticket earnings.
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base leading-relaxed">
                Clear pricing with no surprises. Simple {feePct}% + ₦{feeFixed} platform fee with no setup or monthly software subscriptions.
              </p>
            </div>

            <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-[#0D0E12] border border-zinc-200/80 dark:border-white/10 shadow-xl dark:shadow-2xl">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">

                {/* Sliders */}
                <div className="lg:col-span-6 space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-700 dark:text-zinc-300 font-medium">Expected ticket sales</span>
                      <span className="font-semibold text-zinc-950 dark:text-white font-mono text-base">
                        {calcTicketCount.toLocaleString()} tickets
                      </span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="5000"
                      step="50"
                      value={calcTicketCount}
                      onChange={(e) => setCalcTicketCount(Number(e.target.value))}
                      aria-label="Ticket sales quantity"
                      className="w-full accent-[#E31B23] h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[11px] text-zinc-500 font-mono">
                      <span>50</span>
                      <span>2,500</span>
                      <span>5,000+</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-700 dark:text-zinc-300 font-medium">Average ticket price</span>
                      <span className="font-semibold text-zinc-950 dark:text-white font-mono text-base">
                        {formatCurrency(calcTicketPrice)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1000"
                      max="100000"
                      step="1000"
                      value={calcTicketPrice}
                      onChange={(e) => setCalcTicketPrice(Number(e.target.value))}
                      aria-label="Average ticket price"
                      className="w-full accent-[#E31B23] h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[11px] text-zinc-500 font-mono">
                      <span>₦1,000</span>
                      <span>₦50,000</span>
                      <span>₦100,000</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/5 flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-zinc-900 dark:text-zinc-200">Pass platform fee to buyer?</p>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        {calcAbsorbFee ? `Organizer absorbs standard ${feePct}% + ₦${feeFixed} fee` : 'Attendee covers fee at checkout (you keep 100% of price)'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCalcAbsorbFee(!calcAbsorbFee)}
                      className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer p-0.5 ${!calcAbsorbFee ? 'bg-[#E31B23]' : 'bg-zinc-300 dark:bg-zinc-700'
                        }`}
                      aria-label="Toggle platform fee pass-through"
                    >
                      <span className={`block w-5 h-5 rounded-full bg-white transition-transform ${!calcAbsorbFee ? 'translate-x-5' : 'translate-x-0'
                        }`} />
                    </button>
                  </div>
                </div>

                {/* Ledger Summary */}
                <div className="lg:col-span-6 p-6 sm:p-8 rounded-2xl bg-zinc-50 dark:bg-[#14151B] border border-zinc-200/80 dark:border-white/10 space-y-6">
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Estimated Take-Home Payout
                    </span>
                    <div className="text-3xl sm:text-4xl font-bold font-mono text-zinc-950 dark:text-white tracking-tight">
                      {formatCurrency(organizerTakeHome)}
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Transferred directly to your registered bank account.
                    </p>
                  </div>

                  <hr className="border-zinc-200 dark:border-white/10" />

                  <div className="space-y-2.5 text-xs sm:text-sm font-mono">
                    <div className="flex justify-between items-center text-zinc-600 dark:text-zinc-400">
                      <span>Gross ticket volume:</span>
                      <span className="text-zinc-950 dark:text-white font-medium">{formatCurrency(grossRevenue)}</span>
                    </div>
                    <div className="flex justify-between items-center text-zinc-600 dark:text-zinc-400">
                      <span>Platform processing ({feePct}% + ₦{feeFixed}):</span>
                      <span className="text-zinc-800 dark:text-zinc-300">{formatCurrency(totalPlatformFees)}</span>
                    </div>
                    <div className="flex justify-between items-center text-zinc-600 dark:text-zinc-400">
                      <span>Attendee checkout price:</span>
                      <span className="text-zinc-950 dark:text-white font-medium">{formatCurrency(buyerPaysPerTicket)}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Link
                      to="/organizer/events/create"
                      className="w-full py-3.5 rounded-xl bg-[#E31B23] hover:bg-[#C9141B] text-white font-medium text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                    >
                      <span>Start selling tickets</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 7. REAL TESTIMONIALS & USER REVIEWS                                       */}
        {/* ========================================================================= */}
        <section className="py-24 sm:py-32 px-4 sm:px-6 lg:px-12 xl:px-16 border-b border-zinc-200/80 dark:border-white/5 bg-slate-50 dark:bg-[#070709] transition-colors duration-300">
          <div className="max-w-6xl mx-auto space-y-16">
            <div className="max-w-xl space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#E31B23]">
                Community
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-950 dark:text-white leading-tight">
                Trusted by thousands of event goers and organizers.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  quote: "We scanned over 3,500 attendees at our festival gates without a single hiccup. Fast scanner response and instant payout reconciliation made the whole operation painless.",
                  author: "Chuka Obi",
                  title: "Operations Director",
                  event: "Lagos Live Fest"
                },
                {
                  quote: "Finally a ticketing platform that doesn't slap an extra 15% charge onto your cart at the last second. The ticket was on my phone in seconds and loaded without network at the venue.",
                  author: "Amina Yusuf",
                  title: "Festival Goer",
                  event: "Attended Neon Horizon"
                },
                {
                  quote: "Creating multiple ticket tiers and monitoring sales in real-time gave us complete control over our capacity. Direct automated settlements to our bank account took all the stress away.",
                  author: "David Adeleke",
                  title: "Lead Convener",
                  event: "AfroDev Conference"
                }
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-8 rounded-3xl bg-white dark:bg-white/[0.02] border border-zinc-200/80 dark:border-white/10 shadow-xs dark:shadow-none flex flex-col justify-between space-y-6"
                >
                  <p className="text-zinc-700 dark:text-zinc-300 text-sm sm:text-base leading-relaxed">
                    &ldquo;{item.quote}&rdquo;
                  </p>
                  <div className="pt-4 border-t border-zinc-100 dark:border-white/5">
                    <p className="text-sm font-semibold text-zinc-950 dark:text-white">{item.author}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{item.title} &bull; {item.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 8. FREQUENTLY ASKED QUESTIONS                                             */}
        {/* ========================================================================= */}
        <section className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#090A0E] border-b border-zinc-200/80 dark:border-white/5 transition-colors duration-300">
          <div className="max-w-3xl mx-auto space-y-12">
            <div className="text-center space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#E31B23]">
                FAQ
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-950 dark:text-white leading-tight">
                Frequently asked questions.
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base">
                Everything you need to know about getting started with StraytTix.
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  q: 'How fast do organizers receive ticket payouts?',
                  a: 'Payouts are automated via instant bank settlement. Once your organization is verified, ticket sales revenue transfers directly into your registered bank account without prolonged escrow holding periods.'
                },
                {
                  q: 'Are there hidden fees at attendee checkout?',
                  a: 'No. StraytTix is built on total price honesty. All applicable fees are calculated and clearly shown before you initiate checkout. Organizers can also choose to absorb fees entirely.'
                },
                {
                  q: 'What happens if cellular reception is poor at the venue?',
                  a: 'Passes are stored offline on your device once purchased or viewed. For event organizers, the mobile check-in scanner operates smoothly offline and synchronizes attendance counts as soon as connectivity restores.'
                },
                {
                  q: 'Can attendees transfer tickets to friends?',
                  a: 'Yes. Secure ticket transfer is built into the attendee dashboard. When transferred, a fresh barcode is issued to the recipient and the original ticket is instantly deactivated to avoid duplicate entry.'
                },
                {
                  q: 'How much does StraytTix cost for free events?',
                  a: 'Free events are completely free to host. StraytTix never charges platform or processing fees on zero-cost tickets.'
                }
              ].map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-2xl bg-zinc-50/70 dark:bg-white/[0.02] border border-zinc-200/80 dark:border-white/10 overflow-hidden transition-colors hover:border-zinc-300 dark:hover:border-white/15"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-zinc-950 dark:text-white cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-zinc-950 dark:text-white' : ''}`} />
                    </button>
                    {isOpen && (
                      <div className="px-5 sm:px-6 pb-6 pt-1 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal border-t border-zinc-200/60 dark:border-white/5">
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
        {/* 9. FINAL CALLOUT: Clean, Focused Invitation                               */}
        {/* ========================================================================= */}
        <section className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-[#070709] transition-colors duration-300">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-zinc-950 dark:text-white leading-tight">
              Ready to host your next event?
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
              Create your event page in under five minutes. Manage ticket tiers, admit guests with instant barcode scanning, and receive automated payouts.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                to="/organizer/events/create"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#E31B23] hover:bg-[#C9141B] text-white font-medium text-sm sm:text-base transition-all shadow-[0_8px_24px_-4px_rgba(227,27,35,0.4)]"
              >
                <span>Create an event</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/discover"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-white dark:bg-white/[0.05] hover:bg-zinc-100 dark:hover:bg-white/[0.09] text-zinc-900 dark:text-white font-medium text-sm sm:text-base border border-zinc-200 dark:border-white/15 transition-all"
              >
                <span>Explore events</span>
                <ArrowUpRight className="w-4 h-4 text-zinc-400" />
              </Link>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default Home;
