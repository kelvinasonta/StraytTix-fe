import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { Lock, Eye, Database, Globe, CheckCircle2 } from 'lucide-react';

export const PrivacyPolicy: React.FC = () => {
  const lastUpdated = 'September 16, 2026';

  const sections = [
    {
      id: 'collection',
      title: '1. Information We Collect',
      content: `We collect information necessary to issue tickets, facilitate secure gate check-ins, and prevent transaction fraud:
      • Account Profile Information: Full name, verified email address, phone number, and password hashes.
      • Order & Transaction Records: Tickets purchased, ticket tiers, amounts paid, payment gateway reference identifiers (we do not store raw card numbers; all payments are processed through PCI-DSS Level 1 certified gateways such as Paystack and Stripe).
      • Organizer Business Credentials: Organization name, bio, social profiles, settlement bank account details, and verification documents.
      • Device & Telemetry Data: IP address, device operating system, browser type, and gate QR scan timestamps.`
    },
    {
      id: 'usage',
      title: '2. How We Use Your Data',
      content: `Your data is processed strictly to deliver our SaaS ticketing infrastructure:
      • Generating and verifying unique encrypted QR digital passes.
      • Sending immediate email confirmations with attached PDF admission vouchers.
      • Providing organizers with attendee rosters for venue access control and emergency notifications.
      • Automated fraud detection and bot mitigation during high-demand ticket drops.
      • Calculating analytics, capacity utilization, and financial settlement accounting.`
    },
    {
      id: 'sharing',
      title: '3. Data Sharing & Third Parties',
      content: `We believe in total transparency. We DO NOT sell, rent, or trade your personal information to third-party ad brokers. Data is shared solely with:
      • The Host / Organizer: When you register or buy a ticket for an event, that specific organizer receives your name, email, and selected ticket tier so they can admit you to the venue.
      • Payment Processors: Direct tokenized transfers to authorized fintech partners to complete charge processing.
      • Legal & Law Enforcement: Only when required by law, subpoena, or to protect individual physical safety at live venues.`
    },
    {
      id: 'security',
      title: '4. Data Security & Cryptography',
      content: `We implement modern defense-in-depth security standards:
      • All web traffic is strictly encrypted in transit using TLS 1.3.
      • Sensitive organizer payout data and user tokens are encrypted at rest using AES-256.
      • Gate check-in QR codes utilize time-synchronized rotating cryptographic nonces to prevent unauthorized ticket cloning.`
    },
    {
      id: 'rights',
      title: '5. Your Privacy Rights & Data Control',
      content: `Depending on your jurisdiction (including GDPR, NDPR, and CCPA), you have the right to:
      • Request an export of all personal data held in your account.
      • Request the deletion or anonymization of your profile, subject to statutory tax record retention requirements.
      • Opt out of promotional newsletters while continuing to receive essential transactional ticket receipts.`
    },
    {
      id: 'cookies',
      title: '6. Cookies & Session Storage',
      content: `We use essential HTTP-only cookies and local session storage solely to maintain your authenticated login session, preserve your shopping cart state during ticket checkout, and guard against cross-site request forgery (CSRF).`
    }
  ];

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 py-16 px-6 max-w-5xl mx-auto w-full space-y-12">
        {/* Header */}
        <div className="space-y-4 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 border border-red-150 text-[#E31B23] text-xs font-bold uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5" />
            Data Protection Standard
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-zinc-950 tracking-tight leading-tight">
            Privacy Policy
          </h1>
          <p className="text-zinc-500 text-xs font-semibold">
            Last Updated: {lastUpdated} • Compliant with Global Privacy Regulations
          </p>
        </div>

        {/* Security Highlight */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs space-y-2">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl w-fit">
              <Eye className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-zinc-950">Zero Ad Tracking</h4>
            <p className="text-xs text-zinc-500 font-medium">We never sell your browsing habits or ticket purchase history to ad networks.</p>
          </div>

          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs space-y-2">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl w-fit">
              <Database className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-zinc-950">AES-256 Encryption</h4>
            <p className="text-xs text-zinc-500 font-medium">All sensitive payment metadata and authentication secrets are encrypted at rest.</p>
          </div>

          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs space-y-2">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl w-fit">
              <Globe className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-zinc-950">Global Portability</h4>
            <p className="text-xs text-zinc-500 font-medium">Download or request deletion of your account records at any time with one click.</p>
          </div>
        </div>

        {/* Sections */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-8 sm:p-12 shadow-sm space-y-10">
          {sections.map((sec) => (
            <section key={sec.id} id={sec.id} className="space-y-3 pt-6 first:pt-0 border-t border-zinc-100 first:border-t-0">
              <h2 className="text-lg sm:text-xl font-bold text-zinc-950 tracking-tight">
                {sec.title}
              </h2>
              <div className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-medium whitespace-pre-line">
                {sec.content}
              </div>
            </section>
          ))}

          {/* Contact Officer */}
          <div className="pt-8 border-t border-zinc-200 space-y-2">
            <h3 className="text-sm font-bold text-zinc-900">Data Protection Officer</h3>
            <p className="text-xs text-zinc-500 font-medium">
              To exercise your privacy rights or contact our designated Data Protection Officer (DPO), please email{' '}
              <a href="mailto:privacy@strayttix.live" className="text-[#E31B23] font-bold underline">
                privacy@strayttix.live
              </a>.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
