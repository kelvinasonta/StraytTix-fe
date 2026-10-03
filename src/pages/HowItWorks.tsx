import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { Compass, Ticket, Smartphone, Check } from 'lucide-react';
import Button from '../components/ui/Button';
import { Link } from 'react-router-dom';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      icon: Compass,
      title: '1. Discover Experiences',
      desc: 'Browse our highly curated catalog of high-end music festivals, business summits, art shows, and fashion weeks.'
    },
    {
      icon: Ticket,
      title: '2. Select Your Tier',
      desc: 'Pick between General Admission, VIP passes, or exclusive group packages. Secure your spot with structured pricing.'
    },
    {
      icon: Smartphone,
      title: '3. Instant Checkout',
      desc: 'Complete payment securely using local payout architectures. Your digital tickets are instantly generated.'
    },
    {
      icon: Check,
      title: '4. Scan & Enjoy',
      desc: 'Show up, present your ticket QR code on your mobile dashboard, get scanned by staff, and enjoy the experience.'
    }
  ];

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-between">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-6 py-16 space-y-16">
        <div className="space-y-6 text-center">
          <span className="text-xs font-black text-brand-accent tracking-wider uppercase">
            HOW IT WORKS
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-zinc-950 tracking-tight leading-tight">
            Simple. Secure. Built for scale.
          </h1>
          <p className="text-zinc-500 text-sm font-semibold max-w-md mx-auto leading-relaxed">
            Discovering and hosting events shouldn't be complicated. Here is a quick overview of how the eventsOs lifecycle works.
          </p>
        </div>

        {/* Steps container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {steps.map((step, idx) => (
            <div key={idx} className="bg-white border border-zinc-150 p-6 rounded-2xl shadow-sm flex gap-4">
              <div className="p-3 bg-red-50 text-brand-accent rounded-xl w-fit h-fit flex-shrink-0">
                <step.icon className="w-5 h-5" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-bold text-zinc-950">{step.title}</h3>
                <p className="text-xs text-zinc-500 leading-relaxed font-semibold">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center pt-8">
          <Link to="/register">
            <Button variant="primary" fullWidth={false} className="px-8 py-3">
              Create Your Account Now
            </Button>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HowItWorks;
