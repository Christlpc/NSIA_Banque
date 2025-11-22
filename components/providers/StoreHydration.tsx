"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/store/authStore";

export function StoreHydration({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Hydrater le store Zustand après le montage côté client
    if (typeof window !== "undefined") {
      try {
        useAuthStore.persist.rehydrate();
        // Vérifier l'authentification après l'hydratation
        setTimeout(() => {
          useAuthStore.getState().checkAuth();
        }, 50);
      } catch (error) {
        console.error("Error hydrating store:", error);
      }
    }
  }, []);

  // Afficher les enfants immédiatement
  return <>{children}</>;
}

