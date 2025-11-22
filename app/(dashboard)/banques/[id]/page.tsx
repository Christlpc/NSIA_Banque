"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ROLES } from "@/lib/utils/constants";
import { useBanqueStore } from "@/lib/store/banqueStore";
import { BanqueStats } from "@/components/banques/BanqueStats";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getBankTheme } from "@/lib/utils/theme";
import { PRODUIT_LABELS } from "@/types";
import { ArrowLeft, Edit, Building2, Users, FileText, DollarSign } from "lucide-react";
import { useSafeRouter } from "@/lib/hooks/useSafeRouter";
import { BanqueForm } from "@/components/banques/BanqueForm";
import type { Banque } from "@/types";
import { formatDateFull } from "@/lib/utils/date";

export default function BanqueDetailPage() {
  const params = useParams();
  const router = useSafeRouter();
  const { currentBanque, fetchBanque, isLoading } = useBanqueStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const banqueId = params?.id ? parseInt(params.id as string) : null;

  useEffect(() => {
    if (banqueId) {
      fetchBanque(banqueId);
    }
  }, [banqueId, fetchBanque]);

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN_NSIA, ROLES.ADMIN_NSIA]}>
        <div className="text-center py-12 text-gray-500">Chargement...</div>
      </ProtectedRoute>
    );
  }

  if (!currentBanque) {
    return (
      <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN_NSIA, ROLES.ADMIN_NSIA]}>
        <div className="text-center py-12">
          <p className="text-gray-500">Banque introuvable</p>
          <Button onClick={() => router.push("/banques")} className="mt-4">
            Retour à la liste
          </Button>
        </div>
      </ProtectedRoute>
    );
  }

  const theme = getBankTheme(currentBanque);

  return (
    <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN_NSIA, ROLES.ADMIN_NSIA]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push("/banques")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">{currentBanque.nom}</h1>
              <p className="text-gray-600 mt-1">Code: {currentBanque.code}</p>
            </div>
          </div>
          <Button
            onClick={() => setIsFormOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </Button>
        </div>

        {/* Informations principales */}
        <Card className="border-0 shadow-lg">
          <div className={`h-2 ${theme.gradient}`} />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Informations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">Contact</p>
                  {currentBanque.email && (
                    <p className="text-sm text-gray-600">{currentBanque.email}</p>
                  )}
                  {currentBanque.telephone && (
                    <p className="text-sm text-gray-600">{currentBanque.telephone}</p>
                  )}
                  {currentBanque.adresse && (
                    <p className="text-sm text-gray-600">{currentBanque.adresse}</p>
                  )}
                </div>
                {currentBanque.date_partenariat && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">Date de partenariat</p>
                    <p className="text-sm text-gray-600">
                      {formatDateFull(currentBanque.date_partenariat)}
                    </p>
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Produits disponibles</p>
                <div className="flex flex-wrap gap-2">
                  {currentBanque.produits_disponibles.map((produit) => (
                    <Badge
                      key={produit}
                      className="bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                    >
                      {PRODUIT_LABELS[produit]}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistiques */}
        <BanqueStats banque={currentBanque} />

        {/* Form Dialog */}
        <BanqueForm
          banque={currentBanque}
          open={isFormOpen}
          onOpenChange={(open) => {
            setIsFormOpen(open);
            if (!open && banqueId) {
              fetchBanque(banqueId);
            }
          }}
        />
      </div>
    </ProtectedRoute>
  );
}

