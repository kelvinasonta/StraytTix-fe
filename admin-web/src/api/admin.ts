import { adminClient } from './client';
import type { ApiResponse, AppSettings, AdminUser } from '../types/api';

export interface AdminVerificationRequester {
  id: number;
  uuid: string;
  name: string;
  email: string;
}

export interface AdminVerificationReviewer {
  id: number;
  uuid: string;
  name: string;
}

export interface AdminVerificationDocument {
  name?: string;
  type?: string;
  url: string;
  size?: number;
}

export interface AdminVerification {
  id: string; // uuid
  organizer_id: string;
  status: 'unverified' | 'pending' | 'verified' | 'rejected';
  business_name: string;
  business_type?: string;
  registration_number?: string;
  tax_id?: string;
  website_url?: string;
  official_email?: string;
  official_phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  documents?: AdminVerificationDocument[];
  rejection_reason?: string | null;
  requester?: AdminVerificationRequester;
  reviewer?: AdminVerificationReviewer;
  reviewed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface VerificationListResponse {
  data: AdminVerification[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  links?: {
    first?: string;
    last?: string;
    prev?: string | null;
    next?: string | null;
  };
}

export interface ReviewVerificationPayload {
  action: 'approve' | 'reject';
  reason?: string;
}

export interface FeatureFlagItem {
  name: string;
  key: string;
  label: string;
  description: string;
  category: string;
  active: boolean;
  isActive: boolean;
}

export interface AdminDashboardStats {
  period: string;
  start_date?: string | null;
  end_date?: string | null;
  financials: {
    gmv: number;
    net_revenue: number;
    paid_orders_count: number;
    active_escrow_balance: number;
    total_paid_out: number;
    pending_payouts_amount: number;
    pending_payouts_count: number;
  };
  tickets: {
    total_sold: number;
    paid_count: number;
    free_count: number;
  };
  events: {
    total: number;
    published: number;
    draft: number;
    cancelled: number;
  };
  community: {
    total_users: number;
    active_users: number;
    total_organizers: number;
    verified_organizers: number;
    pending_kyc_verifications: number;
  };
}

export interface AdminChartPoint {
  date: string;
  gmv: number;
  net_revenue: number;
  orders_count: number;
  tickets_count: number;
}

export interface AdminChartsResponse {
  days: number;
  start_date: string;
  end_date: string;
  timeline: AdminChartPoint[];
}

export interface AdminOrganizerItem {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  email?: string;
  phone?: string;
  type: string;
  is_active: boolean;
  suspended_at?: string | null;
  suspension_reason?: string | null;
  verification_status: string;
  events_count?: number;
  created_at: string;
  user?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface AdminUserItem {
  id: number;
  uuid: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  account_type: string;
  status: string;
  is_admin: boolean;
  admin_role?: string | null;
  suspended_at?: string | null;
  suspension_reason?: string | null;
  email_verified_at?: string | null;
  created_at: string;
}

export interface AdminEventItem {
  id: number;
  uuid: string;
  title: string;
  slug: string;
  status: string;
  is_featured: boolean;
  tickets_count?: number;
  created_at: string;
  organizer?: {
    id: number;
    uuid: string;
    name: string;
    slug: string;
  };
}

export interface AdminOrderItem {
  id: number;
  uuid: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  status: string;
  total: string | number;
  service_fee: string | number;
  currency: string;
  paid_at?: string | null;
  created_at: string;
  organizer?: {
    id: number;
    uuid: string;
    name: string;
  };
  event?: {
    id: number;
    uuid: string;
    title: string;
  };
}

export interface AdminPayoutItem {
  id: number;
  uuid: string;
  amount: string | number;
  currency: string;
  status: string;
  bank_name?: string;
  account_number?: string;
  account_name?: string;
  admin_notes?: string | null;
  rejection_reason?: string | null;
  created_at: string;
  organizer?: {
    id: number;
    uuid: string;
    name: string;
  };
}

export const adminApi = {
  // Admin Authentication
  login: async (credentials: { email: string; password: string }): Promise<{ token: string; user: AdminUser }> => {
    // Uses the dedicated admin login endpoint or standard auth login
    const response = await adminClient.post<any>('/admin/auth/login', credentials).catch(async () => {
      return await adminClient.post<any>('/auth/login', credentials);
    });
    const data = response.data?.data || response.data;
    const token = data.token || data.access_token || data.accessToken;
    const rawUser = data.admin || data.user || data;
    const user: AdminUser = {
      id: rawUser.id || rawUser.uuid,
      uuid: rawUser.uuid,
      first_name: rawUser.first_name || rawUser.name?.split(' ')[0] || 'Admin',
      last_name: rawUser.last_name || rawUser.name?.split(' ').slice(1).join(' ') || 'User',
      email: rawUser.email,
      role: 'admin',
      is_admin: true,
      admin_role: rawUser.admin_role || 'superadmin',
      admin_permissions: rawUser.permissions || rawUser.admin_permissions || ['*'],
    };
    return { token, user };
  },

  getMe: async (): Promise<AdminUser> => {
    const response = await adminClient.get<any>('/admin/auth/me').catch(async () => {
      return await adminClient.get<any>('/auth/me');
    });
    return response.data?.data || response.data;
  },

  logout: async (): Promise<void> => {
    try {
      await adminClient.post('/admin/auth/logout').catch(async () => {
        await adminClient.post('/auth/logout');
      });
    } catch {
      // Ignore network errors on logout
    }
  },

  // Dashboard Overview
  getDashboardStats: async (period: string = '30d'): Promise<AdminDashboardStats> => {
    const response = await adminClient.get<ApiResponse<AdminDashboardStats>>('/admin/dashboard/stats', {
      params: { period }
    });
    return response.data.data;
  },

  getStats: async (params?: { period?: string }): Promise<AdminDashboardStats> => {
    const response = await adminClient.get<ApiResponse<AdminDashboardStats>>('/admin/dashboard/stats', {
      params
    });
    return response.data.data;
  },

  getDashboardCharts: async (days: number = 30): Promise<AdminChartsResponse> => {
    const response = await adminClient.get<ApiResponse<AdminChartsResponse>>('/admin/dashboard/charts', {
      params: { days }
    });
    return response.data.data;
  },

  getCharts: async (params?: { days?: number }): Promise<AdminChartsResponse> => {
    const response = await adminClient.get<ApiResponse<AdminChartsResponse>>('/admin/dashboard/charts', {
      params
    });
    return response.data.data;
  },

  // Organizers
  getOrganizers: async (params?: { search?: string; status?: string; page?: number }): Promise<any> => {
    const response = await adminClient.get<ApiResponse<any>>('/admin/organizers', { params });
    return response.data.data;
  },

  getOrganizerDossier: async (uuid: string): Promise<any> => {
    const response = await adminClient.get<ApiResponse<any>>(`/admin/organizers/${uuid}`);
    return response.data.data;
  },

  suspendOrganizer: async (uuid: string, reason: string): Promise<any> => {
    const response = await adminClient.post<ApiResponse<any>>(`/admin/organizers/${uuid}/suspend`, { reason });
    return response.data.data;
  },

  unsuspendOrganizer: async (uuid: string): Promise<any> => {
    const response = await adminClient.post<ApiResponse<any>>(`/admin/organizers/${uuid}/unsuspend`);
    return response.data.data;
  },

  // Users
  getUsers: async (params?: { search?: string; status?: string; role?: string; category?: string; page?: number }): Promise<any> => {
    const response = await adminClient.get<ApiResponse<any>>('/admin/users', { params });
    return response.data.data;
  },

  getUserDetails: async (uuid: string): Promise<any> => {
    const response = await adminClient.get<ApiResponse<any>>(`/admin/users/${uuid}`);
    return response.data.data;
  },

  suspendUser: async (uuid: string, reason: string): Promise<any> => {
    const response = await adminClient.post<ApiResponse<any>>(`/admin/users/${uuid}/suspend`, { reason });
    return response.data.data;
  },

  unsuspendUser: async (uuid: string): Promise<any> => {
    const response = await adminClient.post<ApiResponse<any>>(`/admin/users/${uuid}/unsuspend`);
    return response.data.data;
  },

  revokeUserSessions: async (uuid: string): Promise<any> => {
    const response = await adminClient.post<ApiResponse<any>>(`/admin/users/${uuid}/revoke-sessions`);
    return response.data.data;
  },

  verifyUserEmail: async (uuid: string): Promise<any> => {
    const response = await adminClient.post<ApiResponse<any>>(`/admin/users/${uuid}/verify-email`);
    return response.data.data;
  },

  // Events Moderation
  getEvents: async (params?: { search?: string; status?: string; is_featured?: boolean; page?: number }): Promise<any> => {
    const response = await adminClient.get<ApiResponse<any>>('/admin/events', { params });
    return response.data.data;
  },

  getEventDetails: async (uuid: string): Promise<any> => {
    const response = await adminClient.get<ApiResponse<any>>(`/admin/events/${uuid}`);
    return response.data.data;
  },

  delistEvent: async (uuid: string, reason: string): Promise<any> => {
    const response = await adminClient.post<ApiResponse<any>>(`/admin/events/${uuid}/delist`, { reason });
    return response.data.data;
  },

  cancelEvent: async (uuid: string, reason: string): Promise<any> => {
    const response = await adminClient.post<ApiResponse<any>>(`/admin/events/${uuid}/cancel`, { reason });
    return response.data.data;
  },

  featureEvent: async (uuid: string, isFeatured?: boolean): Promise<any> => {
    const response = await adminClient.post<ApiResponse<any>>(`/admin/events/${uuid}/feature`, { is_featured: isFeatured });
    return response.data.data;
  },

  getEventAttendees: async (uuid: string, params?: { search?: string; page?: number }): Promise<any> => {
    const response = await adminClient.get<ApiResponse<any>>(`/admin/events/${uuid}/attendees`, { params });
    return response.data.data;
  },

  // Finance & Settlement
  getOrders: async (params?: { search?: string; status?: string; page?: number }): Promise<any> => {
    const response = await adminClient.get<ApiResponse<any>>('/admin/finance/orders', { params });
    return response.data.data;
  },

  getPayouts: async (params?: { status?: string; page?: number }): Promise<any> => {
    const response = await adminClient.get<ApiResponse<any>>('/admin/finance/payouts', { params });
    return response.data.data;
  },

  approvePayout: async (uuid: string, notes?: string): Promise<any> => {
    const response = await adminClient.post<ApiResponse<any>>(`/admin/finance/payouts/${uuid}/approve`, { notes });
    return response.data.data;
  },

  rejectPayout: async (uuid: string, reason: string): Promise<any> => {
    const response = await adminClient.post<ApiResponse<any>>(`/admin/finance/payouts/${uuid}/reject`, { reason });
    return response.data.data;
  },

  // System Audit Logs
  getAuditLogs: async (params?: { search?: string; action?: string; target_type?: string; per_page?: number; page?: number }): Promise<any> => {
    const response = await adminClient.get<ApiResponse<any>>('/admin/audit-logs', { params });
    return response.data.data;
  },

  getAuditLogDetails: async (id: number | string): Promise<any> => {
    const response = await adminClient.get<ApiResponse<any>>(`/admin/audit-logs/${id}`);
    return response.data.data;
  },

  // Verifications KYC
  getVerifications: async (params?: { status?: string; per_page?: number; page?: number }): Promise<VerificationListResponse> => {
    const response = await adminClient.get<ApiResponse<VerificationListResponse>>('/admin/verifications', { params });
    return response.data.data;
  },

  getVerification: async (uuid: string): Promise<AdminVerification> => {
    const response = await adminClient.get<ApiResponse<AdminVerification>>(`/admin/verifications/${uuid}`);
    return response.data.data;
  },

  reviewVerification: async (uuid: string, payload: ReviewVerificationPayload): Promise<AdminVerification> => {
    const response = await adminClient.post<ApiResponse<AdminVerification>>(`/admin/verifications/${uuid}/review`, payload);
    return response.data.data;
  },

  // Settings & Feature Flags
  getFeatureFlags: async (): Promise<Record<string, boolean>> => {
    try {
      const response = await adminClient.get<any>('/admin/feature-flags');
      const data = response.data?.data || response.data?.flags || response.data;
      if (typeof data === 'object' && data !== null) {
        const mapped: Record<string, boolean> = {};
        Object.entries(data).forEach(([k, v]: [string, any]) => {
          if (typeof v === 'boolean') {
            mapped[k] = v;
          } else if (typeof v === 'object' && v !== null) {
            mapped[k] = Boolean(v.active ?? v.isActive ?? v.is_active);
          }
        });
        return mapped;
      }
      return {};
    } catch {
      return {};
    }
  },

  getFeatureFlagsDetailed: async (): Promise<FeatureFlagItem[]> => {
    const response = await adminClient.get<any>('/admin/feature-flags');
    const data = response.data?.data || response.data || {};
    if (Array.isArray(data)) {
      return data.map((item: any) => ({
        name: item.name || item.key,
        key: item.name || item.key,
        label: item.label || item.name || item.key,
        description: item.description || '',
        category: item.category || 'system',
        active: Boolean(item.active ?? item.isActive ?? item.is_active),
        isActive: Boolean(item.active ?? item.isActive ?? item.is_active),
      }));
    }
    return Object.entries(data).map(([key, item]: [string, any]) => ({
      name: item.name || key,
      key: item.name || key,
      label: item.label || key,
      description: item.description || '',
      category: item.category || 'system',
      active: Boolean(item.active ?? item.isActive ?? item.is_active),
      isActive: Boolean(item.active ?? item.isActive ?? item.is_active),
    }));
  },

  toggleFeatureFlag: async (feature: string, isActive: boolean): Promise<any> => {
    const response = await adminClient.post<any>(`/admin/feature-flags/${feature}/toggle`, {
      is_active: isActive,
    });
    return response.data;
  },

  getSettings: async (): Promise<AppSettings> => {
    const response = await adminClient.get<ApiResponse<AppSettings>>('/admin/settings');
    return response.data.data;
  },

  updateSettings: async (payload: Partial<AppSettings>): Promise<AppSettings> => {
    const response = await adminClient.post<ApiResponse<AppSettings>>('/admin/settings', payload);
    return response.data.data;
  },
};

