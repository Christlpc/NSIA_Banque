"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { FileText, Loader2 } from "lucide-react";
import type { Simulation } from "@/types";
import { PRODUIT_LABELS } from "@/types";
import { useAuthStore } from "@/lib/store/authStore";
import { formatDateShort } from "@/lib/utils/date";
import type { SouscriptionPayload } from "@/lib/api/simulations/historique";

interface ConvertSimulationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: SouscriptionPayload) => void;
  simulation?: Simulation;
  isLoading?: boolean;
}

export function ConvertSimulationDialog({
  open,
  onOpenChange,
  onConfirm,
  simulation,
  isLoading = false,
}: ConvertSimulationDialogProps) {
  const { user } = useAuthStore();

  const handleConfirm = () => {
    if (!simulation) return;

    // Construire le payload automatiquement depuis les données de la simulation
    // Tous les champs NOT NULL selon le DDL doivent avoir des valeurs
    const payload: SouscriptionPayload = {
      simulation: simulation.id,
      banque: user?.banque?.id?.toString(),
      gestionnaire: user?.id?.toString(),
      statut: "en_attente", // Statut initial pour nouvelle souscription
      // Données client récupérées de la simulation (champs NOT NULL)
      nom: simulation.nom_client || simulation.donnees_entree?.nom || "Non renseigné",
      prenom: simulation.prenom_client || simulation.donnees_entree?.prenom || "Non renseigné",
      date_naissance: simulation.date_naissance || simulation.donnees_entree?.date_naissance || "1990-01-01",
      lieu_naissance: simulation.donnees_entree?.lieu_naissance || "Non renseigné",
      email: simulation.email_client || simulation.donnees_entree?.email || "non.renseigne@email.com",
      telephone: simulation.telephone_client || simulation.donnees_entree?.telephone || "000000000",
      adresse: simulation.adresse_postale || simulation.donnees_entree?.adresse || "Non renseignée",
      profession: simulation.profession || simulation.donnees_entree?.profession || "Non renseignée",
      employeur: simulation.employeur || simulation.donnees_entree?.employeur || "Non renseigné",
      numero_compte: simulation.numero_compte || simulation.donnees_entree?.numero_compte || "0000000000",
      // Documents en format JSON comme attendu par le DDL (jsonb)
      documents: JSON.stringify([{ type: "passeport", statut: "en_attente" }]),
      // Dates du contrat
      date_effet_contrat: simulation.date_effet || simulation.donnees_entree?.date_effet || new Date().toISOString().split("T")[0],
      date_echeance_contrat: "",
      // Prime (numeric NOT NULL)
      montant_prime: simulation.prime_totale?.toString()
        || simulation.resultats_calcul?.prime_totale?.toString()
        || "0",
      // Données produit (jsonb NOT NULL)
      donnees_produit: simulation.donnees_entree || {},
      date_validation: new Date().toISOString(),
      notes: "",
      commentaires: "",
    };

    onConfirm(payload);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <AlertDialogTitle className="text-left">
                Convertir en souscription
              </AlertDialogTitle>
            </div>
          </div>
          <AlertDialogDescription className="text-left pt-2">
            Êtes-vous sûr de vouloir convertir cette simulation en souscription ?
            Toutes les informations seront automatiquement récupérées.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {simulation && (
          <div className="py-4 space-y-3 text-sm bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between">
              <span className="text-gray-500">Référence :</span>
              <span className="font-medium">{simulation.reference}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Client :</span>
              <span className="font-medium">
                {simulation.prenom_client || simulation.donnees_entree?.prenom} {simulation.nom_client || simulation.donnees_entree?.nom}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Produit :</span>
              <span className="font-medium">
                {PRODUIT_LABELS[simulation.produit] || simulation.produit}
              </span>
            </div>
            {(simulation.date_naissance || simulation.donnees_entree?.date_naissance) && (
              <div className="flex justify-between">
                <span className="text-gray-500">Date de naissance :</span>
                <span className="font-medium">
                  {formatDateShort(simulation.date_naissance || simulation.donnees_entree?.date_naissance)}
                </span>
              </div>
            )}
            {(simulation.telephone_client || simulation.donnees_entree?.telephone) && (
              <div className="flex justify-between">
                <span className="text-gray-500">Téléphone :</span>
                <span className="font-medium">
                  {simulation.telephone_client || simulation.donnees_entree?.telephone}
                </span>
              </div>
            )}
            {(simulation.prime_totale || simulation.resultats_calcul?.prime_totale) && (
              <div className="flex justify-between border-t pt-2 mt-2">
                <span className="text-gray-600 font-medium">Prime totale :</span>
                <span className="font-bold text-green-600">
                  {(simulation.prime_totale || simulation.resultats_calcul?.prime_totale)?.toLocaleString("fr-FR")} FCFA
                </span>
              </div>
            )}
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Conversion...
              </>
            ) : (
              "Convertir"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
