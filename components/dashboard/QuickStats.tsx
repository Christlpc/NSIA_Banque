"use client";

import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useSimulationStore } from "@/lib/store/simulationStore";
import { STATUT_LABELS } from "@/lib/utils/constants";
import type { BankTheme } from "@/lib/utils/theme";
import { TrendingUp, TrendingDown, FileText, Clock, CheckCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";

interface QuickStatsProps {
  theme: BankTheme;
}

export function QuickStats({ theme }: QuickStatsProps) {
  const { simulations, fetchSimulations } = useSimulationStore();

  useEffect(() => {
    fetchSimulations();
  }, [fetchSimulations]);

  // Calculs dynamiques des stats et évolutions
  const stats = (() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const previousMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonth = previousMonthDate.getMonth();
    const previousYear = previousMonthDate.getFullYear();

    let currentTotal = 0;
    let lastTotal = 0;

    let currentSims = 0;
    let lastSims = 0;

    let currentProps = 0;
    let lastProps = 0;

    simulations.forEach(s => {
      const d = new Date(s.created_at || s.updated_at || new Date());
      const m = d.getMonth();
      const y = d.getFullYear();

      const isCurrent = m === currentMonth && y === currentYear;
      const isPrevious = m === previousMonth && y === previousYear;

      if (isCurrent) {
        currentTotal++;
        if (s.statut === "brouillon" || s.statut === "calculee") currentSims++;
        if (s.statut === "validee") currentProps++;
      } else if (isPrevious) {
        lastTotal++;
        if (s.statut === "brouillon" || s.statut === "calculee") lastSims++;
        if (s.statut === "validee") lastProps++;
      }
    });

    const calculateEvolution = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    return {
      total: simulations.length,
      simulations: simulations.filter((s) => s.statut === "brouillon" || s.statut === "calculee").length,
      propositions: simulations.filter((s) => s.statut === "validee").length,
      evolutionTotal: calculateEvolution(currentTotal, lastTotal),
      evolutionSims: calculateEvolution(currentSims, lastSims),
      evolutionProps: calculateEvolution(currentProps, lastProps),
    };
  })();

  // Générer des données de graphique pour chaque stat
  const generateChartData = (baseValue: number) => {
    return Array.from({ length: 7 }, (_, i) => ({
      value: baseValue + Math.random() * 10 - 5,
    }));
  };

  const statsCards = [
    {
      label: "Total Simulations",
      value: stats.total,
      change: `${stats.evolutionTotal >= 0 ? "+" : ""}${stats.evolutionTotal}%`,
      trend: stats.evolutionTotal >= 0 ? "up" : "down",
      icon: FileText,
      color: "bank", // Special marker to use bank theme
      chartColor: theme.primaryColor,
      amount: `${(stats.total * 12500).toLocaleString("fr-FR")} FCFA`,
    },
    {
      label: "Simulations",
      value: stats.simulations,
      change: `${stats.evolutionSims >= 0 ? "+" : ""}${stats.evolutionSims}%`,
      trend: stats.evolutionSims >= 0 ? "up" : "down",
      icon: Clock,
      color: "yellow",
      chartColor: "#eab308",
      amount: `${stats.simulations} actives`,
    },
    {
      label: "Propositions",
      value: stats.propositions,
      change: `${stats.evolutionProps >= 0 ? "+" : ""}${stats.evolutionProps}%`,
      trend: stats.evolutionProps >= 0 ? "up" : "down",
      icon: CheckCircle,
      color: "green",
      chartColor: "#10b981",
      amount: `${stats.propositions} prêtes`,
    },
  ] as const;

  // Helper to get color styles based on stat.color
  const getColorStyles = (color: string) => {
    const colorMap: Record<string, { bgColor: string; borderColor: string; textColor: string; gradient: string }> = {
      yellow: { bgColor: "bg-yellow-50", borderColor: "border-yellow-200", textColor: "text-yellow-700", gradient: "from-yellow-500 to-yellow-600" },
      green: { bgColor: "bg-green-50", borderColor: "border-green-200", textColor: "text-green-700", gradient: "from-green-500 to-green-600" },
    };
    return colorMap[color] || { bgColor: "bg-gray-50", borderColor: "border-gray-200", textColor: "text-gray-700", gradient: "from-gray-500 to-gray-600" };
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {statsCards.map((stat) => {
        const Icon = stat.icon;
        const chartData = generateChartData(stat.value);
        const isBankTheme = stat.color === "bank";
        const colorStyles = isBankTheme ? null : getColorStyles(stat.color);

        // Dynamic styles for bank-themed card
        const cardStyle = isBankTheme ? {
          borderColor: theme.primaryColor,
          backgroundColor: `${theme.primaryColor}10`, // 10% opacity
        } : {};

        const iconStyle = isBankTheme ? {
          color: theme.primaryColor,
        } : {};

        return (
          <Card
            key={stat.label}
            className={`border-2 ${!isBankTheme ? `${colorStyles?.borderColor} ${colorStyles?.bgColor}` : ''} hover:shadow-lg transition-all duration-300 group cursor-pointer overflow-hidden relative`}
            style={cardStyle}
          >
            <div
              className={`absolute top-0 right-0 w-32 h-32 opacity-10 rounded-full -mr-16 -mt-16 group-hover:opacity-20 transition-opacity`}
              style={{ background: isBankTheme ? `linear-gradient(to bottom right, ${theme.primaryColor}, ${theme.secondaryColor})` : undefined }}
            />

            <CardContent className="p-6 relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-white/80 backdrop-blur-sm shadow-sm`}>
                  <Icon className={`h-6 w-6 ${!isBankTheme ? colorStyles?.textColor : ''}`} style={iconStyle} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-white/80 backdrop-blur-sm ${stat.trend === "up" ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"}`}>
                  {stat.trend === "up" ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  <span>{stat.change}</span>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
                <p className="text-xs font-medium text-gray-500">{stat.amount}</p>
              </div>

              {/* Mini Chart */}
              <div className="h-16 -mx-6 -mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={stat.chartColor}
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight className={`h-4 w-4 ${!isBankTheme ? colorStyles?.textColor : ''}`} style={iconStyle} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

