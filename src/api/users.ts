import apiClient from './client';
import type { ApiResponse, User } from '../types/api';

export const userApi = {
  async getProfile(): Promise<ApiResponse<User>> {
    const { data } = await apiClient.get<ApiResponse<User>>('/auth/profile');
    return data;
  },

  async updatePreferences(preferences: any): Promise<ApiResponse<any>> {
    const { data } = await apiClient.put<ApiResponse<any>>('/auth/profile/preferences', preferences);
    return data;
  }
};
