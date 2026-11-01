import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import EventCard from '../components/ui/EventCard';
import { eventApi, normalizeBackendEvent } from '../api/events';
import { favoritesApi } from '../api/favorites';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../api/client';
import { formatDate, formatCurrency } from '../utils/format';
import type { Event } from '../types/api';
import { 
  Search, 
  SlidersHorizontal, 
  LayoutGrid, 
  List, 
  RotateCcw, 
  Calendar, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  AlertCircle, 
  X,
  Sparkles,
  Music2,
  Cpu,
  GlassWater,
  Smile,
  Trophy,
  Briefcase,
  MapPin,
  ArrowRight,
  Ticket,
  Flame
} from 'lucide-react';

interface CategoryMeta {
  name: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const CATEGORY_ITEMS: CategoryMeta[] = [
  { name: 'All', label: 'All Events', icon: Sparkles },
  { name: 'Music', label: 'Concerts & Sets', icon: Music2 },
  { name: 'Nightlife', label: 'Parties & Raves', icon: GlassWater },
  { name: 'Technology', label: 'Tech & Summits', icon: Cpu },
  { name: 'Business', label: 'Conferences', icon: Briefcase },
  { name: 'Comedy', label: 'Standup & Arts', icon: Smile },
  { name: 'Sports', label: 'Tournaments', icon: Trophy },
  { name: 'Food & Drink', label: 'Dining & Tastings', icon: GlassWater }
];

const PRICE_OPTIONS = [
  { value: 'All', label: 'All Prices' },
  { value: 'free', label: 'Free RSVP' },
  { value: 'under10k', label: 'Under ₦10,000' },
  { value: '10k-30k', label: '₦10,000 – ₦30,000' },
  { value: 'over30k', label: '₦30,000+' }
];

export const Discover: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const initialCategory = searchParams.get('category') || 'All';
  const initialSearch = searchParams.get('search') || '';
  const initialPage = parseInt(searchParams.get('page') || '1', 10);
  const initialFormat = (searchParams.get('format') || 'All') as 'All' | 'physical' | 'virtual';

  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [formatFilter, setFormatFilter] = useState<'All' | 'physical' | 'virtual'>(initialFormat);
  const [priceRange, setPriceRange] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const { isAuthenticated, user } = useAuth();
  const resultsRef = useRef<HTMLDivElement>(null);
  const isFirstMount = useRef(true);

  // Hydrate favorites from backend if user is authenticated
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      favoritesApi.getFavoriteIds().catch(() => {});
    }
  }, [isAuthenticated, user?.id]);

  const [paginationMeta, setPaginationMeta] = useState<{
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
  }>({
    current_page: initialPage || 1,
    last_page: 1,
    per_page: 12,
    total: 0,
    from: null,
    to: null,
  });

  // Debounce search input by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Primary API fetcher connecting directly to backend /explore/events
  const fetchEvents = useCallback(async (
    targetPage: number, 
    currentSearch = debouncedSearch, 
    currentCat = category, 
    currentFormat = formatFilter
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const params: Record<string, any> = {
        page: targetPage,
        perPage: 12,
      };

      if (currentSearch.trim()) {
        params.search = currentSearch.trim();
      }

      if (currentCat !== 'All') {
        params.category = currentCat;
      }

      if (currentFormat !== 'All') {
        params.eventType = currentFormat;
      }

      const res = await eventApi.getEvents(params);
      const resData = res.data;

      // Extract paginated records
      const rawEvents: any[] = Array.isArray(resData?.data)
        ? resData.data
        : Array.isArray(resData)
        ? resData
        : [];

      const normalized = rawEvents.map(normalizeBackendEvent);
      setEvents(normalized);

      // Extract pagination metadata from backend response
      if (resData?.meta) {
        setPaginationMeta({
          current_page: Number(resData.meta.current_page) || targetPage,
          last_page: Number(resData.meta.last_page) || 1,
          per_page: Number(resData.meta.per_page) || 12,
          total: Number(resData.meta.total ?? normalized.length),
          from: resData.meta.from ?? (normalized.length > 0 ? (targetPage - 1) * 12 + 1 : null),
          to: resData.meta.to ?? (normalized.length > 0 ? (targetPage - 1) * 12 + normalized.length : null),
        });
      } else {
        setPaginationMeta({
          current_page: targetPage,
          last_page: 1,
          per_page: 12,
          total: normalized.length,
          from: normalized.length > 0 ? 1 : null,
          to: normalized.length,
        });
      }
    } catch (err: any) {
      console.error('Failed to fetch events from backend:', err);
      setEvents([]);
      setError(getApiErrorMessage(err, 'Failed to load events from the server. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, category, formatFilter]);

  // Initial load and filter change listener
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      const initialTargetPage = parseInt(searchParams.get('page') || '1', 10);
      fetchEvents(initialTargetPage, debouncedSearch, category, formatFilter);
      return;
    }

    // Reset to page 1 whenever search, category, or format changes
    const newParams: Record<string, string> = { page: '1' };
    if (category !== 'All') newParams.category = category;
    if (debouncedSearch.trim()) newParams.search = debouncedSearch.trim();
    if (formatFilter !== 'All') newParams.format = formatFilter;
    setSearchParams(newParams, { replace: true });

    fetchEvents(1, debouncedSearch, category, formatFilter);
  }, [debouncedSearch, category, formatFilter]);

  // Sync browser back/forward history navigation for page parameter
  useEffect(() => {
    const urlPage = parseInt(searchParams.get('page') || '1', 10);
    if (!isFirstMount.current && urlPage !== paginationMeta.current_page && !isLoading) {
      fetchEvents(urlPage, debouncedSearch, category, formatFilter);
    }
  }, [searchParams]);

  // Handle explicit page change
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > paginationMeta.last_page || newPage === paginationMeta.current_page) {
      return;
    }

    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);

    fetchEvents(newPage, debouncedSearch, category, formatFilter);

    if (resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setCategory('All');
    setPriceRange('All');
    setFormatFilter('All');
    setSearchParams({ page: '1' });
    fetchEvents(1, '', 'All', 'All');
  };

  // Optional client-side price filter if user toggles price
  const displayEvents = useMemo(() => {
    if (priceRange === 'All') return events;
    return events.filter((e) => {
      if (!e.tickets || e.tickets.length === 0) return priceRange === 'free';
      const prices = e.tickets.map((t) => t.price);
      const minPrice = Math.min(...prices);
      if (priceRange === 'free') return minPrice === 0;
      if (priceRange === 'under10k') return minPrice < 10000;
      if (priceRange === '10k-30k') return minPrice >= 10000 && minPrice <= 30000;
      if (priceRange === 'over30k') return minPrice > 30000;
      return true;
    });
  }, [events, priceRange]);

  // Featured events calculated from featured priority and popularity (up to 8 for rich carousel scroll)
  const featuredEvents = useMemo(() => {
    if (events.length === 0) return [];
    const sorted = [...events].sort((a, b) => {
      const aTicketsCount = a.tickets?.length || 0;
      const bTicketsCount = b.tickets?.length || 0;
      const aScore = (a.isFeatured ? 100 : 0) + (aTicketsCount * 10);
      const bScore = (b.isFeatured ? 100 : 0) + (bTicketsCount * 10);
      return bScore - aScore;
    });
    return sorted.slice(0, 8);
  }, [events]);

  const featuredScrollRef = useRef<HTMLDivElement>(null);

  const scrollFeatured = (direction: 'left' | 'right') => {
    if (featuredScrollRef.current) {
      const offset = direction === 'left' ? -420 : 420;
      featuredScrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#070709] text-zinc-100 flex flex-col justify-between selection:bg-[#E31B23] selection:text-white antialiased">
      <Navbar />

      {/* ========================================================================= */}
      {/* 1. EDITORIAL SPOTLIGHT & SEARCH HEADER (Dark Luxury Bento)                */}
      {/* ========================================================================= */}
      <section className="relative px-4 sm:px-6 lg:px-12 xl:px-16 2xl:px-20 pt-10 pb-12 sm:pb-16 overflow-hidden border-b border-white/5">
        
        {/* Subtle Ambient Radial Lighting */}
        <div className="absolute top-0 left-1/3 w-[600px] h-[400px] bg-[#E31B23]/15 blur-[160px] rounded-full pointer-events-none" />
        <div className="absolute top-1/2 right-10 w-[450px] h-[350px] bg-purple-600/10 blur-[150px] rounded-full pointer-events-none" />

        <div className="max-w-[1600px] mx-auto space-y-8 relative z-10">

          {/* Top Title & Search Island Bar */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.08] border border-white/10 text-xs font-mono font-bold text-zinc-300">
                <Flame className="w-3.5 h-3.5 text-[#E31B23]" />
                <span>Live Event Marketplace</span>
              </div>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-[-0.035em] leading-[1.12]">
                Discover Live Experiences.
              </h1>
              <p className="text-zinc-400 text-xs sm:text-base font-normal leading-relaxed">
                Explore concerts, secret raves, tech summits, and festivals across Nigeria. Verified tickets with instant pass delivery.
              </p>
            </div>

            {/* Elevated Search Bar */}
            <div className="w-full lg:max-w-xl">
              <div className="p-1.5 sm:p-2.5 rounded-2xl bg-white/[0.06] border border-white/15 backdrop-blur-xl shadow-2xl transition-all duration-300 focus-within:border-white/30 focus-within:bg-white/[0.09]">
                <div className="flex items-center gap-3 px-3.5 py-3">
                  <Search className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-400 shrink-0" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by artist, festival, city..."
                    className="w-full bg-transparent text-sm sm:text-base text-white placeholder-zinc-400 outline-none border-none font-medium truncate"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch('')}
                      className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ======================================================================= */}
          {/* HORIZONTAL CATEGORY TAXONOMY STRIP (With Icons & Active States)        */}
          {/* ======================================================================= */}
          <div className="pt-2">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {CATEGORY_ITEMS.map((cat) => {
                const Icon = cat.icon;
                const isActive = category === cat.name;
                return (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => setCategory(cat.name)}
                    className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer active:scale-95 border ${
                      isActive
                        ? 'bg-[#E31B23] text-white border-[#E31B23] shadow-lg shadow-[#E31B23]/25'
                        : 'bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 border-white/10'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#E31B23]'}`} />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. FEATURED EVENTS (Cinema-Scale Interactive Carousel)                    */}
      {/* ========================================================================= */}
      {featuredEvents.length > 0 && !isLoading && (
        <section className="px-4 sm:px-6 lg:px-12 xl:px-16 2xl:px-20 py-12 sm:py-16 bg-[#0A0A0E] border-b border-white/5 overflow-hidden">
          <div className="max-w-[1600px] mx-auto space-y-7">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#E31B23]/10 border border-[#E31B23]/25 text-[#E31B23] flex items-center justify-center shadow-lg shadow-[#E31B23]/10">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                      Featured Events
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#E31B23]/10 text-[#E31B23] text-[10px] font-mono font-bold uppercase tracking-wider border border-[#E31B23]/25 shadow-xs">
                      CURATED
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-400 hidden sm:block">
                    Hand-picked live experiences, headline concerts, and festivals happening soon.
                  </p>
                </div>
              </div>

              {/* Carousel Navigation Arrows */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => scrollFeatured('left')}
                  className="w-10 h-10 rounded-2xl bg-white/[0.04] hover:bg-white/10 active:scale-95 border border-white/10 hover:border-white/25 text-white flex items-center justify-center transition-all cursor-pointer shadow-sm"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollFeatured('right')}
                  className="w-10 h-10 rounded-2xl bg-white/[0.04] hover:bg-white/10 active:scale-95 border border-white/10 hover:border-white/25 text-white flex items-center justify-center transition-all cursor-pointer shadow-sm"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Cinema Carousel Track (Horizontal snap scroll with enlarged dimensions) */}
            <div 
              ref={featuredScrollRef}
              className="flex items-stretch gap-6 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scrollbar-none scroll-smooth"
            >
              {featuredEvents.map((featuredEvent, index) => {
                const minPrice = featuredEvent.tickets && featuredEvent.tickets.length > 0 
                  ? Math.min(...featuredEvent.tickets.map(t => t.price)) 
                  : 0;

                return (
                  <Link
                    key={featuredEvent.id}
                    to={`/events/${featuredEvent.slug || featuredEvent.id}`}
                    className="group relative rounded-[2rem] overflow-hidden border border-white/10 hover:border-white/30 h-[480px] sm:h-[540px] w-[300px] sm:w-[380px] lg:w-[420px] flex-shrink-0 snap-start flex flex-col justify-between p-6 sm:p-7 transition-all duration-500 hover:shadow-2xl hover:shadow-[#E31B23]/20 hover:-translate-y-2 bg-zinc-950"
                  >
                    {/* Full-bleed Background Image */}
                    <img
                      src={featuredEvent.imageUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80'}
                      alt={featuredEvent.title}
                      className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.72] contrast-[1.08] group-hover:scale-110 group-hover:brightness-[0.6] transition-all duration-700 pointer-events-none"
                    />

                    {/* Gradient Cinematic Scrims */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent pointer-events-none" />

                    {/* Top Overlay Bar: Badge + Category + Price */}
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-black text-xs backdrop-blur-md border ${
                          index === 0 
                            ? 'bg-[#E31B23] text-white border-[#E31B23] shadow-lg shadow-[#E31B23]/40' 
                            : index === 1
                            ? 'bg-amber-500 text-white border-amber-400 shadow-lg shadow-amber-500/30'
                            : index === 2
                            ? 'bg-white text-zinc-950 border-white font-black'
                            : 'bg-black/50 text-white border-white/20'
                        }`}>
                          #{index + 1}
                        </span>
                        <span className="px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/15 text-xs font-mono uppercase tracking-wider text-zinc-200">
                          {featuredEvent.category || 'Event'}
                        </span>
                      </div>

                      <span className="px-3 py-1.5 rounded-full bg-[#E31B23]/95 backdrop-blur-md text-white text-xs font-mono font-black shadow-lg shadow-[#E31B23]/35">
                        {minPrice === 0 ? 'FREE RSVP' : formatCurrency(minPrice)}
                      </span>
                    </div>

                    {/* Bottom Overlay Content */}
                    <div className="relative z-10 space-y-4 pt-10">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs font-mono text-zinc-300">
                          <Calendar className="w-4 h-4 text-[#E31B23] shrink-0" />
                          <span>{formatDate(featuredEvent.startDate)}</span>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black text-white line-clamp-2 leading-tight group-hover:text-red-400 transition-colors drop-shadow-md">
                          {featuredEvent.title}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-zinc-300 font-mono truncate">
                          <MapPin className="w-4 h-4 text-[#E31B23] shrink-0" />
                          <span className="truncate">{featuredEvent.venue || featuredEvent.city || 'Lagos, Nigeria'}</span>
                        </div>
                      </div>

                      {/* Quick Access CTA Pill */}
                      <div className="pt-3 border-t border-white/15 flex items-center justify-between">
                        <span className="text-sm font-bold text-white group-hover:text-[#E31B23] transition-colors">
                          Get Tickets
                        </span>
                        <div className="w-8 h-8 rounded-full bg-white/10 group-hover:bg-[#E31B23] flex items-center justify-center transition-all duration-300 shadow-sm">
                          <ArrowRight className="w-4 h-4 text-white transition-transform group-hover:translate-x-1" />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 3. MAIN MARKETPLACE CONTENT AREA                                          */}
      {/* ========================================================================= */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 2xl:px-20 py-12 sm:py-16 space-y-10" ref={resultsRef}>
        
        {/* Mobile Filter Toggle & Quick Bar */}
        <div className="md:hidden flex items-center justify-between gap-3 bg-white/[0.04] p-3 rounded-2xl border border-white/10">
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white cursor-pointer transition-all border border-white/10"
          >
            <Filter className="w-3.5 h-3.5 text-[#E31B23]" />
            <span>Refine Filters ({category !== 'All' || priceRange !== 'All' || formatFilter !== 'All' ? 'Active' : '0'})</span>
          </button>

          <span className="text-xs font-mono text-zinc-400">
            {paginationMeta.total} {paginationMeta.total === 1 ? 'event' : 'events'}
          </span>
        </div>

        {/* Marketplace Grid: Left Sidebar Filters + Right Results */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* ========================================================================= */}
          {/* MOBILE FILTER MODAL / SLIDE-OVER DRAWER                                   */}
          {/* ========================================================================= */}
          <AnimatePresence>
            {mobileFilterOpen && (
              <div className="fixed inset-0 z-50 md:hidden flex justify-end">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
                  onClick={() => setMobileFilterOpen(false)}
                />

                <motion.div 
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  className="relative w-full max-w-xs bg-[#0F0F14] text-white h-full shadow-2xl p-6 overflow-y-auto space-y-6 flex flex-col justify-between z-10 border-l border-white/10"
                >
                  <div className="space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-white/10">
                      <span className="text-base font-black text-white flex items-center gap-2">
                        <SlidersHorizontal className="w-4 h-4 text-[#E31B23]" />
                        Filter Events
                      </span>
                      <button
                        onClick={() => setMobileFilterOpen(false)}
                        className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Format Filter */}
                    <div className="space-y-3">
                      <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 block">
                        Event Format
                      </label>
                      <div className="grid grid-cols-3 gap-1.5 bg-white/[0.04] p-1.5 rounded-2xl border border-white/10">
                        {(['All', 'physical', 'virtual'] as const).map((fmt) => (
                          <button
                            key={fmt}
                            onClick={() => setFormatFilter(fmt)}
                            className={`py-2 text-xs font-bold rounded-xl capitalize transition-all cursor-pointer ${
                              formatFilter === fmt
                                ? 'bg-[#E31B23] text-white shadow-xs'
                                : 'text-zinc-400 hover:text-white'
                            }`}
                          >
                            {fmt === 'physical' ? 'In-Person' : fmt === 'virtual' ? 'Virtual' : 'All'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Price Filter */}
                    <div className="space-y-3">
                      <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 block">
                        Price Range
                      </label>
                      <div className="space-y-2">
                        {PRICE_OPTIONS.map((opt) => (
                          <label
                            key={opt.value}
                            className="flex items-center gap-2.5 text-xs font-semibold text-zinc-300 hover:text-white cursor-pointer py-1"
                          >
                            <input
                              type="radio"
                              name="mobilePrice"
                              checked={priceRange === opt.value}
                              onChange={() => setPriceRange(opt.value)}
                              className="accent-[#E31B23] w-4 h-4"
                            />
                            <span>{opt.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10 space-y-2">
                    <button
                      onClick={() => setMobileFilterOpen(false)}
                      className="w-full py-3 bg-[#E31B23] hover:bg-[#C9141B] text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-[#E31B23]/30 cursor-pointer text-center"
                    >
                      View {displayEvents.length} {displayEvents.length === 1 ? 'Event' : 'Events'}
                    </button>
                    <button
                      onClick={() => {
                        handleResetFilters();
                        setMobileFilterOpen(false);
                      }}
                      className="w-full py-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* ========================================================================= */}
          {/* DESKTOP FILTERS SIDEBAR (Refined Dark Glass Bento)                        */}
          {/* ========================================================================= */}
          <aside className="hidden md:block md:col-span-3 bg-white/[0.03] p-6 rounded-3xl border border-white/10 backdrop-blur-xl shadow-xl space-y-6 sticky top-24">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#E31B23]" />
                Refine Search
              </span>
              <button
                onClick={handleResetFilters}
                className="text-xs font-bold text-zinc-400 hover:text-[#E31B23] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            </div>

            {/* Event Format (In-Person / Virtual) */}
            <div className="space-y-3">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 block">
                Experience Type
              </label>
              <div className="grid grid-cols-3 gap-1 bg-white/[0.04] p-1 rounded-2xl border border-white/10">
                {(['All', 'physical', 'virtual'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setFormatFilter(fmt)}
                    className={`py-2 text-xs font-bold rounded-xl capitalize transition-all cursor-pointer ${
                      formatFilter === fmt
                        ? 'bg-[#E31B23] text-white shadow-xs'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {fmt === 'physical' ? 'Live' : fmt === 'virtual' ? 'Virtual' : 'All'}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="space-y-3 pt-2 border-t border-white/10">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 block">
                Ticket Price
              </label>
              <div className="space-y-1.5">
                {PRICE_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className="flex items-center gap-2.5 text-xs font-medium text-zinc-300 hover:text-white cursor-pointer py-1 transition-colors"
                  >
                    <input
                      type="radio"
                      name="desktopPrice"
                      checked={priceRange === opt.value}
                      onChange={() => setPriceRange(opt.value)}
                      className="accent-[#E31B23] w-4 h-4"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Quick Guarantee Micro-badge */}
            <div className="pt-4 border-t border-white/10 flex items-center gap-2 text-[11px] font-mono text-zinc-400">
              <Ticket className="w-3.5 h-3.5 text-[#E31B23]" />
              <span>Zero Scalp Guaranteed Passes</span>
            </div>
          </aside>

          {/* ========================================================================= */}
          {/* RIGHT EVENT RESULTS AREA                                                  */}
          {/* ========================================================================= */}
          <section className="col-span-1 md:col-span-9 space-y-6">
            
            {/* Top Toolbar (Count + View Mode Switcher) */}
            <div className="flex items-center justify-between bg-white/[0.03] px-6 py-3.5 rounded-2xl border border-white/10 backdrop-blur-xl shadow-xs">
              <p className="text-xs sm:text-sm font-bold text-zinc-300">
                {isLoading ? (
                  <span className="flex items-center gap-2 text-zinc-400">
                    <Loader2 className="w-4 h-4 animate-spin text-[#E31B23]" /> Loading verified events...
                  </span>
                ) : (
                  <>
                    Showing <span className="text-[#E31B23]">{paginationMeta.from || (displayEvents.length > 0 ? 1 : 0)}</span>–<span className="text-[#E31B23]">{paginationMeta.to || displayEvents.length}</span> of{' '}
                    <span className="text-white">{paginationMeta.total}</span> events
                  </>
                )}
              </p>

              <div className="flex items-center gap-1.5 bg-white/[0.04] p-1 rounded-xl border border-white/10">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'grid' ? 'bg-[#E31B23] text-white shadow-xs' : 'text-zinc-400 hover:text-white'
                  }`}
                  title="Grid view"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'list' ? 'bg-[#E31B23] text-white shadow-xs' : 'text-zinc-400 hover:text-white'
                  }`}
                  title="List view"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-[#E31B23] mx-auto" />
                <p className="text-sm font-bold text-white">{error}</p>
                <button
                  onClick={() => fetchEvents(paginationMeta.current_page)}
                  className="px-4 py-2 bg-[#E31B23] text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-[#C9141B]"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Loading Skeletons */}
            {isLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white/[0.03] rounded-3xl p-4 border border-white/10 animate-pulse space-y-4">
                    <div className="h-48 bg-white/[0.05] rounded-2xl w-full" />
                    <div className="space-y-2 px-1">
                      <div className="h-5 bg-white/[0.05] rounded-md w-3/4" />
                      <div className="h-4 bg-white/[0.05] rounded-md w-1/2" />
                    </div>
                    <div className="pt-3 border-t border-white/10 flex justify-between items-center px-1">
                      <div className="h-4 bg-white/[0.05] rounded-md w-1/4" />
                      <div className="h-8 bg-white/[0.05] rounded-xl w-24" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && displayEvents.length === 0 && (
              <div className="bg-white/[0.02] rounded-3xl border border-white/10 p-16 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[#E31B23]/10 text-[#E31B23] flex items-center justify-center mx-auto border border-[#E31B23]/20">
                  <Calendar className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black text-white">No events found</h3>
                <p className="text-xs sm:text-sm text-zinc-400 max-w-sm mx-auto leading-relaxed">
                  No upcoming events match your selected filters. Try searching for a different keyword or resetting filters.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-3 bg-[#E31B23] text-white text-xs sm:text-sm font-bold rounded-xl hover:bg-[#C9141B] transition-all shadow-lg shadow-[#E31B23]/25 cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            )}

            {/* Event Results Grid */}
            {!isLoading && !error && displayEvents.length > 0 && (
              viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {displayEvents.map((event) => (
                    <EventCard key={event.id} event={event} variant="horizontal" />
                  ))}
                </div>
              )
            )}

            {/* ========================================================================= */}
            {/* PAGINATION CONTROLS BAR                                                   */}
            {/* ========================================================================= */}
            {!isLoading && paginationMeta.last_page > 1 && (
              <div className="bg-white/[0.03] rounded-2xl border border-white/10 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
                <div className="text-xs text-zinc-400 font-mono">
                  Page <span className="font-bold text-white">{paginationMeta.current_page}</span> of{' '}
                  <span className="font-bold text-white">{paginationMeta.last_page}</span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Previous Button */}
                  <button
                    onClick={() => handlePageChange(paginationMeta.current_page - 1)}
                    disabled={paginationMeta.current_page <= 1 || isLoading}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed bg-white/10 hover:bg-white/15 border border-white/10 text-white"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Previous</span>
                  </button>

                  {/* Page numbers */}
                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: paginationMeta.last_page }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-9 h-9 rounded-xl text-xs font-black transition-all cursor-pointer ${
                          pageNum === paginationMeta.current_page
                            ? 'bg-[#E31B23] text-white shadow-lg shadow-[#E31B23]/30 scale-105'
                            : 'bg-white/[0.04] text-zinc-300 hover:bg-white/10 border border-white/10'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>

                  {/* Next Button */}
                  <button
                    onClick={() => handlePageChange(paginationMeta.current_page + 1)}
                    disabled={paginationMeta.current_page >= paginationMeta.last_page || isLoading}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed bg-white/10 hover:bg-white/15 border border-white/10 text-white"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Discover;
