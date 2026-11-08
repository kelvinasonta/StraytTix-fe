import React from 'react';
import { useCan } from '../../hooks/useCan';

export interface CanProps {
  permission?: string | string[];
  role?: string | string[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function Can({ permission, role, fallback = null, children }: CanProps) {
  const { can, hasRole } = useCan();

  if (permission && !can(permission)) {
    return <>{fallback}</>;
  }

  if (role && !hasRole(role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

