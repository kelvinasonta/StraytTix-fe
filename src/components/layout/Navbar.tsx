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
  User as UserIcon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../ui/Logo';
import { resolveOrganizerRole } from '../../utils/permissions';

interface NavbarProps {
  isDashboard?: boolean;
  hideNavLinks?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ isDashboard, hideNavLinks }) => {
  const { isAuthenticated, user, organizer, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      setIsScrolled(scrollY > 16);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isDashboardView = isDashboard || hideNavLinks || location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/organizer');

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Role permissions
  const isOrganizer = user?.accountType === 'organizer';
  const isOrganization = isOrganizer && organizer?.type === 'organization';
  const role = resolveOrganizerRole(organizer);

  // 1. Guest Nav Links (Shown only to non-logged in visitors)
  const guestNavLinks = [
    { to: '/discover', label: 'Discover' },
    { to: '/how-it-works', label: 'How Tix Works' },
    { to: '/pricing', label: 'Pricing' },
    { to: '/about', label: 'About us' },
    { to: '/blog', label: 'Blog' },
    { to: '/download', label: 'Download' },
  ];

  // 2. Auth Nav Links (Shown to authenticated users)
  const organizerLinks = [
    { to: '/organizer', label: 'Console', icon: LayoutDashboard },
    { to: '/discover', label: 'Discover Events', icon: Compass },
    { to: '/organizer/events', label: 'My Events', icon: Calendar },
    { to: '/organizer/orders', label: 'Sales & Orders', icon: Ticket },
    ...(isOrganization ? [{ to: '/organizer/team', label: 'Team', icon: Users }] : []),
  ];

  // Customer strictly sees only attendee content - NEVER any organizer links
  const customerLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/discover', label: 'Discover', icon: Compass },
    { to: '/dashboard/tickets', label: 'My Tickets', icon: Ticket },
    { to: '/dashboard/favorites', label: 'Favorites', icon: Heart },
  ];

  const authNavLinks = isOrganizer ? organizerLinks : customerLinks;

  // On dashboard views:
  // Customer sees attendee links; Organizer sees public discover or clean links
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
      className={`sticky top-0 z-40 transition-[padding,background-color,border-color,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        isDashboardView
          ? isScrolled
            ? 'bg-white/80 backdrop-blur-xl border-b border-zinc-200/80 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)] py-1'
            : 'bg-white/95 backdrop-blur-md border-b border-[#E5E7EB] py-0'
          : isScrolled
            ? 'pt-2.5 sm:pt-3.5 pb-1.5 px-3 sm:px-6 bg-transparent border-b border-transparent pointer-events-none'
            : 'pt-0 pb-0 px-0 bg-white/95 backdrop-blur-md border-b border-[#E5E7EB] pointer-events-auto'
      }`}
    >
      <nav
        aria-label="Primary Navigation"
        className={`pointer-events-auto mx-auto flex items-center justify-between transition-[max-width,height,border-radius,background-color,border-color,box-shadow,padding] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isDashboardView
            ? `max-w-7xl px-4 sm:px-6 ${isScrolled ? 'h-14' : 'h-16'}`
            : isScrolled
              ? 'max-w-5xl h-14 px-4 sm:px-6 rounded-full bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-[0_12px_36px_-8px_rgba(15,23,42,0.12)]'
              : 'max-w-7xl h-16 px-4 sm:px-6 rounded-none bg-transparent border border-transparent shadow-none'
        }`}
      >
        {/* Brand Logo */}
        <Logo to={logoTarget} size="md" />

        {/* Center Desktop Navigation: Different for Guest vs Auth (hidden below lg to prevent tablet wrap) */}
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
                    ? 'text-[#E31B23] font-bold'
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
                className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                title="Search events"
              >
                <Search className="w-5 h-5" />
              </Link>

              {/* Notification Bell */}
              <button
                className="relative w-10 h-10 rounded-full flex items-center justify-center text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#E31B23]" />
              </button>

              {/* Primary Action Button in Auth Nav */}
              {isOrganizer ? (
                <Link to="/organizer/events/create">
                  <button className="inline-flex items-center gap-2 px-5 py-2 bg-[#E31B23] hover:bg-[#B91C1C] text-white text-sm font-bold rounded-full transition-all shadow-xs cursor-pointer">
                    <PlusCircle className="w-4 h-4" />
                    <span>Create Event</span>
                  </button>
                </Link>
              ) : (
                <Link to={location.pathname === '/discover' ? '/dashboard/tickets' : '/discover'}>
                  <button className="inline-flex items-center gap-2 px-5 py-2 bg-[#E31B23] hover:bg-[#B91C1C] text-white text-sm font-bold rounded-full transition-all shadow-xs cursor-pointer">
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
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-zinc-100 transition-colors cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-full bg-zinc-900 text-white font-bold text-xs flex items-center justify-center border border-zinc-200">
                    {user?.firstName?.[0] || 'U'}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                </button>

                {userDropdown && (
                  <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-zinc-150 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    {isOrganizer ? (
                      /* ================= ORGANIZER USER DROPDOWN ================= */
                      <>
                        <div className="px-4 py-2.5 border-b border-zinc-100">
                          <p className="text-xs font-bold text-zinc-900 truncate">
                            {user?.firstName} {user?.lastName}
                          </p>
                          <p className="text-[10px] text-zinc-400 truncate">{user?.email}</p>
                        </div>

                        <div className="py-1">
                          <Link
                            to="/organizer"
                            onClick={() => setUserDropdown(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 hover:text-[#E31B23] transition-colors"
                          >
                            <LayoutDashboard className="w-3.5 h-3.5 text-zinc-400" /> Organizer Console
                          </Link>
                          <Link
                            to="/organizer/events"
                            onClick={() => setUserDropdown(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 hover:text-[#E31B23] transition-colors"
                          >
                            <Calendar className="w-3.5 h-3.5 text-zinc-400" /> My Events
                          </Link>
                          <Link
                            to="/organizer/orders"
                            onClick={() => setUserDropdown(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 hover:text-[#E31B23] transition-colors"
                          >
                            <Ticket className="w-3.5 h-3.5 text-zinc-400" /> Sales & Orders
                          </Link>
                          {isOrganization && (
                            <Link
                              to="/organizer/team"
                              onClick={() => setUserDropdown(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 hover:text-[#E31B23] transition-colors"
                            >
                              <Users className="w-3.5 h-3.5 text-zinc-400" /> Team Members
                            </Link>
                          )}
                          {role !== 'staff' && (
                            <Link
                              to="/organizer/profile"
                              onClick={() => setUserDropdown(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 hover:text-[#E31B23] transition-colors"
                            >
                              <UserIcon className="w-3.5 h-3.5 text-zinc-400" /> Organizer Profile
                            </Link>
                          )}
                          <Link
                            to="/organizer/settings"
                            onClick={() => setUserDropdown(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 hover:text-[#E31B23] transition-colors"
                          >
                            <Settings className="w-3.5 h-3.5 text-zinc-400" /> {role === 'staff' ? 'Staff Settings' : 'Organization Settings'}
                          </Link>
                        </div>
                      </>
                    ) : (
                      /* ================= CUSTOMER USER DROPDOWN (Strictly Attendee) ================= */
                      <>
                        <div className="px-4 py-2.5 border-b border-zinc-100">
                          <p className="text-xs font-bold text-zinc-900 truncate">
                            {user?.firstName} {user?.lastName}
                          </p>
                          <p className="text-[10px] text-zinc-400 truncate">{user?.email}</p>
                          <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide bg-zinc-100 text-zinc-600">
                            Attendee Account
                          </span>
                        </div>

                        <div className="py-1">
                          <Link
                            to="/dashboard"
                            onClick={() => setUserDropdown(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 hover:text-[#E31B23] transition-colors"
                          >
                            <LayoutDashboard className="w-3.5 h-3.5 text-zinc-400" /> Attendee Dashboard
                          </Link>
                          <Link
                            to="/dashboard/tickets"
                            onClick={() => setUserDropdown(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 hover:text-[#E31B23] transition-colors"
                          >
                            <Ticket className="w-3.5 h-3.5 text-zinc-400" /> My Tickets
                          </Link>
                          <Link
                            to="/dashboard/favorites"
                            onClick={() => setUserDropdown(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 hover:text-[#E31B23] transition-colors"
                          >
                            <Heart className="w-3.5 h-3.5 text-zinc-400" /> Saved Experiences
                          </Link>
                          <Link
                            to="/dashboard/profile"
                            onClick={() => setUserDropdown(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 hover:text-[#E31B23] transition-colors"
                          >
                            <UserIcon className="w-3.5 h-3.5 text-zinc-400" /> Profile
                          </Link>
                          <Link
                            to="/dashboard/settings"
                            onClick={() => setUserDropdown(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 hover:text-[#E31B23] transition-colors"
                          >
                            <Settings className="w-3.5 h-3.5 text-zinc-400" /> Account Settings
                          </Link>
                        </div>
                      </>
                    )}

                    <div className="border-t border-zinc-100 pt-1">
                      <button
                        onClick={() => {
                          setUserDropdown(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ================= GUEST USER ACTIONS (Smooth Morph between Top & Scrolled Pill) ================= */
            <div className="flex items-center gap-2.5">
              {/* Left Search Icon: smoothly collapses when scrolled into pill */}
              <div
                className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  isPillState ? 'w-0 opacity-0 -mr-2.5 pointer-events-none' : 'w-10 opacity-100'
                }`}
              >
                <Link
                  to="/discover"
                  className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                  title="Search events"
                >
                  <Search className="w-5 h-5" />
                </Link>
              </div>

              <Link
                to="/login"
                className={`rounded-full font-bold transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer whitespace-nowrap ${
                  isPillState
                    ? 'px-3.5 py-1.5 text-xs xl:text-[13px] text-slate-600 hover:text-slate-950 border border-transparent'
                    : 'px-5 py-2 text-sm text-zinc-700 hover:text-zinc-950 border border-zinc-200 hover:border-zinc-300'
                }`}
              >
                Log In
              </Link>

              <Link
                to="/register"
                className={`inline-flex items-center justify-center gap-1.5 text-white bg-[#E31B23] hover:bg-[#B91C1C] rounded-full transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer whitespace-nowrap ${
                  isPillState
                    ? 'px-5 py-2 text-xs xl:text-[13px] font-bold shadow-[0_6px_20px_-3px_rgba(227,27,35,0.45)] hover:shadow-[0_8px_25px_-3px_rgba(227,27,35,0.6)]'
                    : 'px-6 py-2 text-sm font-black shadow-xs hover:shadow-md'
                }`}
              >
                <span>{isPillState ? 'Get started' : 'Sign Up'}</span>
                <ArrowRight
                  className={`transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    isPillState ? 'w-3.5 h-3.5 opacity-100 translate-x-0' : 'w-0 h-3.5 opacity-0 -translate-x-1 overflow-hidden -ml-1.5'
                  }`}
                />
              </Link>

              {/* Right Quick-Search Pill Switch: smoothly expands when scrolled into pill */}
              <div
                className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  isPillState ? 'w-13 opacity-100 ml-0.5' : 'w-0 opacity-0 -ml-2.5 pointer-events-none'
                }`}
              >
                <Link
                  to="/discover"
                  aria-label="Explore all events"
                  title="Explore all events"
                  className="w-12 h-7 rounded-full bg-slate-100 hover:bg-slate-200/80 border border-slate-200/90 p-0.5 flex items-center transition-colors group"
                >
                  <span className="w-5 h-5 rounded-full bg-white shadow-xs border border-slate-200/80 flex items-center justify-center text-slate-500 group-hover:text-[#E31B23] group-hover:translate-x-5 transition-all duration-200">
                    <Search className="w-3 h-3" />
                  </span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Menu Button (Visible on screens smaller than lg) */}
        <div className="flex items-center gap-2 lg:hidden">
          <Link
            to="/discover"
            className="w-9 h-9 rounded-full flex items-center justify-center text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 transition-colors"
            title="Search events"
          >
            <Search className="w-5 h-5" />
          </Link>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-zinc-700 hover:text-zinc-950 rounded-xl hover:bg-zinc-100 focus:outline-none transition-colors"
            aria-label="Toggle navigation menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Drawer: Guest vs Auth */}
      {isOpen && (
        <div className="pointer-events-auto lg:hidden mt-2 max-w-5xl mx-auto bg-white rounded-3xl border border-slate-200 px-6 py-5 flex flex-col gap-4 shadow-2xl max-h-[calc(100dvh-5rem)] overflow-y-auto animate-in slide-in-from-top-2 duration-150">
          {/* Nav links */}
          <div className="flex flex-col gap-1">
            {currentNavLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) => 
                  `text-sm font-bold py-2.5 px-3 rounded-xl transition-colors flex items-center justify-between ${
                    isActive ? 'bg-red-50 text-[#E31B23]' : 'text-slate-800 hover:bg-slate-50'
                  }`
                }
              >
                <span>{link.label}</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </NavLink>
            ))}
          </div>

          <hr className="border-slate-100 my-1" />

          {isAuthenticated ? (
            isOrganizer ? (
              /* Organizer Mobile Drawer */
              <div className="flex flex-col gap-2.5">
                <Link
                  to="/organizer/events/create"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-3 bg-[#E31B23] text-white font-bold rounded-full text-xs shadow-xs"
                >
                  + Create Event
                </Link>
                <Link
                  to="/organizer"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-2.5 bg-slate-50 border border-slate-200 text-slate-800 font-bold rounded-full text-xs"
                >
                  Organizer Console
                </Link>
                <Link
                  to="/organizer/events"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-2.5 bg-slate-50 border border-slate-200 text-slate-800 font-bold rounded-full text-xs"
                >
                  My Events
                </Link>
                {isOrganization && (
                  <Link
                    to="/organizer/team"
                    onClick={() => setIsOpen(false)}
                    className="w-full text-center py-2.5 bg-slate-50 border border-slate-200 text-slate-800 font-bold rounded-full text-xs"
                  >
                    Team Members
                  </Link>
                )}
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-center py-2.5 text-red-600 font-bold rounded-full text-xs bg-red-50 cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              /* Customer Mobile Drawer - Strictly Attendee */
              <div className="flex flex-col gap-2.5">
                <Link
                  to="/discover"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-3 bg-[#E31B23] text-white font-bold rounded-full text-xs shadow-xs"
                >
                  Discover Events
                </Link>
                <Link
                  to="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-2.5 bg-slate-50 border border-slate-200 text-slate-800 font-bold rounded-full text-xs"
                >
                  Attendee Dashboard
                </Link>
                <Link
                  to="/dashboard/tickets"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-2.5 bg-slate-50 border border-slate-200 text-slate-800 font-bold rounded-full text-xs"
                >
                  My Tickets
                </Link>
                <Link
                  to="/dashboard/favorites"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-2.5 bg-slate-50 border border-slate-200 text-slate-800 font-bold rounded-full text-xs"
                >
                  Saved Experiences
                </Link>
                <Link
                  to="/dashboard/profile"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-2.5 bg-slate-50 border border-slate-200 text-slate-800 font-bold rounded-full text-xs"
                >
                  Profile Settings
                </Link>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-center py-2.5 text-red-600 font-bold rounded-full text-xs bg-red-50 cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            )
          ) : (
            <div className="flex flex-col gap-2.5">
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="w-full text-center py-2.5 text-slate-800 border border-slate-200 font-bold rounded-full text-xs"
              >
                Log in
              </Link>
              <Link
                to="/register"
                onClick={() => setIsOpen(false)}
                className="w-full text-center py-3 bg-[#E31B23] text-white font-bold rounded-full text-xs shadow-[0_4px_14px_rgba(227,27,35,0.35)]"
              >
                Get started →
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
