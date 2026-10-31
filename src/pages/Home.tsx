import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import EventCard from '../components/ui/EventCard';
import { formatDate } from '../utils/format';
import { eventApi, normalizeBackendEvent } from '../api/events';
import { favoritesApi } from '../api/favorites';
import { useAuth } from '../context/AuthContext';
import type { Event } from '../types/api';
import { 
  Search, 
  MapPin, 
  ArrowRight,
  Calendar,
  Ticket,
  ShieldCheck,
  Smartphone,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Music2,
  Cpu,
  GlassWater,
  Sparkles,
  Smile,
  CheckCircle2,
  QrCode,
  Zap,
  Plus,
  ArrowUpRight
} from 'lucide-react';

export const Home: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedDateFilter, setSelectedDateFilter] = useState('All Dates');
  const [activeCategory, setActiveCategory] = useState('All');
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const navigate = useNavigate();

  const { isAuthenticated, user } = useAuth();

  // Load real events from API without mock fallbacks
  useEffect(() => {
    let isMounted = true;
    eventApi.getEvents({ per_page: 12 })
      .then((res: any) => {
        if (!isMounted) return;
        const resData = res?.data?.data || res?.data;
        const list = Array.isArray(resData) ? resData : (resData as any)?.items || [];
        if (list.length > 0) {
          setEvents(list.map(normalizeBackendEvent));
        } else {
          setEvents([]);
        }
      })
      .catch((err) => {
        console.error('Failed to load events for homepage:', err);
        if (isMounted) setEvents([]);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  // Hydrate favorites from backend if user is authenticated
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      favoritesApi.getFavoriteIds().catch(() => {});
    }
  }, [isAuthenticated, user?.id]);

  // Featured slides derived dynamically from published events
  const featuredSlides = events.slice(0, 4);

  // Carousel auto-advance timer with pause on hover
  useEffect(() => {
    if (isPaused || featuredSlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused, featuredSlides.length]);

  const prevSlide = () => {
    if (featuredSlides.length === 0) return;
    setCurrentSlide((prev) => (prev === 0 ? featuredSlides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    if (featuredSlides.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % featuredSlides.length);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (selectedCity && selectedCity !== 'All') params.set('city', selectedCity);
    if (activeCategory && activeCategory !== 'All') params.set('category', activeCategory);
    if (selectedDateFilter === 'This Weekend') params.set('timeframe', 'weekend');
    if (selectedDateFilter === 'Free') params.set('price', 'free');
    navigate(`/discover?${params.toString()}`);
  };

  const scrollToEvents = () => {
    const el = document.getElementById('explore');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const categories = [
    { name: 'All', label: 'All Experiences', icon: Sparkles },
    { name: 'Music', label: 'Concerts & Live Sets', icon: Music2 },
    { name: 'Nightlife', label: 'Parties & DJ Clubs', icon: GlassWater },
    { name: 'Technology', label: 'Tech & Summits', icon: Cpu },
    { name: 'Comedy', label: 'Standup & Theatre', icon: Smile },
    { name: 'Food & Drink', label: 'Festivals & Dining', icon: GlassWater }
  ];

  // Filter events client-side based on activeCategory
  const displayedEvents = events.filter((evt) => {
    if (activeCategory === 'All') return true;
    const cat = (evt.category || '').toLowerCase();
    return cat.includes(activeCategory.toLowerCase());
  });

  return (
    <div className="relative min-h-screen bg-[#08080A] text-zinc-900 flex flex-col justify-between selection:bg-[#E31B23] selection:text-white antialiased overflow-x-hidden">
      {/* Fixed top Navbar overlay */}
      <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
        <Navbar />
      </div>

      <main className="flex-1">
        {/* ========================================================================= */}
        {/* 1. HERO SECTION: Full-Bleed Viewport Atmosphere (Behind Navbar)          */}
        {/*    Direct reference to Jetron Ticket composition with luxury refinement   */}
        {/* ========================================================================= */}
        <section className="relative min-h-[100dvh] w-full flex flex-col justify-between bg-[#08080A] overflow-hidden text-center px-4 sm:px-6 lg:px-8 border-b border-zinc-900">
          
          {/* Ambient Lighting & High-Fidelity Cinematic Festival Video Background */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            {/* Ambient Radial Mesh Glows */}
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] sm:w-[1000px] h-[500px] bg-gradient-to-b from-[#E31B23]/25 via-[#E31B23]/10 to-transparent blur-[120px] rounded-full z-1" />
            <div className="absolute top-1/3 left-1/4 w-[400px] h-[300px] bg-amber-500/10 blur-[140px] rounded-full z-1" />
            
            {/* Cinematic Background Video with Poster Fallback */}
            <video
              autoPlay
              muted
              loop
              playsInline
              poster="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=2600&q=85"
              className="w-full h-full object-cover object-center filter brightness-[0.62] contrast-[1.12] saturate-[1.15] scale-105"
            >
              <source src="/videos/hero-festival.mp4" type="video/mp4" />
              <source src="https://assets.mixkit.co/videos/14088/14088-720.mp4" type="video/mp4" />
            </video>

            {/* Deep studio vignette & gradient feathering */}
            <div className="absolute inset-0 z-2 bg-gradient-to-t from-[#08080A] via-[#08080A]/60 to-[#08080A]/85" />
            <div className="absolute inset-0 z-2 bg-radial from-transparent via-[#08080A]/35 to-[#08080A]/95" />
          </div>

          {/* Top Spacing to compensate for navbar height */}
          <div className="h-16 sm:h-20 shrink-0" />

          {/* Hero Center Text & Actions */}
          <div className="relative z-10 max-w-4xl mx-auto py-8 sm:py-12 my-auto space-y-6 sm:space-y-7 flex flex-col items-center">
            
            {/* Micro Eyebrow Badge (Live Ticket Engine Indicator) */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.08] border border-white/15 backdrop-blur-xl shadow-inner text-[11px] sm:text-xs font-semibold text-zinc-200">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-wider text-zinc-300">Live Ticketing Engine</span>
              <span className="text-zinc-500">•</span>
              <span className="text-zinc-200">Zero Scalping • Instant Pass Delivery</span>
            </div>

            {/* Headline matching user reference image */}
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-white tracking-[-0.035em] leading-[1.12] sm:leading-[1.08] text-balance drop-shadow-lg px-2">
              Attending And Creating Events Has Never Been Easier.
            </h1>

            {/* Supporting Subtitle matching reference */}
            <p className="text-zinc-300/95 text-xs sm:text-base md:text-lg leading-relaxed max-w-2xl font-normal text-balance drop-shadow-sm px-3">
              Nigeria&apos;s #1 ticketing platform for discovering events, buying tickets, and creating, promoting, and selling tickets for your own events.
            </p>

            {/* Nested "Island" Action Buttons (Double-bezel hardware styling) */}
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
              {/* Primary: Discover Events */}
              <Link
                to="/discover"
                className="w-full sm:w-auto group inline-flex items-center justify-between sm:justify-start gap-3 bg-[#E31B23] hover:bg-[#C9141B] text-white font-bold rounded-full pl-7 pr-2.5 py-2 text-sm sm:text-base shadow-[0_12px_32px_-6px_rgba(227,27,35,0.5)] transition-all duration-300 active:scale-[0.98] cursor-pointer"
              >
                <span>Discover Events</span>
                <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/20 group-hover:bg-black/30 flex items-center justify-center transition-transform duration-300 group-hover:translate-x-1 shrink-0">
                  <ArrowRight className="w-4 h-4 text-white" />
                </span>
              </Link>
              
              {/* Secondary: Create Event (Translucent Frosted Glass Pill) */}
              <Link
                to="/organizer/events/create"
                className="w-full sm:w-auto group inline-flex items-center justify-between sm:justify-start gap-3 bg-white/[0.08] hover:bg-white/[0.14] text-white font-bold rounded-full pl-7 pr-2.5 py-2 text-sm sm:text-base border border-white/20 backdrop-blur-2xl transition-all duration-300 active:scale-[0.98] cursor-pointer shadow-sm"
              >
                <span>Create Event</span>
                <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 group-hover:bg-white/20 flex items-center justify-center transition-transform duration-300 group-hover:rotate-90 shrink-0">
                  <Plus className="w-4 h-4 text-white" />
                </span>
              </Link>
            </div>

          </div>

          {/* Bottom Downward Scroll Chevron matching reference */}
          <div className="relative z-10 pb-8 sm:pb-10 flex flex-col items-center">
            <button
              type="button"
              onClick={scrollToEvents}
              aria-label="Scroll down to browse live events"
              className="inline-flex flex-col items-center gap-1.5 text-zinc-400 hover:text-white transition-colors cursor-pointer group"
            >
              <span className="text-[10px] font-mono tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-zinc-300">
                Explore Events
              </span>
              <div className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/10 backdrop-blur-md flex items-center justify-center group-hover:border-white/30 transition-all">
                <ChevronDown className="w-4 h-4 text-white/80 animate-bounce group-hover:text-white" />
              </div>
            </button>
          </div>

        </section>

        {/* ========================================================================= */}
        {/* 2. FLOATING DISCOVERY ISLAND: Architectural Double-Bezel Console          */}
        {/* ========================================================================= */}
        <section id="explore" className="relative z-20 px-4 sm:px-6 lg:px-8 -mt-7 sm:-mt-9">
          <div className="max-w-5xl mx-auto">
            {/* Outer Machine Bezel */}
            <div className="p-1.5 sm:p-2 rounded-3xl bg-zinc-900/10 backdrop-blur-xl border border-black/5 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.18)]">
              {/* Inner Core */}
              <form 
                onSubmit={handleSearchSubmit}
                className="bg-white rounded-[1.35rem] p-2 sm:p-2.5 border border-zinc-200/80 flex flex-col md:flex-row items-stretch md:items-center gap-2 transition-all focus-within:border-zinc-400"
              >
                {/* Search Keyword Input */}
                <div className="flex items-center gap-3 px-3.5 py-2.5 flex-1 min-w-0">
                  <Search className="w-5 h-5 text-zinc-400 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Find events by name, location, or artist..."
                    className="w-full bg-transparent text-sm sm:text-base text-zinc-950 placeholder-zinc-400 outline-none font-medium truncate"
                  />
                </div>

                {/* City Picker Dropdown */}
                <div className="flex items-center gap-2 px-3 py-2 md:border-l border-zinc-200 shrink-0">
                  <MapPin className="w-4 h-4 text-[#E31B23] shrink-0" />
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    aria-label="Filter events by city"
                    className="bg-transparent text-xs sm:text-sm font-bold text-zinc-800 outline-none cursor-pointer pr-1"
                  >
                    <option value="All">All Locations</option>
                    <option value="Lagos">Lagos, NG</option>
                    <option value="Abuja">Abuja, NG</option>
                    <option value="Port Harcourt">Port Harcourt, NG</option>
                    <option value="Accra">Accra, GH</option>
                    <option value="London">London, UK</option>
                  </select>
                </div>

                {/* Date Filter Quick Pills */}
                <div className="hidden lg:flex items-center gap-1.5 px-2 md:border-l border-zinc-200 shrink-0 text-xs">
                  {['All Dates', 'This Weekend', 'Free'].map((pill) => (
                    <button
                      key={pill}
                      type="button"
                      onClick={() => setSelectedDateFilter(pill)}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                        selectedDateFilter === pill 
                          ? 'bg-zinc-950 text-white shadow-2xs' 
                          : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
                      }`}
                    >
                      {pill}
                    </button>
                  ))}
                </div>

                {/* Execute Button */}
                <button
                  type="submit"
                  className="px-6 sm:px-7 py-3 bg-[#E31B23] hover:bg-[#C9141B] text-white text-sm sm:text-base font-bold rounded-xl transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2 shrink-0"
                >
                  <span>Search</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. CATEGORY TAXONOMY STRIP                                                */}
        {/* ========================================================================= */}
        <section className="px-4 sm:px-6 lg:px-8 pt-10 pb-4">
          <div className="max-w-6xl mx-auto flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => setActiveCategory(cat.name)}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                    isActive
                      ? 'bg-zinc-950 text-white shadow-sm ring-1 ring-zinc-950/10'
                      : 'bg-zinc-100/80 hover:bg-zinc-200/80 text-zinc-700 border border-zinc-200/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-zinc-500'}`} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. LIVE TICKETING GRID: Clean Editorial Cards                             */}
        {/* ========================================================================= */}
        <section className="px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {/* Header with Live Ticker */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-500 font-bold">
                  <span className="w-2 h-2 rounded-full bg-[#E31B23] animate-pulse" />
                  <span>Live Marketplace</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-black text-zinc-950 tracking-tight">
                  Upcoming &amp; Trending Events
                </h2>
                <p className="text-zinc-500 text-xs sm:text-sm font-medium">
                  Direct official tickets with instant Apple/Google wallet and QR pass delivery.
                </p>
              </div>

              <Link
                to="/discover"
                className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#E31B23] hover:text-[#B91C1C] shrink-0 transition-colors"
              >
                <span>View all events</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            {/* Event Cards Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <div key={n} className="rounded-2xl border border-zinc-200/90 bg-white p-4 space-y-4 animate-pulse">
                    <div className="aspect-[4/3] bg-zinc-100 rounded-xl" />
                    <div className="h-4 bg-zinc-200 rounded w-3/4" />
                    <div className="h-3 bg-zinc-100 rounded w-1/2" />
                    <div className="pt-2 border-t border-zinc-100 flex justify-between">
                      <div className="h-3 bg-zinc-100 rounded w-1/4" />
                      <div className="h-3 bg-zinc-200 rounded w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : displayedEvents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {displayedEvents.map((evt) => (
                  <EventCard key={evt.id} event={evt} variant="default" />
                ))}
              </div>
            ) : (
              <div className="p-12 sm:p-16 text-center border border-zinc-200/90 rounded-3xl bg-zinc-50/70 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-zinc-200/80 flex items-center justify-center mx-auto text-zinc-500">
                  <Calendar className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-zinc-950">No events found in this category</h3>
                  <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                    Try switching categories, clearing your search query, or explore our full event catalog.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => { setActiveCategory('All'); setSearchQuery(''); setSelectedCity('All'); }}
                    className="px-5 py-2.5 bg-zinc-950 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    Reset Filters &amp; View All
                  </button>
                </div>
              </div>
            )}

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. SPOTLIGHT HEADLINERS CAROUSEL (Boiler Room / Stage Aesthetic)          */}
        {/* ========================================================================= */}
        {featuredSlides.length > 0 && (
          <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 bg-[#0B0B0E] text-white border-y border-zinc-800/80">
            <div className="max-w-6xl mx-auto space-y-6">
              
              <div className="flex items-end justify-between">
                <div className="space-y-1">
                  <span className="text-[11px] font-mono uppercase tracking-widest text-[#E31B23] font-bold">
                    Curated Spotlight
                  </span>
                  <h3 className="text-xl sm:text-3xl font-black text-white tracking-tight">
                    Headlining This Month
                  </h3>
                </div>

                {featuredSlides.length > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={prevSlide}
                      aria-label="Previous featured event"
                      className="w-10 h-10 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-white border border-white/10 flex items-center justify-center cursor-pointer transition-all active:scale-95"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={nextSlide}
                      aria-label="Next featured event"
                      className="w-10 h-10 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-white border border-white/10 flex items-center justify-center cursor-pointer transition-all active:scale-95"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div 
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                className="relative rounded-[2rem] overflow-hidden bg-zinc-950 text-white shadow-2xl min-h-[420px] sm:min-h-[460px] lg:aspect-[21/9] flex flex-col justify-end p-6 sm:p-10 lg:p-12 group border border-white/10"
              >
                {/* Crossfading Backgrounds */}
                {featuredSlides.map((slide, index) => {
                  const slideImage = slide.bannerUrl || slide.imageUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1600&q=85';
                  return (
                    <div
                      key={slide.id}
                      className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                        index === currentSlide ? 'opacity-100 z-0' : 'opacity-0 -z-10 pointer-events-none'
                      }`}
                    >
                      <img
                        src={slideImage}
                        alt={slide.title}
                        className="w-full h-full object-cover opacity-60 transform scale-100 group-hover:scale-102 transition-transform duration-1000"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/65 to-transparent" />
                    </div>
                  );
                })}

                {/* Active Slide Content */}
                {featuredSlides[currentSlide] && (
                  <div className="relative z-10 max-w-2xl space-y-3.5">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-semibold border border-white/20">
                      <span className="w-2 h-2 rounded-full bg-[#E31B23]" />
                      <span>{featuredSlides[currentSlide].city || (featuredSlides[currentSlide].venue ? featuredSlides[currentSlide].venue : 'Editor Pick')}</span>
                    </div>

                    <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                      {featuredSlides[currentSlide].title}
                    </h2>

                    <p className="text-zinc-300 text-xs sm:text-sm line-clamp-2 leading-relaxed max-w-xl">
                      {featuredSlides[currentSlide].description}
                    </p>

                    <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
                      <Link
                        to={`/events/${featuredSlides[currentSlide].slug || featuredSlides[currentSlide].id}`}
                        className="w-full sm:w-auto px-7 py-3.5 bg-[#E31B23] hover:bg-[#C9141B] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>Get Tickets</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                      <span className="text-xs text-zinc-300 font-mono">
                        {formatDate(featuredSlides[currentSlide].startDate)}
                        {featuredSlides[currentSlide].startTime ? ` • ${featuredSlides[currentSlide].startTime}` : ''}
                      </span>
                    </div>
                  </div>
                )}

                {/* Progress Indicators */}
                {featuredSlides.length > 1 && (
                  <div className="relative sm:absolute sm:bottom-8 sm:right-8 z-20 flex items-center justify-center sm:justify-end gap-1.5 pt-4 sm:pt-0">
                    {featuredSlides.map((slide, idx) => (
                      <button
                        key={slide.id}
                        type="button"
                        onClick={() => setCurrentSlide(idx)}
                        aria-label={`Go to slide ${idx + 1}`}
                        className={`h-2 rounded-full transition-all cursor-pointer ${
                          idx === currentSlide
                            ? 'w-8 bg-[#E31B23]'
                            : 'w-2 bg-white/30 hover:bg-white/60'
                        }`}
                      />
                    ))}
                  </div>
                )}

              </div>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* 6. THE STRAYTTIX HIGH-ASSURANCE STANDARD: Architectural Bento             */}
        {/* ========================================================================= */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24 bg-white border-b border-zinc-100">
          <div className="max-w-6xl mx-auto space-y-14">
            
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-2 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-xs font-bold text-zinc-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#E31B23]" />
                  <span>The StraytTix Standard</span>
                </div>
                <h2 className="text-3xl sm:text-5xl font-black text-zinc-950 tracking-[-0.03em] leading-tight">
                  Transparent, tamper-proof ticketing.
                </h2>
                <p className="text-zinc-600 text-sm sm:text-base font-normal">
                  Engineered with cryptographic barcodes so you never have to worry about fake tickets, double-entry, or venue delays.
                </p>
              </div>

              <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-zinc-500 bg-zinc-50 px-3.5 py-1.5 rounded-full border border-zinc-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>100% VERIFIED AUTHENTICITY</span>
              </div>
            </div>

            {/* 3 Hardware Bento Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              
              {/* Bento 1: 100% Verified Tickets */}
              <div className="group rounded-[1.75rem] border border-zinc-200/90 bg-gradient-to-b from-white via-white to-zinc-50/70 p-7 sm:p-8 flex flex-col justify-between hover:border-zinc-300 hover:shadow-xl transition-all duration-300 space-y-6">
                
                {/* Visual Header Mockup */}
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>DIRECT FROM ORGANIZER</span>
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">#ZERO-SCALPING</span>
                  </div>
                  <div className="flex items-center gap-3 pt-1">
                    <div className="w-9 h-9 rounded-xl bg-zinc-950 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      ✓
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-zinc-950 truncate">Cryptographic Barcode</p>
                      <p className="text-[10px] text-zinc-500 font-mono truncate">Tamper-Proof Single-Issue ID</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-black text-zinc-950 tracking-tight">
                    100% Verified Passes
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-normal">
                    Every ticket is issued directly by verified promoters. No duplicate passes, no inflated secondary resale markups.
                  </p>
                </div>

                <div className="pt-2 border-t border-zinc-150 flex items-center gap-2 text-xs text-zinc-500 font-medium">
                  <ShieldCheck className="w-4 h-4 text-[#E31B23]" />
                  <span>Full refund guarantee on organizer cancellations</span>
                </div>
              </div>

              {/* Bento 2: Instant Mobile Passes */}
              <div className="group rounded-[1.75rem] border border-zinc-200/90 bg-gradient-to-b from-white via-white to-zinc-50/70 p-7 sm:p-8 flex flex-col justify-between hover:border-zinc-300 hover:shadow-xl transition-all duration-300 space-y-6">
                
                {/* Visual Header Mockup */}
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-800 bg-zinc-200/80 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <Smartphone className="w-3 h-3 text-zinc-600" />
                      <span>OFFLINE READY</span>
                    </span>
                    <span className="text-[10px] font-mono text-emerald-600 font-bold">DELIVERED</span>
                  </div>
                  <div className="flex items-center gap-3 pt-1">
                    <div className="w-9 h-9 rounded-xl bg-[#E31B23] text-white flex items-center justify-center shrink-0">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-zinc-950 truncate">Apple &amp; Google Wallet Pass</p>
                      <p className="text-[10px] text-zinc-500 font-mono truncate">One-Tap Gate Presentation</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-black text-zinc-950 tracking-tight">
                    Instant Mobile Passes
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-normal">
                    Tickets appear immediately in your account and arrive in your email with offline-cached QR access for zero-reception venues.
                  </p>
                </div>

                <div className="pt-2 border-t border-zinc-150 flex items-center gap-2 text-xs text-zinc-500 font-medium">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Works with zero mobile reception at packed venues</span>
                </div>
              </div>

              {/* Bento 3: Smooth Gate Entry */}
              <div className="group rounded-[1.75rem] border border-zinc-200/90 bg-gradient-to-b from-white via-white to-zinc-50/70 p-7 sm:p-8 flex flex-col justify-between hover:border-zinc-300 hover:shadow-xl transition-all duration-300 space-y-6">
                
                {/* Visual Header Mockup */}
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <Zap className="w-3 h-3 text-emerald-600" />
                      <span>&lt; 0.2s SCAN SPEED</span>
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">TURNSTILE CLEAR</span>
                  </div>
                  <div className="flex items-center gap-3 pt-1">
                    <div className="w-9 h-9 rounded-xl bg-zinc-950 text-white flex items-center justify-center shrink-0">
                      <Ticket className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-zinc-950 truncate">Sub-Second Gate Clearance</p>
                      <p className="text-[10px] text-zinc-500 font-mono truncate">Free High-Density Check-In App</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-black text-zinc-950 tracking-tight">
                    Sub-Second Door Entry
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-normal">
                    Show your QR pass on your phone screen at the entrance for immediate check-in using our high-speed gate scanner.
                  </p>
                </div>

                <div className="pt-2 border-t border-zinc-150 flex items-center gap-2 text-xs text-zinc-500 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Zero physical paper printouts required</span>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 7. LIVE SCALE METRICS (Monochrome Authority)                              */}
        {/* ========================================================================= */}
        <section className="px-4 sm:px-6 lg:px-8 py-14 sm:py-18 bg-[#09090C] text-white border-b border-zinc-900">
          <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 text-center lg:text-left">
            <div className="space-y-1">
              <p className="text-3xl sm:text-5xl font-black font-mono tracking-tight text-white">₦1.8B+</p>
              <p className="text-xs sm:text-sm text-zinc-400 font-medium">Ticket Gross Volume Processed</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl sm:text-5xl font-black font-mono tracking-tight text-white">180K+</p>
              <p className="text-xs sm:text-sm text-zinc-400 font-medium">Tickets Safely Scanned</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl sm:text-5xl font-black font-mono tracking-tight text-white">&lt;0.2s</p>
              <p className="text-xs sm:text-sm text-zinc-400 font-medium">Average Gate Clearance Latency</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl sm:text-5xl font-black font-mono tracking-tight text-white">0%</p>
              <p className="text-xs sm:text-sm text-zinc-400 font-medium">Counterfeit Ticket Incidents</p>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 8. FOR ORGANIZERS: Luxury Creator Monolith Card                            */}
        {/* ========================================================================= */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="rounded-[2.25rem] bg-[#0A0A0D] text-white p-8 sm:p-14 lg:p-16 flex flex-col lg:flex-row lg:items-center justify-between gap-10 border border-white/10 shadow-2xl relative overflow-hidden">
              
              {/* Subtle Ambient Radial Glow */}
              <div className="absolute -right-20 -bottom-20 w-[450px] h-[450px] bg-[#E31B23]/15 blur-[120px] rounded-full pointer-events-none" />

              <div className="max-w-xl space-y-4 relative z-10">
                <span className="text-xs font-mono uppercase tracking-widest text-[#E31B23] font-bold">
                  Event Infrastructure for Creators
                </span>
                <h2 className="text-3xl sm:text-5xl font-black tracking-[-0.03em] text-white leading-tight">
                  Hosting an event? Sell out with StraytTix.
                </h2>
                <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
                  Publish your event page in under 5 minutes. Manage ticket tiers, scan attendee passes with our companion gate terminal, and receive direct automated bank settlements.
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-mono text-zinc-400">
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Instant Bank Payouts</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Zero Surprise Buyer Fees</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Free Gate Check-in App</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 shrink-0 relative z-10">
                <Link
                  to="/organizer/events/create"
                  className="px-8 py-4 bg-[#E31B23] hover:bg-[#C9141B] text-white text-sm sm:text-base font-bold rounded-xl transition-all shadow-xl active:scale-95 text-center cursor-pointer flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create an Event</span>
                </Link>
                <Link
                  to="/pricing"
                  className="px-8 py-4 bg-white/10 hover:bg-white/15 text-white text-sm sm:text-base font-semibold rounded-xl transition-all border border-white/15 text-center cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>View Pricing</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>

            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default Home;
