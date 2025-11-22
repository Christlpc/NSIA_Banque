import { create } from "zustand";
import type { Banque } from "@/types";
import { banqueApi, type BanqueCreateData, type BanqueUpdateData } from "@/lib/api/banques";
import { useNotificationStore } from "@/lib/store/notificationStore";
import toast from "react-hot-toast";

interface BanqueStore {
  banques: Banque[];
  currentBanque: Banque | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchBanques: () => Promise<void>;
  fetchBanque: (id: number) => Promise<void>;
  createBanque: (data: BanqueCreateData) => Promise<Banque>;
  updateBanque: (id: number, data: BanqueUpdateData) => Promise<Banque>;
  reset: () => void;
}

export const useBanqueStore = create<BanqueStore>((set, get) => ({
  banques: [],
  currentBanque: null,
  isLoading: false,
  error: null,

  fetchBanques: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await banqueApi.getBanques();
      set({
        banques: response.results,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error?.message || "Erreur lors du chargement des banques",
        isLoading: false,
      });
      toast.error("Erreur lors du chargement des banques");
    }
  },

  fetchBanque: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const banque = await banqueApi.getBanque(id);
      set({ currentBanque: banque, isLoading: false });
    } catch (error: any) {
      set({
        error: error?.message || "Erreur lors du chargement de la banque",
        isLoading: false,
      });
      toast.error("Erreur lors du chargement de la banque");
    }
  },

  createBanque: async (data: BanqueCreateData) => {
    set({ isLoading: true, error: null });
    let tempId: number | null = null;
    try {
      // Optimistic update
      const existingIds = get().banques.map((b) => b.id);
      tempId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
      const tempBanque: Banque = {
        id: tempId,
        nom: data.nom,
        code: data.code.toUpperCase(),
        email: data.email,
        telephone: data.telephone,
        adresse: data.adresse,
        produits_disponibles: data.produits_disponibles as any,
        date_partenariat: data.date_partenariat,
        nombre_simulations: 0,
      };

      set((state) => ({
        banques: [...state.banques, tempBanque],
      }));

      // Appel API
      const newBanque = await banqueApi.createBanque(data);

      // Remplacer la banque temporaire par la vraie
      set((state) => ({
        banques: state.banques.map((b) => (b.id === tempId ? newBanque : b)),
        isLoading: false,
      }));

        toast.success("Banque créée avec succès");
        
        // Notification
        useNotificationStore.getState().addNotification({
          type: "banque",
          priority: "medium",
          title: "Nouvelle banque créée",
          message: `La banque ${newBanque.nom} a été créée avec succès`,
          action_url: `/banques/${newBanque.id}`,
          action_label: "Voir la banque",
          metadata: { banque_id: newBanque.id },
        });
        
        return newBanque;
    } catch (error: any) {
      // Rollback
      if (tempId !== null) {
        set((state) => ({
          banques: state.banques.filter((b) => b.id !== tempId),
        }));
      }
      set({
        error: error?.message || "Erreur lors de la création",
        isLoading: false,
      });
      toast.error(error?.message || "Erreur lors de la création");
      throw error;
    }
  },

  updateBanque: async (id: number, data: BanqueUpdateData) => {
    set({ isLoading: true, error: null });
    try {
      // Optimistic update
      const oldBanque = get().banques.find((b) => b.id === id);
      if (oldBanque) {
        set((state) => ({
          banques: state.banques.map((b) =>
            b.id === id
              ? {
                  ...b,
                  nom: data.nom ?? b.nom,
                  code: data.code ? data.code.toUpperCase() : b.code,
                  email: data.email !== undefined ? data.email : b.email,
                  telephone: data.telephone !== undefined ? data.telephone : b.telephone,
                  adresse: data.adresse !== undefined ? data.adresse : b.adresse,
                  produits_disponibles: (data.produits_disponibles as any) ?? b.produits_disponibles,
                  date_partenariat: data.date_partenariat !== undefined ? data.date_partenariat : b.date_partenariat,
                }
              : b
          ),
        }));
      }

      // Appel API
      const updatedBanque = await banqueApi.updateBanque(id, data);

      set((state) => ({
        banques: state.banques.map((b) => (b.id === id ? updatedBanque : b)),
        currentBanque: state.currentBanque?.id === id ? updatedBanque : state.currentBanque,
        isLoading: false,
      }));

        toast.success("Banque modifiée avec succès");
        
        // Notification
        useNotificationStore.getState().addNotification({
          type: "banque",
          priority: "low",
          title: "Banque mise à jour",
          message: `Les informations de la banque ${updatedBanque.nom} ont été modifiées`,
          action_url: `/banques/${id}`,
          action_label: "Voir la banque",
          metadata: { banque_id: id },
        });
        
        return updatedBanque;
    } catch (error: any) {
      // Rollback
      const oldBanque = get().banques.find((b) => b.id === id);
      if (oldBanque) {
        set((state) => ({
          banques: state.banques.map((b) => (b.id === id ? oldBanque : b)),
        }));
      }
      set({
        error: error?.message || "Erreur lors de la modification",
        isLoading: false,
      });
      toast.error(error?.message || "Erreur lors de la modification");
      throw error;
    }
  },

  reset: () => {
    set({
      banques: [],
      currentBanque: null,
      isLoading: false,
      error: null,
    });
  },
}));

