import React, { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Button from '../components/ui/Button';
import { AlertOctagon, ShieldAlert, CheckCircle2, Clock, Mail, Info } from 'lucide-react';

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
    <div className="min-h-screen bg-brand-bg flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 py-16 px-6 max-w-4xl mx-auto w-full space-y-12">
        {/* Header */}
        <div className="space-y-4 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 border border-red-150 text-[#E31B23] text-xs font-bold uppercase tracking-wider">
            <ShieldAlert className="w-3.5 h-3.5" />
            Trust & Safety Center
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-zinc-950 tracking-tight leading-tight">
            Report an Event or Violation
          </h1>
          <p className="text-zinc-600 text-sm font-medium leading-relaxed">
            Help keep our event community safe and transparent. If you notice fraudulent events, deceptive ticketing, or policy violations, report them directly to our rapid response team.
          </p>
        </div>

        {/* SLA & Review Guarantee */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs flex items-center gap-3.5">
            <div className="p-2.5 bg-red-50 text-[#E31B23] rounded-xl flex-shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-zinc-950">2-Hour SLA</h4>
              <p className="text-[11px] text-zinc-500 font-medium">High priority investigation turnaround</p>
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs flex items-center gap-3.5">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl flex-shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-zinc-950">Escrow Holds</h4>
              <p className="text-[11px] text-zinc-500 font-medium">Ticket payout freezes on flagged events</p>
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs flex items-center gap-3.5">
            <div className="p-2.5 bg-zinc-100 text-zinc-800 rounded-xl flex-shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-zinc-950">Direct Updates</h4>
              <p className="text-[11px] text-zinc-500 font-medium">Case status sent to your email</p>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-8 sm:p-12 shadow-sm">
          {submitted ? (
            <div className="text-center py-12 space-y-4 max-w-md mx-auto">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-zinc-950">Report Submitted</h3>
              <p className="text-xs text-zinc-600 leading-relaxed font-medium">
                Thank you for helping keep the eventsOs platform trustworthy. Case reference <span className="font-mono font-bold text-zinc-900">#SAFE-{Math.floor(100000 + Math.random() * 900000)}</span> has been registered and assigned to an investigator.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setEventName('');
                  setDescription('');
                  setEvidenceUrl('');
                }}
                className="mt-4 px-6 py-2.5 bg-zinc-900 text-white text-xs font-bold rounded-xl hover:bg-zinc-800 cursor-pointer"
              >
                Submit Another Report
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-zinc-950">Report Details</h3>
                <p className="text-xs text-zinc-500 font-medium">
                  Please provide as much specific detail as possible to expedite our audit.
                </p>
              </div>

              <div className="space-y-4">
                {/* Event Name or Link */}
                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-1.5">
                    Event Title or URL <span className="text-[#E31B23]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lagos Tech Fest 2026 or https://eventsos.live/events/..."
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-[#E31B23] transition-colors"
                  />
                </div>

                {/* Reason Select */}
                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-1.5">
                    Violation Category <span className="text-[#E31B23]">*</span>
                  </label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-[#E31B23] transition-colors cursor-pointer"
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
                  <label className="block text-xs font-bold text-zinc-800 mb-1.5">
                    Incident Description <span className="text-[#E31B23]">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe what occurred, including false promises, lack of organizer response, or counterfeit tickets..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-[#E31B23] transition-colors"
                  />
                </div>

                {/* Evidence Link */}
                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-1.5">
                    Supporting Links or Evidence (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="Link to screenshots, social media posts, or official venue statements"
                    value={evidenceUrl}
                    onChange={(e) => setEvidenceUrl(e.target.value)}
                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-[#E31B23] transition-colors"
                  />
                </div>

                {/* Submitter Email */}
                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-1.5">
                    Your Contact Email <span className="text-[#E31B23]">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="Where our Trust & Safety investigator can reach you"
                    value={reporterEmail}
                    onChange={(e) => setReporterEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-[#E31B23] transition-colors"
                  />
                  <p className="text-[11px] text-zinc-400 mt-1">Your identity remains completely confidential and is never shared with the organizer.</p>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
                <span className="text-xs text-zinc-500 font-medium flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-zinc-400" />
                  All reports are audited under strict confidentiality.
                </span>

                <Button
                  type="submit"
                  variant="primary"
                  className="bg-[#E31B23] hover:bg-[#B91C1C] px-6 py-2.5 text-xs font-bold rounded-xl"
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
