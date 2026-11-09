import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { resolveOrganizerRole, getRolePermissions, type RolePermissions } from '../utils/permissions';
import { useCan } from '../hooks/useCan';

interface OrganizerRouteProps {
  children: React.ReactNode;
  requiredPermission?: keyof RolePermissions;
  capability?: string | string[];
}

export const OrganizerRoute: React.FC<OrganizerRouteProps> = ({ children, requiredPermission, capability }) => {
  const { isAuthenticated, isEmailVerified, user, organizer, isLoading, token } = useAuth();
  const { can } = useCan();
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
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isEmailVerified && location.pathname !== '/verify-email/pending' && location.pathname !== '/verify-email') {
    return <Navigate to="/verify-email/pending" replace />;
  }

  if (user?.accountType !== 'organizer') {
    // Redirect to customer dashboard if not an organizer
    return <Navigate to="/dashboard" replace />;
  }

  // Check granular capability permission string(s)
  if (capability && !can(capability)) {
    return <Navigate to="/403" state={{ from: location }} replace />;
  }

  // Check role-based permission if required
  if (requiredPermission) {
    const role = resolveOrganizerRole(organizer);
    const perms = getRolePermissions(role);
    if (!perms[requiredPermission]) {
      return <Navigate to="/403" state={{ from: location }} replace />;
    }
  }

  return <>{children}</>;
};

export default OrganizerRoute;
