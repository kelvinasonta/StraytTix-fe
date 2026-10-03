import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, Organizer, AuthPayload } from '../types/api';
import { tokenStorage } from '../utils/storage';
import { authApi } from '../api/auth';
import { getApiErrorMessage } from '../api/client';
import { useNotification } from './NotificationContext';

interface AuthContextType {
  user: User | null;
  organizer: Organizer | null; // Selected/Active organizer context
  token: string | null;
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  isLoading: boolean;
  login: (credentials: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setActiveOrganizer: (org: Organizer | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(tokenStorage.getUser<User>());
  const [organizer, setOrganizer] = useState<Organizer | null>(null);
  const [token, setToken] = useState<string | null>(tokenStorage.getToken());
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { showNotification } = useNotification();

  // Load organizer from storage if any
  useEffect(() => {
    const cachedOrg = localStorage.getItem('eventsos_active_organizer');
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
      localStorage.setItem('eventsos_active_organizer', JSON.stringify(org));
      tokenStorage.setActiveOrganizerUuid(org.id, true);
    } else {
      localStorage.removeItem('eventsos_active_organizer');
      tokenStorage.clearActiveOrganizerUuid();
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const currentToken = tokenStorage.getToken();
    if (!currentToken) {
      setUser(null);
      setToken(null);
      setOrganizer(null);
      setIsEmailVerified(false);
      setIsLoading(false);
      return;
    }

    try {
      const res = await authApi.getMe();
      if (res.success && res.data) {
        const remember = tokenStorage.isRemembered();
        setUser(res.data.user);
        setToken(currentToken);
        setIsEmailVerified(res.data.email_verified);
        tokenStorage.setUser(res.data.user, remember);

        if (res.data.organizer) {
          setActiveOrganizer(res.data.organizer);
        }
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
        setIsEmailVerified(false);
      }
    } finally {
      setIsLoading(false);
    }
  }, [setActiveOrganizer]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (credentials: any) => {
    setIsLoading(true);
    try {
      const remember = !!credentials.remember;
      const res = await authApi.login(credentials);
      if (res.success && res.data) {
        tokenStorage.setToken(res.data.token, remember);
        tokenStorage.setUser(res.data.user, remember);
        setToken(res.data.token);
        setUser(res.data.user);

        if (res.data.organizer) {
          setActiveOrganizer(res.data.organizer);
        } else {
          setActiveOrganizer(null);
        }

        // Fetch verification state
        await refreshUser();
        showNotification(res.message, 'success');
      }
    } catch (err: any) {
      setIsLoading(false);
      const responseData = err.response?.data;
      if (responseData && responseData.code === 'EMAIL_VERIFICATION_REQUIRED') {
        if (responseData.data) {
          const remember = !!credentials.remember;
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
        tokenStorage.setToken(res.data.token, false);
        tokenStorage.setUser(res.data.user, false);
        setToken(res.data.token);
        setUser(res.data.user);
        setIsEmailVerified(false);

        if (res.data.organizer) {
          setActiveOrganizer(res.data.organizer);
        } else {
          setActiveOrganizer(null);
        }

        showNotification('Registration successful. Please verify your email.', 'success');
        await refreshUser();
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
      localStorage.removeItem('eventsos_active_organizer');
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
        token,
        isAuthenticated: !!token,
        isEmailVerified,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        setActiveOrganizer,
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
