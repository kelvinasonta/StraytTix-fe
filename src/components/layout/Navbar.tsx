import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  Bell,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  Calendar,
  PlusCircle,
  ChevronDown,
  Ticket,
  Heart,
  Settings,
  Compass,
  Users,
  ChevronRight,
  ArrowRight,
  User as UserIcon,
  Globe
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../ui/Logo';
import { resolveOrganizerRole } from '../../utils/permissions';
import { countriesApi, type Country, DEFAULT_COUNTRIES } from '../../api/countries';

interface NavbarProps {
  isDashboard?: boolean;
  hideNavLinks?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ isDashboard, hideNavLinks }) => {
  const { isAuthenticated, user, organizer, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [countryDropdown, setCountryDropdown] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  
  // Country state loaded from backend API
  const [countries, setCountries] = useState<Country[]>(DEFAULT_COUNTRIES);
  const [selectedCountry, setSelectedCountry] = useState<Country>(() => {
    const saved = localStorage.getItem('strayttix_selected_country');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fall back to default
      }
    }
    return DEFAULT_COUNTRIES[0];
  });

  const navigate = useNavigate();
  const location = useLocation();

  // Load countries dynamically from backend API on mount
  useEffect(() => {
    countriesApi.getCountries()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCountries(data);
          // If existing selection is in list, keep it; else set first
          const match = data.find((c) => c.code === selectedCountry.code || c.name === selectedCountry.name);
          if (match) {
            setSelectedCountry(match);
          }
        }
      })
      .catch((err) => {
        console.warn('Navbar: error loading countries from backend, using default list:', err);
      });
  }, []);

  const handleSelectCountry = (c: Country) => {
    setSelectedCountry(c);
    localStorage.setItem('strayttix_selected_country', JSON.stringify(c));
    setCountryDropdown(false);

    // If currently on Discover page, dispatch a custom event or navigate with query parameter
    if (location.pathname === '/discover') {
      window.dispatchEvent(new CustomEvent('strayttix:country_changed', { detail: c }));
    }
  };

  useEffect(() => {
    let lastScrollY = window.scrollY || document.documentElement.scrollTop;
    let accumulatedDownScroll = 0;
    let accumulatedUpScroll = 0;

    const SCROLL_DELTA_THRESHOLD = 240;
    const MIN_PAGE_OFFSET = 450;

    const handleScroll = () => {
      const currentScrollY = window.scrollY || document.documentElement.scrollTop;
      const delta = currentScrollY - lastScrollY;

      setIsScrolled(currentScrollY > 120);

      if (currentScrollY <= MIN_PAGE_OFFSET) {
        setIsVisible(true);
        accumulatedDownScroll = 0;
        accumulatedUpScroll = 0;
      } else if (isOpen) {
        setIsVisible(true);
      } else if (delta > 0) {
        accumulatedUpScroll = 0;
        accumulatedDownScroll += delta;
        if (accumulatedDownScroll >= SCROLL_DELTA_THRESHOLD) {
          setIsVisible(false);
        }
      } else if (delta < 0) {
        accumulatedDownScroll = 0;
        accumulatedUpScroll += Math.abs(delta);
        if (accumulatedUpScroll >= 20 || currentScrollY <= MIN_PAGE_OFFSET) {
          setIsVisible(true);
        }
      }

      lastScrollY = currentScrollY <= 0 ? 0 : currentScrollY;
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isOpen]);

  const isDashboardView = isDashboard || hideNavLinks || location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/organizer');
  
  // High-assurance dark public pages list: all these pages share the deep #070709 theme
  const darkThemeRoutes = [
    '/',
    '/discover',
    '/pricing',
    '/about',
    '/how-it-works',
    '/download',
    '/app',
    '/blog',
    '/api-docs',
    '/docs',
    '/report',
    '/terms',
    '/privacy',
    '/refund-policy'
  ];
  
  const isEventDetailPage = location.pathname.startsWith('/events/');
  const isOrganizerProfilePage = location.pathname.startsWith('/organizers/') || location.pathname.startsWith('/@');
  const isDarkCanvasPage = darkThemeRoutes.includes(location.pathname) || isEventDetailPage || isOrganizerProfilePage;
  const isDarkHeroPage = location.pathname === '/' || location.pathname === '/discover';
  const isTransparentHeroNav = isDarkHeroPage && !isScrolled;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Role permissions
  const isOrganizer = user?.accountType === 'organizer';
  const isOrganization = isOrganizer && organizer?.type === 'organization';
  const role = resolveOrganizerRole(organizer);

  // 1. Guest Nav Links
  const guestNavLinks = [
    { to: '/discover', label: 'Discover' },
    { to: '/how-it-works', label: 'How StraytTix Works' },
    { to: '/pricing', label: 'Pricing' },
    { to: '/about', label: 'About us' },
    { to: '/blog', label: 'Blog' },
    { to: '/download', label: 'Download' },
  ];

  // 2. Auth Nav Links
  const organizerLinks = [
    { to: '/organizer', label: 'Console', icon: LayoutDashboard },
    { to: '/discover', label: 'Discover Events', icon: Compass },
    { to: '/organizer/events', label: 'My Events', icon: Calendar },
    { to: '/organizer/orders', label: 'Sales & Orders', icon: Ticket },
    ...(isOrganization ? [{ to: '/organizer/team', label: 'Team', icon: Users }] : []),
  ];

  const customerLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/discover', label: 'Discover', icon: Compass },
    { to: '/dashboard/tickets', label: 'My Tickets', icon: Ticket },
    { to: '/dashboard/favorites', label: 'Favorites', icon: Heart },
  ];

  const authNavLinks = isOrganizer ? organizerLinks : customerLinks;

  const dashboardQuickLinks = isOrganizer
    ? [
      { to: '/organizer', label: 'Console', icon: LayoutDashboard },
      { to: '/discover', label: 'Discover Events', icon: Compass },
      { to: '/organizer/events', label: 'My Events', icon: Calendar },
      { to: '/organizer/orders', label: 'Sales & Orders', icon: Ticket },
    ]
    : [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/discover', label: 'Discover Events', icon: Compass },
      { to: '/dashboard/tickets', label: 'My Tickets', icon: Ticket },
      { to: '/dashboard/favorites', label: 'Favorites', icon: Heart },
    ];

  const currentNavLinks = isDashboardView
    ? dashboardQuickLinks
    : (isAuthenticated ? authNavLinks : guestNavLinks);

  const logoTarget = isAuthenticated
    ? (isOrganizer ? '/organizer' : '/dashboard')
    : '/';

  const isPillState = !isDashboardView && isScrolled;

  return (
    <header
      className={`sticky top-0 z-40 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isVisible 
          ? 'translate-y-0' 
          : '-translate-y-full pointer-events-none'
      } ${
        isDashboardView
          ? isScrolled
            ? 'bg-white/80 backdrop-blur-xl border-b border-zinc-200/80 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)] py-1'
            : 'bg-white/95 backdrop-blur-md border-b border-[#E5E7EB] py-0'
          : isScrolled
            ? 'pt-2.5 sm:pt-3.5 pb-1.5 px-3 sm:px-6 bg-transparent border-b border-transparent pointer-events-none'
            : isDarkCanvasPage
              ? 'pt-0 pb-0 px-0 bg-[#070709]/85 backdrop-blur-xl border-b border-white/10 pointer-events-auto'
              : 'pt-0 pb-0 px-0 bg-white/95 backdrop-blur-md border-b border-[#E5E7EB] pointer-events-auto'
      }`}
    >
      <nav
        aria-label="Primary Navigation"
        className={`pointer-events-auto mx-auto flex items-center justify-between transition-[max-width,height,border-radius,background-color,border-color,box-shadow,padding] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isDashboardView
            ? `max-w-7xl px-4 sm:px-6 ${isScrolled ? 'h-14' : 'h-16'}`
            : isScrolled
              ? isDarkCanvasPage
                ? 'max-w-5xl h-14 px-4 sm:px-6 rounded-full bg-zinc-950/90 backdrop-blur-2xl border border-white/15 shadow-[0_12px_36px_-8px_rgba(0,0,0,0.7)]'
                : 'max-w-5xl h-14 px-4 sm:px-6 rounded-full bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-[0_12px_36px_-8px_rgba(15,23,42,0.12)]'
              : 'max-w-[1600px] h-16 px-4 sm:px-6 lg:px-12 xl:px-16 2xl:px-20 rounded-none bg-transparent border border-transparent shadow-none'
        }`}
      >
        {/* Brand Logo & Country Dropdown */}
        <div className="flex items-center gap-4">
          <Logo to={logoTarget} size="md" variant={isDarkCanvasPage ? 'light' : 'dark'} />

          {/* Supported Country Selector Dropdown (Loaded from backend API) */}
          {!isDashboardView && (
            <div className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setCountryDropdown(!countryDropdown)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                  isDarkCanvasPage
                    ? 'bg-white/[0.06] hover:bg-white/[0.12] text-zinc-300 hover:text-white border-white/15'
                    : 'bg-zinc-100 hover:bg-zinc-200/80 text-zinc-700 hover:text-zinc-950 border-zinc-200'
                }`}
                title="Change Country"
              >
                <span>{selectedCountry.flag || '🌐'}</span>
                <span className="font-mono text-[11px] uppercase tracking-wider">{selectedCountry.code || 'NG'}</span>
                <ChevronDown className="w-3 h-3 text-zinc-400" />
              </button>

              {countryDropdown && (
                <div 
                  className={`absolute left-0 mt-2 w-56 rounded-2xl p-2 z-50 shadow-2xl border animate-in fade-in zoom-in-95 duration-150 max-h-80 overflow-y-auto ${
                    isDarkCanvasPage
                      ? 'bg-[#0E0E14] border-white/15 text-white'
                      : 'bg-white border-zinc-200 text-zinc-900'
                  }`}
                >
                  <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-zinc-400 border-b border-white/10 mb-1">
                    Select Your Country
                  </div>
                  {countries.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => handleSelectCountry(c)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                        selectedCountry.code === c.code
                          ? 'bg-[#E31B23] text-white font-bold'
                          : isDarkCanvasPage
                            ? 'text-zinc-300 hover:bg-white/10 hover:text-white'
                            : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span>{c.flag || '🌐'}</span>
                        <span className="truncate">{c.name}</span>
                      </div>
                      <span className="text-[10px] font-mono opacity-80">{c.currency || c.code}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Center Desktop Navigation: Different for Guest vs Auth */}
        <div className={`hidden lg:flex items-center transition-[gap] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isPillState ? 'gap-6 xl:gap-7' : 'gap-6 xl:gap-8'
        }`}>
          {currentNavLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/' || link.to === '/dashboard' || link.to === '/organizer'}
              className={({ isActive }) =>
                `text-xs xl:text-sm font-semibold tracking-wide transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  isActive
                    ? isDarkCanvasPage
                      ? 'text-white font-black'
                      : 'text-[#E31B23] font-bold'
                    : isDarkCanvasPage
                      ? 'text-zinc-400 hover:text-white'
                      : 'text-zinc-600 hover:text-zinc-950'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Right Desktop Actions: Guest vs Auth */}
        <div className="hidden lg:flex items-center gap-2.5 xl:gap-3 shrink-0">
          {isAuthenticated ? (
            /* ================= AUTHENTICATED USER ACTIONS ================= */
            <div className="flex items-center gap-3">
              {/* Search Trigger */}
              <Link
                to="/discover"
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  isDarkCanvasPage
                    ? 'text-zinc-400 hover:text-white hover:bg-white/10'
                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
                title="Search events"
              >
                <Search className="w-5 h-5" />
              </Link>

              {/* Notification Bell */}
              <button
                className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                  isDarkCanvasPage
                    ? 'text-zinc-400 hover:text-white hover:bg-white/10'
                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#E31B23]" />
              </button>

              {/* Primary Action Button in Auth Nav */}
              {isOrganizer ? (
                <Link to="/organizer/events/create">
                  <button className="inline-flex items-center gap-2 px-5 py-2 bg-[#E31B23] hover:bg-[#B91C1C] text-white text-sm font-bold rounded-full transition-all shadow-lg shadow-[#E31B23]/25 cursor-pointer">
                    <PlusCircle className="w-4 h-4" />
                    <span>Create Event</span>
                  </button>
                </Link>
              ) : (
                <Link to={location.pathname === '/discover' ? '/dashboard/tickets' : '/discover'}>
                  <button className="inline-flex items-center gap-2 px-5 py-2 bg-[#E31B23] hover:bg-[#B91C1C] text-white text-sm font-bold rounded-full transition-all shadow-lg shadow-[#E31B23]/25 cursor-pointer">
                    {location.pathname === '/discover' ? (
                      <>
                        <Ticket className="w-4 h-4" />
                        <span>My Tickets</span>
                      </>
                    ) : (
                      <>
                        <Compass className="w-4 h-4" />
                        <span>Discover Events</span>
                      </>
                    )}
                  </button>
                </Link>
              )}

              {/* User Avatar Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setUserDropdown(!userDropdown)}
                  className={`flex items-center gap-2 p-1.5 rounded-full transition-colors cursor-pointer ${
                    isDarkCanvasPage ? 'hover:bg-white/10' : 'hover:bg-zinc-100'
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-white text-zinc-950 font-black text-xs flex items-center justify-center border border-white/20 shadow-md">
                    {user?.firstName?.[0] || 'U'}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                </button>

                {userDropdown && (
                  <div className={`absolute right-0 mt-2 w-60 rounded-2xl shadow-2xl py-2 z-50 border animate-in fade-in zoom-in-95 duration-100 ${
                    isDarkCanvasPage
                      ? 'bg-[#0E0E14] border-white/15 text-white'
                      : 'bg-white border-zinc-200 text-zinc-900'
                  }`}>
                    {isOrganizer ? (
                      <>
                        <div className="px-4 py-2.5 border-b border-white/10">
                          <p className="text-xs font-bold text-white truncate">
                            {user?.firstName} {user?.lastName}
                          </p>
                          <p className="text-[10px] text-zinc-400 truncate">{user?.email}</p>
                        </div>

                        <div className="py-1">
                          <Link
                            to="/organizer"
                            onClick={() => setUserDropdown(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
                          >
                            <LayoutDashboard className="w-3.5 h-3.5 text-zinc-400" /> Organizer Console
                          </Link>
                          <Link
                            to="/organizer/events"
                            onClick={() => setUserDropdown(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
                          >
                            <Calendar className="w-3.5 h-3.5 text-zinc-400" /> My Events
                          </Link>
                          <Link
                            to="/organizer/orders"
                            onClick={() => setUserDropdown(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
                          >
                            <Ticket className="w-3.5 h-3.5 text-zinc-400" /> Sales & Orders
                          </Link>
                          {isOrganization && (
                            <Link
                              to="/organizer/team"
                              onClick={() => setUserDropdown(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
                            >
                              <Users className="w-3.5 h-3.5 text-zinc-400" /> Team Members
                            </Link>
                          )}
                          {role !== 'staff' && (
                            <Link
                              to="/organizer/profile"
                              onClick={() => setUserDropdown(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
                            >
                              <UserIcon className="w-3.5 h-3.5 text-zinc-400" /> Organizer Profile
                            </Link>
                          )}
                          <Link
                            to="/organizer/settings"
                            onClick={() => setUserDropdown(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
                          >
                            <Settings className="w-3.5 h-3.5 text-zinc-400" /> {role === 'staff' ? 'Staff Settings' : 'Organization Settings'}
                          </Link>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="px-4 py-2.5 border-b border-white/10">
                          <p className="text-xs font-bold text-white truncate">
                            {user?.firstName} {user?.lastName}
                          </p>
                          <p className="text-[10px] text-zinc-400 truncate">{user?.email}</p>
                          <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide bg-white/10 text-zinc-300">
                            Attendee Account
                          </span>
                        </div>

                        <div className="py-1">
                          <Link
                            to="/dashboard"
                            onClick={() => setUserDropdown(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
                          >
                            <LayoutDashboard className="w-3.5 h-3.5 text-zinc-400" /> Attendee Dashboard
                          </Link>
                          <Link
                            to="/dashboard/tickets"
                            onClick={() => setUserDropdown(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
                          >
                            <Ticket className="w-3.5 h-3.5 text-zinc-400" /> My Tickets
                          </Link>
                          <Link
                            to="/dashboard/favorites"
                            onClick={() => setUserDropdown(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
                          >
                            <Heart className="w-3.5 h-3.5 text-zinc-400" /> Favorites
                          </Link>
                          <Link
                            to="/dashboard/settings"
                            onClick={() => setUserDropdown(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
                          >
                            <Settings className="w-3.5 h-3.5 text-zinc-400" /> Account Settings
                          </Link>
                        </div>
                      </>
                    )}

                    <div className="border-t border-white/10 pt-1">
                      <button
                        onClick={() => {
                          setUserDropdown(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors text-left cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ================= GUEST USER ACTIONS ================= */
            <div className="flex items-center gap-3">
              <div
                className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  isPillState ? 'w-0 opacity-0 -mr-2.5 pointer-events-none' : 'w-10 opacity-100'
                }`}
              >
                <Link
                  to="/discover"
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    isDarkCanvasPage
                      ? 'text-zinc-400 hover:text-white hover:bg-white/10'
                      : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
                  }`}
                  title="Search events"
                >
                  <Search className="w-5 h-5" />
                </Link>
              </div>

              <Link
                to="/login"
                className={`rounded-full font-bold transition-all duration-300 cursor-pointer whitespace-nowrap ${
                  isDarkCanvasPage
                    ? 'px-5 py-2 text-xs xl:text-sm text-zinc-300 hover:text-white border border-white/20 hover:border-white/40 hover:bg-white/5'
                    : 'px-5 py-2 text-xs xl:text-sm text-zinc-700 hover:text-zinc-950 border border-zinc-200 hover:border-zinc-300'
                }`}
              >
                Log In
              </Link>

              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-1.5 text-white bg-[#E31B23] hover:bg-[#B91C1C] px-6 py-2 text-xs xl:text-sm font-bold rounded-full transition-all shadow-lg shadow-[#E31B23]/25 cursor-pointer whitespace-nowrap hover:scale-102 active:scale-95"
              >
                <span>Get started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 lg:hidden">
          <Link
            to="/discover"
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
              isDarkCanvasPage
                ? 'text-zinc-300 hover:text-white hover:bg-white/10'
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
            }`}
            title="Search events"
          >
            <Search className="w-5 h-5" />
          </Link>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`p-2 rounded-xl focus:outline-none transition-colors ${
              isDarkCanvasPage
                ? 'text-white hover:bg-white/10'
                : 'text-zinc-700 hover:bg-zinc-100'
            }`}
            aria-label="Toggle navigation menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      {isOpen && (
        <div className={`pointer-events-auto lg:hidden mt-2 max-w-5xl mx-4 sm:mx-auto rounded-3xl border px-6 py-5 flex flex-col gap-4 shadow-2xl max-h-[calc(100dvh-5rem)] overflow-y-auto animate-in slide-in-from-top-2 duration-150 ${
          isDarkCanvasPage
            ? 'bg-[#0E0E14] border-white/15 text-white'
            : 'bg-white border-slate-200 text-slate-800'
        }`}>
          {/* Mobile Country Selector */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <span className="text-xs font-mono uppercase text-zinc-400">Country:</span>
            <select
              value={selectedCountry.code}
              onChange={(e) => {
                const c = countries.find(item => item.code === e.target.value);
                if (c) handleSelectCountry(c);
              }}
              className="bg-white/10 border border-white/20 text-white rounded-xl text-xs px-3 py-1.5 focus:outline-none"
            >
              {countries.map((c) => (
                <option key={c.code} value={c.code} className="bg-zinc-900 text-white">
                  {c.flag} {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>

          {/* Nav links */}
          <div className="flex flex-col gap-1">
            {currentNavLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) => 
                  `text-sm font-bold py-2.5 px-3 rounded-xl transition-colors flex items-center justify-between ${
                    isActive 
                      ? 'bg-[#E31B23]/15 text-[#E31B23]' 
                      : isDarkCanvasPage 
                        ? 'text-zinc-300 hover:bg-white/10' 
                        : 'text-slate-800 hover:bg-slate-50'
                  }`
                }
              >
                <span>{link.label}</span>
                <ChevronRight className="w-4 h-4 text-zinc-400" />
              </NavLink>
            ))}
          </div>

          <hr className={isDarkCanvasPage ? 'border-white/10 my-1' : 'border-slate-100 my-1'} />

          {isAuthenticated ? (
            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }}
                className="w-full text-center py-2.5 text-red-500 font-bold rounded-full text-xs bg-red-500/10 cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className={`w-full text-center py-2.5 font-bold rounded-full text-xs border ${
                  isDarkCanvasPage ? 'text-white border-white/20' : 'text-slate-800 border-slate-200'
                }`}
              >
                Log in
              </Link>
              <Link
                to="/register"
                onClick={() => setIsOpen(false)}
                className="w-full text-center py-3 bg-[#E31B23] text-white font-bold rounded-full text-xs shadow-lg shadow-[#E31B23]/30"
              >
                Get started free &rarr;
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
