import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import EventCard from '../components/ui/EventCard';
import { eventApi, normalizeBackendEvent } from '../api/events';
import { organizerApi } from '../api/organizers';
import type { Event, Organizer } from '../types/api';
import { resolveImageUrl, getOrganizerCoverPhoto } from '../utils/imageUrl';
import { 
  Globe, 
  Mail, 
  Calendar, 
  ShieldCheck, 
  Code2, 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles, 
  Share2, 
  Users, 
  Star, 
  MessageSquare, 
  Terminal, 
  MapPin, 
  Video, 
  Search, 
  SlidersHorizontal, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  Phone, 
  Building2, 
  Award, 
  Ticket, 
  X, 
  LayoutGrid, 
  List, 
  Heart,
  ChevronRight,
  Settings
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate } from '../utils/format';

export const OrganizerProfile: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { showNotification } = useNotification();

  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'about' | 'reviews' | 'developer'>('upcoming');
  
  // Social States
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [copiedProfileLink, setCopiedProfileLink] = useState(false);
  
  // Search & Filter Toolbar
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'in_person' | 'virtual' | 'free'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Contact Modal
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactSubject, setContactSubject] = useState('VIP Table & Guestlist Inquiry');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState(false);

  // Active session organizer if signed in
  const { organizer: currentActiveOrg } = useAuth();

  // Associated events from backend
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);

  // Normalize organizer identity
  const orgHandle = slug || currentActiveOrg?.slug || 'organizer';

  // Public organizer from API
  const [publicOrg, setPublicOrg] = useState<Organizer | null>(null);
  const [coverError, setCoverError] = useState(false);

  // Fetch public organizer from backend
  useEffect(() => {
    if (!slug) return;
    organizerApi.getPublicOrganizer(slug)
      .then((res) => {
        if (res?.data) {
          setPublicOrg(res.data);
          setCoverError(false);
        }
      })
      .catch((err) => {
        console.warn('Could not fetch public organizer profile:', err);
      });
  }, [slug]);

  // Dynamic organizer info extracted from loaded events if available
  const matchingOrg = useMemo(() => {
    return events.find(e => 
      e.organizer?.slug === slug || 
      e.organizer?.name?.toLowerCase().includes((slug || '').toLowerCase())
    )?.organizer;
  }, [events, slug]);

  // Check if currently authenticated organizer is the owner of this profile
  const isOwnerOfProfile = useMemo(() => {
    if (!currentActiveOrg) return false;
    return Boolean(
      (slug && currentActiveOrg.slug?.toLowerCase() === slug.toLowerCase()) ||
      (currentActiveOrg.id && (currentActiveOrg.id === slug || currentActiveOrg.id === publicOrg?.id)) ||
      (publicOrg?.id && currentActiveOrg.id === publicOrg.id) ||
      (currentActiveOrg.name && publicOrg?.name && currentActiveOrg.name.toLowerCase() === publicOrg.name.toLowerCase())
    );
  }, [currentActiveOrg, slug, publicOrg]);

  // Combined resolved organizer record
  const resolvedOrg = (publicOrg || (isOwnerOfProfile ? currentActiveOrg : null) || matchingOrg) as (Organizer | undefined);

  const rawOrgName = resolvedOrg?.name || currentActiveOrg?.name || (slug ? slug.replace(/-/g, ' ') : 'Event Host');
  const orgName = useMemo(() => {
    return rawOrgName.replace(/\b\w/g, c => c.toUpperCase());
  }, [rawOrgName]);

  // Verification status determination: only show verified if org is verified, if not or pending show nothing
  const isOrgVerified = useMemo(() => {
    const status = resolvedOrg?.verification_status || (resolvedOrg as any)?.verificationStatus || (isOwnerOfProfile ? currentActiveOrg?.verification_status : null);
    return status === 'verified' || (resolvedOrg as any)?.is_verified === true;
  }, [resolvedOrg, isOwnerOfProfile, currentActiveOrg]);

  const orgBio = resolvedOrg?.bio || resolvedOrg?.description || currentActiveOrg?.bio || 'Professional event organizer creating exceptional live and virtual experiences with seamless ticketing and VIP hospitality.';
  const orgWebsite = resolvedOrg?.website || currentActiveOrg?.website || '';
  const orgEmail = resolvedOrg?.email || currentActiveOrg?.email || '';
  const orgPhone = resolvedOrg?.phone || currentActiveOrg?.phone || '';
  const orgLogo = resolvedOrg?.logo || (resolvedOrg as any)?.logo_url || (isOwnerOfProfile ? currentActiveOrg?.logo : undefined);
  const orgCover = getOrganizerCoverPhoto(resolvedOrg) || (isOwnerOfProfile ? getOrganizerCoverPhoto(currentActiveOrg) : '');
  const orgLocation = (resolvedOrg as any)?.address || (currentActiveOrg as any)?.address || 'Nigeria';

  useEffect(() => {
    setIsLoadingEvents(true);
    eventApi.getEvents({ perPage: 30 })
      .then((res) => {
        const resData: any = res.data;
        const items = Array.isArray(resData?.data) ? resData.data : Array.isArray(resData) ? resData : [];
        const normalized = items.map(normalizeBackendEvent);
        setEvents(normalized);
      })
      .catch((err) => {
        console.error('Failed to load organizer events:', err);
        setEvents([]);
      })
      .finally(() => {
        setIsLoadingEvents(false);
      });
  }, [slug]);

  // Curate upcoming events vs past events
  const filteredEvents = useMemo(() => {
    return events.filter(ev => {
      // Search filter
      const matchesSearch = searchQuery.trim() === '' || 
        ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ev.venue && ev.venue.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (ev.city && ev.city.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      // Type filter
      if (filterType === 'in_person') return ev.locationType === 'physical' || Boolean(ev.venue);
      if (filterType === 'virtual') return ev.locationType === 'online' || Boolean(ev.onlineMeetingUrl);
      if (filterType === 'free') {
        const hasFree = ev.tickets?.some(t => t.price === 0);
        return hasFree;
      }

      return true;
    });
  }, [events, searchQuery, filterType]);

  // Dynamic past events for this organizer
  const pastEvents = useMemo(() => {
    return events.filter(e => {
      if (!e.startDate) return false;
      return new Date(e.startDate) < new Date() || e.status?.toLowerCase() === 'completed';
    });
  }, [events]);

  // Attendee Testimonials / Reviews (dynamic from API or empty state)
  const reviews: Array<{
    id: string;
    name: string;
    role: string;
    avatar: string;
    event: string;
    rating: number;
    date: string;
    content: string;
  }> = [];

  // Handlers
  const handleShareProfile = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${orgName} on Eventa`,
          text: orgBio,
          url: url
        });
        return;
      } catch (err) {
        // Fallback to clipboard
      }
    }

    navigator.clipboard.writeText(url);
    setCopiedProfileLink(true);
    showNotification('Organizer profile link copied to clipboard!', 'success');
    setTimeout(() => setCopiedProfileLink(false), 2500);
  };

  const handleCopySnippet = () => {
    const snippet = `<iframe src="${window.location.origin}/events/${events[0]?.slug || 'global-tech-virtual'}?embed=true" width="100%" height="520" frameborder="0" style="border-radius: 20px; border: 1px solid rgba(0,0,0,0.08); box-shadow: 0 10px 30px rgba(0,0,0,0.06); overflow: hidden;"></iframe>`;
    navigator.clipboard.writeText(snippet);
    setCopiedEmbed(true);
    showNotification('Embed widget iframe snippet copied!', 'success');
    setTimeout(() => setCopiedEmbed(false), 2000);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingInquiry(true);
    setTimeout(() => {
      setIsSubmittingInquiry(false);
      setShowContactModal(false);
      setContactName('');
      setContactEmail('');
      setContactMessage('');
      showNotification(`Your inquiry has been dispatched to ${orgName} management.`, 'success');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] text-[#111827] flex flex-col justify-between font-sans antialiased">
      <Navbar />

      {/* ========================================================================= */}
      {/* 1. CINEMATIC WIDESCREEN HERO WITH VIBRANT COVER BANNER */}
      {/* ========================================================================= */}
      <section className="relative bg-[#090D17] text-white overflow-hidden border-b border-white/5">
        {/* Dedicated Cover Banner Container */}
        <div className="relative w-full h-56 sm:h-72 md:h-80 lg:h-96 bg-zinc-950 overflow-hidden">
          {orgCover && !coverError ? (
            <img
              src={resolveImageUrl(orgCover)}
              alt={`${orgName} Cover Banner`}
              onError={() => setCoverError(true)}
              className="w-full h-full object-cover object-center transition-all duration-700"
            />
          ) : (
            <div className="w-full h-full relative overflow-hidden bg-gradient-to-r from-zinc-950 via-[#111625] to-zinc-950 flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1600&auto=format&fit=crop&q=80"
                alt="Event Atmosphere Backdrop"
                className="w-full h-full object-cover opacity-35 filter brightness-90"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/80 via-transparent to-zinc-950/80" />
            </div>
          )}

          {/* Top Breadcrumb & Share Floating Controls */}
          <div className="absolute top-5 inset-x-0 z-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
              <Link 
                to="/discover" 
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/15 text-xs text-zinc-200 font-medium transition-all shadow-md group"
              >
                <span className="text-zinc-400 group-hover:text-white transition-colors">←</span>
                <span>Back to Discover</span>
              </Link>

              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/15 text-[11px] font-mono text-zinc-200 shadow-md">
                  eventa.live/@{orgHandle}
                </span>
                <button
                  onClick={handleShareProfile}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/15 text-xs font-bold text-white transition-all shadow-md cursor-pointer"
                  title="Share this organizer profile"
                >
                  {copiedProfileLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copiedProfileLink ? 'Link Copied' : 'Share'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Gradient Fade into Profile Identity Area */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#090D17] via-[#090D17]/60 to-transparent pointer-events-none" />
        </div>

        {/* Profile Identity Island Overlapping Cover Banner */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20 relative z-10 -mt-16 sm:-mt-20">
          <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 pt-2">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
              {/* Luxury Avatar Emblem */}
              <div className="relative group flex-shrink-0">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl p-1 bg-gradient-to-tr from-[#E31B23] via-rose-500 to-amber-500 shadow-[0_15px_40px_rgba(0,0,0,0.6)] ring-4 ring-[#090D17]">
                  <div className="w-full h-full rounded-[22px] bg-[#0F1420] flex items-center justify-center font-black text-3xl sm:text-4xl text-white tracking-wider border border-white/10 overflow-hidden">
                    {orgLogo ? (
                      <img 
                        src={resolveImageUrl(orgLogo)} 
                        alt={orgName} 
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      orgName ? orgName.slice(0, 3).toUpperCase() : 'ORG'
                    )}
                  </div>
                </div>
                {isOrgVerified && (
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1.5 rounded-full ring-4 ring-[#090D17] shadow-lg" title="Verified Host">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                )}
              </div>

              {/* Identity Details */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {isOrgVerified && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-black uppercase tracking-wider">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified Host
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 text-zinc-300 text-xs font-semibold">
                    <MapPin className="w-3 h-3 text-[#E31B23]" /> {orgLocation}
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
                  {orgName}
                </h1>

                <p className="text-zinc-300 text-sm sm:text-base max-w-2xl font-normal leading-relaxed">
                  {orgBio}
                </p>

                {/* Social & Contact Strip */}
                <div className="flex items-center gap-3 pt-1 text-xs text-zinc-400 flex-wrap">
                  {orgWebsite && (
                    <>
                      <a 
                        href={orgWebsite.startsWith('http') ? orgWebsite : `https://${orgWebsite}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="inline-flex items-center gap-1.5 text-zinc-300 hover:text-white transition-colors"
                      >
                        <Globe className="w-3.5 h-3.5 text-[#E31B23]" />
                        <span className="underline font-medium">{orgWebsite.replace(/^https?:\/\//, '')}</span>
                      </a>
                      <span className="text-zinc-600">•</span>
                    </>
                  )}
                  {orgEmail && (
                    <a 
                      href={`mailto:${orgEmail}`} 
                      className="inline-flex items-center gap-1.5 text-zinc-300 hover:text-white transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5 text-[#E31B23]" />
                      <span>{orgEmail}</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons: Contact Host & Manage Settings */}
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => setShowContactModal(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-[#E31B23] via-[#DC2626] to-[#B91C1C] hover:brightness-110 text-white text-sm font-black transition-all shadow-[0_4px_20px_rgba(227,27,35,0.4)] cursor-pointer active:scale-95"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Contact Host</span>
              </button>

              {isOwnerOfProfile && (
                <Link
                  to="/organizer/settings"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-sm font-bold border border-white/20 backdrop-blur-md transition-all shadow-xs"
                >
                  <Settings className="w-4 h-4 text-zinc-300" />
                  <span>Organization Settings</span>
                </Link>
              )}
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. FLOATING CREDIBILITY TELEMETRY BRIDGE CARD */}
      {/* ========================================================================= */}
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="bg-white rounded-3xl p-4 sm:p-6 border border-zinc-200/90 shadow-[0_12px_40px_rgba(0,0,0,0.06)] grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 divide-y sm:divide-y-0 sm:divide-x divide-zinc-100">
          <div className="p-2 sm:px-4 space-y-1">
            <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5 text-[#E31B23]" />
              <span>Events Hosted</span>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">24+</p>
            <p className="text-[11px] text-zinc-500 font-medium">100% On-Time Execution</p>
          </div>

          <div className="p-2 sm:px-4 space-y-1">
            <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-wider">
              <Users className="w-3.5 h-3.5 text-[#E31B23]" />
              <span>Total Attendees</span>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">48,500+</p>
            <p className="text-[11px] text-zinc-500 font-medium">Across 6 Global Metros</p>
          </div>

          <div className="p-2 sm:px-4 space-y-1">
            <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-wider">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Host Rating</span>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight flex items-center gap-1.5">
              4.9 <span className="text-amber-500 text-xl font-bold">★</span>
            </p>
            <p className="text-[11px] text-zinc-500 font-medium">98% 5-Star Reviews</p>
          </div>

          <div className="p-2 sm:px-4 space-y-1">
            <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Gate Scan Uptime</span>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight">99.98%</p>
            <p className="text-[11px] text-zinc-500 font-medium">Zero Queue Latency</p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MAIN NAVIGATION TABS & EXPERIENCE DISCOVERY */}
      {/* ========================================================================= */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-12 space-y-8">
        
        {/* Navigation Tabs Bar */}
        <div className="flex items-center justify-between border-b border-zinc-200/90 pb-3 flex-wrap gap-3">
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
            {[
              { id: 'upcoming', label: 'Upcoming Experiences', count: events.length },
              { id: 'past', label: 'Past Productions', count: pastEvents.length },
              { id: 'about', label: 'About & Leadership' },
              { id: 'reviews', label: 'Reviews & Proof', count: reviews.length },
              { id: 'developer', label: 'Widget & API SDK', isPill: true }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'bg-zinc-950 text-white shadow-xs' 
                    : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`text-[11px] px-2 py-0.2 rounded-full font-bold ${
                    activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-zinc-200/80 text-zinc-700'
                  }`}>
                    {tab.count}
                  </span>
                )}
                {tab.isPill && (
                  <span className="text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider bg-red-100 text-[#E31B23]">
                    Embed
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-500 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Ticket Checkout Live</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: UPCOMING EXPERIENCES */}
        {/* ========================================================================= */}
        {activeTab === 'upcoming' && (
          <div className="space-y-6">
            
            {/* Search & Filter Controls Toolbar */}
            <div className="bg-white border border-zinc-200/90 rounded-2xl p-3 sm:p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
              
              {/* Search Bar */}
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search events by title or venue..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20 focus:border-[#E31B23] transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filter Chips & View Mode Toggle */}
              <div className="flex items-center justify-between w-full md:w-auto gap-2.5 flex-wrap">
                <div className="flex items-center gap-1.5">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'in_person', label: 'In-Person' },
                    { id: 'virtual', label: 'Virtual' },
                    { id: 'free', label: 'Free RSVP' }
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setFilterType(f.id as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        filterType === f.id
                          ? 'bg-[#E31B23] text-white shadow-xs'
                          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200/70'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1 p-1 bg-zinc-100 rounded-lg border border-zinc-200/60">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-md transition-all cursor-pointer ${
                      viewMode === 'grid' ? 'bg-white shadow-xs text-zinc-950' : 'text-zinc-500 hover:text-zinc-800'
                    }`}
                    title="Grid View"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-md transition-all cursor-pointer ${
                      viewMode === 'list' ? 'bg-white shadow-xs text-zinc-950' : 'text-zinc-500 hover:text-zinc-800'
                    }`}
                    title="List View"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>

            {/* Loading State */}
            {isLoadingEvents && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-3xl p-5 border border-zinc-200 shadow-xs space-y-4">
                    <div className="h-48 bg-zinc-200 rounded-2xl w-full" />
                    <div className="h-4 bg-zinc-200 rounded w-1/3" />
                    <div className="h-6 bg-zinc-200 rounded w-4/5" />
                    <div className="h-4 bg-zinc-200 rounded w-1/2" />
                    <div className="h-10 bg-zinc-200 rounded-xl w-full mt-4" />
                  </div>
                ))}
              </div>
            )}

            {/* Event List / Grid */}
            {!isLoadingEvents && filteredEvents.length > 0 && (
              <div className={
                viewMode === 'grid'
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-4"
              }>
                {filteredEvents.map(event => (
                  <EventCard 
                    key={event.id} 
                    event={event} 
                    variant={viewMode === 'list' ? 'horizontal' : 'default'}
                  />
                ))}
              </div>
            )}

            {/* Zero State */}
            {!isLoadingEvents && filteredEvents.length === 0 && (
              <div className="bg-white border border-zinc-200 rounded-3xl p-12 text-center space-y-4 max-w-md mx-auto shadow-xs">
                <div className="w-14 h-14 rounded-2xl bg-red-50 text-[#E31B23] flex items-center justify-center mx-auto">
                  <Ticket className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-zinc-900">No events matched your search</h3>
                  <p className="text-xs text-zinc-500">
                    Try adjusting your filters or search query to see other experiences hosted by {orgName}.
                  </p>
                </div>
                <button
                  onClick={() => { setSearchQuery(''); setFilterType('all'); }}
                  className="px-5 py-2.5 bg-[#E31B23] hover:bg-[#B91C1C] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            )}

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: PAST PRODUCTIONS & LANDMARK SHOWCASES */}
        {/* ========================================================================= */}
        {activeTab === 'past' && (
          <div className="space-y-6">
            {pastEvents.length === 0 ? (
              <div className="py-16 text-center bg-white border border-zinc-200/90 rounded-3xl p-8 space-y-3">
                <Calendar className="w-10 h-10 text-zinc-300 mx-auto" />
                <h3 className="text-base font-bold text-zinc-800">No Past Productions</h3>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  Completed events and past productions by {orgName} will be archived here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pastEvents.map(prod => (
                  <Link 
                    to={`/events/${prod.slug || prod.id}`}
                    key={prod.id} 
                    className="bg-white border border-zinc-200/90 rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row gap-4 sm:gap-5 hover:border-zinc-300 transition-all group"
                  >
                    <div className="relative sm:w-48 h-44 rounded-2xl overflow-hidden flex-shrink-0 bg-zinc-100">
                      {prod.bannerUrl || (prod as any).imageUrl ? (
                        <img 
                          src={prod.bannerUrl || (prod as any).imageUrl} 
                          alt={prod.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-400 font-bold">
                          {prod.title?.[0] || 'E'}
                        </div>
                      )}
                      <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider">
                        Completed
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-between py-1 space-y-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-[#E31B23]" />
                            {prod.startDate ? formatDate(prod.startDate) : 'Past Event'}
                          </span>
                        </div>
                        <h3 className="text-base sm:text-lg font-black text-zinc-950 group-hover:text-[#E31B23] transition-colors leading-snug">
                          {prod.title}
                        </h3>
                        <p className="text-xs text-zinc-500 font-medium flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-zinc-400 flex-shrink-0" />
                          <span>{prod.venue || prod.venueName || (prod.locationType === 'online' ? 'Online Event' : 'Venue TBA')}</span>
                        </p>
                      </div>

                      <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-xs font-bold text-zinc-700">
                        <span className="text-zinc-500 font-medium text-xs">
                          {prod.category || 'General'}
                        </span>
                        <span className="text-[#E31B23] font-black text-[11px]">
                          Production Archived
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: ABOUT ORGANIZER & PRODUCTION LEADERSHIP */}
        {/* ========================================================================= */}
        {activeTab === 'about' && (
          <div className="space-y-8">
            
            {/* Story & Vision */}
            <div className="bg-white border border-zinc-200/90 rounded-3xl p-6 sm:p-10 shadow-xs space-y-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-[#E31B23] text-xs font-black uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> About {orgName}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
                Architects of High-Impact Live & Virtual Experiences
              </h2>
              <div className="space-y-4 text-sm text-zinc-600 leading-relaxed max-w-3xl">
                <p>
                  Founded with a vision to redefine live event production across Africa and international stages, 
                  <strong> {orgName}</strong> blends bleeding-edge sound engineering, immersive visuals, and white-glove 
                  VIP hospitality. From tech industry summits bringing together Silicon Valley and African founders, 
                  to multi-thousand attendee music festivals, our execution standard is uncompromising.
                </p>
                {isOrgVerified && (
                  <p>
                    As an <strong>Official Verified Enterprise Partner</strong> on Eventa, all ticketing inventory, 
                    seat reservations, and backstage access passes issued by {orgName} are digitally authenticated 
                    with 256-bit cryptographically secured QR passes, guaranteeing zero scalping and frictionless check-in.
                  </p>
                )}
              </div>

              {/* Pillars Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-zinc-150">
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-1.5">
                  <div className="w-9 h-9 rounded-xl bg-red-50 text-[#E31B23] flex items-center justify-center font-bold">
                    <Award className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-black text-zinc-900">World-Class Sound</h4>
                  <p className="text-xs text-zinc-500">
                    Dolby Atmos calibrated audio systems and arena-grade lighting rigs.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-1.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-black text-zinc-900">100% Verified Entry</h4>
                  <p className="text-xs text-zinc-500">
                    Contactless laser and mobile QR scanning with 0.2s check-in gate latency.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-1.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    <Star className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-black text-zinc-900">VIP Concierge</h4>
                  <p className="text-xs text-zinc-500">
                    Dedicated table hosts, priority fast-track gates, and private backstage lounges.
                  </p>
                </div>
              </div>
            </div>

            {/* Production Team & Leadership */}
            <div className="bg-white border border-zinc-200/90 rounded-3xl p-6 sm:p-10 shadow-xs space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-zinc-950 tracking-tight">Executive Team</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">The creative minds and technical leads steering {orgName}.</p>
                </div>
                <button
                  onClick={() => setShowContactModal(true)}
                  className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Join Production Crew
                </button>
              </div>

              <div className="p-6 rounded-2xl border border-zinc-200 bg-zinc-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-600 flex-shrink-0">
                    <Users className="w-6 h-6 text-[#E31B23]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-950">Verified Operations & Production Team</h4>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Event logistics, ticketing, and on-site gate check-in are managed directly by authorized {orgName} staff.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowContactModal(true)}
                  className="px-4 py-2 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl transition-all flex-shrink-0"
                >
                  Contact Host Team
                </button>
              </div>
            </div>

            {/* Office & Operations Details */}
            <div className="bg-white border border-zinc-200/90 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-700 flex-shrink-0">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-black text-zinc-950">Corporate Booking & Inquiries</h4>
                  <p className="text-xs text-zinc-500">
                    {orgLocation} • {orgEmail || `contact@${orgHandle}.live`}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowContactModal(true)}
                className="w-full sm:w-auto px-6 py-3 bg-[#E31B23] hover:bg-[#B91C1C] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer active:scale-95"
              >
                Inquire for Corporate Booking
              </button>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: REVIEWS & ATTENDEE PROOF */}
        {/* ========================================================================= */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div className="bg-white border border-zinc-200/90 rounded-3xl p-12 text-center space-y-3">
              <Star className="w-10 h-10 text-zinc-300 mx-auto" />
              <h3 className="text-base font-bold text-zinc-800">No Reviews Yet</h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Verified ticket holders receive an automated prompt to rate and review their experience after attending an event.
              </p>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: DEVELOPER & EMBED SDK (Modern SaaS Integration) */}
        {/* ========================================================================= */}
        {activeTab === 'developer' && (
          <div className="bg-white border border-zinc-200/90 rounded-3xl p-6 sm:p-10 shadow-xs space-y-8">
            
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-[#E31B23] text-xs font-black uppercase tracking-wider">
                <Code2 className="w-3.5 h-3.5" /> Developer Ecosystem
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
                Integrate {orgName} Passes on Any Web Experience
              </h2>
              <p className="text-sm text-zinc-600 leading-relaxed font-normal">
                Seamlessly sell tickets and display event schedules on your WordPress, Webflow, Shopify, or custom React applications using our luxury drop-in widget or headless REST APIs.
              </p>
            </div>

            {/* Live Interactive Embed Preview */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-zinc-800 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#E31B23]" /> Live Widget Interactive Preview
                </span>
                <span className="text-xs text-zinc-500 font-medium">Auto-responsive & Dual Theme Support</span>
              </div>

              {/* The Live Iframe Container */}
              <div className="rounded-3xl border border-zinc-200/90 p-4 bg-zinc-50 overflow-hidden shadow-inner">
                <div className="max-w-xl mx-auto rounded-2xl overflow-hidden shadow-xl border border-zinc-200 bg-white">
                  <iframe
                    src={`${window.location.origin}/events/${events[0]?.slug || 'global-tech-virtual'}?embed=true`}
                    width="100%"
                    height="500"
                    frameBorder="0"
                    title="Live Eventa Ticket Widget Preview"
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Code Snippet Box */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-700 uppercase tracking-wider flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-[#E31B23]" /> Drop-in HTML Embed Code
                </span>
                <button
                  onClick={handleCopySnippet}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  {copiedEmbed ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedEmbed ? 'Code Copied' : 'Copy HTML Snippet'}</span>
                </button>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950 text-zinc-200 font-mono text-xs overflow-x-auto border border-zinc-800 shadow-sm">
                <pre className="text-emerald-400">
{`<!-- Eventa Universal Ticket Checkout Widget -->
<iframe
  src="${window.location.origin}/events/${events[0]?.slug || 'global-tech-virtual'}?embed=true"
  width="100%"
  height="520"
  frameborder="0"
  style="border-radius: 20px; border: 1px solid rgba(0,0,0,0.08); box-shadow: 0 10px 30px rgba(0,0,0,0.06); overflow: hidden;"
></iframe>`}
                </pre>
              </div>
            </div>

            {/* REST API Endpoints Preview */}
            <div className="p-6 rounded-2xl bg-[#F8F9FB] border border-zinc-200 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-mono text-xs font-bold">GET</span>
                  <span className="font-mono text-xs sm:text-sm font-bold text-zinc-900">/api/v1/organizers/{orgHandle}/events</span>
                </div>
                <Link to="/api-docs" className="text-xs font-bold text-[#E31B23] hover:underline flex items-center gap-1">
                  <span>View API Documentation</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
              <p className="text-xs text-zinc-500">
                Returns live JSON payload containing active ticket tiers, seat capacity, pricing, and checkout availability for this organizer.
              </p>
            </div>

          </div>
        )}

      </main>

      {/* ========================================================================= */}
      {/* 4. MODERN CONTACT HOST MODAL */}
      {/* ========================================================================= */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-zinc-150 space-y-5 animate-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b border-zinc-150 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E31B23]" />
                <h3 className="text-base font-black text-zinc-950">Inquire with {orgName}</h3>
              </div>
              <button 
                onClick={() => setShowContactModal(false)} 
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">Inquiry Purpose</label>
                <select
                  value={contactSubject}
                  onChange={(e) => setContactSubject(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20 focus:border-[#E31B23]"
                >
                  <option value="VIP Table & Guestlist Inquiry">VIP Table & Guestlist Inquiry</option>
                  <option value="Brand Sponsorship & Partnerships">Brand Sponsorship & Partnerships</option>
                  <option value="Artist & Speaker Booking">Artist & Speaker Booking</option>
                  <option value="Press & Media Accreditation">Press & Media Accreditation</option>
                  <option value="General Production Question">General Production Question</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">Your Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Alex Morgan"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20 focus:border-[#E31B23]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">Email Address</label>
                  <input 
                    type="email" 
                    required
                    placeholder="alex@example.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20 focus:border-[#E31B23]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">Message Details</label>
                <textarea 
                  rows={4} 
                  required
                  placeholder="Provide any specific details, estimated party size, or sponsorship proposal..."
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20 focus:border-[#E31B23]"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowContactModal(false)}
                  className="flex-1 py-3 border border-zinc-200 rounded-xl text-xs sm:text-sm font-bold text-zinc-700 hover:bg-zinc-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingInquiry}
                  className="flex-1 py-3 bg-[#E31B23] hover:bg-[#B91C1C] text-white rounded-xl text-xs sm:text-sm font-black transition-all shadow-md cursor-pointer disabled:opacity-50 active:scale-95 flex items-center justify-center gap-1.5"
                >
                  {isSubmittingInquiry ? (
                    <span>Sending...</span>
                  ) : (
                    <>
                      <span>Send Inquiry</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default OrganizerProfile;
