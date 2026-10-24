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
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col justify-between selection:bg-[#E31B23] selection:text-white">
      <Navbar />

      <main className="flex-1">
        {/* ========================================================================= */}
        {/* 1. HERO SECTION: Editorial, Authoritative, Human */}
        {/* ========================================================================= */}
        <section className="px-4 sm:px-6 lg:px-8 pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-zinc-100 bg-gradient-to-b from-zinc-50/70 via-white to-white">
          <div className="max-w-5xl mx-auto space-y-8 text-center">
            
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 text-white text-[11px] font-mono tracking-wider font-semibold uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E31B23] animate-pulse" />
              OUR MISSION & PURPOSE
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-zinc-950 leading-[1.05] text-balance">
              We build experiences worth showing up for.
            </h1>

            <p className="text-zinc-600 text-base sm:text-xl font-normal max-w-2xl mx-auto leading-relaxed text-balance">
              Eventa is the modern live experience infrastructure—connecting discerning attendees with verified cultural organizers, without predatory fees, scalpers, or broken turnstiles.
            </p>

            {/* Quick Hero Badges */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-zinc-600">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200/80">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#E31B23]" />
                Direct From Organizers
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200/80">
                <QrCode className="w-3.5 h-3.5 text-[#E31B23]" />
                Sub-Second Offline Entry
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200/80">
                <ShieldCheck className="w-3.5 h-3.5 text-[#E31B23]" />
                Fair-Price Guarantee
              </span>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. NUMBERS & IMPACT TELEMETRY */}
        {/* ========================================================================= */}
        <section className="px-4 sm:px-6 lg:px-8 py-12 bg-zinc-950 text-white border-b border-zinc-900">
          <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="space-y-1 sm:space-y-2">
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
        <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            <div className="md:col-span-4 space-y-3">
              <span className="font-mono text-xs font-bold text-[#E31B23] tracking-widest uppercase">
                THE MANIFESTO
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-950">
                Live energy cannot be replicated through screens.
              </h2>
            </div>

            <div className="md:col-span-8 space-y-6 text-zinc-700 text-sm sm:text-base leading-relaxed">
              <p className="font-medium text-zinc-900 text-base sm:text-lg">
                Whether it is the bass vibrating through your chest in a warehouse in Victoria Island, an intimate jazz performance in Covent Garden, or a keynote speech that changes your career trajectory—live gatherings are the heartbeat of culture.
              </p>
              <p>
                Yet for over two decades, legacy ticketing monopolies treated both fans and creators like commodities. They stacked 30% hidden convenience fees at checkout, allowed speculative bots to poach inventory, and left venues with ancient barcode scanners that create 40-minute gate queues.
              </p>
              <p>
                We built Eventa to dismantle that broken paradigm. We combine clean design, zero-friction mobile checkout, and offline-first turnstile verification so that you can spend less time stressed about passes and more time enjoying the show.
              </p>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. OUR CORE PRINCIPLES (Four Elevated Pillars) */}
        {/* ========================================================================= */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24 bg-zinc-50/70 border-y border-zinc-200/80">
          <div className="max-w-6xl mx-auto space-y-12">
            
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <span className="font-mono text-xs font-bold text-[#E31B23] tracking-widest uppercase">
                HOW WE OPERATE
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-950">
                Four principles we refuse to compromise on
              </h2>
              <p className="text-zinc-600 text-sm">
                Every line of code and feature we build is measured against these four standards.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {values.map((v, idx) => (
                <div 
                  key={idx}
                  className="bg-white border border-zinc-200/90 rounded-2xl p-6 sm:p-8 space-y-4 hover:border-zinc-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black text-white bg-zinc-950 px-2.5 py-1 rounded-md">
                      {v.num}
                    </span>
                    <span className="text-[11px] font-mono text-[#E31B23] bg-red-50 border border-red-100 px-2.5 py-0.5 rounded-full font-bold">
                      {v.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-zinc-950 tracking-tight">
                    {v.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-normal">
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
        <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24 max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="font-mono text-xs font-bold text-[#E31B23] tracking-widest uppercase">
              THE CHRONOLOGY
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-950">
              From an underground experiment to city-wide infrastructure
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {milestones.map((item, idx) => (
              <div 
                key={idx}
                className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-3 relative hover:border-zinc-300 transition-all"
              >
                <div className="font-mono text-xs font-black text-[#E31B23] tracking-wider uppercase">
                  {item.year}
                </div>
                <h3 className="text-sm font-bold text-zinc-950 leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 6. CALL TO ACTION: Elevated Banner */}
        {/* ========================================================================= */}
        <section className="px-4 sm:px-6 lg:px-8 pb-20 max-w-6xl mx-auto">
          <div className="bg-zinc-950 text-white rounded-3xl p-8 sm:p-12 border border-zinc-900 shadow-2xl relative overflow-hidden">
            
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
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white text-zinc-950 font-bold text-sm hover:bg-zinc-100 transition-colors flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Compass className="w-4 h-4 text-[#E31B23]" />
                    <span>Explore Events</span>
                  </button>
                </Link>

                <Link to="/register">
                  <button
                    type="button"
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#E31B23] text-white font-bold text-sm hover:bg-red-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-950/50"
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
