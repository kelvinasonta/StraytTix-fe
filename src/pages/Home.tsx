import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { 
  Search, 
  MapPin, 
  ArrowRight,
  Ticket,
  ShieldCheck,
  Smartphone,
  ChevronDown,
  Music2,
  Cpu,
  GlassWater,
  Sparkles,
  Smile,
  CheckCircle2,
  QrCode,
  Zap,
  Plus,
  ArrowUpRight,
  Users2,
  Layers,
  Code2,
  Radio,
  BarChart3,
  Globe2,
  Lock,
  Headphones,
  SlidersHorizontal,
  Workflow
} from 'lucide-react';

export const Home: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedDateFilter, setSelectedDateFilter] = useState('All Dates');
  const [activeCategory, setActiveCategory] = useState('All');
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (selectedCity && selectedCity !== 'All') params.set('city', selectedCity);
    if (activeCategory && activeCategory !== 'All') params.set('category', activeCategory);
    if (selectedDateFilter === 'This Weekend') params.set('timeframe', 'weekend');
    if (selectedDateFilter === 'Free') params.set('price', 'free');
    navigate(`/discover?${params.toString()}`);
  };

  const scrollToExplore = () => {
    const el = document.getElementById('explore');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const categories = [
    { name: 'All', label: 'All Experiences', icon: Sparkles },
    { name: 'Music', label: 'Concerts & Live Sets', icon: Music2 },
    { name: 'Nightlife', label: 'Parties & DJ Clubs', icon: GlassWater },
    { name: 'Technology', label: 'Tech & Summits', icon: Cpu },
    { name: 'Comedy', label: 'Standup & Theatre', icon: Smile },
    { name: 'Food & Drink', label: 'Festivals & Dining', icon: GlassWater }
  ];

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
        <section className="relative min-h-[100dvh] w-full flex flex-col justify-between bg-[#08080A] overflow-hidden text-center px-4 sm:px-6 lg:px-8 border-b border-zinc-900">
          
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
            
            {/* Micro Eyebrow Badge (Live Ticket Engine Indicator with interactive hover sparkle) */}
            <motion.div 
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.08] border border-white/15 backdrop-blur-xl shadow-inner text-[11px] sm:text-xs font-semibold text-zinc-200 cursor-default"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-wider text-zinc-300">Live Ticketing Engine</span>
              <span className="text-zinc-500">•</span>
              <span className="text-zinc-200">Zero Scalping • Instant Pass Delivery</span>
            </motion.div>

            {/* Headline matching user reference image */}
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-white tracking-[-0.035em] leading-[1.12] sm:leading-[1.08] text-balance drop-shadow-lg px-2">
              Attending And Creating Events Has Never Been Easier.
            </h1>

            {/* Supporting Subtitle matching reference */}
            <p className="text-zinc-300/95 text-xs sm:text-base md:text-lg leading-relaxed max-w-2xl font-normal text-balance drop-shadow-sm px-3">
              Nigeria&apos;s #1 ticketing platform for discovering events, buying tickets, and creating, promoting, and selling tickets for your own events.
            </p>

            {/* Nested "Island" Action Buttons (Double-bezel hardware styling) */}
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
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
              
              {/* Secondary: Create Event (Translucent Frosted Glass Pill) */}
              <Link
                to="/organizer/events/create"
                className="w-full sm:w-auto group inline-flex items-center justify-between sm:justify-start gap-3 bg-white/[0.08] hover:bg-white/[0.14] text-white font-bold rounded-full pl-7 pr-2.5 py-2 text-sm sm:text-base border border-white/20 backdrop-blur-2xl transition-all duration-300 hover:border-white/40 hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer shadow-sm"
              >
                <span>Create Event</span>
                <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 group-hover:bg-white/20 flex items-center justify-center transition-transform duration-300 group-hover:rotate-90 shrink-0">
                  <Plus className="w-4 h-4 text-white" />
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
        {/* ========================================================================= */}
        <section id="explore" className="relative z-20 px-4 sm:px-6 lg:px-8 -mt-7 sm:-mt-9">
          <motion.div 
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-5xl mx-auto"
          >
            {/* Outer Machine Bezel */}
            <div className="p-1.5 sm:p-2 rounded-3xl bg-zinc-900/10 backdrop-blur-xl border border-black/5 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.18)]">
              {/* Inner Core */}
              <form 
                onSubmit={handleSearchSubmit}
                className="bg-white rounded-[1.35rem] p-2 sm:p-2.5 border border-zinc-200/80 flex flex-col md:flex-row items-stretch md:items-center gap-2 transition-all focus-within:border-zinc-400"
              >
                {/* Search Keyword Input */}
                <div className="flex items-center gap-3 px-3.5 py-2.5 flex-1 min-w-0">
                  <Search className="w-5 h-5 text-zinc-400 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Find events by name, location, or artist..."
                    className="w-full bg-transparent text-sm sm:text-base text-zinc-950 placeholder-zinc-400 outline-none font-medium truncate"
                  />
                </div>

                {/* City Picker Dropdown */}
                <div className="flex items-center gap-2 px-3 py-2 md:border-l border-zinc-200 shrink-0">
                  <MapPin className="w-4 h-4 text-[#E31B23] shrink-0" />
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    aria-label="Filter events by city"
                    className="bg-transparent text-xs sm:text-sm font-bold text-zinc-800 outline-none cursor-pointer pr-1"
                  >
                    <option value="All">All Locations</option>
                    <option value="Lagos">Lagos, NG</option>
                    <option value="Abuja">Abuja, NG</option>
                    <option value="Port Harcourt">Port Harcourt, NG</option>
                    <option value="Accra">Accra, GH</option>
                    <option value="London">London, UK</option>
                  </select>
                </div>

                {/* Date Filter Quick Pills */}
                <div className="hidden lg:flex items-center gap-1.5 px-2 md:border-l border-zinc-200 shrink-0 text-xs">
                  {['All Dates', 'This Weekend', 'Free'].map((pill) => (
                    <button
                      key={pill}
                      type="button"
                      onClick={() => setSelectedDateFilter(pill)}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                        selectedDateFilter === pill 
                          ? 'bg-zinc-950 text-white shadow-2xs' 
                          : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
                      }`}
                    >
                      {pill}
                    </button>
                  ))}
                </div>

                {/* Execute Button */}
                <button
                  type="submit"
                  className="px-6 sm:px-7 py-3 bg-[#E31B23] hover:bg-[#C9141B] text-white text-sm sm:text-base font-bold rounded-xl transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2 shrink-0"
                >
                  <span>Search</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        </section>

        {/* ========================================================================= */}
        {/* 3. CATEGORY TAXONOMY STRIP (One-Click Deep Link To /discover)             */}
        {/* ========================================================================= */}
        <section className="px-4 sm:px-6 lg:px-8 pt-10 pb-8">
          <div className="max-w-6xl mx-auto flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => {
                    const params = new URLSearchParams();
                    if (cat.name !== 'All') params.set('category', cat.name);
                    navigate(`/discover?${params.toString()}`);
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer bg-zinc-100/90 hover:bg-zinc-200 text-zinc-700 border border-zinc-200/80 active:scale-95"
                >
                  <Icon className="w-3.5 h-3.5 text-[#E31B23]" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. THE STRAYTTIX HIGH-ASSURANCE STANDARD: Architectural Bento             */}
        {/* ========================================================================= */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24 bg-white border-y border-zinc-100">
          <div className="max-w-6xl mx-auto space-y-14">
            
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-2 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-xs font-bold text-zinc-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#E31B23]" />
                  <span>The StraytTix Standard</span>
                </div>
                <h2 className="text-3xl sm:text-5xl font-black text-zinc-950 tracking-[-0.03em] leading-tight">
                  Transparent, tamper-proof ticketing.
                </h2>
                <p className="text-zinc-600 text-sm sm:text-base font-normal">
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
                className="group rounded-[1.75rem] border border-zinc-200/90 bg-gradient-to-b from-white via-white to-zinc-50/70 p-7 sm:p-8 flex flex-col justify-between hover:border-zinc-300 hover:shadow-2xl hover:shadow-zinc-200/50 transition-all duration-300 space-y-6"
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
                className="group rounded-[1.75rem] border border-zinc-200/90 bg-gradient-to-b from-white via-white to-zinc-50/70 p-7 sm:p-8 flex flex-col justify-between hover:border-zinc-300 hover:shadow-2xl hover:shadow-zinc-200/50 transition-all duration-300 space-y-6"
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
                className="group rounded-[1.75rem] border border-zinc-200/90 bg-gradient-to-b from-white via-white to-zinc-50/70 p-7 sm:p-8 flex flex-col justify-between hover:border-zinc-300 hover:shadow-2xl hover:shadow-zinc-200/50 transition-all duration-300 space-y-6"
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
        {/* 5. ENTERPRISE JETRON-INSPIRED EVENT TECH CAPABILITIES                     */}
        {/* ========================================================================= */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 sm:py-28 bg-[#08080B] text-white border-t border-zinc-900 relative overflow-hidden">
          {/* Subtle Ambient Backdrops */}
          <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-[#E31B23]/10 blur-[150px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-[450px] h-[450px] bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none" />

          <div className="max-w-6xl mx-auto space-y-16 relative z-10">
            {/* Section Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2.5 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.08] border border-white/15 text-xs font-mono font-bold text-zinc-300">
                  <Workflow className="w-3.5 h-3.5 text-[#E31B23]" />
                  <span>Next-Gen Event Infrastructure</span>
                </div>
                <h2 className="text-3xl sm:text-5xl font-black text-white tracking-[-0.03em] leading-tight">
                  High-capacity tools built for modern live productions.
                </h2>
                <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
                  From high-traffic drop waiting rooms to precision venue seat selection, run stadium-level events with enterprise reliability.
                </p>
              </div>

              <Link
                to="/pricing"
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-white hover:text-zinc-300 transition-colors shrink-0 group border-b border-white/20 pb-1"
              >
                <span>Explore all organizer features</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {/* 4 Feature Pillars Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              
              {/* Feature 1: Interactive Seat Maps */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -6 }}
                className="p-8 sm:p-10 rounded-[2rem] bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/10 hover:border-white/20 backdrop-blur-xl transition-all duration-300 space-y-6 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E31B23] to-[#B91C1C] flex items-center justify-center text-white shadow-lg shadow-[#E31B23]/25">
                    <Layers className="w-6 h-6" />
                  </div>
                  <div className="space-y-2">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
                      Venue Architecture
                    </span>
                    <h3 className="text-2xl font-black text-white tracking-tight">
                      Interactive 3D Seat Maps
                    </h3>
                    <p className="text-sm text-zinc-400 leading-relaxed font-normal">
                      Empower attendees to hand-pick their exact row, tier, and table. Custom multi-tiered venue maps reflect live real-time inventory locks with sub-second sync.
                    </p>
                  </div>
                </div>

                {/* Micro Visual UI Tag */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-zinc-400">
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Reserved Table Tiers</span>
                  <span className="text-zinc-500">DYNAMIC SEATS</span>
                </div>
              </motion.div>

              {/* Feature 2: High-Traffic Managed Queues */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                whileHover={{ y: -6 }}
                className="p-8 sm:p-10 rounded-[2rem] bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/10 hover:border-white/20 backdrop-blur-xl transition-all duration-300 space-y-6 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white shadow-lg shadow-amber-500/25">
                    <Radio className="w-6 h-6" />
                  </div>
                  <div className="space-y-2">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                      FairPass Queue Protection
                    </span>
                    <h3 className="text-2xl font-black text-white tracking-tight">
                      Managed High-Drop Waiting Rooms
                    </h3>
                    <p className="text-sm text-zinc-400 leading-relaxed font-normal">
                      When 20,000+ fans arrive for a viral headliner drop, our intelligent virtual queue protects inventory from bot sweeps and eliminates checkout crashes.
                    </p>
                  </div>
                </div>

                {/* Micro Visual UI Tag */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-zinc-400">
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Bot-Proof Rate Limiting</span>
                  <span className="text-zinc-500">0% DOWNTIME</span>
                </div>
              </motion.div>

              {/* Feature 3: Embeddable Checkout (Jetron Fluid Equivalent) */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
                whileHover={{ y: -6 }}
                className="p-8 sm:p-10 rounded-[2rem] bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/10 hover:border-white/20 backdrop-blur-xl transition-all duration-300 space-y-6 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25">
                    <Code2 className="w-6 h-6" />
                  </div>
                  <div className="space-y-2">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                      Direct Embeds &amp; APIs
                    </span>
                    <h3 className="text-2xl font-black text-white tracking-tight">
                      White-Label Web Checkout
                    </h3>
                    <p className="text-sm text-zinc-400 leading-relaxed font-normal">
                      Keep buyers directly on your official festival website. Embed our frictionless 2-step checkout widget or connect via REST APIs &amp; Webhooks.
                    </p>
                  </div>
                </div>

                {/* Micro Visual UI Tag */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-zinc-400">
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Custom Domain Native</span>
                  <span className="text-zinc-500">REST API</span>
                </div>
              </motion.div>

              {/* Feature 4: Gate Scanner App & Team Access */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                whileHover={{ y: -6 }}
                className="p-8 sm:p-10 rounded-[2rem] bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/10 hover:border-white/20 backdrop-blur-xl transition-all duration-300 space-y-6 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-purple-500/25">
                    <Users2 className="w-6 h-6" />
                  </div>
                  <div className="space-y-2">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-purple-400 font-bold">
                      Team &amp; Gate Access
                    </span>
                    <h3 className="text-2xl font-black text-white tracking-tight">
                      Multi-Staff Door Control
                    </h3>
                    <p className="text-sm text-zinc-400 leading-relaxed font-normal">
                      Deploy 20 gate bouncers and ticket scanners in seconds without sharing master credentials. Assign role permissions, staff PINs, and monitor door throughput live.
                    </p>
                  </div>
                </div>

                {/* Micro Visual UI Tag */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-zinc-400">
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Role-Based Staff PINs</span>
                  <span className="text-zinc-500">OFFLINE SYNC</span>
                </div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 6. HOW IT WORKS: 3-Step Flow for Attendees & Organizers                   */}
        {/* ========================================================================= */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 sm:py-24 bg-white border-b border-zinc-100">
          <div className="max-w-6xl mx-auto space-y-16">
            
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-mono uppercase tracking-widest text-[#E31B23] font-bold">
                Effortless Experience
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-zinc-950 tracking-[-0.03em]">
                How Eventa Works
              </h2>
              <p className="text-zinc-500 text-sm sm:text-base">
                Whether you're discovering your next memorable night or launching a festival, the experience is simple and seamless.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Step 1 */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                className="p-8 rounded-3xl bg-zinc-50/80 border border-zinc-200/80 space-y-4 hover:border-zinc-300 transition-all"
              >
                <div className="w-10 h-10 rounded-2xl bg-zinc-950 text-white font-mono font-bold flex items-center justify-center text-sm">
                  01
                </div>
                <h3 className="text-xl font-black text-zinc-950 tracking-tight">
                  Discover or Create
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                  Search live events across concerts, raves, dining, and summits — or publish your own event with custom ticket tiers in 5 minutes.
                </p>
              </motion.div>

              {/* Step 2 */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                className="p-8 rounded-3xl bg-zinc-50/80 border border-zinc-200/80 space-y-4 hover:border-zinc-300 transition-all"
              >
                <div className="w-10 h-10 rounded-2xl bg-[#E31B23] text-white font-mono font-bold flex items-center justify-center text-sm">
                  02
                </div>
                <h3 className="text-xl font-black text-zinc-950 tracking-tight">
                  Instant Verification
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                  Lock your tickets with zero hidden fees. Receive encrypted QR passes instantly in your email and Apple/Google wallet.
                </p>
              </motion.div>

              {/* Step 3 */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                className="p-8 rounded-3xl bg-zinc-50/80 border border-zinc-200/80 space-y-4 hover:border-zinc-300 transition-all"
              >
                <div className="w-10 h-10 rounded-2xl bg-zinc-950 text-white font-mono font-bold flex items-center justify-center text-sm">
                  03
                </div>
                <h3 className="text-xl font-black text-zinc-950 tracking-tight">
                  Fast Gate Clearance
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                  Show your phone at the entrance for sub-second check-in with offline capability. Organizers receive instant bank settlements.
                </p>
              </motion.div>
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
        {/* 8. FOR ORGANIZERS: Luxury Creator Monolith Card                            */}
        {/* ========================================================================= */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24 bg-white">
          <div className="max-w-6xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.97, y: 36 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-[2.25rem] bg-[#0A0A0D] text-white p-8 sm:p-14 lg:p-16 flex flex-col lg:flex-row lg:items-center justify-between gap-10 border border-white/10 shadow-2xl relative overflow-hidden"
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
                  className="px-8 py-4 bg-[#E31B23] hover:bg-[#C9141B] text-white text-sm sm:text-base font-bold rounded-xl transition-all shadow-xl hover:shadow-[0_12px_28px_-4px_rgba(227,27,35,0.6)] hover:-translate-y-0.5 active:scale-95 text-center cursor-pointer flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create an Event</span>
                </Link>
                <Link
                  to="/pricing"
                  className="px-8 py-4 bg-white/10 hover:bg-white/15 text-white text-sm sm:text-base font-semibold rounded-xl transition-all border border-white/15 hover:border-white/30 hover:-translate-y-0.5 text-center cursor-pointer flex items-center justify-center gap-2"
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
