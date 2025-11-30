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
                {simulation.prenom_client} {simulation.nom_client}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Date de naissance</p>
              <p className="font-medium">
                {formatDateFull(simulation.date_naissance)}
              </p>
            </div>
            {simulation.telephone_client && (
              <div>
                <p className="text-sm text-gray-500">Téléphone</p>
                <p className="font-medium">{simulation.telephone_client}</p>
              </div>
            )}
            {simulation.email_client && (
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{simulation.email_client}</p>
              </div>
            )}
            {simulation.profession && (
              <div>
                <p className="text-sm text-gray-500">Profession</p>
                <p className="font-medium">{simulation.profession}</p>
              </div>
            )}
            {simulation.adresse_postale && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500">Adresse postale</p>
                <p className="font-medium">{simulation.adresse_postale}</p>
              </div>
            )}
            {simulation.employeur && (
              <div>
                <p className="text-sm text-gray-500">Employeur</p>
                <p className="font-medium">{simulation.employeur}</p>
              </div>
            )}
            {simulation.situation_matrimoniale && (
              <div>
                <p className="text-sm text-gray-500">Situation matrimoniale</p>
                <p className="font-medium">{simulation.situation_matrimoniale}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Détails du Produit & Résultats */}
      <Card>
        <CardHeader>
          <CardTitle>Détails du Produit & Résultats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Produit</p>
              <p className="font-medium">{PRODUIT_LABELS[simulation.produit]}</p>
            </div>

            {/* CHAMPS COMMUNS */}
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

            {/* ELIKIA SCOLAIRE */}
            {simulation.produit === "elikia_scolaire" && (
              <>
                {simulation.rente_annuelle && (
                  <div>
                    <p className="text-sm text-gray-500">Rente annuelle</p>
                    <p className="font-medium">{simulation.rente_annuelle.toLocaleString("fr-FR")} FCFA</p>
                  </div>
                )}
                {simulation.duree_rente && (
                  <div>
                    <p className="text-sm text-gray-500">Durée de la rente</p>
                    <p className="font-medium">{simulation.duree_rente} ans</p>
                  </div>
                )}
                {simulation.age_parent && (
                  <div>
                    <p className="text-sm text-gray-500">Âge du parent</p>
                    <p className="font-medium">{simulation.age_parent} ans</p>
                  </div>
                )}
                {simulation.tranche_age && (
                  <div>
                    <p className="text-sm text-gray-500">Tranche d'âge</p>
                    <p className="font-medium">{simulation.tranche_age}</p>
                  </div>
                )}
                {simulation.capital_garanti && (
                  <div>
                    <p className="text-sm text-gray-500">Capital garanti</p>
                    <p className="font-medium text-green-600">{simulation.capital_garanti.toLocaleString("fr-FR")} FCFA</p>
                  </div>
                )}
                {simulation.prime_nette_annuelle && (
                  <div>
                    <p className="text-sm text-gray-500">Prime nette annuelle</p>
                    <p className="font-medium">{simulation.prime_nette_annuelle.toLocaleString("fr-FR")} FCFA</p>
                  </div>
                )}
              </>
            )}

            {/* EMPRUNTEUR */}
            {simulation.produit === "emprunteur" && (
              <>
                {simulation.age_emprunteur && (
                  <div>
                    <p className="text-sm text-gray-500">Âge emprunteur</p>
                    <p className="font-medium">{simulation.age_emprunteur} ans</p>
                  </div>
                )}
                {simulation.taux_applique && (
                  <div>
                    <p className="text-sm text-gray-500">Taux appliqué</p>
                    <p className="font-medium">{simulation.taux_applique}%</p>
                  </div>
                )}
                {simulation.prime_nette && (
                  <div>
                    <p className="text-sm text-gray-500">Prime nette</p>
                    <p className="font-medium">{simulation.prime_nette.toLocaleString("fr-FR")} FCFA</p>
                  </div>
                )}
                {simulation.surprime && (
                  <div>
                    <p className="text-sm text-gray-500">Surprime</p>
                    <p className="font-medium">{simulation.surprime.toLocaleString("fr-FR")} FCFA</p>
                  </div>
                )}
                {simulation.frais_accessoires && (
                  <div>
                    <p className="text-sm text-gray-500">Frais accessoires</p>
                    <p className="font-medium">{simulation.frais_accessoires.toLocaleString("fr-FR")} FCFA</p>
                  </div>
                )}
                {simulation.net_a_debourser && (
                  <div>
                    <p className="text-sm text-gray-500">Net à débourser</p>
                    <p className="font-medium text-blue-600 text-lg">{simulation.net_a_debourser.toLocaleString("fr-FR")} FCFA</p>
                  </div>
                )}
              </>
            )}

            {/* MOBATELI */}
            {simulation.produit === "mobateli" && (
              <>
                {simulation.capital_dtc_iad && (
                  <div>
                    <p className="text-sm text-gray-500">Capital DTC/IAD</p>
                    <p className="font-medium">{simulation.capital_dtc_iad.toLocaleString("fr-FR")} FCFA</p>
                  </div>
                )}
                {simulation.age && (
                  <div>
                    <p className="text-sm text-gray-500">Âge</p>
                    <p className="font-medium">{simulation.age} ans</p>
                  </div>
                )}
                {simulation.tranche_age && (
                  <div>
                    <p className="text-sm text-gray-500">Tranche d'âge</p>
                    <p className="font-medium">{simulation.tranche_age}</p>
                  </div>
                )}
                {simulation.prime_nette && (
                  <div>
                    <p className="text-sm text-gray-500">Prime nette</p>
                    <p className="font-medium">{simulation.prime_nette.toLocaleString("fr-FR")} FCFA</p>
                  </div>
                )}
              </>
            )}

            {/* CONFORT RETRAITE */}
            {simulation.produit === "confort_retraite" && (
              <>
                {simulation.prime_periodique_commerciale && (
                  <div>
                    <p className="text-sm text-gray-500">Prime périodique commerciale</p>
                    <p className="font-medium">{simulation.prime_periodique_commerciale.toLocaleString("fr-FR")} FCFA</p>
                  </div>
                )}
                {simulation.capital_deces !== undefined && (
                  <div>
                    <p className="text-sm text-gray-500">Capital décès</p>
                    <p className="font-medium">{simulation.capital_deces.toLocaleString("fr-FR")} FCFA</p>
                  </div>
                )}
                {simulation.duree && (
                  <div>
                    <p className="text-sm text-gray-500">Durée</p>
                    <p className="font-medium">{simulation.duree} ans</p>
                  </div>
                )}
                {simulation.periodicite_libelle && (
                  <div>
                    <p className="text-sm text-gray-500">Périodicité</p>
                    <p className="font-medium">{simulation.periodicite_libelle}</p>
                  </div>
                )}
                {simulation.capital_garanti && (
                  <div>
                    <p className="text-sm text-gray-500">Capital garanti</p>
                    <p className="font-medium text-green-600">{simulation.capital_garanti.toLocaleString("fr-FR")} FCFA</p>
                  </div>
                )}
                {simulation.prime_epargne && (
                  <div>
                    <p className="text-sm text-gray-500">Prime épargne</p>
                    <p className="font-medium">{simulation.prime_epargne.toLocaleString("fr-FR")} FCFA</p>
                  </div>
                )}
                {simulation.prime_deces && (
                  <div>
                    <p className="text-sm text-gray-500">Prime décès</p>
                    <p className="font-medium">{simulation.prime_deces.toLocaleString("fr-FR")} FCFA</p>
                  </div>
                )}
              </>
            )}

            {/* CONFORT ETUDES */}
            {simulation.produit === "confort_etudes" && (
              <>
                {simulation.montant_rente_annuel && (
                  <div>
                    <p className="text-sm text-gray-500">Montant rente annuel</p>
                    <p className="font-medium">
                      {simulation.montant_rente_annuel.toLocaleString("fr-FR")} FCFA
                    </p>
                  </div>
                )}
                {simulation.age_parent !== undefined && (
                  <div>
                    <p className="text-sm text-gray-500">Âge du parent</p>
                    <p className="font-medium">{simulation.age_parent} ans</p>
                  </div>
                )}
                {simulation.age_enfant !== undefined && (
                  <div>
                    <p className="text-sm text-gray-500">Âge de l'enfant</p>
                    <p className="font-medium">{simulation.age_enfant} ans</p>
                  </div>
                )}
                {simulation.duree_paiement !== undefined && (
                  <div>
                    <p className="text-sm text-gray-500">Durée de paiement</p>
                    <p className="font-medium">{simulation.duree_paiement} ans</p>
                  </div>
                )}
                {simulation.duree_service !== undefined && (
                  <div>
                    <p className="text-sm text-gray-500">Durée de service</p>
                    <p className="font-medium">{simulation.duree_service} ans</p>
                  </div>
                )}
                {simulation.debut_service !== undefined && (
                  <div>
                    <p className="text-sm text-gray-500">Début de service</p>
                    <p className="font-medium">À {simulation.debut_service} ans</p>
                  </div>
                )}
                {simulation.fin_service !== undefined && (
                  <div>
                    <p className="text-sm text-gray-500">Fin de service</p>
                    <p className="font-medium">À {simulation.fin_service} ans</p>
                  </div>
                )}
                {simulation.prime_unique && (
                  <div>
                    <p className="text-sm text-gray-500">Prime unique</p>
                    <p className="font-medium">{parseFloat(simulation.prime_unique).toLocaleString("fr-FR")} FCFA</p>
                  </div>
                )}
                {simulation.prime_annuelle && (
                  <div>
                    <p className="text-sm text-gray-500">Prime annuelle</p>
                    <p className="font-medium">{parseFloat(simulation.prime_annuelle).toLocaleString("fr-FR")} FCFA</p>
                  </div>
                )}
              </>
            )}

            {/* PRIMES GENERALES (si non affichées spécifiquement) */}
            {simulation.prime_mensuelle && (
              <div>
                <p className="text-sm text-gray-500">Prime mensuelle</p>
                <p className="font-medium">{simulation.prime_mensuelle.toLocaleString("fr-FR")} FCFA</p>
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
