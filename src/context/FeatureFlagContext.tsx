import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { DEFAULT_FEATURE_FLAGS, type FeatureFlagKey } from '../types/featureFlags';
import { adminApi } from '../api/admin';
import { authApi } from '../api/auth';
import { useAuth } from './AuthContext';

const STORAGE_KEY_OVERRIDES = 'strayttix_feature_flag_overrides';

/**
 * Normalizes backend feature flags whether returned as:
 * - A boolean map: { "auth-social-login": false }
 * - An object map: { "auth-social-login": { "name": "...", "active": false } }
 * - An array: [{ "name": "auth-social-login", "active": false }]
 */
function parseFeatureMap(raw: any): Record<string, boolean> {
  if (!raw || typeof raw !== 'object') return {};
  const result: Record<string, boolean> = {};

  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (item && typeof item === 'object') {
        const k = item.name || item.key || item.feature;
        if (k) {
          result[k] = Boolean(item.active ?? item.is_active ?? item.enabled ?? false);
        }
      }
    }
    return result;
  }

  for (const [key, val] of Object.entries(raw)) {
    if (typeof val === 'boolean') {
      result[key] = val;
    } else if (typeof val === 'number') {
      result[key] = val === 1;
    } else if (val && typeof val === 'object') {
      const activeState = (val as any).active ?? (val as any).is_active ?? (val as any).enabled;
      result[key] = Boolean(activeState);
    } else if (typeof val === 'string') {
      result[key] = val === 'true' || val === '1';
    }
  }

  return result;
}

interface FeatureFlagContextType {
  flags: Record<string, boolean>;
  isEnabled: (flag: FeatureFlagKey) => boolean;
  setFlagOverride: (flag: FeatureFlagKey, enabled: boolean) => Promise<void>;
  resetFlagOverrides: () => void;
  refreshFlags: () => Promise<void>;
  isLoading: boolean;
}

const FeatureFlagContext = createContext<FeatureFlagContextType | undefined>(undefined);

export const FeatureFlagProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, organizer } = useAuth();
  const [serverFlags, setServerFlags] = useState<Record<string, boolean>>({});
  const [overrides, setOverrides] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_OVERRIDES);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Sync with API when available: query public GET /api/v1/auth/features and admin endpoints
  const refreshFlags = useCallback(async () => {
    setIsLoading(true);
    try {
      const merged: Record<string, boolean> = {};

      // 1. Public discovery endpoint (unauthenticated)
      try {
        const authFeaturesRes = await authApi.getAuthFeatures();
        const rawPayload = (authFeaturesRes as any)?.data ?? authFeaturesRes;
        const parsedAuth = parseFeatureMap(rawPayload);
        if (Object.keys(parsedAuth).length > 0) {
          Object.assign(merged, parsedAuth);
        }
      } catch {
        // Auth features endpoint not critical
      }

      // 2. Admin endpoint (if logged in as admin)
      try {
        const adminFlags = await adminApi.getFeatureFlags();
        const parsedAdmin = parseFeatureMap(adminFlags);
        if (Object.keys(parsedAdmin).length > 0) {
          Object.assign(merged, parsedAdmin);
        }
      } catch {
        // Admin flags not critical
      }

      if (Object.keys(merged).length > 0) {
        setServerFlags(merged);
      }
    } catch {
      // Gracefully fall back to defaults
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshFlags();
  }, [refreshFlags]);

  // Merge order: Defaults -> Server API / User / Org payload -> Local Overrides
  const mergedFlags = useMemo(() => {
    const userOrOrgFlags = parseFeatureMap({
      ...((user as any)?.feature_flags || (user as any)?.features || {}),
      ...((organizer as any)?.feature_flags || (organizer as any)?.features || {}),
    });

    return {
      ...DEFAULT_FEATURE_FLAGS,
      ...serverFlags,
      ...userOrOrgFlags,
      ...overrides,
    };
  }, [serverFlags, user, organizer, overrides]);

  const isEnabled = useCallback(
    (flag: FeatureFlagKey): boolean => {
      if (flag in mergedFlags) {
        return Boolean(mergedFlags[flag]);
      }
      return Boolean(DEFAULT_FEATURE_FLAGS[flag] ?? false);
    },
    [mergedFlags]
  );

  const setFlagOverride = useCallback(
    async (flag: FeatureFlagKey, enabled: boolean) => {
      const nextOverrides = { ...overrides, [flag]: enabled };
      setOverrides(nextOverrides);
      try {
        localStorage.setItem(STORAGE_KEY_OVERRIDES, JSON.stringify(nextOverrides));
      } catch {
        // Ignore localStorage quota errors
      }

      // If user has admin credentials, attempt syncing with backend API
      try {
        await adminApi.toggleFeatureFlag(flag, enabled);
      } catch {
        // Backend sync is optional / dev mode fallback
      }
    },
    [overrides]
  );

  const resetFlagOverrides = useCallback(() => {
    setOverrides({});
    try {
      localStorage.removeItem(STORAGE_KEY_OVERRIDES);
    } catch {
      // Ignore
    }
  }, []);

  const value = useMemo(
    () => ({
      flags: mergedFlags,
      isEnabled,
      setFlagOverride,
      resetFlagOverrides,
      refreshFlags,
      isLoading,
    }),
    [mergedFlags, isEnabled, setFlagOverride, resetFlagOverrides, refreshFlags, isLoading]
  );

  return <FeatureFlagContext.Provider value={value}>{children}</FeatureFlagContext.Provider>;
};

export function useFeatureFlags(): FeatureFlagContextType {
  const context = useContext(FeatureFlagContext);
  if (!context) {
    // Graceful fallback outside provider
    return {
      flags: DEFAULT_FEATURE_FLAGS,
      isEnabled: (flag: FeatureFlagKey) => Boolean(DEFAULT_FEATURE_FLAGS[flag] ?? false),
      setFlagOverride: async () => {},
      resetFlagOverrides: () => {},
      refreshFlags: async () => {},
      isLoading: false,
    };
  }
  return context;
}

export function useFeatureFlag(flag: FeatureFlagKey): boolean {
  const { isEnabled } = useFeatureFlags();
  return isEnabled(flag);
}

