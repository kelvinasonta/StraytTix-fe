import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminApi } from '../api/admin';
import type { AdminUser } from '../types/api';

interface AdminAuthContextType {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(() => {
    try {
      const stored = localStorage.getItem('eventsos_admin_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('eventsos_admin_token') || localStorage.getItem('strayttix_auth_token');
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const checkAuth = async () => {
    const activeToken = localStorage.getItem('eventsos_admin_token') || localStorage.getItem('strayttix_auth_token');
    if (!activeToken) {
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return;
    }

    try {
      const me = await adminApi.getMe();
      const isAdmin = Boolean(
        me.is_admin ||
        me.isAdmin ||
        me.role === 'admin' ||
        me.admin_role ||
        me.adminRole ||
        (Array.isArray(me.admin_permissions) && me.admin_permissions.length > 0)
      );

      if (!isAdmin) {
        throw new Error('Access denied: Account is not an authorized administrator.');
      }

      setUser(me);
      setToken(activeToken);
      localStorage.setItem('eventsos_admin_user', JSON.stringify(me));
    } catch (err) {
      console.error('Admin authentication check failed:', err);
      localStorage.removeItem('eventsos_admin_token');
      localStorage.removeItem('eventsos_admin_user');
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const { token: receivedToken, user: receivedUser } = await adminApi.login(credentials);
      
      const isAdmin = Boolean(
        receivedUser?.is_admin ||
        receivedUser?.isAdmin ||
        receivedUser?.role === 'admin' ||
        receivedUser?.admin_role ||
        receivedUser?.adminRole ||
        (Array.isArray(receivedUser?.admin_permissions) && receivedUser.admin_permissions.length > 0)
      );

      if (!isAdmin) {
        throw new Error('403 Forbidden: You do not have administrator governance privileges.');
      }

      localStorage.setItem('eventsos_admin_token', receivedToken);
      localStorage.setItem('eventsos_admin_user', JSON.stringify(receivedUser));
      setToken(receivedToken);
      setUser(receivedUser);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await adminApi.logout();
    } catch {
      // Ignore
    } finally {
      localStorage.removeItem('eventsos_admin_token');
      localStorage.removeItem('eventsos_admin_user');
      setUser(null);
      setToken(null);
      window.location.href = '/login';
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token && user),
        isLoading,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

