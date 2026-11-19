import { apiClient } from './client';
import type { ApiResponse } from '../types/api';
import type {
  InAppNotificationItem,
  NotificationsResponse,
  NotificationPreferences,
} from '../types/notification';

export const notificationApi = {
  /**
   * Fetch paginated notifications with optional unread filter
   */
  getNotifications: async (params?: { unread_only?: boolean; per_page?: number; page?: number }): Promise<NotificationsResponse> => {
    const response = await apiClient.get<ApiResponse<NotificationsResponse>>('/notifications', { params });
    return response.data.data;
  },

  /**
   * Get total unread count for badge
   */
  getUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get<ApiResponse<{ unread_count: number }>>('/notifications/unread-count');
    return response.data.data?.unread_count ?? 0;
  },

  /**
   * Mark single notification as read
   */
  markAsRead: async (uuid: string): Promise<void> => {
    await apiClient.patch(`/notifications/${uuid}/read`);
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (): Promise<{ updated_count: number }> => {
    const response = await apiClient.post<ApiResponse<{ updated_count: number }>>('/notifications/read-all');
    return response.data.data;
  },

  /**
   * Get notification preferences
   */
  getPreferences: async (): Promise<NotificationPreferences> => {
    const response = await apiClient.get<ApiResponse<{ preferences: NotificationPreferences }>>('/notifications/preferences');
    return response.data.data.preferences;
  },

  /**
   * Update notification preferences
   */
  updatePreferences: async (preferences: NotificationPreferences): Promise<NotificationPreferences> => {
    const response = await apiClient.put<ApiResponse<{ preferences: NotificationPreferences }>>('/notifications/preferences', {
      preferences,
    });
    return response.data.data.preferences;
  },
};
