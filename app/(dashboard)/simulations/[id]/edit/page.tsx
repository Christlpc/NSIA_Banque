"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { SimulationForm } from "@/components/simulations/SimulationForm";
import { useSimulationStore } from "@/lib/store/simulationStore";
import { Loader2 } from "lucide-react";

export default function EditSimulationPage() {
    const params = useParams();
    const id = params.id as string;
    const { fetchSimulation, currentSimulation, isLoading, updateWizardData, setWizardStep } = useSimulationStore();

    useEffect(() => {
        if (id) {
            fetchSimulation(id).then(() => {
                // Une fois chargé, on initialise le wizard
                const sim = useSimulationStore.getState().currentSimulation;
                console.log("📥 Loaded simulation:", sim);
                if (sim) {
                    // Map API fields to form fields
                    const formData = {
                        // Map client fields (API uses _client suffix)
                        nom: sim.nom_client,
                        prenom: sim.prenom_client,
                        email: sim.email_client,
                        telephone: sim.telephone_client,
                        adresse: sim.adresse_postale,
                        // Other fields
                        profession: sim.profession,
                        employeur: sim.employeur,
                        numero_compte: sim.numero_compte,
                        situation_matrimoniale: sim.situation_matrimoniale,
                        date_naissance: sim.date_naissance,
                        date_effet: sim.date_effet,
                        taux_surprime: sim.taux_surprime,
                        // Spread donnees_entree for product-specific fields
                        ...sim.donnees_entree,
                        // Ensure product is set
                        produit: sim.produit,
                    };

                    console.log("🔄 Mapped form data:", formData);
                    updateWizardData({
                        createdSimulationId: sim.id,
                        simulationData: formData,
                    });
                    // On commence à l'étape 1 pour permettre de tout modifier
                    setWizardStep(1);
                }
            }).catch(error => {
                console.error("Erreur lors du chargement de la simulation:", error);
                if (error.response) {
                    console.error("Response data:", error.response.data);
                }
            });
        }
    }, [id, fetchSimulation, updateWizardData, setWizardStep]);

    if (isLoading || !currentSimulation) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Modifier la Simulation</h1>
                <p className="text-gray-600 mt-2">
                    Modification de la simulation {currentSimulation.reference}
                </p>
            </div>
            <SimulationForm mode="edit" />
        </div>
    );
}
