import { apiClient } from "../client";
import { USE_MOCK_DATA } from "@/lib/utils/config";
import { cleanPayload } from "@/lib/utils/payload";
import type { PaginatedResponse } from "@/types";

/**
 * Statut d'une souscription
 */
export type SouscriptionStatut = "en_attente" | "validee" | "rejetee";

/**
 * Souscription complète
 */
export interface Souscription {
  id: string; // UUID
  simulation: string; // UUID de la simulation
  nom: string;
  prenom: string;
  date_naissance: string; // YYYY-MM-DD
  email: string;
  telephone: string;
  adresse?: string;
  profession?: string;
  employeur?: string;
  numero_compte?: string;
  date_effet_contrat?: string; // YYYY-MM-DD
  statut: SouscriptionStatut;
  raison_rejet?: string;
  created_at: string;
  updated_at: string;
  created_by: number;
  validated_by?: number;
  validated_at?: string;
  rejected_by?: number;
  rejected_at?: string;
}

/**
 * Données pour créer une souscription
 */
export interface SouscriptionCreateData {
  simulation: string; // UUID
  nom: string;
  prenom: string;
  date_naissance: string; // YYYY-MM-DD
  email: string;
  telephone: string;
  adresse?: string;
  profession?: string;
  employeur?: string;
  numero_compte?: string;
  date_effet_contrat: string; // YYYY-MM-DD
}

/**
 * Données pour mettre à jour une souscription
 */
export interface SouscriptionUpdateData {
  nom?: string;
  prenom?: string;
  date_naissance?: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  profession?: string;
  employeur?: string;
  numero_compte?: string;
  date_effet_contrat?: string;
}

/**
 * Filtres pour la liste des souscriptions
 */
export interface SouscriptionFilters {
  statut?: SouscriptionStatut;
  simulation?: string;
  search?: string;
  date_debut?: string;
  date_fin?: string;
  page?: number;
  page_size?: number;
  ordering?: string;
}

/**
 * API pour la gestion des souscriptions
 * Endpoints: /api/v1/simulations/souscriptions/
 */
export const souscriptionsApi = {
  /**
   * Récupère la liste des souscriptions avec pagination et filtres
   * GET /api/v1/simulations/souscriptions/
   */
  getSouscriptions: async (
    filters?: SouscriptionFilters
  ): Promise<PaginatedResponse<Souscription>> => {
    if (USE_MOCK_DATA) {
      // Mock implementation
      return {
        count: 0,
        next: null,
        previous: null,
        results: [],
      };
    }
    const params = new URLSearchParams();
    if (filters?.statut) params.append("statut", filters.statut);
    if (filters?.simulation) params.append("simulation", filters.simulation);
    if (filters?.search) params.append("search", filters.search);
    if (filters?.date_debut) params.append("date_debut", filters.date_debut);
    if (filters?.date_fin) params.append("date_fin", filters.date_fin);
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.page_size) params.append("page_size", filters.page_size.toString());
    if (filters?.ordering) params.append("ordering", filters.ordering);

    const response = await apiClient.get<PaginatedResponse<Souscription>>(
      `/api/v1/simulations/souscriptions/?${params.toString()}`
    );
    return response.data;
  },

  /**
   * Crée une nouvelle souscription
   * POST /api/v1/simulations/souscriptions/
   */
  createSouscription: async (data: SouscriptionCreateData): Promise<Souscription> => {
    if (USE_MOCK_DATA) {
      throw new Error("Mock non implémenté pour createSouscription");
    }
    // Nettoyer le payload pour enlever les valeurs undefined
    const cleanedData = cleanPayload(data) as SouscriptionCreateData;
    const response = await apiClient.post<Souscription>("/api/v1/simulations/souscriptions/", cleanedData);
    return response.data;
  },

  /**
   * Récupère une souscription par son ID
   * GET /api/v1/simulations/souscriptions/{id}/
   */
  getSouscription: async (id: string): Promise<Souscription> => {
    if (USE_MOCK_DATA) {
      throw new Error("Mock non implémenté pour getSouscription");
    }
    const response = await apiClient.get<Souscription>(
      `/api/v1/simulations/souscriptions/${id}/`
    );
    return response.data;
  },

  /**
   * Met à jour une souscription existante
   * PATCH /api/v1/simulations/souscriptions/{id}/
   */
  updateSouscription: async (
    id: string,
    data: SouscriptionUpdateData
  ): Promise<Souscription> => {
    if (USE_MOCK_DATA) {
      throw new Error("Mock non implémenté pour updateSouscription");
    }
    // Nettoyer le payload pour enlever les valeurs undefined
    const cleanedData = cleanPayload(data) as SouscriptionUpdateData;
    const response = await apiClient.patch<Souscription>(
      `/api/v1/simulations/souscriptions/${id}/`,
      cleanedData
    );
    return response.data;
  },

  /**
   * Supprime une souscription
   * DELETE /api/v1/simulations/souscriptions/{id}/
   */
  deleteSouscription: async (id: string): Promise<void> => {
    if (USE_MOCK_DATA) {
      throw new Error("Mock non implémenté pour deleteSouscription");
    }
    await apiClient.delete(`/api/v1/simulations/souscriptions/${id}/`);
  },

  /**
   * Valide une souscription
   * POST /api/v1/simulations/souscriptions/{id}/valider/
   */
  validateSouscription: async (id: string): Promise<Souscription> => {
    if (USE_MOCK_DATA) {
      throw new Error("Mock non implémenté pour validateSouscription");
    }
    const response = await apiClient.post<Souscription>(
      `/api/v1/simulations/souscriptions/${id}/valider/`
    );
    return response.data;
  },

  /**
   * Rejette une souscription
   * POST /api/v1/simulations/souscriptions/{id}/rejeter/
   */
  rejectSouscription: async (id: string, raison?: string): Promise<Souscription> => {
    if (USE_MOCK_DATA) {
      throw new Error("Mock non implémenté pour rejectSouscription");
    }
    const response = await apiClient.post<Souscription>(
      `/api/v1/simulations/souscriptions/${id}/rejeter/`,
      raison ? { raison } : {}
    );
    return response.data;
  },
};

