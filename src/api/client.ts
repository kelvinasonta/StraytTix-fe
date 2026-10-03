import axios, { AxiosError } from 'axios';
import { tokenStorage } from '../utils/storage';
import type { ApiErrorResponse } from '../types/auth';
import type { ApiResponse, AuthPayload } from '../types/api';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1`;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 15000,
});

const isPublicAuthRoute = (url?: string): boolean => {
  if (!url) return false;
  const publicRoutes = [
    '/auth/login',
    '/auth/register',
    '/auth/password/forgot',
    '/auth/password/reset',
    '/auth/email/verify',
    '/auth/invitations/accept',
    '/invitations/accept',
    '/auth/invitations/verify',
    '/invitations/verify'
  ];
  return publicRoutes.some((route) => url.includes(route));
};

apiClient.interceptors.request.use(
  (config) => {
    // Always attach Bearer token if user is authenticated
    const token = tokenStorage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const organizerUuid = tokenStorage.getActiveOrganizerUuid();
    if (organizerUuid) {
      config.headers['X-Organizer-UUID'] = organizerUuid;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<any>) => {
    const response = error.response;
    const originalRequest = error.config;

    if (response) {
      const status = response.status;
      const isPublic = isPublicAuthRoute(originalRequest?.url);

      // Handle 401 and try auto refresh only for authenticated/protected routes
      if (status === 401 && !isPublic && originalRequest && !(originalRequest as any)._retry) {
        (originalRequest as any)._retry = true;
        try {
          const isRemembered = tokenStorage.isRemembered();
          const refreshRes = await axios.post<ApiResponse<AuthPayload>>(
            `${API_BASE_URL}/auth/refresh`,
            {},
            {
              headers: {
                Authorization: `Bearer ${tokenStorage.getToken()}`,
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
            }
          );
          if (refreshRes.data && refreshRes.data.success) {
            const newToken = refreshRes.data.data.token;
            tokenStorage.setToken(newToken, isRemembered);
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            return apiClient(originalRequest);
          }
        } catch (refreshErr) {
          tokenStorage.clearAll();
          if (
            !window.location.pathname.startsWith('/login') &&
            !window.location.pathname.startsWith('/verify-email') &&
            !window.location.pathname.startsWith('/invitations')
          ) {
            window.location.href = `/login?expired=true`;
          }
          return Promise.reject(refreshErr);
        }
      }

      // Handle 403 EMAIL_VERIFICATION_REQUIRED
      if (status === 403 && response.data && response.data.code === 'EMAIL_VERIFICATION_REQUIRED') {
        if (
          !window.location.pathname.startsWith('/verify-email') &&
          !window.location.pathname.startsWith('/invitations')
        ) {
          window.location.href = '/verify-email/pending';
        }
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Recursively extracts error message strings from any nested errors payload
 * (such as Laravel validation errors, arrays of strings, or nested objects).
 */
export const extractValidationMessages = (errors: unknown): string[] => {
  if (!errors) return [];
  if (typeof errors === 'string') {
    const trimmed = errors.trim();
    return trimmed ? [trimmed] : [];
  }
  if (Array.isArray(errors)) {
    return errors
      .flatMap((item) => {
        if (typeof item === 'string') return [item.trim()];
        if (item && typeof item === 'object') {
          if ('message' in item && typeof (item as any).message === 'string') {
            return [(item as any).message.trim()];
          }
          return extractValidationMessages(Object.values(item));
        }
        return [String(item)];
      })
      .filter(Boolean);
  }
  if (typeof errors === 'object') {
    return Object.values(errors as Record<string, unknown>).flatMap((val) => extractValidationMessages(val));
  }
  return [String(errors)];
};

export const getApiErrorMessage = (error: unknown, defaultFallback?: string): string => {
  if (!error) return defaultFallback || 'An unexpected error occurred.';

  // If a raw string was provided
  if (typeof error === 'string') {
    return error.trim() || defaultFallback || 'An unexpected error occurred.';
  }

  const errObj = error as any;
  const response = errObj?.response;
  const data = response?.data || errObj?.data || (errObj && typeof errObj === 'object' && ('errors' in errObj || 'message' in errObj || 'code' in errObj) ? errObj : null);

  // No response from server when using axios (network drop, DNS failure, connection refused)
  if (axios.isAxiosError(error) && !response) {
    if (error.code === 'ECONNABORTED') {
      return 'Request timed out. Please check your internet connection.';
    }
    return 'Unable to connect to the server. Please check your internet connection.';
  }

  if (data) {
    // 1. Check for field-level validation errors (e.g. { errors: { eventCategory: ["The event category field must not have more than 5 items."] } })
    if (data.errors) {
      const messages = extractValidationMessages(data.errors);
      const unique = Array.from(new Set(messages.map((m) => m.trim()))).filter(Boolean);
      if (unique.length > 0) {
        return unique.join(' ');
      }
    }

    // 2. Check for singular 'error' object or string
    if (data.error) {
      const messages = extractValidationMessages(data.error);
      const unique = Array.from(new Set(messages.map((m) => m.trim()))).filter(Boolean);
      if (unique.length > 0) {
        return unique.join(' ');
      }
    }

    // 3. Check for top-level 'message' string
    if (data.message && typeof data.message === 'string') {
      const trimmed = data.message.trim();

      // Discard generic/technical backend "Resource not found." messages
      if (/^resource not found\.?$/i.test(trimmed) || /^route .* not found\.?$/i.test(trimmed)) {
        return defaultFallback || 'Unable to connect to the service. Please try again later.';
      }

      // If the backend sent a generic validation message like "Validation failed." without errors field, provide friendly guidance
      if (/^validation failed\.?$/i.test(trimmed) || /^the given data was invalid\.?$/i.test(trimmed)) {
        return defaultFallback || 'Validation failed. Please check the entered information and try again.';
      }

      return data.message;
    }
  }

  // HTTP status codes fallbacks
  if (response?.status === 404) {
    return defaultFallback || 'Unable to connect to the service. Please try again later.';
  }
  if (response?.status === 429) {
    return 'Too many requests. Please wait a moment and try again.';
  }
  if (response?.status === 500) {
    return 'An internal server error occurred. Please try again later.';
  }

  if (error instanceof Error && error.message) {
    if (/^resource not found\.?$/i.test(error.message.trim())) {
      return defaultFallback || 'Unable to connect to the service. Please try again later.';
    }
    return error.message;
  }

  return defaultFallback || 'Unable to connect to the server. Please check your connection and try again.';
};

/**
 * Extracts validation field errors from Axios errors or error responses
 */
export const getValidationErrors = (error: unknown): Record<string, string[]> => {
  const errObj = error as any;
  const data = errObj?.response?.data || errObj?.data || (errObj && typeof errObj === 'object' && 'errors' in errObj ? errObj : null);
  if (data && data.errors && typeof data.errors === 'object' && !Array.isArray(data.errors)) {
    const normalized: Record<string, string[]> = {};
    for (const [key, val] of Object.entries(data.errors)) {
      if (Array.isArray(val)) {
        normalized[key] = val.map(String);
      } else if (typeof val === 'string') {
        normalized[key] = [val];
      }
    }
    return normalized;
  }
  return {};
};

export const extractThrottleSeconds = (error: unknown): number | null => {
  const errObj = error as any;
  if (!errObj) return null;

  // 1. Check Retry-After header
  const retryHeader = errObj?.response?.headers?.['retry-after'];
  if (retryHeader) {
    const parsed = parseInt(retryHeader, 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }

  // 2. Check message string for numbers e.g. "try again in 718 seconds"
  const message = errObj?.response?.data?.message || errObj?.message || '';
  if (typeof message === 'string') {
    const match = message.match(/(?:try again in|wait|throttle.*)\s+(\d+)\s*(?:seconds?|s)/i);
    if (match && match[1]) {
      const parsed = parseInt(match[1], 10);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
  }

  // 3. Direct response fields
  const direct = errObj?.response?.data?.retry_after ?? errObj?.response?.data?.seconds;
  if (typeof direct === 'number' && direct > 0) return direct;

  return null;
};

export default apiClient;

