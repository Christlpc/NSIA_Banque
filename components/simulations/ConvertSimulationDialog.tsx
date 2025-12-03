"use client";

import { useState, useEffect } from "react";
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
import { FileText } from "lucide-react";
import type { Simulation } from "@/types";
import { PRODUIT_LABELS } from "@/types";

interface ConvertSimulationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: any) => void;
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
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    date_naissance: "",
    lieu_naissance: "",
    email: "",
    telephone: "",
    adresse: "",
    profession: "",
    employeur: "",
    numero_compte: "",
    date_effet_contrat: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    if (simulation) {
      setFormData({
        nom: simulation.nom_client || "",
        prenom: simulation.prenom_client || "",
        date_naissance: simulation.date_naissance || "",
        lieu_naissance: "", // Pas dans simulation, à remplir
        email: simulation.email_client || "",
        telephone: simulation.telephone_client || "",
        adresse: simulation.adresse_postale || "",
        profession: simulation.profession || "",
        employeur: simulation.employeur || "",
        numero_compte: simulation.numero_compte || "",
        date_effet_contrat: new Date().toISOString().split("T")[0],
      });
    }
  }, [simulation]);

  const handleSubmit = () => {
    onConfirm(formData);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <AlertDialogTitle className="text-left">
                Convertir en contrat
              </AlertDialogTitle>
            </div>
          </div>
          <AlertDialogDescription className="text-left pt-2">
            Veuillez vérifier et compléter les informations pour la souscription.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nom</label>
            <input
              className="w-full p-2 border rounded-md"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Prénom</label>
            <input
              className="w-full p-2 border rounded-md"
              value={formData.prenom}
              onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Date de naissance</label>
            <input
              type="date"
              className="w-full p-2 border rounded-md"
              value={formData.date_naissance}
              onChange={(e) => setFormData({ ...formData, date_naissance: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Lieu de naissance</label>
            <input
              className="w-full p-2 border rounded-md"
              value={formData.lieu_naissance}
              onChange={(e) => setFormData({ ...formData, lieu_naissance: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              className="w-full p-2 border rounded-md"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Téléphone</label>
            <input
              className="w-full p-2 border rounded-md"
              value={formData.telephone}
              onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Adresse</label>
            <input
              className="w-full p-2 border rounded-md"
              value={formData.adresse}
              onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Profession</label>
            <input
              className="w-full p-2 border rounded-md"
              value={formData.profession}
              onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Employeur</label>
            <input
              className="w-full p-2 border rounded-md"
              value={formData.employeur}
              onChange={(e) => setFormData({ ...formData, employeur: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Numéro de compte</label>
            <input
              className="w-full p-2 border rounded-md"
              value={formData.numero_compte}
              onChange={(e) => setFormData({ ...formData, numero_compte: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Date d'effet</label>
            <input
              type="date"
              className="w-full p-2 border rounded-md"
              value={formData.date_effet_contrat}
              onChange={(e) => setFormData({ ...formData, date_effet_contrat: e.target.value })}
            />
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500"
          >
            {isLoading ? "Conversion..." : "Convertir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}




