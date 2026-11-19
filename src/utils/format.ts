export interface FormatCurrencyOptions {
  allowZeroAsFree?: boolean;
}

export const SUPPORTED_TIMEZONES: Array<{ value: string; label: string }> = [
  { value: 'Africa/Lagos', label: 'Africa/Lagos (WAT, GMT+1)' },
  { value: 'Africa/Accra', label: 'Africa/Accra (GMT)' },
  { value: 'Africa/Nairobi', label: 'Africa/Nairobi (EAT, GMT+3)' },
  { value: 'Africa/Johannesburg', label: 'Africa/Johannesburg (SAST, GMT+2)' },
  { value: 'Africa/Cairo', label: 'Africa/Cairo (EET/EEST, GMT+2)' },
  { value: 'Africa/Casablanca', label: 'Africa/Casablanca (GMT+1)' },
  { value: 'Africa/Kigali', label: 'Africa/Kigali (CAT, GMT+2)' },
  { value: 'Europe/London', label: 'Europe/London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Europe/Paris (CET/CEST, GMT+1)' },
  { value: 'Europe/Berlin', label: 'Europe/Berlin (CET/CEST, GMT+1)' },
  { value: 'America/New_York', label: 'America/New_York (EST/EDT)' },
  { value: 'America/Chicago', label: 'America/Chicago (CST/CDT)' },
  { value: 'America/Denver', label: 'America/Denver (MST/MDT)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (PST/PDT)' },
  { value: 'America/Toronto', label: 'America/Toronto (EST/EDT)' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (GST, GMT+4)' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore (SGT, GMT+8)' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST, GMT+9)' },
  { value: 'Australia/Sydney', label: 'Australia/Sydney (AEST/AEDT)' },
  { value: 'UTC', label: 'UTC (Universal Coordinated Time)' },
];

/**
 * Validates whether an IANA timezone string is accepted by the Intl engine.
 */
export const isValidTimezone = (tz?: string | null): boolean => {
  if (!tz || typeof tz !== 'string') return false;
  const cleaned = tz.replace(/\s*\([^)]*\).*$/, '').trim();
  if (!cleaned) return false;
  try {
    Intl.DateTimeFormat(undefined, { timeZone: cleaned });
    return true;
  } catch {
    return false;
  }
};

/**
 * Resolves the active user's preferred IANA timezone.
 * Priority: 1. Explicit argument -> 2. Stored authenticated user timezone -> 3. Browser Intl timezone -> 4. Africa/Lagos
 */
export const getUserTimezone = (explicitTz?: string | null): string => {
  if (explicitTz) {
    const cleaned = explicitTz.replace(/\s*\([^)]*\).*$/, '').trim();
    if (isValidTimezone(cleaned)) return cleaned;
  }

  try {
    const rawUser =
      localStorage.getItem('strayttix_user') ||
      sessionStorage.getItem('strayttix_user');
    if (rawUser) {
      const parsed = JSON.parse(rawUser);
      const userTz = parsed?.timezone || parsed?.time_zone;
      if (userTz) {
        const cleaned = String(userTz).replace(/\s*\([^)]*\).*$/, '').trim();
        if (isValidTimezone(cleaned)) return cleaned;
      }
    }
  } catch {
    // ignore storage read error
  }

  try {
    const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (isValidTimezone(browserTz)) return browserTz;
  } catch {
    // ignore Intl error
  }

  return 'Africa/Lagos';
};

/**
 * Returns a live local time preview and offset for a given timezone (e.g. "9:35 PM · GMT+1")
 */
export const getTimezonePreview = (timeZone?: string | null): string => {
  const tz = getUserTimezone(timeZone);
  try {
    const now = new Date();
    const timeStr = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: tz,
    }).format(now);

    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      timeZoneName: 'shortOffset',
    }).formatToParts(now);
    const offsetPart = parts.find((p) => p.type === 'timeZoneName')?.value || '';

    return offsetPart ? `${timeStr} (${offsetPart})` : timeStr;
  } catch {
    return tz;
  }
};

/**
 * Formats a numeric price into a currency string (defaults to NGN ₦)
 * For financial metrics and ledgers, 0 formats as ₦0.
 * If allowZeroAsFree is set to true, 0 returns 'Free'.
 */
export const formatCurrency = (
  amount: number,
  currency: string = 'NGN',
  options?: FormatCurrencyOptions | boolean
): string => {
  const allowZeroAsFree = typeof options === 'boolean' ? options : options?.allowZeroAsFree ?? false;
  const num = Number(amount || 0);

  if (num === 0 && allowZeroAsFree) {
    return 'Free';
  }

  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

/**
 * Formats standard ISO dates to clean, readable formats in the user's timezone (e.g., Aug 28, 2026)
 */
export const formatDate = (dateString?: string, timeZone?: string): string => {
  if (!dateString) return '';

  // For pure YYYY-MM-DD calendar date strings without a time component, preserve the calendar date
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString.trim())) {
    const [y, m, d] = dateString.trim().split('-').map(Number);
    const utcDate = new Date(Date.UTC(y, m - 1, d));
    return utcDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    });
  }

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  try {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: getUserTimezone(timeZone),
    });
  } catch {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
};

/**
 * Formats an ISO timestamp into a date + time string in the user's timezone (e.g., Nov 18, 2026, 9:35 PM)
 */
export const formatDateTime = (dateString?: string, timeZone?: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  try {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: getUserTimezone(timeZone),
    });
  } catch {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }
};

/**
 * Formats date and time into a unified event schedule string.
 * If timeStr is missing or empty, returns just the formatted date.
 */
export const formatEventDateTime = (dateStr?: string, timeStr?: string): string => {
  const dateFormatted = formatDate(dateStr);
  if (!timeStr || !timeStr.trim()) return dateFormatted;

  // Format HH:mm or HH:mm:ss to 12-hour AM/PM
  const [hourStr, minStr] = timeStr.split(':');
  const hour = parseInt(hourStr, 10);
  if (isNaN(hour)) return `${dateFormatted}${dateFormatted ? ' • ' : ''}${timeStr}`;

  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  const formattedTime = `${displayHour}:${minStr || '00'} ${ampm}`;

  return dateFormatted ? `${dateFormatted} • ${formattedTime}` : formattedTime;
};

/**
 * Returns a personalized greeting (Good morning / Good afternoon / Good evening)
 * based on user's timezone (or system timezone / UTC fallback).
 */
export const getGreeting = (userTimezone?: string): string => {
  try {
    const targetTimezone = getUserTimezone(userTimezone);
    const hourFormatter = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      hourCycle: 'h23',
      timeZone: targetTimezone,
    });
    const hour = parseInt(hourFormatter.format(new Date()), 10);
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    return 'Good evening';
  } catch {
    const localHour = new Date().getHours();
    if (localHour >= 5 && localHour < 12) return 'Good morning';
    if (localHour >= 12 && localHour < 17) return 'Good afternoon';
    return 'Good evening';
  }
};
