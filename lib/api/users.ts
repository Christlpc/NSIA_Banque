import { apiClient } from "./client";
import { USE_MOCK_DATA } from "@/lib/utils/config";
import { mockUserApi } from "@/lib/mock/users";
import type { User, UserRole, PaginatedResponse } from "@/types";

export interface UserCreateData {
  email: string;
  password: string;
  nom: string;
  prenom: string;
  role: UserRole;
  banque: number;
  is_active?: boolean;
}

export interface UserUpdateData {
  email?: string;
  nom?: string;
  prenom?: string;
  role?: UserRole;
  banque?: number;
  is_active?: boolean;
}

export interface UserFilters {
  search?: string;
  role?: UserRole;
  banque?: number;
  is_active?: boolean;
  page?: number;
  page_size?: number;
}

export const userApi = {
  getUsers: async (filters?: UserFilters): Promise<PaginatedResponse<User>> => {
    if (USE_MOCK_DATA) {
      return mockUserApi.getUsers(filters);
    }
    const response = await apiClient.get<PaginatedResponse<User>>("/api/v1/utilisateurs/", {
      params: filters,
    });
    return response.data;
  },

  getUser: async (id: number): Promise<User> => {
    if (USE_MOCK_DATA) {
      return mockUserApi.getUser(id);
    }
    const response = await apiClient.get<User>(`/api/v1/utilisateurs/${id}/`);
    return response.data;
  },

  createUser: async (data: UserCreateData): Promise<User> => {
    if (USE_MOCK_DATA) {
      return mockUserApi.createUser(data);
    }
    const response = await apiClient.post<User>("/api/v1/utilisateurs/", data);
    return response.data;
  },

  updateUser: async (id: number, data: UserUpdateData): Promise<User> => {
    if (USE_MOCK_DATA) {
      return mockUserApi.updateUser(id, data);
    }
    const response = await apiClient.patch<User>(`/api/v1/utilisateurs/${id}/`, data);
    return response.data;
  },

  deleteUser: async (id: number): Promise<void> => {
    if (USE_MOCK_DATA) {
      return mockUserApi.deleteUser(id);
    }
    await apiClient.delete(`/api/v1/utilisateurs/${id}/`);
  },

  /**
   * Active un utilisateur
   * @deprecated Utiliser toggleStatus() à la place
   * POST /api/v1/utilisateurs/{id}/toggle_status/ (via toggleStatus)
   */
  activateUser: async (id: number): Promise<User> => {
    if (USE_MOCK_DATA) {
      return mockUserApi.activateUser(id);
    }
    // Utiliser toggle_status qui bascule l'état
    // Note: Si l'utilisateur est déjà actif, toggle_status le désactivera
    // Pour garantir l'activation, on vérifie d'abord l'état
    const user = await userApi.getUser(id);
    if (user.is_active === false) {
      return userApi.toggleStatus(id);
    }
    return user;
  },

  /**
   * Désactive un utilisateur
   * @deprecated Utiliser toggleStatus() à la place
   * POST /api/v1/utilisateurs/{id}/toggle_status/ (via toggleStatus)
   */
  deactivateUser: async (id: number): Promise<User> => {
    if (USE_MOCK_DATA) {
      return mockUserApi.deactivateUser(id);
    }
    // Utiliser toggle_status qui bascule l'état
    // Note: Si l'utilisateur est déjà inactif, toggle_status l'activera
    // Pour garantir la désactivation, on vérifie d'abord l'état
    const user = await userApi.getUser(id);
    if (user.is_active !== false) {
      return userApi.toggleStatus(id);
    }
    return user;
  },

  /**
   * Réinitialise le mot de passe d'un utilisateur
   * POST /api/v1/utilisateurs/{id}/reset_password/
   */
  resetPassword: async (id: number | string): Promise<void> => {
    if (USE_MOCK_DATA) {
      // Mock implementation
      return Promise.resolve();
    }
    await apiClient.post(`/api/v1/utilisateurs/${id}/reset_password/`);
  },

  /**
   * Active ou désactive un utilisateur (toggle status)
   * POST /api/v1/utilisateurs/{id}/toggle_status/
   */
  toggleStatus: async (id: number | string): Promise<User> => {
    if (USE_MOCK_DATA) {
      // Utiliser activate/deactivate selon l'état actuel
      const user = await userApi.getUser(typeof id === "string" ? Number(id) : id);
      if (user.is_active !== false) {
        return mockUserApi.deactivateUser(typeof id === "string" ? Number(id) : id);
      } else {
        return mockUserApi.activateUser(typeof id === "string" ? Number(id) : id);
      }
    }
    const response = await apiClient.post<User>(`/api/v1/utilisateurs/${id}/toggle_status/`);
    return response.data;
  },
};



