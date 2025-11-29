"use client";

import { useSafeRouter } from "@/lib/hooks/useSafeRouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SimulationActions } from "@/components/simulations/SimulationActions";
import { STATUT_LABELS, STATUT_COLORS } from "@/lib/utils/constants";
import { PRODUIT_LABELS, type Simulation } from "@/types";
import { formatDateFull, formatDateTime } from "@/lib/utils/date";
import { FileText, User as UserIcon } from "lucide-react";

interface SimulationDetailProps {
  simulation: Simulation;
}

export function SimulationDetail({ simulation }: SimulationDetailProps) {
  const router = useSafeRouter();

  return (
    <div className="space-y-6">
      {/* En-tête avec statut */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3">
                Simulation {simulation.reference}
                <Badge className={STATUT_COLORS[simulation.statut]}>
                  {STATUT_LABELS[simulation.statut]}
                </Badge>
              </CardTitle>
            </div>
            <SimulationActions simulation={simulation} />
          </div>
        </CardHeader>
      </Card>

      {/* Informations client */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            Informations Client
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Nom complet</p>
              <p className="font-medium">
                {(() => {
                  const s = simulation as any;
                  const nom = s.nom || s.last_name || s.client?.nom || s.client?.last_name || "";
                  const prenom = s.prenom || s.first_name || s.client?.prenom || s.client?.first_name || "";
                  return `${prenom} ${nom}`.trim() || "Client inconnu";
                })()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Date de naissance</p>
              <p className="font-medium">
                {formatDateFull(simulation.date_naissance)}
              </p>
            </div>
            {simulation.telephone && (
              <div>
                <p className="text-sm text-gray-500">Téléphone</p>
                <p className="font-medium">{simulation.telephone}</p>
              </div>
            )}
            {simulation.profession && (
              <div>
                <p className="text-sm text-gray-500">Profession</p>
                <p className="font-medium">{simulation.profession}</p>
              </div>
            )}
            {simulation.adresse && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500">Adresse</p>
                <p className="font-medium">{simulation.adresse}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Détails du produit */}
      <Card>
        <CardHeader>
          <CardTitle>Détails du Produit</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Produit</p>
              <p className="font-medium">{PRODUIT_LABELS[simulation.produit]}</p>
            </div>
            {simulation.montant_pret && (
              <div>
                <p className="text-sm text-gray-500">Montant du prêt</p>
                <p className="font-medium">
                  {simulation.montant_pret.toLocaleString("fr-FR")} FCFA
                </p>
              </div>
            )}
            {simulation.duree_mois && (
              <div>
                <p className="text-sm text-gray-500">Durée</p>
                <p className="font-medium">{simulation.duree_mois} mois</p>
              </div>
            )}
            {simulation.taux_interet && (
              <div>
                <p className="text-sm text-gray-500">Taux d'intérêt</p>
                <p className="font-medium">{simulation.taux_interet}%</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Calculs de prime */}
      {(simulation.prime_base || simulation.prime_totale) && (
        <Card>
          <CardHeader>
            <CardTitle>Calcul de Prime</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {simulation.prime_base && (
                <div>
                  <p className="text-sm text-gray-500">Prime de base</p>
                  <p className="font-medium text-lg">
                    {parseFloat(simulation.prime_base).toLocaleString("fr-FR")} FCFA
                  </p>
                </div>
              )}
              {simulation.surprime_taux && (
                <div>
                  <p className="text-sm text-gray-500">Taux de surprime</p>
                  <p className="font-medium">{simulation.surprime_taux}%</p>
                </div>
              )}
              {simulation.surprime_montant && (
                <div>
                  <p className="text-sm text-gray-500">Montant de surprime</p>
                  <p className="font-medium">
                    {parseFloat(simulation.surprime_montant).toLocaleString("fr-FR")} FCFA
                  </p>
                </div>
              )}
              {simulation.prime_totale && (
                <div>
                  <p className="text-sm text-gray-500">Prime totale</p>
                  <p className="font-medium text-xl text-blue-600">
                    {parseFloat(simulation.prime_totale).toLocaleString("fr-FR")} FCFA
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Questionnaire médical */}
      {simulation.categorie_risque && (
        <Card>
          <CardHeader>
            <CardTitle>Questionnaire Médical</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Catégorie de risque</p>
                <p className="font-medium">{simulation.categorie_risque}</p>
              </div>
              {simulation.score_total !== undefined && (
                <div>
                  <p className="text-sm text-gray-500">Score total</p>
                  <p className="font-medium">{simulation.score_total} points</p>
                </div>
              )}
              {simulation.taux_surprime !== undefined && (
                <div>
                  <p className="text-sm text-gray-500">Taux de surprime appliqué</p>
                  <p className="font-medium">{simulation.taux_surprime}%</p>
                </div>
              )}
            </div>
            {simulation.statut === "calculee" && (
              <div className="mt-4">
                <Button
                  className="w-full sm:w-auto"
                  onClick={() => router.push(`/simulations/${simulation.id}/questionnaire`)}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Compléter le questionnaire médical
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Métadonnées */}
      <Card>
        <CardHeader>
          <CardTitle>Informations Système</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Date de création</p>
              <p className="font-medium">
                {formatDateTime(simulation.created_at)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Dernière modification</p>
              <p className="font-medium">
                {formatDateTime(simulation.updated_at)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

