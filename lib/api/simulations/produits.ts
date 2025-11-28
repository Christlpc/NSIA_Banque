import { apiClient } from "../client";
import { USE_MOCK_DATA } from "@/lib/utils/config";
import type { Simulation } from "@/types";

// Types pour les requêtes de simulation par produit
export interface EmprunteurSimulationData {
  montant_pret: number;
  duree_mois: number;
  date_naissance: string; // YYYY-MM-DD
  date_effet: string; // YYYY-MM-DD
  taux_surprime?: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  sauvegarder: boolean;
}

export interface ElikiaSimulationData {
  rente_annuelle: number;
  age_parent: number;
  duree_rente: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  sauvegarder: boolean;
}

export interface EtudesSimulationData {
  age_parent: number;
  age_enfant: number;
  montant_rente: number;
  duree_paiement: number;
  duree_service: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  sauvegarder: boolean;
}

export interface MobateliSimulationData {
  capital_dtc_iad: number;
  age: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  sauvegarder: boolean;
}

export interface RetraiteSimulationData {
  prime_periodique_commerciale: number;
  capital_deces: number;
  duree: number;
  periodicite: string;
  age: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  sauvegarder: boolean;
}

// Types pour les réponses de simulation par produit
export interface EmprunteurSimulationResponse {
  simulation?: Simulation;
  resultats: {
    age_emprunteur: number;
    taux_applique: number;
    prime_nette: number;
    surprime: number;
    frais_accessoires: number;
    prime_totale: number;
    net_a_debourser: number;
    [key: string]: any;
  };
  message: string;
}

export interface ElikiaSimulationResponse {
  simulation?: Simulation;
  resultats: {
    prime_nette_annuelle: number;
    prime_mensuelle: number;
    prime_totale: number;
    capital_garanti: number;
    rente_annuelle: number;
    age_parent: number;
    duree_rente: number;
    tranche_age: string;
    [key: string]: any;
  };
  message: string;
}

export interface EtudesSimulationResponse {
  simulation?: Simulation;
  resultats: {
    prime_unique: number;
    prime_annuelle: number;
    prime_mensuelle: number;
    montant_rente_annuel: number;
    age_parent: number;
    age_enfant: number;
    duree_paiement: number;
    duree_service: number;
    debut_service: number;
    fin_service: number;
    [key: string]: any;
  };
  message: string;
}

export interface MobateliSimulationResponse {
  simulation?: Simulation;
  resultats: {
    prime_nette: number;
    prime_mensuelle: number;
    capital_dtc_iad: number;
    age: number;
    tranche_age: string;
    [key: string]: any;
  };
  message: string;
}

export interface RetraiteSimulationResponse {
  simulation?: Simulation;
  resultats: {
    [key: string]: any;
  };
  message: string;
}

/**
 * API pour les simulations par produit
 * Endpoints spécifiques pour chaque type de produit d'assurance
 */
export const produitsApi = {
  /**
   * Calcule une simulation Emprunteur (ADI)
   * POST /api/v1/simulations/emprunteur/
   */
  simulateEmprunteur: async (
    data: EmprunteurSimulationData
  ): Promise<EmprunteurSimulationResponse> => {
    if (USE_MOCK_DATA) {
      // Mock implementation - à remplacer par mock si nécessaire
      throw new Error("Mock non implémenté pour simulateEmprunteur");
    }
    const response = await apiClient.post<EmprunteurSimulationResponse>(
      "/api/v1/simulations/emprunteur/",
      data
    );
    return response.data;
  },

  /**
   * Calcule une simulation Elikia (BCI)
   * POST /api/v1/simulations/elikia/
   */
  simulateElikia: async (data: ElikiaSimulationData): Promise<ElikiaSimulationResponse> => {
    if (USE_MOCK_DATA) {
      throw new Error("Mock non implémenté pour simulateElikia");
    }
    const response = await apiClient.post<ElikiaSimulationResponse>(
      "/api/v1/simulations/elikia/",
      data
    );
    return response.data;
  },

  /**
   * Calcule une simulation Études
   * POST /api/v1/simulations/etudes/
   */
  simulateEtudes: async (data: EtudesSimulationData): Promise<EtudesSimulationResponse> => {
    if (USE_MOCK_DATA) {
      throw new Error("Mock non implémenté pour simulateEtudes");
    }
    const response = await apiClient.post<EtudesSimulationResponse>(
      "/api/v1/simulations/etudes/",
      data
    );
    return response.data;
  },

  /**
   * Calcule une simulation Mobateli (BCI)
   * POST /api/v1/simulations/mobateli/
   */
  simulateMobateli: async (
    data: MobateliSimulationData
  ): Promise<MobateliSimulationResponse> => {
    if (USE_MOCK_DATA) {
      throw new Error("Mock non implémenté pour simulateMobateli");
    }
    const response = await apiClient.post<MobateliSimulationResponse>(
      "/api/v1/simulations/mobateli/",
      data
    );
    return response.data;
  },

  /**
   * Calcule une simulation Retraite
   * POST /api/v1/simulations/retraite/
   */
  simulateRetraite: async (
    data: RetraiteSimulationData
  ): Promise<RetraiteSimulationResponse> => {
    if (USE_MOCK_DATA) {
      throw new Error("Mock non implémenté pour simulateRetraite");
    }
    const response = await apiClient.post<RetraiteSimulationResponse>(
      "/api/v1/simulations/retraite/",
      data
    );
    return response.data;
  },
};

