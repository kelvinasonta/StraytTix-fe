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
export const formatDate = (dateString: string): string => {
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
 * Formats date and time into a unified event schedule string
 */
export const formatEventDateTime = (dateStr: string, timeStr: string): string => {
  const dateFormatted = formatDate(dateStr);
  if (!timeStr) return dateFormatted;
  
  // Format 14:00 to 2:00 PM
  const [hourStr, minStr] = timeStr.split(':');
  const hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  const formattedTime = `${displayHour}:${minStr} ${ampm}`;
  
  return `${dateFormatted} • ${formattedTime}`;
};
