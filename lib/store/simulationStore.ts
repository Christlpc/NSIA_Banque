import { create } from "zustand";
import type { Simulation, SimulationFilters, SimulationCreateData, ProduitType } from "@/types";
import { PRODUIT_LABELS } from "@/types";
import { simulationApi } from "@/lib/api/simulations";
import { useNotificationStore } from "@/lib/store/notificationStore";
import { notificationApi } from "@/lib/api/notifications";
import toast from "react-hot-toast";

// Créer un mapping inverse label -> clé
const PRODUIT_KEYS: Record<string, ProduitType> = Object.entries(PRODUIT_LABELS).reduce(
  (acc, [key, label]) => {
    acc[label.toLowerCase()] = key as ProduitType;
    return acc;
  },
  {} as Record<string, ProduitType>
);

// Ajouter des mappings supplémentaires pour les variations courantes
PRODUIT_KEYS["mobateli (dtc/iad)"] = "mobateli";
PRODUIT_KEYS["emprunteur (adi)"] = "emprunteur";
PRODUIT_KEYS["confort études"] = "confort_etudes";
PRODUIT_KEYS["épargne plus"] = "epargne_plus";

/**
 * Normalise le nom du produit (label ou clé) vers la clé standard
 */
function normalizeProductKey(product: string): ProduitType {
  const normalized = product.toLowerCase().trim();

  // Si c'est déjà une clé valide
  if (PRODUIT_LABELS[normalized as ProduitType]) {
    return normalized as ProduitType;
  }

  // Chercher dans le mapping inverse
  if (PRODUIT_KEYS[normalized]) {
    return PRODUIT_KEYS[normalized];
  }

  // Fallback: retourner tel quel (le switch gérera l'erreur)
  return product as ProduitType;
}

interface WizardData {
  step: number;
  simulationData: any | null;
  questionnaireData: any | null;
  createdSimulationId?: string;
  biaInfo?: any;
}

interface SimulationStore {
  simulations: Simulation[];
  currentSimulation: Simulation | null;
  filters: SimulationFilters;
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null; // Timestamp of last fetch
  // Wizard State
  wizardData: WizardData;

  fetchSimulations: (params?: SimulationFilters, force?: boolean) => Promise<void>;
  fetchSimulation: (id: string) => Promise<void>;
  createSimulation: (product: string, data: SimulationCreateData) => Promise<Simulation>;
  updateSimulation: (id: string, data: Partial<SimulationCreateData>) => Promise<void>;
  deleteSimulation: (id: string) => Promise<void>;
  calculatePrime: (id: string) => Promise<void>; // @deprecated - Ne plus utiliser
  validateSimulation: (id: string) => Promise<void>;
  convertSimulation: (id: string, data?: any) => Promise<void>;
  setFilters: (filters: Partial<SimulationFilters>) => void;
  setCurrentSimulation: (simulation: Simulation | null) => void;
  reset: () => void;

  // Wizard Actions
  setWizardStep: (step: number) => void;
  updateWizardData: (data: Partial<WizardData>) => void;
  resetWizard: () => void;
}

const initialFilters: SimulationFilters = {
  page: 1,
};

const CACHE_DURATION = 30000; // 30 seconds cache

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  simulations: [],
  currentSimulation: null,
  filters: initialFilters,
  totalCount: 0,
  isLoading: false,
  error: null,
  lastFetched: null,

  // Wizard Initial State
  wizardData: {
    step: 1,
    simulationData: null,
    questionnaireData: null,
    createdSimulationId: undefined,
    biaInfo: null,
  },

  fetchSimulations: async (params?: SimulationFilters, force = false) => {
    const state = get();

    // Skip if already loading
    if (state.isLoading) {
      console.log("[SimulationStore] Skip: already loading");
      return;
    }

    // Check if filters changed
    const filters = { ...state.filters, ...params };
    const filtersChanged = JSON.stringify(filters) !== JSON.stringify(state.filters);

    // Skip if recently fetched (within CACHE_DURATION), not forced, and filters haven't changed
    if (!force && !filtersChanged && state.lastFetched && state.simulations.length > 0) {
      const timeSinceLastFetch = Date.now() - state.lastFetched;
      if (timeSinceLastFetch < CACHE_DURATION) {
        console.log(`[SimulationStore] Skip: cached (${Math.round(timeSinceLastFetch / 1000)}s ago)`);
        return;
      }
    }

    set({ isLoading: true, error: null });
    try {
      const response = await simulationApi.getSimulations(filters);
      set({
        simulations: response.results,
        totalCount: response.count,
        filters,
        isLoading: false,
        error: null,
        lastFetched: Date.now(),
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error?.response?.data?.detail || "Erreur lors du chargement des simulations",
      });
    }
  },

  fetchSimulation: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const simulation = await simulationApi.getSimulation(id);
      set({
        currentSimulation: simulation,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error?.response?.data?.detail || "Erreur lors du chargement de la simulation",
      });
    }
  },

  createSimulation: async (product: string, data: SimulationCreateData) => {
    // Optimistic update
    const tempId = Date.now().toString();
    const optimisticSimulation: Simulation = {
      id: tempId,
      reference: `SIM-TEMP-${tempId}`,
      produit: product as any,
      statut: "brouillon",
      ...data,
      // Map create data to client fields for optimistic update
      nom_client: data.nom,
      prenom_client: data.prenom,
      email_client: data.email || "",
      telephone_client: data.telephone || "",
      adresse_postale: data.adresse,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 1,
      banque: 2,
    };

    // Add optimistically
    set((state) => ({
      simulations: [optimisticSimulation, ...state.simulations],
      totalCount: state.totalCount + 1,
      isLoading: true,
      error: null,
    }));

    try {
      let response;
      const { produitsApi } = await import("@/lib/api/simulations/produits");

      // Normaliser le produit (peut être un label ou une clé)
      const normalizedProduct = normalizeProductKey(product);

      // Appel de l'API spécifique selon le produit
      switch (normalizedProduct) {
        case "emprunteur":
          response = await produitsApi.simulateEmprunteur(data as any);
          break;
        case "elikia_scolaire":
          // Elikia n'accepte que des champs spécifiques
          const elikiaPayload = {
            rente_annuelle: data.rente_annuelle || 200000,
            age_parent: data.age_parent || 35,
            duree_rente: data.duree_rente || 5,
            nom: data.nom,
            prenom: data.prenom,
            email: data.email || "",
            telephone: data.telephone || "",
            sauvegarder: data.sauvegarder ?? false,
          };
          response = await produitsApi.simulateElikia(elikiaPayload);
          break;
        case "confort_etudes":
          response = await produitsApi.simulateEtudes(data as any);
          break;
        case "mobateli":
          response = await produitsApi.simulateMobateli(data as any);
          break;
        case "confort_retraite":
        case "epargne_plus":
          response = await produitsApi.simulateRetraite(data as any);
          break;
        default:
          throw new Error(`Produit non supporté: ${normalizedProduct} (original: ${product})`);
      }

      // La réponse contient { simulation, resultats, message }
      // Si sauvegarder=true, simulation est présent
      const simulation = response.simulation;

      if (!simulation) {
        // Si c'est une simulation simple (sauvegarder: false), on retourne les résultats
        // et on annule l'ajout optimiste dans la liste
        if (data.sauvegarder === false && response.resultats) {
          set((state) => ({
            simulations: state.simulations.filter((s) => s.id !== tempId),
            totalCount: state.totalCount - 1,
            isLoading: false,
            error: null,
          }));
          // On retourne les résultats comme si c'était une simulation (pour l'affichage)
          return { ...data, ...response.resultats } as any;
        }
        throw new Error("La simulation n'a pas été sauvegardée");
      }

      // Replace optimistic with real data
      set((state) => ({
        simulations: state.simulations.map((s) =>
          s.id === tempId ? simulation : s
        ),
        isLoading: false,
        error: null,
      }));

      // Notification
      useNotificationStore.getState().addNotification({
        type: "simulation",
        priority: "high",
        title: "Nouvelle simulation créée",
        message: `La simulation ${simulation.reference} a été créée avec succès`,
        action_url: `/simulations/${simulation.id}`,
        action_label: "Voir la simulation",
        metadata: { simulation_id: simulation.id },
      });

      return simulation;
    } catch (error: any) {
      // Rollback on error
      set((state) => ({
        simulations: state.simulations.filter((s) => s.id !== tempId),
        totalCount: state.totalCount - 1,
        isLoading: false,
        error: error?.response?.data?.detail || "Erreur lors de la création de la simulation",
      }));
      throw error;
    }
  },

  updateSimulation: async (id: string, data: Partial<SimulationCreateData>) => {
    // Optimistic update
    const previousSimulations = get().simulations;
    const previousSimulation = get().currentSimulation;

    set((state) => ({
      simulations: state.simulations.map((s) =>
        s.id === id ? { ...s, ...data, updated_at: new Date().toISOString() } : s
      ),
      currentSimulation: state.currentSimulation?.id === id
        ? { ...state.currentSimulation, ...data, updated_at: new Date().toISOString() }
        : state.currentSimulation,
      isLoading: true,
      error: null,
    }));

    try {
      await simulationApi.updateSimulation(id, data);
      await get().fetchSimulation(id);
      set({ isLoading: false, error: null });
    } catch (error: any) {
      // Rollback on error
      set({
        simulations: previousSimulations,
        currentSimulation: previousSimulation,
        isLoading: false,
        error: error?.response?.data?.detail || "Erreur lors de la mise à jour",
      });
      throw error;
    }
  },

  deleteSimulation: async (id: string) => {
    // Optimistic update
    const deletedSimulation = get().simulations.find((s) => s.id === id);
    const previousSimulations = get().simulations;

    set((state) => ({
      simulations: state.simulations.filter((s) => s.id !== id),
      totalCount: state.totalCount - 1,
      currentSimulation: state.currentSimulation?.id === id ? null : state.currentSimulation,
      isLoading: true,
      error: null,
    }));

    try {
      await simulationApi.deleteSimulation(id);
      set({ isLoading: false, error: null });
    } catch (error: any) {
      // Rollback on error
      set({
        simulations: previousSimulations,
        totalCount: previousSimulations.length,
        isLoading: false,
        error: error?.response?.data?.detail || "Erreur lors de la suppression",
      });
      throw error;
    }
  },

  calculatePrime: async (id: string) => {
    // Optimistic update
    const previousSimulation = get().currentSimulation;

    set((state) => ({
      simulations: state.simulations.map((s) =>
        s.id === id ? { ...s, statut: "calculee" as const, updated_at: new Date().toISOString() } : s
      ),
      currentSimulation: state.currentSimulation?.id === id
        ? { ...state.currentSimulation, statut: "calculee" as const, updated_at: new Date().toISOString() }
        : state.currentSimulation,
      isLoading: true,
      error: null,
    }));

    try {
      await simulationApi.calculatePrime(id);
      await get().fetchSimulation(id);
      set({ isLoading: false, error: null });
    } catch (error: any) {
      // Rollback on error
      set({
        currentSimulation: previousSimulation,
        isLoading: false,
        error: error?.response?.data?.detail || "Erreur lors du calcul",
      });
      throw error;
    }
  },

  validateSimulation: async (id: string) => {
    // Optimistic update
    const previousSimulation = get().currentSimulation;

    set((state) => ({
      simulations: state.simulations.map((s) =>
        s.id === id ? { ...s, statut: "validee" as const, updated_at: new Date().toISOString() } : s
      ),
      currentSimulation: state.currentSimulation?.id === id
        ? { ...state.currentSimulation, statut: "validee" as const, updated_at: new Date().toISOString() }
        : state.currentSimulation,
      isLoading: true,
      error: null,
    }));

    try {
      await simulationApi.validateSimulation(id);
      await get().fetchSimulation(id);
      set({ isLoading: false, error: null });

      // Notification
      const sim = get().currentSimulation;
      if (sim) {
        useNotificationStore.getState().addNotification({
          type: "simulation",
          priority: "medium",
          title: "Simulation validée",
          message: `La simulation ${sim.reference} a été validée avec succès`,
          action_url: `/simulations/${id}`,
          action_label: "Voir la simulation",
          metadata: { simulation_id: id },
        });
      }
      toast.success("Simulation validée avec succès");

      // Notification Admin
      notificationApi.sendNotification({
        type: "simulation",
        priority: "medium",
        title: "Simulation validée",
        message: `La simulation ${id.toString().substring(0, 8)}... a été validée`,
        action_url: `/simulations/${id}`,
        action_label: "Voir le dossier",
        metadata: { simulation_id: id }
      });
    } catch (error: any) {
      // Rollback on error
      set({
        currentSimulation: previousSimulation,
        isLoading: false,
        error: error?.response?.data?.detail || "Erreur lors de la validation",
      });
      throw error;
    }
  },

  convertSimulation: async (id: string, data?: any) => {
    // Optimistic update
    const previousSimulation = get().currentSimulation;

    set((state) => ({
      simulations: state.simulations.map((s) =>
        s.id === id ? { ...s, statut: "convertie" as const, updated_at: new Date().toISOString() } : s
      ),
      currentSimulation: state.currentSimulation?.id === id
        ? { ...state.currentSimulation, statut: "convertie" as const, updated_at: new Date().toISOString() }
        : state.currentSimulation,
      isLoading: true,
      error: null,
    }));

    try {
      const response = await simulationApi.convertSimulation(id, data);
      await get().fetchSimulation(id);
      set({ isLoading: false, error: null });

      toast.success(`Simulation convertie en souscription #${response.id}`);

      // Notification Admin (Souscription)
      notificationApi.sendNotification({
        type: "user",
        priority: "high",
        title: "Nouvelle Souscription",
        message: `Contrat généré (Ref: ${response.id})`,
        action_url: `/souscriptions/${response.id}`,
        action_label: "Voir le contrat",
        metadata: { souscription_id: response.id, simulation_id: id }
      });
    } catch (error: any) {
      // Rollback on error
      set({
        currentSimulation: previousSimulation,
        isLoading: false,
        error: error?.response?.data?.detail || "Erreur lors de la conversion",
      });
      throw error;
    }
  },

  setFilters: (filters: Partial<SimulationFilters>) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }));
  },

  setCurrentSimulation: (simulation: Simulation | null) => {
    set({ currentSimulation: simulation });
  },

  reset: () => {
    set({
      simulations: [],
      currentSimulation: null,
      filters: initialFilters,
      totalCount: 0,
      error: null,
    });
  },
  // Wizard Actions
  setWizardStep: (step: number) => {
    set((state) => ({
      wizardData: { ...state.wizardData, step },
    }));
  },

  updateWizardData: (data: Partial<WizardData>) => {
    set((state) => ({
      wizardData: { ...state.wizardData, ...data },
    }));
  },

  resetWizard: () => {
    set({
      wizardData: {
        step: 1,
        simulationData: null,
        questionnaireData: null,
      },
    });
  },
}));

