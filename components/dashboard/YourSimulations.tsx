"use client";

import { useEffect } from "react";
import { useSafeRouter } from "@/lib/hooks/useSafeRouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSimulationStore } from "@/lib/store/simulationStore";
import { STATUT_LABELS, STATUT_COLORS } from "@/lib/utils/constants";
import { PRODUIT_LABELS } from "@/types";
import type { BankTheme } from "@/lib/utils/theme";
import { Car, Heart, Home, Plus, ArrowRight } from "lucide-react";
import { format } from "date-fns";

interface YourSimulationsProps {
  theme: BankTheme;
}

const produitIcons: Record<string, any> = {
  emprunteur: Car,
  confort_retraite: Heart,
  confort_etudes: Home,
  elikia_scolaire: Home,
  mobateli: Car,
  epargne_plus: Heart,
};

export function YourSimulations({ theme }: YourSimulationsProps) {
  const router = useSafeRouter();
  const { simulations, fetchSimulations } = useSimulationStore();

  useEffect(() => {
    fetchSimulations();
  }, [fetchSimulations]);

  // Grouper par produit et prendre les 3 premiers
  const simulationsByProduct = simulations.reduce((acc, sim) => {
    if (!acc[sim.produit]) {
      acc[sim.produit] = [];
    }
    acc[sim.produit].push(sim);
    return acc;
  }, {} as Record<string, typeof simulations>);

  const productCards = Object.entries(simulationsByProduct)
    .slice(0, 3)
    .map(([produit, sims]) => {
      const latestSim = sims[0];
      const Icon = produitIcons[produit] || Car;
      const total = sims.length;
      const primeRestante = latestSim.prime_totale
        ? (parseFloat(latestSim.prime_totale) * 0.3).toFixed(1)
        : "0";

      return {
        produit,
        icon: Icon,
        label: PRODUIT_LABELS[produit as keyof typeof PRODUIT_LABELS],
        total,
        primeRestante,
        latestSim,
        color: getProductColor(produit),
      };
    });

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900">Vos Assurances</CardTitle>
            <p className="text-sm text-gray-500 mt-1">Gérez vos simulations d'assurance</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-900"
            onClick={() => router.push("/simulations")}
          >
            Voir tout
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {productCards.map((card) => {
            const Icon = card.icon;
            const progress = card.latestSim.prime_totale 
              ? Math.min(100, (parseFloat(card.primeRestante) / parseFloat(card.latestSim.prime_totale)) * 100)
              : 0;
            
            return (
              <div
                key={card.produit}
                className={`p-6 rounded-2xl border-2 ${card.color} cursor-pointer hover:shadow-2xl transition-all duration-300 group relative overflow-hidden`}
                onClick={() => router.push(`/simulations/${card.latestSim.id}`)}
              >
                {/* Background gradient on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${card.color.replace("bg-", "from-").replace("border-", "to-")} opacity-0 group-hover:opacity-5 transition-opacity`} />
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <div className={`p-4 rounded-xl ${card.color.replace("border", "bg").replace("-200", "-100")} shadow-md group-hover:scale-110 transition-transform`}>
                      <Icon className="h-7 w-7" />
                    </div>
                    <Badge className={`${STATUT_COLORS[card.latestSim.statut]} shadow-sm`}>
                      {STATUT_LABELS[card.latestSim.statut]}
                    </Badge>
                  </div>
                  
                  <h3 className="font-bold text-xl mb-1 text-gray-900">{card.label}</h3>
                  <p className="text-sm text-gray-600 mb-4">{card.total} simulation{card.total > 1 ? "s" : ""}</p>
                  
                  {card.latestSim.prime_totale && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">Montant restant</span>
                        <span className="text-lg font-bold text-gray-900">
                          {parseFloat(card.primeRestante).toLocaleString("fr-FR")} FCFA
                        </span>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${card.color.replace("bg-", "bg-").replace("border-", "").split(" ")[0]}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-4 flex items-center text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">
                    <span>Voir détails</span>
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add New Card - Premium Design */}
          <div
            className="p-6 rounded-2xl border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 cursor-pointer hover:from-gray-100 hover:to-gray-200 hover:border-gray-400 transition-all duration-300 flex flex-col items-center justify-center min-h-[220px] group"
            onClick={() => router.push("/simulations/new")}
          >
            <div className="p-5 rounded-full bg-gradient-to-br from-red-500 to-red-600 mb-4 shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all">
              <Plus className="h-8 w-8 text-white" />
            </div>
            <p className="font-semibold text-gray-800 text-lg mb-1">Nouvelle Simulation</p>
            <p className="text-sm text-gray-500 text-center">Créez une nouvelle simulation d'assurance</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getProductColor(produit: string): string {
  const colors: Record<string, string> = {
    emprunteur: "bg-green-50 border-green-200 text-green-900",
    confort_retraite: "bg-pink-50 border-pink-200 text-pink-900",
    confort_etudes: "bg-blue-50 border-blue-200 text-blue-900",
    elikia_scolaire: "bg-purple-50 border-purple-200 text-purple-900",
    mobateli: "bg-yellow-50 border-yellow-200 text-yellow-900",
    epargne_plus: "bg-indigo-50 border-indigo-200 text-indigo-900",
  };
  return colors[produit] || "bg-gray-50 border-gray-200 text-gray-900";
}

