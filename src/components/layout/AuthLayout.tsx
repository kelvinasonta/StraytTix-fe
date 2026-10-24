import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../ui/Logo';
import { ArrowLeft, CheckCircle2, ShieldCheck, MapPin } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-[100dvh] grid grid-cols-1 lg:grid-cols-12 bg-white text-zinc-900">
      
      {/* Left Form Area (5 cols on lg, 6 cols on xl) */}
      <div className="lg:col-span-6 xl:col-span-5 flex flex-col justify-between p-6 sm:p-10 md:p-14 lg:p-12 xl:p-16 bg-white z-10">
        
        {/* Header with Logo and Return Link */}
        <header className="flex items-center justify-between mb-8 sm:mb-10">
          <Logo to="/" size="md" />
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>Back to events</span>
          </Link>
        </header>

        {/* Form Container */}
        <div className="my-auto max-w-md w-full mx-auto space-y-6">
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-950">
              {title}
            </h1>
            <p className="text-zinc-500 text-sm font-normal leading-relaxed">
              {subtitle}
            </p>
          </div>

          {children}
        </div>

        {/* Clean, Legal Footer */}
        <footer className="mt-10 pt-6 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-400">
          <span>&copy; {new Date().getFullYear()} Eventa Technologies</span>
          <div className="flex items-center gap-4">
            <Link to="/terms" className="hover:text-zinc-600 transition-colors">Terms</Link>
            <span>•</span>
            <Link to="/privacy" className="hover:text-zinc-600 transition-colors">Privacy</Link>
            <span>•</span>
            <Link to="/about" className="hover:text-zinc-600 transition-colors">Help</Link>
          </div>
        </footer>
      </div>

      {/* Right Visual Area (6 cols on lg, 7 cols on xl) */}
      <div className="hidden lg:col-span-6 xl:col-span-7 lg:relative lg:flex flex-col justify-between p-12 xl:p-16 overflow-hidden bg-zinc-950 text-white">
        
        {/* Background Atmospheric Event Image */}
        <img
          src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1600&q=85"
          alt="Concert stage atmosphere"
          className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-luminosity"
        />
        
        {/* Deep, natural vignetting overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-zinc-950/40" />

        {/* Top Tagline */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-zinc-200 border border-white/15">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Verified Live Event Platform</span>
          </div>

          <span className="text-xs font-mono text-zinc-400">
            eventsos.live
          </span>
        </div>

        {/* Center Floating Pass Preview */}
        <div className="relative z-10 my-auto py-8">
          <div className="max-w-md mx-auto bg-zinc-900/90 backdrop-blur-xl border border-white/15 rounded-3xl p-6 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-red-400 font-bold">
                Live Pass Preview
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-800/40">
                <CheckCircle2 className="w-3 h-3" />
                <span>Instant QR Ready</span>
              </span>
            </div>

            <div>
              <h3 className="text-xl font-black text-white tracking-tight">
                Afrobeats Symphony Live '26
              </h3>
              <p className="text-xs text-zinc-400 flex items-center gap-1.5 mt-1 font-medium">
                <MapPin className="w-3.5 h-3.5 text-[#E31B23]" />
                <span>Eko Convention Centre • Victoria Island, Lagos</span>
              </p>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
              <div>
                <span className="text-zinc-500 block text-[10px] uppercase font-mono">Entry Tier</span>
                <span className="font-bold text-zinc-200">VIP Golden Circle</span>
              </div>
              <div className="text-right">
                <span className="text-zinc-500 block text-[10px] uppercase font-mono">Date & Time</span>
                <span className="font-bold text-zinc-200">Oct 24 • Doors 19:00</span>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Testimonial / Social Proof */}
        <div className="relative z-10 max-w-lg space-y-3">
          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-normal italic">
            "Over 15,000 attendees checked in across our 3 festival stages without a single line bottleneck. Eventa is the most reliable live event infrastructure we've ever operated."
          </p>
          <div className="flex items-center gap-3 pt-1">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
              alt="Festival Director"
              className="w-9 h-9 rounded-full object-cover border border-white/20"
            />
            <div>
              <p className="text-xs font-bold text-white">Tola Adesanya</p>
              <p className="text-[11px] text-zinc-400">Head of Operations, Soundclash Live</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default AuthLayout;
