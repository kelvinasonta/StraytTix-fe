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
  SlidersHorizontal,
  LogOut,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/admin', end: true, label: 'Platform KPIs', icon: LayoutDashboard },
    { to: '/admin/organizers', label: 'Tenants & KYC', icon: Building2 },
    { to: '/admin/users', label: 'User Governance', icon: Users },
    { to: '/admin/events', label: 'Event Moderation', icon: CalendarDays },
    { to: '/admin/finance', label: 'Settlements & Orders', icon: BadgeDollarSign },
    { to: '/admin/verifications', label: 'KYC Verification Queue', icon: FileCheck2 },
    { to: '/admin/settings', label: 'System Settings', icon: SlidersHorizontal },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      {/* Top Warning Strip */}
      <div className="bg-rose-950/80 border-b border-rose-800/40 px-4 py-1.5 text-xs text-rose-300 flex items-center justify-between">
        <div className="flex items-center gap-2 font-mono">
          <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          <span>EVENTSOS ADMINISTRATIVE GOVERNANCE CONSOLE — RESTRICTED ACCESS</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-rose-900/60 text-rose-200 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">
            {(user as any)?.admin_role || 'ADMIN'}
          </span>
          <span className="text-slate-400 text-[11px] font-mono">{user?.email}</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Admin Sidebar */}
        <aside className="w-64 bg-slate-900/90 border-r border-slate-800/80 flex flex-col justify-between p-4 shrink-0">
          <div className="space-y-6">
            <div className="flex items-center gap-3 px-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-600 flex items-center justify-center font-black text-white shadow-lg shadow-rose-950/50">
                OS
              </div>
              <div>
                <h1 className="font-bold text-sm tracking-tight text-white">EventsOS Admin</h1>
                <p className="text-[11px] text-slate-400 font-mono">v1.0.0 Enterprise</p>
              </div>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-rose-600 text-white font-semibold shadow-md shadow-rose-950/50'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <div className="pt-4 border-t border-slate-800/80 space-y-2">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to App Portal</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-400 hover:bg-rose-950/40 rounded-xl transition-colors font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out Admin</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-950 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

