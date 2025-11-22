import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { API_BASE_URL } from "@/lib/utils/constants";
import { useAuthStore } from "@/lib/store/authStore";
import toast from "react-hot-toast";

// Créer une instance axios
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Pour les cookies httpOnly
});

// Intercepteur de requête
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { tokens } = useAuthStore.getState();
    if (tokens?.access && config.headers) {
      config.headers.Authorization = `Bearer ${tokens.access}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur de réponse
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Erreur 401 - Token expiré
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { refreshToken } = useAuthStore.getState();
        await refreshToken();
        const { tokens } = useAuthStore.getState();
        if (tokens?.access && originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${tokens.access}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    // Gestion des erreurs
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as any;

      switch (status) {
        case 400:
          if (data) {
            const errors = Object.values(data).flat() as string[];
            toast.error(errors[0] || "Erreur de validation");
          }
          break;
        case 403:
          toast.error("Accès refusé. Vous n'avez pas les permissions nécessaires.");
          break;
        case 404:
          toast.error("Ressource introuvable");
          break;
        case 500:
          toast.error("Erreur serveur. Veuillez réessayer plus tard.");
          break;
        default:
          toast.error(data?.detail || "Une erreur est survenue");
      }
    } else if (error.request) {
      toast.error("Erreur de connexion. Vérifiez votre connexion internet.");
    }

    return Promise.reject(error);
  }
);



