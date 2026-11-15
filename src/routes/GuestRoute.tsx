import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface GuestRouteProps {
  children: React.ReactNode;
}

export const GuestRoute: React.FC<GuestRouteProps> = ({ children }) => {
  const { isAuthenticated, isEmailVerified, isLoading, token, user, organizer } = useAuth();
  const location = useLocation();

  // If we have an active token and are validating it, show minimal non-jarring fallback
  if (isLoading && token) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-3 border-brand-accent border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    if (!isEmailVerified) {
      return <Navigate to="/verify-email/pending" replace />;
    }

    const rawFrom = (location.state as any)?.from;
    if (rawFrom) {
      const targetPath =
        typeof rawFrom === 'string'
          ? rawFrom
          : rawFrom.pathname
          ? `${rawFrom.pathname}${rawFrom.search || ''}${rawFrom.hash || ''}`
          : null;
      if (targetPath && !targetPath.startsWith('/login') && !targetPath.startsWith('/register')) {
        return <Navigate to={targetPath} replace />;
      }
    }

    if (user?.accountType === 'organizer' || organizer) {
      return <Navigate to="/organizer" replace />;
    }

    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
export default GuestRoute;
