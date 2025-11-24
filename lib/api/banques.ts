import { apiClient } from "./client";
import { USE_MOCK_DATA } from "@/lib/utils/config";
import { mockBanqueApi } from "@/lib/mock/banques";
import { cleanPayload } from "@/lib/utils/payload";
import type { Banque, PaginatedResponse } from "@/types";

export interface BanqueCreateData {
  nom: string;
  code: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  produits_disponibles: string[];
  date_partenariat?: string; // Format: "YYYY-MM-DD"
}

export interface BanqueUpdateData {
  nom?: string;
  code?: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  produits_disponibles?: string[];
  date_partenariat?: string; // Format: "YYYY-MM-DD"
}

export const banqueApi = {
  getBanques: async (): Promise<PaginatedResponse<Banque>> => {
    if (USE_MOCK_DATA) {
      return mockBanqueApi.getBanques();
    }
    const response = await apiClient.get<PaginatedResponse<Banque>>("/api/v1/banques/");
    return response.data;
  },

  getBanque: async (id: number): Promise<Banque> => {
    if (USE_MOCK_DATA) {
      return mockBanqueApi.getBanque(id);
    }
    const response = await apiClient.get<Banque>(`/api/v1/banques/${id}/`);
    return response.data;
  },

  createBanque: async (data: BanqueCreateData): Promise<Banque> => {
    if (USE_MOCK_DATA) {
      return mockBanqueApi.createBanque(data);
    }
    const response = await apiClient.post<Banque>("/api/v1/banques/", data);
    return response.data;
  },

  updateBanque: async (id: number, data: BanqueUpdateData): Promise<Banque> => {
    if (USE_MOCK_DATA) {
      return mockBanqueApi.updateBanque(id, data);
    }
    // Nettoyer le payload pour enlever les valeurs undefined
    const cleanedData = cleanPayload(data) as BanqueUpdateData;
    const response = await apiClient.patch<Banque>(`/api/v1/banques/${id}/`, cleanedData);
    return response.data;
  },

  /**
   * Récupère tous les utilisateurs d'une banque
   * GET /api/v1/banques/{id}/utilisateurs/
   */
  getBanqueUtilisateurs: async (id: number | string): Promise<import("@/types").User[]> => {
    if (USE_MOCK_DATA) {
      // Mock implementation - retourner les utilisateurs de la banque
      const { mockUserApi } = await import("@/lib/mock/users");
      const banqueId = typeof id === "string" ? Number(id) : id;
      const usersResponse = await mockUserApi.getUsers({ banque: banqueId });
      return usersResponse.results;
    }
    const response = await apiClient.get<import("@/types").User[]>(
      `/api/v1/banques/${id}/utilisateurs/`
    );
    return response.data;
  },
};

