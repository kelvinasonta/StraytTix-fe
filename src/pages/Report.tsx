import React, { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Button from '../components/ui/Button';
import { ShieldAlert, CheckCircle2, Clock, Mail, Info } from 'lucide-react';

export const Report: React.FC = () => {
  const [eventName, setEventName] = useState('');
  const [reason, setReason] = useState('fraud');
  const [description, setDescription] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [reporterEmail, setReporterEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !reporterEmail) return;
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070709] text-zinc-900 dark:text-white flex flex-col justify-between selection:bg-[#E31B23] selection:text-white transition-colors duration-300">
      <Navbar />

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-12 xl:px-16 2xl:px-20 max-w-[1600px] mx-auto w-full space-y-12">
        {/* Header */}
        <div className="space-y-4 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 dark:bg-white/5 border border-red-200 dark:border-white/10 text-[#E31B23] text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <ShieldAlert className="w-3.5 h-3.5" />
            Trust & Safety Center
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-zinc-950 dark:text-white tracking-tight leading-[1.1]">
            Report an Event or Violation
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base font-normal leading-relaxed">
            Help keep our event community safe and transparent. If you notice fraudulent events, deceptive ticketing, or policy violations, report them directly to our rapid response team.
          </p>
        </div>

        {/* SLA & Review Guarantee */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-white dark:bg-[#0F0F14] border border-zinc-200 dark:border-white/10 rounded-2xl p-6 shadow-sm dark:shadow-lg backdrop-blur-sm flex items-center gap-4">
            <div className="p-3 bg-[#E31B23]/10 dark:bg-[#E31B23]/15 text-[#E31B23] rounded-2xl flex-shrink-0 border border-[#E31B23]/20 dark:border-[#E31B23]/30">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-zinc-950 dark:text-white uppercase tracking-wider">2-Hour SLA</h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 font-normal">High priority investigation turnaround</p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0F0F14] border border-zinc-200 dark:border-white/10 rounded-2xl p-6 shadow-sm dark:shadow-lg backdrop-blur-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-2xl flex-shrink-0 border border-emerald-200 dark:border-emerald-500/30">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-zinc-950 dark:text-white uppercase tracking-wider">Escrow Holds</h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 font-normal">Ticket payout freezes on flagged events</p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0F0F14] border border-zinc-200 dark:border-white/10 rounded-2xl p-6 shadow-sm dark:shadow-lg backdrop-blur-sm flex items-center gap-4">
            <div className="p-3 bg-zinc-100 dark:bg-white/10 text-zinc-700 dark:text-white rounded-2xl flex-shrink-0 border border-zinc-200 dark:border-white/20">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-zinc-950 dark:text-white uppercase tracking-wider">Direct Updates</h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 font-normal">Case status sent to your email</p>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white dark:bg-[#0F0F14] border border-zinc-200 dark:border-white/10 rounded-3xl p-8 sm:p-14 shadow-sm dark:shadow-2xl max-w-4xl mx-auto backdrop-blur-md">
          {submitted ? (
            <div className="text-center py-12 space-y-5 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-500/30">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h3 className="text-2xl font-black text-zinc-950 dark:text-white">Report Submitted</h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
                Thank you for helping keep the StraytTix platform trustworthy. Case reference <span className="font-mono font-bold text-zinc-950 dark:text-white">#SAFE-{Math.floor(100000 + Math.random() * 900000)}</span> has been registered and assigned to an investigator.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setEventName('');
                  setDescription('');
                  setEvidenceUrl('');
                }}
                className="mt-4 px-6 py-3 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-xs font-black rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 cursor-pointer transition-colors shadow-md"
              >
                Submit Another Report
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-zinc-950 dark:text-white">Report Details</h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 font-normal">
                  Please provide as much specific detail as possible to expedite our audit.
                </p>
              </div>

              <div className="space-y-5">
                {/* Event Name or Link */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                    Event Title or URL <span className="text-[#E31B23]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lagos Tech Fest 2026 or https://strayttix.live/events/..."
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/10 rounded-2xl text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-[#E31B23] transition-colors"
                  />
                </div>

                {/* Reason Select */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                    Violation Category <span className="text-[#E31B23]">*</span>
                  </label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#E31B23] transition-colors cursor-pointer"
                  >
                    <option value="fraud">Fraudulent or Fake Event (Misrepresentation)</option>
                    <option value="resale">Unauthorized Ticket Scalping / Reselling Above Face Value</option>
                    <option value="copyright">Copyright or Trademark Infringement</option>
                    <option value="inappropriate">Inappropriate, Illegal, or Explicit Content</option>
                    <option value="safety">Venue Safety, Overcrowding, or Physical Hazard</option>
                    <option value="other">Other Violation</option>
                  </select>
                </div>

                {/* Detailed Description */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                    Incident Description <span className="text-[#E31B23]">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe what occurred, including false promises, lack of organizer response, or counterfeit tickets..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/10 rounded-2xl text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-[#E31B23] transition-colors"
                  />
                </div>

                {/* Evidence Link */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                    Supporting Links or Evidence (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="Link to screenshots, social media posts, or official venue statements"
                    value={evidenceUrl}
                    onChange={(e) => setEvidenceUrl(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/10 rounded-2xl text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-[#E31B23] transition-colors"
                  />
                </div>

                {/* Submitter Email */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                    Your Contact Email <span className="text-[#E31B23]">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="Where our Trust & Safety investigator can reach you"
                    value={reporterEmail}
                    onChange={(e) => setReporterEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/10 rounded-2xl text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-[#E31B23] transition-colors"
                  />
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-2">Your identity remains completely confidential and is never shared with the organizer.</p>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-6 border-t border-zinc-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-xs text-zinc-500 dark:text-zinc-400 font-normal flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-zinc-400" />
                  All reports are audited under strict confidentiality.
                </span>

                <Button
                  type="submit"
                  variant="primary"
                  className="bg-[#E31B23] hover:bg-[#B91C1C] px-8 py-3 text-xs font-bold rounded-2xl shadow-lg shadow-[#E31B23]/25 w-full sm:w-auto"
                >
                  Submit Incident Report
                </Button>
              </div>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Report;
