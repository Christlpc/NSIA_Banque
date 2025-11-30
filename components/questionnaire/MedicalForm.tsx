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
import { calculateIMC, getIMCScore, getTabacScore, getAlcoolScore, getAntecedentsScore, getTauxSurprime, getCategorieRisque } from "@/lib/utils/calculations";
import type { QuestionnaireMedical } from "@/types";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

const questionnaireSchema = z.object({
  taille_cm: z.number().min(100).max(250),
  poids_kg: z.number().min(30).max(200),
  fumeur: z.boolean(),
  nb_cigarettes_jour: z.number().min(0).optional(),
  alcool: z.boolean(),
  sport: z.boolean(),
  a_infirmite: z.boolean(),
  malade_6mois: z.boolean(),
  fatigue_frequente: z.boolean(),
  perte_poids: z.boolean(),
  douleur_poitrine: z.boolean(),
  essoufflement: z.boolean(),
  hypertension: z.boolean(),
  diabete: z.boolean(),
  maladie_cardiaque: z.boolean(),
  maladie_respiratoire: z.boolean(),
  maladie_renale: z.boolean(),
  maladie_hepatique: z.boolean(),
  cancer: z.boolean(),
  autre_maladie: z.boolean(),
});

type QuestionnaireFormData = z.infer<typeof questionnaireSchema>;

interface MedicalFormProps {
  simulationId: string;
}

export function MedicalForm({ simulationId }: MedicalFormProps) {
  const router = useSafeRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scoreData, setScoreData] = useState<{
    imc: number;
    scoreTotal: number;
    tauxSurprime: number;
    categorieRisque: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<QuestionnaireFormData>({
    resolver: zodResolver(questionnaireSchema),
    defaultValues: {
      fumeur: false,
      alcool: false,
      sport: false,
      a_infirmite: false,
      malade_6mois: false,
      fatigue_frequente: false,
      perte_poids: false,
      douleur_poitrine: false,
      essoufflement: false,
      hypertension: false,
      diabete: false,
      maladie_cardiaque: false,
      maladie_respiratoire: false,
      maladie_renale: false,
      maladie_hepatique: false,
      cancer: false,
      autre_maladie: false,
    },
  });

  const taille = watch("taille_cm");
  const poids = watch("poids_kg");
  const fumeur = watch("fumeur");
  const nbCigarettes = watch("nb_cigarettes_jour");
  const alcool = watch("alcool");
  const questionnaire = watch();

  // Calcul en temps réel du score
  useEffect(() => {
    if (taille && poids) {
      const imc = calculateIMC(poids, taille);
      const imcScore = getIMCScore(imc);
      const tabacScore = getTabacScore(fumeur, nbCigarettes);
      const alcoolScore = getAlcoolScore(alcool);
      const antecedentsScore = getAntecedentsScore(questionnaire);
      const scoreTotal = imcScore + tabacScore + alcoolScore + antecedentsScore;
      const tauxSurprime = getTauxSurprime(scoreTotal);
      const categorieRisque = getCategorieRisque(scoreTotal);

      setScoreData({
        imc,
        scoreTotal,
        tauxSurprime,
        categorieRisque,
      });
    }
  }, [taille, poids, fumeur, nbCigarettes, alcool, questionnaire]);

  const onSubmit = async (data: QuestionnaireFormData) => {
    setIsSubmitting(true);
    try {
      const questionnaireData: QuestionnaireMedical = {
        taille_cm: data.taille_cm,
        poids_kg: data.poids_kg,
        fumeur: data.fumeur,
        nb_cigarettes_jour: data.fumeur ? data.nb_cigarettes_jour : undefined,
        alcool: data.alcool,
        sport: data.sport,
        a_infirmite: data.a_infirmite,
        malade_6mois: data.malade_6mois,
        fatigue_frequente: data.fatigue_frequente,
        perte_poids: data.perte_poids,
        douleur_poitrine: data.douleur_poitrine,
        essoufflement: data.essoufflement,
        hypertension: data.hypertension,
        diabete: data.diabete,
        maladie_cardiaque: data.maladie_cardiaque,
        maladie_respiratoire: data.maladie_respiratoire,
        maladie_renale: data.maladie_renale,
        maladie_hepatique: data.maladie_hepatique,
        cancer: data.cancer,
        autre_maladie: data.autre_maladie,
      };

      // Utiliser la nouvelle API questionnaires
      try {
        const created = await questionnairesApi.createQuestionnaire({
          ...questionnaireData,
          simulation: simulationId,
        });

        // Appliquer le questionnaire à la simulation
        await questionnairesApi.appliquerASimulation(created.id, simulationId);

        toast.success("Questionnaire soumis avec succès");
        router.push(`/simulations/${simulationId}`);
      } catch (newApiError: any) {
        // Fallback sur l'ancienne API si nécessaire
        await simulationApi.submitQuestionnaire(simulationId, questionnaireData);
        toast.success("Questionnaire soumis avec succès");
        router.push(`/simulations/${simulationId}`);
      }
    } catch (error: any) {
      toast.error(error?.message || "Erreur lors de la soumission");
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
                id="alcool"
                {...register("alcool")}
                disabled={isSubmitting}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="alcool" className="cursor-pointer">
                Consommation d'alcool
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="sport"
                {...register("sport")}
                disabled={isSubmitting}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="sport" className="cursor-pointer">
                Pratique du sport régulièrement
              </Label>
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
              { id: "malade_6mois", label: "Avez-vous été malade au cours des 6 derniers mois ?" },
              { id: "fatigue_frequente", label: "Souffrez-vous de fatigue fréquente ?" },
              { id: "perte_poids", label: "Avez-vous subi une perte de poids importante ?" },
              { id: "douleur_poitrine", label: "Avez-vous des douleurs à la poitrine ?" },
              { id: "essoufflement", label: "Souffrez-vous d'essoufflement ?" },
              { id: "hypertension", label: "Avez-vous de l'hypertension ?" },
              { id: "diabete", label: "Avez-vous du diabète ?" },
              { id: "maladie_cardiaque", label: "Avez-vous une maladie cardiaque ?" },
              { id: "maladie_respiratoire", label: "Avez-vous une maladie respiratoire ?" },
              { id: "maladie_renale", label: "Avez-vous une maladie rénale ?" },
              { id: "maladie_hepatique", label: "Avez-vous une maladie hépatique ?" },
              { id: "cancer", label: "Avez-vous ou avez-vous eu un cancer ?" },
              { id: "autre_maladie", label: "Avez-vous une autre maladie ?" },
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
            "Soumettre le Questionnaire"
          )}
        </Button>
      </div>
    </form>
  );
}

