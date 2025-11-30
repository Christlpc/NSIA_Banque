import { apiClient } from "../client";
import { USE_MOCK_DATA } from "@/lib/utils/config";
import { mockSimulationApi } from "@/lib/mock/simulations";
import { cleanPayload } from "@/lib/utils/payload";
import type { QuestionnaireMedical, QuestionnaireResponse, PaginatedResponse } from "@/types";

// QuestionnaireMedicalWithId removed in favor of QuestionnaireResponse

/**
 * Barème de surprime
 */
export interface BaremeSurprime {
  [key: string]: {
    min: number;
    max: number;
    taux: number;
  };
}

/**
 * API pour la gestion des questionnaires médicaux
 * Endpoints: /api/v1/simulations/questionnaires-medicaux/
 */
export const questionnairesApi = {
  /**
   * Récupère la liste des questionnaires médicaux
   * GET /api/v1/simulations/questionnaires-medicaux/
   */
  getQuestionnaires: async (filters?: {
    simulation?: string;
    page?: number;
    page_size?: number;
  }): Promise<QuestionnaireResponse[]> => {
    if (USE_MOCK_DATA) {
      // Mock implementation
      return [];
    }
    const params = new URLSearchParams();
    if (filters?.simulation) params.append("search", filters.simulation); // Use search for simulation ID
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.page_size) params.append("page_size", filters.page_size.toString());

    const response = await apiClient.get<PaginatedResponse<QuestionnaireResponse> | QuestionnaireResponse[]>(
      `/api/v1/simulations/questionnaires-medicaux/?${params.toString()}`
    );

    if ('results' in response.data && Array.isArray(response.data.results)) {
      return response.data.results;
    }

    if (Array.isArray(response.data)) {
      return response.data;
    }

    return [];
  },

  /**
   * Crée un nouveau questionnaire médical
   * POST /api/v1/simulations/questionnaires-medicaux/
   */
  createQuestionnaire: async (
    data: QuestionnaireMedical & { simulation?: string }
  ): Promise<QuestionnaireResponse> => {
    if (USE_MOCK_DATA) {
      // Utiliser le mock existant
      const response = await mockSimulationApi.submitQuestionnaire(
        data.simulation ? data.simulation : "1",
        data
      );
      return {
        ...data,
        id: 123, // Mock ID as number
        simulation: data.simulation || "mock-simulation-id",
        taux_surprime: response.taux_surprime,
        categorie_risque: response.categorie_risque,
        score_total: response.score_total,
      };
    }
    // Nettoyer le payload pour enlever les valeurs undefined
    const cleanedData = cleanPayload(data) as QuestionnaireMedical & { simulation?: string };
    const response = await apiClient.post<QuestionnaireResponse>(
      "/api/v1/simulations/questionnaires-medicaux/",
      cleanedData
    );
    return response.data;
  },

  /**
   * Récupère un questionnaire médical par son ID
   * GET /api/v1/simulations/questionnaires-medicaux/{id}/
   */
  getQuestionnaire: async (id: number): Promise<QuestionnaireResponse> => {
    if (USE_MOCK_DATA) {
      throw new Error("Mock non implémenté pour getQuestionnaire");
    }
    const response = await apiClient.get<QuestionnaireResponse>(
      `/api/v1/simulations/questionnaires-medicaux/${id}/`
    );
    return response.data;
  },

  /**
   * Met à jour un questionnaire médical
   * PATCH /api/v1/simulations/questionnaires-medicaux/{id}/
   */
  updateQuestionnaire: async (
    id: number,
    data: Partial<QuestionnaireMedical>
  ): Promise<QuestionnaireResponse> => {
    if (USE_MOCK_DATA) {
      throw new Error("Mock non implémenté pour updateQuestionnaire");
    }
    // Nettoyer le payload pour enlever les valeurs undefined
    const cleanedData = cleanPayload(data) as Partial<QuestionnaireMedical>;
    const response = await apiClient.patch<QuestionnaireResponse>(
      `/api/v1/simulations/questionnaires-medicaux/${id}/`,
      cleanedData
    );
    return response.data;
  },

  /**
   * Supprime un questionnaire médical
   * DELETE /api/v1/simulations/questionnaires-medicaux/{id}/
   */
  deleteQuestionnaire: async (id: number): Promise<void> => {
    if (USE_MOCK_DATA) {
      throw new Error("Mock non implémenté pour deleteQuestionnaire");
    }
    await apiClient.delete(`/api/v1/simulations/questionnaires-medicaux/${id}/`);
  },

  /**
   * Applique un questionnaire médical à une simulation
   * POST /api/v1/simulations/questionnaires-medicaux/{id}/appliquer-a-simulation/
   */
  appliquerASimulation: async (
    id: number,
    simulationId: string
  ): Promise<QuestionnaireResponse> => {
    if (USE_MOCK_DATA) {
      // Pour le mock, on simule directement sans appeler getQuestionnaire pour éviter la récursion
      const defaultQuestionnaire: QuestionnaireMedical = {
        taille_cm: 170,
        poids_kg: 70,
        fumeur: false,
        consomme_alcool: false,
        pratique_sport: false,
        a_infirmite: false,
        malade_6_derniers_mois: false,
        souvent_fatigue: false,
        perte_poids_recente: false,
        prise_poids_recente: false,
        a_ganglions: false,
        fievre_persistante: false,
        plaies_buccales: false,
        diarrhee_frequente: false,
        ballonnement: false,
        oedemes_membres_inferieurs: false,
        essoufflement: false,
        a_eu_perfusion: false,
        a_eu_transfusion: false,
      };
      return await mockSimulationApi.submitQuestionnaire(
        simulationId,
        defaultQuestionnaire
      );
    }
    const response = await apiClient.post<QuestionnaireResponse>(
      `/api/v1/simulations/questionnaires-medicaux/${id}/appliquer-a-simulation/`,
      { simulation_id: simulationId }
    );
    return response.data;
  },

  /**
   * Recalcule la surprime d'un questionnaire médical
   * POST /api/v1/simulations/questionnaires-medicaux/{id}/recalculer-surprime/
   */
  recalculerSurprime: async (id: number): Promise<QuestionnaireResponse> => {
    if (USE_MOCK_DATA) {
      throw new Error("Mock non implémenté pour recalculerSurprime");
    }
    const response = await apiClient.post<QuestionnaireResponse>(
      `/api/v1/simulations/questionnaires-medicaux/${id}/recalculer-surprime/`
    );
    return response.data;
  },

  /**
   * Récupère le barème de surprime
   * GET /api/v1/simulations/questionnaires-medicaux/bareme/
   */
  getBareme: async (): Promise<BaremeSurprime> => {
    if (USE_MOCK_DATA) {
      // Mock barème
      return {
        imc: {
          min: 0,
          max: 18.5,
          taux: 0,
        },
        tabac: {
          min: 0,
          max: 10,
          taux: 5,
        },
      };
    }
    const response = await apiClient.get<BaremeSurprime>(
      "/api/v1/simulations/questionnaires-medicaux/bareme/"
    );
    return response.data;
  },
};

