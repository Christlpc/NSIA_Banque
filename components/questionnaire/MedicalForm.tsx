"use client";

import { useState, useEffect } from "react";
import { useSafeRouter } from "@/lib/hooks/useSafeRouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RiskScoreDisplay } from "@/components/questionnaire/RiskScoreDisplay";
import { simulationApi } from "@/lib/api/simulations";
import { questionnairesApi } from "@/lib/api/simulations";
import { useSimulationStore } from "@/lib/store/simulationStore";
import { calculateIMC, getIMCScore, getTabacScore, getAlcoolScore, getAntecedentsScore, getTauxSurprime, getCategorieRisque } from "@/lib/utils/calculations";
import type { QuestionnaireMedical } from "@/types";
import toast from "react-hot-toast";
import { Loader2, ArrowRight, Activity, Heart, Ruler, Scale, AlertCircle } from "lucide-react";

const questionnaireSchema = z.object({
  taille_cm: z.number().min(100).max(250),
  poids_kg: z.number().min(30).max(200),
  tension_arterielle: z.string().optional(),
  fumeur: z.boolean(),
  nb_cigarettes_jour: z.number().min(0).optional(),
  consomme_alcool: z.boolean(),
  distractions: z.string().optional(),
  pratique_sport: z.boolean(),
  type_sport: z.string().optional(),
  a_infirmite: z.boolean(),
  malade_6_derniers_mois: z.boolean(),
  souvent_fatigue: z.boolean(),
  perte_poids_recente: z.boolean(),
  prise_poids_recente: z.boolean(),
  a_ganglions: z.boolean(),
  fievre_persistante: z.boolean(),
  plaies_buccales: z.boolean(),
  diarrhee_frequente: z.boolean(),
  ballonnement: z.boolean(),
  oedemes_membres_inferieurs: z.boolean(),
  essoufflement: z.boolean(),
  a_eu_perfusion: z.boolean(),
  a_eu_transfusion: z.boolean(),
  est_hypertendu: z.boolean().optional(),
  est_diabetique: z.boolean().optional(),
  infos_complementaires: z.string().optional(),
  commentaire_medical: z.string().optional(),
});

type QuestionnaireFormData = z.infer<typeof questionnaireSchema>;

interface MedicalFormProps {
  simulationId?: string;
  initialData?: any;
  onSubmit?: (data: QuestionnaireFormData) => void;
  isWizardMode?: boolean;
  simulationReference?: string; // Add optional prop
}

export function MedicalForm({ simulationId, initialData, onSubmit: onWizardSubmit, isWizardMode = false, simulationReference: propSimulationReference }: MedicalFormProps) {
  const router = useSafeRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scoreData, setScoreData] = useState<{
    imc: number;
    scoreTotal: number;
    tauxSurprime: number | string;
    categorieRisque: string;
  } | null>(null);

  const { fetchSimulation, currentSimulation } = useSimulationStore();
  const [simulationReference, setSimulationReference] = useState<string | null>(propSimulationReference || null);

  useEffect(() => {
    if (propSimulationReference) {
      setSimulationReference(propSimulationReference);
    }
  }, [propSimulationReference]);

  useEffect(() => {
    if (isWizardMode || !simulationId) return;

    const loadSimulation = async () => {
      if (currentSimulation && currentSimulation.id === simulationId) {
        setSimulationReference(currentSimulation.reference);
        return;
      }
      try {
        await fetchSimulation(simulationId);
      } catch (error) {
        console.error("Erreur récupération simulation:", error);
      }
    };
    loadSimulation();
  }, [simulationId, fetchSimulation, currentSimulation, isWizardMode]);

  useEffect(() => {
    if (isWizardMode) return;
    if (currentSimulation && currentSimulation.id === simulationId) {
      setSimulationReference(currentSimulation.reference);
    }
  }, [currentSimulation, simulationId, isWizardMode]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<QuestionnaireFormData>({
    resolver: zodResolver(questionnaireSchema),
    defaultValues: initialData || {
      fumeur: false,
      consomme_alcool: false,
      pratique_sport: false,
      a_infirmite: false,
      malade_6_derniers_mois: false,
      souvent_fatigue: false,
      perte_poids_recente: false,
      prise_poids_recente: false,
      a_ganglions: false,
      fievre_persistante: false,
      plaies_buccales: false,
      diarrhee_frequente: false,
      ballonnement: false,
      oedemes_membres_inferieurs: false,
      essoufflement: false,
      a_eu_perfusion: false,
      a_eu_transfusion: false,
      est_hypertendu: false,
      est_diabetique: false,
    },
  });

  const taille = watch("taille_cm");
  const poids = watch("poids_kg");
  const fumeur = watch("fumeur");
  const nbCigarettes = watch("nb_cigarettes_jour");
  const alcool = watch("consomme_alcool");
  const questionnaire = watch();

  // Calcul en temps réel du score
  useEffect(() => {
    if (taille && poids) {
      const imc = calculateIMC(poids, taille);
      const imcScore = getIMCScore(imc);
      const tabacScore = getTabacScore(fumeur, nbCigarettes);
      const alcoolScore = getAlcoolScore(alcool);
      const antecedentsScore = getAntecedentsScore(questionnaire as any);
      const scoreTotal = imcScore + tabacScore + alcoolScore + antecedentsScore;
      const tauxSurprime = getTauxSurprime(scoreTotal);
      const categorieRisque = getCategorieRisque(scoreTotal);

      setScoreData(prev => {
        if (prev &&
          prev.imc === imc &&
          prev.scoreTotal === scoreTotal &&
          prev.tauxSurprime === tauxSurprime &&
          prev.categorieRisque === categorieRisque) {
          return prev;
        }
        return {
          imc,
          scoreTotal,
          tauxSurprime,
          categorieRisque,
        };
      });
    }
  }, [taille, poids, fumeur, nbCigarettes, alcool, JSON.stringify(questionnaire)]);

  const findExistingQuestionnaire = async (simId: string, simRef: string | null) => {
    try {
      const response = await questionnairesApi.getQuestionnaires(simId, simRef || undefined);
      if (response && response.length > 0) {
        return response[0];
      }
    } catch (e) { console.error("Erreur recherche par endpoint nesté", e); }
    return null;
  };

  const onSubmit = async (data: QuestionnaireFormData) => {
    if (isWizardMode && onWizardSubmit) {
      const apiData = {
        ...data,
        taille_cm: String(data.taille_cm),
        poids_kg: String(data.poids_kg),
        nb_cigarettes_jour: data.fumeur ? data.nb_cigarettes_jour : undefined,
      };
      onWizardSubmit(apiData as any);
      return;
    }

    if (!simulationId) return;

    setIsSubmitting(true);

    const questionnaireData: QuestionnaireMedical = {
      ...data,
      taille_cm: String(data.taille_cm),
      poids_kg: String(data.poids_kg),
      nb_cigarettes_jour: data.fumeur ? data.nb_cigarettes_jour : undefined,
    };

    try {
      let questionnaireId: number;
      let existing = await findExistingQuestionnaire(simulationId, simulationReference);

      if (existing) {
        await questionnairesApi.updateQuestionnaire(simulationId, existing.id, questionnaireData);
        questionnaireId = existing.id;
      } else {
        try {
          const created = await questionnairesApi.createQuestionnaire(simulationId, questionnaireData);
          questionnaireId = created.id;
        } catch (createError: any) {
          const errorData = createError?.response?.data;
          const errorString = JSON.stringify(errorData || {});

          if (createError?.response?.status === 400 &&
            (errorString.includes("existe déjà") || errorString.includes("already exists"))) {

            existing = await findExistingQuestionnaire(simulationId, simulationReference);
            if (existing) {
              await questionnairesApi.updateQuestionnaire(simulationId, existing.id, questionnaireData);
              questionnaireId = existing.id;
            } else {
              throw new Error("Impossible de récupérer le questionnaire existant.");
            }
          } else {
            throw createError;
          }
        }
      }

      toast.success("Questionnaire soumis avec succès");
      router.push(`/simulations/${simulationId}`);
    } catch (error: any) {
      console.error("Erreur soumission:", error);
      toast.error(error?.message || "Erreur lors de la soumission");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper component for styled radio toggle
  const YesNoToggle = ({ id, label, value, onChange }: { id: string, label: string, value: boolean, onChange: (v: boolean) => void }) => (
    <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors">
      <Label htmlFor={id} className="text-sm font-medium text-gray-700 flex-1 cursor-pointer mr-4 leading-relaxed">
        {label}
      </Label>
      <div className="flex bg-gray-100 p-1 rounded-lg shrink-0">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${value
            ? "bg-white text-blue-600 shadow-sm"
            : "text-gray-500 hover:text-gray-700"
            }`}
        >
          Oui
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${!value
            ? "bg-white text-slate-600 shadow-sm"
            : "text-gray-500 hover:text-gray-700"
            }`}
        >
          Non
        </button>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in duration-500">
      {/* 1. Données Physiques */}
      <Card className="border-none shadow-md overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Ruler className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800">Données Physiques</h3>
        </div>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label className="text-gray-600 text-xs uppercase tracking-wider font-semibold">Taille (cm)</Label>
              <div className="relative">
                <Input
                  type="number"
                  {...register("taille_cm", { valueAsNumber: true })}
                  className="pl-10 h-12 text-lg font-medium"
                  placeholder="175"
                />
                <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              {errors.taille_cm && <p className="text-xs text-red-500 font-medium">{errors.taille_cm.message}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-gray-600 text-xs uppercase tracking-wider font-semibold">Poids (kg)</Label>
              <div className="relative">
                <Input
                  type="number"
                  step="0.1"
                  {...register("poids_kg", { valueAsNumber: true })}
                  className="pl-10 h-12 text-lg font-medium"
                  placeholder="70"
                />
                <Scale className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              {errors.poids_kg && <p className="text-xs text-red-500 font-medium">{errors.poids_kg.message}</p>}
            </div>

            {scoreData && (
              <div className="flex flex-col justify-end">
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-center justify-between">
                  <span className="text-sm text-blue-700 font-medium">IMC Calculé</span>
                  <span className={`text-xl font-bold ${getIMCColor(scoreData.imc)}`}>
                    {scoreData.imc.toFixed(1)}
                  </span>
                </div>
              </div>
            )}

            <div className="md:col-span-3 pt-2">
              <div className="space-y-2">
                <Label className="text-gray-600 text-xs uppercase tracking-wider font-semibold">Tension Artérielle</Label>
                <div className="relative">
                  <Input {...register("tension_arterielle")} placeholder="Ex: 12/8" className="pl-10 h-12 text-lg" />
                  <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Habitudes de Vie */}
      <Card className="border-none shadow-md overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center gap-3">
          <div className="bg-emerald-100 p-2 rounded-lg">
            <Activity className="w-5 h-5 text-emerald-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800">Habitudes de Vie</h3>
        </div>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <input type="hidden" {...register("fumeur")} />
              <YesNoToggle
                id="fumeur"
                label="Êtes-vous fumeur ?"
                value={watch("fumeur")}
                onChange={(v) => setValue("fumeur", v, { shouldValidate: true, shouldDirty: true })}
              />
              {watch("fumeur") && (
                <div className="ml-2 pl-4 border-l-2 border-slate-200 animate-in slide-in-from-left-2 duration-300">
                  <Label className="text-xs text-gray-500 mb-1.5 block">Cigarettes / jour</Label>
                  <Input
                    type="number"
                    {...register("nb_cigarettes_jour", { valueAsNumber: true })}
                    className="h-9 w-32"
                  />
                </div>
              )}
            </div>

            <input type="hidden" {...register("consomme_alcool")} />
            <YesNoToggle
              id="consomme_alcool"
              label="Consommez-vous de l'alcool ?"
              value={watch("consomme_alcool")}
              onChange={(v) => setValue("consomme_alcool", v, { shouldValidate: true, shouldDirty: true })}
            />

            <input type="hidden" {...register("pratique_sport")} />
            <YesNoToggle
              id="pratique_sport"
              label="Pratiquez-vous une activité sportive ?"
              value={watch("pratique_sport")}
              onChange={(v) => setValue("pratique_sport", v, { shouldValidate: true, shouldDirty: true })}
            />

            {watch("pratique_sport") && (
              <div className="space-y-1 animate-in fade-in">
                <Label className="text-xs text-gray-500">Type de sport</Label>
                <Input
                  {...register("type_sport")}
                  placeholder="Ex: Course à pied, Natation..."
                  className="h-10"
                />
              </div>
            )}

            <div className="md:col-span-2 mt-2">
              <Label className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2 block">Loisirs & Distractions</Label>
              <Input {...register("distractions")} placeholder="Ex: Jardinage, Lecture, Voyages..." />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Antécédents Médicaux */}
      <Card className="border-none shadow-md overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center gap-3">
          <div className="bg-rose-100 p-2 rounded-lg">
            <Heart className="w-5 h-5 text-rose-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800">Antécédents Médicaux</h3>
        </div>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
            {[
              { id: "a_infirmite", label: "1. Souffrez-vous d'infirmité ou de malformation ?" },
              { id: "malade_6_derniers_mois", label: "2. Avez-vous été malade au cours des 6 derniers mois ?" },
              { id: "souvent_fatigue", label: "3. Vous sentez-vous fatigué(e) fréquemment ?" },
              { id: "perte_poids_recente", label: "4a. Avez-vous constaté une perte de poids importante ?" },
              { id: "prise_poids_recente", label: "4b. Avez-vous constaté une prise de poids importante ?" },
              { id: "a_ganglions", label: "5. Avez-vous des ganglions, furoncles ou abcès ?" },
              { id: "fievre_persistante", label: "6. Avez-vous une fièvre persistante ?" },
              { id: "plaies_buccales", label: "7. Avez-vous des plaies buccales (bouche) ?" },
              { id: "diarrhee_frequente", label: "8. Souffrez-vous de diarrhée fréquente ?" },
              { id: "ballonnement", label: "9. Avez-vous des ballonnements abdominaux ?" },
              { id: "oedemes_membres_inferieurs", label: "10. Avez-vous des œdèmes des membres inférieurs (OMI) ?" },
              { id: "essoufflement", label: "11. Êtes-vous facilement essoufflé(e) ?" },
              { id: "a_eu_perfusion", label: "12. Avez-vous déjà subi une perfusion ?" },
              { id: "a_eu_transfusion", label: "13. Avez-vous déjà reçu une transfusion sanguine ?" },
              { id: "est_hypertendu", label: "14. Souffrez-vous d'hypertension artérielle ?" },
              { id: "est_diabetique", label: "15. Souffrez-vous de diabète ?" },
            ].map((question) => (
              <div key={question.id}>
                <input type="hidden" {...register(question.id as keyof QuestionnaireFormData)} />
                <YesNoToggle
                  id={question.id}
                  label={question.label}
                  value={watch(question.id as keyof QuestionnaireFormData) as boolean}
                  onChange={(v) => setValue(question.id as keyof QuestionnaireFormData, v, { shouldValidate: true, shouldDirty: true })}
                />
              </div>
            ))}
          </div>

          <div className="mt-8 space-y-3">
            <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              Informations Complémentaires
            </Label>
            <div className="relative">
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                {...register("infos_complementaires")}
                placeholder="Précisez ici tout antécédent ou détail médical important..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Affichage du score */}
      {scoreData && (
        <div className="animate-in slide-in-from-bottom-4 duration-500">
          <RiskScoreDisplay
            scoreTotal={scoreData.scoreTotal}
            tauxSurprime={scoreData.tauxSurprime}
            categorieRisque={scoreData.categorieRisque}
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <Button
          type="button"
          variant="ghost"
          className="text-gray-500 hover:text-gray-800"
          onClick={() => router.push(`/simulations/${simulationId}`)}
          disabled={isSubmitting}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || !scoreData}
          className="bg-blue-600 hover:bg-blue-700 text-white min-w-[200px] shadow-lg shadow-blue-200"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Traitement...
            </>
          ) : (
            isWizardMode ? (
              <>
                Suivant <ArrowRight className="ml-2 w-4 h-4" />
              </>
            ) : (
              <>
                Enregistrer le Questionnaire
              </>
            )
          )}
        </Button>
      </div>
    </form>
  );
}

// Helper to colorize IMC
function getIMCColor(imc: number) {
  if (imc < 18.5) return "text-amber-500";
  if (imc < 25) return "text-emerald-500";
  if (imc < 30) return "text-amber-600";
  return "text-red-600";
}
