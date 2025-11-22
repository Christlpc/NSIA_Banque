"use client";

import { useRouter } from "next/navigation";
import { SimulationForm } from "@/components/simulations/SimulationForm";

export default function NewSimulationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Nouvelle Simulation</h1>
        <p className="text-gray-600 mt-2">Créez une nouvelle simulation d'assurance</p>
      </div>
      <SimulationForm />
    </div>
  );
}



