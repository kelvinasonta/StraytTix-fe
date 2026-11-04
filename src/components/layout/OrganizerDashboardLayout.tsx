import React, { useState } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  ShoppingBag,
  Wallet,
  Coins,
  User,
  Users,
  Settings,
  LogOut,
  Search,
  Bell,
  PlusCircle,
  ChevronDown,
  Sparkles,
  Compass,
  Ticket,
  ArrowRight,
  Shield,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Logo } from '../ui/Logo';
import { AuthenticatedMobileNav } from './AuthenticatedMobileNav';
import { resolveOrganizerRole, getRolePermissions } from '../../utils/permissions';
import { getOrganizerLogo } from '../../utils/imageUrl';

interface OrganizerDashboardLayoutProps {
  children: React.ReactNode;
}

export const OrganizerDashboardLayout: React.FC<OrganizerDashboardLayoutProps> = ({ children }) => {
  const { user, organizer, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [userDropdown, setUserDropdown] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isOrganization = organizer?.type === 'organization';
  const role = resolveOrganizerRole(organizer);
  const perms = getRolePermissions(role);

  const roleBadgeStyles: Record<string, string> = {
    owner: 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 border-zinc-900 dark:border-white',
    admin: 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
    manager: 'bg-blue-100 dark:bg-blue-500/10 text-blue-800 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
    staff: 'bg-amber-100 dark:bg-amber-500/10 text-amber-800 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
  };

  const navItems = [
    { to: '/organizer', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/organizer/events', label: role === 'staff' ? 'Assigned Events' : 'My Events', icon: Calendar },
    ...(perms.canViewOrders ? [{ to: '/organizer/orders', label: 'Orders & Sales', icon: ShoppingBag }] : []),
    ...(isOrganization && perms.canManageTeam ? [{ to: '/organizer/team', label: 'Team Members', icon: Users }] : []),
    ...(perms.canViewFinanceWallet ? [
      { to: '/organizer/analytics', label: 'Finance & Wallet', icon: Wallet },
      { to: '/organizer/credits', label: 'Credits & Billing', icon: Coins }
    ] : []),
    ...(perms.canEditOrganizerProfile ? [{ to: '/organizer/profile', label: 'Organizer Profile', icon: User }] : []),
    ...(perms.canAccessSettings ? [{ to: '/organizer/settings', label: role === 'staff' ? 'Staff Settings' : 'Settings', icon: Settings }] : []),
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FB] dark:bg-[#070709] flex flex-col md:flex-row text-[#111827] dark:text-white transition-colors">
      {/* 1. SINGLE UNIFIED MOBILE NAVIGATION (Mobile only: top header + bottom docked tabs + drawer) */}
      <AuthenticatedMobileNav currentMode="organizer" />

      {/* 2. DESKTOP PERMANENT SIDEBAR (Desktop md+ screens only) */}
      <aside className="hidden md:flex flex-col justify-between w-72 bg-white dark:bg-[#0F0F14] border-r border-[#E5E7EB] dark:border-white/10 p-5 h-screen sticky top-0 flex-shrink-0 z-30 transition-colors">
        <div className="space-y-5 overflow-y-auto pr-1">
          {/* Brand Logo & Role Badge */}
          <div className="px-2 pt-1 pb-1 flex items-center justify-between">
            <Logo to="/organizer" size="md" />
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${roleBadgeStyles[role] || 'bg-zinc-100 dark:bg-white/10 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-white/10'}`}>
              {role}
            </span>
          </div>

          {/* Switch to Attendee Account Button */}
          <Link
            to="/dashboard"
            className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 dark:bg-white/5 hover:bg-zinc-100/90 dark:hover:bg-white/10 border border-zinc-200/80 dark:border-white/10 text-zinc-900 dark:text-white transition-all group cursor-pointer shadow-2xs"
            title="Switch to personal attendee account (tickets & favorites)"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-500/10 text-[#E31B23] flex items-center justify-center font-bold flex-shrink-0">
                <Ticket className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-zinc-950 dark:text-white flex items-center gap-1.5 leading-tight">
                  Attendee Account
                </p>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">Tickets, saves & orders</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-950 dark:group-hover:text-white group-hover:translate-x-0.5 transition-all flex-shrink-0" />
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = item.end
                ? location.pathname === item.to
                : location.pathname.startsWith(item.to);

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={
                    isActive
                      ? 'flex items-center gap-3 px-4 py-3 rounded-xl bg-[#E31B23] text-white font-bold text-sm shadow-xs transition-all'
                      : 'flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-white/5 font-semibold text-sm transition-colors'
                  }
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Callout: Public Marketplace + Sign Out */}
        <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-white/10">
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-200/70 dark:border-white/10 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-950 dark:text-white">
                <Compass className="w-4 h-4 text-[#E31B23]" />
                <span>Public Marketplace</span>
              </div>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
              Explore public event listings and trending experiences.
            </p>
            <Link
              to="/discover"
              className="block text-center py-2 bg-white dark:bg-[#070709] hover:bg-zinc-100 dark:hover:bg-white/5 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white text-xs font-bold rounded-xl shadow-2xs transition-all"
            >
              Explore Events &rarr;
            </Link>
          </div>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 border border-zinc-200/80 dark:border-white/10 transition-all cursor-pointer"
          >
            <span className="flex items-center gap-2">
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-500" />}
              <span>{isDark ? 'Light Appearance' : 'Dark Appearance'}</span>
            </span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-zinc-200/80 dark:bg-white/10 text-zinc-600 dark:text-zinc-400">
              {isDark ? 'Dark' : 'Light'}
            </span>
          </button>

          {/* Sign Out Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-zinc-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 transition-colors w-full cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* 3. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop Top Header Bar */}
        <header className="hidden md:flex h-16 bg-white/95 dark:bg-[#0F0F14]/95 backdrop-blur-md border-b border-[#E5E7EB] dark:border-white/10 items-center justify-between px-8 sticky top-0 z-20 shadow-2xs transition-colors">
          {/* Quick Search */}
          <div className="relative w-80">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search events, orders, or attendees..."
              className="w-full bg-[#F8F9FB] dark:bg-[#070709] border border-zinc-200/80 dark:border-white/10 rounded-full pl-9 pr-4 py-2 text-xs text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 outline-none focus:border-[#E31B23] transition-all font-medium"
            />
          </div>

          {/* Right Profile, Notifications & Action Buttons */}
          <div className="flex items-center gap-3.5">
            {/* Theme Mode Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer border ${
                isDark
                  ? 'bg-white/5 hover:bg-white/10 text-amber-300 border-white/15'
                  : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border-zinc-200'
              }`}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme mode"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Explore Link */}
            <Link
              to="/discover"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors"
            >
              <Compass className="w-3.5 h-3.5 text-[#E31B23]" />
              <span>Explore</span>
            </Link>

            {/* Notification Bell */}
            <button
              className="relative w-9 h-9 rounded-full flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#E31B23]" />
            </button>

            {/* Create Event CTA */}
            {perms.canCreateEvents && (
              <Link to="/organizer/events/create">
                <button className="inline-flex items-center gap-2 px-4 py-2 bg-[#E31B23] hover:bg-[#B91C1C] text-white text-xs font-black rounded-full transition-all shadow-xs cursor-pointer">
                  <PlusCircle className="w-4 h-4" />
                  <span>Create Event</span>
                </button>
              </Link>
            )}

            {/* Profile Avatar & Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdown(!userDropdown)}
                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-zinc-50 dark:hover:bg-white/5 border border-transparent hover:border-zinc-200 dark:hover:border-white/10 transition-all cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-zinc-900 text-white font-black text-xs flex items-center justify-center shadow-2xs overflow-hidden">
                  {getOrganizerLogo(organizer) ? (
                    <img 
                      src={getOrganizerLogo(organizer)} 
                      alt={organizer?.name || 'Organizer'} 
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                      }}
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    user?.firstName?.[0] || 'O'
                  )}
                </div>
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  {user ? `${user.firstName} ${user.lastName?.[0] ? user.lastName[0] + '.' : ''}` : 'Organizer'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              {userDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#0F0F14] rounded-2xl shadow-xl border border-zinc-150 dark:border-white/10 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-4 py-2 border-b border-zinc-100 dark:border-white/10">
                    <p className="text-xs font-bold text-zinc-950 dark:text-white truncate">
                      {user?.firstName || 'Organizer'} {user?.lastName || ''}
                    </p>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate">{user?.email}</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wide border ${roleBadgeStyles[role] || 'bg-zinc-100 dark:bg-white/10 text-zinc-700 dark:text-zinc-300'}`}>
                      {isOrganization ? `Org • ${role}` : role}
                    </span>
                  </div>
                  <div className="py-1">
                    <Link
                      to="/organizer"
                      onClick={() => setUserDropdown(false)}
                      className="block px-4 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/5 hover:text-[#E31B23]"
                    >
                      Console Dashboard
                    </Link>
                    <Link
                      to="/organizer/events"
                      onClick={() => setUserDropdown(false)}
                      className="block px-4 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/5 hover:text-[#E31B23]"
                    >
                      {role === 'staff' ? 'Assigned Events' : 'My Events'}
                    </Link>
                    {perms.canViewOrders && (
                      <Link
                        to="/organizer/orders"
                        onClick={() => setUserDropdown(false)}
                        className="block px-4 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/5 hover:text-[#E31B23]"
                      >
                        Orders & Sales
                      </Link>
                    )}
                    {isOrganization && perms.canManageTeam && (
                      <Link
                        to="/organizer/team"
                        onClick={() => setUserDropdown(false)}
                        className="block px-4 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/5 hover:text-[#E31B23]"
                      >
                        Team Members
                      </Link>
                    )}
                    {perms.canViewFinanceWallet && (
                      <Link
                        to="/organizer/analytics"
                        onClick={() => setUserDropdown(false)}
                        className="block px-4 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/5 hover:text-[#E31B23]"
                      >
                        Finance & Wallet
                      </Link>
                    )}
                    {perms.canEditOrganizerProfile && (
                      <Link
                        to="/organizer/profile"
                        onClick={() => setUserDropdown(false)}
                        className="block px-4 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/5 hover:text-[#E31B23]"
                      >
                        Organizer Profile
                      </Link>
                    )}
                    {perms.canAccessSettings && (
                      <Link
                        to="/organizer/settings"
                        onClick={() => setUserDropdown(false)}
                        className="block px-4 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/5 hover:text-[#E31B23]"
                      >
                        {role === 'staff' ? 'Staff Settings' : 'Console Settings'}
                      </Link>
                    )}
                  </div>

                  {/* Switch to Attendee Account */}
                  <div className="border-t border-zinc-100 dark:border-white/10 pt-1">
                    <Link
                      to="/dashboard"
                      onClick={() => setUserDropdown(false)}
                      className="flex items-center justify-between px-4 py-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-white/5 hover:text-[#E31B23] transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Ticket className="w-3.5 h-3.5 text-[#E31B23]" />
                        <span>Attendee Account</span>
                      </span>
                      <ArrowRight className="w-3 h-3 text-zinc-400" />
                    </Link>
                  </div>

                  <div className="border-t border-zinc-100 dark:border-white/10 pt-1">
                    <button
                      onClick={() => {
                        setUserDropdown(false);
                        handleLogout();
                      }}
                      className="w-full text-left px-4 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Children Container */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto pb-24 md:pb-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default OrganizerDashboardLayout;
