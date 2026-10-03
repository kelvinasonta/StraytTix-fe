import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { RefreshCw, CheckCircle2, AlertTriangle, Clock, HelpCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const RefundPolicy: React.FC = () => {
  const lastUpdated = 'September 16, 2026';

  const refundRules = [
    {
      title: 'Full Automatic Refund Guaranteed',
      icon: CheckCircle2,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
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
      color: 'text-amber-600 bg-amber-50 border-amber-200',
      points: [
        'Personal schedule conflicts, sickness, or change of mind are governed by the specific event’s stated policy (e.g. "Refunds available up to 7 days before event" or "All sales final").',
        'Organizers have the unilateral ability to approve manual refunds through their Organizer Orders portal at any time.',
        'Free RSVP cancellations can be released anytime via your ticket dashboard to free up spots for waitlisted attendees.'
      ]
    }
  ];

  const steps = [
    {
      step: '1',
      title: 'Open Your Tickets',
      desc: 'Log in and navigate to My Tickets in your customer account dashboard.'
    },
    {
      step: '2',
      title: 'Select Order',
      desc: 'Click on the specific event order you wish to request a refund or cancellation for.'
    },
    {
      step: '3',
      title: 'Submit Request',
      desc: 'Click "Request Refund", choose your reason, and provide any pertinent details.'
    },
    {
      step: '4',
      title: 'Receive Funds',
      desc: 'Once approved, refunds are credited back to your original payment method in 3–7 business days.'
    }
  ];

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 py-16 px-6 max-w-5xl mx-auto w-full space-y-12">
        {/* Header */}
        <div className="space-y-4 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 border border-red-150 text-[#E31B23] text-xs font-bold uppercase tracking-wider">
            <RefreshCw className="w-3.5 h-3.5" />
            Buyer Protection Guarantee
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-zinc-950 tracking-tight leading-tight">
            Refund & Cancellation Policy
          </h1>
          <p className="text-zinc-500 text-xs font-semibold">
            Last Updated: {lastUpdated} • eventsOs Attendee Safety Standard
          </p>
        </div>

        {/* Introduction Callout */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-8 sm:p-10 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-zinc-900 tracking-tight">
            Our Commitment to Transparent Ticketing
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-medium">
            At eventsOs, we recognize that live events are unique and unpredictable. We have designed our refund framework to ensure fairness for both attendees who invest in tickets and organizers who commit upfront capital to venues, artists, and production equipment.
          </p>
        </div>

        {/* Rule Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {refundRules.map((category, idx) => (
            <div key={idx} className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-xs space-y-5">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl border ${category.color}`}>
                  <category.icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-zinc-950">{category.title}</h3>
              </div>
              <ul className="space-y-3">
                {category.points.map((point, pIdx) => (
                  <li key={pIdx} className="flex items-start gap-2.5 text-xs text-zinc-600 font-medium leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 mt-1.5 flex-shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* How to request refund steps */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-8 sm:p-10 shadow-sm space-y-8">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-zinc-950 tracking-tight">
              How to Request a Refund in 4 Simple Steps
            </h2>
            <p className="text-xs text-zinc-500 font-medium">
              Self-service refund management directly inside your attendee dashboard.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((item, idx) => (
              <div key={idx} className="bg-zinc-50 border border-zinc-150 rounded-2xl p-6 space-y-3 relative">
                <span className="text-2xl font-black text-[#E31B23]">{item.step}</span>
                <h4 className="text-sm font-bold text-zinc-900">{item.title}</h4>
                <p className="text-xs text-zinc-500 leading-relaxed font-medium">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
              <Clock className="w-4 h-4 text-zinc-400" />
              <span>Standard bank settlement processing takes 3–7 business days depending on your bank provider.</span>
            </div>
            <Link to="/dashboard/tickets">
              <button className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer">
                Go to My Tickets <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </Link>
          </div>
        </div>

        {/* Escalations & Safety */}
        <div className="bg-red-50/60 border border-red-150 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <h3 className="text-base font-bold text-zinc-950">
              Organizer Unresponsive or Suspect an Event Fraud?
            </h3>
            <p className="text-xs text-zinc-600 leading-relaxed font-medium max-w-xl">
              If an event has been cancelled or an organizer has failed to respond to your valid refund inquiry within 5 business days, our Trust & Safety team can intervene and execute an administrative reversal.
            </p>
          </div>
          <Link to="/report" className="flex-shrink-0">
            <button className="px-6 py-3 bg-[#E31B23] hover:bg-[#B91C1C] text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer">
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
