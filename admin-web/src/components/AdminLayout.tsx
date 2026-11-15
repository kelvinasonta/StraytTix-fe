import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  LayoutDashboard, 
  Building2, 
  Users, 
  CalendarDays, 
  BadgeDollarSign, 
  FileCheck2, 
  Flag,
  SlidersHorizontal,
  LogOut,
  ExternalLink,
  RotateCcw,
  ShieldCheck,
  LifeBuoy,
  Megaphone,
  Globe,
  Flame,
  Activity
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
  };

  const navGroups = [
    {
      group: 'Core Platform',
      items: [
        { label: 'Overview & Velocity', to: '/', icon: LayoutDashboard, end: true },
        { label: 'Events Moderation', to: '/events', icon: CalendarDays },
        { label: 'Organizers & Tenants', to: '/organizers', icon: Building2 },
        { label: 'Users Governance', to: '/users', icon: Users },
      ],
    },
    {
      group: 'Fintech & Settlement',
      items: [
        { label: 'Finance & Payouts', to: '/finance', icon: BadgeDollarSign },
        { label: 'Refunds & Disputes', to: '/refunds', icon: RotateCcw },
        { label: 'KYC Verifications', to: '/verifications', icon: FileCheck2 },
      ],
    },
    {
      group: 'Security & Integrity',
      items: [
        { label: 'Fraud Sentinel', to: '/fraud', icon: Flame },
        { label: 'Pennant Feature Flags', to: '/feature-flags', icon: Flag },
        { label: 'Immutable Audit Trail', to: '/audit-logs', icon: ShieldAlert },
      ],
    },
    {
      group: 'Administration & System',
      items: [
        { label: 'Support Helpdesk', to: '/support', icon: LifeBuoy },
        { label: 'Global Communications', to: '/communications', icon: Megaphone },
        { label: 'Site Identity & SEO', to: '/site-settings', icon: Globe },
        { label: 'Platform Fee Engine', to: '/settings', icon: SlidersHorizontal },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-zinc-850 bg-zinc-900/40 backdrop-blur-xl flex flex-col justify-between shrink-0 h-screen sticky top-0">
        <div className="overflow-y-auto">
          {/* Top Admin Branding */}
          <div className="p-5 border-b border-zinc-800/60 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-rose-400 flex items-center justify-center text-white shadow-lg shadow-rose-600/30 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
                <span className="truncate">EventsOS</span>
                <span className="text-[10px] font-mono uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20 px-1.5 py-0.5 rounded-full font-semibold">Admin</span>
              </div>
              <p className="text-[11px] text-zinc-400 font-medium truncate">Enterprise Governance</p>
            </div>
          </div>

          {/* Quick link to main platform */}
          <div className="px-4 pt-3 pb-1">
            <a 
              href="http://localhost:3000" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center justify-between px-3 py-2 text-xs font-medium text-zinc-400 hover:text-white bg-zinc-950/60 hover:bg-zinc-800/60 border border-zinc-800/60 rounded-xl transition"
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Main Portal (3000)</span>
              </span>
              <ExternalLink className="w-3.5 h-3.5 opacity-60" />
            </a>
          </div>

          {/* Navigation Groups */}
          <nav className="p-3 space-y-5">
            {navGroups.map((grp) => (
              <div key={grp.group} className="space-y-1">
                <h4 className="px-3 text-[10px] font-mono uppercase text-zinc-500 font-bold tracking-wider">
                  {grp.group}
                </h4>
                <div className="space-y-0.5">
                  {grp.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        className={({ isActive }) =>
                          `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                            isActive
                              ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30 shadow-xs'
                              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 border border-transparent'
                          }`
                        }
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* User Info & Logout Footer */}
        <div className="p-4 border-t border-zinc-850/80 bg-zinc-950/60 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-[10px] text-zinc-400 font-mono truncate">{user?.email}</p>
              <div className="mt-1 flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span className="text-[10px] font-mono uppercase text-zinc-400 font-semibold tracking-wider">
                  {user?.admin_role || 'Superadmin'}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out of Admin Console"
              className="p-2 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-zinc-950 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
};
