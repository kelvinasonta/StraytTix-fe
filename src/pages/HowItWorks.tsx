import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Button from '../components/ui/Button';
import { 
  Compass, 
  Ticket, 
  Smartphone, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  QrCode, 
  Zap, 
  Calendar, 
  Users, 
  CreditCard, 
  ScanLine,
  BarChart3,
  Sliders,
  ChevronRight,
  Sparkles,
  Lock,
  Radio,
  FileCheck2,
  Clock3
} from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const [activeAudience, setActiveAudience] = useState<'attendee' | 'organizer'>('attendee');
  const [activeStep, setActiveStep] = useState<number>(0);

  const attendeeSteps = [
    {
      num: '01',
      tag: 'DISCOVERY ENGINE',
      title: 'Find high-vibe events in your city',
      description: 'Filter real-time cultural happenings, intimate warehouse sets, tech summits, and arena concerts curated by genuine community organizers.',
      badge: 'Zero Clutter',
      highlights: ['City & category geofilters', 'Real-time seat & tier availability', 'Audio previews & lineup rosters'],
      microUI: {
        pill: 'LAGOS · LIVE NOW',
        meta: 'Afrobeats Symphony · 2,400 RSVPed',
        action: 'View Lineup'
      }
    },
    {
      num: '02',
      tag: 'TRANSPARENT PASSES',
      title: 'Choose your tier without predatory markups',
      description: 'See every tier clearly with transparent price breakdowns. No surprise $20 resale checkout fees or bots poaching front-row access.',
      badge: 'Fair-Price Guaranteed',
      highlights: ['Early bird & VIP tiered perks', 'Group bundle savings', 'Direct organizer pricing'],
      microUI: {
        pill: 'TIER: VIP FRONT CIRCLE',
        meta: '₦35,000 flat · Free lounge & drink pass',
        action: 'Select 2 Passes'
      }
    },
    {
      num: '03',
      tag: 'FRICTIONLESS CHECKOUT',
      title: 'Secure checkout in under 30 seconds',
      description: 'Pay via Apple Pay, Google Pay, cards, or instant bank transfers. Your tickets are issued directly to your device and synchronized to your inbox.',
      badge: 'Encrypted Tokenization',
      highlights: ['Instant tokenized transaction', 'Multi-currency support', 'Automated tax & invoice receipts'],
      microUI: {
        pill: 'STATUS: CONFIRMED',
        meta: 'Ref: #EVT-9042 · Sent to email & wallet',
        action: 'Download Apple Pass'
      }
    },
    {
      num: '04',
      tag: 'ZERO-SIGNAL ENTRY',
      title: 'Scan your offline QR code at the door',
      description: 'Open your pass directly from the Eventa app or your mobile wallet. No internet required at crowded venue gates—our high-speed gate scanners clear in 0.2s.',
      badge: 'Sub-Second Entry',
      highlights: ['Cached dynamic offline QR code', 'Apple & Google Wallet native pass', 'Transfer or resell at face value anytime'],
      microUI: {
        pill: 'GATE CLEARANCE: ACTIVE',
        meta: 'Gate 2 · Turnstile Ready · Offline Verified',
        action: 'Present Pass'
      }
    }
  ];

  const organizerSteps = [
    {
      num: '01',
      tag: 'SETUP & INVENTORY',
      title: 'Launch ticket tiers in under 3 minutes',
      description: 'Design custom registration forms, set up tiered pricing (Early Bird, VIP, Table), add custom promo codes, and set purchase limits per attendee.',
      badge: 'Live in Minutes',
      highlights: ['Granular tier capacities', 'Custom attendee survey fields', 'Secret passcode-protected drops'],
      microUI: {
        pill: 'EVENT CONFIGURED',
        meta: '3 Tiers active · 1,500 inventory loaded',
        action: 'Publish Event'
      }
    },
    {
      num: '02',
      tag: 'DISTRIBUTION & EMBEDS',
      title: 'Sell anywhere with custom embeds & links',
      description: 'Share your dedicated event landing page, embed checkout widgets on your own website, or sell tickets directly inside partner newsletters and Instagram bios.',
      badge: 'Full Attribution',
      highlights: ['Seamless embeddable checkout widgets', 'UTM tracking & affiliate tracking links', 'Custom event subdomain support'],
      microUI: {
        pill: 'CHECKOUT WIDGET',
        meta: 'Converted 482 tickets today · 14.8% CVR',
        action: 'Copy Embed Code'
      }
    },
    {
      num: '03',
      tag: 'GATE OPERATIONS',
      title: 'High-speed team scanning with zero hardware rental',
      description: 'Equip your door staff with our free mobile scanner app. Scan hundreds of attendees per minute with offline sync and anti-duplication collision protection.',
      badge: 'Zero Hardware Cost',
      highlights: ['Role-based door staff access', 'Sub-second optical camera scanning', 'Real-time check-in headcount counter'],
      microUI: {
        pill: 'DOOR OPS LIVE',
        meta: '1,280 / 1,500 Checked In (85%) · 0 Collisions',
        action: 'Live Gate Feed'
      }
    },
    {
      num: '04',
      tag: 'AUTOMATED PAYOUTS',
      title: 'Automated revenue payouts & deep analytics',
      description: 'Receive revenue directly in your linked bank account with transparent fee reporting, customer export lists, and multi-currency ledger reconciliations.',
      badge: 'Direct Settlements',
      highlights: ['Automated T+1 rolling payouts', 'Exportable CSV attendee list', 'Zero platform lock-in on your customer data'],
      microUI: {
        pill: 'SETTLEMENT: PROCESSED',
        meta: '₦14,850,000 disbursed to bank · 100% matched',
        action: 'View Payout Audit'
      }
    }
  ];

  const currentSteps = activeAudience === 'attendee' ? attendeeSteps : organizerSteps;

  const guarantees = [
    {
      icon: ShieldCheck,
      title: '100% Authentic Passes',
      desc: 'Every ticket is minted directly by the event organizer. No scalper duplicates or fake PDF re-sales.'
    },
    {
      icon: Radio,
      title: 'Offline Gate Entry',
      desc: 'Mobile passes cache securely offline. Gain gate entry instantly even with zero venue cellular connectivity.'
    },
    {
      icon: Zap,
      title: 'Direct Fast Payouts',
      desc: 'Organizers enjoy automated bank disbursements with zero hidden deductions and real-time ledger accounting.'
    },
    {
      icon: Lock,
      title: 'Enterprise Encryption',
      desc: 'PCI-DSS Level 1 compliant card handling with tokenized credentials and fraud prevention built-in.'
    }
  ];

  const faqs = [
    {
      q: 'Do attendees need to create an account to purchase tickets?',
      a: 'No. Attendees can checkout in one click using guest checkout. A secure ticket link and Apple/Google Wallet pass are immediately sent to their verified email address.'
    },
    {
      q: 'Can I transfer or re-assign my ticket to a friend?',
      a: 'Yes! In your attendee dashboard or confirmation email, you can securely re-assign the name and email address on your ticket pass with one tap at no cost.'
    },
    {
      q: 'What equipment does my door staff need to scan tickets?',
      a: 'Any standard smartphone. Download our organizer scanner app (iOS & Android) or use the mobile web scanner. It operates seamlessly in dark venues and offline environments.'
    },
    {
      q: 'When do event organizers receive ticket proceeds?',
      a: 'Funds settle directly to your designated bank account on automated rolling payouts or immediately after your event, complete with transaction reconciliations.'
    }
  ];

  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col justify-between selection:bg-[#E31B23] selection:text-white">
      <Navbar />

      <main className="flex-1">
        {/* ========================================================================= */}
        {/* 1. HERO HEADER: Human, Editorial, Structured */}
        {/* ========================================================================= */}
        <section className="px-4 sm:px-6 lg:px-8 pt-12 pb-16 sm:pt-16 sm:pb-20 border-b border-zinc-100 bg-gradient-to-b from-zinc-50/60 to-white">
          <div className="max-w-5xl mx-auto text-center space-y-6">
            
            {/* Monospace System Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 text-white text-[11px] font-mono tracking-wider font-semibold uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E31B23] animate-pulse" />
              THE EVENTA ARCHITECTURE
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-zinc-950 leading-[1.05] text-balance">
              How Eventa moves you from discovery to the front row.
            </h1>

            <p className="text-zinc-600 text-base sm:text-xl font-normal max-w-2xl mx-auto leading-relaxed">
              A modern ticketing and gate entry system engineered for transparent pricing, instant delivery, and zero-headache venue operations.
            </p>

            {/* Audience Toggle (Attendee vs Organizer) */}
            <div className="pt-4 flex justify-center w-full">
              <div className="inline-flex flex-col sm:flex-row w-full sm:w-auto p-1.5 bg-zinc-150/80 rounded-2xl border border-zinc-200/80 shadow-inner gap-1">
                <button
                  type="button"
                  onClick={() => { setActiveAudience('attendee'); setActiveStep(0); }}
                  className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    activeAudience === 'attendee'
                      ? 'bg-zinc-950 text-white shadow-md'
                      : 'text-zinc-600 hover:text-zinc-950 hover:bg-white/50'
                  }`}
                >
                  <Ticket className="w-4 h-4 text-[#E31B23]" />
                  <span>For Ticket Buyers</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveAudience('organizer'); setActiveStep(0); }}
                  className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    activeAudience === 'organizer'
                      ? 'bg-zinc-950 text-white shadow-md'
                      : 'text-zinc-600 hover:text-zinc-950 hover:bg-white/50'
                  }`}
                >
                  <Users className="w-4 h-4 text-[#E31B23]" />
                  <span>For Organizers & Promoters</span>
                </button>
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. THE 4-STEP PROTOCOL (Interactive Step Journey) */}
        {/* ========================================================================= */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
            
            {/* Left Column: Step Navigation List */}
            <div className="lg:col-span-6 space-y-4">
              <div className="space-y-2 mb-6">
                <p className="font-mono text-xs font-bold text-[#E31B23] tracking-widest uppercase">
                  {activeAudience === 'attendee' ? 'ATTENDEE LIFECYCLE' : 'ORGANIZER WORKFLOW'}
                </p>
                <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
                  {activeAudience === 'attendee' ? 'Four seamless steps to the stage' : 'Launch, sell, and scan in 4 steps'}
                </h2>
              </div>

              <div className="space-y-3">
                {currentSteps.map((step, idx) => {
                  const isSelected = activeStep === idx;
                  return (
                    <div
                      key={idx}
                      onClick={() => setActiveStep(idx)}
                      className={`cursor-pointer text-left p-5 rounded-2xl border transition-all duration-200 ${
                        isSelected 
                          ? 'bg-zinc-950 text-white border-zinc-950 shadow-xl' 
                          : 'bg-white text-zinc-800 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/50'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`font-mono text-sm font-black px-2.5 py-1 rounded-lg ${
                          isSelected ? 'bg-[#E31B23] text-white' : 'bg-zinc-100 text-zinc-600'
                        }`}>
                          {step.num}
                        </div>

                        <div className="flex-1 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className={`font-mono text-[10px] tracking-wider uppercase ${
                              isSelected ? 'text-zinc-400' : 'text-zinc-500'
                            }`}>
                              {step.tag}
                            </span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              isSelected ? 'bg-white/10 text-zinc-300' : 'bg-zinc-100 text-zinc-600'
                            }`}>
                              {step.badge}
                            </span>
                          </div>

                          <h3 className={`text-base font-bold tracking-tight ${
                            isSelected ? 'text-white' : 'text-zinc-950'
                          }`}>
                            {step.title}
                          </h3>

                          <p className={`text-xs leading-relaxed ${
                            isSelected ? 'text-zinc-300' : 'text-zinc-600'
                          }`}>
                            {step.description}
                          </p>

                          {/* Bullet Highlights */}
                          {isSelected && (
                            <ul className="pt-2 space-y-1.5 text-xs text-zinc-300 border-t border-white/10 mt-3">
                              {step.highlights.map((h, hIdx) => (
                                <li key={hIdx} className="flex items-center gap-2">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-[#E31B23] shrink-0" />
                                  <span>{h}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Physical / Editorial Live Preview Mockup */}
            <div className="lg:col-span-6 lg:sticky lg:top-24">
              <div className="bg-zinc-950 text-white rounded-3xl p-6 sm:p-8 border border-zinc-900 shadow-2xl space-y-6 relative overflow-hidden">
                
                {/* Background Subtle Grid Texture */}
                <div 
                  className="absolute inset-0 opacity-[0.06] pointer-events-none"
                  style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)',
                    backgroundSize: '24px 24px'
                  }}
                />

                {/* Top Status Bar */}
                <div className="flex items-center justify-between relative z-10 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E31B23]" />
                    <span className="font-mono text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                      EVENTA PROTOCOL STEP {currentSteps[activeStep].num}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-zinc-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded">
                    VERIFIED ENGINE
                  </span>
                </div>

                {/* Mockup Card Body */}
                <div className="relative z-10 bg-zinc-900 border border-white/10 rounded-2xl p-6 space-y-6 shadow-inner">
                  
                  {/* Mockup Pill */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#E31B23] bg-red-950/40 border border-red-500/20 px-3 py-1 rounded-full">
                      {currentSteps[activeStep].microUI.pill}
                    </span>
                    <span className="font-mono text-[11px] text-zinc-400">
                      ID: #{Math.floor(100000 + Math.random() * 900000)}
                    </span>
                  </div>

                  {/* Stage Visual representation based on step */}
                  <div className="bg-zinc-950 rounded-xl p-6 border border-white/5 space-y-4">
                    {activeAudience === 'attendee' ? (
                      activeStep === 0 ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
                            <span>EXPLORATION RADAR</span>
                            <span className="text-[#E31B23] font-bold">140+ UPCOMING</span>
                          </div>
                          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-[#E31B23] w-3/4 rounded-full" />
                          </div>
                          <div className="grid grid-cols-2 gap-2 pt-2">
                            <div className="bg-white/5 p-3 rounded-lg text-left">
                              <p className="text-[10px] font-mono text-zinc-400">NEXT EVENT</p>
                              <p className="text-xs font-bold text-white">Afrobeats Symphony</p>
                              <p className="text-[10px] text-zinc-400">Eko Convention Centre</p>
                            </div>
                            <div className="bg-white/5 p-3 rounded-lg text-left">
                              <p className="text-[10px] font-mono text-zinc-400">DATE & TIME</p>
                              <p className="text-xs font-bold text-white">Sat, Oct 24</p>
                              <p className="text-[10px] text-emerald-400">7:00 PM · Doors Open</p>
                            </div>
                          </div>
                        </div>
                      ) : activeStep === 1 ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-mono text-zinc-400">VIP GOLDEN CIRCLE</span>
                            <span className="font-mono font-bold text-white">₦35,000</span>
                          </div>
                          <div className="p-3 bg-white/5 rounded-lg border border-white/5 text-xs text-zinc-300 space-y-1">
                            <p className="text-white font-bold">Included Privileges:</p>
                            <p className="text-[11px] text-zinc-400">✓ Front-stage golden barrier access</p>
                            <p className="text-[11px] text-zinc-400">✓ Fast-track express gate entry</p>
                            <p className="text-[11px] text-zinc-400">✓ 100% money-back cancellation guarantee</p>
                          </div>
                        </div>
                      ) : activeStep === 2 ? (
                        <div className="space-y-3 text-center py-2">
                          <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                            <CheckCircle2 className="w-6 h-6" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-bold text-white">Instant Payment Tokenized</p>
                            <p className="text-xs text-zinc-400 font-mono">Authorization: 200 OK · Settled</p>
                          </div>
                          <div className="p-2.5 bg-white/5 rounded-lg font-mono text-[11px] text-zinc-300 flex justify-between">
                            <span>PASSENGER</span>
                            <span className="text-white font-bold">KELVIN ASONTA</span>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4 text-center py-2">
                          <div className="w-32 h-32 mx-auto bg-white rounded-xl p-3 flex items-center justify-center shadow-lg">
                            <QrCode className="w-28 h-28 text-zinc-950" />
                          </div>
                          <div className="space-y-1">
                            <span className="font-mono text-[10px] tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-500/20 px-2 py-0.5 rounded">
                              OFFLINE VALIDATED · READY TO SCAN
                            </span>
                            <p className="text-xs text-zinc-400 pt-1">
                              Show screen at Turnstile 02 for 0.2s laser verification
                            </p>
                          </div>
                        </div>
                      )
                    ) : (
                      // Organizer Live Mockup
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
                          <span>ORGANIZER CONSOLE</span>
                          <span className="text-emerald-400 font-bold">LIVE TELEMETRY</span>
                        </div>
                        <div className="bg-white/5 p-4 rounded-xl space-y-2 text-left">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-zinc-400">Gross Sales Volume</span>
                            <span className="text-white font-mono font-bold">₦14,850,000</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-zinc-400">Tickets Issued</span>
                            <span className="text-white font-mono font-bold">1,280 / 1,500</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-zinc-400">Gate Turnstile Velocity</span>
                            <span className="text-emerald-400 font-mono font-bold">18 scans / min</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* MicroUI Meta & Action Button */}
                  <div className="space-y-3 pt-2">
                    <p className="text-xs text-zinc-300 font-mono">
                      {currentSteps[activeStep].microUI.meta}
                    </p>
                    <div className="w-full py-2.5 px-4 rounded-xl bg-white text-zinc-950 font-bold text-xs text-center flex items-center justify-center gap-2">
                      <span>{currentSteps[activeStep].microUI.action}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#E31B23]" />
                    </div>
                  </div>

                </div>

                {/* Footer Monospace Disclaimer */}
                <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-zinc-400 pt-2 border-t border-white/10">
                  <span>AUDIT STATUS: VERIFIED</span>
                  <span className="text-zinc-400">LATENCY &lt; 200MS</span>
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. FOUR GUARANTEE PILLARS: Solid, Industrial, Tactile */}
        {/* ========================================================================= */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 bg-zinc-950 text-white border-y border-zinc-900">
          <div className="max-w-6xl mx-auto space-y-12">
            
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <span className="font-mono text-xs font-bold text-[#E31B23] tracking-widest uppercase">
                THE EVENTA STANDARD
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                Engineered for trust from the ground up
              </h2>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Why thousands of attendees and independent promoters rely on Eventa instead of legacy ticketing engines.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {guarantees.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-zinc-900/80 border border-white/10 hover:border-white/20 p-6 rounded-2xl space-y-4 transition-all duration-200"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#E31B23]/10 border border-[#E31B23]/30 text-[#E31B23] flex items-center justify-center">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white tracking-tight">{item.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. FREQUENTLY ASKED QUESTIONS */}
        {/* ========================================================================= */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24 max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="font-mono text-xs font-bold text-[#E31B23] tracking-widest uppercase">
              CLARITY FIRST
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-950">
              Frequently Asked Questions
            </h2>
            <p className="text-zinc-500 text-sm">
              Everything you need to know about purchasing tickets or hosting your first event.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-2 hover:border-zinc-300 transition-colors"
              >
                <h3 className="text-base font-bold text-zinc-950 flex items-start gap-3">
                  <span className="font-mono text-xs font-bold text-[#E31B23] px-2 py-0.5 bg-red-50 rounded">Q</span>
                  <span>{faq.q}</span>
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 pl-8 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center pt-4">
            <p className="text-xs text-zinc-500">
              Have an enterprise inquiry or need custom on-site gate assistance?{' '}
              <Link to="/about" className="text-[#E31B23] font-bold underline hover:text-red-700">
                Contact our support team
              </Link>
            </p>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. DUAL CTA SECTION: Attendee vs Organizer */}
        {/* ========================================================================= */}
        <section className="px-4 sm:px-6 lg:px-8 pb-20 max-w-6xl mx-auto">
          <div className="bg-gradient-to-br from-zinc-950 to-zinc-900 text-white rounded-3xl p-8 sm:p-12 border border-zinc-800 shadow-2xl relative overflow-hidden">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative z-10">
              <div className="space-y-4">
                <span className="font-mono text-xs font-bold text-[#E31B23] uppercase tracking-wider">
                  GET STARTED TODAY
                </span>
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                  Ready to experience events the way they should be?
                </h2>
                <p className="text-zinc-400 text-sm leading-relaxed max-w-md">
                  Whether you are looking for your next unforgettable weekend or hosting 5,000 fans at your summit, Eventa has you covered.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 md:justify-end">
                <Link to="/discover">
                  <button
                    type="button"
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white text-zinc-950 font-bold text-sm hover:bg-zinc-100 transition-colors flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Compass className="w-4 h-4 text-[#E31B23]" />
                    <span>Explore Upcoming Events</span>
                  </button>
                </Link>

                <Link to="/register">
                  <button
                    type="button"
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#E31B23] text-white font-bold text-sm hover:bg-red-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-950/50"
                  >
                    <span>Host an Event</span>
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

export default HowItWorks;
