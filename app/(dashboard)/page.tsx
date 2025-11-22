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

export default function DashboardPage() {
  const { user } = useAuthStore();
  const theme = getBankTheme(user?.banque);

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
