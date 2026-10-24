import apiClient from './client';
import type { ApiResponse, AuthPayload, User, Organizer, LoginSession, LoginHistoryPagination } from '../types/api';

/**
 * Normalizes timezone string to valid IANA timezone identifier.
 * Strips human-readable offset notations like "(GMT+3)" or "(WAT, GMT+1)"
 * e.g., "Africa/Nairobi (GMT+3)" -> "Africa/Nairobi"
 */
export function normalizeTimezone(tz?: string | null): string | undefined {
  if (!tz) return undefined;
  const cleaned = tz.replace(/\s*\([^)]*\).*$/, '').trim();
  return cleaned || undefined;
}

/**
 * Normalizes backend session payload into standard LoginSession interface
 */
export function normalizeSession(sess: any): LoginSession {
  const ua = sess.user_agent || sess.userAgent || '';
  const name = sess.name || '';
  let device = sess.device;
  let os = sess.os;
  let browser = sess.browser;
  let type: 'desktop' | 'mobile' | 'tablet' = sess.type || 'desktop';

  if (name && (!device || !os || !browser)) {
    if (name.includes(' on ')) {
      const parts = name.split(' on ');
      browser = browser || parts[0]?.trim();
      os = os || parts[1]?.trim();
    }
    if (/iPhone/i.test(name)) {
      device = device || 'iPhone';
      type = 'mobile';
      os = os || 'iOS';
    } else if (/iPad/i.test(name)) {
      device = device || 'iPad';
      type = 'tablet';
      os = os || 'iPadOS';
    } else if (/Android/i.test(name)) {
      device = device || 'Android Device';
      type = /Tablet/i.test(name) ? 'tablet' : 'mobile';
      os = os || 'Android';
    } else if (/macOS|Mac/i.test(name)) {
      device = device || 'Mac';
      type = 'desktop';
      os = os || 'macOS';
    } else if (/Windows/i.test(name)) {
      device = device || 'Windows PC';
      type = 'desktop';
      os = os || 'Windows';
    } else if (/Linux/i.test(name)) {
      device = device || 'Linux Workstation';
      type = 'desktop';
      os = os || 'Linux';
    }
  }

  if (!device || !os || !browser) {
    if (/iPad|Tablet/i.test(ua)) {
      type = 'tablet';
      device = device || 'Tablet Device';
      os = os || 'iPadOS / Tablet';
      browser = browser || 'Mobile Browser';
    } else if (/iPhone|Android.*Mobile|Mobile/i.test(ua)) {
      type = 'mobile';
      device = device || (/iPhone/i.test(ua) ? 'iPhone' : 'Smartphone');
      os = os || (/iPhone/i.test(ua) ? 'iOS' : 'Android');
      browser = browser || (/Chrome/i.test(ua) ? 'Chrome Mobile' : 'Mobile Safari');
    } else {
      type = 'desktop';
      device = device || (/Macintosh|Mac OS X/i.test(ua) ? 'Mac' : /Windows/i.test(ua) ? 'Windows PC' : 'Workstation');
      os = os || (/Macintosh|Mac OS X/i.test(ua) ? 'macOS' : /Windows/i.test(ua) ? 'Windows' : /Linux/i.test(ua) ? 'Linux' : 'Desktop OS');
      browser = browser || (/Chrome/i.test(ua) ? 'Chrome' : /Safari/i.test(ua) ? 'Safari' : /Firefox/i.test(ua) ? 'Firefox' : 'Web Browser');
    }
  }

  let lastActive = sess.lastActive || sess.last_active;
  if (!lastActive && (sess.lastUsedAt || sess.last_used_at || sess.last_active_at)) {
    const rawDate = sess.lastUsedAt || sess.last_used_at || sess.last_active_at;
    const diffMs = Math.max(0, Date.now() - new Date(rawDate).getTime());
    if (diffMs < 3 * 60 * 1000) {
      lastActive = 'Active now';
    } else if (diffMs < 60 * 60 * 1000) {
      const mins = Math.max(1, Math.round(diffMs / 60000));
      lastActive = `${mins} minute${mins === 1 ? '' : 's'} ago`;
    } else if (diffMs < 24 * 60 * 60 * 1000) {
      const hours = Math.round(diffMs / 3600000);
      lastActive = `${hours} hour${hours === 1 ? '' : 's'} ago`;
    } else {
      lastActive = new Date(rawDate).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  } else if (!lastActive && sess.last_activity) {
    lastActive = new Date(sess.last_activity * 1000).toLocaleString();
  }

  return {
    id: String(sess.id),
    name: sess.name || `${browser || 'Browser'} on ${os || 'Device'}`,
    device: device || (sess.name ? sess.name : 'Personal Device'),
    os: os || 'OS',
    browser: browser || 'Browser',
    ip: sess.ip || sess.ipAddress || sess.ip_address || '127.0.0.1',
    location: sess.location || (sess.city && sess.country ? `${sess.city}, ${sess.country}` : 'Current Network'),
    lastActive: lastActive || 'Recently',
    lastUsedAt: sess.lastUsedAt || sess.last_used_at,
    createdAt: sess.createdAt || sess.created_at,
    isCurrent: Boolean(sess.isCurrent ?? sess.is_current),
    type,
    user_agent: ua,
  };
}

export const authApi = {
  async register(payload: any): Promise<ApiResponse<AuthPayload>> {
    const { data } = await apiClient.post<ApiResponse<AuthPayload>>('/auth/register', payload);
    return data;
  },

  async login(payload: any): Promise<ApiResponse<AuthPayload>> {
    const { data } = await apiClient.post<ApiResponse<AuthPayload>>('/auth/login', payload);
    return data;
  },

  async getMe(): Promise<ApiResponse<{ user: User; organizer: Organizer | null; email_verified: boolean }>> {
    const { data } = await apiClient.get<ApiResponse<{ user: User; organizer: Organizer | null; email_verified: boolean }>>('/auth/me');
    return data;
  },

  async refresh(): Promise<ApiResponse<AuthPayload>> {
    const { data } = await apiClient.post<ApiResponse<AuthPayload>>('/auth/refresh');
    return data;
  },

  async logout(): Promise<ApiResponse<null>> {
    const { data } = await apiClient.post<ApiResponse<null>>('/auth/logout');
    return data;
  },

  async forgotPassword(email: string): Promise<ApiResponse<string>> {
    const { data } = await apiClient.post<ApiResponse<string>>('/auth/password/forgot', { email });
    return data;
  },

  async resetPassword(payload: any): Promise<ApiResponse<string>> {
    const { data } = await apiClient.post<ApiResponse<string>>('/auth/password/reset', payload);
    return data;
  },

  async updateProfile(payload: { first_name?: string; last_name?: string; phone?: string; timezone?: string; avatar?: string }): Promise<ApiResponse<User>> {
    const body = {
      ...payload,
      timezone: payload.timezone ? normalizeTimezone(payload.timezone) : undefined,
    };
    const { data } = await apiClient.put<ApiResponse<User>>('/auth/profile', body);
    return data;
  },

  async updatePassword(payload: {
    current_password?: string;
    currentPassword?: string;
    old_password?: string;
    password?: string;
    new_password?: string;
    newPassword?: string;
    password_confirmation?: string;
    passwordConfirmation?: string;
    confirm_password?: string;
    confirmPassword?: string;
  }): Promise<ApiResponse<any>> {
    const current = payload.current_password || payload.currentPassword || payload.old_password || '';
    const newPwd = payload.password || payload.new_password || payload.newPassword || '';
    const confirmPwd = payload.password_confirmation || payload.passwordConfirmation || payload.confirm_password || payload.confirmPassword || newPwd;

    const body = {
      current_password: current,
      password: newPwd,
      password_confirmation: confirmPwd,
      new_password: newPwd,
      new_password_confirmation: confirmPwd,
    };

    try {
      const { data } = await apiClient.put<ApiResponse<any>>('/auth/password', body);
      return data;
    } catch (err: any) {
      if (err.response?.status === 405) {
        try {
          const { data } = await apiClient.post<ApiResponse<any>>('/auth/password', body);
          return data;
        } catch (postErr: any) {
          if (postErr.response?.status === 405) {
            const { data } = await apiClient.patch<ApiResponse<any>>('/auth/password', body);
            return data;
          }
          throw postErr;
        }
      }
      throw err;
    }
  },

  async deleteAccount(): Promise<ApiResponse<null>> {
    const { data } = await apiClient.delete<ApiResponse<null>>('/auth/account');
    return data;
  },

  async getSessions(): Promise<ApiResponse<LoginSession[]>> {
    const { data } = await apiClient.get<ApiResponse<any[]>>('/auth/sessions');
    if (data && Array.isArray(data.data)) {
      return {
        ...data,
        data: data.data.map(normalizeSession)
      };
    }
    return data as ApiResponse<LoginSession[]>;
  },

  async revokeSession(sessionId: string | number): Promise<ApiResponse<any>> {
    try {
      const { data } = await apiClient.delete<ApiResponse<any>>(`/auth/sessions/${sessionId}`);
      return data;
    } catch (err: any) {
      if (err.response?.status === 405) {
        const { data } = await apiClient.post<ApiResponse<any>>(`/auth/sessions/${sessionId}/revoke`);
        return data;
      }
      throw err;
    }
  },

  async logoutOthers(): Promise<ApiResponse<string>> {
    try {
      const { data } = await apiClient.post<ApiResponse<string>>('/auth/sessions/logout-others');
      return data;
    } catch (err: any) {
      if (err.response?.status === 404 || err.response?.status === 405) {
        const { data } = await apiClient.post<ApiResponse<string>>('/auth/logout-others');
        return data;
      }
      throw err;
    }
  },

  async getSessionHistory(page: number = 1, perPage: number = 15): Promise<ApiResponse<LoginHistoryPagination>> {
    const { data } = await apiClient.get<ApiResponse<LoginHistoryPagination>>('/auth/sessions/history', {
      params: { page, per_page: perPage }
    });
    return data;
  },

  async acceptInvitation(payload: any): Promise<ApiResponse<AuthPayload>> {
    const { data } = await apiClient.post<ApiResponse<AuthPayload>>('/auth/invitations/accept', payload);
    return data;
  },

  async verifyInvitation(token: string): Promise<ApiResponse<{
    email: string;
    role: string;
    organizer_name?: string;
    expires_at?: string;
  }>> {
    const { data } = await apiClient.post<ApiResponse<{
      email: string;
      role: string;
      organizer_name?: string;
      expires_at?: string;
    }>>('/auth/invitations/verify', { token });
    return data;
  },

  async verifyEmail(token: string): Promise<ApiResponse<any>> {
    const { data } = await apiClient.post<ApiResponse<any>>('/auth/email/verify', { token });
    return data;
  },

  async resendVerificationEmail(): Promise<ApiResponse<any>> {
    const { data } = await apiClient.post<ApiResponse<any>>('/auth/email/resend');
    return data;
  }
};
