import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { Calendar, Globe, Award, Sparkles } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-between">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-6 py-16 space-y-16">
        {/* Editorial Header */}
        <div className="space-y-6 text-center">
          <span className="text-xs font-black text-brand-accent tracking-wider uppercase">
            WHO WE ARE
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-zinc-950 tracking-tight leading-tight">
            We build experiences worth showing up for.
          </h1>
          <p className="text-zinc-500 text-base max-w-xl mx-auto leading-relaxed font-semibold">
            eventsOs is the next-generation event infrastructure built to simplify discovery, ticketing, and audience management across African creative landscapes.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
          <div className="bg-white border border-zinc-150 p-6 rounded-2xl shadow-sm space-y-4">
            <div className="p-3 bg-red-50 text-brand-accent rounded-xl w-fit">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-zinc-950">Continental Scale</h3>
            <p className="text-xs text-zinc-500 leading-relaxed font-medium">
              Supporting payment infrastructure and localized discovery for creators from Lagos to Nairobi.
            </p>
          </div>

          <div className="bg-white border border-zinc-150 p-6 rounded-2xl shadow-sm space-y-4">
            <div className="p-3 bg-red-50 text-brand-accent rounded-xl w-fit">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-zinc-950">Premium Quality</h3>
            <p className="text-xs text-zinc-500 leading-relaxed font-medium">
              Designed with a flawless editorial aesthetic that respects and elevates high-fashion, art, and music events.
            </p>
          </div>

          <div className="bg-white border border-zinc-150 p-6 rounded-2xl shadow-sm space-y-4">
            <div className="p-3 bg-red-50 text-brand-accent rounded-xl w-fit">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-zinc-950">Fintech Integration</h3>
            <p className="text-xs text-zinc-500 leading-relaxed font-medium">
              Backed by Sanctum state tracking and rapid check-out pipelines for quick, seamless bookings.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
