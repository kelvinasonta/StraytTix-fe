import { apiClient } from './client';
import type { ApiResponse } from '../types/api';

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

export const adminApi = {
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

  toggleFeatureFlag: async (feature: string, isActive: boolean): Promise<FeatureFlagToggleResponse> => {
    const response = await apiClient.post<FeatureFlagToggleResponse>(`/admin/feature-flags/${feature}/toggle`, {
      is_active: isActive,
    });
    return response.data;
  },
};
