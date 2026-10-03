import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Ticket, Heart, User, LogOut, Compass, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Navbar from './Navbar';
import { AuthenticatedMobileNav } from './AuthenticatedMobileNav';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const menuItems = [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/dashboard/tickets', label: 'My Tickets', icon: Ticket },
    { to: '/dashboard/favorites', label: 'Favorites', icon: Heart },
    { to: '/dashboard/profile', label: 'Profile', icon: User },
    { to: '/dashboard/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex flex-col text-[#111827]">
      {/* 1. SINGLE UNIFIED MOBILE NAVIGATION (Mobile only: single top bar + bottom tabs + drawer) */}
      <AuthenticatedMobileNav currentMode="attendee" />

      {/* 2. DESKTOP TOP NAVBAR (Desktop only) */}
      <div className="hidden lg:block">
        <Navbar isDashboard={true} />
      </div>
      
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 lg:py-10 flex flex-col lg:flex-row gap-8 items-start pb-24 lg:pb-12">
        
        {/* Desktop Sidebar Only (Hidden on Mobile to eliminate duplication) */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="bg-white border border-[#E5E7EB] rounded-3xl p-5 shadow-xs space-y-6 sticky top-24">
            
            {/* User Meta Card */}
            <div className="flex items-center gap-3 pb-4 border-b border-zinc-100">
              <div className="w-12 h-12 rounded-2xl bg-[#FEF2F2] text-[#E31B23] font-black text-base flex items-center justify-center border border-[#FEE2E2]">
                {user?.firstName?.[0] || 'K'}
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-zinc-950 truncate">
                  {user?.firstName || 'Kelvin'} {user?.lastName || 'O.'}
                </h4>
                <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wide">
                  Attendee Account
                </p>
              </div>
            </div>

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
                        : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950 font-semibold'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>

            {/* Quick Explore Link & Sign Out */}
            <div className="pt-4 border-t border-zinc-100 space-y-3">
              <Link
                to="/discover"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50 hover:bg-zinc-100/80 border border-zinc-200/60 text-xs font-bold text-zinc-800 transition-all group"
              >
                <span className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[#E31B23]" />
                  <span>Explore Events</span>
                </span>
                <span className="text-zinc-400 group-hover:translate-x-0.5 transition-transform">&rarr;</span>
              </Link>

              {/* Sign Out */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-zinc-400 hover:text-red-600 transition-colors w-full cursor-pointer"
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
    </div>
  );
};

export default DashboardLayout;
