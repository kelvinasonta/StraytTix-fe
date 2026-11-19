export interface InAppNotificationItem {
  id: number;
  uuid: string;
  user_id: number;
  type: string;
  title: string;
  message: string;
  action_url?: string | null;
  icon?: string | null;
  data?: Record<string, unknown> | null;
  read_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationPagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface NotificationsResponse {
  notifications: InAppNotificationItem[];
  pagination: NotificationPagination;
  unread_count: number;
}

export interface NotificationPreferences {
  [category: string]: {
    [channel: string]: boolean;
  };
}
