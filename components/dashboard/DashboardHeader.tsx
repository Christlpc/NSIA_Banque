"use client";

import { useAuthStore } from "@/lib/store/authStore";
import { getRoleDisplayName, getRoleBadgeColor } from "@/lib/utils/theme";
import type { BankTheme } from "@/lib/utils/theme";
import { Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface DashboardHeaderProps {
  theme: BankTheme;
}

export function DashboardHeader({ theme }: DashboardHeaderProps) {
  const { user } = useAuthStore();
  const currentDate = format(new Date(), "d MMMM", { locale: fr });

  return (
    <div className="space-y-6">
      {/* Main Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
                Dashboard
              </h1>
              <p className="text-gray-500 mt-1 text-sm">
                Vérifiez et gérez le statut de vos simulations
              </p>
            </div>
            <Badge className={`${getRoleBadgeColor(user?.role || "")} px-3 py-1.5 text-sm font-medium`}>
              {getRoleDisplayName(user?.role || "")}
            </Badge>
          </div>
          <p className="text-gray-600 text-lg">
            Bonjour, <span className="font-semibold text-gray-900">{user?.prenom} {user?.nom}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Date */}
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">{currentDate}</span>
          </div>


        </div>
      </div>


    </div>
  );
}

