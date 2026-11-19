import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Check,
  CheckCheck,
  Calendar,
  Ticket,
  AlertCircle,
  CreditCard,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { useInAppNotifications } from '../../hooks/useInAppNotifications';
import type { InAppNotificationItem } from '../../types/notification';

interface NotificationBellProps {
  className?: string;
  iconClassName?: string;
  badgeClassName?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  className = '',
  iconClassName = 'w-5 h-5',
  badgeClassName = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useInAppNotifications();

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Load notifications list when opened
  const toggleDropdown = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      fetchNotifications({ per_page: 15 });
    }
  };

  const handleNotificationClick = async (item: InAppNotificationItem) => {
    if (!item.read_at) {
      await markAsRead(item.uuid);
    }
    setIsOpen(false);
    if (item.action_url) {
      if (item.action_url.startsWith('http')) {
        window.open(item.action_url, '_blank', 'noopener,noreferrer');
      } else {
        navigate(item.action_url);
      }
    }
  };

  const getIcon = (type: string, icon?: string | null) => {
    if (icon === 'calendar' || type.includes('event')) {
      return <Calendar className="w-4 h-4 text-blue-500" />;
    }
    if (icon === 'ticket' || type.includes('ticket') || type.includes('order')) {
      return <Ticket className="w-4 h-4 text-emerald-500" />;
    }
    if (icon === 'credit-card' || type.includes('payment') || type.includes('payout')) {
      return <CreditCard className="w-4 h-4 text-amber-500" />;
    }
    if (type.includes('error') || type.includes('warning')) {
      return <AlertCircle className="w-4 h-4 text-rose-500" />;
    }
    return <Bell className="w-4 h-4 text-zinc-400" />;
  };

  const formatTimeAgo = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString();
    } catch {
      return '';
    }
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className={`relative p-2 rounded-full transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#E31B23]/40 ${className}`}
        title="Notifications"
        aria-label="View notifications"
      >
        <Bell className={iconClassName} />
        {unreadCount > 0 && (
          <span
            className={`absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 text-[10px] font-black leading-none flex items-center justify-center rounded-full bg-[#E31B23] text-white shadow-sm animate-in fade-in zoom-in duration-200 ${badgeClassName}`}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl border border-zinc-200 dark:border-zinc-800 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 dark:bg-red-950/40 text-[#E31B23]">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* List Content */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/60">
            {isLoading && notifications.length === 0 ? (
              <div className="p-8 text-center text-zinc-400 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-[#E31B23]" />
                <span className="text-xs">Loading updates...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-10 text-center">
                <div className="w-10 h-10 mx-auto rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 mb-2">
                  <Bell className="w-5 h-5" />
                </div>
                <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">All caught up!</p>
                <p className="text-xs text-zinc-400 mt-1">You have no unread notifications.</p>
              </div>
            ) : (
              notifications.map((item) => {
                const isUnread = !item.read_at;
                return (
                  <div
                    key={item.uuid}
                    onClick={() => handleNotificationClick(item)}
                    className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer group ${
                      isUnread
                        ? 'bg-red-50/40 dark:bg-red-950/10 hover:bg-red-50/70 dark:hover:bg-red-950/20'
                        : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 shrink-0 mt-0.5">
                      {getIcon(item.type, item.icon)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p
                          className={`text-xs font-semibold truncate ${
                            isUnread
                              ? 'text-zinc-900 dark:text-zinc-100'
                              : 'text-zinc-700 dark:text-zinc-300'
                          }`}
                        >
                          {item.title}
                        </p>
                        <span className="text-[10px] text-zinc-400 shrink-0">
                          {formatTimeAgo(item.created_at)}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-0.5">
                        {item.message}
                      </p>
                      {item.action_url && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#E31B23] mt-1 group-hover:underline">
                          View details
                          <ExternalLink className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                    {isUnread && (
                      <span className="w-2 h-2 rounded-full bg-[#E31B23] shrink-0 mt-1.5" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
