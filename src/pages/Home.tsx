import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { 
  Search, 
  ArrowRight,
  Ticket,
  ShieldCheck,
  Smartphone,
  ChevronDown,
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
  Check
} from 'lucide-react';

export const Home: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

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
        <section id="explore" className="relative z-30 px-4 sm:px-6 lg:px-8 -my-8 sm:-my-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-4xl mx-auto"
          >
            {/* Outer Clean Elevated Container */}
            <div className="p-1.5 sm:p-2 rounded-2xl sm:rounded-3xl bg-white shadow-[0_20px_50px_-10px_rgba(0,0,0,0.18)]">
              {/* Inner Form */}
              <form 
                onSubmit={handleSearchSubmit}
                className="flex flex-col md:flex-row items-stretch md:items-center gap-2 p-1.5 sm:p-2"
              >
                {/* Search Keyword Input */}
                <div className="flex items-center gap-3 px-3 py-2 flex-1 min-w-0">
                  <Search className="w-5 h-5 text-zinc-400 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Find events by name, location, or artist..."
                    className="w-full bg-transparent text-sm sm:text-base text-zinc-950 placeholder-zinc-400 outline-none font-medium truncate"
                  />
                </div>

                {/* Execute Button */}
                <button
                  type="submit"
                  className="px-6 sm:px-7 py-3 bg-[#E31B23] hover:bg-[#C9141B] text-white text-sm sm:text-base font-bold rounded-xl transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2 shrink-0 ml-auto"
                >
                  <span>Search</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        </section>

        {/* ========================================================================= */}
        {/* 4. THE STRAYTTIX HIGH-ASSURANCE STANDARD: Jetron Minimalist Bento         */}
        {/* ========================================================================= */}
        <section className="px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16 sm:pb-24 bg-[#0A0A0E] text-white relative overflow-hidden">
          {/* Subtle Ambient Radial Lighting */}
          <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-[#E31B23]/10 blur-[150px] rounded-full pointer-events-none" />

          <div className="max-w-6xl mx-auto space-y-14 relative z-10">
            
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-2.5 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-xs font-mono font-bold text-zinc-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#E31B23]" />
                  <span>The StraytTix Standard</span>
                </div>
                <h2 className="text-3xl sm:text-5xl font-black text-white tracking-[-0.03em] leading-tight">
                  Transparent, tamper-proof ticketing.
                </h2>
                <p className="text-zinc-400 text-sm sm:text-base font-normal">
                  Engineered with cryptographic barcodes so you never have to worry about fake tickets, double-entry, or venue delays.
                </p>
              </div>

              <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-zinc-400 bg-white/[0.04] px-3.5 py-1.5 rounded-full border border-white/10">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>100% VERIFIED AUTHENTICITY</span>
              </div>
            </div>

            {/* 3 Hardware Bento Cards in Jetron Dark Ceramic Finish */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              
              {/* Bento 1: 100% Verified Tickets */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
                whileHover={{ y: -6 }}
                className="group rounded-[1.75rem] border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-7 sm:p-8 flex flex-col justify-between hover:border-white/25 hover:shadow-2xl hover:shadow-black/60 transition-all duration-300 space-y-6"
              >
                
                {/* Visual Header Mockup */}
                <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2.5 transition-transform duration-300 group-hover:scale-[1.02]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>DIRECT FROM ORGANIZER</span>
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">#ZERO-SCALPING</span>
                  </div>
                  <div className="flex items-center gap-3 pt-1">
                    <div className="w-9 h-9 rounded-xl bg-white/10 text-white flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-[#E31B23] transition-colors">
                      ✓
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">Cryptographic Barcode</p>
                      <p className="text-[10px] text-zinc-400 font-mono truncate">Tamper-Proof Single-Issue ID</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-black text-white tracking-tight">
                    100% Verified Passes
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
                    Every ticket is issued directly by verified promoters. No duplicate passes, no inflated secondary resale markups.
                  </p>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center gap-2 text-xs text-zinc-400 font-medium">
                  <ShieldCheck className="w-4 h-4 text-[#E31B23]" />
                  <span>Full refund guarantee on organizer cancellations</span>
                </div>
              </motion.div>

              {/* Bento 2: Instant Mobile Passes */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
                whileHover={{ y: -6 }}
                className="group rounded-[1.75rem] border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-7 sm:p-8 flex flex-col justify-between hover:border-white/25 hover:shadow-2xl hover:shadow-black/60 transition-all duration-300 space-y-6"
              >
                
                {/* Visual Header Mockup */}
                <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2.5 transition-transform duration-300 group-hover:scale-[1.02]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-300 bg-white/10 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <Smartphone className="w-3 h-3 text-zinc-300" />
                      <span>OFFLINE READY</span>
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">DELIVERED</span>
                  </div>
                  <div className="flex items-center gap-3 pt-1">
                    <div className="w-9 h-9 rounded-xl bg-[#E31B23] text-white flex items-center justify-center shrink-0">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">Apple &amp; Google Wallet Pass</p>
                      <p className="text-[10px] text-zinc-400 font-mono truncate">One-Tap Gate Presentation</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-black text-white tracking-tight">
                    Instant Mobile Passes
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
                    Tickets appear immediately in your account and arrive in your email with offline-cached QR access for zero-reception venues.
                  </p>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center gap-2 text-xs text-zinc-400 font-medium">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Works with zero mobile reception at packed venues</span>
                </div>
              </motion.div>

              {/* Bento 3: Smooth Gate Entry */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
                whileHover={{ y: -6 }}
                className="group rounded-[1.75rem] border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-7 sm:p-8 flex flex-col justify-between hover:border-white/25 hover:shadow-2xl hover:shadow-black/60 transition-all duration-300 space-y-6"
              >
                
                {/* Visual Header Mockup */}
                <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2.5 transition-transform duration-300 group-hover:scale-[1.02]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <Zap className="w-3 h-3 text-emerald-400" />
                      <span>&lt; 0.2s SCAN SPEED</span>
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">TURNSTILE CLEAR</span>
                  </div>
                  <div className="flex items-center gap-3 pt-1">
                    <div className="w-9 h-9 rounded-xl bg-white/10 text-white flex items-center justify-center shrink-0 group-hover:bg-emerald-600 transition-colors">
                      <Ticket className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">Sub-Second Gate Clearance</p>
                      <p className="text-[10px] text-zinc-400 font-mono truncate">Free High-Density Check-In App</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-black text-white tracking-tight">
                    Sub-Second Door Entry
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
                    Show your QR pass on your phone screen at the entrance for immediate check-in using our high-speed gate scanner.
                  </p>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center gap-2 text-xs text-zinc-400 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
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
        <section className="px-4 sm:px-6 lg:px-8 py-20 sm:py-28 bg-[#070709] text-white relative overflow-hidden border-t border-white/5">
          {/* Subtle Dynamic Ambient Lighting */}
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#E31B23]/10 blur-[160px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none" />

          <div className="max-w-6xl mx-auto space-y-20 relative z-10">

            {/* Main Header */}
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-xs font-mono font-bold text-zinc-300">
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

            {/* Split Deliverable Grid: Left (Attendees) & Right (Organizers) in Jetron Dark Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Pillar A: For Attendees */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-[2.25rem] bg-[#0E0E12] border border-white/10 p-8 sm:p-10 flex flex-col justify-between hover:border-white/20 transition-all duration-300 space-y-8 shadow-xl"
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
                      <div key={i} className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/5">
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
                className="rounded-[2.25rem] bg-gradient-to-b from-[#E31B23]/10 via-[#0E0E12] to-[#0E0E12] border border-[#E31B23]/30 p-8 sm:p-10 flex flex-col justify-between hover:border-[#E31B23]/50 transition-all duration-300 space-y-8 shadow-xl"
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
                      <div key={i} className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/5">
                        <div className="w-5 h-5 rounded-full bg-[#E31B23]/20 text-[#E31B23] flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3" />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-zinc-200">{item.title}</p>
                          <p className="text-[11px] sm:text-xs text-zinc-400">{item.desc}</p>
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
                  className="p-6 rounded-2xl bg-[#0E0E12] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between space-y-4"
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
                  className="p-6 rounded-2xl bg-[#0E0E12] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between space-y-4"
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
                  className="p-6 rounded-2xl bg-[#0E0E12] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between space-y-4"
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
                  className="p-6 rounded-2xl bg-[#0E0E12] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between space-y-4"
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
        {/* 6. COMPARISON: WHY CREATORS & ATTENDEES CHOOSE US (Jetron Dark Matrix)    */}
        {/* ========================================================================= */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 sm:py-24 bg-[#090A0E] text-white border-t border-white/5">
          <div className="max-w-6xl mx-auto space-y-14">
            
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-mono uppercase tracking-widest text-[#E31B23] font-bold">
                Why Switch to StraytTix
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-[-0.03em]">
                Built different. By design.
              </h2>
              <p className="text-zinc-400 text-sm sm:text-base">
                See how we compare against legacy ticketing platforms and manual transfer arrangements.
              </p>
            </div>

            <div className="overflow-x-auto rounded-3xl border border-white/10 bg-[#0E0E12]/80 backdrop-blur-xl p-2 sm:p-4 shadow-2xl">
              <table className="w-full text-left border-collapse min-w-[640px]">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="py-4 px-6 text-xs font-bold text-zinc-400 uppercase tracking-wider font-mono">Platform Feature</th>
                    <th className="py-4 px-6 text-sm font-black text-white bg-[#E31B23]/20 rounded-t-xl border-x border-t border-[#E31B23]/30">StraytTix</th>
                    <th className="py-4 px-6 text-xs font-bold text-zinc-400 uppercase tracking-wider font-mono">Traditional Sites</th>
                    <th className="py-4 px-6 text-xs font-bold text-zinc-400 uppercase tracking-wider font-mono">Manual Transfers</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {[
                    { feature: 'Ticket Scalp & Duplicate Protection', us: '100% Cryptographic QR Locks', them: 'Basic static barcodes', manual: 'Zero protection' },
                    { feature: 'Payout Timeframe', us: 'Instant Automated Bank Transfers', them: '5 - 14 Business Days', manual: 'Messy manual tracking' },
                    { feature: 'High-Demand Drop Queue', us: 'Managed Virtual Waiting Room', them: 'Crashes on high traffic', manual: 'DMs flood & freeze' },
                    { feature: 'Door Check-in Latency', us: '< 0.2s with Offline Sync', them: 'Slow paper / web lookups', manual: 'Manual name paper list' },
                    { feature: 'Hidden Buyer Checkout Fees', us: 'Zero Surprise Markups', them: '10% - 25% added at payment', manual: 'None (high fraud risk)' },
                    { feature: 'Custom Website Embeds', us: 'Native 2-step Widget & REST API', them: 'Redirects off your website', manual: 'Not possible' }
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-6 font-semibold text-zinc-200">{row.feature}</td>
                      <td className="py-4 px-6 font-bold text-red-400 bg-[#E31B23]/10 border-x border-[#E31B23]/20">{row.us}</td>
                      <td className="py-4 px-6 text-zinc-400">{row.them}</td>
                      <td className="py-4 px-6 text-zinc-500">{row.manual}</td>
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
        <section className="px-4 sm:px-6 lg:px-8 py-14 sm:py-18 bg-[#070709] text-white border-t border-white/5">
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
        <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24 bg-[#0A0A0E] text-white border-t border-white/5">
          <div className="max-w-6xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.97, y: 36 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-[2.25rem] bg-[#0E0E12] text-white p-8 sm:p-14 lg:p-16 flex flex-col lg:flex-row lg:items-center justify-between gap-10 border border-white/10 shadow-2xl relative overflow-hidden"
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
