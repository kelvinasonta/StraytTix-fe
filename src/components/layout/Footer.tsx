import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../ui/Logo';
import { ArrowRight, Check } from 'lucide-react';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-white border-t border-[#E5E7EB] pt-16 pb-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        {/* Brand & Mission */}
        <div className="lg:col-span-2 space-y-4 max-w-sm">
          <Logo to="/" size="md" />
          <p className="text-zinc-500 text-xs leading-relaxed">
            The modern event marketplace and infrastructure engine. Discover curated concerts, summits, and festivals — or publish your event with instant payouts and zero setup fees.
          </p>

          {/* Social Icons */}
          <div className="flex items-center gap-3 pt-2">
            <a href="#twitter" aria-label="Twitter / X" className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-red-50 hover:text-[#E31B23] text-zinc-600 flex items-center justify-center transition-colors">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="#instagram" aria-label="Instagram" className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-red-50 hover:text-[#E31B23] text-zinc-600 flex items-center justify-center transition-colors">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689-.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
            <a href="#linkedin" aria-label="LinkedIn" className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-red-50 hover:text-[#E31B23] text-zinc-600 flex items-center justify-center transition-colors">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
            </a>
          </div>
        </div>

        {/* Product & Solutions */}
        <div>
          <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-4">Platform</h4>
          <ul className="space-y-2.5 text-xs font-medium text-zinc-500">
            <li><Link to="/discover" className="hover:text-[#E31B23] transition-colors">Discover Events</Link></li>
            <li><Link to="/how-it-works" className="hover:text-[#E31B23] transition-colors">How Tix Works</Link></li>
            <li><Link to="/pricing" className="hover:text-[#E31B23] transition-colors">Pricing & Fees</Link></li>
            <li><Link to="/blog" className="hover:text-[#E31B23] transition-colors">Blog & Guides</Link></li>
            <li><Link to="/api-docs" className="hover:text-[#E31B23] transition-colors flex items-center gap-1.5"><span>Developer API</span><span className="text-[10px] bg-red-50 text-[#E31B23] font-bold px-1.5 py-0.5 rounded">v1</span></Link></li>
          </ul>
        </div>

        {/* For Organizers & Trust */}
        <div>
          <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-4">Organizers & Trust</h4>
          <ul className="space-y-2.5 text-xs font-medium text-zinc-500">
            <li><Link to="/organizer/events/create" className="hover:text-[#E31B23] transition-colors">Host an Event</Link></li>
            <li><Link to="/organizer/events" className="hover:text-[#E31B23] transition-colors">Organizer Portal</Link></li>
            <li><Link to="/report" className="hover:text-[#E31B23] transition-colors text-amber-600 font-semibold flex items-center gap-1"><span>Report an Event</span></Link></li>
            <li><Link to="/refund-policy" className="hover:text-[#E31B23] transition-colors">Refund Policy</Link></li>
            <li><Link to="/terms" className="hover:text-[#E31B23] transition-colors">Terms & Conditions</Link></li>
            <li><Link to="/privacy" className="hover:text-[#E31B23] transition-colors">Privacy Policy</Link></li>
          </ul>
        </div>

        {/* Company & Newsletter */}
        <div>
          <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-4">Stay Connected</h4>
          <p className="text-zinc-500 text-xs mb-3">Get the latest event drops and exclusive pre-sales in your inbox.</p>
          {subscribed ? (
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-2 rounded-xl">
              <Check className="w-4 h-4" /> Subscribed successfully!
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-[#E31B23] transition-all"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-[#E31B23] hover:bg-[#B91C1C] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer"
              >
                Subscribe <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-400 gap-4">
        <span>&copy; {new Date().getFullYear()} eventsOs Technologies Inc. All rights reserved.</span>
        <div className="flex flex-wrap items-center gap-5 text-xs">
          <Link to="/how-it-works" className="hover:text-zinc-600">How It Works</Link>
          <Link to="/pricing" className="hover:text-zinc-600">Pricing</Link>
          <Link to="/terms" className="hover:text-zinc-600">Terms</Link>
          <Link to="/privacy" className="hover:text-zinc-600">Privacy</Link>
          <Link to="/refund-policy" className="hover:text-zinc-600">Refunds</Link>
          <Link to="/api-docs" className="hover:text-zinc-600">API Docs</Link>
          <Link to="/report" className="hover:text-[#E31B23] font-semibold text-amber-600">Report</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
