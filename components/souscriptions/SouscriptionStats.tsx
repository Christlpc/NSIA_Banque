"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { souscriptionsApi, type SouscriptionFilters } from "@/lib/api/simulations";
import { CheckCircle, XCircle, Clock } from "lucide-react";

interface SouscriptionStatsProps {
  filters?: SouscriptionFilters;
}

export function SouscriptionStats({ filters }: SouscriptionStatsProps) {
  const [stats, setStats] = useState({
    total: 0,
    en_attente: 0,
    validees: 0,
    rejetees: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        // Récupérer toutes les souscriptions pour les stats (sans pagination)
        const allResponse = await souscriptionsApi.getSouscriptions({
          page: 1,
          page_size: 1000, // Récupérer beaucoup pour avoir les stats
        });

        const total = allResponse.count;
        const en_attente = allResponse.results.filter((s) => s.statut === "en_attente").length;
        const validees = allResponse.results.filter((s) => s.statut === "validee").length;
        const rejetees = allResponse.results.filter((s) => s.statut === "rejetee").length;

        setStats({ total, en_attente, validees, rejetees });
      } catch (error) {
        console.error("Erreur lors du chargement des statistiques:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [filters]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="h-20 bg-gray-100 animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-gray-500">Souscriptions</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">En attente</CardTitle>
          <Clock className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">{stats.en_attente}</div>
          <p className="text-xs text-gray-500">En attente de validation</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Validées</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.validees}</div>
          <p className="text-xs text-gray-500">Souscriptions validées</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Rejetées</CardTitle>
          <XCircle className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{stats.rejetees}</div>
          <p className="text-xs text-gray-500">Souscriptions rejetées</p>
        </CardContent>
      </Card>
    </div>
  );
}

