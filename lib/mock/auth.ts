import { delay } from "./data";
import { mockUsers } from "./data";
import type { LoginCredentials, AuthResponse } from "@/types";

export const mockAuthApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    await delay(800); // Simuler un délai réseau

    // Trouver un utilisateur mock ou utiliser le premier
    // Le username peut être soit l'email soit un nom d'utilisateur
    const user = mockUsers.find((u) => u.email === credentials.username) || mockUsers[1];

    // Simuler une erreur si username/password incorrect
    if (credentials.username === "error@test.com") {
      throw new Error("Identifiants incorrects");
    }

    return {
      access: "mock_access_token_" + Date.now(),
      refresh: "mock_refresh_token_" + Date.now(),
      user: user,
    };
  },

  refreshToken: async (refresh: string): Promise<{ access: string }> => {
    await delay(300);
    return {
      access: "mock_access_token_" + Date.now(),
    };
  },

  logout: async (): Promise<void> => {
    await delay(200);
  },
};




