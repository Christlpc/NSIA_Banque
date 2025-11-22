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

  const stats = {
    total: simulations.length,
    enCours: simulations.filter((s) => s.statut === "brouillon" || s.statut === "calculee").length,
    validees: simulations.filter((s) => s.statut === "validee").length,
    converties: simulations.filter((s) => s.statut === "convertie").length,
  };

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
      change: "+12%",
      trend: "up" as const,
      icon: FileText,
      color: "blue",
      gradient: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-700",
      chartColor: "#3b82f6",
      amount: `${(stats.total * 12500).toLocaleString("fr-FR")} FCFA`,
    },
    {
      label: "En Cours",
      value: stats.enCours,
      change: "+5%",
      trend: "up" as const,
      icon: Clock,
      color: "yellow",
      gradient: "from-yellow-500 to-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      textColor: "text-yellow-700",
      chartColor: "#eab308",
      amount: `${stats.enCours} actives`,
    },
    {
      label: "Validées",
      value: stats.validees,
      change: "+8%",
      trend: "up" as const,
      icon: CheckCircle,
      color: "green",
      gradient: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      textColor: "text-green-700",
      chartColor: "#10b981",
      amount: `${stats.validees} prêtes`,
    },
    {
      label: "Converties",
      value: stats.converties,
      change: "+15%",
      trend: "up" as const,
      icon: CheckCircle2,
      color: "purple",
      gradient: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      textColor: "text-purple-700",
      chartColor: "#8b5cf6",
      amount: `${stats.converties} contrats`,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsCards.map((stat) => {
        const Icon = stat.icon;
        const chartData = generateChartData(stat.value);
        
        return (
          <Card 
            key={stat.label} 
            className={`border-2 ${stat.borderColor} ${stat.bgColor} hover:shadow-lg transition-all duration-300 group cursor-pointer overflow-hidden relative`}
          >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.gradient} opacity-10 rounded-full -mr-16 -mt-16 group-hover:opacity-20 transition-opacity`} />
            
            <CardContent className="p-6 relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-white/80 backdrop-blur-sm shadow-sm`}>
                  <Icon className={`h-6 w-6 ${stat.textColor}`} />
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
                <ArrowRight className={`h-4 w-4 ${stat.textColor}`} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

