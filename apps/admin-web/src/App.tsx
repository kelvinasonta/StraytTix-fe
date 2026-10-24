import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import { OverviewPage } from './pages/OverviewPage';
import { VerificationsPage } from './pages/VerificationsPage';
import { FeatureFlagsPage } from './pages/FeatureFlagsPage';
import { UsersPage } from './pages/UsersPage';
import { EventsModerationPage } from './pages/EventsModerationPage';
import { OrdersPage } from './pages/OrdersPage';
import { TicketsPage } from './pages/TicketsPage';
import { RefundsPage } from './pages/RefundsPage';
import { PayoutsPage } from './pages/PayoutsPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { ExtensionsPage } from './pages/ExtensionsPage';
import { SupportPage } from './pages/SupportPage';
import { CommunicationsPage } from './pages/CommunicationsPage';
import { FraudMonitoringPage } from './pages/FraudMonitoringPage';
import { ReportsPage } from './pages/ReportsPage';
import { AnnouncementsPage } from './pages/AnnouncementsPage';
import { LoginPage } from './pages/LoginPage';
import { AdminLayout } from './components/AdminLayout';
import { Settings } from 'lucide-react';

const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAdminAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const PlatformSettingsStub: React.FC = () => (
  <AdminLayout>
    <div className="space-y-6">
      <div className="border-b border-zinc-900 pb-5">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-rose-500" />
          <span>Platform Settings & Maintenance</span>
        </h1>
        <p className="text-xs text-zinc-400 mt-1">Global platform variables, marketplace take-rates, and security policies.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-2">
          <label className="font-bold text-white block">Platform Service Fee (Take Rate)</label>
          <input type="text" defaultValue="3.5% + ₦100" className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-mono" />
          <span className="text-zinc-500 text-[11px] block">Applied at attendee checkout</span>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-2">
          <label className="font-bold text-white block">SMS Notification Provider API Key</label>
          <input type="password" defaultValue="••••••••••••••••••••••••" className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-mono" />
          <span className="text-zinc-500 text-[11px] block">Termii / Twilio gateway integration</span>
        </div>
      </div>
    </div>
  </AdminLayout>
);

export const App: React.FC = () => {
  return (
    <AdminAuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ProtectedAdminRoute><OverviewPage /></ProtectedAdminRoute>} />
          <Route path="/orders" element={<ProtectedAdminRoute><OrdersPage /></ProtectedAdminRoute>} />
          <Route path="/tickets" element={<ProtectedAdminRoute><TicketsPage /></ProtectedAdminRoute>} />
          <Route path="/refunds" element={<ProtectedAdminRoute><RefundsPage /></ProtectedAdminRoute>} />
          <Route path="/payouts" element={<ProtectedAdminRoute><PayoutsPage /></ProtectedAdminRoute>} />
          <Route path="/verifications" element={<ProtectedAdminRoute><VerificationsPage /></ProtectedAdminRoute>} />
          <Route path="/events" element={<ProtectedAdminRoute><EventsModerationPage /></ProtectedAdminRoute>} />
          <Route path="/users" element={<ProtectedAdminRoute><UsersPage /></ProtectedAdminRoute>} />
          <Route path="/fraud-monitoring" element={<ProtectedAdminRoute><FraudMonitoringPage /></ProtectedAdminRoute>} />
          <Route path="/support" element={<ProtectedAdminRoute><SupportPage /></ProtectedAdminRoute>} />
          <Route path="/communications" element={<ProtectedAdminRoute><CommunicationsPage /></ProtectedAdminRoute>} />
          <Route path="/announcements" element={<ProtectedAdminRoute><AnnouncementsPage /></ProtectedAdminRoute>} />
          <Route path="/reports" element={<ProtectedAdminRoute><ReportsPage /></ProtectedAdminRoute>} />
          <Route path="/extensions" element={<ProtectedAdminRoute><ExtensionsPage /></ProtectedAdminRoute>} />
          <Route path="/feature-flags" element={<ProtectedAdminRoute><FeatureFlagsPage /></ProtectedAdminRoute>} />
          <Route path="/audit-logs" element={<ProtectedAdminRoute><AuditLogsPage /></ProtectedAdminRoute>} />
          <Route path="/settings" element={<ProtectedAdminRoute><PlatformSettingsStub /></ProtectedAdminRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AdminAuthProvider>
  );
};

export default App;

