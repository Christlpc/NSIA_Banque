import { apiClient } from "../client";
import { USE_MOCK_DATA } from "@/lib/utils/config";
import { mockSimulationApi } from "@/lib/mock/simulations";
import { cleanPayload } from "@/lib/utils/payload";
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

// Transformer une simulation API vers le format frontend
interface ApiSimulation {
  id: string;
  reference?: string;
  produit?: string;
  statut?: string;
  date_creation?: string;
  date_modification?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

function transformApiSimulation(apiSim: ApiSimulation): Simulation {
  return {
    ...apiSim,
    // Mapper les champs de date
    created_at: apiSim.created_at || apiSim.date_creation || new Date().toISOString(),
    updated_at: apiSim.updated_at || apiSim.date_modification || new Date().toISOString(),
  } as Simulation;
}

function transformPaginatedSimulations(response: PaginatedResponse<ApiSimulation>): PaginatedResponse<Simulation> {
  return {
    ...response,
    results: response.results.map(transformApiSimulation),
  };
}

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
    // page_size optionnel - non dans SimulationFilters mais peut être ajouté dynamiquement
    if ((filters as any)?.page_size) params.append("page_size", (filters as any).page_size.toString());

    const response = await apiClient.get<PaginatedResponse<ApiSimulation>>(
      `/api/v1/simulations/historique/?${params.toString()}`
    );
    return transformPaginatedSimulations(response.data);
  },

  /**
   * Récupère une simulation par son ID
   * GET /api/v1/simulations/historique/{id}/
   */
  getSimulation: async (id: string): Promise<Simulation> => {
    if (USE_MOCK_DATA) {
      return mockSimulationApi.getSimulation(id);
    }
    const response = await apiClient.get<ApiSimulation>(`/api/v1/simulations/historique/${id}/`);
    return transformApiSimulation(response.data);
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
    // Nettoyer le payload pour enlever les valeurs undefined
    const cleanedData = cleanPayload(data) as SimulationCreateData;

    // Mapper les données vers la structure attendue par l'API (imbriquée)
    const apiPayload = {
      nom_client: cleanedData.nom,
      prenom_client: cleanedData.prenom,
      email_client: cleanedData.email,
      telephone_client: cleanedData.telephone,
      adresse_postale: cleanedData.adresse,
      profession: cleanedData.profession,
      employeur: cleanedData.employeur,
      numero_compte: cleanedData.numero_compte,
      situation_matrimoniale: cleanedData.situation_matrimoniale,
      date_naissance: cleanedData.date_naissance,
      produit: cleanedData.produit || "emprunteur", // Fallback si manquant
      donnees_entree: {
        ...cleanedData,
        // On retire les champs clients du donnees_entree pour éviter la duplication inutile
        nom: undefined,
        prenom: undefined,
        email: undefined,
        telephone: undefined,
        adresse: undefined,
        profession: undefined,
        employeur: undefined,
        numero_compte: undefined,
        situation_matrimoniale: undefined,
        date_naissance: undefined,
      }
    };

    const response = await apiClient.post<Simulation>("/api/v1/simulations/historique/", cleanPayload(apiPayload));
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
      return mockSimulationApi.updateSimulation(id, data);
    }
    // Nettoyer le payload pour enlever les valeurs undefined
    const cleanedData = cleanPayload(data) as Partial<SimulationCreateData>;

    // Mapper les données vers la structure attendue par l'API (imbriquée)
    const apiPayload: any = {};

    // Mapper les champs clients s'ils sont présents
    if (cleanedData.nom) apiPayload.nom_client = cleanedData.nom;
    if (cleanedData.prenom) apiPayload.prenom_client = cleanedData.prenom;
    if (cleanedData.email) apiPayload.email_client = cleanedData.email;
    if (cleanedData.telephone) apiPayload.telephone_client = cleanedData.telephone;
    if (cleanedData.adresse) apiPayload.adresse_postale = cleanedData.adresse;
    if (cleanedData.profession) apiPayload.profession = cleanedData.profession;
    if (cleanedData.employeur) apiPayload.employeur = cleanedData.employeur;
    if (cleanedData.numero_compte) apiPayload.numero_compte = cleanedData.numero_compte;
    if (cleanedData.situation_matrimoniale) apiPayload.situation_matrimoniale = cleanedData.situation_matrimoniale;
    if (cleanedData.date_naissance) apiPayload.date_naissance = cleanedData.date_naissance;

    // Tout le reste va dans donnees_entree
    // On exclut les champs mappés explicitement ci-dessus
    const {
      nom, prenom, email, telephone, adresse, profession, employeur, numero_compte, situation_matrimoniale, date_naissance,
      ...rest
    } = cleanedData;

    if (Object.keys(rest).length > 0) {
      apiPayload.donnees_entree = rest;
    }

    const response = await apiClient.patch<Simulation>(
      `/api/v1/simulations/historique/${id}/`,
      cleanPayload(apiPayload)
    );
    return response.data;
  },

  /**
   * Supprime une simulation
   * DELETE /api/v1/simulations/historique/{id}/
   */
  deleteSimulation: async (id: string): Promise<void> => {
    if (USE_MOCK_DATA) {
      return mockSimulationApi.deleteSimulation(id);
    }
    await apiClient.delete(`/api/v1/simulations/historique/${id}/`);
  },

  /**
   * Valide une simulation
   * POST /api/v1/simulations/historique/{id}/valider/
   */
  validateSimulation: async (id: string): Promise<Simulation> => {
    if (USE_MOCK_DATA) {
      return mockSimulationApi.validateSimulation(id);
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
    data?: SouscriptionPayload
  ): Promise<Simulation> => {
    if (USE_MOCK_DATA) {
      return mockSimulationApi.convertSimulation(id);
    }
    const response = await apiClient.post<Simulation>(
      `/api/v1/simulations/historique/${id}/souscrire/`,
      cleanPayload(data || {})
    );
    return response.data;
  },
};

/**
 * Interface pour le payload de souscription
 * Envoyé lors de la conversion d'une simulation en souscription
 */
export interface SouscriptionPayload {
  simulation?: string; // UUID de la simulation
  banque?: string; // UUID de la banque
  gestionnaire?: string; // UUID du gestionnaire
  statut?: string; // Statut de la souscription
  nom?: string;
  prenom?: string;
  date_naissance?: string; // Format: YYYY-MM-DD
  lieu_naissance?: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  profession?: string;
  employeur?: string;
  numero_compte?: string;
  documents?: string; // Type de document: "passeport", "carte_identite", etc.
  date_effet_contrat?: string; // Format: YYYY-MM-DD
  date_echeance_contrat?: string; // Format: YYYY-MM-DD
  montant_prime?: string;
  donnees_produit?: Record<string, any> | null;
  date_validation?: string; // Format: ISO 8601
  notes?: string;
  commentaires?: string;
}

