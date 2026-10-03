import React, { useState } from 'react';
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
  const navigate = useNavigate();
  const location = useLocation();

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

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E5E7EB] transition-all">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Brand Logo */}
        <Logo to={logoTarget} size="md" />

        {/* Center Desktop Navigation: Different for Guest vs Auth */}
        <div className="hidden md:flex items-center gap-7">
          {currentNavLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/' || link.to === '/dashboard' || link.to === '/organizer'}
              className={({ isActive }) =>
                `text-sm font-semibold tracking-wide transition-colors flex items-center gap-1.5 ${isActive ? 'text-[#E31B23] font-bold' : 'text-zinc-600 hover:text-zinc-950'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Right Desktop Actions: Guest vs Auth */}
        <div className="hidden md:flex items-center gap-4">
          {/* Search Trigger */}
          <Link
            to="/discover"
            className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
            title="Search events"
          >
            <Search className="w-5 h-5" />
          </Link>

          {isAuthenticated ? (
            /* ================= AUTHENTICATED USER ACTIONS ================= */
            <div className="flex items-center gap-3">
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
            /* ================= GUEST USER ACTIONS ================= */
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="px-5 py-2 text-sm font-bold text-zinc-700 hover:text-zinc-950 rounded-full border border-zinc-200 hover:border-zinc-300 transition-all cursor-pointer"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="px-6 py-2 text-sm font-black text-white bg-[#E31B23] hover:bg-[#B91C1C] rounded-full transition-all shadow-xs hover:shadow-md cursor-pointer"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-zinc-700 hover:text-zinc-950 focus:outline-none"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Drawer: Guest vs Auth */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-zinc-200 p-6 flex flex-col gap-4 shadow-xl">
          {/* Nav links */}
          <div className="flex flex-col gap-2">
            {currentNavLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className="text-sm font-bold text-zinc-800 hover:text-[#E31B23] py-1"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <hr className="border-zinc-100 my-1" />

          {isAuthenticated ? (
            isOrganizer ? (
              /* Organizer Mobile Drawer */
              <div className="flex flex-col gap-2.5">
                <Link
                  to="/organizer/events/create"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-2.5 bg-[#E31B23] text-white font-bold rounded-xl text-xs shadow-xs"
                >
                  + Create Event
                </Link>
                <Link
                  to="/organizer"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-2 bg-zinc-50 border border-zinc-200 text-zinc-800 font-bold rounded-xl text-xs"
                >
                  Organizer Console
                </Link>
                <Link
                  to="/organizer/events"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-2 bg-zinc-50 border border-zinc-200 text-zinc-800 font-bold rounded-xl text-xs"
                >
                  My Events
                </Link>
                {isOrganization && (
                  <Link
                    to="/organizer/team"
                    onClick={() => setIsOpen(false)}
                    className="w-full text-center py-2 bg-zinc-50 border border-zinc-200 text-zinc-800 font-bold rounded-xl text-xs"
                  >
                    Team Members
                  </Link>
                )}
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-center py-2 text-red-600 font-bold rounded-xl text-xs bg-red-50 cursor-pointer"
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
                  className="w-full text-center py-2.5 bg-[#E31B23] text-white font-bold rounded-xl text-xs shadow-xs"
                >
                  Discover Events
                </Link>
                <Link
                  to="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-2 bg-zinc-50 border border-zinc-200 text-zinc-800 font-bold rounded-xl text-xs"
                >
                  Attendee Dashboard
                </Link>
                <Link
                  to="/dashboard/tickets"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-2 bg-zinc-50 border border-zinc-200 text-zinc-800 font-bold rounded-xl text-xs"
                >
                  My Tickets
                </Link>
                <Link
                  to="/dashboard/favorites"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-2 bg-zinc-50 border border-zinc-200 text-zinc-800 font-bold rounded-xl text-xs"
                >
                  Saved Experiences
                </Link>
                <Link
                  to="/dashboard/profile"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-2 bg-zinc-50 border border-zinc-200 text-zinc-800 font-bold rounded-xl text-xs"
                >
                  Profile Settings
                </Link>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-center py-2 text-red-600 font-bold rounded-xl text-xs bg-red-50 cursor-pointer"
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
                className="w-full text-center py-2 text-zinc-800 border border-zinc-200 font-bold rounded-xl text-xs"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setIsOpen(false)}
                className="w-full text-center py-2.5 bg-[#E31B23] text-white font-bold rounded-xl text-xs shadow-xs"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
