import { apiClient } from "./client";
import { USE_MOCK_DATA } from "@/lib/utils/config";
import { mockNotificationApi } from "@/lib/mock/notifications";
import type { SystemNotification, NotificationFilters, NotificationStats } from "@/types/notifications";
import { AxiosError } from "axios";

// Helper pour gérer les erreurs 404 et basculer vers les mocks
const handleApiError = async <T>(
  apiCall: () => Promise<T>,
  mockCall: () => Promise<T>
): Promise<T> => {
  if (USE_MOCK_DATA) {
    return mockCall();
  }
  
  try {
    return await apiCall();
  } catch (error) {
    // Si l'endpoint n'existe pas (404), utiliser les mocks
    if (error instanceof AxiosError && error.response?.status === 404) {
      console.warn("Endpoint non disponible, utilisation des données mockées");
      return mockCall();
    }
    throw error;
  }
};

export const notificationApi = {
  getNotifications: async (filters?: NotificationFilters): Promise<SystemNotification[]> => {
    return handleApiError(
      async () => {
        const params = new URLSearchParams();
        if (filters?.type) params.append("type", filters.type);
        if (filters?.read !== undefined) params.append("read", filters.read.toString());
        if (filters?.priority) params.append("priority", filters.priority);
        
        const response = await apiClient.get<SystemNotification[]>(`/api/v1/notifications/?${params.toString()}`);
        return response.data;
      },
      () => mockNotificationApi.getNotifications(filters)
    );
  },

  getNotificationStats: async (): Promise<NotificationStats> => {
    return handleApiError(
      async () => {
        const response = await apiClient.get<NotificationStats>("/api/v1/notifications/stats/");
        return response.data;
      },
      () => mockNotificationApi.getNotificationStats()
    );
  },

  markAsRead: async (id: string): Promise<void> => {
    return handleApiError(
      async () => {
        await apiClient.patch(`/api/v1/notifications/${id}/read/`);
      },
      () => mockNotificationApi.markAsRead(id)
    );
  },

  markAllAsRead: async (): Promise<void> => {
    return handleApiError(
      async () => {
        await apiClient.post("/api/v1/notifications/mark-all-read/");
      },
      () => mockNotificationApi.markAllAsRead()
    );
  },

  deleteNotification: async (id: string): Promise<void> => {
    return handleApiError(
      async () => {
        await apiClient.delete(`/api/v1/notifications/${id}/`);
      },
      () => mockNotificationApi.deleteNotification(id)
    );
  },

  deleteAllRead: async (): Promise<void> => {
    return handleApiError(
      async () => {
        await apiClient.delete("/api/v1/notifications/delete-read/");
      },
      () => mockNotificationApi.deleteAllRead()
    );
  },
};




