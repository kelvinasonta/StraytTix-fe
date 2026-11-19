import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Ticket, Heart, User, LogOut, Compass, Sun, Moon, Building2, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Navbar from './Navbar';
import { AuthenticatedMobileNav } from './AuthenticatedMobileNav';
import { BecomeOrganizerModal } from '../organizer/BecomeOrganizerModal';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, organizer, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isBecomeOrganizerOpen, setIsBecomeOrganizerOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const menuItems = [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/dashboard/tickets', label: 'My Tickets', icon: Ticket },
    { to: '/dashboard/favorites', label: 'Favorites', icon: Heart },
    { to: '/dashboard/settings', label: 'Profile & Settings', icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FB] dark:bg-[#070709] flex flex-col text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
      {/* 1. SINGLE UNIFIED MOBILE NAVIGATION (Mobile only: single top bar + bottom tabs + drawer) */}
      <AuthenticatedMobileNav currentMode="attendee" />

      {/* 2. DESKTOP TOP NAVBAR (Desktop only) */}
      <div className="hidden lg:block">
        <Navbar isDashboard={true} />
      </div>
      
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 lg:py-10 flex flex-col lg:flex-row gap-8 items-start pb-24 lg:pb-12">
        
        {/* Desktop Sidebar Only (Hidden on Mobile to eliminate duplication) */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="bg-white dark:bg-[#0F0F14] border border-[#E5E7EB] dark:border-white/10 rounded-3xl p-5 shadow-xs space-y-6 sticky top-24 transition-colors">
            
            {/* User Meta Card */}
            <Link 
              to="/dashboard/settings" 
              className="flex items-center gap-3 pb-4 border-b border-zinc-100 dark:border-white/10 hover:opacity-85 transition-opacity group"
              title="Manage profile & settings"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#E31B23]/10 dark:bg-[#E31B23]/20 text-[#E31B23] font-black text-base flex items-center justify-center border border-[#E31B23]/20 flex-shrink-0 select-none shadow-xs">
                <span>{user?.firstName?.[0] || 'A'}</span>
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-zinc-950 dark:text-white truncate group-hover:text-[#E31B23] transition-colors">
                  {user?.firstName || 'Attendee'} {user?.lastName || ''}
                </h4>
                <p className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide">
                  Attendee Mode
                </p>
              </div>
            </Link>

            {/* Menu Links */}
            <nav className="space-y-1.5">
              {menuItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-all ${
                      isActive 
                        ? 'bg-[#E31B23] text-white shadow-xs' 
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-white/5 hover:text-zinc-950 dark:hover:text-white font-semibold'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>

            {/* Mode Switcher: Organizer Console vs Become an Organizer */}
            <div className="pt-4 border-t border-zinc-100 dark:border-white/10 space-y-3">
              {organizer ? (
                <Link
                  to="/organizer"
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-[#E31B23]/10 hover:bg-[#E31B23]/15 border border-[#E31B23]/25 text-xs font-bold text-[#E31B23] transition-all group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Building2 className="w-4 h-4 shrink-0" />
                    <div className="min-w-0">
                      <span className="block text-[10px] uppercase tracking-wider opacity-80">Switch Workspace</span>
                      <span className="block truncate text-zinc-900 dark:text-white">Organizer Console</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsBecomeOrganizerOpen(true)}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-br from-[#E31B23]/10 via-[#E31B23]/5 to-transparent hover:from-[#E31B23]/15 border border-[#E31B23]/25 text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-[#E31B23] text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-xs font-bold text-zinc-900 dark:text-white">Become an Organizer</span>
                      <span className="block text-[10px] text-zinc-500 dark:text-zinc-400 truncate">Host events & sell tickets</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#E31B23] shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </button>
              )}

              <Link
                to="/discover"
                className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 dark:bg-white/5 hover:bg-zinc-100/80 dark:hover:bg-white/10 border border-zinc-200/60 dark:border-white/10 text-xs font-bold text-zinc-800 dark:text-zinc-200 transition-all group"
              >
                <span className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[#E31B23]" />
                  <span>Explore & Buy Tickets</span>
                </span>
                <span className="text-zinc-400 dark:text-zinc-500 group-hover:translate-x-0.5 transition-transform">&rarr;</span>
              </Link>

              {/* Sign Out */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-zinc-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 transition-colors w-full cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Content Body */}
        <main className="flex-1 min-w-0 w-full">
          {children}
        </main>
      </div>

      <BecomeOrganizerModal
        isOpen={isBecomeOrganizerOpen}
        onClose={() => setIsBecomeOrganizerOpen(false)}
      />
    </div>
  );
};

export default DashboardLayout;
