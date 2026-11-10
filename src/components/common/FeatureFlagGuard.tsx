import React from 'react';
import { useFeatureFlag } from '../../context/FeatureFlagContext';
import type { FeatureFlagKey } from '../../types/featureFlags';

interface FeatureFlagGuardProps {
  flag: FeatureFlagKey;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Conditionally renders children only when the specified feature flag is enabled.
 */
export const FeatureFlagGuard: React.FC<FeatureFlagGuardProps> = ({
  flag,
  children,
  fallback = null,
}) => {
  const isEnabled = useFeatureFlag(flag);

  if (!isEnabled) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default FeatureFlagGuard;

