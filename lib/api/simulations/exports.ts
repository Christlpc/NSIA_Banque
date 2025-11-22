import { apiClient } from "../client";
import { USE_MOCK_DATA } from "@/lib/utils/config";
import { mockSimulationApi } from "@/lib/mock/simulations";

/**
 * Informations BIA d'une simulation
 */
export interface BIAInfo {
  simulation_id: string;
  reference: string;
  nom: string;
  prenom: string;
  date_naissance: string;
  produit: string;
  prime_totale?: string;
  date_effet?: string;
  [key: string]: any;
}

/**
 * API pour l'export BIA (Bulletin d'Information d'Assurance)
 * Endpoints: /api/v1/simulations/simulations/{simulation_id}/
 */
export const exportsApi = {
  /**
   * Récupère les informations BIA d'une simulation
   * GET /api/v1/simulations/simulations/{simulation_id}/bia-info/
   */
  getBIAInfo: async (simulationId: string): Promise<BIAInfo> => {
    if (USE_MOCK_DATA) {
      // Mock implementation
      return {
        simulation_id: simulationId,
        reference: `SIM-${simulationId}`,
        nom: "Mock",
        prenom: "User",
        date_naissance: "1990-01-01",
        produit: "emprunteur",
        prime_totale: "50000",
      };
    }
    const response = await apiClient.get<BIAInfo>(
      `/api/v1/simulations/simulations/${simulationId}/bia-info/`
    );
    return response.data;
  },

  /**
   * Exporte le BIA en PDF
   * GET /api/v1/simulations/simulations/{simulation_id}/export-bia/
   * @returns Blob du PDF
   */
  exportBIA: async (simulationId: string): Promise<Blob> => {
    if (USE_MOCK_DATA) {
      return mockSimulationApi.exportBIA(Number(simulationId));
    }
    const response = await apiClient.get(
      `/api/v1/simulations/simulations/${simulationId}/export-bia/`,
      {
        responseType: "blob",
      }
    );
    return response.data;
  },

  /**
   * Récupère un aperçu du BIA en PDF
   * GET /api/v1/simulations/simulations/{simulation_id}/preview-bia/
   * @returns URL de l'objet blob pour preview
   */
  previewBIA: async (simulationId: string): Promise<string> => {
    if (USE_MOCK_DATA) {
      return mockSimulationApi.previewBIA(Number(simulationId));
    }
    const response = await apiClient.get(
      `/api/v1/simulations/simulations/${simulationId}/preview-bia/`,
      {
        responseType: "blob",
      }
    );
    return URL.createObjectURL(response.data);
  },
};

