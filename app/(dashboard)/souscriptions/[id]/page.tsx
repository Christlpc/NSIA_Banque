"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { souscriptionsApi, type Souscription } from "@/lib/api/simulations";
import { format } from "date-fns";
import { ArrowLeft, Check, X, FileText } from "lucide-react";
import { ValidateSouscriptionDialog } from "@/components/souscriptions/ValidateSouscriptionDialog";
import { RejectSouscriptionDialog } from "@/components/souscriptions/RejectSouscriptionDialog";
import toast from "react-hot-toast";

const STATUT_LABELS: Record<string, string> = {
  en_attente: "En attente",
  validee: "Validée",
  rejetee: "Rejetée",
};

const STATUT_COLORS: Record<string, string> = {
  en_attente: "bg-yellow-100 text-yellow-800",
  validee: "bg-green-100 text-green-800",
  rejetee: "bg-red-100 text-red-800",
};

export default function SouscriptionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [souscription, setSouscription] = useState<Souscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [validateDialogOpen, setValidateDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);

  useEffect(() => {
    const fetchSouscription = async () => {
      setIsLoading(true);
      try {
        const data = await souscriptionsApi.getSouscription(id);
        setSouscription(data);
      } catch (error: any) {
        toast.error(error?.message || "Erreur lors du chargement de la souscription");
        router.push("/souscriptions");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchSouscription();
    }
  }, [id, router]);

  const handleValidate = async (souscriptionId: string) => {
    try {
      await souscriptionsApi.validateSouscription(souscriptionId);
      toast.success("Souscription validée avec succès");
      const updated = await souscriptionsApi.getSouscription(souscriptionId);
      setSouscription(updated);
      setValidateDialogOpen(false);
    } catch (error: any) {
      toast.error(error?.message || "Erreur lors de la validation");
    }
  };

  const handleReject = async (souscriptionId: string, raison: string) => {
    try {
      await souscriptionsApi.rejectSouscription(souscriptionId, raison);
      toast.success("Souscription rejetée");
      const updated = await souscriptionsApi.getSouscription(souscriptionId);
      setSouscription(updated);
      setRejectDialogOpen(false);
    } catch (error: any) {
      toast.error(error?.message || "Erreur lors du rejet");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12 text-gray-500">Chargement...</div>
      </div>
    );
  }

  if (!souscription) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12 text-gray-500">Souscription introuvable</div>
      </div>
    );
  }

  const canValidate = souscription.statut === "en_attente";
  const canReject = souscription.statut === "en_attente";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push("/souscriptions")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Souscription {souscription.id.slice(0, 8)}
            </h1>
            <p className="text-gray-600 mt-1">Détails de la souscription</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={STATUT_COLORS[souscription.statut]}>
            {STATUT_LABELS[souscription.statut]}
          </Badge>
          {canValidate && (
            <Button onClick={() => setValidateDialogOpen(true)}>
              <Check className="mr-2 h-4 w-4" />
              Valider
            </Button>
          )}
          {canReject && (
            <Button variant="destructive" onClick={() => setRejectDialogOpen(true)}>
              <X className="mr-2 h-4 w-4" />
              Rejeter
            </Button>
          )}
        </div>
      </div>

      {/* Informations principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Informations du souscripteur
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Nom complet</label>
              <p className="text-lg font-semibold">
                {souscription.prenom} {souscription.nom}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-lg">{souscription.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Téléphone</label>
              <p className="text-lg">{souscription.telephone}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Date de naissance</label>
              <p className="text-lg">
                {format(new Date(souscription.date_naissance), "dd MMMM yyyy")}
              </p>
            </div>
            {souscription.adresse && (
              <div>
                <label className="text-sm font-medium text-gray-500">Adresse</label>
                <p className="text-lg">{souscription.adresse}</p>
              </div>
            )}
            {souscription.profession && (
              <div>
                <label className="text-sm font-medium text-gray-500">Profession</label>
                <p className="text-lg">{souscription.profession}</p>
              </div>
            )}
            {souscription.employeur && (
              <div>
                <label className="text-sm font-medium text-gray-500">Employeur</label>
                <p className="text-lg">{souscription.employeur}</p>
              </div>
            )}
            {souscription.numero_compte && (
              <div>
                <label className="text-sm font-medium text-gray-500">Numéro de compte</label>
                <p className="text-lg font-mono">{souscription.numero_compte}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informations du contrat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Date d'effet</label>
              <p className="text-lg">
                {souscription.date_effet_contrat
                  ? format(new Date(souscription.date_effet_contrat), "dd MMMM yyyy")
                  : "-"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Simulation associée</label>
              <p className="text-lg font-mono text-sm">{souscription.simulation}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Créée le</label>
              <p className="text-lg">{format(new Date(souscription.created_at), "dd MMMM yyyy à HH:mm")}</p>
            </div>
            {souscription.validated_at && (
              <div>
                <label className="text-sm font-medium text-gray-500">Validée le</label>
                <p className="text-lg">
                  {format(new Date(souscription.validated_at), "dd MMMM yyyy à HH:mm")}
                </p>
              </div>
            )}
            {souscription.rejected_at && (
              <div>
                <label className="text-sm font-medium text-gray-500">Rejetée le</label>
                <p className="text-lg">
                  {format(new Date(souscription.rejected_at), "dd MMMM yyyy à HH:mm")}
                </p>
              </div>
            )}
            {souscription.raison_rejet && (
              <div>
                <label className="text-sm font-medium text-gray-500">Raison du rejet</label>
                <p className="text-lg text-red-600">{souscription.raison_rejet}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      {souscription && (
        <>
          <ValidateSouscriptionDialog
            open={validateDialogOpen}
            onOpenChange={setValidateDialogOpen}
            souscription={souscription}
            onValidate={handleValidate}
          />
          <RejectSouscriptionDialog
            open={rejectDialogOpen}
            onOpenChange={setRejectDialogOpen}
            souscription={souscription}
            onReject={handleReject}
          />
        </>
      )}
    </div>
  );
}

