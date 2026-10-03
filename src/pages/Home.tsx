import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { 
  Search, 
  Ticket, 
  Calendar, 
  Globe, 
  ShieldCheck, 
  Layers, 
  Sliders, 
  Users,
  ArrowRight,
  Sparkles,
  Music,
  Briefcase,
  Mic,
  Cpu,
  Trophy,
  PartyPopper,
  TrendingUp
} from 'lucide-react';

export const Home: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/discover?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/discover');
    }
  };

  const categories = [
    { name: 'Music', icon: Music, count: '140+ events' },
    { name: 'Conferences', icon: Briefcase, count: '45+ events' },
    { name: 'Comedy', icon: Mic, count: '30+ events' },
    { name: 'Technology', icon: Cpu, count: '65+ events' },
    { name: 'Sports', icon: Trophy, count: '24+ events' },
    { name: 'Nightlife', icon: PartyPopper, count: '80+ events' },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FB] text-[#111827] flex flex-col justify-between">
      <Navbar />

      <main className="flex-1">
        {/* ========================================================================= */}
        {/* 1. HERO SECTION (Matching top-left mockup) */}
        {/* ========================================================================= */}
        <section className="relative px-6 pt-10 pb-16 md:pt-16 md:pb-24 overflow-hidden">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Hero Content */}
            <div className="lg:col-span-6 space-y-6">
              {/* Badge Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FEF2F2] border border-[#FEE2E2] text-xs font-bold text-[#E31B23]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E31B23] animate-pulse" />
                <span>Discover • Book • Experience</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-[62px] font-black text-[#111827] leading-[1.08] tracking-tight">
                Find Amazing <br />
                <span className="text-[#E31B23]">Events Near You</span>
              </h1>

              {/* Subtitle */}
              <p className="text-zinc-600 text-base sm:text-lg leading-relaxed max-w-xl font-normal">
                From concerts and festivals to conferences, workshops, and community events — get your tickets, or post your own event for free.
              </p>

              {/* Large Marketplace Search Bar */}
              <form 
                onSubmit={handleSearchSubmit}
                className="bg-white p-2 sm:p-2.5 rounded-2xl sm:rounded-full border border-zinc-200 shadow-[0_8px_30px_rgba(0,0,0,0.08)] flex flex-col sm:flex-row items-center gap-2 max-w-xl transition-all hover:border-zinc-300 focus-within:border-[#E31B23] focus-within:ring-2 focus-within:ring-[#E31B23]/10"
              >
                <div className="flex items-center gap-3 px-4 py-2.5 w-full">
                  <Search className="w-5 h-5 text-zinc-400 flex-shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search events, venues, artists, or cities..."
                    className="w-full bg-transparent text-sm sm:text-base text-zinc-900 placeholder-zinc-400 outline-none font-medium"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3.5 bg-[#E31B23] hover:bg-[#B91C1C] text-white text-sm sm:text-base font-black rounded-xl sm:rounded-full transition-all shadow-md flex-shrink-0 cursor-pointer"
                >
                  Search
                </button>
              </form>

              {/* 3 Trust / Feature Badges */}
              <div className="grid grid-cols-3 gap-4 sm:gap-6 pt-4 border-t border-zinc-200/80 max-w-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#FEF2F2] text-[#E31B23] flex items-center justify-center flex-shrink-0">
                    <Ticket className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-zinc-900 truncate">Buy Tickets</p>
                    <p className="text-xs text-zinc-500 font-medium truncate">Instant & Secure</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#FEF2F2] text-[#E31B23] flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-zinc-900 truncate">List Events</p>
                    <p className="text-xs text-zinc-500 font-medium truncate">Free & Simple</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#FEF2F2] text-[#E31B23] flex items-center justify-center flex-shrink-0">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-zinc-900 truncate">Discover</p>
                    <p className="text-xs text-zinc-500 font-medium truncate">Local & Global</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Cinematic Hero Graphic */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(227,27,35,0.15)] border border-zinc-200/80 aspect-[4/3] sm:aspect-[16/11]">
                <img
                  src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=85"
                  alt="Concert Crowd Event"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Floating Bottom Card */}
                <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-white/40 shadow-2xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Date Badge */}
                    <div className="w-12 h-12 rounded-xl bg-[#E31B23] text-white flex flex-col items-center justify-center flex-shrink-0 shadow-sm">
                      <span className="text-[10px] font-bold uppercase tracking-wider leading-none">APR</span>
                      <span className="text-lg font-black leading-none mt-0.5">12</span>
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-zinc-950 truncate">Live Music Festival 2026</h4>
                      <p className="text-xs text-zinc-500 truncate">Lagos, Nigeria • Apr 12, 2026</p>
                    </div>
                  </div>

                  <Link
                    to="/events/afro-vibes-live-in-lagos"
                    className="px-4 py-2 bg-[#E31B23] hover:bg-[#B91C1C] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex-shrink-0 cursor-pointer"
                  >
                    Get Tickets
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. CATEGORIES BAR */}
        {/* ========================================================================= */}
        <section className="px-6 py-8 border-y border-zinc-200/60 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((cat) => (
                <Link
                  key={cat.name}
                  to={`/discover?category=${encodeURIComponent(cat.name)}`}
                  className="flex items-center gap-3.5 p-4 rounded-2xl bg-zinc-50 hover:bg-[#FEF2F2] border border-zinc-200/80 hover:border-[#FEE2E2] transition-all group"
                >
                  <div className="w-11 h-11 rounded-2xl bg-white group-hover:bg-[#E31B23] group-hover:text-white text-zinc-700 flex items-center justify-center shadow-xs transition-colors flex-shrink-0">
                    <cat.icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-zinc-900 group-hover:text-[#E31B23] transition-colors truncate">
                      {cat.name}
                    </p>
                    <p className="text-xs text-zinc-400 font-medium truncate">{cat.count}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2.5 SPONSOR & TRUSTED PARTNERS LOGO SECTION */}
        {/* ========================================================================= */}
        <section className="px-6 py-12 border-b border-zinc-200/60 bg-white">
          <div className="max-w-7xl mx-auto space-y-6 text-center">
            <p className="text-xs font-black uppercase tracking-widest text-zinc-400">
              Trusted by World-Class Creators, Global Brands & Tech Summits
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-75 grayscale hover:grayscale-0 transition-all">
              <span className="text-lg sm:text-xl font-black tracking-tight text-zinc-800 hover:text-[#E31B23] transition-colors">
                Spotify Live
              </span>
              <span className="text-lg sm:text-xl font-black tracking-tight text-zinc-800 hover:text-[#E31B23] transition-colors">
                Paystack
              </span>
              <span className="text-lg sm:text-xl font-black tracking-tight text-zinc-800 hover:text-[#E31B23] transition-colors">
                Flutterwave
              </span>
              <span className="text-lg sm:text-xl font-black tracking-tight text-zinc-800 hover:text-[#E31B23] transition-colors">
                Red Bull
              </span>
              <span className="text-lg sm:text-xl font-black tracking-tight text-zinc-800 hover:text-[#E31B23] transition-colors">
                Google Developers
              </span>
              <span className="text-lg sm:text-xl font-black tracking-tight text-zinc-800 hover:text-[#E31B23] transition-colors">
                TechCabal
              </span>
              <span className="text-lg sm:text-xl font-black tracking-tight text-zinc-800 hover:text-[#E31B23] transition-colors">
                Ingressive Capital
              </span>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. SAAS PLATFORM ARCHITECTURE & PRODUCT PREVIEW (Replacing Popular Events) */}
        {/* ========================================================================= */}
        <section className="px-6 py-20 md:py-28 bg-[#F8F9FB]">
          <div className="max-w-7xl mx-auto space-y-16">
            
            {/* Header */}
            <div className="max-w-3xl mx-auto text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FEF2F2] border border-[#FEE2E2] text-xs font-bold text-[#E31B23]">
                <Sparkles className="w-3.5 h-3.5" /> Next-Gen Event Infrastructure
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-zinc-950 tracking-tight leading-tight">
                Engineered for High-Scale Ticketing & Gate Operations
              </h2>
              <p className="text-zinc-600 text-base sm:text-lg font-normal leading-relaxed">
                Whether you're organizing an intimate 100-person tech workshop or a 30,000-seat stadium festival, Eventa provides the SaaS tools to sell, verify, and settle payments effortlessly.
              </p>
            </div>

            {/* Interactive SaaS Console Preview Card */}
            <div className="bg-[#0F172A] rounded-3xl p-6 sm:p-10 text-white shadow-2xl border border-zinc-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Console Mock Header */}
              <div className="flex items-center justify-between border-b border-zinc-800 pb-5 mb-8">
                <div className="flex items-center gap-2.5">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-500/80" />
                    <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <span className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <span className="text-xs font-mono text-zinc-400 ml-2">eventa-console-v2.live/organizer/analytics</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-emerald-400 font-mono">LIVE CLUSTER: ONLINE</span>
                </div>
              </div>

              {/* 3-Column SaaS Metric & Operational Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Gross Settlement Volume</span>
                  <p className="text-3xl font-black text-white">₦48,250,000</p>
                  <p className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>+34% vs previous event cycle</span>
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Instant QR Scans</span>
                  <p className="text-3xl font-black text-white">4,812 / 5,000</p>
                  <p className="text-xs text-zinc-400 font-medium">Avg latency: 0.18s per attendee</p>
                </div>

                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">API Webhook Uptime</span>
                  <p className="text-3xl font-black text-emerald-400">99.99%</p>
                  <p className="text-xs text-zinc-400 font-medium">0 dropped check-in events</p>
                </div>
              </div>
            </div>

            {/* 4 Core Pillars of the SaaS Platform */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
              <div className="p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-xs space-y-3 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-2xl bg-[#FEF2F2] text-[#E31B23] flex items-center justify-center font-bold">
                  <Ticket className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-zinc-950">Multi-Tier Engine</h3>
                <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                  Single passes, group tiers, invite-only passcodes, and hidden VIP tickets with automated capacity triggers.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-xs space-y-3 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-2xl bg-[#FEF2F2] text-[#E31B23] flex items-center justify-center font-bold">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-zinc-950">Next-Day Payouts</h3>
                <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                  Direct commercial bank settlement post-event. Automated reconciliation with zero surprise reserve holds.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-xs space-y-3 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-2xl bg-[#FEF2F2] text-[#E31B23] flex items-center justify-center font-bold">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-zinc-950">Developer API</h3>
                <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                  Full REST API, webhooks, and embeddable iframe checkout widgets for custom websites and mobile apps.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-xs space-y-3 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-2xl bg-[#FEF2F2] text-[#E31B23] flex items-center justify-center font-bold">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-zinc-950">Offline Gate Ops</h3>
                <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                  Turnkey camera scanning with local offline sync. Eliminates gate delays even in remote low-network venues.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. ARE YOU AN EVENT ORGANIZER? (Red Promotional Banner) */}
        {/* ========================================================================= */}
        <section className="px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="relative rounded-3xl bg-[#E31B23] text-white p-8 sm:p-14 md:p-16 overflow-hidden shadow-2xl">
              {/* Background crowd silhouette */}
              <div 
                className="absolute right-0 top-0 bottom-0 w-full lg:w-1/2 opacity-25 mix-blend-luminosity bg-cover bg-right pointer-events-none"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80')`
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#E31B23] via-[#E31B23]/95 to-transparent pointer-events-none" />

              <div className="relative z-10 max-w-xl space-y-5">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                  Are You an Event Organizer?
                </h2>
                <p className="text-red-100 text-base sm:text-lg font-medium leading-relaxed">
                  Reach more people, sell tickets, track gate check-ins, and manage your event all in one place. It's free to get started!
                </p>

                <div className="pt-3">
                  <Link
                    to="/organizer/events/create"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-zinc-100 text-[#E31B23] text-sm sm:text-base font-black rounded-full transition-all shadow-lg cursor-pointer hover:shadow-xl hover:scale-105"
                  >
                    Post Your Event <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Decorative accent on right */}
              <div className="hidden lg:block absolute right-16 top-1/2 -translate-y-1/2 text-right pointer-events-none select-none">
                <p className="font-serif italic text-3xl text-red-200/70 leading-none">Your Event</p>
                <p className="font-serif italic text-4xl text-white font-bold leading-none mt-2">Our Platform</p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. WHY CHOOSE EVENTA? (4 Clean Feature Blocks) */}
        {/* ========================================================================= */}
        <section className="px-6 py-16 md:py-20 bg-white border-t border-zinc-200/60">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-2.5">
              <h2 className="text-3xl sm:text-4xl font-black text-zinc-950 tracking-tight">
                Why Choose Eventa?
              </h2>
              <p className="text-zinc-500 text-base font-medium">
                The modern standard for discovering memorable experiences and hosting successful events.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Feature 1 */}
              <div className="p-7 rounded-3xl bg-zinc-50/80 border border-zinc-200/80 space-y-3.5 hover:bg-white hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-2xl bg-[#FEF2F2] text-[#E31B23] flex items-center justify-center shadow-xs">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black text-zinc-950">Secure Payments</h3>
                <p className="text-sm text-zinc-600 leading-relaxed font-normal">
                  Commercial bank grade payment security, digital anti-fraud protection, and verified QR code check-in passes.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-7 rounded-3xl bg-zinc-50/80 border border-zinc-200/80 space-y-3.5 hover:bg-white hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-2xl bg-[#FEF2F2] text-[#E31B23] flex items-center justify-center shadow-xs">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black text-zinc-950">Curated Diversity</h3>
                <p className="text-sm text-zinc-600 leading-relaxed font-normal">
                  Live concerts, technology summits, exclusive weddings, workshops, comedy specials, and culinary experiences.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-7 rounded-3xl bg-zinc-50/80 border border-zinc-200/80 space-y-3.5 hover:bg-white hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-2xl bg-[#FEF2F2] text-[#E31B23] flex items-center justify-center shadow-xs">
                  <Sliders className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black text-zinc-950">Effortless Hosting</h3>
                <p className="text-sm text-zinc-600 leading-relaxed font-normal">
                  Publish events in minutes, monitor real-time ticket sales, scan attendee passes, and receive automated payouts.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="p-7 rounded-3xl bg-zinc-50/80 border border-zinc-200/80 space-y-3.5 hover:bg-white hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-2xl bg-[#FEF2F2] text-[#E31B23] flex items-center justify-center shadow-xs">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black text-zinc-950">Trusted Community</h3>
                <p className="text-sm text-zinc-600 leading-relaxed font-normal">
                  Trusted by thousands of event attendees and West Africa's leading production agencies for flawless live check-in.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
