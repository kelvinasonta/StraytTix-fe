import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isEmailVerified, isLoading, token } = useAuth();
  const location = useLocation();

  if (isLoading && token) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-3 border-brand-accent border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login and save the location they tried to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isEmailVerified && location.pathname !== '/verify-email/pending' && location.pathname !== '/verify-email') {
    // Redirect to verify email page if not verified
    return <Navigate to="/verify-email/pending" replace />;
  }

  return <>{children}</>;
};
export default ProtectedRoute;
