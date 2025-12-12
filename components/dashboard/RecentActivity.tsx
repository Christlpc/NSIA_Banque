"use client";

import { useEffect } from "react";
import { useSafeRouter } from "@/lib/hooks/useSafeRouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSimulationStore } from "@/lib/store/simulationStore";
import { STATUT_LABELS, STATUT_COLORS } from "@/lib/utils/constants";
import { PRODUIT_LABELS } from "@/types";
import { formatDateShort, formatDateRelative } from "@/lib/utils/date";
import { Clock, ArrowUp, ArrowDown, CheckCircle2, FileText, ArrowRight } from "lucide-react";

export function RecentActivity() {
  const router = useSafeRouter();
  const { simulations, fetchSimulations } = useSimulationStore();

  useEffect(() => {
    fetchSimulations();
  }, [fetchSimulations]);

  const recentSimulations = simulations
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5);

  const getStatusConfig = (statut: string) => {
    switch (statut) {
      case "validee":
      case "convertie":
        return { icon: CheckCircle2, color: "text-green-600", bg: "bg-green-100" };
      case "calculee":
        return { icon: FileText, color: "text-blue-600", bg: "bg-blue-100" };
      default:
        return { icon: Clock, color: "text-yellow-600", bg: "bg-yellow-100" };
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4 pt-6 px-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-gray-900">Activité Récente</CardTitle>
            <p className="text-sm text-gray-500 mt-1">Dernières simulations mises à jour</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium"
            onClick={() => router.push('/simulations')}
          >
            Voir tout
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-6 pt-2">
        <div className="relative space-y-0">
          {recentSimulations.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <Clock className="mx-auto h-8 w-8 text-gray-400 mb-3" />
              <p className="text-gray-900 font-medium">Aucune activité récente</p>
              <p className="text-sm text-gray-500 mt-1">Les nouvelles simulations apparaîtront ici</p>
            </div>
          ) : (
            recentSimulations.map((simulation, index) => {
              const { icon: StatusIcon, color, bg } = getStatusConfig(simulation.statut);
              const isLast = index === recentSimulations.length - 1;

              return (
                <div key={simulation.id} className="relative pl-8 pb-8 last:pb-0" onClick={() => router.push(`/simulations/${simulation.id}`)}>
                  {/* Timeline Line */}
                  {!isLast && (
                    <div className="absolute left-[15px] top-8 bottom-0 w-[2px] bg-gray-100" />
                  )}

                  {/* Timeline Dot */}
                  <div className={`absolute left-0 top-0 p-1.5 rounded-full ${bg} ring-4 ring-white`}>
                    <StatusIcon className={`h-4 w-4 ${color}`} />
                  </div>

                  {/* Content */}
                  <div className="group -mt-1 p-3 -ml-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="flex justify-between items-start gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900 truncate">
                          {simulation.prenom_client} {simulation.nom_client}
                        </p>
                        <p className="text-sm text-gray-600 mt-0.5 font-medium">
                          {PRODUIT_LABELS[simulation.produit]}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <Badge className={`${STATUT_COLORS[simulation.statut]} text-[10px] px-2 py-0.5 border-0 font-medium`}>
                            {STATUT_LABELS[simulation.statut]}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right whitespace-nowrap">
                        <span className="text-xs font-medium text-gray-500 block">
                          {formatDateRelative(simulation.updated_at)}
                        </span>
                      </div>
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
