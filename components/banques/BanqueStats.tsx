"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useSimulationStore } from "@/lib/store/simulationStore";
import { useUserStore } from "@/lib/store/userStore";
import type { Banque } from "@/types";
import { getBankTheme } from "@/lib/utils/theme";
import { formatDateMonthShort } from "@/lib/utils/date";

interface BanqueStatsProps {
  banque: Banque;
}

export function BanqueStats({ banque }: BanqueStatsProps) {
  const { simulations } = useSimulationStore();
  const { users } = useUserStore();
  const theme = getBankTheme(banque);

  // Filtrer les données pour cette banque
  const banqueSimulations = useMemo(
    () => simulations.filter((s) => s.banque === banque.id),
    [simulations, banque.id]
  );

  const banqueUsers = useMemo(
    () => users.filter((u) => u.banque.id === banque.id),
    [users, banque.id]
  );

  // Statistiques par statut
  const statutData = useMemo(() => {
    const statuts = ["brouillon", "calculee", "validee", "convertie"] as const;
    return statuts.map((statut) => ({
      name: statut.charAt(0).toUpperCase() + statut.slice(1),
      value: banqueSimulations.filter((s) => s.statut === statut).length,
    }));
  }, [banqueSimulations]);

  // Statistiques par produit
  const produitData = useMemo(() => {
    const produitCounts = banque.produits_disponibles.map((produit) => ({
      name: produit,
      value: banqueSimulations.filter((s) => s.produit === produit).length,
    }));
    return produitCounts;
  }, [banqueSimulations, banque.produits_disponibles]);

  // Données mensuelles
  const monthlyData = useMemo(() => {
    // Générer les 6 derniers mois
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      return {
        date,
        label: formatDateMonthShort(date),
      };
    });

    return months.map(({ date, label }) => {
      const monthSimulations = banqueSimulations.filter((s) => {
        const simDate = new Date(s.created_at);
        return simDate.getMonth() === date.getMonth() && simDate.getFullYear() === date.getFullYear();
      });
      return {
        mois: label,
        simulations: monthSimulations.length,
        converties: monthSimulations.filter((s) => s.statut === "convertie").length,
      };
    });
  }, [banqueSimulations]);

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

  const primaryColor = theme.primary.includes("blue")
    ? "#3b82f6"
    : theme.primary.includes("green")
    ? "#10b981"
    : theme.primary.includes("purple")
    ? "#8b5cf6"
    : theme.primary.includes("orange")
    ? "#f59e0b"
    : "#3b82f6";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Graphique par statut */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Répartition par Statut</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statutData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statutData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Graphique mensuel */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Évolution Mensuelle</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mois" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="simulations" fill={primaryColor} name="Simulations" radius={[8, 8, 0, 0]} />
              <Bar dataKey="converties" fill="#10b981" name="Converties" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

