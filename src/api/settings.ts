import { apiClient } from './client';
import type { ApiResponse, AppSettings } from '../types/api';

export const settingsApi = {
  /**
   * Fetches the global application settings (sitename, tagline, logo, favicon, maintenance, etc.)
   */
  getAppSettings: async (): Promise<ApiResponse<AppSettings>> => {
    const res = await apiClient.get<ApiResponse<AppSettings>>('/app/settings');
    return res.data;
  },
};
