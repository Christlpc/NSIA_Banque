import type { Banque } from "@/types";

export interface BankTheme {
  primary: string;
  secondary: string;
  accent: string;
  gradient: string;
  logo?: string;
  name: string;
}

// Thèmes par banque
export const bankThemes: Record<string, BankTheme> = {
  NSIA: {
    primary: "from-blue-600 to-indigo-700",
    secondary: "bg-blue-50",
    accent: "text-blue-600",
    gradient: "bg-gradient-to-br from-blue-600 to-indigo-700",
    name: "NSIA Vie Assurances",
  },
  ECO: {
    primary: "from-green-600 to-emerald-700",
    secondary: "bg-green-50",
    accent: "text-green-600",
    gradient: "bg-gradient-to-br from-green-600 to-emerald-700",
    name: "Ecobank Congo",
  },
  CDCO: {
    primary: "from-purple-600 to-pink-700",
    secondary: "bg-purple-50",
    accent: "text-purple-600",
    gradient: "bg-gradient-to-br from-purple-600 to-pink-700",
    name: "Crédit du Congo",
  },
  BGFI: {
    primary: "from-orange-600 to-red-700",
    secondary: "bg-orange-50",
    accent: "text-orange-600",
    gradient: "bg-gradient-to-br from-orange-600 to-red-700",
    name: "BGFI Bank",
  },
  BCI: {
    primary: "from-cyan-600 to-blue-700",
    secondary: "bg-cyan-50",
    accent: "text-cyan-600",
    gradient: "bg-gradient-to-br from-cyan-600 to-blue-700",
    name: "BCI",
  },
  CHF: {
    primary: "from-teal-600 to-green-700",
    secondary: "bg-teal-50",
    accent: "text-teal-600",
    gradient: "bg-gradient-to-br from-teal-600 to-green-700",
    name: "Charden Farell",
  },
  HOPE: {
    primary: "from-rose-600 to-pink-700",
    secondary: "bg-rose-50",
    accent: "text-rose-600",
    gradient: "bg-gradient-to-br from-rose-600 to-pink-700",
    name: "Hope Congo",
  },
};

export function getBankTheme(banque: Banque | null | undefined): BankTheme {
  if (!banque) {
    return bankThemes.NSIA;
  }
  return bankThemes[banque.code] || bankThemes.NSIA;
}

export function getRoleDisplayName(role: string): string {
  const roleNames: Record<string, string> = {
    super_admin_nsia: "Super Administrateur NSIA",
    admin_nsia: "Administrateur NSIA",
    responsable_banque: "Responsable Banque",
    gestionnaire: "Gestionnaire",
    support: "Support",
  };
  return roleNames[role] || role;
}

export function getRoleBadgeColor(role: string): string {
  const colors: Record<string, string> = {
    super_admin_nsia: "bg-purple-100 text-purple-800",
    admin_nsia: "bg-blue-100 text-blue-800",
    responsable_banque: "bg-green-100 text-green-800",
    gestionnaire: "bg-yellow-100 text-yellow-800",
    support: "bg-gray-100 text-gray-800",
  };
  return colors[role] || "bg-gray-100 text-gray-800";
}




