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
import { FileText } from "lucide-react";
import type { Simulation } from "@/types";
import { PRODUIT_LABELS } from "@/types";

interface ConvertSimulationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
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
  const simulationName = simulation
    ? `${simulation.prenom} ${simulation.nom} - ${PRODUIT_LABELS[simulation.produit]}`
    : undefined;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
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
            {simulationName ? (
              <>
                Êtes-vous sûr de vouloir convertir la simulation{" "}
                <span className="font-semibold text-gray-900">{simulationName}</span> en
                contrat ? Cette action est définitive et la simulation ne pourra plus être
                modifiée par la suite.
              </>
            ) : (
              <>
                Êtes-vous sûr de vouloir convertir cette simulation en contrat ? Cette
                action est définitive et la simulation ne pourra plus être modifiée par la
                suite.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Conversion...
              </span>
            ) : (
              "Convertir"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}



