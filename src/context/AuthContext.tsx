import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, Organizer, AuthPayload } from '../types/api';
import { tokenStorage } from '../utils/storage';
import { authApi } from '../api/auth';
import { organizerApi } from '../api/organizers';
import { favoritesApi } from '../api/favorites';
import { getApiErrorMessage } from '../api/client';
import { useNotification } from './NotificationContext';

interface AuthContextType {
  user: User | null;
  organizer: Organizer | null; // Selected/Active organizer context
  organizations: Organizer[]; // All organizations user belongs to
  token: string | null;
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  isLoading: boolean;
  login: (credentials: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: (organizerUuid?: string) => Promise<void>;
  setActiveOrganizer: (org: Organizer | null) => void;
  switchOrganization: (organizerUuid: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(tokenStorage.getUser<User>());
  const [organizer, setOrganizer] = useState<Organizer | null>(null);
  const [organizations, setOrganizations] = useState<Organizer[]>([]);
  const [token, setToken] = useState<string | null>(tokenStorage.getToken());
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(
    Boolean(tokenStorage.getUser<User>()?.isEmailVerified)
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { showNotification } = useNotification();

  // Load organizer from storage if any
  useEffect(() => {
    const cachedOrg = localStorage.getItem('strayttix_active_organizer');
    if (cachedOrg) {
      try {
        setOrganizer(JSON.parse(cachedOrg));
      } catch {
        // ignore
      }
    }
  }, []);

  const setActiveOrganizer = useCallback((org: Organizer | null) => {
    setOrganizer(org);
    if (org) {
      const orgId = org.uuid || org.id;
      localStorage.setItem('strayttix_active_organizer', JSON.stringify(org));
      tokenStorage.setActiveOrganizerUuid(orgId, true);
    } else {
      localStorage.removeItem('strayttix_active_organizer');
      tokenStorage.clearActiveOrganizerUuid();
    }
  }, []);

  const refreshUser = useCallback(async (targetOrgUuid?: string) => {
    const currentToken = tokenStorage.getToken();
    if (!currentToken) {
      setUser(null);
      setToken(null);
      setOrganizer(null);
      setOrganizations([]);
      setIsEmailVerified(false);
      setIsLoading(false);
      return;
    }

    try {
      const activeUuid = targetOrgUuid || tokenStorage.getActiveOrganizerUuid() || undefined;
      const res = await authApi.getMe(activeUuid);
      if (res.success && res.data) {
        const remember = tokenStorage.isRemembered();
        setUser(res.data.user);
        setToken(currentToken);
        setIsEmailVerified(res.data.email_verified);
        tokenStorage.setUser(res.data.user, remember);

        if (res.data.organizer) {
          setActiveOrganizer(res.data.organizer);
        }

        // Hydrate favorites from backend in background to keep heart symbols synced across reloads
        favoritesApi.getFavoriteIds().catch(() => {});
      }
    } catch (err: any) {
      const responseData = err.response?.data;
      if (responseData && responseData.code === 'EMAIL_VERIFICATION_REQUIRED') {
        setIsEmailVerified(false);
        if (responseData.data && responseData.data.user) {
          const remember = tokenStorage.isRemembered();
          setUser(responseData.data.user);
          tokenStorage.setUser(responseData.data.user, remember);
        }
      } else {
        tokenStorage.clearAll();
        setUser(null);
        setToken(null);
        setOrganizer(null);
        setOrganizations([]);
        setIsEmailVerified(false);
      }
    } finally {
      setIsLoading(false);
    }
  }, [setActiveOrganizer]);

  // Fetch all organizations the user belongs to
  const loadMyOrganizations = useCallback(async () => {
    const currentToken = tokenStorage.getToken();
    if (!currentToken) {
      setOrganizations([]);
      return;
    }
    try {
      const res = await organizerApi.getMyOrganizations();
      if (res.success && Array.isArray(res.data)) {
        setOrganizations(res.data);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    if (token) {
      loadMyOrganizations();
    }
  }, [token, loadMyOrganizations, organizer?.id]);

  const switchOrganization = async (newOrgUuid: string) => {
    setIsLoading(true);
    try {
      tokenStorage.setActiveOrganizerUuid(newOrgUuid, true);
      await refreshUser(newOrgUuid);
      await loadMyOrganizations();
      showNotification('Switched organization workspace.', 'success');
    } catch (err: any) {
      showNotification(getApiErrorMessage(err, 'Failed to switch organization.'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: any) => {
    setIsLoading(true);
    try {
      const remember = credentials.remember !== undefined ? Boolean(credentials.remember) : true;
      const res = await authApi.login(credentials);
      if (res.success && res.data) {
        const verified = Boolean(res.data.user?.isEmailVerified);
        tokenStorage.setToken(res.data.token, remember);
        tokenStorage.setUser(res.data.user, remember);
        setToken(res.data.token);
        setUser(res.data.user);
        setIsEmailVerified(verified);

        if (res.data.organizer) {
          setActiveOrganizer(res.data.organizer);
        } else {
          setActiveOrganizer(null);
        }

        // Sync full user & verification state from /auth/me
        await refreshUser();
        if (verified) {
          showNotification(res.message || 'Signed in successfully.', 'success');
        } else {
          showNotification('Please verify your email address to continue.', 'info');
        }
      }
    } catch (err: any) {
      setIsLoading(false);
      const responseData = err.response?.data;
      if (responseData && responseData.code === 'EMAIL_VERIFICATION_REQUIRED') {
        if (responseData.data) {
          const remember = credentials.remember !== undefined ? Boolean(credentials.remember) : true;
          if (responseData.data.token) {
            tokenStorage.setToken(responseData.data.token, remember);
            setToken(responseData.data.token);
          }
          if (responseData.data.user) {
            tokenStorage.setUser(responseData.data.user, remember);
            setUser(responseData.data.user);
          }
        }
        setIsEmailVerified(false);
        showNotification('Email verification required.', 'warning');
        throw err;
      }
      throw err;
    }
  };

  const register = async (formData: any) => {
    setIsLoading(true);
    try {
      const res = await authApi.register(formData);
      if (res.success && res.data) {
        // Persist in localStorage so email verification links opened in a new browser tab remain authenticated
        tokenStorage.setToken(res.data.token, true);
        tokenStorage.setUser(res.data.user, true);
        setToken(res.data.token);
        setUser(res.data.user);
        setIsEmailVerified(Boolean(res.data.user?.isEmailVerified));

        if (res.data.organizer) {
          setActiveOrganizer(res.data.organizer);
        } else {
          setActiveOrganizer(null);
        }

        showNotification('Registration successful. Please verify your email.', 'success');
        setIsLoading(false);
      }
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authApi.logout();
    } catch (err) {
      console.warn('Logout API failed:', getApiErrorMessage(err));
    } finally {
      tokenStorage.clearAll();
      localStorage.removeItem('strayttix_active_organizer');
      setUser(null);
      setToken(null);
      setOrganizer(null);
      setIsEmailVerified(false);
      setIsLoading(false);
      showNotification('Successfully logged out.', 'info');
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        organizer,
        organizations,
        token,
        isAuthenticated: !!token,
        isEmailVerified,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        setActiveOrganizer,
        switchOrganization,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
