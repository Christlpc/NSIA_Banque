"use client";

import { useSafeRouter } from "@/lib/hooks/useSafeRouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SimulationActions } from "@/components/simulations/SimulationActions";
import { exportsApi } from "@/lib/api/simulations";
import {
  STATUT_LABELS,
  STATUT_COLORS,
} from "@/lib/utils/constants";
import { PRODUIT_LABELS, type Simulation } from "@/types";
import { formatDateFull, formatDateTime } from "@/lib/utils/date";
import {
  FileText,
  User as UserIcon,
  Phone,
  Mail,
  Briefcase,
  Building2,
  CreditCard,
  Calendar,
  MapPin,
  Calculator,
  Activity,
  HeartPulse,
  Banknote,
  ArrowRight,
  Clock
} from "lucide-react";
import toast from "react-hot-toast";

interface SimulationDetailProps {
  simulation: Simulation;
}

export function SimulationDetail({ simulation }: SimulationDetailProps) {
  const router = useSafeRouter();

  // Merge nested data for display
  const s = {
    ...simulation,
    ...simulation.donnees_entree,
    ...simulation.resultats_calcul,
  };

  const formatCurrency = (amount: number | string | undefined) => {
    if (amount === undefined || amount === null) return "-";
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return num.toLocaleString("fr-FR", { style: "currency", currency: "XAF", maximumFractionDigits: 0 });
  };

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-500">
      {/* Header Statut & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <span className="text-muted-foreground font-normal">Réf.</span>
            {s.reference}
          </h2>
          <Badge className={`${STATUT_COLORS[s.statut]} px-3 py-1 font-medium`}>
            {STATUT_LABELS[s.statut]}
          </Badge>
        </div>
        <SimulationActions simulation={simulation} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Colonne Gauche: Infos Client (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-l-4 border-indigo-500 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader className="bg-indigo-50/30 pb-4">
              <CardTitle className="flex items-center gap-2 text-lg text-indigo-900">
                <UserIcon className="h-5 w-5 text-indigo-600" />
                Profil Client
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="flex flex-col items-center text-center pb-4 border-b border-indigo-100">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center mb-3 text-indigo-700 font-bold text-3xl shadow-inner">
                  {s.prenom_client?.charAt(0)}{s.nom_client?.charAt(0)}
                </div>
                <h3 className="text-xl font-bold text-gray-900">{s.prenom_client} {s.nom_client}</h3>
                <Badge variant="secondary" className="mt-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100">
                  {s.situation_matrimoniale || "Non renseigné"}
                </Badge>
              </div>

              <div className="space-y-4">
                <InfoRow icon={Calendar} label="Né(e) le" value={s.date_naissance ? `${formatDateFull(s.date_naissance)}` : undefined} highlight />
                <InfoRow icon={Phone} label="Téléphone" value={s.telephone_client} />
                <InfoRow icon={Mail} label="Email" value={s.email_client} />
                <InfoRow icon={MapPin} label="Adresse" value={s.adresse_postale || s.donnees_entree?.adresse} />
                <InfoRow icon={Briefcase} label="Profession" value={s.profession || s.donnees_entree?.profession} />
                <InfoRow icon={Building2} label="Employeur" value={s.employeur || s.donnees_entree?.employeur} />
                <InfoRow icon={CreditCard} label="Compte bancaire" value={s.numero_compte || s.donnees_entree?.numero_compte} isMono />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-gray-200">
            <CardHeader className="pb-3 bg-gray-50/50">
              <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Historique
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm pt-4">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Création</span>
                <span className="font-medium text-gray-700">{formatDateFull(s.created_at)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-500">Mise à jour</span>
                <span className="font-medium text-gray-700">{formatDateFull(simulation.updated_at)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Colonne Droite: Détails Produit & Résultats (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border-l-4 border-violet-500 shadow-sm">
            <CardHeader className="bg-violet-50/30 border-b border-violet-100/50">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3 text-xl text-violet-900">
                  <div className="p-2 bg-violet-100 rounded-lg">
                    <Calculator className="h-6 w-6 text-violet-600" />
                  </div>
                  {PRODUIT_LABELS[s.produit] || "Produit Inconnu"}
                </CardTitle>
                <div className="text-right">
                  <p className="text-xs text-violet-600 font-semibold uppercase tracking-wider">Date d'effet</p>
                  <p className="font-medium text-gray-900">{formatDateFull(s.date_effet || s.donnees_entree?.date_effet)}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-8">
              {/* Highlight Cards - Styled logically */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                {s.prime_totale && (
                  <div className="bg-gradient-to-br from-violet-900 to-indigo-900 text-white p-5 rounded-xl shadow-lg shadow-indigo-900/10">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider">Prime Totale</p>
                      <Banknote className="h-5 w-5 text-indigo-300" />
                    </div>
                    <p className="text-2xl font-bold tracking-tight">{formatCurrency(s.prime_totale)}</p>
                  </div>
                )}
                {s.capital_garanti && (
                  <div className="bg-white p-5 rounded-xl border border-cyan-200 shadow-sm relative overflow-hidden group">
                    <div className="absolute right-0 top-0 h-16 w-16 bg-cyan-50 rounded-bl-full -mr-2 -mt-2 transition-transform group-hover:scale-110"></div>
                    <div className="relative z-10">
                      <p className="text-cyan-600 text-xs font-bold uppercase tracking-wider mb-2">Capital Garanti</p>
                      <p className="text-xl font-bold text-gray-900">{formatCurrency(s.capital_garanti)}</p>
                    </div>
                  </div>
                )}
                {s.net_a_debourser && (
                  <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-100">
                    <p className="text-indigo-600 text-xs font-bold uppercase tracking-wider mb-2">Net à débourser</p>
                    <p className="text-xl font-bold text-indigo-900">{formatCurrency(s.net_a_debourser)}</p>
                  </div>
                )}
                {s.rente_annuelle && (
                  <div className="bg-fuchsia-50 p-5 rounded-xl border border-fuchsia-100">
                    <p className="text-fuchsia-600 text-xs font-bold uppercase tracking-wider mb-2">Rente Annuelle</p>
                    <p className="text-xl font-bold text-fuchsia-900">{formatCurrency(s.rente_annuelle)}</p>
                  </div>
                )}
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">

                {/* Configuration (Entrées) */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                    <div className="bg-gray-100 p-1.5 rounded-md">
                      <Calculator className="h-4 w-4 text-gray-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900">Configuration</h4>
                  </div>

                  <div className="space-y-0 divide-y divide-gray-50 border border-gray-100 rounded-lg overflow-hidden">
                    {/* ELIKIA */}
                    {s.produit === "elikia_scolaire" && (
                      <>
                        <DetailRow label="Âge du parent" value={`${s.age_parent || '-'} ans`} />
                        <DetailRow label="Durée rente" value={`${s.duree_rente || '-'} ans`} />
                        <DetailRow label="Rente annuelle" value={formatCurrency(s.rente_annuelle)} />
                      </>
                    )}
                    {/* EMPRUNTEUR */}
                    {s.produit === "emprunteur" && (
                      <>
                        <DetailRow label="Montant du prêt" value={formatCurrency(s.montant_pret)} />
                        <DetailRow label="Durée" value={`${s.duree_mois || '-'} mois`} />
                        <DetailRow label="Taux d'intérêt" value={`${s.taux_interet || '-'} %`} />
                        <DetailRow label="Taux appliqué" value={`${s.taux_applique || '-'} %`} />
                      </>
                    )}
                    {/* MOBATELI */}
                    {s.produit === "mobateli" && (
                      <>
                        <DetailRow label="Capital DTC/IAD" value={formatCurrency(s.capital_dtc_iad)} />
                        <DetailRow label="Âge" value={`${s.age || '-'} ans`} />
                        <DetailRow label="Tranche d'âge" value={s.tranche_age} />
                      </>
                    )}
                    {/* CONFORT RETRAITE */}
                    {s.produit === "confort_retraite" && (
                      <>
                        <DetailRow label="Périodicité" value={s.periodicite_libelle} />
                        <DetailRow label="Durée" value={`${s.duree || '-'} ans`} />
                        <DetailRow label="Prime Epargne" value={formatCurrency(s.prime_epargne)} />
                        <DetailRow label="Prime Décès" value={formatCurrency(s.prime_deces)} />
                      </>
                    )}
                  </div>
                </div>

                {/* Résultats Financiers */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                    <div className="bg-emerald-50 p-1.5 rounded-md">
                      <Banknote className="h-4 w-4 text-emerald-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900">Détails Financiers</h4>
                  </div>

                  <div className="space-y-0 divide-y divide-gray-50 border border-gray-100 rounded-lg overflow-hidden bg-gray-50/30">
                    {s.prime_mensuelle && <DetailRow label="Mensualité" value={formatCurrency(s.prime_mensuelle)} strong />}
                    {s.prime_annuelle && <DetailRow label="Prime annuelle" value={formatCurrency(s.prime_annuelle)} />}
                    {s.prime_nette_annuelle && <DetailRow label="Prime Nette Annuelle" value={formatCurrency(s.prime_nette_annuelle)} />}
                    {(s.surprime || 0) > 0 && <DetailRow label="Surprime" value={formatCurrency(s.surprime)} isError />}
                    {(s.frais_accessoires || 0) > 0 && <DetailRow label="Frais Accessoires" value={formatCurrency(s.frais_accessoires)} />}
                    {s.capital_deces && <DetailRow label="Capital Décès" value={formatCurrency(s.capital_deces)} />}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Questionnaire Médical Section */}
          {(s.categorie_risque || s.taux_surprime !== undefined) && (
            <Card className="border-l-4 border-amber-500 shadow-sm">
              <CardHeader className="bg-amber-50/50 pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-amber-900">
                  <HeartPulse className="h-5 w-5 text-amber-600" />
                  Données Médicales
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex flex-col sm:flex-row gap-6 items-center justify-between p-4 bg-white rounded-xl border border-amber-100">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-100 rounded-full">
                      <Activity className="h-6 w-6 text-amber-700" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Risque</p>
                      <p className="text-lg font-bold text-amber-900">{s.categorie_risque || "Standard"}</p>
                    </div>
                  </div>

                  <div className="h-8 w-px bg-amber-200 hidden sm:block"></div>

                  {s.score_total !== undefined && (
                    <div className="text-center">
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Score</p>
                      <p className="text-xl font-bold text-gray-700">{s.score_total} <span className="text-sm font-normal text-gray-400">pts</span></p>
                    </div>
                  )}

                  {s.taux_surprime !== undefined && (
                    <div className="text-right">
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Surprime</p>
                      <Badge variant="outline" className={`text-lg font-bold px-3 py-1 ${s.taux_surprime > 0 ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-600 border-green-200'}`}>
                        {s.taux_surprime}%
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex flex-wrap gap-3 justify-end">
                  {s.statut === "calculee" && (
                    <Button
                      size="sm"
                      className="bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
                      onClick={() => router.push(`/simulations/${s.id}/questionnaire`)}
                    >
                      <HeartPulse className="mr-2 h-4 w-4" />
                      Compléter le questionnaire
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-amber-200 text-amber-900 hover:bg-amber-50"
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
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, isMono = false, highlight = false }: { icon: any, label: string, value?: string, isMono?: boolean, highlight?: boolean }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <div className={`mt-0.5 ${highlight ? 'text-indigo-500' : 'text-gray-400'}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className={`text-xs font-semibold uppercase tracking-wide ${highlight ? 'text-indigo-600' : 'text-gray-500'}`}>{label}</p>
        <p className={`text-sm ${highlight ? 'text-indigo-900 font-medium' : 'text-gray-900'} ${isMono ? 'font-mono' : ''}`}>{value}</p>
      </div>
    </div>
  )
}

function DetailRow({ label, value, strong = false, isError = false }: { label: string, value?: string | number, strong?: boolean, isError?: boolean }) {
  return (
    <div className="flex justify-between items-center py-1 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 px-1 rounded transition-colors">
      <span className="text-gray-600 text-sm">{label}</span>
      <span className={`font-medium ${strong ? 'text-lg text-gray-900' : 'text-gray-900'} ${isError ? 'text-red-600' : ''}`}>
        {value || "-"}
      </span>
    </div>
  );
}
