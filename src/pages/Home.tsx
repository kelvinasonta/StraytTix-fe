import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import EventCard from '../components/ui/EventCard';
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
  Music2,
  Cpu,
  GlassWater,
  Sparkles,
  Smile,
  CheckCircle2,
  QrCode,
  Zap
} from 'lucide-react';

// Curated realistic events for fallback if local API has no events yet
const FALLBACK_EVENTS: Event[] = [
  {
    id: 'demo-1',
    slug: 'afrobeats-symphony-live-2026',
    title: 'Afrobeats Symphony Live: Philharmonic & Live Percussion',
    description: 'An open-air orchestral celebration of contemporary West African classics featuring a 40-piece choir.',
    category: 'Music',
    status: 'Published',
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=85',
    bannerUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=85',
    startDate: '2026-10-24',
    startTime: '19:00',
    endDate: '2026-10-24',
    endTime: '23:30',
    timezone: 'Africa/Lagos',
    locationType: 'physical',
    city: 'Lagos',
    venue: 'Eko Convention Centre',
    venueName: 'Eko Convention Centre',
    isFeatured: true,
    organizer: {
      id: 'org-1',
      name: 'Lagos Philharmonic Society',
      slug: 'lagos-philharmonic'
    },
    tickets: [
      { id: 't-1', name: 'Regular Entry', price: 15000, quantity: 500, status: 'available' },
      { id: 't-2', name: 'VIP Circle', price: 35000, quantity: 100, status: 'available' }
    ] as any
  },
  {
    id: 'demo-2',
    slug: 'scale-africa-tech-summit-2026',
    title: 'Scale Africa: AI & Emerging Tech Summit 2026',
    description: 'Bringing together 1,200 founders, engineers, and product builders shaping technology across Africa.',
    category: 'Technology',
    status: 'Published',
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=85',
    bannerUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=85',
    startDate: '2026-11-05',
    startTime: '09:00',
    endDate: '2026-11-06',
    endTime: '18:00',
    timezone: 'Africa/Lagos',
    locationType: 'physical',
    city: 'Lagos',
    venue: 'Landmark Centre, Victoria Island',
    venueName: 'Landmark Centre, Victoria Island',
    isFeatured: true,
    organizer: {
      id: 'org-2',
      name: 'Scale Africa Network',
      slug: 'scale-africa'
    },
    tickets: [
      { id: 't-3', name: 'Standard Pass', price: 25000, quantity: 400, status: 'available' },
      { id: 't-4', name: 'Investor Pass', price: 75000, quantity: 50, status: 'available' }
    ] as any
  },
  {
    id: 'demo-3',
    slug: 'palm-groove-sessions',
    title: 'Palm Groove: Sunset Electronic & House Sessions',
    description: 'Intimate beachfront day party featuring deep house, amapiano, and live percussion by the water.',
    category: 'Nightlife',
    status: 'Published',
    imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=85',
    bannerUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=85',
    startDate: '2026-10-18',
    startTime: '16:00',
    endDate: '2026-10-18',
    endTime: '23:00',
    timezone: 'Africa/Lagos',
    locationType: 'physical',
    city: 'Lagos',
    venue: 'Wave Beach, Elegushi',
    venueName: 'Wave Beach, Elegushi',
    organizer: {
      id: 'org-3',
      name: 'Palm Groove Collective',
      slug: 'palm-groove'
    },
    tickets: [
      { id: 't-5', name: 'Early Entry', price: 8000, quantity: 150, status: 'available' },
      { id: 't-6', name: 'General Admission', price: 12000, quantity: 300, status: 'available' }
    ] as any
  },
  {
    id: 'demo-4',
    slug: 'abuja-culinary-craft-market',
    title: 'The Capital Food & Craft Festival',
    description: 'Over 60 independent chefs, bakers, distillers, and artisan stalls in an open garden setting.',
    category: 'Food & Drink',
    status: 'Published',
    imageUrl: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1200&q=85',
    bannerUrl: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1200&q=85',
    startDate: '2026-10-31',
    startTime: '11:00',
    endDate: '2026-10-31',
    endTime: '20:00',
    timezone: 'Africa/Lagos',
    locationType: 'physical',
    city: 'Abuja',
    venue: 'Millennium Park, Maitama',
    venueName: 'Millennium Park, Maitama',
    organizer: {
      id: 'org-4',
      name: 'Abuja Culinary Guild',
      slug: 'abuja-culinary'
    },
    tickets: [
      { id: 't-7', name: 'Day Pass', price: 5000, quantity: 600, status: 'available' }
    ] as any
  }
];

const FEATURED_SLIDES = [
  {
    id: 'slide-1',
    title: 'Afrobeats Symphony Live: Philharmonic & Choir',
    description: 'A 40-piece philharmonic choir and guest percussionists reinterpreting legendary African sounds live on stage at Eko Convention Centre.',
    tag: 'Lagos',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1600&q=85',
    price: 'From ₦15,000',
    date: 'Saturday, Oct 24',
    link: '/discover?category=Music'
  },
  {
    id: 'slide-2',
    title: "Scale Africa '26: AI Infrastructure & Tech Summit",
    description: 'Two days of keynotes from 50+ founders, venture partners, and engineering leaders shaping distributed computing across emerging markets.',
    tag: 'Tech Summit • Victoria Island',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=85',
    price: 'From ₦25,000',
    date: 'Nov 05 - 06',
    link: '/discover?category=Technology'
  },
  {
    id: 'slide-3',
    title: 'Palm Groove: Sunset Beach & Amapiano Sessions',
    description: 'Intimate beachfront day festival featuring deep house, amapiano, and live percussion by the Atlantic ocean shoreline.',
    tag: 'Festival • Wave Beach',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1600&q=85',
    price: 'From ₦8,000',
    date: 'Sunday, Oct 18',
    link: '/discover?category=Nightlife'
  },
  {
    id: 'slide-4',
    title: 'The Capital Food & Craft Festival',
    description: 'Over 60 independent chefs, artisan stalls, live jazz, and craft tastings in Millennium Park.',
    tag: 'Culinary & Arts • Abuja',
    image: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1600&q=85',
    price: 'From ₦5,000',
    date: 'Saturday, Oct 31',
    link: '/discover?category=Food%20%26%20Drink'
  }
];

export const Home: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('Lagos');
  const [selectedDateFilter, setSelectedDateFilter] = useState('All Dates');
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const navigate = useNavigate();

  const { isAuthenticated, user } = useAuth();

  // Carousel auto-advance timer with pause on hover
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % FEATURED_SLIDES.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isPaused]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? FEATURED_SLIDES.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % FEATURED_SLIDES.length);
  };

  // Hydrate favorites from backend if user is authenticated
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      favoritesApi.getFavoriteIds().catch(() => {});
    }
  }, [isAuthenticated, user?.id]);

  // Load real events from API, with graceful fallback
  useEffect(() => {
    let isMounted = true;
    eventApi.getEvents({ per_page: 8 })
      .then((res: any) => {
        if (!isMounted) return;
        const resData = res?.data?.data || res?.data;
        const list = Array.isArray(resData) ? resData : (resData as any)?.items || [];
        if (list.length > 0) {
          setEvents(list.map(normalizeBackendEvent));
        } else {
          setEvents(FALLBACK_EVENTS);
        }
      })
      .catch(() => {
        if (isMounted) setEvents(FALLBACK_EVENTS);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (selectedCity) params.set('city', selectedCity);
    if (selectedDateFilter === 'This Weekend') params.set('timeframe', 'weekend');
    if (selectedDateFilter === 'Free') params.set('price', 'free');
    navigate(`/discover?${params.toString()}`);
  };

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    navigate(`/discover?${params.toString()}`);
  };

  const categories = [
    { name: 'Music', label: 'Concerts & Live Shows', icon: Music2, count: '140+ events' },
    { name: 'Nightlife', label: 'Parties & DJ Sets', icon: GlassWater, count: '85+ events' },
    { name: 'Technology', label: 'Tech & Summits', icon: Cpu, count: '50+ events' },
    { name: 'Comedy', label: 'Standup & Theatre', icon: Smile, count: '30+ shows' },
    { name: 'Food & Drink', label: 'Festivals & Dining', icon: Sparkles, count: '45+ events' }
  ];

  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col justify-between selection:bg-[#E31B23] selection:text-white">
      {/* ========================================================================= */}
      {/* 0. $40K LUXURY TOP ANNOUNCEMENT BANNER */}
      {/* ========================================================================= */}
      {showBanner && (
        <aside 
          aria-label="Platform Announcement"
          className="relative bg-zinc-950 text-white text-[11px] sm:text-xs font-medium border-b border-white/10 px-4 py-2.5 overflow-hidden transition-all"
        >
          {/* Subtle Accent Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#E31B23]/25 via-transparent to-[#E31B23]/15 pointer-events-none" />
          
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-2.5 truncate mx-auto sm:mx-0">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#E31B23] text-white font-mono text-[9px] font-black uppercase tracking-wider shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                OFFICIAL RELEASE
              </span>
              <p className="truncate text-zinc-200">
                <span className="font-semibold text-white">Eventa Mobile 2.0 is live:</span> Offline QR passes & sub-second gate check-in now available for iOS & Android.
              </p>
            </div>

            <div className="hidden sm:flex items-center gap-4 shrink-0">
              <Link 
                to="/download" 
                className="inline-flex items-center gap-1 text-white hover:text-red-400 font-bold transition-colors underline underline-offset-4 text-xs"
              >
                <span>Get the App</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => setShowBanner(false)}
                aria-label="Dismiss banner"
                className="text-zinc-400 hover:text-white p-1 rounded transition-colors cursor-pointer text-xs font-mono"
              >
                ✕
              </button>
            </div>
          </div>
        </aside>
      )}

      <Navbar />

      <main className="flex-1">
        {/* ========================================================================= */}
        {/* 1. HERO SECTION: Human, confident, and direct */}
        {/* ========================================================================= */}
        <section className="px-4 sm:px-6 lg:px-8 pt-8 pb-12 sm:pt-12 sm:pb-16 border-b border-zinc-100">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {/* Top Bar: City Selector & Direct Headline */}
            <div className="space-y-4 max-w-3xl">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-zinc-500">
                <div className="inline-flex items-center gap-1.5 text-zinc-900 font-bold bg-zinc-100 hover:bg-zinc-200/80 transition-colors px-3 py-1.5 rounded-xl border border-zinc-200/80 shadow-2xs">
                  <MapPin className="w-3.5 h-3.5 text-[#E31B23]" />
                  <select
                    value={selectedCity}
                    onChange={(e) => handleCitySelect(e.target.value)}
                    className="bg-transparent outline-none cursor-pointer pr-1 text-xs sm:text-sm font-bold"
                    aria-label="Select city"
                  >
                    <option value="Lagos">Lagos</option>
                    <option value="Abuja">Abuja</option>
                    <option value="Port Harcourt">Port Harcourt</option>
                    <option value="Accra">Accra</option>
                    <option value="London">London</option>
                  </select>
                </div>
              </div>

              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-zinc-950 leading-[1.08] text-balance">
                Live music, festivals, and cultural events near you.
              </h1>

              <p className="text-zinc-600 text-base sm:text-lg leading-relaxed max-w-2xl font-normal">
                Discover tickets directly from verified organizers. Fast QR delivery, zero ticket scalping, and no surprise checkout fees.
              </p>
            </div>

            {/* Direct, Functional Search Bar */}
            <form 
              onSubmit={handleSearchSubmit}
              className="bg-zinc-50 p-2 sm:p-2.5 rounded-2xl border border-zinc-200/90 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-4xl focus-within:border-zinc-400 focus-within:bg-white transition-all"
            >
              <div className="flex items-center gap-3 px-3 py-2 flex-1 min-w-0">
                <Search className="w-5 h-5 text-zinc-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by artist, event title, or venue..."
                  className="w-full bg-transparent text-sm sm:text-base text-zinc-900 placeholder-zinc-400 outline-none font-medium truncate"
                />
              </div>

              {/* Date Filter Quick Options */}
              <div className="flex items-center gap-1.5 px-3 py-1 sm:border-l border-zinc-200 shrink-0 text-xs text-zinc-600">
                {['All Dates', 'This Weekend', 'Free'].map((pill) => (
                  <button
                    key={pill}
                    type="button"
                    onClick={() => setSelectedDateFilter(pill)}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                      selectedDateFilter === pill 
                        ? 'bg-zinc-900 text-white font-semibold' 
                        : 'bg-white hover:bg-zinc-200 text-zinc-700'
                    }`}
                  >
                    {pill}
                  </button>
                ))}
              </div>

              {/* Search Button */}
              <button
                type="submit"
                className="px-7 py-3 bg-[#E31B23] hover:bg-[#B91C1C] text-white text-sm sm:text-base font-bold rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5 shrink-0 active:scale-[0.98]"
              >
                <span>Find Tickets</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Category Quick Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none pt-1">
              <Link
                to="/discover"
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-zinc-900 text-white shrink-0 hover:bg-zinc-800 transition-colors"
              >
                All Events
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.name}
                  to={`/discover?category=${encodeURIComponent(cat.name)}`}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 shrink-0 transition-colors flex items-center gap-2"
                >
                  <cat.icon className="w-3.5 h-3.5 text-zinc-500" />
                  <span>{cat.name}</span>
                </Link>
              ))}
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. FEATURED HEADLINER HERO SPOTLIGHT CAROUSEL */}
        {/* ========================================================================= */}
        <section className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12 bg-zinc-50/70 border-b border-zinc-200/60">
          <div className="max-w-6xl mx-auto">
            <div 
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              className="relative rounded-3xl overflow-hidden bg-zinc-950 text-white shadow-xl min-h-[440px] sm:min-h-[400px] lg:aspect-[21/9] flex flex-col justify-end p-5 sm:p-10 lg:p-12 group"
            >
              {/* Background Images with Crossfade Transition */}
              {FEATURED_SLIDES.map((slide, index) => (
                <div
                  key={slide.id}
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                    index === currentSlide ? 'opacity-100 z-0' : 'opacity-0 -z-10 pointer-events-none'
                  }`}
                >
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-cover opacity-70 transform scale-100 group-hover:scale-102 transition-transform duration-1000"
                  />
                  {/* Heavy dark gradient on mobile so text is 100% readable */}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-zinc-950/20 sm:via-zinc-950/45 sm:to-transparent" />
                </div>
              ))}

              {/* Prev / Next Navigation Arrows */}
              <div className="absolute top-4 right-4 sm:top-8 sm:right-8 z-20 flex items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={prevSlide}
                  aria-label="Previous featured event"
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/60 hover:bg-black/85 backdrop-blur-md text-white border border-white/20 flex items-center justify-center cursor-pointer transition-all active:scale-95 shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  aria-label="Next featured event"
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/60 hover:bg-black/85 backdrop-blur-md text-white border border-white/20 flex items-center justify-center cursor-pointer transition-all active:scale-95 shadow-sm"
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              {/* Active Slide Content */}
              <div className="relative z-10 max-w-2xl space-y-2.5 sm:space-y-3 pt-12 sm:pt-0">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-[11px] sm:text-xs font-semibold border border-white/20">
                  <span className="w-2 h-2 rounded-full bg-[#E31B23]" />
                  <span>{FEATURED_SLIDES[currentSlide].tag}</span>
                </div>

                <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight transition-all duration-300">
                  {FEATURED_SLIDES[currentSlide].title}
                </h2>

                <p className="text-zinc-300 text-xs sm:text-sm line-clamp-2 leading-relaxed transition-all duration-300 max-w-xl">
                  {FEATURED_SLIDES[currentSlide].description}
                </p>

                <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <Link
                    to={FEATURED_SLIDES[currentSlide].link}
                    className="w-full sm:w-auto px-6 py-3 bg-[#E31B23] hover:bg-[#B91C1C] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Get Tickets</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <span className="text-xs text-zinc-300 font-medium font-mono text-center sm:text-left">
                    {FEATURED_SLIDES[currentSlide].price} • {FEATURED_SLIDES[currentSlide].date}
                  </span>
                </div>
              </div>

              {/* Progress Dot Indicators */}
              <div className="relative sm:absolute sm:bottom-8 sm:right-8 z-20 flex items-center justify-center sm:justify-end gap-1.5 pt-4 sm:pt-0">
                {FEATURED_SLIDES.map((slide, idx) => (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => setCurrentSlide(idx)}
                    aria-label={`Go to slide ${idx + 1}: ${slide.title}`}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      idx === currentSlide
                        ? 'w-7 bg-[#E31B23]'
                        : 'w-2 bg-white/40 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>

            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. UPCOMING EVENTS (Real EventCard Grid) */}
        {/* ========================================================================= */}
        <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {/* Header */}
            <div className="flex items-end justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
                  Upcoming Events
                </h2>
                <p className="text-zinc-500 text-xs sm:text-sm font-medium">
                  Browse concerts, summits, and nightlife happening this month.
                </p>
              </div>

              <Link
                to="/discover"
                className="text-xs sm:text-sm font-bold text-[#E31B23] hover:underline flex items-center gap-1 shrink-0"
              >
                <span>View all events</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Event Cards Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="rounded-2xl border border-zinc-200 bg-white p-4 space-y-4 animate-pulse">
                    <div className="aspect-[4/3] bg-zinc-200 rounded-xl" />
                    <div className="h-4 bg-zinc-200 rounded w-3/4" />
                    <div className="h-3 bg-zinc-100 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : events.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {events.map((evt) => (
                  <EventCard key={evt.id} event={evt} variant="default" />
                ))}
              </div>
            ) : (
              <div className="p-12 text-center border border-zinc-200 rounded-2xl bg-zinc-50">
                <Calendar className="w-10 h-10 text-zinc-400 mx-auto mb-3" />
                <h3 className="text-base font-bold text-zinc-900">No events found in this view</h3>
                <p className="text-xs text-zinc-500 mt-1">Check back soon or broaden your search criteria.</p>
              </div>
            )}

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. EXPLORE BY GENRE & THEME (Clean Editorial Banners) */}
        {/* ========================================================================= */}
        <section className="px-4 sm:px-6 lg:px-8 py-12 bg-zinc-50 border-y border-zinc-200/70">
          <div className="max-w-6xl mx-auto space-y-6">
            <h2 className="text-xl sm:text-2xl font-black text-zinc-950 tracking-tight">
              Explore by Category
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <Link
                to="/discover?category=Music"
                className="relative rounded-2xl overflow-hidden aspect-[16/10] group p-6 flex flex-col justify-end text-white shadow-sm"
              >
                <img
                  src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80"
                  alt="Music & Live Shows"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                <div className="relative z-10 space-y-1">
                  <h3 className="text-lg font-black">Live Music & Concerts</h3>
                  <p className="text-xs text-zinc-300">Acoustic sets, stadium tours, and festivals</p>
                </div>
              </Link>

              <Link
                to="/discover?category=Technology"
                className="relative rounded-2xl overflow-hidden aspect-[16/10] group p-6 flex flex-col justify-end text-white shadow-sm"
              >
                <img
                  src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80"
                  alt="Tech & Summits"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                <div className="relative z-10 space-y-1">
                  <h3 className="text-lg font-black">Tech & Business Summits</h3>
                  <p className="text-xs text-zinc-300">Conferences, investor mixers, and product launches</p>
                </div>
              </Link>

              <Link
                to="/discover?category=Nightlife"
                className="relative rounded-2xl overflow-hidden aspect-[16/10] group p-6 flex flex-col justify-end text-white shadow-sm"
              >
                <img
                  src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80"
                  alt="Nightlife & Parties"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                <div className="relative z-10 space-y-1">
                  <h3 className="text-lg font-black">Nightlife & Beach Parties</h3>
                  <p className="text-xs text-zinc-300">Club takeovers, sunset grooves, and rooftop events</p>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. THE EVENTA BUYER GUARANTEE (Elevated Visual Cards) */}
        {/* ========================================================================= */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20 bg-white border-t border-zinc-100">
          <div className="max-w-6xl mx-auto space-y-12">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-2 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-xs font-bold text-zinc-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#E31B23]" />
                  <span>The Eventa Buyer Guarantee</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-zinc-950 tracking-tight leading-tight">
                  Simple, transparent ticketing.
                </h2>
                <p className="text-zinc-600 text-sm sm:text-base font-normal">
                  Engineered so you never have to worry about fake tickets, lost passes, or gate bottlenecks.
                </p>
              </div>

              <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-zinc-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>100% VERIFIED AUTHENTICITY</span>
              </div>
            </div>

            {/* 3 Elevated Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              
              {/* Card 1: 100% Verified Tickets */}
              <div className="group rounded-3xl border border-zinc-200/90 bg-gradient-to-b from-white to-zinc-50/60 p-7 flex flex-col justify-between hover:border-zinc-300 hover:shadow-lg transition-all space-y-6">
                
                {/* Visual Header / Micro-Mockup */}
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>DIRECT FROM ORGANIZER</span>
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">#NO-SCALPING</span>
                  </div>
                  <div className="flex items-center gap-2.5 pt-1">
                    <div className="w-8 h-8 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      ✓
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-zinc-900 truncate">Official Verified Barcode</p>
                      <p className="text-[10px] text-zinc-500 font-mono truncate">Tamper-Proof Digital ID</p>
                    </div>
                  </div>
                </div>

                {/* Text Content */}
                <div className="space-y-2">
                  <h3 className="text-lg font-black text-zinc-950 tracking-tight">
                    100% Verified Tickets
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-normal">
                    Every ticket is issued directly by verified event organizers. No duplicate passes, no inflated resale markups.
                  </p>
                </div>

                {/* Bottom Assurance */}
                <div className="pt-2 border-t border-zinc-150 flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
                  <ShieldCheck className="w-4 h-4 text-[#E31B23]" />
                  <span>Full refund guarantee on cancellations</span>
                </div>

              </div>

              {/* Card 2: Instant Mobile Passes */}
              <div className="group rounded-3xl border border-zinc-200/90 bg-gradient-to-b from-white to-zinc-50/60 p-7 flex flex-col justify-between hover:border-zinc-300 hover:shadow-lg transition-all space-y-6">
                
                {/* Visual Header / Micro-Mockup */}
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-700 bg-zinc-200/80 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <Smartphone className="w-3 h-3" />
                      <span>OFFLINE READY</span>
                    </span>
                    <span className="text-[10px] font-mono text-emerald-600 font-bold">DELIVERED</span>
                  </div>
                  <div className="flex items-center gap-2.5 pt-1">
                    <div className="w-8 h-8 rounded-xl bg-[#E31B23] text-white flex items-center justify-center shrink-0">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-zinc-900 truncate">Instant Wallet & Email Delivery</p>
                      <p className="text-[10px] text-zinc-500 font-mono truncate">Apple & Google Wallet Ready</p>
                    </div>
                  </div>
                </div>

                {/* Text Content */}
                <div className="space-y-2">
                  <h3 className="text-lg font-black text-zinc-950 tracking-tight">
                    Instant Mobile Passes
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-normal">
                    Your tickets appear immediately in your account and are sent straight to your email with offline QR access.
                  </p>
                </div>

                {/* Bottom Assurance */}
                <div className="pt-2 border-t border-zinc-150 flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Works with zero mobile reception</span>
                </div>

              </div>

              {/* Card 3: Smooth Entry at the Door */}
              <div className="group rounded-3xl border border-zinc-200/90 bg-gradient-to-b from-white to-zinc-50/60 p-7 flex flex-col justify-between hover:border-zinc-300 hover:shadow-lg transition-all space-y-6">
                
                {/* Visual Header / Micro-Mockup */}
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      <span>&lt; 0.2s SCAN SPEED</span>
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">FAST-TRACK</span>
                  </div>
                  <div className="flex items-center gap-2.5 pt-1">
                    <div className="w-8 h-8 rounded-xl bg-zinc-900 text-white flex items-center justify-center shrink-0">
                      <Ticket className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-zinc-900 truncate">Venue Turnstile Clearance</p>
                      <p className="text-[10px] text-zinc-500 font-mono truncate">One-Tap Camera Scan</p>
                    </div>
                  </div>
                </div>

                {/* Text Content */}
                <div className="space-y-2">
                  <h3 className="text-lg font-black text-zinc-950 tracking-tight">
                    Smooth Entry at the Door
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-normal">
                    Show your QR pass on your phone screen at the venue gate for quick check-in.
                  </p>
                </div>

                {/* Bottom Assurance */}
                <div className="pt-2 border-t border-zinc-150 flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>No physical printout necessary</span>
                </div>

              </div>

            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 6. CALLOUT FOR CREATORS & ORGANIZERS (Honest, Professional & Calm) */}
        {/* ========================================================================= */}
        <section className="px-4 sm:px-6 lg:px-8 py-12 pb-20">
          <div className="max-w-6xl mx-auto">
            <div className="rounded-3xl bg-zinc-950 text-white p-8 sm:p-14 flex flex-col md:flex-row md:items-center justify-between gap-8 border border-zinc-800 shadow-xl">
              <div className="max-w-xl space-y-3">
                <span className="text-xs font-mono uppercase tracking-widest text-zinc-400 font-bold">For Event Organizers</span>
                <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                  Hosting an event? Sell tickets with StraytTix.
                </h2>
                <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
                  Publish your event page in minutes. Manage guestlists, scan tickets at the door with our free camera app, and get settled directly to your bank account post-event.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                <Link
                  to="/organizer/events/create"
                  className="px-6 py-3.5 bg-[#E31B23] hover:bg-[#B91C1C] text-white text-sm font-bold rounded-xl transition-all shadow-md active:scale-95 text-center cursor-pointer"
                >
                  Create an Event
                </Link>
                <Link
                  to="/pricing"
                  className="px-6 py-3.5 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-semibold rounded-xl transition-all border border-zinc-700 text-center cursor-pointer"
                >
                  View Pricing
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
