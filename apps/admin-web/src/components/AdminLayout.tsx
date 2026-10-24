import React, { useState } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShieldCheck,
  Flag,
  Users,
  Calendar,
  Layers,
  Settings,
  LogOut,
  Bell,
  Search,
  ExternalLink,
  ChevronDown,
  Terminal,
  Activity,
  AlertTriangle,
  Lock,
  Cpu,
  ShoppingBag,
  Ticket,
  RotateCcw,
  Banknote,
  LifeBuoy,
  Mail,
  FileSpreadsheet,
  ShieldAlert,
  Megaphone
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { admin, logout, switchRole } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);

  const navItems = [
    { to: '/', label: 'Operations Overview', icon: LayoutDashboard, end: true },
    { to: '/orders', label: 'Orders & Transactions', icon: ShoppingBag },
    { to: '/tickets', label: 'Ticketing Desk', icon: Ticket },
    { to: '/refunds', label: 'Refunds & Disputes', icon: RotateCcw, badge: '1' },
    { to: '/payouts', label: 'Organizer Payouts', icon: Banknote, badge: '1' },
    { to: '/verifications', label: 'KYC & Verifications', icon: ShieldCheck, badge: '6' },
    { to: '/events', label: 'Events Moderation', icon: Calendar, badge: '2' },
    { to: '/users', label: 'Accounts & Organizers', icon: Users },
    { to: '/fraud-monitoring', label: 'Fraud & Risk Watchtower', icon: ShieldAlert, badge: 'ALERT' },
    { to: '/support', label: 'Support & Incidents', icon: LifeBuoy, badge: '2' },
    { to: '/communications', label: 'Communications & Logs', icon: Mail },
    { to: '/announcements', label: 'Announcements & Broadcasts', icon: Megaphone },
    { to: '/reports', label: 'Data Reports & Exports', icon: FileSpreadsheet },
    { to: '/extensions', label: 'Extensions & Health', icon: Activity, badge: 'LIVE' },
    { to: '/feature-flags', label: 'Feature Flags & System', icon: Flag },
    { to: '/audit-logs', label: 'Security & Audit Logs', icon: Terminal },
    { to: '/settings', label: 'Platform Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col md:flex-row antialiased selection:bg-rose-500 selection:text-white">
      {/* 1. LEFT SIDEBAR */}
      <aside className="w-full md:w-72 bg-zinc-950 border-r border-zinc-900 flex flex-col justify-between p-5 md:h-screen md:sticky md:top-0 z-30 flex-shrink-0">
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="flex items-center justify-between px-2 pt-1 pb-1">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-red-500 flex items-center justify-center text-white font-black shadow-lg shadow-rose-950/40">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-sm tracking-tight text-white group-hover:text-rose-400 transition-colors">
                    EventsOS
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    CONSOLE
                  </span>
                </div>
                <span className="text-[10px] text-zinc-500 font-mono block">Platform Kernel v2.4</span>
              </div>
            </Link>
          </div>

          {/* Quick System Health Pill */}
          <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-zinc-300 text-[11px]">System Cluster Healthy</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">12ms</span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-3 block mb-2">
              Command Modules
            </span>
            {navItems.map((item) => {
              const Icon = item.icon;
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
                      ? 'flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600/20 to-zinc-900 text-rose-300 font-bold text-xs border border-rose-500/30 shadow-xs'
                      : 'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/80 font-medium text-xs transition-colors'
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-rose-400' : 'text-zinc-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Area */}
        <div className="space-y-3 pt-4 border-t border-zinc-900">
          <div className="p-3 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-rose-950 text-rose-300 border border-rose-800/60 flex items-center justify-center font-black text-xs flex-shrink-0">
                {admin?.name?.charAt(0) || 'A'}
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-white block truncate">{admin?.name || 'Admin'}</span>
                <span className="text-[10px] font-mono text-zinc-400 block truncate">{admin?.email || 'admin@internal'}</span>
              </div>
            </div>

            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              title="Sign Out of Console"
              className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Operational Bar */}
        <header className="h-16 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-900 flex items-center justify-between px-6 sm:px-8 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-zinc-400">Environment:</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              PRODUCTION LIVE
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick RBAC Role Switcher */}
            <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1">
              <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
              <span className="text-[10px] text-zinc-500 font-bold uppercase">Role:</span>
              <select
                value={admin?.role || 'super_admin'}
                onChange={(e) => switchRole(e.target.value as any)}
                className="bg-transparent text-white text-[11px] font-bold focus:outline-hidden cursor-pointer"
              >
                <option value="super_admin" className="bg-zinc-900 text-white">Super Administrator</option>
                <option value="finance_admin" className="bg-zinc-900 text-white">Finance Administrator</option>
                <option value="trust_and_safety" className="bg-zinc-900 text-white">Trust & Safety</option>
                <option value="kyc_reviewer" className="bg-zinc-900 text-white">KYC Reviewer</option>
                <option value="support_agent" className="bg-zinc-900 text-white">Support Agent</option>
                <option value="read_only_analyst" className="bg-zinc-900 text-white">Read-Only Analyst</option>
              </select>
            </div>

            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-bold text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-zinc-900 border border-zinc-800"
            >
              <span>View Main App</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
              <Bell className="w-4 h-4" />
            </div>
          </div>
        </header>

        {/* Dynamic Page Views */}
        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto pb-20">
          {children}
        </main>
      </div>
    </div>
  );
};
