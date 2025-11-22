"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, FileText, CheckCircle, DollarSign } from "lucide-react";
import { useSimulationStore } from "@/lib/store/simulationStore";

export function StatsCards() {
  const { simulations, fetchSimulations, isLoading } = useSimulationStore();
  const [stats, setStats] = useState({
    total: 0,
    enCours: 0,
    validees: 0,
    converties: 0,
    evolution: 0,
  });

  useEffect(() => {
    fetchSimulations();
  }, [fetchSimulations]);

  useEffect(() => {
    const total = simulations.length;
    const enCours = simulations.filter((s) => s.statut === "brouillon" || s.statut === "calculee").length;
    const validees = simulations.filter((s) => s.statut === "validee").length;
    const converties = simulations.filter((s) => s.statut === "convertie").length;

    setStats({
      total,
      enCours,
      validees,
      converties,
      evolution: 0, // TODO: Calculer l'évolution vs mois précédent
    });
  }, [simulations]);

  const cards = [
    {
      title: "Total Simulations",
      value: stats.total,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      evolution: stats.evolution,
    },
    {
      title: "En Cours",
      value: stats.enCours,
      icon: FileText,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Validées",
      value: stats.validees,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Converties",
      value: stats.converties,
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <Icon className={`h-5 w-5 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              {card.evolution !== undefined && (
                <div className="flex items-center text-xs text-gray-600 mt-1">
                  {card.evolution >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                  )}
                  <span>{Math.abs(card.evolution)}% vs mois précédent</span>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

