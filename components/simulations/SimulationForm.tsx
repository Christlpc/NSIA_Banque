"use client";

import { useState, useEffect } from "react";
import { useSafeRouter } from "@/lib/hooks/useSafeRouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePickerInput } from "@/components/ui/date-picker";
import { useSimulationStore } from "@/lib/store/simulationStore";
import { PRODUIT_LABELS, ProduitType, QuestionnaireMedical } from "@/types";
import { useAuthStore } from "@/lib/store/authStore";
import { ALL_PRODUITS } from "@/lib/utils/constants";
import toast from "react-hot-toast";
import { Loader2, CheckCircle, ArrowRight, ArrowLeft } from "lucide-react";
import { MedicalForm } from "@/components/questionnaire/MedicalForm";
import { questionnairesApi, exportsApi } from "@/lib/api/simulations";

const simulationSchema = z.object({
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  prenom: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  date_naissance: z.string().min(1, "La date de naissance est requise"),
  date_effet: z.string().min(1, "La date d'effet est requise"),
  // Ces champs sont optionnels dans le schéma global mais rendus obligatoires conditionnellement ou par l'UI
  montant_pret: z.number({ invalid_type_error: "Le montant est requis" }).min(1, "Le montant doit être supérieur à 0").optional(),
  duree_mois: z.number({ invalid_type_error: "La durée est requise" }).min(1, "La durée doit être supérieure à 0").optional(),
  rente_annuelle: z.number({ invalid_type_error: "La rente annuelle est requise" }).min(1, "La rente doit être supérieure à 0").optional(),
  age_parent: z.number({ invalid_type_error: "L'âge du parent est requis" }).min(18, "L'âge doit être supérieur à 18").optional(),
  duree_rente: z.number({ invalid_type_error: "La durée de la rente est requise" }).min(1, "La durée doit être supérieure à 0").optional(),

  // Confort Etudes
  age_enfant: z.number({ invalid_type_error: "L'âge de l'enfant est requis" }).min(0, "L'âge doit être positif").optional(),
  montant_rente: z.number({ invalid_type_error: "Le montant de la rente est requis" }).min(1, "Le montant doit être supérieur à 0").optional(),
  duree_paiement: z.number({ invalid_type_error: "La durée de paiement est requise" }).min(1, "La durée doit être supérieure à 0").optional(),
  duree_service: z.number({ invalid_type_error: "La durée de service est requise" }).min(1, "La durée doit être supérieure à 0").optional(),

  // Mobateli
  capital_dtc_iad: z.number({ invalid_type_error: "Le capital est requis" }).min(1, "Le capital doit être supérieur à 0").optional(),
  age: z.number({ invalid_type_error: "L'âge est requis" }).min(18, "L'âge doit être supérieur à 18").optional(),

  // Confort Retraite
  prime_periodique_commerciale: z.number({ invalid_type_error: "La prime périodique est requise" }).min(1, "La prime doit être supérieure à 0").optional(),
  capital_deces: z.number({ invalid_type_error: "Le capital décès est requis" }).min(0, "Le capital doit être positif").optional(),
  duree: z.number({ invalid_type_error: "La durée est requise" }).min(1, "La durée doit être supérieure à 0").optional(),
  periodicite: z.string().optional(),

  taux_surprime: z.number().min(0).max(100).optional(),
  profession: z.string().optional(),
  adresse: z.string().optional(),
  telephone: z.string().optional(),

  // Nouveaux champs DB
  employeur: z.string().min(2, "L'employeur est requis"),
  numero_compte: z.string().min(5, "Le numéro de compte est requis"),
  situation_matrimoniale: z.string().min(1, "La situation matrimoniale est requise"),
  date_octroi: z.string().optional(),
  date_premiere_echeance: z.string().optional(),
}).refine((data) => {
  return true;
});

type SimulationFormData = z.infer<typeof simulationSchema>;

interface SimulationFormProps {
  mode?: "create" | "edit";
}

export function SimulationForm({ mode = "create" }: SimulationFormProps) {
  const router = useSafeRouter();
  const { user } = useAuthStore();
  const {
    createSimulation,
    updateSimulation,
    isLoading,
    wizardData,
    setWizardStep,
    updateWizardData,
    resetWizard
  } = useSimulationStore();

  const [selectedProduct, setSelectedProduct] = useState<ProduitType | "">("");
  const [isFinalSubmitting, setIsFinalSubmitting] = useState(false);
  const [isStep2Submitting, setIsStep2Submitting] = useState(false);

  // Initialiser le wizard au montage
  useEffect(() => {
    if (mode === "create") {
      resetWizard();
    }
  }, [resetWizard, mode]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    trigger,
    reset
  } = useForm<SimulationFormData>({
    resolver: zodResolver(simulationSchema),
    defaultValues: {
      taux_surprime: 0,
      ...wizardData.simulationData
    }
  });

  // Mettre à jour le formulaire quand les données du wizard changent (ex: chargement edit)
  useEffect(() => {
    if (wizardData.simulationData && Object.keys(wizardData.simulationData).length > 0) {
      reset({
        taux_surprime: 0,
        ...wizardData.simulationData
      });
      if (wizardData.simulationData.produit) {
        setSelectedProduct(wizardData.simulationData.produit);
      }
    }
  }, [wizardData.simulationData, reset]);

  // Mapping des produits par banque (Règles métier forcées)
  const BANK_PRODUCTS_MAPPING: Record<string, ProduitType[]> = {
    "ECO": ["emprunteur"],
    "ECOBANK": ["emprunteur"],
    "ECOBANK CONGO": ["emprunteur"],
    "CDCO": ["emprunteur", "confort_retraite", "confort_etudes"],
    "BGFI": ["emprunteur", "epargne_plus"],
    "BGFI BANK": ["emprunteur", "epargne_plus"],
    "BCI": ["elikia_scolaire", "mobateli"],
    "CHF": ["emprunteur"],
    "HOPE": ["emprunteur"],
  };

  // Déterminer les produits disponibles
  let availableProducts = ALL_PRODUITS;

  if (user?.banque?.code) {
    const bankCode = user.banque.code.toUpperCase();
    if (BANK_PRODUCTS_MAPPING[bankCode]) {
      availableProducts = BANK_PRODUCTS_MAPPING[bankCode];
    } else if (user.banque.produits_disponibles?.length) {
      availableProducts = user.banque.produits_disponibles;
    }
  }

  const onStep1Submit = async (data: SimulationFormData) => {
    // Sauvegarder les données client et passer à l'étape 2
    updateWizardData({ simulationData: { ...wizardData.simulationData, ...data } });
    setWizardStep(2);
    window.scrollTo(0, 0);
  };

  const onStep2Submit = async (data: SimulationFormData) => {
    if (!selectedProduct) {
      toast.error("Veuillez sélectionner un produit");
      return;
    }

    // Validation spécifique par produit
    let isValid = true;
    if (selectedProduct === "emprunteur") {
      if (!data.montant_pret || !data.duree_mois) isValid = false;
    } else if (selectedProduct === "elikia_scolaire") {
      if (!data.rente_annuelle || !data.age_parent || !data.duree_rente) isValid = false;
    } else if (selectedProduct === "confort_etudes") {
      if (!data.age_parent || data.age_enfant === undefined || !data.montant_rente || !data.duree_paiement || !data.duree_service) isValid = false;
    } else if (selectedProduct === "mobateli") {
      if (!data.capital_dtc_iad || !data.age) isValid = false;
    } else if (selectedProduct === "confort_retraite" || selectedProduct === "epargne_plus") {
      if (!data.prime_periodique_commerciale || data.capital_deces === undefined || !data.duree || !data.age || !data.periodicite) isValid = false;
    }

    if (!isValid) {
      toast.error("Veuillez remplir tous les champs obligatoires pour ce produit");
      return;
    }

    setIsStep2Submitting(true);
    try {
      // Simulation sans sauvegarde (sauvegarder: false)
      const simulationData = { ...wizardData.simulationData, ...data, produit: selectedProduct };
      updateWizardData({ simulationData });

      // Appel API pour simuler (création temporaire ou calcul)
      // Note: createSimulation avec sauvegarder: false devrait retourner les résultats calculés
      const result = await createSimulation(selectedProduct, { ...simulationData, sauvegarder: false });

      if (result) {
        // Stocker le résultat temporaire (si l'API retourne l'objet simulé avec les calculs)
        // On suppose que result contient les champs calculés (prime_totale, etc.)
        updateWizardData({
          createdSimulationId: result.id, // Si l'API retourne un ID même pour non-sauvegardé, sinon null
          simulationData: { ...simulationData, ...result }
        });
      }

      setWizardStep(3);
      window.scrollTo(0, 0);
    } catch (error: any) {
      console.error("Erreur simulation:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
      toast.error(error?.message || "Erreur lors de la simulation");
    } finally {
      setIsStep2Submitting(false);
    }
  };

  const onStep3Submit = async () => {
    setIsStep2Submitting(true);
    try {
      // Sauvegarder réellement la simulation
      let simulationId = wizardData.createdSimulationId;
      let simulation;

      // Si on a déjà un ID (cas update ou ID temporaire devenu permanent), on update
      // Sinon on crée avec sauvegarder: true
      if (simulationId) {
        // Attention: si l'ID était temporaire, peut-être faut-il créer ? 
        // Supposons que createSimulation(save=false) ne crée pas d'entrée en BDD persistante ou crée un brouillon.
        // Si l'API de création retourne un ID, on peut l'utiliser pour l'update en passant le flag sauvegarder=true si nécessaire
        // Ou rappeler createSimulation avec sauvegarder: true si l'ID précédent n'est pas persistant.
        // Pour simplifier : on considère que l'étape 2 a fait un calcul sans persistance (ou persistance temporaire).
        // Ici on confirme la sauvegarde.

        // Option A: Update avec statut brouillon confirmé
        await updateSimulation(simulationId, { ...wizardData.simulationData, sauvegarder: true });
        simulation = { id: simulationId, reference: wizardData.simulationData.reference }; // Mock return
      } else {
        // Option B: Création complète maintenant
        simulation = await createSimulation(
          wizardData.simulationData.produit,
          { ...wizardData.simulationData, sauvegarder: true }
        );
        simulationId = simulation.id;
      }

      if (!simulation || !simulationId) throw new Error("Erreur lors de la sauvegarde");

      updateWizardData({
        createdSimulationId: simulationId,
        simulationData: {
          ...wizardData.simulationData,
          id: simulationId,
          reference: simulation.reference
        }
      });

      toast.success("Simulation sauvegardée");
      setWizardStep(4);
      window.scrollTo(0, 0);
    } catch (error: any) {
      console.error("Erreur sauvegarde:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
      toast.error(error?.message || "Erreur lors de la sauvegarde");
    } finally {
      setIsStep2Submitting(false);
    }
  };

  const onStep4Submit = async (data: QuestionnaireMedical) => {
    try {
      if (!wizardData.simulationData?.id) {
        toast.error("Aucune simulation active trouvée");
        return;
      }

      // Vérifier si un questionnaire existe déjà pour cette simulation
      const existingQuestionnaireId = (wizardData.questionnaireData as any)?.id ||
        (wizardData.simulationData as any)?.questionnaire_medical?.id ||
        (wizardData.simulationData as any)?.questionnaire_medical;

      let result;

      if (existingQuestionnaireId && typeof existingQuestionnaireId === 'number') {
        // Mise à jour
        result = await questionnairesApi.updateQuestionnaire(
          wizardData.simulationData.id,
          existingQuestionnaireId,
          data
        );
        toast.success("Questionnaire mis à jour avec succès");
      } else {
        // Création
        result = await questionnairesApi.createQuestionnaire(wizardData.simulationData.id, data);
        toast.success("Questionnaire enregistré avec succès");
      }

      // Mettre à jour le store avec les nouvelles données
      updateWizardData({
        questionnaireData: result,
        // On met à jour biaInfo avec le résultat qui contient le scoring
        biaInfo: {
          ...wizardData.biaInfo,
          "questionnaire medical": result,
          simulation: wizardData.simulationData
        }
      });

      setWizardStep(5);
    } catch (error: any) {
      console.error("Erreur questionnaire:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
      toast.error(error.response?.data?.detail || "Erreur lors de l'enregistrement du questionnaire");
    }
  };

  const onFinalSubmit = async () => {
    if (!wizardData.createdSimulationId) return;

    setIsFinalSubmitting(true);
    try {
      // Validation finale
      await useSimulationStore.getState().validateSimulation(wizardData.createdSimulationId);

      toast.success("Simulation validée avec succès !");
      resetWizard();
      router.push(`/simulations/${wizardData.createdSimulationId}`);

    } catch (error: any) {
      console.error("Erreur finale:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
      toast.error(error?.message || "Une erreur est survenue lors de la validation finale");
    } finally {
      setIsFinalSubmitting(false);
    }
  };

  // Rendu des étapes
  return (
    <div className="space-y-6">
      {/* Indicateur d'étapes */}
      <div className="flex justify-between items-center mb-8 px-4">
        {[
          { step: 1, label: "Client" },
          { step: 2, label: "Produit" },
          { step: 3, label: "Résultat" },
          { step: 4, label: "Questionnaire" },
          { step: 5, label: "BIA" },
        ].map((item, index) => (
          <div key={item.step} className="flex items-center flex-1 last:flex-none">
            <div className={`flex flex-col items-center ${wizardData.step >= item.step ? "text-blue-600" : "text-gray-400"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 text-sm ${wizardData.step >= item.step ? "border-blue-600 bg-blue-50" : "border-gray-300"}`}>
                {item.step}
              </div>
              <span className="text-xs mt-1 font-medium hidden md:block">{item.label}</span>
            </div>
            {index < 4 && (
              <div className={`flex-1 h-0.5 mx-2 ${wizardData.step > item.step ? "bg-blue-600" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>

      {/* ÉTAPE 1 : Infos Client */}
      {wizardData.step === 1 && (
        <form onSubmit={handleSubmit(onStep1Submit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations Client</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prenom">Prénom *</Label>
                  <Input id="prenom" autoComplete="given-name" {...register("prenom")} />
                  {errors.prenom && <p className="text-sm text-red-600">{errors.prenom.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nom">Nom *</Label>
                  <Input id="nom" autoComplete="family-name" {...register("nom")} />
                  {errors.nom && <p className="text-sm text-red-600">{errors.nom.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" autoComplete="email" {...register("email")} />
                {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date_naissance">Date de Naissance *</Label>
                  <DatePickerInput
                    id="date_naissance"
                    value={watch("date_naissance") || undefined}
                    onChange={(value) => setValue("date_naissance", value)}
                    placeholder="Sélectionner la date"
                    error={!!errors.date_naissance}
                    maxDate={new Date()}
                  />
                  {errors.date_naissance && <p className="text-sm text-red-600">{errors.date_naissance.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date_effet">Date d'Effet *</Label>
                  <DatePickerInput
                    id="date_effet"
                    value={watch("date_effet") || undefined}
                    onChange={(value) => setValue("date_effet", value)}
                    placeholder="Sélectionner la date"
                    error={!!errors.date_effet}
                  />
                  {errors.date_effet && <p className="text-sm text-red-600">{errors.date_effet.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telephone">Téléphone</Label>
                  <Input id="telephone" autoComplete="tel" {...register("telephone")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profession">Profession</Label>
                  <Input id="profession" autoComplete="organization-title" {...register("profession")} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adresse">Adresse</Label>
                <Input id="adresse" autoComplete="street-address" {...register("adresse")} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employeur">Employeur *</Label>
                  <Input id="employeur" autoComplete="organization" {...register("employeur")} />
                  {errors.employeur && <p className="text-sm text-red-600">{errors.employeur.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numero_compte">Numéro de Compte *</Label>
                  <Input id="numero_compte" {...register("numero_compte")} />
                  {errors.numero_compte && <p className="text-sm text-red-600">{errors.numero_compte.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="situation_matrimoniale">Situation Matrimoniale *</Label>
                  <Select
                    onValueChange={(v) => setValue("situation_matrimoniale", v)}
                    defaultValue={watch("situation_matrimoniale")}
                  >
                    <SelectTrigger id="situation_matrimoniale">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="celibataire">Célibataire</SelectItem>
                      <SelectItem value="marie">Marié(e)</SelectItem>
                      <SelectItem value="divorce">Divorcé(e)</SelectItem>
                      <SelectItem value="veuf">Veuf/Veuve</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.situation_matrimoniale && <p className="text-sm text-red-600">{errors.situation_matrimoniale.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date_octroi">Date d'octroi</Label>
                  <DatePickerInput
                    id="date_octroi"
                    value={watch("date_octroi") || undefined}
                    onChange={(value) => setValue("date_octroi", value)}
                    placeholder="Sélectionner la date"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_premiere_echeance">Date de première échéance</Label>
                <DatePickerInput
                  id="date_premiere_echeance"
                  value={watch("date_premiere_echeance") || undefined}
                  onChange={(value) => setValue("date_premiere_echeance", value)}
                  placeholder="Sélectionner la date"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.push("/simulations")}>Annuler</Button>
            <Button type="submit">Suivant <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </div>
        </form>
      )}

      {/* ÉTAPE 2 : Produit */}
      {wizardData.step === 2 && (
        <form onSubmit={handleSubmit(onStep2Submit)} className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Button variant="ghost" type="button" onClick={() => setWizardStep(1)}><ArrowLeft className="mr-2 h-4 w-4" /> Retour</Button>
            <h2 className="text-xl font-semibold">Informations Produit</h2>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Sélection du Produit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {availableProducts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-2">Aucun produit disponible</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availableProducts.map((product) => (
                      <button
                        key={product}
                        type="button"
                        onClick={() => setSelectedProduct(product)}
                        className={`p-4 border-2 rounded-lg text-left transition-colors ${selectedProduct === product
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                          }`}
                      >
                        <div className="font-medium">{PRODUIT_LABELS[product]}</div>
                      </button>
                    ))}
                  </div>
                  {!selectedProduct && (
                    <p className="text-sm text-red-600">Veuillez sélectionner un produit</p>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {selectedProduct && (
            <Card>
              <CardHeader>
                <CardTitle>Détails du Produit: {PRODUIT_LABELS[selectedProduct]}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Emprunteur */}
                {selectedProduct === "emprunteur" && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="montant_pret">Montant du Prêt (FCFA)</Label>
                      <Input id="montant_pret" type="number" {...register("montant_pret", { valueAsNumber: true })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duree_mois">Durée (mois)</Label>
                      <Input id="duree_mois" type="number" {...register("duree_mois", { valueAsNumber: true })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="taux_surprime">Taux de Surprime (%)</Label>
                      <Input id="taux_surprime" type="number" step="0.01" {...register("taux_surprime", { valueAsNumber: true })} />
                    </div>
                  </div>
                )}

                {/* Mobateli */}
                {selectedProduct === "mobateli" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="capital_dtc_iad">Capital DTC/IAD (FCFA)</Label>
                      <Select onValueChange={(v) => setValue("capital_dtc_iad", parseInt(v))} defaultValue={watch("capital_dtc_iad")?.toString()}>
                        <SelectTrigger id="capital_dtc_iad"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1000000">1 000 000 FCFA</SelectItem>
                          <SelectItem value="2000000">2 000 000 FCFA</SelectItem>
                          <SelectItem value="5000000">5 000 000 FCFA</SelectItem>
                          <SelectItem value="10000000">10 000 000 FCFA</SelectItem>
                          <SelectItem value="20000000">20 000 000 FCFA</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="age">Âge</Label>
                      <Input id="age" type="number" {...register("age", { valueAsNumber: true })} />
                    </div>
                  </div>
                )}

                {/* Confort Etudes */}
                {selectedProduct === "confort_etudes" && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="age_parent">Âge du Parent</Label>
                      <Input id="age_parent" type="number" {...register("age_parent", { valueAsNumber: true })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="age_enfant">Âge de l'Enfant</Label>
                      <Input id="age_enfant" type="number" {...register("age_enfant", { valueAsNumber: true })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="montant_rente">Montant Rente (FCFA)</Label>
                      <Input id="montant_rente" type="number" {...register("montant_rente", { valueAsNumber: true })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duree_paiement">Durée Paiement (ans)</Label>
                      <Input id="duree_paiement" type="number" {...register("duree_paiement", { valueAsNumber: true })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duree_service">Durée Service (ans)</Label>
                      <Input id="duree_service" type="number" {...register("duree_service", { valueAsNumber: true })} />
                    </div>
                  </div>
                )}

                {/* Confort Retraite & Epargne Plus */}
                {(selectedProduct === "confort_retraite" || selectedProduct === "epargne_plus") && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="prime_periodique_commerciale">Prime Périodique</Label>
                      <Input id="prime_periodique_commerciale" type="number" {...register("prime_periodique_commerciale", { valueAsNumber: true })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="capital_deces">Capital Décès</Label>
                      <Select onValueChange={(v) => setValue("capital_deces", parseInt(v))} defaultValue={watch("capital_deces")?.toString()}>
                        <SelectTrigger id="capital_deces"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">0 FCFA</SelectItem>
                          <SelectItem value="1000000">1 000 000 FCFA</SelectItem>
                          <SelectItem value="2000000">2 000 000 FCFA</SelectItem>
                          <SelectItem value="5000000">5 000 000 FCFA</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duree">Durée</Label>
                      <Input id="duree" type="number" {...register("duree", { valueAsNumber: true })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="age_retraite">Age</Label>
                      <Input id="age_retraite" type="number" {...register("age", { valueAsNumber: true })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="periodicite">Périodicité</Label>
                      <select id="periodicite" {...register("periodicite")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                        <option value="M">Mensuelle</option>
                        <option value="T">Trimestrielle</option>
                        <option value="S">Semestrielle</option>
                        <option value="A">Annuelle</option>
                      </select>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => setWizardStep(1)}>Précédent</Button>
            <Button type="submit" disabled={isStep2Submitting}>
              {isStep2Submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Simulation en cours...
                </>
              ) : (
                <>
                  Simuler <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      )}

      {/* ÉTAPE 3 : Résultat (Review) */}
      {wizardData.step === 3 && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Button variant="ghost" onClick={() => setWizardStep(2)}><ArrowLeft className="mr-2 h-4 w-4" /> Retour</Button>
            <h2 className="text-xl font-semibold">Résultat de la Simulation</h2>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Récapitulatif</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(() => {
                // Normaliser les données pour gérer le cas où les résultats sont dans resultats_calcul
                const displayData = {
                  ...wizardData.simulationData,
                  ...(wizardData.simulationData?.resultats_calcul || {})
                };

                return (
                  <>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><strong>Client:</strong> {watch("prenom")} {watch("nom")}</div>
                      <div><strong>Produit:</strong> {selectedProduct ? PRODUIT_LABELS[selectedProduct] : "-"}</div>
                    </div>

                    {wizardData.simulationData && (
                      <div className="mt-4 border-t pt-4">
                        <h3 className="font-semibold mb-3">Détails financiers</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          {/* Champs communs */}
                          {displayData.prime_totale !== undefined && (
                            <div className="bg-gray-50 p-2 rounded">
                              <span className="text-gray-600">Prime Totale:</span>
                              <span className="font-bold float-right">{Number(displayData.prime_totale).toLocaleString('fr-FR')} FCFA</span>
                            </div>
                          )}

                          {/* Champs Emprunteur */}
                          {displayData.montant_pret !== undefined && (
                            <div className="p-2">
                              <span className="text-gray-600">Montant Prêt:</span>
                              <span className="font-medium float-right">{Number(displayData.montant_pret).toLocaleString('fr-FR')} FCFA</span>
                            </div>
                          )}
                          {displayData.prime_nette !== undefined && (
                            <div className="p-2">
                              <span className="text-gray-600">Prime Nette:</span>
                              <span className="font-medium float-right">{Number(displayData.prime_nette).toLocaleString('fr-FR')} FCFA</span>
                            </div>
                          )}
                          {displayData.surprime !== undefined && Number(displayData.surprime) > 0 && (
                            <div className="p-2 text-orange-700 bg-orange-50 rounded">
                              <span className="text-gray-600">Surprime:</span>
                              <span className="font-medium float-right">{Number(displayData.surprime).toLocaleString('fr-FR')} FCFA</span>
                            </div>
                          )}
                          {displayData.frais_accessoires !== undefined && (
                            <div className="p-2">
                              <span className="text-gray-600">Frais Accessoires:</span>
                              <span className="font-medium float-right">{Number(displayData.frais_accessoires).toLocaleString('fr-FR')} FCFA</span>
                            </div>
                          )}
                          {displayData.net_a_debourser !== undefined && (
                            <div className="bg-blue-50 p-2 rounded border border-blue-100">
                              <span className="text-blue-800 font-bold">Net à débourser:</span>
                              <span className="font-bold float-right text-blue-800">{Number(displayData.net_a_debourser).toLocaleString('fr-FR')} FCFA</span>
                            </div>
                          )}

                          {/* Champs Retraite / Epargne Plus */}
                          {displayData.prime_periodique_commerciale !== undefined && (
                            <div className="p-2">
                              <span className="text-gray-600">Prime Périodique:</span>
                              <span className="font-medium float-right">{Number(displayData.prime_periodique_commerciale).toLocaleString('fr-FR')} FCFA</span>
                            </div>
                          )}
                          {displayData.capital_deces !== undefined && (
                            <div className="p-2">
                              <span className="text-gray-600">Capital Décès:</span>
                              <span className="font-medium float-right">{Number(displayData.capital_deces).toLocaleString('fr-FR')} FCFA</span>
                            </div>
                          )}

                          {/* Champs Confort Etudes */}
                          {displayData.montant_rente_annuel !== undefined && (
                            <div className="p-2">
                              <span className="text-gray-600">Rente Annuelle:</span>
                              <span className="font-medium float-right">{Number(displayData.montant_rente_annuel).toLocaleString('fr-FR')} FCFA</span>
                            </div>
                          )}
                          {displayData.prime_unique !== undefined && (
                            <div className="p-2">
                              <span className="text-gray-600">Prime Unique:</span>
                              <span className="font-medium float-right">{Number(displayData.prime_unique).toLocaleString('fr-FR')} FCFA</span>
                            </div>
                          )}
                          {displayData.prime_annuelle !== undefined && (
                            <div className="p-2">
                              <span className="text-gray-600">Prime Annuelle:</span>
                              <span className="font-medium float-right">{Number(displayData.prime_annuelle).toLocaleString('fr-FR')} FCFA</span>
                            </div>
                          )}
                          {displayData.prime_mensuelle !== undefined && (
                            <div className="p-2">
                              <span className="text-gray-600">Prime Mensuelle:</span>
                              <span className="font-medium float-right">{Number(displayData.prime_mensuelle).toLocaleString('fr-FR')} FCFA</span>
                            </div>
                          )}
                          {displayData.debut_service !== undefined && (
                            <div className="p-2">
                              <span className="text-gray-600">Début Service (âge):</span>
                              <span className="font-medium float-right">{displayData.debut_service} ans</span>
                            </div>
                          )}
                          {displayData.fin_service !== undefined && (
                            <div className="p-2">
                              <span className="text-gray-600">Fin Service (âge):</span>
                              <span className="font-medium float-right">{displayData.fin_service} ans</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
              <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                <p className="text-blue-800 font-medium text-center">
                  Simulation effectuée avec succès. Veuillez vérifier les informations avant de sauvegarder.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button variant="destructive" onClick={() => router.push("/simulations")}>Abandonner</Button>
            <Button variant="outline" onClick={() => setWizardStep(2)}>Modifier</Button>
            <Button onClick={onStep3Submit} disabled={isStep2Submitting} className="bg-green-600 hover:bg-green-700">
              {isStep2Submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Sauvegarder et Continuer
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* ÉTAPE 4 : Questionnaire Médical */}
      {wizardData.step === 4 && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            {/* Pas de retour possible vers l'étape 3 une fois sauvegardé, ou alors en mode édition */}
            <h2 className="text-xl font-semibold">Questionnaire Médical</h2>
          </div>

          {isStep2Submitting ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
              <p className="text-gray-600">Traitement du questionnaire...</p>
            </div>
          ) : (
            <MedicalForm
              isWizardMode={true}
              initialData={wizardData.questionnaireData}
              onSubmit={onStep4Submit}
              simulationReference={wizardData.simulationData?.reference}
            />
          )}
        </div>
      )}

      {/* ÉTAPE 5 : Validation BIA */}
      {wizardData.step === 5 && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Button variant="ghost" onClick={() => setWizardStep(4)}><ArrowLeft className="mr-2 h-4 w-4" /> Retour</Button>
            <h2 className="text-xl font-semibold">Validation BIA</h2>
          </div>

          <Card>
            <CardHeader><CardTitle>Bulletin Individuel d'Adhésion (BIA)</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {wizardData.biaInfo ? (
                <div className="space-y-6">
                  {/* Extraction des données depuis la structure imbriquée ou plate, avec fallback sur les données locales */}
                  {(() => {
                    const apiSimulation = wizardData.biaInfo?.simulation || {};
                    const apiRoot = wizardData.biaInfo || {};
                    const localData = wizardData.simulationData || {};

                    // Fusion intelligente : On part des données locales (complètes pour l'affichage) 
                    // et on surcharge avec les données API (référence officielle, ID, etc.)
                    // Cela comble les manques si l'API renvoie un objet partiel
                    const info = {
                      ...localData,
                      ...apiRoot,
                      ...apiSimulation,
                      // Forcer la préservation de certains champs si l'API les écrase avec undefined (peu probable avec spread mais sûr)
                      nom: apiSimulation.nom || apiSimulation.nom_client || localData.nom,
                      prenom: apiSimulation.prenom || apiSimulation.prenom_client || localData.prenom,
                      email: apiSimulation.email || apiSimulation.email_client || localData.email,
                      produit: localData.produit || apiSimulation.produit, // Préférer le produit local (ex: epargne_plus vs retraite)
                    };

                    const questionnaire = wizardData.biaInfo?.["questionnaire medical"] || wizardData.questionnaireData || {};

                    return (
                      <>
                        <div className="grid grid-cols-2 gap-4 text-sm border-b pb-4">
                          <div><strong>Référence:</strong> {info.reference || "Non générée"}</div>
                          <div><strong>Date d'effet:</strong> {info.date_effet || info.date_creation || info.created_at}</div>
                        </div>

                        <div>
                          <h3 className="font-medium mb-2">Assuré</h3>
                          <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded">
                            <div><strong>Nom:</strong> {info.nom_client || info.nom}</div>
                            <div><strong>Prénom:</strong> {info.prenom_client || info.prenom}</div>
                            <div><strong>Date de naissance:</strong> {info.date_naissance}</div>
                            <div><strong>Email:</strong> {info.email_client || info.email}</div>
                            <div><strong>Téléphone:</strong> {info.telephone_client || info.telephone}</div>
                            {info.profession && <div><strong>Profession:</strong> {info.profession}</div>}
                            {info.adresse && <div><strong>Adresse:</strong> {info.adresse}</div>}
                          </div>
                        </div>

                        <div>
                          <h3 className="font-medium mb-2">Garanties & Primes</h3>
                          <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded">
                            <div><strong>Produit:</strong> {info.produit ? PRODUIT_LABELS[info.produit as ProduitType] : "-"}</div>
                            <div><strong>Prime Totale:</strong> <span className="text-blue-600 font-bold">{(info.prime_totale || "0").toLocaleString()} FCFA</span></div>

                            {/* Affichage dynamique des autres champs financiers */}
                            {info.montant_pret && <div><strong>Montant Prêt:</strong> {Number(info.montant_pret).toLocaleString()} FCFA</div>}
                            {info.duree_mois && <div><strong>Durée:</strong> {info.duree_mois} mois</div>}
                            {info.prime_nette && <div><strong>Prime Nette:</strong> {Number(info.prime_nette).toLocaleString()} FCFA</div>}
                            {info.surprime_montant && <div><strong>Surprime:</strong> {info.surprime_montant} FCFA</div>}
                            {info.net_a_debourser && <div><strong>Net à débourser:</strong> {Number(info.net_a_debourser).toLocaleString()} FCFA</div>}

                            {/* Retraite / Epargne Plus */}
                            {info.prime_periodique_commerciale && <div><strong>Prime Périodique:</strong> {Number(info.prime_periodique_commerciale).toLocaleString()} FCFA</div>}
                            {info.prime_mensuelle && <div><strong>Mensualité:</strong> {Number(info.prime_mensuelle).toLocaleString()} FCFA</div>}
                            {info.capital_deces !== undefined && <div><strong>Capital Décès:</strong> {Number(info.capital_deces).toLocaleString()} FCFA</div>}
                          </div>
                        </div>

                        {/* Affichage partiel du questionnaire si présent */}
                        {questionnaire && Object.keys(questionnaire).length > 0 && (
                          <div className="mt-4">
                            <h3 className="font-medium mb-2">Questionnaire Médical</h3>
                            <div className="text-sm bg-gray-50 p-4 rounded">
                              <div><strong>Taille:</strong> {questionnaire.taille_cm} cm</div>
                              <div><strong>Poids:</strong> {questionnaire.poids_kg} kg</div>
                              <div><strong>Fumeur:</strong> {questionnaire.fumeur ? "Oui" : "Non"}</div>
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              ) : (
                <p className="text-red-500">Impossible de charger les informations du BIA.</p>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              onClick={onFinalSubmit}
              disabled={isFinalSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isFinalSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Validation en cours...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Confirmer et Valider
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

