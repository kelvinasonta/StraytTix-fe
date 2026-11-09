import React, { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { 
  Mail, 
  MessageSquare, 
  MapPin, 
  Phone, 
  Clock, 
  CheckCircle2, 
  Send, 
  ShieldCheck, 
  HelpCircle, 
  Building2,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const ContactUs: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'general',
    message: '',
    orderReference: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setLoading(true);
    // Simulate high-assurance support ticket receipt
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      subject: 'general',
      message: '',
      orderReference: '',
    });
    setSubmitted(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070709] text-zinc-900 dark:text-white flex flex-col justify-between selection:bg-[#E31B23] selection:text-white transition-colors duration-300 antialiased">
      <Navbar />

      <main className="flex-1 py-14 sm:py-20 px-4 sm:px-6 lg:px-12 xl:px-16 2xl:px-20 max-w-[1500px] mx-auto w-full space-y-16">
        {/* Header Hero */}
        <div className="space-y-4 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 dark:bg-white/[0.04] border border-red-200 dark:border-white/10 text-[#E31B23] text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>24/7 Global Concierge & Support</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-zinc-950 dark:text-white tracking-tight leading-[1.08]">
            We&apos;re Here to Help.
          </h1>

          <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base font-normal leading-relaxed">
            Have questions regarding an upcoming event, ticket reservation, organizer payout, or partnership? Reach out to our dedicated team.
          </p>
        </div>

        {/* 3-Column Fast Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0F0F14] border border-zinc-200 dark:border-white/10 shadow-sm dark:shadow-xl space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-[#E31B23] flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-950 dark:text-white">Attendee & Ticket Inquiries</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Need help with a QR pass, order receipt, or event schedule questions?
              </p>
            </div>
            <a
              href="mailto:support@strayttix.com"
              className="text-xs font-mono font-bold text-[#E31B23] hover:underline inline-flex items-center gap-1 pt-2"
            >
              <span>support@strayttix.com</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-[#0F0F14] border border-zinc-200 dark:border-white/10 shadow-sm dark:shadow-xl space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-950 dark:text-white">Organizer Solutions</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Hosting a festival or large summit? Speak with an enterprise event director.
              </p>
            </div>
            <a
              href="mailto:creators@strayttix.com"
              className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 pt-2"
            >
              <span>creators@strayttix.com</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-[#0F0F14] border border-zinc-200 dark:border-white/10 shadow-sm dark:shadow-xl space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-950 dark:text-white">Trust, Safety & Dispute</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Urgent ticket resolution, fraud triage, and refund compliance team.
              </p>
            </div>
            <Link
              to="/report"
              className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 pt-2"
            >
              <span>Report an Issue &rarr;</span>
            </Link>
          </div>
        </div>

        {/* Main Interactive Form & Operational Info */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 max-w-5xl mx-auto items-start">
          {/* Left Column: Form (7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-[#0F0F14] border border-zinc-200 dark:border-white/10 rounded-3xl p-6 sm:p-10 shadow-lg dark:shadow-2xl">
            {submitted ? (
              <div className="text-center py-12 space-y-5">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-lg">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-zinc-950 dark:text-white">Message Dispatched!</h3>
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
                    Thank you, {formData.name}. Our support team has logged your message under priority ticket reference <strong>#ST-{Math.floor(100000 + Math.random() * 900000)}</strong>.
                  </p>
                </div>
                <div className="pt-3">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-6 py-2.5 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-white/10 dark:hover:bg-white/15 text-zinc-900 dark:text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    Send Another Message
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-white tracking-tight">
                    Send a Direct Message
                  </h2>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    Average response turnaround: <strong>under 15 minutes</strong>.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                      Your Full Name <span className="text-[#E31B23]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Alex Morgan"
                      className="w-full bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 rounded-2xl px-4 py-3 text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-[#E31B23] focus:bg-white dark:focus:bg-white/[0.06] transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                      Email Address <span className="text-[#E31B23]">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="alex@example.com"
                      className="w-full bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 rounded-2xl px-4 py-3 text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-[#E31B23] focus:bg-white dark:focus:bg-white/[0.06] transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                      Inquiry Category
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full bg-zinc-50 dark:bg-[#0B0B10] border border-zinc-200 dark:border-white/10 rounded-2xl px-4 py-3 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#E31B23] transition-all cursor-pointer"
                    >
                      <option value="general">General Support</option>
                      <option value="ticket">Ticket Pass & QR Delivery</option>
                      <option value="refund">Refund / Event Rescheduling</option>
                      <option value="organizer">Organizer Console & Payouts</option>
                      <option value="enterprise">Corporate & Brand Partnership</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                      Order / Ticket Ref (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.orderReference}
                      onChange={(e) => setFormData({ ...formData, orderReference: e.target.value })}
                      placeholder="e.g. ORD-982314"
                      className="w-full bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 rounded-2xl px-4 py-3 text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-[#E31B23] focus:bg-white dark:focus:bg-white/[0.06] transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                    Your Message <span className="text-[#E31B23]">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe how we can assist you with your booking or event..."
                    className="w-full bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 rounded-2xl p-4 text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-[#E31B23] focus:bg-white dark:focus:bg-white/[0.06] transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-[#E31B23] hover:bg-[#C9141B] disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-xl hover:shadow-[0_8px_20px_-2px_rgba(227,27,35,0.6)] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{loading ? 'Dispatched to Queue...' : 'Transmit Inquiry'}</span>
                </button>
              </form>
            )}
          </div>

          {/* Right Column: Fast Knowledge & Headquarters Info (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#0F0F14] border border-zinc-200 dark:border-white/10 shadow-sm dark:shadow-xl space-y-4">
              <h3 className="text-base font-bold text-zinc-950 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#E31B23]" />
                <span>Response Timelines</span>
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Our operations desk operates 24 hours a day, 7 days a week. For event-day gate entry emergencies, ticket dispatches, or verification flags, our on-call engineers respond in minutes.
              </p>
              <div className="pt-2 border-t border-zinc-200 dark:border-white/10 space-y-2 text-xs font-mono text-zinc-600 dark:text-zinc-300">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Live Ticket Dispatch:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">Instant Automated</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Email Inquiries:</span>
                  <span className="text-zinc-950 dark:text-white font-bold">&lt; 15 mins</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Gate Terminal Support:</span>
                  <span className="text-zinc-950 dark:text-white font-bold">Real-time live hotline</span>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#0F0F14] border border-zinc-200 dark:border-white/10 shadow-sm dark:shadow-xl space-y-4">
              <h3 className="text-base font-bold text-zinc-950 dark:text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#E31B23]" />
                <span>Frequently Answered</span>
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <h4 className="font-bold text-zinc-950 dark:text-white">Didn&apos;t receive your QR ticket?</h4>
                  <p className="text-zinc-600 dark:text-zinc-400 mt-0.5">Check your spam folder or sign in to your dashboard to re-download passes at any time.</p>
                </div>
                <div className="pt-2 border-t border-zinc-100 dark:border-white/5">
                  <h4 className="font-bold text-zinc-950 dark:text-white">How do organizer payouts work?</h4>
                  <p className="text-zinc-600 dark:text-zinc-400 mt-0.5">Automated settlements occur directly into verified bank accounts per your payout schedule.</p>
                </div>
                <div className="pt-2 border-t border-zinc-100 dark:border-white/5">
                  <Link to="/how-it-works" className="text-[#E31B23] font-bold hover:underline flex items-center gap-1">
                    <span>Read complete guide &rarr;</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ContactUs;

