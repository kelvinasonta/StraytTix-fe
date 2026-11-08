import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import EventCard from '../components/ui/EventCard';
import { eventApi, normalizeBackendEvent } from '../api/events';
import { favoritesApi } from '../api/favorites';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../api/client';
import { countriesApi, type Country, DEFAULT_COUNTRIES } from '../api/countries';
import type { Event } from '../types/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  SlidersHorizontal, 
  LayoutGrid, 
  List, 
  RotateCcw, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  AlertCircle, 
  X,
  ChevronDown,
  Sparkles,
  Coins,
  Globe
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Music',
  'Nightlife',
  'Technology',
  'Business',
  'Comedy',
  'Sports',
  'Food & Drink'
];

const DATE_OPTIONS = [
  { id: 'all', label: 'Anytime' },
  { id: 'today', label: 'Today' },
  { id: 'weekend', label: 'This Weekend' },
  { id: 'month', label: 'Next 30 Days' },
];

const FORMAT_OPTIONS = [
  { id: 'All', label: 'All Formats' },
  { id: 'physical', label: 'In-Person' },
  { id: 'virtual', label: 'Online' },
];

type ActiveFilterModal = 'price' | 'date' | 'format' | 'region' | null;

export const Discover: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // URL-driven query state
  const initialCategory = searchParams.get('category') || 'All';
  const initialSearch = searchParams.get('search') || '';
  const initialPage = parseInt(searchParams.get('page') || '1', 10);
  const initialFormat = (searchParams.get('format') || 'All') as 'All' | 'physical' | 'virtual';
  const initialDate = (searchParams.get('date') || 'all') as 'all' | 'today' | 'weekend' | 'month';
  const initialMinPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : 0;
  const initialMaxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : 100000;

  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [formatFilter, setFormatFilter] = useState<'All' | 'physical' | 'virtual'>(initialFormat);
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'weekend' | 'month'>(initialDate);
  
  // Numerical Price Range Filter
  const [minPrice, setMinPrice] = useState<number>(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState<number>(initialMaxPrice);
  const [isPriceCustomized, setIsPriceCustomized] = useState<boolean>(initialMinPrice > 0 || initialMaxPrice < 100000);

  // Staged Modal State for Price, Date, Format, and Region
  const [activeModal, setActiveModal] = useState<ActiveFilterModal>(null);

  // Staged values inside active modal so users can cancel or apply
  const [tempMinPrice, setTempMinPrice] = useState<number>(initialMinPrice);
  const [tempMaxPrice, setTempMaxPrice] = useState<number>(initialMaxPrice);
  const [tempDateFilter, setTempDateFilter] = useState<'all' | 'today' | 'weekend' | 'month'>(initialDate);
  const [tempFormatFilter, setTempFormatFilter] = useState<'All' | 'physical' | 'virtual'>(initialFormat);

  // Default to list style on mobile and tablet (screen width < 1024px), grid on desktop
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1024 ? 'list' : 'grid';
    }
    return 'list';
  });

  // Country state loaded from backend API
  const [countries, setCountries] = useState<Country[]>(DEFAULT_COUNTRIES);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(() => {
    const saved = localStorage.getItem('strayttix_selected_country');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fall back to null
      }
    }
    return null;
  });

  // Fetch backend supported countries
  useEffect(() => {
    countriesApi.getCountries()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCountries(data);
        }
      })
      .catch((err) => {
        console.warn('Discover: error loading countries from backend:', err);
      });
  }, []);

  const handleSelectCountry = (c: Country | null) => {
    setSelectedCountry(c);
    setActiveModal(null);
    if (c) {
      localStorage.setItem('strayttix_selected_country', JSON.stringify(c));
    } else {
      localStorage.removeItem('strayttix_selected_country');
    }
  };

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

  // Initial load and filter synchronization with URL
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      const initialTargetPage = parseInt(searchParams.get('page') || '1', 10);
      fetchEvents(initialTargetPage, debouncedSearch, category, formatFilter);
      return;
    }

    // Keep URL in sync with filter states for shareability
    const newParams: Record<string, string> = { page: '1' };
    if (category !== 'All') newParams.category = category;
    if (debouncedSearch.trim()) newParams.search = debouncedSearch.trim();
    if (formatFilter !== 'All') newParams.format = formatFilter;
    if (dateFilter !== 'all') newParams.date = dateFilter;
    if (isPriceCustomized) {
      newParams.minPrice = minPrice.toString();
      newParams.maxPrice = maxPrice.toString();
    }
    setSearchParams(newParams, { replace: true });

    fetchEvents(1, debouncedSearch, category, formatFilter);
  }, [debouncedSearch, category, formatFilter, dateFilter, minPrice, maxPrice, isPriceCustomized]);

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
    setDateFilter('all');
    setFormatFilter('All');
    setMinPrice(0);
    setMaxPrice(100000);
    setIsPriceCustomized(false);
    setSelectedCountry(null);
    localStorage.removeItem('strayttix_selected_country');
    setSearchParams({ page: '1' });
    fetchEvents(1, '', 'All', 'All');
  };

  // Open modal and initialize temporary staging values
  const openModal = (modal: ActiveFilterModal) => {
    if (modal === 'price') {
      setTempMinPrice(minPrice);
      setTempMaxPrice(maxPrice);
    } else if (modal === 'date') {
      setTempDateFilter(dateFilter);
    } else if (modal === 'format') {
      setTempFormatFilter(formatFilter);
    }
    setActiveModal(modal);
  };

  const applyPriceModal = () => {
    setMinPrice(tempMinPrice);
    setMaxPrice(tempMaxPrice);
    setIsPriceCustomized(tempMinPrice > 0 || tempMaxPrice < 100000);
    setActiveModal(null);
  };

  const clearPriceModal = () => {
    setTempMinPrice(0);
    setTempMaxPrice(100000);
    setMinPrice(0);
    setMaxPrice(100000);
    setIsPriceCustomized(false);
    setActiveModal(null);
  };

  const applyDateModal = () => {
    setDateFilter(tempDateFilter);
    setActiveModal(null);
  };

  const clearDateModal = () => {
    setTempDateFilter('all');
    setDateFilter('all');
    setActiveModal(null);
  };

  const applyFormatModal = () => {
    setFormatFilter(tempFormatFilter);
    setActiveModal(null);
  };

  const clearFormatModal = () => {
    setTempFormatFilter('All');
    setFormatFilter('All');
    setActiveModal(null);
  };

  // Client-side numerical price, date, and country refinement filters
  const displayEvents = useMemo(() => {
    let filtered = events;

    // Filter by Numerical Price Range
    if (isPriceCustomized) {
      filtered = filtered.filter((e) => {
        if (!e.tickets || e.tickets.length === 0) {
          // Free event matches if minPrice is 0
          return minPrice === 0;
        }
        const prices = e.tickets.map((t) => t.price);
        const startingPrice = Math.min(...prices);
        return startingPrice >= minPrice && startingPrice <= maxPrice;
      });
    }

    // Filter by Date (Today, This Weekend, Next 30 Days)
    if (dateFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter((e) => {
        if (!e.startDate) return false;
        const eventDate = new Date(e.startDate);

        if (dateFilter === 'today') {
          return eventDate.toDateString() === now.toDateString();
        }

        if (dateFilter === 'weekend') {
          const day = now.getDay();
          const diffToFriday = (5 - day + 7) % 7;
          const friday = new Date(now);
          friday.setDate(now.getDate() + diffToFriday);
          friday.setHours(0, 0, 0, 0);

          const sunday = new Date(friday);
          sunday.setDate(friday.getDate() + 2);
          sunday.setHours(23, 59, 59, 999);

          return eventDate >= friday && eventDate <= sunday;
        }

        if (dateFilter === 'month') {
          const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
          return eventDate >= now && eventDate <= in30Days;
        }

        return true;
      });
    }

    // Filter by Selected Country
    if (selectedCountry) {
      filtered = filtered.filter((e) => {
        const countryVal = ((e as any).country || (e as any).eventCountry || e.venue || '').toLowerCase();
        return countryVal.includes(selectedCountry.name.toLowerCase()) || countryVal.includes(selectedCountry.code.toLowerCase());
      });
    }

    return filtered;
  }, [events, minPrice, maxPrice, isPriceCustomized, dateFilter, selectedCountry]);

  // Active filter count for pill indicators
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (category !== 'All') count++;
    if (isPriceCustomized) count++;
    if (dateFilter !== 'all') count++;
    if (formatFilter !== 'All') count++;
    if (selectedCountry !== null) count++;
    if (debouncedSearch.trim()) count++;
    return count;
  }, [category, isPriceCustomized, dateFilter, formatFilter, selectedCountry, debouncedSearch]);

  // Readable button labels
  const dateLabel = useMemo(() => {
    const found = DATE_OPTIONS.find((d) => d.id === dateFilter);
    return found && found.id !== 'all' ? found.label : 'Date';
  }, [dateFilter]);

  const formatLabel = useMemo(() => {
    const found = FORMAT_OPTIONS.find((f) => f.id === formatFilter);
    return found && found.id !== 'All' ? found.label : 'Format';
  }, [formatFilter]);

  const priceLabel = useMemo(() => {
    if (!isPriceCustomized) return 'Price';
    if (minPrice === 0 && maxPrice === 0) return 'Free only';
    if (minPrice === 0) return `Up to ₦${maxPrice.toLocaleString()}`;
    return `₦${minPrice.toLocaleString()} – ₦${maxPrice.toLocaleString()}`;
  }, [isPriceCustomized, minPrice, maxPrice]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070709] text-zinc-900 dark:text-zinc-100 flex flex-col justify-between selection:bg-[#E31B23] selection:text-white antialiased transition-colors duration-300">
      <Navbar />

      {/* ========================================================================= */}
      {/* 1. TOP HEADER & SEARCH BAR                                                */}
      {/* ========================================================================= */}
      <header className="border-b border-zinc-200 dark:border-white/5 bg-white dark:bg-[#070709] pt-8 sm:pt-12 pb-4 sm:pb-5 px-4 sm:px-6 lg:px-8 transition-colors">
        <div className="max-w-7xl mx-auto space-y-4">
          
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-zinc-950 dark:text-white">
              Discover events
            </h1>

            {/* Region Trigger Button */}
            <button
              type="button"
              onClick={() => openModal('region')}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                selectedCountry
                  ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-950 dark:border-white font-semibold shadow-xs'
                  : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border-zinc-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] dark:text-zinc-200 dark:border-white/10'
              }`}
              title="Select Region"
            >
              <span>{selectedCountry ? selectedCountry.flag : '🌐'}</span>
              <span>{selectedCountry ? selectedCountry.name : 'All Regions'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
            </button>
          </div>

          {/* Search Input Bar */}
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-zinc-50 dark:bg-[#111217] border border-zinc-200 dark:border-white/10 focus-within:border-zinc-400 dark:focus-within:border-white/25 transition-all">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-400 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search events, artists, venues, or cities..."
              className="w-full bg-transparent text-sm sm:text-base text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 outline-none border-none ring-0 font-normal truncate"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="p-1 rounded-lg hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-400 hover:text-zinc-700 dark:hover:text-white transition-colors cursor-pointer shrink-0"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Pill Strip */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
            {CATEGORIES.map((cat) => {
              const isActive = category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer shrink-0 border ${
                    isActive
                      ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-950 dark:border-white font-semibold shadow-xs'
                      : 'bg-zinc-100 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200 border-zinc-200 dark:bg-white/[0.03] dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/[0.08] dark:border-white/10'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. UNIFIED FILTER BUTTONS STRIP (Triggers Bottom Sheet Modals)             */}
      {/* ========================================================================= */}
      <section className="border-b border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-[#090A0E] px-4 sm:px-6 lg:px-8 py-3 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          
          {/* Button Group: Price, Date, Format (opens modal from underneath) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none">
            
            {/* Price Button */}
            <button
              type="button"
              onClick={() => openModal('price')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors border cursor-pointer shrink-0 ${
                isPriceCustomized
                  ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-950 dark:border-white font-semibold shadow-xs'
                  : 'bg-white text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 border-zinc-200 dark:bg-white/[0.04] dark:text-zinc-300 dark:hover:text-white dark:hover:bg-white/[0.08] dark:border-white/10'
              }`}
            >
              <Coins className={`w-3.5 h-3.5 ${isPriceCustomized ? 'text-[#E31B23]' : 'text-zinc-400'}`} />
              <span>{priceLabel}</span>
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            </button>

            {/* Date Button */}
            <button
              type="button"
              onClick={() => openModal('date')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors border cursor-pointer shrink-0 ${
                dateFilter !== 'all'
                  ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-950 dark:border-white font-semibold shadow-xs'
                  : 'bg-white text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 border-zinc-200 dark:bg-white/[0.04] dark:text-zinc-300 dark:hover:text-white dark:hover:bg-white/[0.08] dark:border-white/10'
              }`}
            >
              <Calendar className={`w-3.5 h-3.5 ${dateFilter !== 'all' ? 'text-[#E31B23]' : 'text-zinc-400'}`} />
              <span>{dateLabel}</span>
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            </button>

            {/* Format Button */}
            <button
              type="button"
              onClick={() => openModal('format')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors border cursor-pointer shrink-0 ${
                formatFilter !== 'All'
                  ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-950 dark:border-white font-semibold shadow-xs'
                  : 'bg-white text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 border-zinc-200 dark:bg-white/[0.04] dark:text-zinc-300 dark:hover:text-white dark:hover:bg-white/[0.08] dark:border-white/10'
              }`}
            >
              <SlidersHorizontal className={`w-3.5 h-3.5 ${formatFilter !== 'All' ? 'text-[#E31B23]' : 'text-zinc-400'}`} />
              <span>{formatLabel}</span>
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            </button>

            {/* Reset All Filters Button */}
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-2.5 py-1.5 rounded-full text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-[#E31B23] transition-colors cursor-pointer flex items-center gap-1 shrink-0"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset all</span>
              </button>
            )}

          </div>

          {/* Right: Results Count & View Mode Toggle */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono hidden sm:inline-block">
              {isLoading ? (
                <span className="inline-flex items-center gap-1.5">
                  <Loader2 className="w-3 h-3 animate-spin text-[#E31B23]" /> Loading...
                </span>
              ) : (
                `${displayEvents.length} ${displayEvents.length === 1 ? 'event' : 'events'}`
              )}
            </span>

            <div className="flex items-center gap-1 bg-white dark:bg-white/[0.04] p-1 rounded-xl border border-zinc-200 dark:border-white/10">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'list' ? 'bg-zinc-900 text-white dark:bg-white/15 dark:text-white' : 'text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
                title="List view"
                aria-label="List view"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-zinc-900 text-white dark:bg-white/15 dark:text-white' : 'text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
                title="Grid view"
                aria-label="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. MODAL FROM UNDERNEATH (Bottom Sheet with Minimum/Maximum Amount)        */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end">
            
            {/* Backdrop Scrim */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
              onClick={() => setActiveModal(null)}
            />

            {/* Modal Bottom Sheet Container */}
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 280 }}
              className="relative w-full max-w-lg mx-auto bg-white dark:bg-[#111217] border-t border-zinc-200 dark:border-white/15 rounded-t-3xl shadow-2xl p-6 sm:p-7 space-y-6 z-10 text-left"
            >
              
              {/* Grab handle & Header */}
              <div className="space-y-3">
                <div className="w-10 h-1 bg-zinc-300 dark:bg-white/20 rounded-full mx-auto" />
                <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-white/10">
                  <h2 className="text-base sm:text-lg font-bold text-zinc-950 dark:text-white flex items-center gap-2">
                    {activeModal === 'price' && (
                      <>
                        <Coins className="w-4 h-4 text-[#E31B23]" />
                        <span>Price Range</span>
                      </>
                    )}
                    {activeModal === 'date' && (
                      <>
                        <Calendar className="w-4 h-4 text-[#E31B23]" />
                        <span>Date</span>
                      </>
                    )}
                    {activeModal === 'format' && (
                      <>
                        <SlidersHorizontal className="w-4 h-4 text-[#E31B23]" />
                        <span>Format</span>
                      </>
                    )}
                    {activeModal === 'region' && (
                      <>
                        <Globe className="w-4 h-4 text-[#E31B23]" />
                        <span>Select Region</span>
                      </>
                    )}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="p-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-white/5 dark:hover:bg-white/10 text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* MODAL 1: PRICE (Minimum amount & Maximum amount inputs + quick sliders) */}
              {activeModal === 'price' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Minimum amount */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block">
                        Minimum amount (NGN)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-zinc-500 dark:text-zinc-400">₦</span>
                        <input
                          type="number"
                          min="0"
                          max={tempMaxPrice}
                          step="500"
                          value={tempMinPrice}
                          onChange={(e) => setTempMinPrice(Math.max(0, Number(e.target.value)))}
                          className="w-full bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/15 focus:border-zinc-400 dark:focus:border-white/30 rounded-xl pl-7 pr-3 py-2.5 text-sm font-mono text-zinc-900 dark:text-white outline-none"
                        />
                      </div>
                    </div>

                    {/* Maximum amount */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block">
                        Maximum amount (NGN)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-zinc-500 dark:text-zinc-400">₦</span>
                        <input
                          type="number"
                          min={tempMinPrice}
                          max="500000"
                          step="1000"
                          value={tempMaxPrice}
                          onChange={(e) => setTempMaxPrice(Math.max(tempMinPrice, Number(e.target.value)))}
                          className="w-full bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/15 focus:border-zinc-400 dark:focus:border-white/30 rounded-xl pl-7 pr-3 py-2.5 text-sm font-mono text-zinc-900 dark:text-white outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Dual Range Sliders */}
                  <div className="space-y-2 pt-2">
                    <input
                      type="range"
                      min="0"
                      max="100000"
                      step="1000"
                      value={tempMaxPrice}
                      onChange={(e) => setTempMaxPrice(Number(e.target.value))}
                      aria-label="Maximum price slider"
                      className="w-full accent-[#E31B23] h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                      <span>₦0</span>
                      <span>₦50,000</span>
                      <span>₦100,000+</span>
                    </div>
                  </div>

                  {/* Quick Presets */}
                  <div className="space-y-2 pt-1">
                    <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                      Quick Presets
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => { setTempMinPrice(0); setTempMaxPrice(0); }}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200 dark:bg-white/[0.04] dark:hover:bg-white/10 dark:text-zinc-300 dark:border-white/10 cursor-pointer"
                      >
                        Free RSVP
                      </button>
                      <button
                        type="button"
                        onClick={() => { setTempMinPrice(0); setTempMaxPrice(10000); }}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200 dark:bg-white/[0.04] dark:hover:bg-white/10 dark:text-zinc-300 dark:border-white/10 cursor-pointer"
                      >
                        Under ₦10,000
                      </button>
                      <button
                        type="button"
                        onClick={() => { setTempMinPrice(10000); setTempMaxPrice(30000); }}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200 dark:bg-white/[0.04] dark:hover:bg-white/10 dark:text-zinc-300 dark:border-white/10 cursor-pointer"
                      >
                        ₦10k – ₦30k
                      </button>
                    </div>
                  </div>

                  {/* Footer Actions: Clear & Apply */}
                  <div className="pt-4 border-t border-zinc-200 dark:border-white/10 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={clearPriceModal}
                      className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={applyPriceModal}
                      className="px-7 py-2.5 rounded-xl bg-[#E31B23] hover:bg-[#C9141B] text-white text-xs sm:text-sm font-bold transition-all shadow-lg shadow-[#E31B23]/30 cursor-pointer active:scale-95"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}

              {/* MODAL 2: DATE */}
              {activeModal === 'date' && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    {DATE_OPTIONS.map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setTempDateFilter(d.id as any)}
                        className={`w-full text-left px-4 py-3 rounded-2xl text-xs sm:text-sm font-medium transition-colors cursor-pointer flex items-center justify-between border ${
                          tempDateFilter === d.id
                            ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-950 dark:border-white font-semibold shadow-xs'
                            : 'bg-zinc-50 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 border-zinc-200 dark:bg-white/[0.03] dark:text-zinc-300 dark:hover:text-white dark:hover:bg-white/[0.06] dark:border-white/10'
                        }`}
                      >
                        <span>{d.label}</span>
                        {tempDateFilter === d.id && <span className="w-2 h-2 rounded-full bg-[#E31B23]" />}
                      </button>
                    ))}
                  </div>

                  {/* Footer Actions: Clear & Apply */}
                  <div className="pt-4 border-t border-zinc-200 dark:border-white/10 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={clearDateModal}
                      className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={applyDateModal}
                      className="px-7 py-2.5 rounded-xl bg-[#E31B23] hover:bg-[#C9141B] text-white text-xs sm:text-sm font-bold transition-all shadow-lg shadow-[#E31B23]/30 cursor-pointer active:scale-95"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}

              {/* MODAL 3: FORMAT */}
              {activeModal === 'format' && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    {FORMAT_OPTIONS.map((fmt) => (
                      <button
                        key={fmt.id}
                        type="button"
                        onClick={() => setTempFormatFilter(fmt.id as any)}
                        className={`w-full text-left px-4 py-3 rounded-2xl text-xs sm:text-sm font-medium transition-colors cursor-pointer flex items-center justify-between border ${
                          tempFormatFilter === fmt.id
                            ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-950 dark:border-white font-semibold shadow-xs'
                            : 'bg-zinc-50 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 border-zinc-200 dark:bg-white/[0.03] dark:text-zinc-300 dark:hover:text-white dark:hover:bg-white/[0.06] dark:border-white/10'
                        }`}
                      >
                        <span>{fmt.label}</span>
                        {tempFormatFilter === fmt.id && <span className="w-2 h-2 rounded-full bg-[#E31B23]" />}
                      </button>
                    ))}
                  </div>

                  {/* Footer Actions: Clear & Apply */}
                  <div className="pt-4 border-t border-zinc-200 dark:border-white/10 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={clearFormatModal}
                      className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={applyFormatModal}
                      className="px-7 py-2.5 rounded-xl bg-[#E31B23] hover:bg-[#C9141B] text-white text-xs sm:text-sm font-bold transition-all shadow-lg shadow-[#E31B23]/30 cursor-pointer active:scale-95"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}

              {/* MODAL 4: REGION */}
              {activeModal === 'region' && (
                <div className="space-y-4 max-h-72 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => handleSelectCountry(null)}
                    className={`w-full text-left px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-medium transition-colors cursor-pointer flex items-center justify-between border ${
                      !selectedCountry
                        ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-950 dark:border-white font-semibold shadow-xs'
                        : 'bg-zinc-50 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 border-zinc-200 dark:bg-white/[0.03] dark:text-zinc-300 dark:hover:text-white dark:hover:bg-white/[0.06] dark:border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span>🌐</span>
                      <span>All Regions & Global</span>
                    </div>
                    {!selectedCountry && <span className="w-2 h-2 rounded-full bg-[#E31B23]" />}
                  </button>

                  {countries.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => handleSelectCountry(c)}
                      className={`w-full text-left px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-medium transition-colors cursor-pointer flex items-center justify-between border ${
                        selectedCountry?.code === c.code
                          ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-950 dark:border-white font-semibold shadow-xs'
                          : 'bg-zinc-50 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 border-zinc-200 dark:bg-white/[0.03] dark:text-zinc-300 dark:hover:text-white dark:hover:bg-white/[0.06] dark:border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span>{c.flag || '🌐'}</span>
                        <span className="truncate">{c.name}</span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400">{c.code}</span>
                    </button>
                  ))}
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 4. EVENT RESULTS CONTENT AREA                                             */}
      {/* ========================================================================= */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8" ref={resultsRef}>
        
        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-[#E31B23] mx-auto" />
            <p className="text-sm font-medium text-zinc-900 dark:text-white">{error}</p>
            <button
              type="button"
              onClick={() => fetchEvents(paginationMeta.current_page)}
              className="px-4 py-2 bg-[#E31B23] text-white text-xs font-semibold rounded-xl cursor-pointer hover:bg-[#C9141B]"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-white/[0.02] rounded-3xl p-4 border border-zinc-200 dark:border-white/10 animate-pulse space-y-4">
                <div className="h-48 bg-zinc-100 dark:bg-white/[0.04] rounded-2xl w-full" />
                <div className="space-y-2 px-1">
                  <div className="h-4 bg-zinc-100 dark:bg-white/[0.04] rounded-md w-3/4" />
                  <div className="h-3 bg-zinc-100 dark:bg-white/[0.04] rounded-md w-1/2" />
                </div>
                <div className="pt-3 border-t border-zinc-100 dark:border-white/5 flex justify-between items-center px-1">
                  <div className="h-3 bg-zinc-100 dark:bg-white/[0.04] rounded-md w-1/4" />
                  <div className="h-6 bg-zinc-100 dark:bg-white/[0.04] rounded-lg w-16" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && displayEvents.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="relative rounded-3xl p-8 sm:p-14 text-center max-w-lg mx-auto overflow-hidden bg-transparent"
          >
            {/* Background Ambient Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-[#E31B23]/10 blur-[100px] rounded-full pointer-events-none" />

            {/* Curated SVG Vector Art Illustration */}
            <div className="relative mb-6 flex justify-center">
              <motion.div
                animate={{ 
                  y: [0, -6, 0],
                  rotate: [0, 1.5, 0, -1.5, 0]
                }}
                transition={{ 
                  duration: 4.5, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="relative"
              >
                {/* Custom Crisp Vector Art */}
                <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-gradient-to-b from-white/[0.06] via-white/[0.02] to-transparent p-2 flex items-center justify-center shadow-2xl relative">
                  <svg 
                    viewBox="0 0 160 160" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="w-full h-full drop-shadow-md"
                  >
                    {/* Concentric Radar / Wave Rings */}
                    <circle cx="80" cy="80" r="68" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" strokeDasharray="3 3" />
                    <circle cx="80" cy="80" r="52" stroke="rgba(227,27,35,0.2)" strokeWidth="1.5" />
                    <circle cx="80" cy="80" r="36" fill="rgba(255,255,255,0.03)" />
                    
                    {/* Floating Ticket Stub Silhouette */}
                    <g transform="translate(42, 46)">
                      {/* Ticket Base Body */}
                      <rect x="0" y="0" width="76" height="52" rx="10" fill="#121319" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
                      
                      {/* Left & Right Perforated Notches */}
                      <path d="M 0 20 A 6 6 0 0 1 0 32 Z" fill="#070709" />
                      <path d="M 76 20 A 6 6 0 0 0 76 32 Z" fill="#070709" />
                      
                      {/* Dashed Separator Line */}
                      <line x1="26" y1="6" x2="26" y2="46" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeDasharray="3 3" />
                      
                      {/* Brand Accent Bar on Stub */}
                      <rect x="8" y="14" width="10" height="24" rx="2" fill="#E31B23" opacity="0.85" />
                      
                      {/* Ticket Text Lines */}
                      <line x1="34" y1="18" x2="64" y2="18" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" strokeLinecap="round" />
                      <line x1="34" y1="26" x2="56" y2="26" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeLinecap="round" />
                      <line x1="34" y1="34" x2="48" y2="34" stroke="rgba(227,27,35,0.6)" strokeWidth="2" strokeLinecap="round" />
                    </g>

                    {/* Prominent Floating Magnifying Glass Finder */}
                    <g transform="translate(86, 86)">
                      <circle cx="16" cy="16" r="14" fill="#0E0F14" stroke="#E31B23" strokeWidth="2.5" />
                      <circle cx="16" cy="16" r="9" fill="rgba(227,27,35,0.12)" />
                      {/* Glass Glare Highlight */}
                      <path d="M 10 12 A 7 7 0 0 1 18 10" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
                      {/* Handle */}
                      <path d="M 27 27 L 36 36" stroke="#E31B23" strokeWidth="3" strokeLinecap="round" />
                    </g>
                  </svg>
                </div>

                {/* Micro floating sparkle badge */}
                <span className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-[#E31B23] text-white flex items-center justify-center shadow-lg shadow-[#E31B23]/40 border border-white/20">
                  <Sparkles className="w-3.5 h-3.5" />
                </span>
              </motion.div>
            </div>

            <div className="space-y-2 relative z-10">
              <h3 className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-white tracking-tight">
                No events found
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
                We couldn&apos;t find any events matching your selected filters. Try broadening your dates or clearing your search.
              </p>
            </div>

            <div className="pt-6 relative z-10 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-6 py-2.5 bg-[#E31B23] hover:bg-[#C9141B] text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-lg shadow-[#E31B23]/25 cursor-pointer active:scale-95 flex items-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset all filters</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* Event Results Grid / List */}
        {!isLoading && !error && displayEvents.length > 0 && (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="space-y-4 max-w-4xl mx-auto">
              {displayEvents.map((event) => (
                <EventCard key={event.id} event={event} variant="horizontal" />
              ))}
            </div>
          )
        )}

        {/* Pagination Controls */}
        {!isLoading && paginationMeta.last_page > 1 && (
          <div className="pt-8 border-t border-zinc-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
              Page {paginationMeta.current_page} of {paginationMeta.last_page}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handlePageChange(paginationMeta.current_page - 1)}
                disabled={paginationMeta.current_page <= 1 || isLoading}
                className="px-3.5 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-900 dark:bg-white/[0.05] dark:hover:bg-white/10 dark:border-white/10 dark:text-white"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: paginationMeta.last_page }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      pageNum === paginationMeta.current_page
                        ? 'bg-[#E31B23] text-white font-semibold'
                        : 'bg-white text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 border border-zinc-200 dark:bg-white/[0.03] dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/[0.08] dark:border-white/10'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => handlePageChange(paginationMeta.current_page + 1)}
                disabled={paginationMeta.current_page >= paginationMeta.last_page || isLoading}
                className="px-3.5 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-900 dark:bg-white/[0.05] dark:hover:bg-white/10 dark:border-white/10 dark:text-white"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
};

export default Discover;
