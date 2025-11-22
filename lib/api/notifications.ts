import { apiClient } from "./client";
import { USE_MOCK_DATA } from "@/lib/utils/config";
import { mockNotificationApi } from "@/lib/mock/notifications";
import type { SystemNotification, NotificationFilters, NotificationStats } from "@/types/notifications";

export const notificationApi = {
  getNotifications: async (filters?: NotificationFilters): Promise<SystemNotification[]> => {
    if (USE_MOCK_DATA) {
      return mockNotificationApi.getNotifications(filters);
    }
    const params = new URLSearchParams();
    if (filters?.type) params.append("type", filters.type);
    if (filters?.read !== undefined) params.append("read", filters.read.toString());
    if (filters?.priority) params.append("priority", filters.priority);
    
    const response = await apiClient.get<SystemNotification[]>(`/api/v1/notifications/?${params.toString()}`);
    return response.data;
  },

  getNotificationStats: async (): Promise<NotificationStats> => {
    if (USE_MOCK_DATA) {
      return mockNotificationApi.getNotificationStats();
    }
    const response = await apiClient.get<NotificationStats>("/api/v1/notifications/stats/");
    return response.data;
  },

  markAsRead: async (id: string): Promise<void> => {
    if (USE_MOCK_DATA) {
      return mockNotificationApi.markAsRead(id);
    }
    await apiClient.patch(`/api/v1/notifications/${id}/read/`);
  },

  markAllAsRead: async (): Promise<void> => {
    if (USE_MOCK_DATA) {
      return mockNotificationApi.markAllAsRead();
    }
    await apiClient.post("/api/v1/notifications/mark-all-read/");
  },

  deleteNotification: async (id: string): Promise<void> => {
    if (USE_MOCK_DATA) {
      return mockNotificationApi.deleteNotification(id);
    }
    await apiClient.delete(`/api/v1/notifications/${id}/`);
  },

  deleteAllRead: async (): Promise<void> => {
    if (USE_MOCK_DATA) {
      return mockNotificationApi.deleteAllRead();
    }
    await apiClient.delete("/api/v1/notifications/delete-read/");
  },
};



