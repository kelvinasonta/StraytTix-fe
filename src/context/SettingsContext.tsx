import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { AppSettings } from '../types/api';
import { settingsApi } from '../api/settings';

export const DEFAULT_APP_SETTINGS: AppSettings = {
  sitename: 'Eventra',
  site_tagline: '',
  favicon: null,
  logo: null,
  maintenance_message: null,
  support_email: null,
  timezone: 'UTC',
  currency_id: null,
};

const SETTINGS_STORAGE_KEY = 'eventsos_app_settings';

interface SettingsContextType {
  settings: AppSettings;
  isLoading: boolean;
  error: string | null;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const cached = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (cached) {
        return { ...DEFAULT_APP_SETTINGS, ...JSON.parse(cached) };
      }
    } catch {
      // ignore
    }
    return DEFAULT_APP_SETTINGS;
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Sync document title and favicon dynamically
  const applySettingsToDom = useCallback((appSettings: AppSettings) => {
    // 1. Update Title if sitename exists
    if (appSettings.sitename) {
      const currentTitle = document.title;
      // If title includes separator or contains generic name, update
      if (!currentTitle || currentTitle.includes('Eventa') || currentTitle.includes('Eventra') || currentTitle.includes('EventsOS')) {
        document.title = appSettings.site_tagline
          ? `${appSettings.sitename} — ${appSettings.site_tagline}`
          : `${appSettings.sitename} — Discover Amazing Events & Ticketing Platform`;
      }
    }

    // 2. Update Favicon if provided
    if (appSettings.favicon) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = appSettings.favicon;
    }
  }, []);

  const refreshSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await settingsApi.getAppSettings();
      if (res && res.data) {
        setSettings(res.data);
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(res.data));
        applySettingsToDom(res.data);
      }
    } catch (err: any) {
      console.warn('Could not fetch app settings:', err);
      setError(err?.message || 'Failed to load app settings');
    } finally {
      setIsLoading(false);
    }
  }, [applySettingsToDom]);

  useEffect(() => {
    // Initial DOM update from cached or default
    applySettingsToDom(settings);
    // Fetch fresh settings
    refreshSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        isLoading,
        error,
        refreshSettings,
      }}
    >
      {/* Maintenance Banner when maintenance_message is set */}
      {settings.maintenance_message && (
        <aside
          role="status"
          aria-live="polite"
          className="bg-amber-500 text-amber-950 font-semibold px-4 py-2.5 text-xs text-center border-b border-amber-600/30 flex items-center justify-center gap-2 relative z-50 shadow-xs"
        >
          <span className="inline-block w-2 h-2 rounded-full bg-amber-950 animate-pulse" />
          <span>{settings.maintenance_message}</span>
        </aside>
      )}
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
