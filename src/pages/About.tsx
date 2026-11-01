import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { 
  Globe, 
  ShieldCheck, 
  Sparkles, 
  Zap, 
  ArrowRight, 
  Compass, 
  Users, 
  CheckCircle2, 
  QrCode, 
  Building2, 
  HeartHandshake, 
  Flame,
  Radio,
  Layers,
  Award
} from 'lucide-react';

export const About: React.FC = () => {
  const stats = [
    { label: 'Verified Attendees', value: '45,000+', subtext: 'Safely through venue gates' },
    { label: 'Direct Organizers', value: '380+', subtext: 'Promoters, clubs & creators' },
    { label: 'Gate Scan Clearance', value: '< 0.2s', subtext: 'Zero venue turnstile bottlenecks' },
    { label: 'Secondary Scalping', value: '0.0%', subtext: 'Anti-duplicate minted passes' }
  ];

  const values = [
    {
      num: '01',
      title: 'Anti-Scalping by Architecture',
      desc: 'We reject predatory second-market scalpers and bot swarms. Every ticket pass on Eventa is minted directly by the verified organizer with cryptographically signed QR tokens.',
      badge: 'Fair-Access First'
    },
    {
      num: '02',
      title: 'Zero-Signal Resilience',
      desc: 'Venues are notorious dead zones for cellular coverage. Eventa was architected from day one with offline caching, meaning your ticket always displays and your door scanner never fails.',
      badge: 'Offline Engineered'
    },
    {
      num: '03',
      title: 'Direct Creator Economics',
      desc: 'We believe event promoters and artists deserve their money promptly. We disburse automated rolling payouts with clear fee accounting and zero hidden charges.',
      badge: 'Transparent Payouts'
    },
    {
      num: '04',
      title: 'Elevating Creative Culture',
      desc: 'From underground warehouse sets and art showcases to stadium concerts and tech summits, we treat live gatherings as vital cultural landmarks worthy of beautiful software.',
      badge: 'Cultural Respect'
    }
  ];

  const milestones = [
    {
      year: 'THE PROBLEM',
      title: 'The frustration of legacy ticketing',
      desc: 'Opaque extra fees at checkout, broken QR codes at crowded turnstiles, and scalpers buying out front-row tickets in seconds.'
    },
    {
      year: 'THE PROTOTYPE',
      title: 'First underground pilot in Lagos',
      desc: 'We built a lean mobile ticketing protocol for 800 music lovers in Victoria Island. Door clearance dropped from 45 minutes to 7 minutes.'
    },
    {
      year: 'THE EXPANSION',
      title: 'Scaling cross-city and cross-border',
      desc: 'Expanding across Lagos, Abuja, Accra, Nairobi, and London, powering high-caliber festivals, tech conferences, and curated nightlife.'
    },
    {
      year: 'TODAY & BEYOND',
      title: 'The modern standard for live events',
      desc: 'A full-stack ecosystem uniting attendee discovery, sub-second gate check-in, organizer analytics, and native mobile wallet passes.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#070709] text-zinc-100 flex flex-col justify-between selection:bg-[#E31B23] selection:text-white antialiased">
      <Navbar />

      <main className="flex-1">
        {/* ========================================================================= */}
        {/* 1. HERO SECTION: Editorial, Authoritative, High-Contrast */}
        {/* ========================================================================= */}
        <section className="relative px-4 sm:px-6 lg:px-12 xl:px-16 2xl:px-20 pt-16 pb-20 sm:pt-24 sm:pb-28 border-b border-white/5 overflow-hidden">
          {/* Subtle Ambient Radial Lighting */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-[#E31B23]/12 blur-[180px] rounded-full pointer-events-none" />

          <div className="max-w-5xl mx-auto space-y-8 text-center relative z-10">
            
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.08] border border-white/15 text-white text-[11px] font-mono tracking-wider font-semibold uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E31B23] animate-pulse" />
              OUR MISSION & PURPOSE
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white leading-[1.05] text-balance">
              We build experiences worth showing up for.
            </h1>

            <p className="text-zinc-400 text-base sm:text-xl font-normal max-w-2xl mx-auto leading-relaxed text-balance">
              StraytTix is the high-assurance live experience infrastructure—connecting discerning attendees with verified cultural organizers, without predatory fees, scalpers, or broken turnstiles.
            </p>

            {/* Quick Hero Badges (Crisp White and Red High Contrast) */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs font-mono font-bold">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-zinc-950 shadow-md">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#E31B23]" />
                Direct From Organizers
              </span>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-zinc-950 shadow-md">
                <QrCode className="w-3.5 h-3.5 text-[#E31B23]" />
                Sub-Second Offline Entry
              </span>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-zinc-950 shadow-md">
                <ShieldCheck className="w-3.5 h-3.5 text-[#E31B23]" />
                Fair-Price Guarantee
              </span>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. NUMBERS & IMPACT TELEMETRY */}
        {/* ========================================================================= */}
        <section className="px-4 sm:px-6 lg:px-12 xl:px-16 2xl:px-20 py-14 bg-[#0A0A0E] text-white border-b border-white/5">
          <div className="max-w-[1600px] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="space-y-1.5 sm:space-y-2 p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="font-mono text-3xl sm:text-5xl font-black tracking-tight text-white">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm font-bold text-zinc-200">{stat.label}</div>
                <div className="text-[11px] text-zinc-500 font-mono">{stat.subtext}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. MANIFESTO / STORY STATEMENT */}
        {/* ========================================================================= */}
        <section className="px-4 sm:px-6 lg:px-12 xl:px-16 2xl:px-20 py-20 sm:py-28 max-w-[1600px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-14 items-start max-w-5xl mx-auto">
            
            <div className="md:col-span-5 space-y-3">
              <span className="font-mono text-xs font-bold text-[#E31B23] tracking-widest uppercase">
                THE MANIFESTO
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-snug">
                Live energy cannot be replicated through screens.
              </h2>
            </div>

            <div className="md:col-span-7 space-y-6 text-zinc-400 text-sm sm:text-base leading-relaxed">
              <p className="font-medium text-zinc-200 text-base sm:text-lg leading-relaxed">
                Whether it is the bass vibrating through your chest in a warehouse in Victoria Island, an intimate jazz performance in Covent Garden, or a keynote speech that changes your career trajectory—live gatherings are the heartbeat of culture.
              </p>
              <p>
                Yet for over two decades, legacy ticketing monopolies treated both fans and creators like commodities. They stacked 30% hidden convenience fees at checkout, allowed speculative bots to poach inventory, and left venues with ancient barcode scanners that create 40-minute gate queues.
              </p>
              <p>
                We built StraytTix to dismantle that broken paradigm. We combine clean design, zero-friction mobile checkout, and offline-first turnstile verification so that you can spend less time stressed about passes and more time enjoying the show.
              </p>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. OUR CORE PRINCIPLES (Four Elevated Pillars) */}
        {/* ========================================================================= */}
        <section className="px-4 sm:px-6 lg:px-12 xl:px-16 2xl:px-20 py-20 sm:py-28 bg-[#0A0A0E] border-y border-white/5">
          <div className="max-w-[1600px] mx-auto space-y-12">
            
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <span className="font-mono text-xs font-bold text-[#E31B23] tracking-widest uppercase">
                HOW WE OPERATE
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                Four principles we refuse to compromise on
              </h2>
              <p className="text-zinc-400 text-sm">
                Every line of code and feature we build is measured against these four standards.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {values.map((v, idx) => (
                <div 
                  key={idx}
                  className="bg-white/[0.03] border border-white/10 rounded-3xl p-7 sm:p-9 space-y-4 hover:border-white/25 hover:shadow-2xl transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black text-zinc-950 bg-white px-3 py-1 rounded-lg shadow-sm">
                      {v.num}
                    </span>
                    <span className="text-[11px] font-mono text-white bg-[#E31B23] px-3 py-1 rounded-full font-bold shadow-md shadow-[#E31B23]/30">
                      {v.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-white tracking-tight">
                    {v.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
                    {v.desc}
                  </p>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. THE JOURNEY TIMELINE */}
        {/* ========================================================================= */}
        <section className="px-4 sm:px-6 lg:px-12 xl:px-16 2xl:px-20 py-20 sm:py-28 max-w-[1600px] mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="font-mono text-xs font-bold text-[#E31B23] tracking-widest uppercase">
              THE CHRONOLOGY
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              From an underground experiment to city-wide infrastructure
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {milestones.map((item, idx) => (
              <div 
                key={idx}
                className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 space-y-3.5 hover:border-white/25 transition-all shadow-lg"
              >
                <div className="font-mono text-xs font-black text-[#E31B23] tracking-wider uppercase">
                  {item.year}
                </div>
                <h3 className="text-base font-bold text-white leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 6. CALL TO ACTION: Elevated Banner */}
        {/* ========================================================================= */}
        <section className="px-4 sm:px-6 lg:px-12 xl:px-16 2xl:px-20 pb-24 max-w-[1600px] mx-auto">
          <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 text-white rounded-[2rem] p-8 sm:p-14 border border-white/15 shadow-2xl relative overflow-hidden max-w-5xl mx-auto">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative z-10">
              <div className="space-y-4">
                <span className="font-mono text-xs font-bold text-[#E31B23] uppercase tracking-wider">
                  BE PART OF THE MOVEMENT
                </span>
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                  Experience live gatherings built with intention.
                </h2>
                <p className="text-zinc-400 text-sm leading-relaxed max-w-md">
                  Whether you are planning to attend your next festival or looking to host 10,000 attendees with zero gate friction, we are ready for you.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 md:justify-end">
                <Link to="/discover">
                  <button
                    type="button"
                    className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white text-zinc-950 font-bold text-sm hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer active:scale-95"
                  >
                    <Compass className="w-4 h-4 text-[#E31B23]" />
                    <span>Explore Events</span>
                  </button>
                </Link>

                <Link to="/register">
                  <button
                    type="button"
                    className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#E31B23] text-white font-bold text-sm hover:bg-[#C9141B] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#E31B23]/30 cursor-pointer active:scale-95"
                  >
                    <span>Create Organizer Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            </div>

          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default About;
