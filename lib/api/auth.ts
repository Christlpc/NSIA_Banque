import { apiClient } from "./client";
import { USE_MOCK_DATA } from "@/lib/utils/config";
import { mockAuthApi } from "@/lib/mock/auth";
import type { LoginCredentials, AuthResponse } from "@/types";

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    if (USE_MOCK_DATA) {
      return mockAuthApi.login(credentials);
    }
    const response = await apiClient.post<AuthResponse>("/api/auth/login/", credentials);
    return response.data;
  },

  refreshToken: async (refresh: string): Promise<{ access: string }> => {
    if (USE_MOCK_DATA) {
      return mockAuthApi.refreshToken(refresh);
    }
    const response = await apiClient.post<{ access: string }>("/api/auth/refresh/", {
      refresh,
    });
    return response.data;
  },

  logout: async (): Promise<void> => {
    if (USE_MOCK_DATA) {
      return mockAuthApi.logout();
    }
    await apiClient.post("/api/auth/logout/");
  },
};

