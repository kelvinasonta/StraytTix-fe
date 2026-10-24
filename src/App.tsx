import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { NotificationProvider } from './context/NotificationContext';
import { SettingsProvider } from './context/SettingsContext';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { GuestRoute } from './routes/GuestRoute';
import { OrganizerRoute } from './routes/OrganizerRoute';

// Public pages
import { Home } from './pages/Home';
import { Discover } from './pages/Discover';
import { About } from './pages/About';
import { HowItWorks } from './pages/HowItWorks';
import { Pricing } from './pages/Pricing';
import { Blog } from './pages/Blog';
import { Terms } from './pages/Terms';
import { RefundPolicy } from './pages/RefundPolicy';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { ApiDocs } from './pages/ApiDocs';
import { Report } from './pages/Report';
import { EventDetails } from './pages/EventDetails';
import { EventTickets } from './pages/EventTickets';
import { OrganizerProfile } from './pages/OrganizerProfile';
import { DownloadApp } from './pages/DownloadApp';

// Auth pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { VerifyEmail } from './pages/auth/VerifyEmail';
import { VerificationPending } from './pages/auth/VerificationPending';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';
import { AcceptInvitation } from './pages/auth/AcceptInvitation';

// Customer Dashboard pages
import { Overview as CustomerOverview } from './pages/dashboard/Overview';
import { Tickets as CustomerTickets } from './pages/dashboard/Tickets';
import { Favorites as CustomerFavorites } from './pages/dashboard/Favorites';
import { Profile as CustomerProfile } from './pages/dashboard/Profile';
import { Settings as CustomerSettings } from './pages/dashboard/Settings';

// Organizer Dashboard pages
import { Overview as OrganizerOverview } from './pages/organizer/Overview';
import { Events as OrganizerEvents } from './pages/organizer/Events';
import { CreateEvent as OrganizerCreateEvent } from './pages/organizer/CreateEvent';
import { Orders as OrganizerOrders } from './pages/organizer/Orders';
import { Attendees as OrganizerAttendees } from './pages/organizer/Attendees';
import { Analytics as OrganizerAnalytics } from './pages/organizer/Analytics';
import { Profile as OrganizerProfileSettings } from './pages/organizer/Profile';
import { Settings as OrganizerSettings } from './pages/organizer/Settings';
import { TeamMembers as OrganizerTeamMembers } from './pages/organizer/TeamMembers';
import { EventManage as OrganizerEventManage } from './pages/organizer/EventManage';

import { PaymentCallback } from './pages/checkout/PaymentCallback';
import { CheckoutPage } from './pages/checkout/CheckoutPage';
import { NotFound } from './pages/NotFound';
import { ScrollToTop } from './components/layout/ScrollToTop';

const OrganizerEditRedirect: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={`/organizer/events/${id}`} replace />;
};

export const App: React.FC = () => {
  return (
    <NotificationProvider>
      <SettingsProvider>
        <AuthProvider>
          <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* Public Pages */}
            <Route path="/" element={<Home />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/about" element={<About />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/api-docs" element={<ApiDocs />} />
            <Route path="/docs" element={<ApiDocs />} />
            <Route path="/download" element={<DownloadApp />} />
            <Route path="/app" element={<DownloadApp />} />
            <Route path="/report" element={<Report />} />
            <Route path="/events/:slug" element={<EventDetails />} />
            <Route path="/events/:slug/tickets" element={<EventTickets />} />
            <Route path="/events/:slug/checkout" element={<CheckoutPage />} />
            <Route path="/checkout/:slug" element={<CheckoutPage />} />
            <Route path="/checkout/callback" element={<PaymentCallback />} />
            <Route path="/events/:slug/embed" element={<EventDetails />} />
            <Route path="/embed/events/:slug" element={<EventDetails />} />
            <Route path="/organizers/:slug" element={<OrganizerProfile />} />

            {/* Guest Only Routes */}
            <Route
              path="/login"
              element={
                <GuestRoute>
                  <Login />
                </GuestRoute>
              }
            />
            <Route
              path="/register"
              element={
                <GuestRoute>
                  <Register />
                </GuestRoute>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <GuestRoute>
                  <ForgotPassword />
                </GuestRoute>
              }
            />
            <Route
              path="/reset-password"
              element={
                <GuestRoute>
                  <ResetPassword />
                </GuestRoute>
              }
            />

            {/* Email Verification */}
            <Route path="/verify-email" element={<VerifyEmail />} />
            
            <Route
              path="/verify-email/pending"
              element={
                <ProtectedRoute>
                  <VerificationPending />
                </ProtectedRoute>
              }
            />

            {/* Team Staff Invitations */}
            <Route path="/invitations/accept" element={<AcceptInvitation />} />
            <Route path="/accept-invitation" element={<AcceptInvitation />} />

            {/* Payment Gateway Callbacks (Paystack / Stripe) */}
            <Route path="/checkout/callback" element={<PaymentCallback />} />
            <Route path="/orders/callback" element={<PaymentCallback />} />

            {/* Customer Protected Dashboard */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <CustomerOverview />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/tickets"
              element={
                <ProtectedRoute>
                  <CustomerTickets />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/favorites"
              element={
                <ProtectedRoute>
                  <CustomerFavorites />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/profile"
              element={
                <ProtectedRoute>
                  <CustomerProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/settings"
              element={
                <ProtectedRoute>
                  <CustomerSettings />
                </ProtectedRoute>
              }
            />

            {/* Organizer SaaS Dashboard */}
            <Route
              path="/organizer"
              element={
                <OrganizerRoute>
                  <OrganizerOverview />
                </OrganizerRoute>
              }
            />
            <Route
              path="/organizer/events"
              element={
                <OrganizerRoute>
                  <OrganizerEvents />
                </OrganizerRoute>
              }
            />
            <Route
              path="/organizer/events/:id"
              element={
                <OrganizerRoute>
                  <OrganizerEventManage />
                </OrganizerRoute>
              }
            />
            <Route
              path="/organizer/events/create"
              element={
                <OrganizerRoute requiredPermission="canCreateEvents">
                  <OrganizerCreateEvent />
                </OrganizerRoute>
              }
            />
            <Route
              path="/organizer/events/:id/edit"
              element={
                <OrganizerRoute requiredPermission="canCreateEvents">
                  <OrganizerEditRedirect />
                </OrganizerRoute>
              }
            />
            <Route
              path="/organizer/orders"
              element={
                <OrganizerRoute requiredPermission="canViewOrders">
                  <OrganizerOrders />
                </OrganizerRoute>
              }
            />
            <Route
              path="/organizer/attendees"
              element={
                <OrganizerRoute requiredPermission="canViewOrders">
                  <OrganizerAttendees />
                </OrganizerRoute>
              }
            />
            <Route
              path="/organizer/analytics"
              element={
                <OrganizerRoute requiredPermission="canViewRevenue">
                  <OrganizerAnalytics />
                </OrganizerRoute>
              }
            />
            <Route
              path="/organizer/finance"
              element={
                <OrganizerRoute requiredPermission="canViewRevenue">
                  <OrganizerAnalytics />
                </OrganizerRoute>
              }
            />
            <Route
              path="/organizer/wallet"
              element={
                <OrganizerRoute requiredPermission="canViewRevenue">
                  <OrganizerAnalytics />
                </OrganizerRoute>
              }
            />
            <Route
              path="/organizer/profile"
              element={
                <OrganizerRoute requiredPermission="canEditOrganizerProfile">
                  <OrganizerProfileSettings />
                </OrganizerRoute>
              }
            />
            <Route
              path="/organizer/team"
              element={
                <OrganizerRoute requiredPermission="canManageTeam">
                  <OrganizerTeamMembers />
                </OrganizerRoute>
              }
            />
            <Route
              path="/organizer/settings"
              element={
                <OrganizerRoute requiredPermission="canAccessSettings">
                  <OrganizerSettings />
                </OrganizerRoute>
              }
            />

            {/* Fallback 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </AuthProvider>
      </SettingsProvider>
    </NotificationProvider>
  );
};

export default App;
