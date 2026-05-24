import apiClient from "./api";

export interface AppNotification {
  id: string;
  userId: string;
  notificationType: "task_assigned" | "task_completed" | "task_expired" | "maintenance_due" | "system";
  title: string;
  content: string;
  read: boolean;
  createdAt: string;
}

export const notificationService = {
  // Fetch in-app notifications for the logged-in user
  async getNotifications(userId: string): Promise<AppNotification[]> {
    try {
      const response = await apiClient.get("/Main/router-backend/api/notifications", {
        params: { userId }
      });
      if (response.data && response.data.success) {
        return response.data.data.map((item: any) => ({
          id: item.id,
          userId: item.user_id,
          notificationType: item.notification_type,
          title: item.title,
          content: item.content,
          read: item.read,
          createdAt: item.created_at
        }));
      }
      return [];
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      return [];
    }
  },

  // Mark a specific notification as read
  async markAsRead(id: string): Promise<AppNotification | null> {
    try {
      const response = await apiClient.patch(`/Main/router-backend/api/notifications/${id}/read`);
      if (response.data && response.data.success) {
        const item = response.data.data;
        return {
          id: item.id,
          userId: item.user_id,
          notificationType: item.notification_type,
          title: item.title,
          content: item.content,
          read: item.read,
          createdAt: item.created_at
        };
      }
      return null;
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      return null;
    }
  },

  // Mark all notifications as read for a user
  async markAllAsRead(userId: string): Promise<boolean> {
    try {
      const response = await apiClient.patch("/Main/router-backend/api/notifications/read-all", { userId });
      return !!(response.data && response.data.success);
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      return false;
    }
  },

  // Client-triggered notification creation (e.g. for user approval, assignment, or testing)
  async createNotification(payload: {
    userId: string;
    type: "task_assigned" | "task_completed" | "task_expired" | "maintenance_due" | "system";
    title: string;
    content: string;
  }): Promise<AppNotification | null> {
    try {
      const response = await apiClient.post("/Main/router-backend/api/notifications", payload);
      if (response.data && response.data.success) {
        const item = response.data.data;
        return {
          id: item.id,
          userId: item.user_id,
          notificationType: item.notification_type,
          title: item.title,
          content: item.content,
          read: item.read,
          createdAt: item.created_at
        };
      }
      return null;
    } catch (error) {
      console.error("Failed to create notification:", error);
      return null;
    }
  }
};
