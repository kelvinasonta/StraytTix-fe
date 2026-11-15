import type { AppSettings } from '../types/api';

export const DEFAULT_FEE_PERCENTAGE = 5; // 5%
export const DEFAULT_FEE_FIXED = 100; // ₦100 flat

export interface FeeConfig {
  percentage: number;
  fixed: number;
  passthrough: boolean;
}

export function getFeeConfig(settings?: Partial<AppSettings> | null): FeeConfig {
  const percentage = Number(
    settings?.ticket_fee_percentage ?? settings?.platform_fee_percentage ?? DEFAULT_FEE_PERCENTAGE
  );
  const fixed = Number(
    settings?.ticket_fee_fixed ?? settings?.platform_fee_fixed ?? DEFAULT_FEE_FIXED
  );
  const passthrough = settings?.platform_fee_passthrough !== false;

  return {
    percentage: isNaN(percentage) ? DEFAULT_FEE_PERCENTAGE : percentage,
    fixed: isNaN(fixed) ? DEFAULT_FEE_FIXED : fixed,
    passthrough,
  };
}

export function calculatePlatformFee(
  subtotal: number,
  ticketCount: number = 1,
  settings?: Partial<AppSettings> | null
): number {
  if (subtotal <= 0) return 0;
  const { percentage, fixed, passthrough } = getFeeConfig(settings);

  // If the platform fee is absorbed by the organizer, buyer fee is 0
  if (!passthrough) {
    return 0;
  }

  const percentPart = subtotal * (percentage / 100);
  const fixedPart = (ticketCount > 0 ? ticketCount : 1) * fixed;
  return Math.round(percentPart + fixedPart);
}

