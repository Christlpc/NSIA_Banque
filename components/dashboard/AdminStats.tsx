"use client";

import { useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useBanqueStore } from "@/lib/store/banqueStore";
import { useSimulationStore } from "@/lib/store/simulationStore";
import { Users, Building2, FileText, TrendingUp, PieChart as PieIcon } from "lucide-react";
import { AdminCharts } from "./AdminCharts";
import { PRODUIT_LABELS } from "@/types";
import { STATUT_LABELS } from "@/lib/utils/constants";

export function AdminStats() {
    const { banques, fetchBanques } = useBanqueStore();
    const { simulations, fetchSimulations } = useSimulationStore();

    useEffect(() => {
        fetchBanques();
        // Fetch ALL simulations (removing filters or passing specific admin filter if API supported it)
        // Defaults to first page, should ideally fetch all for stats.
        fetchSimulations({ page_size: 1000 } as any);
    }, [fetchBanques, fetchSimulations]);

    // --- Data Aggregation ---

    // 1. By Bank
    const statsByBank = useMemo(() => {
        const counts: Record<string, number> = {};
        simulations.forEach(sim => {
            // bank ID in simulation might be number or string
            const bankId = String(sim.banque);
            counts[bankId] = (counts[bankId] || 0) + 1;
        });

        return banques.map(b => ({
            name: b.code || b.nom,
            value: counts[String(b.id)] || 0,
            color: b.couleur_primaire || "#3b82f6"
        })).sort((a, b) => b.value - a.value);
    }, [simulations, banques]);

    // 2. By Product
    const statsByProduct = useMemo(() => {
        const counts: Record<string, number> = {};
        simulations.forEach(sim => {
            counts[sim.produit] = (counts[sim.produit] || 0) + 1;
        });

        return Object.entries(counts).map(([key, value]) => ({
            name: PRODUIT_LABELS[key as keyof typeof PRODUIT_LABELS] || key,
            value
        })).sort((a, b) => b.value - a.value);
    }, [simulations]);

    // 3. By Status
    const statsByStatus = useMemo(() => {
        const counts: Record<string, number> = {};
        simulations.forEach(sim => {
            counts[sim.statut] = (counts[sim.statut] || 0) + 1;
        });

        const statusMap: Record<string, string> = {
            brouillon: "Brouillon",
            calculee: "Calculée",
            validee: "Validée",
            convertie: "Convertie"
        };

        return Object.entries(counts).map(([key, value]) => ({
            name: statusMap[key] || key,
            value
        }));
    }, [simulations]);

    // Summary Metrics
    const totalSimulations = simulations.length;
    const totalBanques = banques.length;
    const avgSimulations = totalBanques > 0 ? Math.round(totalSimulations / totalBanques) : 0;
    const conversionRate = totalSimulations > 0
        ? Math.round((simulations.filter(s => s.statut === "convertie").length / totalSimulations) * 100)
        : 0;

    return (
        <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="border border-gray-100 shadow-sm bg-white">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 rounded-full bg-blue-50 text-blue-600">
                            <Building2 className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Banques Partenaires</p>
                            <h3 className="text-2xl font-bold text-gray-900">{totalBanques}</h3>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-gray-100 shadow-sm bg-white">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 rounded-full bg-green-50 text-green-600">
                            <FileText className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Simulations</p>
                            <h3 className="text-2xl font-bold text-gray-900">{totalSimulations}</h3>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-gray-100 shadow-sm bg-white">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 rounded-full bg-purple-50 text-purple-600">
                            <Users className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Moyenne / Banque</p>
                            <h3 className="text-2xl font-bold text-gray-900">{avgSimulations}</h3>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-gray-100 shadow-sm bg-white">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 rounded-full bg-orange-50 text-orange-600">
                            <PieIcon className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Taux de Conversion</p>
                            <h3 className="text-2xl font-bold text-gray-900">{conversionRate}%</h3>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Component */}
            <AdminCharts
                dataByBank={statsByBank}
                dataByProduct={statsByProduct}
                dataByStatus={statsByStatus}
            />
        </div>
    );
}
