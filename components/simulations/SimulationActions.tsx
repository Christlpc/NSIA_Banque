"use client";

import { useState } from "react";
import { useSafeRouter } from "@/lib/hooks/useSafeRouter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSimulationStore } from "@/lib/store/simulationStore";
import { useAuthStore } from "@/lib/store/authStore";
import { ROLES } from "@/lib/utils/constants";
import type { Simulation } from "@/types";
import { FileText, CheckCircle, Download, MoreVertical, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { DeleteSimulationDialog } from "./DeleteSimulationDialog";
import { ValidateSimulationDialog } from "./ValidateSimulationDialog";
import { ConvertSimulationDialog } from "./ConvertSimulationDialog";

interface SimulationActionsProps {
  simulation: Simulation;
}

export function SimulationActions({ simulation }: SimulationActionsProps) {
  const router = useSafeRouter();
  const { user } = useAuthStore();
  const { deleteSimulation, validateSimulation, convertSimulation } =
    useSimulationStore();
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [validateDialogOpen, setValidateDialogOpen] = useState(false);
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  const handleValidateClick = () => {
    setValidateDialogOpen(true);
  };

  const handleValidateConfirm = async () => {
    setIsValidating(true);
    try {
      await validateSimulation(simulation.id);
      setValidateDialogOpen(false);
      toast.success("Simulation validée");
    } catch (error: any) {
      toast.error(error?.message || "Erreur lors de la validation");
    } finally {
      setIsValidating(false);
    }
  };

  const handleConvertClick = () => {
    setConvertDialogOpen(true);
  };

  const handleConvertConfirm = async () => {
    setIsConverting(true);
    try {
      await convertSimulation(simulation.id);
      setConvertDialogOpen(false);
      toast.success("Simulation convertie en contrat");
    } catch (error: any) {
      toast.error(error?.message || "Erreur lors de la conversion");
    } finally {
      setIsConverting(false);
    }
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await deleteSimulation(simulation.id);
      setDeleteDialogOpen(false);
      toast.success("Simulation supprimée");
      router.push("/simulations");
    } catch (error: any) {
      toast.error(error?.message || "Erreur lors de la suppression");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportBIA = () => {
    router.push(`/simulations/${simulation.id}/export`);
  };

  const canEdit = simulation.statut === "brouillon";
  // Note: Le calcul de prime se fait automatiquement lors de la création via produitsApi
  // Le bouton "Calculer" est supprimé car l'endpoint n'existe pas dans l'API réelle
  const canValidate =
    simulation.statut === "calculee" &&
    (user?.role === ROLES.RESPONSABLE_BANQUE ||
      user?.role === ROLES.ADMIN_NSIA ||
      user?.role === ROLES.SUPER_ADMIN_NSIA);
  const canConvert = simulation.statut === "validee";
  const canExport = simulation.statut === "validee" || simulation.statut === "convertie";
  const canDelete = simulation.statut === "brouillon";

  return (
    <div className="flex items-center gap-2">
      {/* Bouton "Calculer" supprimé : le calcul se fait automatiquement lors de la création */}

      {canValidate && (
        <Button variant="outline" onClick={handleValidateClick}>
          <CheckCircle className="mr-2 h-4 w-4" />
          Valider
        </Button>
      )}

      {canConvert && (
        <Button variant="outline" onClick={handleConvertClick}>
          <FileText className="mr-2 h-4 w-4" />
          Convertir
        </Button>
      )}

      {canExport && (
        <Button variant="outline" onClick={handleExportBIA}>
          <Download className="mr-2 h-4 w-4" />
          Exporter BIA
        </Button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {/* Édition : La page d'édition n'existe pas encore
          {canEdit && (
            <DropdownMenuItem onClick={() => router.push(`/simulations/${simulation.id}/edit`)}>
              Éditer
            </DropdownMenuItem>
          )}
          */}
          {simulation.statut === "calculee" && (
            <DropdownMenuItem
              onClick={() => router.push(`/simulations/${simulation.id}/questionnaire`)}
            >
              Questionnaire médical
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          {canDelete && (
            <DropdownMenuItem onClick={handleDeleteClick} className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialogs */}
      <DeleteSimulationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        simulation={simulation}
        isLoading={isDeleting}
      />

      <ValidateSimulationDialog
        open={validateDialogOpen}
        onOpenChange={setValidateDialogOpen}
        onConfirm={handleValidateConfirm}
        simulation={simulation}
        isLoading={isValidating}
      />

      <ConvertSimulationDialog
        open={convertDialogOpen}
        onOpenChange={setConvertDialogOpen}
        onConfirm={handleConvertConfirm}
        simulation={simulation}
        isLoading={isConverting}
      />
    </div>
  );
}

