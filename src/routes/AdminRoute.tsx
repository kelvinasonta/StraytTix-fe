import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface AdminRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children, requiredPermission }) => {
  const { isAuthenticated, user, isLoading, token } = useAuth();
  const location = useLocation();

  if (isLoading && token) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-3 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-400 text-xs font-mono tracking-wider uppercase">Authenticating Governance Access...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const isAdmin = Boolean((user as any)?.is_admin || user?.role === 'admin' || (user as any)?.admin_role);

  if (!isAdmin) {
    return <Navigate to="/403" state={{ from: location }} replace />;
  }

  if (requiredPermission) {
    const permissions: string[] = (user as any)?.admin_permissions || [];
    const hasPermission = permissions.includes('*') || permissions.includes(requiredPermission);

    if (!hasPermission) {
      return <Navigate to="/403" state={{ from: location }} replace />;
    }
  }

  return <>{children}</>;
};

