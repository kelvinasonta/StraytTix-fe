import apiClient from './client';
import type { ApiResponse } from '../types/api';

export interface Country {
  code: string;
  name: string;
  flag?: string;
  phoneCode?: string;
  currency?: string;
}

// Comprehensive initial list and resilient fallback if backend is unavailable
export const DEFAULT_COUNTRIES: Country[] = [
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬', phoneCode: '+234', currency: 'NGN' },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭', phoneCode: '+233', currency: 'GHS' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪', phoneCode: '+254', currency: 'KES' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', phoneCode: '+27', currency: 'ZAR' },
  { code: 'RW', name: 'Rwanda', flag: '🇷🇼', phoneCode: '+250', currency: 'RWF' },
  { code: 'UG', name: 'Uganda', flag: '🇺🇬', phoneCode: '+256', currency: 'UGX' },
  { code: 'TZ', name: 'Tanzania', flag: '🇹🇿', phoneCode: '+255', currency: 'TZS' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', phoneCode: '+44', currency: 'GBP' },
  { code: 'US', name: 'United States', flag: '🇺🇸', phoneCode: '+1', currency: 'USD' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', phoneCode: '+1', currency: 'CAD' },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', phoneCode: '+971', currency: 'AED' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', phoneCode: '+49', currency: 'EUR' },
  { code: 'FR', name: 'France', flag: '🇫🇷', phoneCode: '+33', currency: 'EUR' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', phoneCode: '+61', currency: 'AUD' },
];

export const countriesApi = {
  /**
   * Fetches supported countries from the backend API.
   * Target endpoint: GET /api/v1/countries
   */
  getCountries: async (): Promise<Country[]> => {
    try {
      const response = await apiClient.get<ApiResponse<Country[]> | Country[] | { countries: Country[] }>('/countries');
      const raw = response.data;
      
      let list: any[] = [];
      if (Array.isArray(raw)) {
        list = raw;
      } else if (raw && Array.isArray((raw as any).data)) {
        list = (raw as any).data;
      } else if (raw && Array.isArray((raw as any).countries)) {
        list = (raw as any).countries;
      }

      if (list.length > 0) {
        return list.map((item) => ({
          code: String(item.code || item.iso || item.value || item.id || '').toUpperCase(),
          name: String(item.name || item.label || item.country || ''),
          flag: item.flag || item.icon || item.emoji || '🌐',
          phoneCode: item.phoneCode || item.phone_code || item.dialCode || undefined,
          currency: item.currency || undefined,
        })).filter((c) => Boolean(c.name));
      }

      return DEFAULT_COUNTRIES;
    } catch (error) {
      console.warn('Backend /countries endpoint not available or returned error, using fallback countries list:', error);
      return DEFAULT_COUNTRIES;
    }
  },
};
