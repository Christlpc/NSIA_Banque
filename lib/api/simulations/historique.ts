import { apiClient } from "../client";
import { USE_MOCK_DATA } from "@/lib/utils/config";
import { mockSimulationApi } from "@/lib/mock/simulations";
import type {
  Simulation,
  SimulationCreateData,
  SimulationFilters,
  PaginatedResponse,
} from "@/types";

/**
 * API pour la gestion de l'historique des simulations (CRUD)
 * Endpoints: /api/v1/simulations/historique/
 */
export const historiqueApi = {
  /**
   * Récupère la liste des simulations avec pagination et filtres
   * GET /api/v1/simulations/historique/
   */
  getSimulations: async (
    filters?: SimulationFilters
  ): Promise<PaginatedResponse<Simulation>> => {
    if (USE_MOCK_DATA) {
      return mockSimulationApi.getSimulations(filters);
    }
    const params = new URLSearchParams();
    if (filters?.statut) params.append("statut", filters.statut);
    if (filters?.produit) params.append("produit", filters.produit);
    if (filters?.search) params.append("search", filters.search);
    if (filters?.date_debut) params.append("date_debut", filters.date_debut);
    if (filters?.date_fin) params.append("date_fin", filters.date_fin);
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.page_size) params.append("page_size", filters.page_size.toString());

    const response = await apiClient.get<PaginatedResponse<Simulation>>(
      `/api/v1/simulations/historique/?${params.toString()}`
    );
    return response.data;
  },

  /**
   * Récupère une simulation par son ID
   * GET /api/v1/simulations/historique/{id}/
   */
  getSimulation: async (id: string): Promise<Simulation> => {
    if (USE_MOCK_DATA) {
      return mockSimulationApi.getSimulation(Number(id));
    }
    const response = await apiClient.get<Simulation>(`/api/v1/simulations/historique/${id}/`);
    return response.data;
  },

  /**
   * Crée une nouvelle simulation
   * POST /api/v1/simulations/historique/
   */
  createSimulation: async (data: SimulationCreateData): Promise<Simulation> => {
    if (USE_MOCK_DATA) {
      // Utiliser le mock existant avec un produit par défaut
      return mockSimulationApi.createSimulation("emprunteur", data);
    }
    const response = await apiClient.post<Simulation>("/api/v1/simulations/historique/", data);
    return response.data;
  },

  /**
   * Met à jour une simulation existante
   * PATCH /api/v1/simulations/historique/{id}/
   */
  updateSimulation: async (
    id: string,
    data: Partial<SimulationCreateData>
  ): Promise<Simulation> => {
    if (USE_MOCK_DATA) {
      return mockSimulationApi.updateSimulation(Number(id), data);
    }
    const response = await apiClient.patch<Simulation>(
      `/api/v1/simulations/historique/${id}/`,
      data
    );
    return response.data;
  },

  /**
   * Supprime une simulation
   * DELETE /api/v1/simulations/historique/{id}/
   */
  deleteSimulation: async (id: string): Promise<void> => {
    if (USE_MOCK_DATA) {
      return mockSimulationApi.deleteSimulation(Number(id));
    }
    await apiClient.delete(`/api/v1/simulations/historique/${id}/`);
  },

  /**
   * Valide une simulation
   * POST /api/v1/simulations/historique/{id}/valider/
   */
  validateSimulation: async (id: string): Promise<Simulation> => {
    if (USE_MOCK_DATA) {
      return mockSimulationApi.validateSimulation(Number(id));
    }
    const response = await apiClient.post<Simulation>(
      `/api/v1/simulations/historique/${id}/valider/`,
      {}
    );
    return response.data;
  },

  /**
   * Convertit une simulation en souscription
   * POST /api/v1/simulations/historique/{id}/souscrire/
   */
  souscrireSimulation: async (
    id: string,
    data?: {
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
  ): Promise<Simulation> => {
    if (USE_MOCK_DATA) {
      return mockSimulationApi.convertSimulation(Number(id));
    }
    const response = await apiClient.post<Simulation>(
      `/api/v1/simulations/historique/${id}/souscrire/`,
      data || {}
    );
    return response.data;
  },
};

