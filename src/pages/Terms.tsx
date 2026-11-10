import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { Shield, FileText } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { getFeeConfig } from '../utils/fees';

export const Terms: React.FC = () => {
  const { settings } = useSettings();
  const { percentage: feePct, fixed: feeFixed } = getFeeConfig(settings);
  const lastUpdated = 'September 16, 2026';

  const sections = [
    {
      id: 'acceptance',
      title: '1. Acceptance of Terms',
      content: `By accessing, browsing, or using the StraytTix ticketing infrastructure, platform, API, mobile services, or associated software (collectively, the "Platform"), you acknowledge that you have read, understood, and unconditionally agree to be bound by these Terms of Service. If you do not agree to these terms, you must discontinue use of the Platform immediately.`
    },
    {
      id: 'accounts',
      title: '2. User Accounts & Identity Verification',
      content: `To publish events, sell tickets, or manage team members, you must register for an Organizer or Customer account. You represent and warrant that all registration information you submit is truthful, accurate, and kept current. You are solely responsible for maintaining the confidentiality of your credentials and API keys. We reserve the right to suspend or terminate accounts that provide misleading information or engage in suspicious ticket distribution.`
    },
    {
      id: 'organizer-obligations',
      title: '3. Organizer Obligations & Event Operations',
      content: `Event Organizers are solely responsible for: (a) accurately describing event details, timings, venues, age restrictions, and refund policies; (b) ensuring compliance with all local health, safety, venue permitting, and fire code regulations; (c) honoring all validly issued QR digital tickets generated through the Platform; and (d) communicating any date changes, venue alterations, or cancellations promptly to ticket holders.`
    },
    {
      id: 'fees-payouts',
      title: '4. Ticketing Fees, Taxes & Payout Settlements',
      content: `StraytTix charges a platform service fee on paid tickets (standard ${feePct}% + ₦${feeFixed} per ticket unless custom enterprise contracts apply). Fees can be absorbed by the organizer or added to buyer checkout totals. Payouts for ticket revenue are disbursed on an automated rolling schedule directly to the organizer's verified bank account or settlement ledger, subject to standard anti-fraud reserves and chargeback deductions.`
    },
    {
      id: 'ticket-purchases',
      title: '5. Ticket Purchases, Entry & Scalping Prohibition',
      content: `Tickets issued through StraytTix are revocable licenses that grant admission to the specified event. Duplicate reproduction, unauthorized commercial reselling above face value, or generation of counterfeit barcodes is strictly prohibited. The event venue or organizer reserves the right to deny entry if ticket authenticity cannot be cryptographically verified at the gate.`
    },
    {
      id: 'cancellations-refunds',
      title: '6. Cancellations & Postponements',
      content: `If an event is permanently cancelled, the organizer must promptly issue full refunds to all ticket purchasers or authorize StraytTix to initiate automated batch reversals. In the event of postponement or major relocation, ticket holders must be granted an opportunity to request a refund if they cannot attend the rescheduled date. Please refer to our Refund Policy for complete details.`
    },
    {
      id: 'api-usage',
      title: '7. API Access & Developer Terms',
      content: `Access to the StraytTix REST API, webhook endpoints, and embed widgets is granted on a revocable basis. Developers must adhere to published rate limits, maintain token confidentiality, and never scrape or reverse-engineer attendee identity databases. We reserve the right to throttle or revoke API keys that compromise platform stability.`
    },
    {
      id: 'liability',
      title: '8. Limitation of Liability',
      content: `To the maximum extent permitted by applicable law, StraytTix Technologies Inc., its officers, employees, and affiliates shall not be liable for any indirect, incidental, special, or consequential damages resulting from event cancellations, personal injuries sustained at third-party venues, or unforeseen disruptions beyond reasonable technical control.`
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070709] text-zinc-900 dark:text-white flex flex-col justify-between selection:bg-[#E31B23] selection:text-white transition-colors duration-300">
      <Navbar />

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-12 xl:px-16 2xl:px-20 max-w-[1600px] mx-auto w-full space-y-12">
        {/* Header */}
        <div className="space-y-4 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 dark:bg-white/5 border border-red-200 dark:border-white/10 text-[#E31B23] text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <FileText className="w-3.5 h-3.5" />
            Legal Agreement
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-zinc-950 dark:text-white tracking-tight leading-[1.1]">
            Terms of Service
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm font-normal">
            Last Updated: {lastUpdated} • Version 2.4 (Global SaaS)
          </p>
        </div>

        {/* Highlight Callout */}
        <div className="max-w-4xl mx-auto bg-white dark:bg-[#0F0F14] border border-zinc-200 dark:border-white/10 rounded-2xl p-6 shadow-sm dark:shadow-lg backdrop-blur-sm flex items-start gap-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-2xl flex-shrink-0 border border-emerald-200 dark:border-emerald-500/30">
            <Shield className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-zinc-950 dark:text-white">Summary of Key Principles</h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
              We provide the secure software engine connecting attendees and event organizers. Organizers own their events and venue operations; buyers receive cryptographically verified digital passes; and fees are transparent with zero hidden surcharges.
            </p>
          </div>
        </div>

        {/* Content Sections */}
        <div className="max-w-4xl mx-auto bg-white dark:bg-[#0F0F14] border border-zinc-200 dark:border-white/10 rounded-3xl p-8 sm:p-14 shadow-sm dark:shadow-2xl backdrop-blur-md space-y-10">
          {sections.map((sec) => (
            <section key={sec.id} id={sec.id} className="space-y-3 pt-8 first:pt-0 border-t border-zinc-200 dark:border-white/10 first:border-t-0">
              <h2 className="text-lg sm:text-xl font-bold text-zinc-950 dark:text-white tracking-tight">
                {sec.title}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
                {sec.content}
              </p>
            </section>
          ))}

          {/* Contact Information */}
          <div className="pt-8 border-t border-zinc-200 dark:border-white/10 space-y-2">
            <h3 className="text-sm font-bold text-zinc-950 dark:text-white">Questions or Legal Inquiries?</h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-normal">
              If you have any questions regarding these Terms or compliance, please reach out to our legal department at{' '}
              <a href="mailto:legal@strayttix.live" className="text-[#E31B23] font-bold underline hover:text-[#B91C1C]">
                legal@strayttix.live
              </a>.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Terms;
