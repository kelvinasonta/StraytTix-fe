import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  duration?: number;
}

interface NotificationContextType {
  notifications: Notification[];
  showNotification: (message: string, type: NotificationType, duration?: number) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const showNotification = useCallback((message: string, type: NotificationType, duration = 5000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications((prev) => [...prev, { id, message, type, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
  }, [removeNotification]);

  return (
    <NotificationContext.Provider value={{ notifications, showNotification, removeNotification }}>
      {children}
      {/* Toast Portal Container */}
      <div 
        className="fixed top-6 right-6 left-6 sm:left-auto z-50 flex flex-col gap-3 max-w-sm pointer-events-none"
        aria-live="assertive"
      >
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`pointer-events-auto flex items-start gap-3.5 p-4 rounded-xl shadow-xl border bg-white text-zinc-900 transition-all duration-300 transform translate-y-0 opacity-100 ${
              n.type === 'success' ? 'border-emerald-200' :
              n.type === 'error' ? 'border-red-200' :
              n.type === 'warning' ? 'border-amber-200' :
              'border-blue-200'
            }`}
            role="alert"
          >
            <div className="flex-shrink-0 mt-0.5">
              {n.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-600" />}
              {n.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600" />}
              {n.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-600" />}
              {n.type === 'info' && <Info className="w-5 h-5 text-blue-600" />}
            </div>
            <div className="flex-1 text-sm font-semibold text-zinc-800 leading-tight">
              {n.message}
            </div>
            <button
              onClick={() => removeNotification(n.id)}
              className="flex-shrink-0 ml-3 hover:opacity-85 transition-opacity focus:outline-none"
              aria-label="Close notification"
            >
              <X className="w-4 h-4 text-zinc-400 hover:text-zinc-700" />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
