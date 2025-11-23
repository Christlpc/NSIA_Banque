import { delay } from "./data";
import { mockUsers } from "./data";
import type { LoginCredentials, AuthResponse } from "@/types";

export const mockAuthApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    await delay(800); // Simuler un délai réseau

    // Trouver un utilisateur mock ou utiliser le premier
    const user = mockUsers.find((u) => u.email === credentials.email) || mockUsers[1];

    // Simuler une erreur si email/password incorrect
    if (credentials.email === "error@test.com") {
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




