import { create } from "zustand";
import type { User, UserRole } from "@/types";
import type { UserCreateData, UserUpdateData, UserFilters, PaginatedResponse } from "@/lib/api/users";
import { userApi } from "@/lib/api/users";
import { useNotificationStore } from "@/lib/store/notificationStore";
import toast from "react-hot-toast";

interface UserStore {
  users: User[];
  currentUser: User | null;
  totalCount: number;
  filters: UserFilters;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchUsers: (filters?: UserFilters) => Promise<void>;
  fetchUser: (id: number) => Promise<void>;
  createUser: (data: UserCreateData) => Promise<User>;
  updateUser: (id: number, data: UserUpdateData) => Promise<User>;
  deleteUser: (id: number) => Promise<void>;
  activateUser: (id: number) => Promise<void>;
  deactivateUser: (id: number) => Promise<void>;
  setFilters: (filters: UserFilters) => void;
  reset: () => void;
}

export const useUserStore = create<UserStore>((set, get) => ({
  users: [],
  currentUser: null,
  totalCount: 0,
  filters: { page: 1, page_size: 10 },
  isLoading: false,
  error: null,

  fetchUsers: async (filters?: UserFilters) => {
    set({ isLoading: true, error: null });
    try {
      const currentFilters = filters || get().filters;
      const response: PaginatedResponse<User> = await userApi.getUsers(currentFilters);
      set({
        users: response.results,
        totalCount: response.count,
        filters: currentFilters,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error?.message || "Erreur lors du chargement des utilisateurs",
        isLoading: false,
      });
      toast.error("Erreur lors du chargement des utilisateurs");
    }
  },

  fetchUser: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const user = await userApi.getUser(id);
      set({ currentUser: user, isLoading: false });
    } catch (error: any) {
      set({
        error: error?.message || "Erreur lors du chargement de l'utilisateur",
        isLoading: false,
      });
      toast.error("Erreur lors du chargement de l'utilisateur");
    }
  },

  createUser: async (data: UserCreateData) => {
    set({ isLoading: true, error: null });
    try {
      // Optimistic update
      const tempUser: User = {
        id: Date.now(), // ID temporaire
        email: data.email,
        nom: data.nom,
        prenom: data.prenom,
        role: data.role,
        banque: {
          id: data.banque,
          code: "",
          nom: "",
          produits_disponibles: [],
        },
      };
      set((state) => ({
        users: [tempUser, ...state.users],
        totalCount: state.totalCount + 1,
      }));

      const newUser = await userApi.createUser(data);
      
      // Remplacer par les vraies données
      set((state) => ({
        users: state.users.map((u) => (u.id === tempUser.id ? newUser : u)),
        isLoading: false,
      }));

      toast.success("Utilisateur créé avec succès");
      
      // Notification
      useNotificationStore.getState().addNotification({
        type: "user",
        priority: "low",
        title: "Nouvel utilisateur créé",
        message: `L'utilisateur ${newUser.prenom} ${newUser.nom} a été créé avec succès`,
        action_url: "/users",
        action_label: "Voir les utilisateurs",
        metadata: { user_id: newUser.id },
      });
      
      return newUser;
    } catch (error: any) {
      // Rollback
      set((state) => ({
        users: state.users.filter((u) => u.id !== Date.now()),
        totalCount: state.totalCount - 1,
        error: error?.message || "Erreur lors de la création",
        isLoading: false,
      }));
      toast.error(error?.message || "Erreur lors de la création");
      throw error;
    }
  },

  updateUser: async (id: number, data: UserUpdateData) => {
    set({ isLoading: true, error: null });
    try {
      // Optimistic update
      const oldUser = get().users.find((u) => u.id === id);
      if (oldUser) {
        set((state) => ({
          users: state.users.map((u) =>
            u.id === id
              ? {
                  ...u,
                  ...data,
                  banque: data.banque
                    ? {
                        id: data.banque,
                        code: "",
                        nom: "",
                        produits_disponibles: [],
                      }
                    : u.banque,
                }
              : u
          ),
        }));
      }

      const updatedUser = await userApi.updateUser(id, data);
      
      // Remplacer par les vraies données
      set((state) => ({
        users: state.users.map((u) => (u.id === id ? updatedUser : u)),
        currentUser: state.currentUser?.id === id ? updatedUser : state.currentUser,
        isLoading: false,
      }));

      toast.success("Utilisateur modifié avec succès");
      return updatedUser;
    } catch (error: any) {
      // Rollback
      const oldUser = get().users.find((u) => u.id === id);
      if (oldUser) {
        set((state) => ({
          users: state.users.map((u) => (u.id === id ? oldUser : u)),
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

  deleteUser: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      // Optimistic update
      const deletedUser = get().users.find((u) => u.id === id);
      set((state) => ({
        users: state.users.filter((u) => u.id !== id),
        totalCount: state.totalCount - 1,
      }));

      await userApi.deleteUser(id);
      set({ isLoading: false });
      toast.success("Utilisateur supprimé avec succès");
    } catch (error: any) {
      // Rollback
      if (deletedUser) {
        set((state) => ({
          users: [...state.users, deletedUser].sort((a, b) => a.id - b.id),
          totalCount: state.totalCount + 1,
        }));
      }
      set({
        error: error?.message || "Erreur lors de la suppression",
        isLoading: false,
      });
      toast.error(error?.message || "Erreur lors de la suppression");
      throw error;
    }
  },

  activateUser: async (id: number) => {
    try {
      await userApi.activateUser(id);
      set((state) => ({
        users: state.users.map((u) => (u.id === id ? { ...u, is_active: true } : u)),
      }));
      toast.success("Utilisateur activé");
    } catch (error: any) {
      toast.error(error?.message || "Erreur lors de l'activation");
      throw error;
    }
  },

  deactivateUser: async (id: number) => {
    try {
      await userApi.deactivateUser(id);
      set((state) => ({
        users: state.users.map((u) => (u.id === id ? { ...u, is_active: false } : u)),
      }));
      toast.success("Utilisateur désactivé");
    } catch (error: any) {
      toast.error(error?.message || "Erreur lors de la désactivation");
      throw error;
    }
  },

  setFilters: (filters: UserFilters) => {
    set({ filters: { ...get().filters, ...filters } });
  },

  reset: () => {
    set({
      users: [],
      currentUser: null,
      totalCount: 0,
      filters: { page: 1, page_size: 10 },
      isLoading: false,
      error: null,
    });
  },
}));

