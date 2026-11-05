export interface FormatCurrencyOptions {
  allowZeroAsFree?: boolean;
}

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
 * Formats standard ISO dates to clean, readable formats (e.g., Aug 28, 2026)
 */
export const formatDate = (dateString?: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
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
    const targetTimezone = userTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
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

