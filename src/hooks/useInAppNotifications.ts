import { useState, useEffect, useCallback, useRef } from 'react';
import { notificationApi } from '../api/notifications';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { getEcho, disconnectEcho } from '../lib/echo';
import type { InAppNotificationItem, NotificationPagination } from '../types/notification';

const NOTIFICATION_SYNC_CHANNEL = 'strayttix_notifications_sync';

export const useInAppNotifications = (pollingIntervalMs = 60000) => {
  const { isAuthenticated, user } = useAuth();
  const { showNotification } = useNotification();
  const [notifications, setNotifications] = useState<InAppNotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [pagination, setPagination] = useState<NotificationPagination | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const isFetchingRef = useRef<boolean>(false);

  const broadcastSync = useCallback((payload: { type: string; data?: any }) => {
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel(NOTIFICATION_SYNC_CHANNEL);
        bc.postMessage(payload);
        bc.close();
      }
    } catch {
      // Ignore BroadcastChannel unsupported errors
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const count = await notificationApi.getUnreadCount();
      setUnreadCount(count);
    } catch {
      // Ignore background badge errors gracefully
    }
  }, [isAuthenticated]);

  const fetchNotifications = useCallback(
    async (params?: { unread_only?: boolean; per_page?: number; page?: number }) => {
      if (!isAuthenticated || isFetchingRef.current) return;
      isFetchingRef.current = true;
      setIsLoading(true);
      try {
        const response = await notificationApi.getNotifications(params);
        setNotifications(response.notifications);
        setPagination(response.pagination);
        setUnreadCount(response.unread_count);
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      } finally {
        setIsLoading(false);
        isFetchingRef.current = false;
      }
    },
    [isAuthenticated]
  );

  const markAsRead = useCallback(
    async (uuid: string) => {
      try {
        setNotifications((prev) =>
          prev.map((n) => (n.uuid === uuid ? { ...n, read_at: new Date().toISOString() } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
        broadcastSync({ type: 'MARK_READ', data: { uuid } });
        await notificationApi.markAsRead(uuid);
      } catch (err) {
        console.error('Failed to mark notification as read:', err);
      }
    },
    [broadcastSync]
  );

  const markAllAsRead = useCallback(async () => {
    try {
      const now = new Date().toISOString();
      setNotifications((prev) => prev.map((n) => ({ ...n, read_at: now })));
      setUnreadCount(0);
      broadcastSync({ type: 'MARK_ALL_READ' });
      await notificationApi.markAllAsRead();
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  }, [broadcastSync]);

  // Real-time WebSocket subscription + Tab-focus & Multi-tab sync
  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      setNotifications([]);
      setUnreadCount(0);
      disconnectEcho();
      return;
    }

    fetchUnreadCount();

    const userUuid = String(user.id);
    const channelName = `users.${userUuid}`;
    const echo = getEcho();

    if (echo) {
      const channel = echo.private(channelName);
      channel.listen('.notification.created', (incoming: InAppNotificationItem) => {
        if (!incoming?.uuid) return;

        let wasInserted = false;
        setNotifications((prev) => {
          if (prev.some((n) => n.uuid === incoming.uuid)) {
            return prev;
          }
          wasInserted = true;
          return [incoming, ...prev];
        });

        // Increment unread badge if newly received
        setUnreadCount((prev) => (wasInserted || !incoming.read_at ? prev + 1 : prev));
        broadcastSync({ type: 'NEW_NOTIFICATION', data: incoming });

        if (incoming.title) {
          showNotification(
            incoming.message ? `${incoming.title}: ${incoming.message}` : incoming.title,
            'info'
          );
        }
      });
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchUnreadCount();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    let bc: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        bc = new BroadcastChannel(NOTIFICATION_SYNC_CHANNEL);
        bc.onmessage = (event) => {
          const msg = event.data;
          if (!msg?.type) return;
          if (msg.type === 'MARK_ALL_READ') {
            const now = new Date().toISOString();
            setNotifications((prev) => prev.map((n) => ({ ...n, read_at: now })));
            setUnreadCount(0);
          } else if (msg.type === 'MARK_READ' && msg.data?.uuid) {
            setNotifications((prev) =>
              prev.map((n) =>
                n.uuid === msg.data.uuid ? { ...n, read_at: new Date().toISOString() } : n
              )
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
          } else if (msg.type === 'NEW_NOTIFICATION' && msg.data?.uuid) {
            const incoming: InAppNotificationItem = msg.data;
            setNotifications((prev) => {
              if (prev.some((n) => n.uuid === incoming.uuid)) return prev;
              return [incoming, ...prev];
            });
            setUnreadCount((prev) => prev + 1);
          }
        };
      }
    } catch {
      // Ignore
    }

    // Slow fallback poll only while tab is visible
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchUnreadCount();
      }
    }, pollingIntervalMs);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
      if (bc) bc.close();
      if (echo) {
        echo.leave(channelName);
      }
    };
  }, [isAuthenticated, user?.id, fetchUnreadCount, pollingIntervalMs, broadcastSync, showNotification]);

  return {
    notifications,
    unreadCount,
    pagination,
    isLoading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
  };
};
