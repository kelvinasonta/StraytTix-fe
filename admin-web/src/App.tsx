import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import { AdminLayout } from './components/AdminLayout';

// Admin Pages
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { OrganizersList } from './pages/OrganizersList';
import { UsersGovernance } from './pages/UsersGovernance';
import { EventsModeration } from './pages/EventsModeration';
import { FinanceSettlement } from './pages/FinanceSettlement';
import { RefundsDisputes } from './pages/RefundsDisputes';
import { VerificationQueue } from './pages/VerificationQueue';
import { FraudMonitoring } from './pages/FraudMonitoring';
import { FeatureFlags } from './pages/FeatureFlags';
import { AuditLogs } from './pages/AuditLogs';
import { SupportHelpdesk } from './pages/SupportHelpdesk';
import { SystemCommunications } from './pages/SystemCommunications';
import { SiteSettings } from './pages/SiteSettings';
import { AdminSettings } from './pages/AdminSettings';

const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-3 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-zinc-500 text-xs font-mono tracking-wider uppercase">Loading Admin Console...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AdminAuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<AdminLogin />} />

          <Route
            path="/"
            element={
              <ProtectedAdminRoute>
                <AdminLayout />
              </ProtectedAdminRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="events" element={<EventsModeration />} />
            <Route path="organizers" element={<OrganizersList />} />
            <Route path="users" element={<UsersGovernance />} />
            <Route path="finance" element={<FinanceSettlement />} />
            <Route path="refunds" element={<RefundsDisputes />} />
            <Route path="verifications" element={<VerificationQueue />} />
            <Route path="fraud" element={<FraudMonitoring />} />
            <Route path="feature-flags" element={<FeatureFlags />} />
            <Route path="audit-logs" element={<AuditLogs />} />
            <Route path="support" element={<SupportHelpdesk />} />
            <Route path="communications" element={<SystemCommunications />} />
            <Route path="site-settings" element={<SiteSettings />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AdminAuthProvider>
  );
};

export default App;
