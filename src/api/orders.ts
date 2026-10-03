import apiClient from './client';
import type { ApiResponse, PaginatedResponse, Order, CreateOrderPayload, PaymentInitResponse } from '../types/api';

const cleanUrl = (url: string) => url.startsWith('/api/v1') ? url.replace(/^\/api\/v1/, '') : url;

export const ordersApi = {
  // 1. Create order / Reserve tickets (Holds inventory for 15 mins)
  createOrder: async (eventUuid: string, payload: CreateOrderPayload): Promise<Order> => {
    const res = await apiClient.post<ApiResponse<Order>>(cleanUrl(`/api/v1/events/${eventUuid}/orders`), payload);
    return res.data.data;
  },

  // 2. Fetch single order details & issued tickets
  getOrder: async (orderUuid: string): Promise<Order> => {
    const res = await apiClient.get<ApiResponse<Order>>(cleanUrl(`/api/v1/orders/${orderUuid}`));
    return res.data.data;
  },

  // 3. Current user order history
  getUserOrders: async (params?: { page?: number; per_page?: number; status?: string }): Promise<PaginatedResponse<Order>> => {
    const res = await apiClient.get<ApiResponse<PaginatedResponse<Order>>>(cleanUrl('/api/v1/orders'), { params });
    return res.data.data;
  },

  // 4. Initialize Payment (Paystack / Flutterwave / Stripe / Free)
  initializePayment: async (
    orderUuid: string,
    payload?: { gateway?: 'paystack' | 'flutterwave' | 'stripe' | 'free'; callback_url?: string }
  ): Promise<PaymentInitResponse> => {
    const res = await apiClient.post<ApiResponse<PaymentInitResponse>>(cleanUrl(`/api/v1/orders/${orderUuid}/payments`), payload);
    return res.data.data;
  },

  // 5. Verify payment after redirect
  verifyPayment: async (reference: string): Promise<Order> => {
    const res = await apiClient.get<ApiResponse<Order>>(cleanUrl(`/api/v1/payments/verify/${reference}`));
    return res.data.data;
  },

  // 6. Organizer Orders List
  getOrganizerOrders: async (
    organizerUuid: string,
    eventUuid?: string,
    params?: { page?: number; search?: string; status?: string }
  ): Promise<PaginatedResponse<Order>> => {
    const url = eventUuid
      ? cleanUrl(`/api/v1/organizers/${organizerUuid}/events/${eventUuid}/orders`)
      : cleanUrl(`/api/v1/organizers/${organizerUuid}/orders`);
    const res = await apiClient.get<ApiResponse<PaginatedResponse<Order>>>(url, { params });
    return res.data.data;
  },

  // 7. Export Organizer Orders CSV URL
  getExportOrdersUrl: (organizerUuid: string, eventUuid?: string): string => {
    const baseUrl = apiClient.defaults.baseURL || '';
    return eventUuid
      ? `${baseUrl}/organizers/${organizerUuid}/events/${eventUuid}/orders/export`
      : `${baseUrl}/organizers/${organizerUuid}/orders/export`;
  },
};

export default ordersApi;
