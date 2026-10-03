import apiClient from './client';
import type { ApiResponse } from '../types/api';

export const paymentApi = {
  async processPayment(orderId: string, paymentDetails: any): Promise<ApiResponse<{ status: 'Paid' | 'Failed' }>> {
    const { data } = await apiClient.post<ApiResponse<{ status: 'Paid' | 'Failed' }>>(`/payments/${orderId}/process`, paymentDetails);
    return data;
  },

  async getPayouts(): Promise<ApiResponse<any[]>> {
    const { data } = await apiClient.get<ApiResponse<any[]>>('/payments/payouts');
    return data;
  }
};
