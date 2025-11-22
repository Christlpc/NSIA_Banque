"use client";

import { useEffect } from "react";
import { useSafeRouter } from "@/lib/hooks/useSafeRouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSimulationStore } from "@/lib/store/simulationStore";
import { STATUT_LABELS, STATUT_COLORS } from "@/lib/utils/constants";
import { PRODUIT_LABELS } from "@/types";
import { format } from "date-fns";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RecentActivity() {
  const router = useSafeRouter();
  const { simulations, fetchSimulations } = useSimulationStore();

  useEffect(() => {
    fetchSimulations();
  }, [fetchSimulations]);

  const recentSimulations = simulations
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5);

  const getStatusIcon = (statut: string) => {
    if (statut === "validee" || statut === "convertie") {
      return <ArrowUp className="h-4 w-4 text-green-600" />;
    }
    return <ArrowDown className="h-4 w-4 text-yellow-600" />;
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-gray-900">Dernières Demandes</CardTitle>
            <p className="text-xs text-gray-500 mt-1">Activité récente des simulations</p>
          </div>
          {/* Boutons de tri supprimés - non fonctionnels */}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentSimulations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-sm">Aucune activité récente</p>
            </div>
          ) : (
            recentSimulations.map((simulation) => {
              const isAccepted = simulation.statut === "validee" || simulation.statut === "convertie";
              const statusPercentage = isAccepted ? "60%" : "40%";
              
              return (
                <div
                  key={simulation.id}
                  className="group p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md cursor-pointer transition-all duration-200 bg-white"
                  onClick={() => router.push(`/simulations/${simulation.id}`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-lg ${isAccepted ? "bg-green-100" : "bg-yellow-100"}`}>
                        {getStatusIcon(simulation.statut)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900 truncate">
                          {simulation.prenom} {simulation.nom}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">
                          {PRODUIT_LABELS[simulation.produit]}
                        </p>
                        {/* Badge "Fichiers" supprimé - données non disponibles */}
                      </div>
                    </div>
                    <Badge 
                      className={`${STATUT_COLORS[simulation.statut]} text-xs font-medium shadow-sm`}
                    >
                      {STATUT_LABELS[simulation.statut]}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>{format(new Date(simulation.updated_at), "dd MMM yyyy")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold ${isAccepted ? "text-green-600" : "text-yellow-600"}`}>
                        Accepté {statusPercentage}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}

