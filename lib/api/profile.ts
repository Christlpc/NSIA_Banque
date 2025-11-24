import { apiClient } from "./client";
import { USE_MOCK_DATA } from "@/lib/utils/config";
import { mockProfileApi } from "@/lib/mock/profile";
import type { User } from "@/types";
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

export interface ProfileUpdateData {
  nom?: string;
  prenom?: string;
  email?: string;
}

export interface PasswordChangeData {
  old_password: string;
  new_password: string;
  confirm_password: string;
}

export interface NotificationPreferences {
  email_notifications: boolean;
  push_notifications: boolean;
  simulation_updates: boolean;
  system_alerts: boolean;
}

export interface LoginHistory {
  id: number;
  ip_address: string;
  user_agent: string;
  login_at: string;
  logout_at?: string;
  location?: string;
}

export interface ActiveSession {
  id: string;
  ip_address: string;
  user_agent: string;
  login_at: string;
  last_activity: string;
  location?: string;
}

export const profileApi = {
  /**
   * Récupère le profil de l'utilisateur connecté
   * Utilise /api/v1/auth/me/ comme endpoint principal
   * Fallback sur /api/v1/profile/ si nécessaire
   */
  getProfile: async (): Promise<User> => {
    if (USE_MOCK_DATA) {
      return mockProfileApi.getProfile();
    }
    try {
      // Essayer d'abord /api/v1/auth/me/ (endpoint recommandé)
      const response = await apiClient.get<User>("/api/v1/auth/me/");
      return response.data;
    } catch (error) {
      // Fallback sur /api/v1/profile/ si /api/v1/auth/me/ n'est pas disponible
      const response = await apiClient.get<User>("/api/v1/profile/");
      return response.data;
    }
  },

  updateProfile: async (data: ProfileUpdateData): Promise<User> => {
    if (USE_MOCK_DATA) {
      return mockProfileApi.updateProfile(data);
    }
    const response = await apiClient.patch<User>("/api/v1/profile/", data);
    return response.data;
  },

  changePassword: async (data: PasswordChangeData): Promise<void> => {
    if (USE_MOCK_DATA) {
      return mockProfileApi.changePassword(data);
    }
    await apiClient.post("/api/v1/profile/change-password/", data);
  },

  getNotificationPreferences: async (): Promise<NotificationPreferences> => {
    return handleApiError(
      async () => {
        const response = await apiClient.get<NotificationPreferences>("/api/v1/profile/notifications/");
        return response.data;
      },
      () => mockProfileApi.getNotificationPreferences()
    );
  },

  updateNotificationPreferences: async (data: NotificationPreferences): Promise<NotificationPreferences> => {
    return handleApiError(
      async () => {
        const response = await apiClient.patch<NotificationPreferences>("/api/v1/profile/notifications/", data);
        return response.data;
      },
      () => mockProfileApi.updateNotificationPreferences(data)
    );
  },

  getLoginHistory: async (): Promise<LoginHistory[]> => {
    return handleApiError(
      async () => {
        const response = await apiClient.get<LoginHistory[]>("/api/v1/profile/login-history/");
        return response.data;
      },
      () => mockProfileApi.getLoginHistory()
    );
  },

  getActiveSessions: async (): Promise<ActiveSession[]> => {
    return handleApiError(
      async () => {
        const response = await apiClient.get<ActiveSession[]>("/api/v1/profile/sessions/");
        return response.data;
      },
      () => mockProfileApi.getActiveSessions()
    );
  },

  revokeSession: async (sessionId: string): Promise<void> => {
    return handleApiError(
      async () => {
        await apiClient.delete(`/api/v1/profile/sessions/${sessionId}/`);
      },
      () => mockProfileApi.revokeSession(sessionId)
    );
  },
};



