import apiClient from "./api";
import { WorkItem, Schedule, Notification, Message, SystemLog, Activity } from "../mock/data";
import {
  mockWorkItems,
  mockSchedules,
  mockNotifications,
  mockMessages,
  mockSystemLogs,
  mockActivities,
} from "../mock/data";

const simulateDelay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const workItemService = {
  // Get all work items for a user
  async getWorkItems(userId?: string): Promise<WorkItem[]> {
    await simulateDelay(300);
    if (userId) {
      return mockWorkItems.filter((w) => w.assignedTo === userId);
    }
    return mockWorkItems;
    // In production:
    // const response = await apiClient.get<WorkItem[]>("/work-items", { params: { userId } });
    // return response.data;
  },

  // Get work item by ID
  async getWorkItem(id: string): Promise<WorkItem> {
    await simulateDelay(200);
    const item = mockWorkItems.find((w) => w.id === id);
    if (!item) throw new Error("Work item not found");
    return item;
    // In production:
    // const response = await apiClient.get<WorkItem>(`/work-items/${id}`);
    // return response.data;
  },

  // Create work item
  async createWorkItem(data: Omit<WorkItem, "id" | "createdAt" | "updatedAt">): Promise<WorkItem> {
    await simulateDelay(400);
    const newItem: WorkItem = {
      ...data,
      id: `${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockWorkItems.push(newItem);
    return newItem;
    // In production:
    // const response = await apiClient.post<WorkItem>("/work-items", data);
    // return response.data;
  },

  // Update work item
  async updateWorkItem(id: string, data: Partial<WorkItem>): Promise<WorkItem> {
    await simulateDelay(300);
    const index = mockWorkItems.findIndex((w) => w.id === id);
    if (index === -1) throw new Error("Work item not found");
    mockWorkItems[index] = { ...mockWorkItems[index], ...data, updatedAt: new Date().toISOString() };
    return mockWorkItems[index];
    // In production:
    // const response = await apiClient.put<WorkItem>(`/work-items/${id}`, data);
    // return response.data;
  },

  // Delete work item
  async deleteWorkItem(id: string): Promise<void> {
    await simulateDelay(300);
    const index = mockWorkItems.findIndex((w) => w.id === id);
    if (index === -1) throw new Error("Work item not found");
    mockWorkItems.splice(index, 1);
    // In production:
    // await apiClient.delete(`/work-items/${id}`);
  },
};

export const scheduleService = {
  // Get all schedules
  async getSchedules(userId?: string): Promise<Schedule[]> {
    await simulateDelay(300);
    if (userId) {
      return mockSchedules.filter((s) => s.userId === userId);
    }
    return mockSchedules;
  },

  // Get schedule by ID
  async getSchedule(id: string): Promise<Schedule> {
    await simulateDelay(200);
    const schedule = mockSchedules.find((s) => s.id === id);
    if (!schedule) throw new Error("Schedule not found");
    return schedule;
  },

  // Create schedule
  async createSchedule(data: Omit<Schedule, "id">): Promise<Schedule> {
    await simulateDelay(400);
    const newSchedule: Schedule = {
      ...data,
      id: `${Date.now()}`,
    };
    mockSchedules.push(newSchedule);
    return newSchedule;
  },

  // Update schedule
  async updateSchedule(id: string, data: Partial<Schedule>): Promise<Schedule> {
    await simulateDelay(300);
    const index = mockSchedules.findIndex((s) => s.id === id);
    if (index === -1) throw new Error("Schedule not found");
    mockSchedules[index] = { ...mockSchedules[index], ...data };
    return mockSchedules[index];
  },

  // Delete schedule
  async deleteSchedule(id: string): Promise<void> {
    await simulateDelay(300);
    const index = mockSchedules.findIndex((s) => s.id === id);
    if (index === -1) throw new Error("Schedule not found");
    mockSchedules.splice(index, 1);
  },
};

export const notificationService = {
  // Get all notifications
  async getNotifications(userId: string): Promise<Notification[]> {
    await simulateDelay(300);
    return mockNotifications.filter((n) => n.userId === userId);
  },

  // Get unread count
  async getUnreadCount(userId: string): Promise<number> {
    await simulateDelay(200);
    return mockNotifications.filter((n) => n.userId === userId && !n.read).length;
  },

  // Mark as read
  async markAsRead(id: string): Promise<Notification> {
    await simulateDelay(200);
    const notification = mockNotifications.find((n) => n.id === id);
    if (!notification) throw new Error("Notification not found");
    notification.read = true;
    return notification;
  },

  // Mark all as read
  async markAllAsRead(userId: string): Promise<void> {
    await simulateDelay(300);
    mockNotifications.forEach((n) => {
      if (n.userId === userId) n.read = true;
    });
  },

  // Delete notification
  async deleteNotification(id: string): Promise<void> {
    await simulateDelay(200);
    const index = mockNotifications.findIndex((n) => n.id === id);
    if (index !== -1) {
      mockNotifications.splice(index, 1);
    }
  },
};

export const messageService = {
  // Get messages for user
  async getMessages(userId: string, received = true): Promise<Message[]> {
    await simulateDelay(300);
    if (received) {
      return mockMessages.filter((m) => m.receiverId === userId);
    }
    return mockMessages.filter((m) => m.senderId === userId);
  },

  // Send message
  async sendMessage(data: Omit<Message, "id" | "createdAt" | "read">): Promise<Message> {
    await simulateDelay(400);
    const newMessage: Message = {
      ...data,
      id: `${Date.now()}`,
      createdAt: new Date().toISOString(),
      read: false,
    };
    mockMessages.push(newMessage);
    return newMessage;
  },

  // Mark as read
  async markAsRead(id: string): Promise<Message> {
    await simulateDelay(200);
    const message = mockMessages.find((m) => m.id === id);
    if (!message) throw new Error("Message not found");
    message.read = true;
    return message;
  },

  // Delete message
  async deleteMessage(id: string): Promise<void> {
    await simulateDelay(200);
    const index = mockMessages.findIndex((m) => m.id === id);
    if (index !== -1) {
      mockMessages.splice(index, 1);
    }
  },
};

export const logService = {
  // Get system logs
  async getLogs(filters?: { userId?: string; action?: string }): Promise<SystemLog[]> {
    await simulateDelay(300);
    let logs = [...mockSystemLogs];
    if (filters?.userId) {
      logs = logs.filter((l) => l.userId === filters.userId);
    }
    if (filters?.action) {
      logs = logs.filter((l) => l.action === filters.action);
    }
    return logs.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  },

  // Create log entry
  async createLog(data: Omit<SystemLog, "id">): Promise<SystemLog> {
    await simulateDelay(200);
    const newLog: SystemLog = {
      ...data,
      id: `${Date.now()}`,
    };
    mockSystemLogs.push(newLog);
    return newLog;
  },
};

export const activityService = {
  // Get recent activities
  async getActivities(limit = 10): Promise<Activity[]> {
    await simulateDelay(300);
    return mockActivities.slice(0, limit);
  },

  // Get activities for user
  async getUserActivities(userId: string): Promise<Activity[]> {
    await simulateDelay(300);
    return mockActivities.filter((a) => a.userId === userId);
  },
};
