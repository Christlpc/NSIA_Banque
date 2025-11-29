import { create } from "zustand";
import type { Simulation, SimulationFilters, SimulationCreateData } from "@/types";
import { simulationApi } from "@/lib/api/simulations";
import { useNotificationStore } from "@/lib/store/notificationStore";

interface SimulationStore {
  simulations: Simulation[];
  currentSimulation: Simulation | null;
  filters: SimulationFilters;
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  fetchSimulations: (params?: SimulationFilters) => Promise<void>;
  fetchSimulation: (id: string) => Promise<void>;
  createSimulation: (product: string, data: SimulationCreateData) => Promise<Simulation>;
  updateSimulation: (id: string, data: Partial<SimulationCreateData>) => Promise<void>;
  deleteSimulation: (id: string) => Promise<void>;
  calculatePrime: (id: string) => Promise<void>; // @deprecated - Ne plus utiliser
  validateSimulation: (id: string) => Promise<void>;
  convertSimulation: (id: string) => Promise<void>;
  setFilters: (filters: Partial<SimulationFilters>) => void;
  setCurrentSimulation: (simulation: Simulation | null) => void;
  reset: () => void;
}

const initialFilters: SimulationFilters = {
  page: 1,
};

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  simulations: [],
  currentSimulation: null,
  filters: initialFilters,
  totalCount: 0,
  isLoading: false,
  error: null,

  fetchSimulations: async (params?: SimulationFilters) => {
    set({ isLoading: true, error: null });
    try {
      const filters = { ...get().filters, ...params };
      const response = await simulationApi.getSimulations(filters);
      set({
        simulations: response.results,
        totalCount: response.count,
        filters,
        isLoading: false,
        error: null,
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

      // Appel de l'API spécifique selon le produit
      switch (product) {
        case "emprunteur":
          response = await produitsApi.simulateEmprunteur(data as any);
          break;
        case "elikia_scolaire":
          response = await produitsApi.simulateElikia(data as any);
          break;
        case "confort_etudes":
          response = await produitsApi.simulateEtudes(data as any);
          break;
        case "mobateli":
          response = await produitsApi.simulateMobateli(data as any);
          break;
        case "confort_retraite":
          response = await produitsApi.simulateRetraite(data as any);
          break;
        default:
          throw new Error(`Produit non supporté: ${product}`);
      }

      // La réponse contient { simulation, resultats, message }
      // Si sauvegarder=true, simulation est présent
      const simulation = response.simulation;

      if (!simulation) {
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

  convertSimulation: async (id: string) => {
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
      await simulationApi.convertSimulation(id);
      await get().fetchSimulation(id);
      set({ isLoading: false, error: null });

      // Notification
      const sim = get().currentSimulation;
      if (sim) {
        useNotificationStore.getState().addNotification({
          type: "simulation",
          priority: "high",
          title: "Simulation convertie",
          message: `La simulation ${sim.reference} a été convertie en contrat`,
          action_url: `/simulations/${id}`,
          action_label: "Voir la simulation",
          metadata: { simulation_id: id },
        });
      }
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
}));

