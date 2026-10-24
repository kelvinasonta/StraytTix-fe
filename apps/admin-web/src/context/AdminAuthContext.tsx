import React, { createContext, useContext, useState } from 'react';
import type { AdminUser, AdminRole, AdminPermission } from '../types/admin';

const ROLE_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
  super_admin: [
    'manage_orders',
    'reconcile_orders',
    'manage_tickets',
    'invalidate_tickets',
    'reissue_tickets',
    'manage_refunds',
    'approve_refunds',
    'manage_payouts',
    'authorize_payouts',
    'hold_payouts',
    'manage_kyc',
    'approve_kyc',
    'moderate_events',
    'manage_users',
    'manage_feature_flags',
    'view_audit_logs',
    'export_data'
  ],
  finance_admin: [
    'manage_orders',
    'reconcile_orders',
    'manage_refunds',
    'approve_refunds',
    'manage_payouts',
    'authorize_payouts',
    'hold_payouts',
    'view_audit_logs',
    'export_data'
  ],
  trust_and_safety: [
    'manage_tickets',
    'invalidate_tickets',
    'moderate_events',
    'manage_users',
    'view_audit_logs'
  ],
  kyc_reviewer: [
    'manage_kyc',
    'approve_kyc',
    'view_audit_logs'
  ],
  support_agent: [
    'manage_orders',
    'manage_tickets',
    'reissue_tickets',
    'manage_users'
  ],
  read_only_analyst: [
    'view_audit_logs',
    'export_data'
  ]
};

interface AdminAuthContextType {
  admin: AdminUser | null;
  token: string | null;
  login: (token: string, user: AdminUser) => void;
  logout: () => void;
  isAuthenticated: boolean;
  hasPermission: (permission: AdminPermission) => boolean;
  switchRole: (role: AdminRole) => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem('eventsos_admin_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          permissions: ROLE_PERMISSIONS[parsed.role as AdminRole] || ROLE_PERMISSIONS.super_admin
        };
      } catch {
        return null;
      }
    }
    return {
      id: 'super_admin_1',
      name: 'Super Administrator',
      email: 'admin@eventsos.internal',
      role: 'super_admin',
      permissions: ROLE_PERMISSIONS.super_admin
    };
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('eventsos_admin_token') || 'local_admin_token_default';
  });

  const login = (newToken: string, newAdmin: AdminUser) => {
    const userWithPerms = {
      ...newAdmin,
      permissions: ROLE_PERMISSIONS[newAdmin.role] || []
    };
    setToken(newToken);
    setAdmin(userWithPerms);
    localStorage.setItem('eventsos_admin_token', newToken);
    localStorage.setItem('eventsos_admin_user', JSON.stringify(userWithPerms));
  };

  const switchRole = (newRole: AdminRole) => {
    if (!admin) return;
    const updated: AdminUser = {
      ...admin,
      role: newRole,
      permissions: ROLE_PERMISSIONS[newRole]
    };
    setAdmin(updated);
    localStorage.setItem('eventsos_admin_user', JSON.stringify(updated));
  };

  const logout = () => {
    setToken(null);
    setAdmin(null);
    localStorage.removeItem('eventsos_admin_token');
    localStorage.removeItem('eventsos_admin_user');
  };

  const hasPermission = (permission: AdminPermission): boolean => {
    if (!admin) return false;
    if (admin.role === 'super_admin') return true;
    return admin.permissions?.includes(permission) ?? false;
  };

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        token,
        login,
        logout,
        isAuthenticated: Boolean(token),
        hasPermission,
        switchRole
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  return ctx;
};

