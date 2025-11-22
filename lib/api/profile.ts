import { apiClient } from "./client";
import { USE_MOCK_DATA } from "@/lib/utils/config";
import { mockProfileApi } from "@/lib/mock/profile";
import type { User } from "@/types";

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
    if (USE_MOCK_DATA) {
      return mockProfileApi.getNotificationPreferences();
    }
    const response = await apiClient.get<NotificationPreferences>("/api/v1/profile/notifications/");
    return response.data;
  },

  updateNotificationPreferences: async (data: NotificationPreferences): Promise<NotificationPreferences> => {
    if (USE_MOCK_DATA) {
      return mockProfileApi.updateNotificationPreferences(data);
    }
    const response = await apiClient.patch<NotificationPreferences>("/api/v1/profile/notifications/", data);
    return response.data;
  },

  getLoginHistory: async (): Promise<LoginHistory[]> => {
    if (USE_MOCK_DATA) {
      return mockProfileApi.getLoginHistory();
    }
    const response = await apiClient.get<LoginHistory[]>("/api/v1/profile/login-history/");
    return response.data;
  },

  getActiveSessions: async (): Promise<ActiveSession[]> => {
    if (USE_MOCK_DATA) {
      return mockProfileApi.getActiveSessions();
    }
    const response = await apiClient.get<ActiveSession[]>("/api/v1/profile/sessions/");
    return response.data;
  },

  revokeSession: async (sessionId: string): Promise<void> => {
    if (USE_MOCK_DATA) {
      return mockProfileApi.revokeSession(sessionId);
    }
    await apiClient.delete(`/api/v1/profile/sessions/${sessionId}/`);
  },
};



