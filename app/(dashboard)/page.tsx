"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/store/authStore";
import { getBankTheme } from "@/lib/utils/theme";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { YourSimulations } from "@/components/dashboard/YourSimulations";
import { QuickStats } from "@/components/dashboard/QuickStats";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { ProductOverview } from "@/components/dashboard/ProductOverview";
import { ConversionChart } from "@/components/dashboard/ConversionChart";

import { ROLES } from "@/lib/utils/constants";
import { AdminStats } from "@/components/dashboard/AdminStats";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const theme = getBankTheme(user?.banque);
  const isAdmin = user?.role === ROLES.SUPER_ADMIN_NSIA || user?.role === ROLES.ADMIN_NSIA;

  if (isAdmin) {
    return (
      <div className="space-y-8 pb-8">
        <DashboardHeader theme={theme} />
        <AdminStats />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Activité Récente Globale</h3>
              <RecentActivity />
            </div>
          </div>
          <div className="space-y-8">
            <ProductOverview theme={theme} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      <DashboardHeader theme={theme} />

      <QuickStats theme={theme} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <YourSimulations theme={theme} />
          <ConversionChart />
        </div>
        <div className="space-y-8">
          <ProductOverview theme={theme} />
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}
