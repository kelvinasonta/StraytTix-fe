import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { Shield, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

export const Terms: React.FC = () => {
  const lastUpdated = 'September 16, 2026';

  const sections = [
    {
      id: 'acceptance',
      title: '1. Acceptance of Terms',
      content: `By accessing, browsing, or using the eventsOs (also operated as "Tix" or "Eventa") ticketing infrastructure, platform, API, mobile services, or associated software (collectively, the "Platform"), you acknowledge that you have read, understood, and unconditionally agree to be bound by these Terms of Service. If you do not agree to these terms, you must discontinue use of the Platform immediately.`
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
      content: `eventsOs charges a platform service fee on paid tickets (standard 2.5% + $0.50 per ticket unless custom enterprise contracts apply). Fees can be absorbed by the organizer or added to buyer checkout totals. Payouts for ticket revenue are disbursed on an automated rolling schedule directly to the organizer's verified bank account or settlement ledger, subject to standard anti-fraud reserves and chargeback deductions.`
    },
    {
      id: 'ticket-purchases',
      title: '5. Ticket Purchases, Entry & Scalping Prohibition',
      content: `Tickets issued through eventsOs are revocable licenses that grant admission to the specified event. Duplicate reproduction, unauthorized commercial reselling above face value, or generation of counterfeit barcodes is strictly prohibited. The event venue or organizer reserves the right to deny entry if ticket authenticity cannot be cryptographically verified at the gate.`
    },
    {
      id: 'cancellations-refunds',
      title: '6. Cancellations & Postponements',
      content: `If an event is permanently cancelled, the organizer must promptly issue full refunds to all ticket purchasers or authorize eventsOs to initiate automated batch reversals. In the event of postponement or major relocation, ticket holders must be granted an opportunity to request a refund if they cannot attend the rescheduled date. Please refer to our Refund Policy for complete details.`
    },
    {
      id: 'api-usage',
      title: '7. API Access & Developer Terms',
      content: `Access to the eventsOs REST API, webhook endpoints, and embed widgets is granted on a revocable basis. Developers must adhere to published rate limits, maintain token confidentiality, and never scrape or reverse-engineer attendee identity databases. We reserve the right to throttle or revoke API keys that compromise platform stability.`
    },
    {
      id: 'liability',
      title: '8. Limitation of Liability',
      content: `To the maximum extent permitted by applicable law, eventsOs Technologies Inc., its officers, employees, and affiliates shall not be liable for any indirect, incidental, special, or consequential damages resulting from event cancellations, personal injuries sustained at third-party venues, or unforeseen disruptions beyond reasonable technical control.`
    }
  ];

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 py-16 px-6 max-w-5xl mx-auto w-full space-y-12">
        {/* Header */}
        <div className="space-y-4 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 border border-red-150 text-[#E31B23] text-xs font-bold uppercase tracking-wider">
            <FileText className="w-3.5 h-3.5" />
            Legal Agreement
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-zinc-950 tracking-tight leading-tight">
            Terms of Service
          </h1>
          <p className="text-zinc-500 text-xs font-semibold">
            Last Updated: {lastUpdated} • Version 2.4 (Global SaaS)
          </p>
        </div>

        {/* Highlight Callout */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs flex items-start gap-4">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl flex-shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-zinc-900">Summary of Key Principles</h3>
            <p className="text-xs text-zinc-500 leading-relaxed font-medium">
              We provide the secure software engine connecting attendees and event organizers. Organizers own their events and venue operations; buyers receive cryptographically verified digital passes; and fees are transparent with zero hidden surcharges.
            </p>
          </div>
        </div>

        {/* Content Sections */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-8 sm:p-12 shadow-sm space-y-10">
          {sections.map((sec) => (
            <section key={sec.id} id={sec.id} className="space-y-3 pt-6 first:pt-0 border-t border-zinc-100 first:border-t-0">
              <h2 className="text-lg sm:text-xl font-bold text-zinc-950 tracking-tight">
                {sec.title}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-medium">
                {sec.content}
              </p>
            </section>
          ))}

          {/* Contact Information */}
          <div className="pt-8 border-t border-zinc-200 space-y-2">
            <h3 className="text-sm font-bold text-zinc-900">Questions or Legal Inquiries?</h3>
            <p className="text-xs text-zinc-500 font-medium">
              If you have any questions regarding these Terms or compliance, please reach out to our legal department at{' '}
              <a href="mailto:legal@eventsos.live" className="text-[#E31B23] font-bold underline">
                legal@eventsos.live
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
