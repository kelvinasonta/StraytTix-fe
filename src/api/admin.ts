import { apiClient } from './client';
import type { ApiResponse, AppSettings } from '../types/api';

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

export interface FeatureFlagToggleResponse {
  status: string;
  message: string;
  feature: string;
  is_active: boolean;
}

export interface FeatureFlagRecord {
  key: string;
  label?: string;
  description?: string;
  isActive: boolean;
  group?: string;
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
  getStats: async (params?: { period?: string; start_date?: string; end_date?: string }): Promise<AdminDashboardStats> => {
    const response = await apiClient.get<ApiResponse<AdminDashboardStats>>('/admin/dashboard/stats', { params });
    return response.data.data;
  },

  getCharts: async (params?: { days?: number }): Promise<AdminChartsResponse> => {
    const response = await apiClient.get<ApiResponse<AdminChartsResponse>>('/admin/dashboard/charts', { params });
    return response.data.data;
  },

  getOrganizers: async (params?: { search?: string; status?: string; is_verified?: boolean; page?: number }): Promise<any> => {
    const response = await apiClient.get<ApiResponse<any>>('/admin/organizers', { params });
    return response.data.data;
  },

  getOrganizerDossier: async (uuid: string): Promise<any> => {
    const response = await apiClient.get<ApiResponse<any>>(`/admin/organizers/${uuid}`);
    return response.data.data;
  },

  suspendOrganizer: async (uuid: string, reason: string): Promise<any> => {
    const response = await apiClient.post<ApiResponse<any>>(`/admin/organizers/${uuid}/suspend`, { reason });
    return response.data.data;
  },

  unsuspendOrganizer: async (uuid: string): Promise<any> => {
    const response = await apiClient.post<ApiResponse<any>>(`/admin/organizers/${uuid}/unsuspend`);
    return response.data.data;
  },

  updateOrganizerPlan: async (
    uuid: string,
    payload: {
      plan_tier?: 'free' | 'pro' | 'enterprise';
      duration_days?: number | null;
      custom_fee_percentage?: number | null;
      custom_fee_fixed?: number | null;
    }
  ): Promise<any> => {
    const response = await apiClient.post<ApiResponse<any>>(`/admin/organizers/${uuid}/plan`, payload);
    return response.data.data;
  },

  getUsers: async (params?: { search?: string; status?: string; is_admin?: boolean; page?: number }): Promise<any> => {
    const response = await apiClient.get<ApiResponse<any>>('/admin/users', { params });
    return response.data.data;
  },

  getUserDetails: async (uuid: string): Promise<any> => {
    const response = await apiClient.get<ApiResponse<any>>(`/admin/users/${uuid}`);
    return response.data.data;
  },

  suspendUser: async (uuid: string, reason: string): Promise<any> => {
    const response = await apiClient.post<ApiResponse<any>>(`/admin/users/${uuid}/suspend`, { reason });
    return response.data.data;
  },

  unsuspendUser: async (uuid: string): Promise<any> => {
    const response = await apiClient.post<ApiResponse<any>>(`/admin/users/${uuid}/unsuspend`);
    return response.data.data;
  },

  revokeUserSessions: async (uuid: string): Promise<any> => {
    const response = await apiClient.post<ApiResponse<any>>(`/admin/users/${uuid}/revoke-sessions`);
    return response.data.data;
  },

  verifyUserEmail: async (uuid: string): Promise<any> => {
    const response = await apiClient.post<ApiResponse<any>>(`/admin/users/${uuid}/verify-email`);
    return response.data.data;
  },

  getEvents: async (params?: { search?: string; status?: string; is_featured?: boolean; page?: number }): Promise<any> => {
    const response = await apiClient.get<ApiResponse<any>>('/admin/events', { params });
    return response.data.data;
  },

  getEventDetails: async (uuid: string): Promise<any> => {
    const response = await apiClient.get<ApiResponse<any>>(`/admin/events/${uuid}`);
    return response.data.data;
  },

  delistEvent: async (uuid: string, reason: string): Promise<any> => {
    const response = await apiClient.post<ApiResponse<any>>(`/admin/events/${uuid}/delist`, { reason });
    return response.data.data;
  },

  cancelEvent: async (uuid: string, reason: string): Promise<any> => {
    const response = await apiClient.post<ApiResponse<any>>(`/admin/events/${uuid}/cancel`, { reason });
    return response.data.data;
  },

  featureEvent: async (uuid: string, isFeatured?: boolean): Promise<any> => {
    const response = await apiClient.post<ApiResponse<any>>(`/admin/events/${uuid}/feature`, { is_featured: isFeatured });
    return response.data.data;
  },

  getEventAttendees: async (uuid: string, params?: { search?: string; page?: number }): Promise<any> => {
    const response = await apiClient.get<ApiResponse<any>>(`/admin/events/${uuid}/attendees`, { params });
    return response.data.data;
  },

  getOrders: async (params?: { search?: string; status?: string; page?: number }): Promise<any> => {
    const response = await apiClient.get<ApiResponse<any>>('/admin/finance/orders', { params });
    return response.data.data;
  },

  getPayouts: async (params?: { status?: string; page?: number }): Promise<any> => {
    const response = await apiClient.get<ApiResponse<any>>('/admin/finance/payouts', { params });
    return response.data.data;
  },

  approvePayout: async (uuid: string, notes?: string): Promise<any> => {
    const response = await apiClient.post<ApiResponse<any>>(`/admin/finance/payouts/${uuid}/approve`, { notes });
    return response.data.data;
  },

  rejectPayout: async (uuid: string, reason: string): Promise<any> => {
    const response = await apiClient.post<ApiResponse<any>>(`/admin/finance/payouts/${uuid}/reject`, { reason });
    return response.data.data;
  },
  getVerifications: async (params?: { status?: string; per_page?: number; page?: number }): Promise<VerificationListResponse> => {
    const response = await apiClient.get<ApiResponse<VerificationListResponse>>('/admin/verifications', { params });
    // In Laravel ApiResponse, payload might be inside response.data.data
    return response.data.data;
  },

  getVerification: async (uuid: string): Promise<AdminVerification> => {
    const response = await apiClient.get<ApiResponse<AdminVerification>>(`/admin/verifications/${uuid}`);
    return response.data.data;
  },

  reviewVerification: async (uuid: string, payload: ReviewVerificationPayload): Promise<AdminVerification> => {
    const response = await apiClient.post<ApiResponse<AdminVerification>>(`/admin/verifications/${uuid}/review`, payload);
    return response.data.data;
  },

  getFeatureFlags: async (): Promise<Record<string, boolean>> => {
    try {
      const response = await apiClient.get<any>('/admin/feature-flags');
      const data = response.data?.data || response.data?.flags || response.data;
      if (Array.isArray(data)) {
        const mapped: Record<string, boolean> = {};
        data.forEach((item: any) => {
          if (item.key) mapped[item.key] = Boolean(item.isActive ?? item.is_active ?? item.enabled);
        });
        return mapped;
      }
      if (typeof data === 'object' && data !== null) {
        return data;
      }
      return {};
    } catch {
      return {};
    }
  },

  toggleFeatureFlag: async (feature: string, isActive: boolean): Promise<FeatureFlagToggleResponse> => {
    const response = await apiClient.post<FeatureFlagToggleResponse>(`/admin/feature-flags/${feature}/toggle`, {
      is_active: isActive,
    });
    return response.data;
  },

  getSettings: async (): Promise<AppSettings> => {
    const response = await apiClient.get<ApiResponse<AppSettings>>('/admin/settings');
    return response.data.data;
  },

  updateSettings: async (payload: Partial<AppSettings>): Promise<AppSettings> => {
    const response = await apiClient.post<ApiResponse<AppSettings>>('/admin/settings', payload);
    return response.data.data;
  },

  getSubscriptionPlans: async (): Promise<any[]> => {
    const response = await apiClient.get<ApiResponse<any[]>>('/admin/subscription-plans');
    return response.data.data || [];
  },

  updateSubscriptionPlan: async (slug: string, payload: Record<string, any>): Promise<any> => {
    const response = await apiClient.put<ApiResponse<any>>(`/admin/subscription-plans/${slug}`, payload);
    return response.data.data;
  },
};
