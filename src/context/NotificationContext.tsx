import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { notificationService, AppNotification } from "../services/notificationService";
import apiClient from "../services/api";

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const data = await notificationService.getNotifications(user.id);
      setNotifications(data);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;
    try {
      const success = await notificationService.markAllAsRead(user.id);
      if (success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      }
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  };

  // Connect to SSE stream
  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      setNotifications([]);
      return;
    }

    // Load initial notifications
    fetchNotifications();

    const baseURL = apiClient.defaults.baseURL || "";
    const streamUrl = `${baseURL}/Main/router-backend/api/notifications/stream?userId=${user.id}`;
    let eventSource: EventSource | null = null;

    try {
      eventSource = new EventSource(streamUrl, {
        withCredentials: true,
      });

      eventSource.onmessage = (event) => {
        try {
          const item = JSON.parse(event.data);
          const newNotif: AppNotification = {
            id: item.id,
            userId: item.user_id,
            notificationType: item.notification_type,
            title: item.title,
            content: item.content,
            read: item.read,
            createdAt: item.created_at,
          };

          setNotifications((prev) => {
            // Check if notification already exists to avoid duplicates
            if (prev.some((n) => n.id === newNotif.id)) return prev;
            return [newNotif, ...prev];
          });
        } catch (err) {
          console.error("Error parsing real-time notification payload:", err);
        }
      };

      eventSource.onerror = (err) => {
        console.warn("Real-time notification stream connection lost/error, EventSource will automatically retry.", err);
      };
    } catch (sseErr) {
      console.error("Failed to initialize notification EventSource:", sseErr);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [isAuthenticated, user?.id]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};
