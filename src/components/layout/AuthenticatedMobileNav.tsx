import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Ticket,
  Heart,
  User,
  Calendar,
  ShoppingBag,
  Users,
  Wallet,
  Settings,
  PlusCircle,
  LogOut,
  Compass,
  Bell,
  X,
  Menu,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../ui/Logo';
import { resolveOrganizerRole, getRolePermissions } from '../../utils/permissions';

interface AuthenticatedMobileNavProps {
  currentMode: 'attendee' | 'organizer';
}

export const AuthenticatedMobileNav: React.FC<AuthenticatedMobileNavProps> = ({ currentMode }) => {
  const { user, organizer, logout } = useAuth();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = async () => {
    setDrawerOpen(false);
    await logout();
    navigate('/');
  };

  // Roles & permissions
  const isOrganizer = user?.accountType === 'organizer';
  const isOrganization = isOrganizer && organizer?.type === 'organization';
  const isCustomer = !isOrganizer;

  // Strict mode: A customer account is ALWAYS strictly attendee mode
  const isOrganizerMode = isOrganizer && currentMode === 'organizer';
  const role = resolveOrganizerRole(organizer);
  const perms = getRolePermissions(role);

  // Attendee Bottom Tabs
  const attendeeBottomTabs = [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/dashboard/tickets', label: 'Tickets', icon: Ticket },
    { to: '/discover', label: 'Explore', icon: Compass },
    { to: '/dashboard/favorites', label: 'Saved', icon: Heart },
    { to: '#menu', label: 'Menu', icon: Menu, isMenuTrigger: true },
  ];

  // Organizer Bottom Tabs
  const organizerBottomTabs = [
    { to: '/organizer', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/organizer/events', label: role === 'staff' ? 'Assigned' : 'Events', icon: Calendar },
    ...(perms.canCreateEvents ? [{ to: '/organizer/events/create', label: 'Create', icon: PlusCircle, isCta: true }] : []),
    ...(perms.canViewOrders ? [{ to: '/organizer/orders', label: 'Sales', icon: ShoppingBag }] : []),
    { to: '#menu', label: 'Menu', icon: Menu, isMenuTrigger: true },
  ];

  const bottomTabs = isOrganizerMode ? organizerBottomTabs : attendeeBottomTabs;

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. SINGLE TOP MOBILE HEADER (Visible only on < md / < lg screens) */}
      {/* ========================================================================= */}
      <header className="lg:hidden sticky top-0 z-40 h-16 bg-white/90 backdrop-blur-xl border-b border-zinc-200/80 px-4 sm:px-6 flex items-center justify-between shadow-2xs">
        {/* Left: Brand Logo + Mode Badge (NO switcher links) */}
        <div className="flex items-center gap-2.5">
          <Logo to={isOrganizerMode ? '/organizer' : '/dashboard'} size="sm" />

          {/* Role badge hidden on mobile view as requested */}
        </div>

        {/* Right: Quick actions & Navigation Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Primary Action Button (Discover for attendee mode; Create hidden on mobile for organizer) */}
          {!isOrganizerMode && (
            <Link
              to="/discover"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#E31B23] hover:bg-[#B91C1C] text-white text-[11px] font-black rounded-full shadow-xs transition-colors"
              title="Discover Events"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Discover</span>
            </Link>
          )}

          {/* Notification Bell */}
          <button
            className="relative w-8 h-8 rounded-full flex items-center justify-center text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#E31B23]" />
          </button>

          {/* User Avatar */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="w-8 h-8 rounded-full bg-zinc-900 text-white font-black text-xs flex items-center justify-center border border-zinc-200 shadow-2xs hover:scale-105 transition-all cursor-pointer"
            title="Open Account Menu"
          >
            {user?.firstName?.[0] || 'U'}
          </button>

          {/* Classic Hamburger Nav Button */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-1.5 rounded-xl text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 transition-colors cursor-pointer"
            title="Open Navigation Menu"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. UNIFIED SLIDE-OUT DRAWER FOR ALL AUTHENTICATED MOBILE USERS */}
      {/* ========================================================================= */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Drawer Content */}
          <aside className="absolute inset-y-0 right-0 max-w-xs w-full bg-white shadow-2xl flex flex-col justify-between p-6 z-50 overflow-y-auto animate-in slide-in-from-right duration-250">
            <div className="space-y-6">
              {/* Drawer Top Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                <Logo to={isOrganizerMode ? '/organizer' : '/dashboard'} size="sm" />
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-2 rounded-xl text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Profile Card */}
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/70 flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-zinc-900 text-white font-black text-sm flex items-center justify-center shadow-2xs flex-shrink-0">
                  {user?.firstName?.[0] || 'U'}
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-black text-zinc-950 truncate">
                    {user?.firstName || 'User'} {user?.lastName || ''}
                  </h4>
                  <p className="text-xs text-zinc-400 truncate">{user?.email}</p>
                  <span className="inline-block mt-1 text-[10px] font-bold text-zinc-500 uppercase tracking-wide">
                    {isCustomer
                      ? 'Attendee Account'
                      : (isOrganization ? 'Organization Account' : 'Solo Organizer Account')}
                  </span>
                </div>
              </div>

              {/* Navigation List depending strictly on role */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                  {isOrganizerMode ? 'Organizer Tools' : 'My Experience'}
                </span>

                {isOrganizerMode ? (
                  <>
                    <NavLink
                      to="/organizer"
                      end
                      onClick={() => setDrawerOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${isActive ? 'bg-[#E31B23] text-white shadow-2xs' : 'text-zinc-700 hover:bg-zinc-50'
                        }`
                      }
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Console Dashboard</span>
                    </NavLink>
                    <NavLink
                      to="/organizer/events"
                      onClick={() => setDrawerOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${isActive ? 'bg-[#E31B23] text-white shadow-2xs' : 'text-zinc-700 hover:bg-zinc-50'
                        }`
                      }
                    >
                      <Calendar className="w-4 h-4" />
                      <span>{role === 'staff' ? 'Assigned Events' : 'My Events'}</span>
                    </NavLink>
                    {perms.canViewOrders && (
                      <NavLink
                        to="/organizer/orders"
                        onClick={() => setDrawerOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${isActive ? 'bg-[#E31B23] text-white shadow-2xs' : 'text-zinc-700 hover:bg-zinc-50'
                          }`
                        }
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>Orders & Sales</span>
                      </NavLink>
                    )}

                    {/* Team Members: ONLY for Organizations & allowed roles */}
                    {isOrganization && perms.canManageTeam && (
                      <NavLink
                        to="/organizer/team"
                        onClick={() => setDrawerOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${isActive ? 'bg-[#E31B23] text-white shadow-2xs' : 'text-zinc-700 hover:bg-zinc-50'
                          }`
                        }
                      >
                        <Users className="w-4 h-4" />
                        <span>Team Members</span>
                      </NavLink>
                    )}

                    {perms.canViewFinanceWallet && (
                      <NavLink
                        to="/organizer/analytics"
                        onClick={() => setDrawerOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${isActive ? 'bg-[#E31B23] text-white shadow-2xs' : 'text-zinc-700 hover:bg-zinc-50'
                          }`
                        }
                      >
                        <Wallet className="w-4 h-4" />
                        <span>Finance & Wallet</span>
                      </NavLink>
                    )}
                    {perms.canEditOrganizerProfile && (
                      <NavLink
                        to="/organizer/profile"
                        onClick={() => setDrawerOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${isActive ? 'bg-[#E31B23] text-white shadow-2xs' : 'text-zinc-700 hover:bg-zinc-50'
                          }`
                        }
                      >
                        <User className="w-4 h-4" />
                        <span>Organizer Profile</span>
                      </NavLink>
                    )}
                    {perms.canAccessSettings && (
                      <NavLink
                        to="/organizer/settings"
                        onClick={() => setDrawerOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${isActive ? 'bg-[#E31B23] text-white shadow-2xs' : 'text-zinc-700 hover:bg-zinc-50'
                          }`
                        }
                      >
                        <Settings className="w-4 h-4" />
                        <span>{role === 'staff' ? 'Staff Settings' : 'Console Settings'}</span>
                      </NavLink>
                    )}
                  </>
                ) : (
                  <>
                    <NavLink
                      to="/dashboard"
                      end
                      onClick={() => setDrawerOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${isActive ? 'bg-[#E31B23] text-white shadow-2xs' : 'text-zinc-700 hover:bg-zinc-50'
                        }`
                      }
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Overview</span>
                    </NavLink>
                    <NavLink
                      to="/dashboard/tickets"
                      onClick={() => setDrawerOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${isActive ? 'bg-[#E31B23] text-white shadow-2xs' : 'text-zinc-700 hover:bg-zinc-50'
                        }`
                      }
                    >
                      <Ticket className="w-4 h-4" />
                      <span>My Ticket Stubs</span>
                    </NavLink>
                    <NavLink
                      to="/dashboard/favorites"
                      onClick={() => setDrawerOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${isActive ? 'bg-[#E31B23] text-white shadow-2xs' : 'text-zinc-700 hover:bg-zinc-50'
                        }`
                      }
                    >
                      <Heart className="w-4 h-4" />
                      <span>Saved Experiences</span>
                    </NavLink>
                    <NavLink
                      to="/dashboard/profile"
                      onClick={() => setDrawerOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${isActive ? 'bg-[#E31B23] text-white shadow-2xs' : 'text-zinc-700 hover:bg-zinc-50'
                        }`
                      }
                    >
                      <User className="w-4 h-4" />
                      <span>Profile</span>
                    </NavLink>
                    <NavLink
                      to="/dashboard/settings"
                      onClick={() => setDrawerOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${isActive ? 'bg-[#E31B23] text-white shadow-2xs' : 'text-zinc-700 hover:bg-zinc-50'
                        }`
                      }
                    >
                      <Settings className="w-4 h-4" />
                      <span>Account Settings</span>
                    </NavLink>
                  </>
                )}

                {/* Switch to Attendee Account (if in Organizer Mode) */}
                {isOrganizerMode && (
                  <div className="pt-2">
                    <Link
                      to="/dashboard"
                      onClick={() => setDrawerOpen(false)}
                      className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-zinc-900 bg-red-50/70 border border-red-200/50 hover:bg-red-100/70 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Ticket className="w-4 h-4 text-[#E31B23]" />
                        <span>Attendee Account</span>
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
                    </Link>
                  </div>
                )}

                {/* Explore Marketplace Link */}
                <div className="pt-2">
                  <Link
                    to="/discover"
                    onClick={() => setDrawerOpen(false)}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Compass className="w-4 h-4 text-[#E31B23]" />
                      Explore Public Marketplace
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-zinc-100 space-y-2">
              {/* Create New Event: ONLY for Organizers who can create events */}
              {isOrganizerMode && perms.canCreateEvents && (
                <Link
                  to="/organizer/events/create"
                  onClick={() => setDrawerOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#E31B23] hover:bg-[#B91C1C] text-white text-xs font-black rounded-xl shadow-xs transition-all"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Create New Event</span>
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SINGLE DOCKED MOBILE BOTTOM NAVIGATION BAR */}
      {/* ========================================================================= */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-zinc-200/80 px-2 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {bottomTabs.map((tab, idx) => {
            if ((tab as any).isCta) {
              return (
                <Link
                  key={idx}
                  to={tab.to}
                  className="flex flex-col items-center justify-center -mt-5"
                >
                  <div className="w-12 h-12 rounded-full bg-[#E31B23] text-white flex items-center justify-center shadow-lg shadow-red-500/30 hover:scale-105 transition-all">
                    <tab.icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold text-zinc-900 mt-0.5">
                    {tab.label}
                  </span>
                </Link>
              );
            }

            if ((tab as any).isMenuTrigger) {
              return (
                <button
                  key={idx}
                  onClick={() => setDrawerOpen(true)}
                  className="flex-1 flex flex-col items-center justify-center py-1 text-zinc-500 hover:text-zinc-950 transition-colors cursor-pointer"
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="text-[10px] font-semibold mt-0.5">{tab.label}</span>
                </button>
              );
            }

            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={(tab as any).end}
                className={({ isActive }) =>
                  `flex-1 flex flex-col items-center justify-center py-1 transition-colors ${isActive
                    ? 'text-[#E31B23] font-bold'
                    : 'text-zinc-500 hover:text-zinc-900 font-medium'
                  }`
                }
              >
                <tab.icon className="w-5 h-5" />
                <span className="text-[10px] mt-0.5">{tab.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default AuthenticatedMobileNav;
