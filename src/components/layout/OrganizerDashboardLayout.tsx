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
  PlusCircle,
  ChevronDown,
  Compass,
  Ticket,
  ArrowRight,
  Building2,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Logo } from '../ui/Logo';
import { AuthenticatedMobileNav } from './AuthenticatedMobileNav';
import { resolveOrganizerRole, getRolePermissions } from '../../utils/permissions';
import { useCan } from '../../hooks/useCan';
import { getOrganizerLogo } from '../../utils/imageUrl';
import { NotificationBell } from '../common/NotificationBell';

interface OrganizerDashboardLayoutProps {
  children: React.ReactNode;
}

export const OrganizerDashboardLayout: React.FC<OrganizerDashboardLayoutProps> = ({ children }) => {
  const { user, organizer, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { can } = useCan();
  const navigate = useNavigate();
  const location = useLocation();
  const [userDropdown, setUserDropdown] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

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
    ...(can(['org.attendees.view', 'org.events.view']) && perms.canViewOrders
      ? [{ to: '/organizer/orders', label: 'Orders & Sales', icon: ShoppingBag }]
      : []),
    ...(can('org.members.view') && perms.canManageTeam
      ? [{ to: '/organizer/team', label: 'Team Members', icon: Users }]
      : []),
    ...(can('org.finance.view') && perms.canViewFinanceWallet
      ? [{ to: '/organizer/analytics', label: 'Finance & Wallet', icon: Wallet }]
      : []),
    ...(can(['org.finance.view', 'org.credits.manage']) && perms.canViewFinanceWallet
      ? [{ to: '/organizer/credits', label: 'Credits & Billing', icon: Coins }]
      : []),
    ...(can('org.view') && perms.canEditOrganizerProfile
      ? [{ to: '/organizer/profile', label: 'Organizer Profile', icon: User }]
      : []),
    ...(perms.canAccessSettings
      ? [{ to: '/organizer/settings', label: role === 'staff' ? 'Staff Settings' : 'Settings', icon: Settings }]
      : []),
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FB] dark:bg-[#070709] flex flex-col md:flex-row text-[#111827] dark:text-white transition-colors">
      {/* 1. SINGLE UNIFIED MOBILE NAVIGATION (Mobile only: top header + bottom docked tabs + drawer) */}
      <AuthenticatedMobileNav currentMode="organizer" />

      {/* 2. DESKTOP PERMANENT SIDEBAR (Desktop md+ screens only) */}
      <aside className="hidden md:flex flex-col justify-between w-64 bg-white dark:bg-[#0F0F14] border-r border-zinc-200/80 dark:border-white/10 p-4 h-screen sticky top-0 flex-shrink-0 z-30 transition-colors">
        <div className="space-y-4 overflow-y-auto pr-0.5">
          {/* Brand Logo */}
          <div className="px-2 pt-1 pb-1 flex items-center justify-between">
            <Logo to="/organizer" size="md" />
          </div>

          {/* Organization Workspace Card */}
          {organizer && (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200/70 dark:border-white/10">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-black text-xs flex items-center justify-center flex-shrink-0 overflow-hidden">
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
                    organizer?.name?.[0] || 'O'
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-zinc-950 dark:text-white truncate">
                    {organizer?.name || 'My Organization'}
                  </p>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold capitalize truncate">
                    {organizer?.role_label || role}
                  </p>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider border shrink-0 ${roleBadgeStyles[role] || 'bg-zinc-100 dark:bg-white/10 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-white/10'}`}>
                {role}
              </span>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="space-y-1 pt-1">
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
                      ? 'flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-[#E31B23] text-white font-bold text-xs shadow-xs transition-all'
                      : 'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100/70 dark:hover:bg-white/5 font-semibold text-xs transition-colors'
                  }
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Minimal Sidebar Footer: Mode Switch & Sign Out */}
        <div className="space-y-1.5 pt-3 border-t border-zinc-100 dark:border-white/10">
          <Link
            to="/dashboard"
            className="flex items-center justify-between px-3 py-2 rounded-xl bg-zinc-50 dark:bg-white/[0.03] hover:bg-zinc-100 dark:hover:bg-white/[0.07] border border-zinc-200/70 dark:border-white/10 text-xs font-bold text-zinc-700 dark:text-zinc-300 transition-all group"
          >
            <span className="flex items-center gap-2 truncate">
              <Ticket className="w-3.5 h-3.5 text-[#E31B23] shrink-0" />
              <span className="truncate">Attendee Mode</span>
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </Link>

          <Link
            to="/discover"
            className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-white/5 text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            <span className="flex items-center gap-2 truncate">
              <Compass className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span className="truncate">Explore Events</span>
            </span>
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-950/20 transition-colors w-full cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* 3. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop Top Header Bar */}
        <header className="hidden md:flex h-16 bg-white/95 dark:bg-[#0F0F14]/95 backdrop-blur-md border-b border-zinc-200/80 dark:border-white/10 items-center justify-between px-8 sticky top-0 z-20 transition-colors">
          {/* Workspace Context */}
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 dark:text-zinc-400">
            <Building2 className="w-4 h-4 text-[#E31B23]" />
            <span className="text-zinc-900 dark:text-white">{organizer?.name || 'Organizer Workspace'}</span>
          </div>

          {/* Right Profile, Notifications & Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Theme Mode Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer border ${
                isDark
                  ? 'bg-white/5 hover:bg-white/10 text-amber-300 border-white/10'
                  : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200/80'
              }`}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme mode"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Notification Bell */}
            <NotificationBell
              className="w-9 h-9 rounded-xl border border-zinc-200/80 dark:border-white/10 bg-zinc-50 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10"
              iconClassName="w-4 h-4"
            />

            {/* Create Event CTA */}
            {perms.canCreateEvents && (
              <Link to="/organizer/events/create">
                <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#E31B23] hover:bg-[#B91C1C] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer">
                  <PlusCircle className="w-4 h-4" />
                  <span>Create Event</span>
                </button>
              </Link>
            )}

            {/* Profile Avatar & Dropdown */}
            <div className="relative pl-1 border-l border-zinc-200/80 dark:border-white/10">
              <button
                onClick={() => setUserDropdown(!userDropdown)}
                className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-xl hover:bg-zinc-50 dark:hover:bg-white/5 border border-transparent hover:border-zinc-200/80 dark:hover:border-white/10 transition-all cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 font-black text-xs flex items-center justify-center shadow-2xs overflow-hidden">
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
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#0F0F14] rounded-2xl shadow-xl border border-zinc-200/80 dark:border-white/10 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-4 py-2.5 border-b border-zinc-100 dark:border-white/10">
                    <p className="text-xs font-bold text-zinc-950 dark:text-white truncate">
                      {user?.firstName || 'Organizer'} {user?.lastName || ''}
                    </p>
                    <p className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate mt-0.5">{user?.email}</p>
                  </div>

                  <div className="py-1">
                    {perms.canEditOrganizerProfile && (
                      <Link
                        to="/organizer/profile"
                        onClick={() => setUserDropdown(false)}
                        className="block px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/5 hover:text-[#E31B23]"
                      >
                        Organization Profile
                      </Link>
                    )}
                    {perms.canAccessSettings && (
                      <Link
                        to="/organizer/settings"
                        onClick={() => setUserDropdown(false)}
                        className="block px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/5 hover:text-[#E31B23]"
                      >
                        {role === 'staff' ? 'Staff Settings' : 'Console Settings'}
                      </Link>
                    )}
                    <Link
                      to="/dashboard"
                      onClick={() => setUserDropdown(false)}
                      className="flex items-center justify-between px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/5 hover:text-[#E31B23] transition-colors"
                    >
                      <span>Switch to Attendee</span>
                      <ArrowRight className="w-3 h-3 text-zinc-400" />
                    </Link>
                  </div>

                  <div className="border-t border-zinc-100 dark:border-white/10 pt-1">
                    <button
                      onClick={() => {
                        setUserDropdown(false);
                        handleLogout();
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer"
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
