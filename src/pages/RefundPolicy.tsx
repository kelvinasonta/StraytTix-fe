import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { RefreshCw, CheckCircle2, AlertTriangle, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const RefundPolicy: React.FC = () => {
  const lastUpdated = 'September 16, 2026';

  const refundRules = [
    {
      title: 'Full Automatic Refund Guaranteed',
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/15 border-emerald-200 dark:border-emerald-500/30',
      points: [
        'The event is permanently cancelled by the organizer with no rescheduled date.',
        'The event date is changed and you notify the organizer within 7 days of the announcement that you cannot attend.',
        'The event venue is relocated by more than 25 miles (40 km) from the originally advertised location.',
        'The event is verified as fraudulent or severely misrepresented by our Trust & Safety team.'
      ]
    },
    {
      title: 'Organizer Discretionary Policy',
      icon: AlertTriangle,
      color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/15 border-amber-200 dark:border-amber-500/30',
      points: [
        'Personal schedule conflicts, sickness, or change of mind are governed by the specific event’s stated policy (e.g. "Refunds available up to 7 days before event" or "All sales final").',
        'Organizers have the unilateral ability to approve manual refunds through their Organizer Orders portal at any time.',
        'Free RSVP cancellations can be released anytime via your ticket dashboard to free up spots for waitlisted attendees.'
      ]
    }
  ];

  const steps = [
    {
      step: '01',
      title: 'Open Your Tickets',
      desc: 'Log in and navigate to My Tickets in your customer account dashboard.'
    },
    {
      step: '02',
      title: 'Select Order',
      desc: 'Click on the specific event order you wish to request a refund or cancellation for.'
    },
    {
      step: '03',
      title: 'Submit Request',
      desc: 'Click "Request Refund", choose your reason, and provide any pertinent details.'
    },
    {
      step: '04',
      title: 'Receive Funds',
      desc: 'Once approved, refunds are credited back to your original payment method in 3–7 business days.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070709] text-zinc-900 dark:text-white flex flex-col justify-between selection:bg-[#E31B23] selection:text-white transition-colors duration-300">
      <Navbar />

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-12 xl:px-16 2xl:px-20 max-w-[1600px] mx-auto w-full space-y-12">
        {/* Header */}
        <div className="space-y-4 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 dark:bg-white/5 border border-red-200 dark:border-white/10 text-[#E31B23] text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <RefreshCw className="w-3.5 h-3.5" />
            Buyer Protection Guarantee
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-zinc-950 dark:text-white tracking-tight leading-[1.1]">
            Refund & Cancellation Policy
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm font-normal">
            Last Updated: {lastUpdated} • StraytTix Attendee Safety Standard
          </p>
        </div>

        {/* Introduction Callout */}
        <div className="max-w-4xl mx-auto bg-white dark:bg-[#0F0F14] border border-zinc-200 dark:border-white/10 rounded-3xl p-8 sm:p-10 shadow-sm dark:shadow-lg backdrop-blur-sm space-y-3">
          <h2 className="text-xl font-bold text-zinc-950 dark:text-white tracking-tight">
            Our Commitment to Transparent Ticketing
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
            At StraytTix, we recognize that live events are unique and unpredictable. We have designed our refund framework to ensure fairness for both attendees who invest in tickets and organizers who commit upfront capital to venues, artists, and production equipment.
          </p>
        </div>

        {/* Rule Categories */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {refundRules.map((category, idx) => (
            <div key={idx} className="bg-white dark:bg-[#0F0F14] border border-zinc-200 dark:border-white/10 rounded-3xl p-8 shadow-sm dark:shadow-xl space-y-5 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-2xl border ${category.color}`}>
                  <category.icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-zinc-950 dark:text-white">{category.title}</h3>
              </div>
              <ul className="space-y-3.5">
                {category.points.map((point, pIdx) => (
                  <li key={pIdx} className="flex items-start gap-3 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-normal leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E31B23] mt-2 flex-shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* How to request refund steps */}
        <div className="max-w-4xl mx-auto bg-white dark:bg-[#0F0F14] border border-zinc-200 dark:border-white/10 rounded-3xl p-8 sm:p-12 shadow-sm dark:shadow-2xl backdrop-blur-md space-y-8">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-zinc-950 dark:text-white tracking-tight">
              How to Request a Refund in 4 Simple Steps
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-normal">
              Self-service refund management directly inside your attendee dashboard.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((item, idx) => (
              <div key={idx} className="bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 rounded-2xl p-6 space-y-3 relative hover:border-zinc-300 dark:hover:border-white/20 transition-colors">
                <span className="text-2xl font-mono font-black text-[#E31B23]">{item.step}</span>
                <h4 className="text-sm font-bold text-zinc-950 dark:text-white">{item.title}</h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-zinc-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 font-normal">
              <Clock className="w-4 h-4 text-[#E31B23]" />
              <span>Standard bank settlement processing takes 3–7 business days depending on your bank provider.</span>
            </div>
            <Link to="/dashboard/tickets">
              <button className="px-6 py-2.5 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md">
                Go to My Tickets <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </Link>
          </div>
        </div>

        {/* Escalations & Safety */}
        <div className="max-w-4xl mx-auto rounded-3xl p-8 sm:p-10 bg-zinc-950 dark:bg-gradient-to-r dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 border border-zinc-800 dark:border-white/15 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <h3 className="text-base sm:text-lg font-bold text-white">
              Organizer Unresponsive or Suspect an Event Fraud?
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal max-w-xl">
              If an event has been cancelled or an organizer has failed to respond to your valid refund inquiry within 5 business days, our Trust & Safety team can intervene and execute an administrative reversal.
            </p>
          </div>
          <Link to="/report" className="flex-shrink-0">
            <button className="px-6 py-3 bg-[#E31B23] hover:bg-[#B91C1C] text-white text-xs font-bold rounded-2xl shadow-lg shadow-[#E31B23]/25 transition-all cursor-pointer whitespace-nowrap">
              File a Dispute / Report
            </button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RefundPolicy;
