import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../ui/Logo';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-white text-[#111827]">
      {/* Left Form Area (5 cols on lg) */}
      <div className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-12 md:p-14 lg:p-12 xl:p-16 bg-white z-10">
        {/* Header with Logo */}
        <header className="mb-8">
          <Logo to="/" size="md" />
        </header>

        {/* Form Container */}
        <div className="my-auto max-w-sm w-full mx-auto space-y-6">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111827]">
              {title}
            </h1>
            <p className="text-zinc-500 text-xs sm:text-sm font-medium">
              {subtitle}
            </p>
          </div>

          {children}
        </div>

        {/* Clean subtle footer */}
        <footer className="mt-8 text-[11px] font-medium text-zinc-400 text-center lg:text-left">
          &copy; {new Date().getFullYear()} Eventa Technologies. All rights reserved.
        </footer>
      </div>

      {/* Right Brand Visual Area (7 cols on lg - Full bleed cinematic red concert) */}
      <div className="hidden lg:col-span-7 lg:relative lg:flex flex-col justify-end p-12 xl:p-16 overflow-hidden bg-black">
        {/* Cinematic Concert Image */}
        <img
          src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1600&q=85"
          alt="Live Event Atmosphere"
          className="absolute inset-0 w-full h-full object-cover opacity-85"
        />

        {/* Sophisticated Dark Red Ambient Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-[#B91C1C]/40 to-black/50 mix-blend-multiply" />
        <div className="absolute inset-0 bg-radial from-transparent to-black/60" />

        {/* Content over image matching mockup */}
        <div className="relative z-10 max-w-lg space-y-3 text-white">
          <h2 className="text-3xl xl:text-4xl font-black tracking-tight leading-tight">
            Events bring people <br />
            together. Be part of it.
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-red-200 tracking-wide uppercase">
            Discover. Book. Attend. Create.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
