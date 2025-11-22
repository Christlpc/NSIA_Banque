"use client";

import { useAuthStore } from "@/lib/store/authStore";
import { getRoleDisplayName, getRoleBadgeColor } from "@/lib/utils/theme";
import type { BankTheme } from "@/lib/utils/theme";
import { Settings, Bell, Search, Calendar, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

          {/* Search */}
          <div className="relative hidden lg:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Rechercher une simulation..."
              className="pl-10 w-72 h-10 bg-white border-gray-200 focus:border-gray-300 focus:ring-2 focus:ring-gray-100"
            />
          </div>

          {/* Filter */}
          <Button variant="outline" size="icon" className="hidden md:flex border-gray-200">
            <Filter className="h-4 w-4" />
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative hover:bg-gray-100">
            <Bell className="h-5 w-5 text-gray-600" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
          </Button>

          {/* Settings */}
          <Button variant="ghost" size="icon" className="hover:bg-gray-100">
            <Settings className="h-5 w-5 text-gray-600" />
          </Button>
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-lg border border-orange-200">
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-orange-700">
            Simulations en cours +{Math.floor(Math.random() * 20) + 10}
          </span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-lg border border-purple-200">
          <div className="w-2 h-2 bg-purple-500 rounded-full" />
          <span className="text-sm font-medium text-purple-700">Nouvelles validations</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-red-50 rounded-lg border border-red-200">
          <div className="w-2 h-2 bg-red-500 rounded-full" />
          <span className="text-sm font-medium text-red-700">Alertes importantes</span>
        </div>
      </div>
    </div>
  );
}

