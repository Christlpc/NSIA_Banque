"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SimulationTable } from "@/components/simulations/SimulationTable";
import { SimulationFilters } from "@/components/simulations/SimulationFilters";
import { useSimulationStore } from "@/lib/store/simulationStore";
import { Plus } from "lucide-react";

export default function SimulationsPage() {
  const router = useRouter();
  const { fetchSimulations, filters } = useSimulationStore();

  useEffect(() => {
    fetchSimulations();
  }, [fetchSimulations]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Simulations</h1>
          <p className="text-gray-600 mt-2">Gérez toutes vos simulations d'assurance</p>
        </div>
        <Button onClick={() => router.push("/simulations/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle Simulation
        </Button>
      </div>

      <SimulationFilters />
      <SimulationTable />
    </div>
  );
}




