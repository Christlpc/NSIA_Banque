import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User, LoginCredentials, AuthResponse } from "@/types";
import { authApi } from "@/lib/api/auth";

// Storage sécurisé pour SSR
const getStorage = () => {
  if (typeof window === "undefined") {
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };
  }
  return localStorage;
};

interface AuthStore {
  user: User | null;
  tokens: { access: string; refresh: string } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  checkAuth: () => void;
  setUser: (user: User | null) => void;
  setTokens: (tokens: { access: string; refresh: string } | null) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login(credentials);
          set({
            user: response.user,
            tokens: { access: response.access, refresh: response.refresh },
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error?.response?.data?.detail || "Erreur de connexion",
          });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
          error: null,
        });
      },

      refreshToken: async () => {
        const { tokens } = get();
        if (!tokens?.refresh) {
          get().logout();
          return;
        }

        try {
          const response = await authApi.refreshToken(tokens.refresh);
          set({
            tokens: { ...tokens, access: response.access },
          });
        } catch (error) {
          get().logout();
        }
      },

      checkAuth: () => {
        // Ne vérifier que côté client
        if (typeof window === "undefined") return;
        
        const { tokens, user, isAuthenticated } = get();
        const shouldBeAuthenticated = !!(tokens && user);
        
        // Ne mettre à jour que si la valeur change réellement
        if (shouldBeAuthenticated !== isAuthenticated) {
          set({ isAuthenticated: shouldBeAuthenticated });
        }
      },

      setUser: (user: User | null) => {
        set({ user });
      },

      setTokens: (tokens: { access: string; refresh: string } | null) => {
        set({ tokens, isAuthenticated: !!tokens });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => getStorage()),
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
      skipHydration: true,
    }
  )
);

