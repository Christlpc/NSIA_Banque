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
import { Loader2 } from "lucide-react";

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
        // Avoid update if data hasn't changed to prevent loops
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

  // Fonction utilitaire pour trouver un questionnaire existant
  const findExistingQuestionnaire = async (simId: string, simRef: string | null) => {
    // 1. Essai direct avec filtre simulation (maintenant via endpoint nesté)
    try {
      // On passe la référence si disponible pour aider la recherche
      const response = await questionnairesApi.getQuestionnaires(simId, simRef || undefined);
      if (response && response.length > 0) {
        // L'endpoint est déjà filtré par simulationId, donc le premier résultat devrait être bon
        // Mais on garde une vérif de sécurité si jamais
        return response[0];
      }
    } catch (e) { console.error("Erreur recherche par endpoint nesté", e); }

    return null;
  };

  const onSubmit = async (data: QuestionnaireFormData) => {
    // Mode Wizard : on passe juste les données au parent
    if (isWizardMode && onWizardSubmit) {
      // Conversion des types pour l'API
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

    // Définition en dehors du try pour accès dans le catch
    const questionnaireData: QuestionnaireMedical = {
      ...data,
      taille_cm: String(data.taille_cm),
      poids_kg: String(data.poids_kg),
      nb_cigarettes_jour: data.fumeur ? data.nb_cigarettes_jour : undefined,
    };

    try {
      let questionnaireId: number;

      // Tentative de récupération préalable
      let existing = await findExistingQuestionnaire(simulationId, simulationReference);

      if (existing) {
        // Mise à jour
        await questionnairesApi.updateQuestionnaire(simulationId, existing.id, questionnaireData);
        questionnaireId = existing.id;
      } else {
        // Création
        try {
          console.log("Creating questionnaire (MedicalForm) with payload:", questionnaireData);
          const created = await questionnairesApi.createQuestionnaire(simulationId, questionnaireData);
          questionnaireId = created.id;
        } catch (createError: any) {
          console.error("Error creating questionnaire (MedicalForm):", createError);
          // Gestion spécifique de l'erreur "Existe déjà"
          const errorData = createError?.response?.data;
          const errorString = JSON.stringify(errorData || {});

          if (createError?.response?.status === 400 &&
            (errorString.includes("existe déjà") || errorString.includes("already exists"))) {

            console.log("Questionnaire existant détecté lors de la création, tentative de récupération...");
            console.log("Searching with:", { simulationId, simulationReference });

            // On réessaie de le trouver
            existing = await findExistingQuestionnaire(simulationId, simulationReference);
            console.log("Found existing questionnaire:", existing);

            if (existing) {
              await questionnairesApi.updateQuestionnaire(simulationId, existing.id, questionnaireData);
              questionnaireId = existing.id;
            } else {
              throw new Error("Un questionnaire existe déjà pour cette simulation mais le système ne parvient pas à le récupérer. Veuillez contacter le support.");
            }
          } else {
            throw createError;
          }
        }
      }

      // 4. Appliquer à la simulation (Désactivé car cause 404 et probablement redondant)
      /*
      try {
        await questionnairesApi.appliquerASimulation(questionnaireId, simulationId);
      } catch (applyError: any) {
        console.warn("Erreur lors de l'application du questionnaire (non bloquant):", applyError);
      }
      */  // On continue car le questionnaire est créé et lié via le payload

      toast.success("Questionnaire soumis avec succès");
      router.push(`/simulations/${simulationId}`);
    } catch (newApiError: any) {
      console.error("Erreur API questionnaires:", newApiError);
      // Fallback sur l'ancienne API si nécessaire
      if (!JSON.stringify(newApiError).includes("existe déjà")) {
        try {
          await simulationApi.submitQuestionnaire(simulationId, questionnaireData);
          toast.success("Questionnaire soumis avec succès (API v1)");
          router.push(`/simulations/${simulationId}`);
        } catch (fallbackError: any) {
          toast.error(newApiError?.message || "Erreur lors de la soumission");
        }
      } else {
        toast.error(newApiError?.message || "Erreur: Le questionnaire existe déjà mais est introuvable.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Données physiques */}
      <Card>
        <CardHeader>
          <CardTitle>1. Données Physiques</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="taille_cm">Taille (cm) *</Label>
              <Input
                id="taille_cm"
                type="number"
                {...register("taille_cm", { valueAsNumber: true })}
                disabled={isSubmitting}
              />
              {errors.taille_cm && (
                <p className="text-sm text-red-600">{errors.taille_cm.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="poids_kg">Poids (kg) *</Label>
              <Input
                id="poids_kg"
                type="number"
                step="0.1"
                {...register("poids_kg", { valueAsNumber: true })}
                disabled={isSubmitting}
              />
              {errors.poids_kg && (
                <p className="text-sm text-red-600">{errors.poids_kg.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="tension_arterielle">Tension artérielle</Label>
              <Input
                id="tension_arterielle"
                {...register("tension_arterielle")}
                disabled={isSubmitting}
                placeholder="Ex: 12/8"
              />
            </div>
          </div>
          {scoreData && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                IMC: <span className="font-medium">{scoreData.imc.toFixed(1)}</span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Habitudes */}
      <Card>
        <CardHeader>
          <CardTitle>2. Habitudes de Vie</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="fumeur"
                {...register("fumeur")}
                disabled={isSubmitting}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="fumeur" className="cursor-pointer">
                Fumeur
              </Label>
            </div>
            {fumeur && (
              <div className="ml-6 space-y-2">
                <Label htmlFor="nb_cigarettes_jour">Nombre de cigarettes par jour</Label>
                <Input
                  id="nb_cigarettes_jour"
                  type="number"
                  {...register("nb_cigarettes_jour", { valueAsNumber: true })}
                  disabled={isSubmitting}
                />
              </div>
            )}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="consomme_alcool"
                {...register("consomme_alcool")}
                disabled={isSubmitting}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="consomme_alcool" className="cursor-pointer">
                Consommation d'alcool
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="pratique_sport"
                {...register("pratique_sport")}
                disabled={isSubmitting}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="pratique_sport" className="cursor-pointer">
                Pratique du sport régulièrement
              </Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="distractions">Distractions / Loisirs</Label>
              <Input
                id="distractions"
                {...register("distractions")}
                disabled={isSubmitting}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions médicales */}
      <Card>
        <CardHeader>
          <CardTitle>3. Antécédents Médicaux</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { id: "a_infirmite", label: "Avez-vous une infirmité ?" },
              { id: "malade_6_derniers_mois", label: "Avez-vous été malade au cours des 6 derniers mois ?" },
              { id: "souvent_fatigue", label: "Souffrez-vous de fatigue fréquente ?" },
              { id: "perte_poids_recente", label: "Avez-vous subi une perte de poids récente ?" },
              { id: "prise_poids_recente", label: "Avez-vous subi une prise de poids récente ?" },
              { id: "a_ganglions", label: "Avez-vous des ganglions ?" },
              { id: "fievre_persistante", label: "Avez-vous une fièvre persistante ?" },
              { id: "plaies_buccales", label: "Avez-vous des plaies buccales ?" },
              { id: "diarrhee_frequente", label: "Avez-vous des diarrhées fréquentes ?" },
              { id: "ballonnement", label: "Souffrez-vous de ballonnements ?" },
              { id: "oedemes_membres_inferieurs", label: "Avez-vous des œdèmes aux membres inférieurs ?" },
              { id: "essoufflement", label: "Souffrez-vous d'essoufflement ?" },
              { id: "a_eu_perfusion", label: "Avez-vous eu une perfusion ?" },
              { id: "a_eu_transfusion", label: "Avez-vous eu une transfusion ?" },
            ].map((question) => (
              <div key={question.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={question.id}
                  {...register(question.id as keyof QuestionnaireFormData)}
                  disabled={isSubmitting}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <Label htmlFor={question.id} className="cursor-pointer text-sm">
                  {question.label}
                </Label>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2">
            <Label htmlFor="infos_complementaires">Informations complémentaires</Label>
            <Input
              id="infos_complementaires"
              {...register("infos_complementaires")}
              disabled={isSubmitting}
            />
          </div>
        </CardContent>
      </Card>

      {/* Affichage du score */}
      {scoreData && (
        <RiskScoreDisplay
          scoreTotal={scoreData.scoreTotal}
          tauxSurprime={scoreData.tauxSurprime}
          categorieRisque={scoreData.categorieRisque}
        />
      )}

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/simulations/${simulationId}`)}
          disabled={isSubmitting}
        >
          Annuler
        </Button>
        <Button type="submit" disabled={isSubmitting || !scoreData}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Soumission...
            </>
          ) : (
            isWizardMode ? "Suivant" : "Soumettre le Questionnaire"
          )}
        </Button>
      </div>
    </form>
  );
}
