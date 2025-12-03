"use client";

import { useSafeRouter } from "@/lib/hooks/useSafeRouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SimulationActions } from "@/components/simulations/SimulationActions";
import { exportsApi } from "@/lib/api/simulations";
import {
  STATUT_LABELS,
  STATUT_COLORS,
  RISK_CATEGORY_LABELS,
  RISK_CATEGORY_COLORS,
  API_BASE_URL
} from "@/lib/utils/constants";
import { PRODUIT_LABELS, type Simulation } from "@/types";
import { formatDateFull, formatDateTime } from "@/lib/utils/date";
import { FileText, User as UserIcon } from "lucide-react";

interface SimulationDetailProps {
  simulation: Simulation;
}

export function SimulationDetail({ simulation }: SimulationDetailProps) {
  const router = useSafeRouter();

  // Merge nested data for display
  const displaySimulation = {
    ...simulation,
    ...simulation.donnees_entree,
    ...simulation.resultats_calcul,
  };

  // Use displaySimulation instead of simulation for the rest of the component
  const s = displaySimulation;

  // Debug logging
  console.log("📊 Original simulation:", simulation);
  console.log("📊 donnees_entree:", simulation.donnees_entree);
  console.log("📊 resultats_calcul:", simulation.resultats_calcul);
  console.log("📊 Merged displaySimulation:", s);
  console.log("📊 Profession:", s.profession, "Employeur:", s.employeur);

  return (
    <div className="space-y-6">
      {/* En-tête avec statut */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3">
                Simulation {s.reference}
                <Badge className={STATUT_COLORS[s.statut]}>
                  {STATUT_LABELS[s.statut]}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Nom complet</p>
              <p className="font-medium">
                {s.prenom_client} {s.nom_client}
              </p>
            </div>
            {s.date_naissance && (
              <div>
                <p className="text-sm text-gray-500">Date de naissance</p>
                <p className="font-medium">
                  {formatDateFull(s.date_naissance)}
                </p>
              </div>
            )}
            {s.telephone_client && (
              <div>
                <p className="text-sm text-gray-500">Téléphone</p>
                <p className="font-medium">{s.telephone_client}</p>
              </div>
            )}
            {s.email_client && (
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{s.email_client}</p>
              </div>
            )}
            {(s.profession || s.donnees_entree?.profession) && (
              <div>
                <p className="text-sm text-gray-500">Profession</p>
                <p className="font-medium">{s.profession || s.donnees_entree?.profession}</p>
              </div>
            )}
            {(s.employeur || s.donnees_entree?.employeur) && (
              <div>
                <p className="text-sm text-gray-500">Employeur</p>
                <p className="font-medium">{s.employeur || s.donnees_entree?.employeur}</p>
              </div>
            )}
            {(s.numero_compte || s.donnees_entree?.numero_compte) && (
              <div>
                <p className="text-sm text-gray-500">Numéro de compte</p>
                <p className="font-medium font-mono">{s.numero_compte || s.donnees_entree?.numero_compte}</p>
              </div>
            )}
            {(s.situation_matrimoniale || s.donnees_entree?.situation_matrimoniale) && (
              <div>
                <p className="text-sm text-gray-500">Situation matrimoniale</p>
                <p className="font-medium capitalize">{s.situation_matrimoniale || s.donnees_entree?.situation_matrimoniale}</p>
              </div>
            )}
            {(s.date_effet || s.donnees_entree?.date_effet) && (
              <div>
                <p className="text-sm text-gray-500">Date d'effet</p>
                <p className="font-medium">{formatDateFull(s.date_effet || s.donnees_entree?.date_effet)}</p>
              </div>
            )}
            {(s.adresse_postale || s.donnees_entree?.adresse) && (
              <div className="md:col-span-2 lg:col-span-3">
                <p className="text-sm text-gray-500">Adresse postale</p>
                <p className="font-medium">{s.adresse_postale || s.donnees_entree?.adresse}</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="md:col-span-2 lg:col-span-3 pb-2 border-b">
              <p className="text-sm text-gray-500">Produit</p>
              <p className="font-semibold text-lg">{PRODUIT_LABELS[s.produit]}</p>
            </div>

            {/* CHAMPS COMMUNS */}
            {s.montant_pret && (
              <div>
                <p className="text-sm text-gray-500">Montant du prêt</p>
                <p className="font-medium">
                  {s.montant_pret.toLocaleString("fr-FR")} FCFA
                </p>
              </div>
            )}
            {s.duree_mois && (
              <div>
                <p className="text-sm text-gray-500">Durée</p>
                <p className="font-medium">{s.duree_mois} mois</p>
              </div>
            )}
            {s.taux_interet && (
              <div>
                <p className="text-sm text-gray-500">Taux d'intérêt</p>
                <p className="font-medium">{s.taux_interet}%</p>
              </div>
            )}

            {/* ELIKIA SCOLAIRE */}
            {s.produit === "elikia_scolaire" && (
              <>
                {s.rente_annuelle && (
                  <div>
                    <p className="text-sm text-gray-500">Rente annuelle</p>
                    <p className="font-medium">{s.rente_annuelle.toLocaleString("fr-FR")} FCFA</p>
                  </div>
                )}
                {s.duree_rente && (
                  <div>
                    <p className="text-sm text-gray-500">Durée de la rente</p>
                    <p className="font-medium">{s.duree_rente} ans</p>
                  </div>
                )}
                {s.age_parent && (
                  <div>
                    <p className="text-sm text-gray-500">Âge du parent</p>
                    <p className="font-medium">{s.age_parent} ans</p>
                  </div>
                )}
                {s.tranche_age && (
                  <div>
                    <p className="text-sm text-gray-500">Tranche d'âge</p>
                    <p className="font-medium">{s.tranche_age}</p>
                  </div>
                )}
                {s.capital_garanti && (
                  <div>
                    <p className="text-sm text-gray-500">Capital garanti</p>
                    <p className="font-medium text-green-600">{s.capital_garanti.toLocaleString("fr-FR")} FCFA</p>
                  </div>
                )}
                {s.prime_nette_annuelle && (
                  <div>
                    <p className="text-sm text-gray-500">Prime nette annuelle</p>
                    <p className="font-medium">{s.prime_nette_annuelle.toLocaleString("fr-FR")} FCFA</p>
                  </div>
                )}
              </>
            )}

            {/* EMPRUNTEUR */}
            {s.produit === "emprunteur" && (
              <>
                {s.age_emprunteur && (
                  <div>
                    <p className="text-sm text-gray-500">Âge emprunteur</p>
                    <p className="font-medium">{s.age_emprunteur} ans</p>
                  </div>
                )}
                {s.taux_applique && (
                  <div>
                    <p className="text-sm text-gray-500">Taux appliqué</p>
                    <p className="font-medium">{s.taux_applique}%</p>
                  </div>
                )}
                {s.prime_nette && (
                  <div>
                    <p className="text-sm text-gray-500">Prime nette</p>
                    <p className="font-medium">{s.prime_nette.toLocaleString("fr-FR")} FCFA</p>
                  </div>
                )}
                {s.surprime && (
                  <div>
                    <p className="text-sm text-gray-500">Surprime</p>
                    <p className="font-medium">{s.surprime.toLocaleString("fr-FR")} FCFA</p>
                  </div>
                )}
                {s.frais_accessoires && (
                  <div>
                    <p className="text-sm text-gray-500">Frais accessoires</p>
                    <p className="font-medium">{s.frais_accessoires.toLocaleString("fr-FR")} FCFA</p>
                  </div>
                )}
                {s.net_a_debourser && (
                  <div>
                    <p className="text-sm text-gray-500">Net à débourser</p>
                    <p className="font-medium text-blue-600 text-lg">{s.net_a_debourser.toLocaleString("fr-FR")} FCFA</p>
                  </div>
                )}
              </>
            )}

            {/* MOBATELI */}
            {s.produit === "mobateli" && (
              <>
                {s.capital_dtc_iad && (
                  <div>
                    <p className="text-sm text-gray-500">Capital DTC/IAD</p>
                    <p className="font-medium">{s.capital_dtc_iad.toLocaleString("fr-FR")} FCFA</p>
                  </div>
                )}
                {s.age && (
                  <div>
                    <p className="text-sm text-gray-500">Âge</p>
                    <p className="font-medium">{s.age} ans</p>
                  </div>
                )}
                {s.tranche_age && (
                  <div>
                    <p className="text-sm text-gray-500">Tranche d'âge</p>
                    <p className="font-medium">{s.tranche_age}</p>
                  </div>
                )}
                {s.prime_nette && (
                  <div>
                    <p className="text-sm text-gray-500">Prime nette</p>
                    <p className="font-medium">{s.prime_nette.toLocaleString("fr-FR")} FCFA</p>
                  </div>
                )}
              </>
            )}

            {/* CONFORT RETRAITE */}
            {s.produit === "confort_retraite" && (
              <>
                {s.prime_periodique_commerciale && (
                  <div>
                    <p className="text-sm text-gray-500">Prime périodique commerciale</p>
                    <p className="font-medium">{s.prime_periodique_commerciale.toLocaleString("fr-FR")} FCFA</p>
                  </div>
                )}
                {s.capital_deces !== undefined && (
                  <div>
                    <p className="text-sm text-gray-500">Capital décès</p>
                    <p className="font-medium">{s.capital_deces.toLocaleString("fr-FR")} FCFA</p>
                  </div>
                )}
                {s.duree && (
                  <div>
                    <p className="text-sm text-gray-500">Durée</p>
                    <p className="font-medium">{s.duree} ans</p>
                  </div>
                )}
                {s.periodicite_libelle && (
                  <div>
                    <p className="text-sm text-gray-500">Périodicité</p>
                    <p className="font-medium">{s.periodicite_libelle}</p>
                  </div>
                )}
                {s.capital_garanti && (
                  <div>
                    <p className="text-sm text-gray-500">Capital garanti</p>
                    <p className="font-medium text-green-600">{s.capital_garanti.toLocaleString("fr-FR")} FCFA</p>
                  </div>
                )}
                {s.prime_epargne && (
                  <div>
                    <p className="text-sm text-gray-500">Prime épargne</p>
                    <p className="font-medium">{s.prime_epargne.toLocaleString("fr-FR")} FCFA</p>
                  </div>
                )}
                {s.prime_deces && (
                  <div>
                    <p className="text-sm text-gray-500">Prime décès</p>
                    <p className="font-medium">{s.prime_deces.toLocaleString("fr-FR")} FCFA</p>
                  </div>
                )}
              </>
            )}

            {/* CONFORT ETUDES */}
            {s.produit === "confort_etudes" && (
              <>
                {s.montant_rente_annuel && (
                  <div>
                    <p className="text-sm text-gray-500">Montant rente annuel</p>
                    <p className="font-medium">
                      {s.montant_rente_annuel.toLocaleString("fr-FR")} FCFA
                    </p>
                  </div>
                )}
                {s.age_parent !== undefined && (
                  <div>
                    <p className="text-sm text-gray-500">Âge du parent</p>
                    <p className="font-medium">{s.age_parent} ans</p>
                  </div>
                )}
                {s.age_enfant !== undefined && (
                  <div>
                    <p className="text-sm text-gray-500">Âge de l'enfant</p>
                    <p className="font-medium">{s.age_enfant} ans</p>
                  </div>
                )}
                {s.duree_paiement !== undefined && (
                  <div>
                    <p className="text-sm text-gray-500">Durée de paiement</p>
                    <p className="font-medium">{s.duree_paiement} ans</p>
                  </div>
                )}
                {s.duree_service !== undefined && (
                  <div>
                    <p className="text-sm text-gray-500">Durée de service</p>
                    <p className="font-medium">{s.duree_service} ans</p>
                  </div>
                )}
                {s.debut_service !== undefined && (
                  <div>
                    <p className="text-sm text-gray-500">Début de service</p>
                    <p className="font-medium">À {s.debut_service} ans</p>
                  </div>
                )}
                {s.fin_service !== undefined && (
                  <div>
                    <p className="text-sm text-gray-500">Fin de service</p>
                    <p className="font-medium">À {s.fin_service} ans</p>
                  </div>
                )}
                {s.prime_unique && (
                  <div>
                    <p className="text-sm text-gray-500">Prime unique</p>
                    <p className="font-medium">{parseFloat(s.prime_unique).toLocaleString("fr-FR")} FCFA</p>
                  </div>
                )}
                {s.prime_annuelle && (
                  <div>
                    <p className="text-sm text-gray-500">Prime annuelle</p>
                    <p className="font-medium">{parseFloat(s.prime_annuelle).toLocaleString("fr-FR")} FCFA</p>
                  </div>
                )}
              </>
            )}

            {/* PRIMES GENERALES (si non affichées spécifiquement) */}
            {s.prime_mensuelle && (
              <div>
                <p className="text-sm text-gray-500">Prime mensuelle</p>
                <p className="font-medium">{s.prime_mensuelle.toLocaleString("fr-FR")} FCFA</p>
              </div>
            )}
            {s.prime_totale && (
              <div>
                <p className="text-sm text-gray-500">Prime totale</p>
                <p className="font-medium text-xl text-blue-600">
                  {parseFloat(s.prime_totale).toLocaleString("fr-FR")} FCFA
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Questionnaire médical */}
      {s.categorie_risque && (
        <Card>
          <CardHeader>
            <CardTitle>Questionnaire Médical</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Catégorie de risque</p>
                <p className="font-medium">{s.categorie_risque}</p>
              </div>
              {s.score_total !== undefined && (
                <div>
                  <p className="text-sm text-gray-500">Score total</p>
                  <p className="font-medium">{s.score_total} points</p>
                </div>
              )}
              {s.taux_surprime !== undefined && (
                <div>
                  <p className="text-sm text-gray-500">Taux de surprime appliqué</p>
                  <p className="font-medium">{s.taux_surprime}%</p>
                </div>
              )}
            </div>
            <div className="mt-4 flex gap-4">
              {s.statut === "calculee" && (
                <Button
                  className="w-full sm:w-auto"
                  onClick={() => router.push(`/simulations/${s.id}/questionnaire`)}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Compléter le questionnaire médical
                </Button>
              )}
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={async () => {
                  try {
                    const url = await exportsApi.previewBIA(s.id);
                    window.open(url, '_blank');
                  } catch (e) {
                    toast.error("Erreur lors de l'ouverture du BIA");
                  }
                }}
              >
                <FileText className="mr-2 h-4 w-4" />
                Voir le BIA
              </Button>
            </div>
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
                {formatDateTime(s.created_at)}
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
