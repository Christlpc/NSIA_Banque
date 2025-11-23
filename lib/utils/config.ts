// Configuration pour activer/désactiver le mode mock
// Par défaut DÉSACTIVÉ pour utiliser l'API réelle
export const USE_MOCK_DATA =
  process.env.NEXT_PUBLIC_USE_MOCK === "true";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://nsia-bancassurance.onrender.com";

