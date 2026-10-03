import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { Calendar, Clock, ArrowRight, User, Tag, Sparkles, BookOpen } from 'lucide-react';

export const Blog: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Organizer Playbook', 'Product Updates', 'Engineering & APIs', 'Growth & Marketing'];

  const articles = [
    {
      id: 1,
      title: 'How to Sell Out Your Tech Summit in 48 Hours: A Multi-Tier Playbook',
      excerpt: 'Learn the exact release strategy, waitlist psychological triggers, and invite-only passcode tactics top tech conferences use to drive instant sell-outs.',
      category: 'Organizer Playbook',
      author: 'Kelvin Vance',
      authorRole: 'Head of Product',
      date: 'Sept 14, 2026',
      readTime: '6 min read',
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
      featured: true
    },
    {
      id: 2,
      title: 'Zero-Latency Gate Check-ins: Scaling to 25,000 Scans Under Spotty Network Conditions',
      excerpt: 'A deep dive into our offline-first SQLite cache synchronization, sub-100ms QR verification pipeline, and edge-conflict resolution engine.',
      category: 'Engineering & APIs',
      author: 'Tariq Al-Mansoor',
      authorRole: 'Principal Architect',
      date: 'Sept 10, 2026',
      readTime: '9 min read',
      image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80',
      featured: false
    },
    {
      id: 3,
      title: 'Introducing Developer Webhooks & Embeddable Event Checkout Widgets',
      excerpt: 'Embed your ticket purchasing drawer directly on Webflow, Next.js, or WordPress with two lines of JavaScript code and real-time conversion webhooks.',
      category: 'Product Updates',
      author: 'Elena Rostova',
      authorRole: 'Platform Engineering',
      date: 'Sept 04, 2026',
      readTime: '4 min read',
      image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&auto=format&fit=crop&q=80',
      featured: false
    },
    {
      id: 4,
      title: 'The Psychology of Dynamic Pricing: Why Flash Drops Convert 3.4x Higher',
      excerpt: 'Analyzing over 450,000 ticket transactions across festivals and concerts to understand buyer urgency curves and tiered release timing.',
      category: 'Growth & Marketing',
      author: 'Amara Okafor',
      authorRole: 'VP Marketing',
      date: 'Aug 28, 2026',
      readTime: '5 min read',
      image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80',
      featured: false
    },
    {
      id: 5,
      title: 'Preventing Secondary Scalping: Cryptographic One-Time Rotating QR Codes',
      excerpt: 'How eventsOs uses time-synced dynamic tokens to completely eradicate duplicated screenshots, unauthorized ticket resales, and gate fraud.',
      category: 'Engineering & APIs',
      author: 'Tariq Al-Mansoor',
      authorRole: 'Principal Architect',
      date: 'Aug 19, 2026',
      readTime: '7 min read',
      image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80',
      featured: false
    },
    {
      id: 6,
      title: 'Building a Loyal Community Around Recurring Monthly Creative Meetups',
      excerpt: 'Practical advice for indie hosts turning one-off weekend gatherings into high-retention club memberships and premium sponsor magnets.',
      category: 'Organizer Playbook',
      author: 'Sarah Chen',
      authorRole: 'Community Lead',
      date: 'Aug 12, 2026',
      readTime: '5 min read',
      image: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800&auto=format&fit=crop&q=80',
      featured: false
    }
  ];

  const filteredArticles = activeCategory === 'All'
    ? articles
    : articles.filter(a => a.category === activeCategory);

  const featuredArticle = articles.find(a => a.featured) || articles[0];

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 py-16 px-6 max-w-7xl mx-auto w-full space-y-16">
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 border border-red-150 text-[#E31B23] text-xs font-bold uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5" />
            eventsOs Dispatch & Insights
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-zinc-950 tracking-tight leading-tight">
            The Event Organizer’s Guide to Scale
          </h1>
          <p className="text-zinc-600 text-sm font-medium leading-relaxed">
            Proven playbooks, developer architectures, and growth strategies from the teams building modern live experiences.
          </p>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeCategory === cat
                  ? 'bg-zinc-950 text-white shadow-sm'
                  : 'bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Hero Featured Article (Shown when "All" or match) */}
        {(activeCategory === 'All' || activeCategory === featuredArticle.category) && (
          <div className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm hover:shadow-md transition-all group">
            <div className="grid grid-cols-1 lg:grid-cols-12">
              <div className="lg:col-span-7 h-72 sm:h-96 lg:h-auto relative overflow-hidden bg-zinc-100">
                <img
                  src={featuredArticle.image}
                  alt={featuredArticle.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-white/95 backdrop-blur-md text-zinc-900 text-[11px] font-black uppercase tracking-wider rounded-full shadow-xs">
                    Featured Playbook
                  </span>
                </div>
              </div>

              <div className="lg:col-span-5 p-8 sm:p-12 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-xs text-zinc-400 font-semibold">
                    <span className="text-[#E31B23] font-bold">{featuredArticle.category}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {featuredArticle.readTime}</span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight leading-snug group-hover:text-[#E31B23] transition-colors">
                    {featuredArticle.title}
                  </h2>

                  <p className="text-zinc-600 text-xs sm:text-sm leading-relaxed font-medium">
                    {featuredArticle.excerpt}
                  </p>
                </div>

                <div className="pt-6 border-t border-zinc-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-red-50 text-[#E31B23] font-bold flex items-center justify-center text-xs border border-red-100">
                      KV
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-900">{featuredArticle.author}</p>
                      <p className="text-[11px] text-zinc-400">{featuredArticle.authorRole}</p>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E31B23] group-hover:translate-x-1 transition-transform">
                    Read Article <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredArticles.filter(a => a.id !== (activeCategory === 'All' ? featuredArticle.id : 0)).map((article) => (
            <article
              key={article.id}
              className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
            >
              <div className="space-y-4">
                <div className="h-48 overflow-hidden relative bg-zinc-100">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider rounded-lg">
                      {article.category}
                    </span>
                  </div>
                </div>

                <div className="px-6 space-y-2">
                  <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-medium">
                    <span>{article.date}</span>
                    <span>•</span>
                    <span>{article.readTime}</span>
                  </div>

                  <h3 className="text-base font-bold text-zinc-950 tracking-tight leading-snug group-hover:text-[#E31B23] transition-colors line-clamp-2">
                    {article.title}
                  </h3>

                  <p className="text-xs text-zinc-500 line-clamp-3 leading-relaxed font-medium">
                    {article.excerpt}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-4 mt-4 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
                <span className="font-semibold text-zinc-800">{article.author}</span>
                <span className="text-[#E31B23] font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Read <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </article>
          ))}
        </div>

        {/* Newsletter Signup Strip */}
        <div className="bg-zinc-900 text-white rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 max-w-md">
            <h3 className="text-xl sm:text-2xl font-black tracking-tight">
              Get organizer tips straight to your inbox
            </h3>
            <p className="text-zinc-400 text-xs font-medium">
              Bi-weekly breakdowns of ticketing economics, high-converting stage schedules, and API updates.
            </p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); alert('Subscribed to eventsOs Dispatch!'); }} className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <input
              type="email"
              placeholder="Enter your email"
              required
              className="px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-xs text-white placeholder-zinc-400 focus:outline-none focus:border-[#E31B23] min-w-[260px]"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#E31B23] hover:bg-[#B91C1C] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer whitespace-nowrap"
            >
              Subscribe Free
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Blog;
