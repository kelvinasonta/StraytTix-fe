import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import EventCard from '../components/ui/EventCard';
import { eventApi, normalizeBackendEvent } from '../api/events';
import { getApiErrorMessage } from '../api/client';
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
  AlertCircle
} from 'lucide-react';

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

  const resultsRef = useRef<HTMLDivElement>(null);

  const categories = [
    'All',
    'Technology',
    'Music',
    'Conference',
    'Business',
    'Comedy',
    'Design',
    'Sports',
    'Nightlife',
    'Food & Drink'
  ];

  const priceOptions = [
    { value: 'All', label: 'All Prices' },
    { value: 'free', label: 'Free RSVP' },
    { value: 'under10k', label: 'Under ₦10,000' },
    { value: '10k-30k', label: '₦10,000 – ₦30,000' },
    { value: 'over30k', label: '₦30,000+' }
  ];

  // Debounce search input by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const isFirstMount = useRef(true);

  // Primary API fetcher connecting directly to backend /explore/events
  const fetchEvents = useCallback(async (targetPage: number, currentSearch = debouncedSearch, currentCat = category, currentFormat = formatFilter) => {
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
  const displayEvents = priceRange === 'All'
    ? events
    : events.filter((e) => {
        if (!e.tickets || e.tickets.length === 0) return priceRange === 'free';
        const prices = e.tickets.map((t) => t.price);
        const minPrice = Math.min(...prices);
        if (priceRange === 'free') return minPrice === 0;
        if (priceRange === 'under10k') return minPrice < 10000;
        if (priceRange === '10k-30k') return minPrice >= 10000 && minPrice <= 30000;
        if (priceRange === 'over30k') return minPrice > 30000;
        return true;
      });

  return (
    <div className="min-h-screen bg-[#F8F9FB] text-[#111827] flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 md:py-12 space-y-8" ref={resultsRef}>
        {/* Marketplace Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-zinc-950 tracking-tight">
              Discover Events
            </h1>
            <p className="text-zinc-500 text-sm sm:text-base font-medium mt-1">
              Explore live experiences, conferences, festivals, and summits.
            </p>
          </div>

          {/* Search bar inside header */}
          <div className="relative w-full md:w-96">
            <Search className="w-5 h-5 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, venue, or category..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-zinc-200 rounded-2xl text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-[#E31B23] focus:ring-1 focus:ring-[#E31B23] transition-all font-medium shadow-xs"
            />
          </div>
        </div>

        {/* Mobile Filter Toggle */}
        <div className="md:hidden flex items-center justify-between gap-3">
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-zinc-200 text-sm font-bold text-zinc-800 shadow-xs cursor-pointer"
          >
            <Filter className="w-4 h-4 text-[#E31B23]" />
            <span>Filters ({category !== 'All' ? '1+' : '0'})</span>
          </button>

          <span className="text-sm font-bold text-zinc-700">
            {paginationMeta.total} {paginationMeta.total === 1 ? 'event' : 'events'} found
          </span>
        </div>

        {/* Marketplace Main Grid: Left Sidebar Filters + Right Results */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* ========================================================================= */}
          {/* LEFT FILTERS SIDEBAR (Desktop) */}
          {/* ========================================================================= */}
          <aside className={`md:block md:col-span-3 bg-white p-6 rounded-3xl border border-[#E5E7EB] shadow-xs space-y-6 sticky top-24 ${mobileFilterOpen ? 'block' : 'hidden'}`}>
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
              <span className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#E31B23]" />
                Filters
              </span>
              <button
                onClick={handleResetFilters}
                className="text-xs font-bold text-zinc-400 hover:text-[#E31B23] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            </div>

            {/* Category Filter */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-zinc-900 uppercase tracking-wider block">
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      category === cat
                        ? 'bg-[#E31B23] text-white shadow-xs'
                        : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border border-zinc-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-zinc-900 uppercase tracking-wider block">
                Price
              </label>
              <div className="space-y-1.5">
                {priceOptions.map((opt) => (
                  <label
                    key={opt.value}
                    className="flex items-center gap-2.5 text-sm font-medium text-zinc-700 hover:text-zinc-950 cursor-pointer py-1"
                  >
                    <input
                      type="radio"
                      name="price"
                      checked={priceRange === opt.value}
                      onChange={() => setPriceRange(opt.value)}
                      className="accent-[#E31B23] w-4 h-4"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Format Filter (In-Person / Virtual) */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-zinc-900 uppercase tracking-wider block">
                Event Format
              </label>
              <div className="grid grid-cols-3 gap-1.5 bg-zinc-100 p-1.5 rounded-2xl">
                {(['All', 'physical', 'virtual'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setFormatFilter(fmt)}
                    className={`py-2 text-xs font-bold rounded-xl capitalize transition-all cursor-pointer ${
                      formatFilter === fmt
                        ? 'bg-white text-zinc-950 shadow-xs'
                        : 'text-zinc-500 hover:text-zinc-900'
                    }`}
                  >
                    {fmt === 'physical' ? 'In-Person' : fmt === 'virtual' ? 'Virtual' : 'All'}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* ========================================================================= */}
          {/* RIGHT EVENT RESULTS AREA */}
          {/* ========================================================================= */}
          <section className="md:col-span-9 space-y-6">
            {/* Top Toolbar (Count + View Mode Switcher) */}
            <div className="flex items-center justify-between bg-white px-6 py-3.5 rounded-2xl border border-[#E5E7EB] shadow-xs">
              <p className="text-sm font-bold text-zinc-800">
                {isLoading ? (
                  <span className="flex items-center gap-2 text-zinc-500">
                    <Loader2 className="w-4 h-4 animate-spin text-[#E31B23]" /> Loading events...
                  </span>
                ) : (
                  <>
                    Showing <span className="text-[#E31B23]">{paginationMeta.from || (displayEvents.length > 0 ? 1 : 0)}</span>–<span className="text-[#E31B23]">{paginationMeta.to || displayEvents.length}</span> of{' '}
                    <span className="text-zinc-950">{paginationMeta.total}</span> events
                  </>
                )}
              </p>

              <div className="flex items-center gap-1.5 bg-zinc-100 p-1 rounded-xl">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'grid' ? 'bg-white text-zinc-950 shadow-xs' : 'text-zinc-400 hover:text-zinc-700'
                  }`}
                  title="Grid view"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'list' ? 'bg-white text-zinc-950 shadow-xs' : 'text-zinc-400 hover:text-zinc-700'
                  }`}
                  title="List view"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-[#E31B23] mx-auto" />
                <p className="text-sm font-bold text-zinc-900">{error}</p>
                <button
                  onClick={() => fetchEvents(paginationMeta.current_page)}
                  className="px-4 py-2 bg-[#E31B23] text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-[#B91C1C]"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Loading Skeletons */}
            {isLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-3xl p-4 border border-zinc-200 animate-pulse space-y-4 shadow-xs">
                    <div className="h-48 bg-zinc-100 rounded-2xl w-full" />
                    <div className="space-y-2 px-1">
                      <div className="h-5 bg-zinc-100 rounded-md w-3/4" />
                      <div className="h-4 bg-zinc-100 rounded-md w-1/2" />
                    </div>
                    <div className="pt-3 border-t border-zinc-100 flex justify-between items-center px-1">
                      <div className="h-4 bg-zinc-100 rounded-md w-1/4" />
                      <div className="h-8 bg-zinc-100 rounded-xl w-24" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && displayEvents.length === 0 && (
              <div className="bg-white rounded-3xl border border-[#E5E7EB] p-16 text-center space-y-4 shadow-xs">
                <div className="w-14 h-14 rounded-2xl bg-[#FEF2F2] text-[#E31B23] flex items-center justify-center mx-auto">
                  <Calendar className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-black text-zinc-900">No events found</h3>
                <p className="text-sm text-zinc-500 max-w-sm mx-auto leading-relaxed">
                  No upcoming events match your selected filters. Try clearing some filters or searching for a different keyword.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-3 bg-[#E31B23] text-white text-sm font-bold rounded-xl hover:bg-[#B91C1C] transition-all shadow-xs cursor-pointer"
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
            {/* PAGINATION CONTROLS BAR */}
            {/* ========================================================================= */}
            {!isLoading && paginationMeta.last_page > 1 && (
              <div className="bg-white rounded-2xl border border-zinc-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
                <div className="text-xs text-zinc-500 font-medium">
                  Page <span className="font-bold text-zinc-900">{paginationMeta.current_page}</span> of{' '}
                  <span className="font-bold text-zinc-900">{paginationMeta.last_page}</span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Previous Button */}
                  <button
                    onClick={() => handlePageChange(paginationMeta.current_page - 1)}
                    disabled={paginationMeta.current_page <= 1 || isLoading}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50"
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
                            ? 'bg-[#E31B23] text-white shadow-xs scale-105'
                            : 'bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-200'
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
                    className="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50"
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
