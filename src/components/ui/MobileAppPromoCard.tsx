import React from 'react';
import { QrCode, ShieldCheck, Sparkles, BellRing, Zap } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export interface MobileAppPromoCardProps {
  title?: string;
  subtitle?: string;
  description?: string;
  googlePlayUrl?: string;
  appStoreUrl?: string;
  variant?: 'default' | 'compact';
  className?: string;
}

export const MobileAppPromoCard: React.FC<MobileAppPromoCardProps> = ({
  title = 'Never miss an event.',
  subtitle,
  description = 'Instant offline QR passes, real-time gate updates, and VIP priority drops right in your pocket.',
  googlePlayUrl = '/download',
  appStoreUrl = '/download',
  variant = 'default',
  className = '',
}) => {
  const { settings } = useSettings();
  const brandName = settings?.sitename || 'StraytTix';
  const resolvedSubtitle = subtitle || `Get ${brandName} Pass on Mobile`;

  return (
    <div
      className={`group relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#09090D] via-[#101018] to-[#070709] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.35)] my-6 transition-all duration-500 hover:border-white/20 ${
        variant === 'compact' ? 'p-5 sm:p-6' : 'p-6 sm:p-8 lg:p-10'
      } ${className}`}
    >
      {/* Luxury Ambient Lighting & Architectural Grid */}
      <div className="absolute -right-16 -top-16 w-80 h-80 bg-[#E31B23]/20 rounded-full blur-3xl pointer-events-none group-hover:bg-[#E31B23]/25 transition-all duration-700" />
      <div className="absolute -left-20 -bottom-20 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Top Subtle Specular Highlight Line */}
      <div className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        {/* Left Column: Luxury Editorial Copy & Value Pills */}
        <div className="space-y-4 max-w-xl">
          {/* Eyebrow Luxury Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/15 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400/30" />
            <span className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-200">
              VIP Mobile Wallet & Pass
            </span>
          </div>

          <div className="space-y-1.5">
            <h4 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              {title}
            </h4>
            <p className="text-sm sm:text-base font-extrabold bg-gradient-to-r from-[#E31B23] via-rose-400 to-amber-300 bg-clip-text text-transparent inline-block">
              {resolvedSubtitle}
            </p>
          </div>

          {variant !== 'compact' && description && (
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-medium">
              {description}
            </p>
          )}

          {/* Micro Luxury Perks Row */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1 text-[11px] font-semibold text-zinc-300">
            <span className="inline-flex items-center gap-1.5">
              <QrCode className="w-3.5 h-3.5 text-[#E31B23]" />
              <span>Offline QR Access</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>1-Tap Fast-Track Entry</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <BellRing className="w-3.5 h-3.5 text-emerald-400" />
              <span>Live Gate Alerts</span>
            </span>
          </div>
        </div>

        {/* Right Column: Floating Glass Pass Preview + Store Badges */}
        <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-stretch sm:items-center gap-4 flex-shrink-0">
          {/* Decorative Mini VIP Pass Stub (Desktop / Tablet accent) */}
          {variant !== 'compact' && (
            <div className="hidden sm:flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl shadow-inner">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E31B23] to-[#991B1B] p-2 flex items-center justify-center text-white shadow-md shadow-[#E31B23]/25">
                <QrCode className="w-6 h-6" />
              </div>
              <div className="pr-1">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-white">
                    {brandName} Pass
                  </span>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span className="text-[10px] text-zinc-400 font-medium block">
                  Encrypted Digital Entry
                </span>
              </div>
            </div>
          )}

          {/* Store Action Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            {/* Google Play Store Badge */}
            <a
              href={googlePlayUrl}
              className="flex-1 sm:flex-initial group/btn relative px-4 py-3 rounded-2xl bg-white/[0.07] hover:bg-white/[0.14] text-white border border-white/15 hover:border-white/30 transition-all duration-300 flex items-center gap-3 shadow-lg hover:-translate-y-0.5 active:translate-y-0"
            >
              <svg
                className="w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover/btn:scale-110"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M3.609 1.814L13.792 12 3.61 22.186a1.75 1.75 0 0 1-.61-1.334V3.148c0-.517.224-.998.609-1.334z"
                  fill="#32BBFF"
                />
                <path
                  d="M17.256 8.536L13.792 12l3.464 3.464 3.91-2.257c.78-.45.78-1.577 0-2.027l-3.91-2.644z"
                  fill="#FFCE00"
                />
                <path
                  d="M13.792 12L3.61 22.186c.426.37.988.458 1.503.16l12.143-6.81L13.792 12z"
                  fill="#F14336"
                />
                <path
                  d="M13.792 12l3.464-3.464L5.113 1.654c-.515-.298-1.077-.21-1.504.16L13.792 12z"
                  fill="#00F076"
                />
              </svg>
              <div className="text-left leading-none">
                <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 block">
                  Get it on
                </span>
                <span className="text-xs sm:text-sm font-black text-white tracking-tight mt-0.5 block whitespace-nowrap">
                  Google Play
                </span>
              </div>
            </a>

            {/* Apple App Store Badge */}
            <a
              href={appStoreUrl}
              className="flex-1 sm:flex-initial group/btn relative px-4 py-3 rounded-2xl bg-white text-zinc-950 hover:bg-zinc-100 border border-white transition-all duration-300 flex items-center gap-3 shadow-[0_8px_24px_rgba(255,255,255,0.12)] hover:-translate-y-0.5 active:translate-y-0"
            >
              <svg
                className="w-5 h-5 flex-shrink-0 fill-current transition-transform duration-300 group-hover/btn:scale-110"
                viewBox="0 0 24 24"
              >
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.96 6.33c.67-.81 1.12-1.94 1-3.08-.96.04-2.13.64-2.82 1.45-.61.7-.15 1.86-1.01 2.97 1.08.08 2.16-.53 2.83-1.34z" />
              </svg>
              <div className="text-left leading-none">
                <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 block">
                  Download on
                </span>
                <span className="text-xs sm:text-sm font-black text-zinc-950 tracking-tight mt-0.5 block whitespace-nowrap">
                  App Store
                </span>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileAppPromoCard;
