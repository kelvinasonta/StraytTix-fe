import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../ui/Logo';
import { ArrowRight, Check, ShieldCheck, Zap } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { useTheme } from '../../context/ThemeContext';

export const Footer: React.FC = () => {
  const { settings } = useSettings();
  const { isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  const sitename = settings?.sitename || 'StraytTix';

  return (
    <footer className="relative bg-zinc-100 dark:bg-[#070709] border-t border-zinc-200 dark:border-white/5 pt-20 pb-12 px-4 sm:px-6 lg:px-12 xl:px-16 2xl:px-20 text-zinc-600 dark:text-zinc-400 overflow-hidden transition-colors duration-300">
      {/* Subtle Ambient Red Glow Accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[250px] bg-[#E31B23]/10 blur-[180px] rounded-full pointer-events-none" />

      <div className="max-w-[1600px] mx-auto space-y-16 relative z-10">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12">
          
          {/* Brand & Mission */}
          <div className="lg:col-span-4 space-y-5 max-w-sm">
            <Logo to="/" size="md" variant={isDark ? 'light' : 'dark'} />
            <p className="text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm leading-relaxed font-normal">
              The high-assurance event marketplace and ticketing infrastructure. Discover curated concerts, secret raves, tech summits, and festivals — with zero setup fees, instant payouts, and cryptographic pass verification.
            </p>

            {/* Social Icons (Dark/Light Glass Pills) */}
            <div className="flex items-center gap-2.5 pt-2">
              <a 
                href="#twitter" 
                aria-label="Twitter / X" 
                className="w-9 h-9 rounded-xl bg-white dark:bg-white/[0.04] hover:bg-[#E31B23] border border-zinc-200 dark:border-white/10 hover:border-[#E31B23] text-zinc-700 dark:text-zinc-300 hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a 
                href="#instagram" 
                aria-label="Instagram" 
                className="w-9 h-9 rounded-xl bg-white dark:bg-white/[0.04] hover:bg-[#E31B23] border border-zinc-200 dark:border-white/10 hover:border-[#E31B23] text-zinc-700 dark:text-zinc-300 hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689-.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a 
                href="#linkedin" 
                aria-label="LinkedIn" 
                className="w-9 h-9 rounded-xl bg-white dark:bg-white/[0.04] hover:bg-[#E31B23] border border-zinc-200 dark:border-white/10 hover:border-[#E31B23] text-zinc-700 dark:text-zinc-300 hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
            </div>

            {/* Trust Micro-Badges */}
            <div className="pt-2 flex items-center gap-4 text-xs font-mono text-zinc-500">
              <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
                <ShieldCheck className="w-3.5 h-3.5 text-[#E31B23]" /> PCI-DSS Handshake
              </span>
              <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
                <Zap className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" /> Instant Pass Delivery
              </span>
            </div>
          </div>

          {/* Platform Links */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-950 dark:text-white font-bold">Platform</h4>
            <ul className="space-y-3 text-xs sm:text-sm font-medium">
              <li><Link to="/discover" className="hover:text-[#E31B23] transition-colors">Discover Events</Link></li>
              <li><Link to="/how-it-works" className="hover:text-[#E31B23] transition-colors">How It Works</Link></li>
              <li><Link to="/pricing" className="hover:text-[#E31B23] transition-colors">Pricing & Fees</Link></li>
              <li><Link to="/download" className="hover:text-[#E31B23] transition-colors">Mobile App</Link></li>
              <li><Link to="/blog" className="hover:text-[#E31B23] transition-colors">Blog & Guides</Link></li>
              <li>
                <Link to="/api-docs" className="hover:text-[#E31B23] transition-colors flex items-center gap-2">
                  <span>Developer API</span>
                  <span className="text-[10px] font-mono bg-zinc-200 dark:bg-white/10 text-zinc-900 dark:text-white font-bold px-1.5 py-0.5 rounded-md border border-zinc-300 dark:border-white/10">v1</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* For Organizers & Trust */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-950 dark:text-white font-bold">Organizers & Trust</h4>
            <ul className="space-y-3 text-xs sm:text-sm font-medium">
              <li><Link to="/organizer/events/create" className="hover:text-[#E31B23] transition-colors">Host an Event</Link></li>
              <li><Link to="/organizer/events" className="hover:text-[#E31B23] transition-colors">Organizer Portal</Link></li>
              <li><Link to="/contact" className="hover:text-[#E31B23] transition-colors">Contact Support</Link></li>
              <li><Link to="/report" className="text-amber-500 hover:text-amber-400 font-semibold flex items-center gap-1 transition-colors">Report an Event</Link></li>
              <li><Link to="/refund-policy" className="hover:text-[#E31B23] transition-colors">Refund Policy</Link></li>
              <li><Link to="/terms" className="hover:text-[#E31B23] transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-[#E31B23] transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Company & Newsletter */}
          <div className="lg:col-span-4 space-y-4">
            <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-950 dark:text-white font-bold">Stay Connected</h4>
            <p className="text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm font-normal leading-relaxed">
              Get notified of secret ticket drops, early bird VIP access, and curated weekly experiences in your city.
            </p>
            {subscribed ? (
              <div className="flex items-center gap-2.5 text-xs font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-4 py-3 rounded-2xl">
                <Check className="w-4 h-4 shrink-0" />
                <span>Subscribed! Check your inbox for upcoming drops.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-3">
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address..."
                    required
                    className="w-full bg-white dark:bg-white/[0.04] border border-zinc-200 dark:border-white/10 rounded-2xl px-4 py-3 text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-[#E31B23] focus:bg-white dark:focus:bg-white/[0.07] transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-[#E31B23] hover:bg-[#C9141B] text-white text-xs sm:text-sm font-bold rounded-2xl transition-all shadow-lg hover:shadow-[0_8px_20px_-2px_rgba(227,27,35,0.6)] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Subscribe to Drops</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>

        </div>

        {/* Bottom Sub-bar */}
        <div className="pt-8 border-t border-zinc-200 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-zinc-500 gap-4">
          <span>&copy; {new Date().getFullYear()} {sitename} Technologies Inc. All rights reserved.</span>
          <div className="flex flex-wrap items-center gap-5 text-xs font-mono">
            <Link to="/how-it-works" className="hover:text-zinc-950 dark:hover:text-zinc-300 transition-colors">How It Works</Link>
            <Link to="/pricing" className="hover:text-zinc-950 dark:hover:text-zinc-300 transition-colors">Pricing</Link>
            <Link to="/terms" className="hover:text-zinc-950 dark:hover:text-zinc-300 transition-colors">Terms</Link>
            <Link to="/privacy" className="hover:text-zinc-950 dark:hover:text-zinc-300 transition-colors">Privacy</Link>
            <Link to="/refund-policy" className="hover:text-zinc-950 dark:hover:text-zinc-300 transition-colors">Refunds</Link>
            <Link to="/api-docs" className="hover:text-zinc-950 dark:hover:text-zinc-300 transition-colors">API Docs</Link>
            <Link to="/report" className="text-amber-500 hover:text-amber-300 transition-colors">Report</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
