import apiClient from './client';
import type { ApiResponse, AnalyticsSummary } from '../types/api';

export const analyticsApi = {
  async getSummary(timeframe: string = '30d'): Promise<ApiResponse<AnalyticsSummary>> {
    const { data } = await apiClient.get<ApiResponse<AnalyticsSummary>>('/organizer/analytics', {
      params: { timeframe }
    });
    return data;
  }
};
