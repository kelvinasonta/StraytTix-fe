import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Button from '../components/ui/Button';
import { Check, Sparkles, HelpCircle, ArrowRight, ShieldCheck, Zap, Server } from 'lucide-react';

export const Pricing: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'per_ticket' | 'annual'>('per_ticket');
  const [estimatedTickets, setEstimatedTickets] = useState(500);
  const [averagePrice, setAveragePrice] = useState(50);

  const calculateFees = () => {
    const grossVolume = estimatedTickets * averagePrice;
    const platformFee = grossVolume * 0.025 + estimatedTickets * 0.5;
    const organizerPayout = grossVolume - platformFee;
    return { grossVolume, platformFee, organizerPayout };
  };

  const { grossVolume, platformFee, organizerPayout } = calculateFees();

  const plans = [
    {
      name: 'Community & Free',
      badge: 'Always Free',
      description: 'Perfect for free meetups, workshops, RSVP gatherings, and non-profit community sessions.',
      price: '$0',
      period: 'per free ticket',
      subtext: 'No credit card required to start',
      ctaText: 'Host Free Event',
      ctaLink: '/organizer/events/create',
      ctaVariant: 'outline' as const,
      popular: false,
      features: [
        'Unlimited free RSVP tickets',
        'Mobile QR ticket scanning app',
        'Custom event registration forms',
        'Live attendee check-in roster',
        'Email ticket delivery with PDF pass',
        'Basic analytics & registration counts'
      ]
    },
    {
      name: 'Pro Organizer',
      badge: 'Most Popular',
      description: 'For growing creators, music festivals, summits, and clubs demanding high conversion and custom branding.',
      price: '2.5%',
      period: '+ $0.50 per paid ticket',
      subtext: 'Passed to buyer or absorbed by organizer',
      ctaText: 'Start Selling Tickets',
      ctaLink: '/register',
      ctaVariant: 'primary' as const,
      popular: true,
      features: [
        'All Community features included',
        'Next-day direct bank payouts',
        'Multi-tier ticketing (VIP, Early Bird, Group)',
        'Invite-only & passcode protected tickets',
        'Custom promo codes & flash sale rules',
        'Attendee approval & waitlist engine',
        'Team access & permissions (Owner, Staff, Gate)',
        'Detailed sales & revenue analytics'
      ]
    },
    {
      name: 'Enterprise & Scale',
      badge: 'Custom Platform',
      description: 'Dedicated cloud infrastructure, custom domain white-labeling, and high-concurrency stadium ticketing.',
      price: 'Custom',
      period: 'volume-based discounts',
      subtext: 'For events with 10,000+ attendees',
      ctaText: 'Contact Enterprise',
      ctaLink: '/about',
      ctaVariant: 'outline' as const,
      popular: false,
      features: [
        'Dedicated account manager & on-site support',
        'High-speed Developer REST API (100k req/min)',
        'Custom branded white-label ticket portal',
        'Custom webhooks & CRM synchronization',
        'Offline handheld gate scanning kits',
        '99.99% uptime SLA guarantee',
        'Custom invoice & wire settlement options'
      ]
    }
  ];

  const faqs = [
    {
      q: 'Who pays the ticketing fees?',
      a: 'You choose! By default, the 2.5% + $0.50 platform fee is added to the ticket price paid by the buyer. Alternatively, you can absorb the fee in your event settings so the buyer sees a flat, all-inclusive price.'
    },
    {
      q: 'When do I receive my ticket sale proceeds?',
      a: 'Payouts are automated! Funds clear directly to your linked bank account on a rolling T+1 or T+2 schedule, or immediately following your event depending on your organizer tier.'
    },
    {
      q: 'Are there monthly subscription fees or setup costs?',
      a: 'Zero monthly fees. You only pay when you sell paid tickets. If your event is free or community-run, StraytTix is 100% free with no limits on attendee count.'
    },
    {
      q: 'Do you offer Developer API access?',
      a: 'Yes! Pro and Enterprise accounts have full access to our REST API to query events, automate attendee issuance, listen to Webhook triggers, and build custom checkout experiences.'
    }
  ];

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 py-16 px-6 max-w-7xl mx-auto w-full space-y-20">
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 border border-red-150 text-[#E31B23] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Simple, Transparent SaaS Pricing
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-zinc-950 tracking-tight leading-tight">
            Pay only when you sell tickets. <br className="hidden sm:inline" />
            Zero upfront fees.
          </h1>
          <p className="text-zinc-600 text-base leading-relaxed font-medium">
            Host unlimited free events with zero cost. When selling paid tickets, enjoy industry-leading low rates with lightning-fast next-day payouts.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-200 ${
                plan.popular
                  ? 'bg-white border-2 border-[#E31B23] shadow-xl ring-4 ring-red-500/10'
                  : 'bg-white border border-zinc-200 shadow-sm hover:border-zinc-300'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#E31B23] text-white text-xs font-black uppercase tracking-wider px-4 py-1 rounded-full shadow-sm">
                  {plan.badge}
                </div>
              )}

              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-zinc-900">{plan.name}</h3>
                    {!plan.popular && (
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-600">
                        {plan.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 leading-relaxed min-h-[36px]">
                    {plan.description}
                  </p>
                </div>

                {/* Price Display */}
                <div className="py-4 border-y border-zinc-100 space-y-1">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-black text-zinc-950 tracking-tight">{plan.price}</span>
                    <span className="text-xs font-semibold text-zinc-500">{plan.period}</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-medium">{plan.subtext}</p>
                </div>

                {/* Features List */}
                <div className="space-y-3">
                  <p className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Included Features:</p>
                  <ul className="space-y-2.5">
                    {plan.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2.5 text-xs text-zinc-600 font-medium">
                        <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 stroke-[2.5]" />
                        </div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* CTA Button */}
              <div className="pt-8">
                <Link to={plan.ctaLink} className="block">
                  <Button
                    variant={plan.ctaVariant}
                    fullWidth
                    className={`py-3 text-xs font-bold rounded-xl ${
                      plan.popular ? 'bg-[#E31B23] hover:bg-[#B91C1C] text-white shadow-md' : ''
                    }`}
                  >
                    {plan.ctaText}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Interactive Earnings Calculator */}
        <div className="bg-white rounded-3xl border border-zinc-200 p-8 md:p-12 shadow-sm space-y-8">
          <div className="max-w-2xl">
            <span className="text-xs font-bold text-[#E31B23] uppercase tracking-wider">Interactive Estimator</span>
            <h2 className="text-2xl md:text-3xl font-black text-zinc-950 tracking-tight mt-1">
              Calculate your revenue & payouts
            </h2>
            <p className="text-zinc-500 text-xs font-medium mt-2">
              See exactly how much you take home compared to traditional high-fee ticketing legacy providers.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              {/* Slider 1: Expected Attendees */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-zinc-800">
                  <span>Estimated Attendees / Tickets</span>
                  <span className="text-[#E31B23]">{estimatedTickets.toLocaleString()} tickets</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="10000"
                  step="50"
                  value={estimatedTickets}
                  onChange={(e) => setEstimatedTickets(Number(e.target.value))}
                  className="w-full h-2 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-[#E31B23]"
                />
                <div className="flex justify-between text-[11px] text-zinc-400">
                  <span>50</span>
                  <span>5,000</span>
                  <span>10,000+</span>
                </div>
              </div>

              {/* Slider 2: Average Ticket Price */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-zinc-800">
                  <span>Average Ticket Price</span>
                  <span className="text-[#E31B23]">${averagePrice}</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="500"
                  step="5"
                  value={averagePrice}
                  onChange={(e) => setAveragePrice(Number(e.target.value))}
                  className="w-full h-2 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-[#E31B23]"
                />
                <div className="flex justify-between text-[11px] text-zinc-400">
                  <span>$5</span>
                  <span>$250</span>
                  <span>$500</span>
                </div>
              </div>
            </div>

            {/* Results Card */}
            <div className="bg-zinc-950 rounded-2xl p-6 md:p-8 text-white space-y-6">
              <div className="space-y-1">
                <span className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Estimated Net Organizer Payout</span>
                <div className="text-3xl md:text-4xl font-black text-emerald-400">
                  ${organizerPayout.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-800 text-xs">
                <div>
                  <span className="text-zinc-400 block mb-1">Gross Sales Volume</span>
                  <span className="font-bold text-zinc-100 text-sm">
                    ${grossVolume.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-400 block mb-1">Platform Fee (2.5% + $0.50)</span>
                  <span className="font-bold text-zinc-300 text-sm">
                    ${platformFee.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-zinc-900 rounded-xl flex items-center gap-3 text-xs text-zinc-300 border border-zinc-800">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Next-day bank deposits automatically enabled for all ticket sales.</span>
              </div>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="space-y-8 max-w-4xl mx-auto">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-black text-zinc-950 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-zinc-500 text-xs font-medium">
              Everything you need to know about billing, fees, and payouts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs space-y-2.5">
                <h4 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-[#E31B23] flex-shrink-0" />
                  {faq.q}
                </h4>
                <p className="text-xs text-zinc-500 leading-relaxed font-medium pl-6">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom SaaS Banner */}
        <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 rounded-3xl p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 max-w-xl">
            <h3 className="text-2xl md:text-3xl font-black tracking-tight">
              Ready to elevate your event infrastructure?
            </h3>
            <p className="text-zinc-400 text-xs leading-relaxed font-medium">
              Join thousands of organizers running concerts, hackathons, business summits, and community festivals on StraytTix.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Link to="/organizer/events/create">
              <Button variant="primary" className="bg-[#E31B23] hover:bg-[#B91C1C] px-6 py-3 text-xs font-bold shadow-lg">
                Create Event Now
              </Button>
            </Link>
            <Link to="/api-docs">
              <Button variant="outline" className="text-white border-zinc-700 hover:bg-zinc-800 px-6 py-3 text-xs font-bold">
                Read API Docs
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;
