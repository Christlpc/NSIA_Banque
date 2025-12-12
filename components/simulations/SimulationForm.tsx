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
import { Loader2, CheckCircle, ArrowRight, ArrowLeft, UserCircle, Mail, GraduationCap, Building2, Briefcase, PiggyBank, HandCoins, User, FileText, Shield, Heart, DollarSign, AlertCircle } from "lucide-react";
import { MedicalForm } from "@/components/questionnaire/MedicalForm";
import { questionnairesApi, exportsApi } from "@/lib/api/simulations";
import { calculateAgeAtJanuary1st } from "@/lib/utils/date";
import {
  ELIKIA_RENTES_ANNUELLES,
  ELIKIA_DUREES_RENTE,
  getElikiaTarif,
  getElikiaTrancheAge,
  isElikiaAgeEligible
} from "@/lib/utils/elikia-tarification";

const simulationSchema = z.object({
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  prenom: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  date_naissance: z.string().min(1, "La date de naissance est requise"),
  // telephone obligatoire avec format Congo (06/05 + 7 chiffres)
  telephone: z.string()
    .min(1, "Le téléphone est requis")
    .regex(/^(06|05)\d{7}$/, "Format invalide. Ex: 067007070 (06 ou 05 suivi de 7 chiffres)"),
  adresse: z.string().min(1, "L'adresse est requise"),
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

  // Nouveaux champs DB - optionnels car spécifiques à certains produits
  employeur: z.string().optional(),
  numero_compte: z.string().optional(),
  situation_matrimoniale: z.string().optional(),
}).refine((data) => {
  return true;
});

type SimulationFormData = z.infer<typeof simulationSchema>;

interface SimulationFormProps {
  mode?: "create" | "edit";
}

export function SimulationForm({ mode = "create" }: SimulationFormProps) {
  // Helper for icons
  const getProductIcon = (product: ProduitType) => {
    switch (product) {
      case "elikia_scolaire": return <GraduationCap className="w-6 h-6" />;
      case "emprunteur": return <Building2 className="w-6 h-6" />;
      case "confort_etudes": return <Briefcase className="w-6 h-6" />;
      case "confort_retraite": return <PiggyBank className="w-6 h-6" />;
      case "mobateli": return <HandCoins className="w-6 h-6" />;
      case "epargne_plus": return <PiggyBank className="w-6 h-6" />; // Reuse piggy bank
      default: return <Building2 className="w-6 h-6" />;
    }
  };

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
      duree_rente: 5, // Valeur par défaut pour Elikia
      ...wizardData.simulationData
    }
  });

  // Mettre à jour le formulaire quand les données du wizard changent (ex: chargement edit)
  useEffect(() => {
    if (wizardData.simulationData && Object.keys(wizardData.simulationData).length > 0) {
      reset({
        taux_surprime: 0, // Surprime par défaut à 0% en bancassurance
        duree_rente: 5, // Valeur par défaut pour Elikia
        ...wizardData.simulationData
      });
      if (wizardData.simulationData.produit) {
        setSelectedProduct(wizardData.simulationData.produit);
      }
    }
  }, [wizardData.simulationData, reset]);

  // Auto-calcul de l'âge au 1er janvier à partir de la date de naissance
  const dateNaissance = watch("date_naissance");
  useEffect(() => {
    if (dateNaissance) {
      const calculatedAge = calculateAgeAtJanuary1st(dateNaissance);
      if (calculatedAge > 0) {
        // Mettre à jour les champs d'âge automatiquement
        setValue("age", calculatedAge);
        setValue("age_parent", calculatedAge);
      }
    }
  }, [dateNaissance, setValue]);

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

  // Helper: Get only the fields relevant to the selected product
  const getProductSpecificPayload = (product: ProduitType, data: SimulationFormData) => {
    // Common client fields for all products
    const commonFields = {
      nom: data.nom,
      prenom: data.prenom,
      email: data.email,
      date_naissance: data.date_naissance,
      telephone: data.telephone,
      adresse: data.adresse,
      profession: data.profession,
      employeur: data.employeur,
      numero_compte: data.numero_compte,
      situation_matrimoniale: data.situation_matrimoniale,
    };

    switch (product) {
      case "emprunteur":
        return {
          ...commonFields,
          montant_pret: data.montant_pret,
          duree_mois: data.duree_mois,
          taux_surprime: data.taux_surprime,
        };
      case "elikia_scolaire":
        return {
          ...commonFields,
          rente_annuelle: data.rente_annuelle,
          age_parent: data.age_parent,
          duree_rente: data.duree_rente || 5,
        };
      case "confort_etudes":
        return {
          ...commonFields,
          age_parent: data.age_parent,
          age_enfant: data.age_enfant,
          montant_rente: data.montant_rente,
          duree_paiement: data.duree_paiement,
          duree_service: data.duree_service,
        };
      case "mobateli":
        return {
          ...commonFields,
          capital_dtc_iad: data.capital_dtc_iad,
          age: data.age,
        };
      case "confort_retraite":
      case "epargne_plus":
        return {
          ...commonFields,
          prime_periodique_commerciale: data.prime_periodique_commerciale,
          capital_deces: data.capital_deces,
          duree: data.duree,
          age: data.age,
          periodicite: data.periodicite,
        };
      default:
        return commonFields;
    }
  };

  const onStep2Submit = async (data: SimulationFormData) => {
    console.log("Step 2 Submission Data (Raw):", data);
    console.log("Selected Product:", selectedProduct);

    if (!selectedProduct) {
      toast.error("Veuillez sélectionner un produit");
      return;
    }

    // Validation spécifique par produit
    let isValid = true;
    let errorMessage = "Veuillez remplir tous les champs obligatoires pour ce produit";

    if (selectedProduct === "emprunteur") {
      if (!data.montant_pret || !data.duree_mois) {
        isValid = false;
        errorMessage = "Le montant du prêt et la durée sont requis pour Emprunteur";
      }
    } else if (selectedProduct === "elikia_scolaire") {
      const dureeRente = data.duree_rente || 5;
      const ageParent = data.age_parent || 0;
      if (!data.rente_annuelle || ageParent < 18 || !dureeRente) {
        isValid = false;
        errorMessage = "La rente annuelle et l'âge du parent sont requis pour Elikia";
      } else {
        if (!data.duree_rente) setValue("duree_rente", dureeRente);
      }
    } else if (selectedProduct === "confort_etudes") {
      if (!data.age_parent || data.age_enfant === undefined || !data.montant_rente || !data.duree_paiement || !data.duree_service) {
        isValid = false;
        errorMessage = "Tous les champs (âge parent, âge enfant, montant rente, durées) sont requis pour Confort Études";
      }
    } else if (selectedProduct === "mobateli") {
      if (!data.capital_dtc_iad || !data.age) {
        isValid = false;
        errorMessage = "Le capital DTC/IAD et l'âge sont requis pour Mobateli";
      }
    } else if (selectedProduct === "confort_retraite" || selectedProduct === "epargne_plus") {
      if (!data.prime_periodique_commerciale || data.capital_deces === undefined || !data.duree || !data.age || !data.periodicite) {
        isValid = false;
        errorMessage = "La prime périodique, le capital décès, la durée, l'âge et la périodicité sont requis";
      }
    }

    if (!isValid) {
      toast.error(errorMessage);
      return;
    }

    setIsStep2Submitting(true);
    try {
      // Build product-specific payload (only relevant fields)
      const productPayload = getProductSpecificPayload(selectedProduct, data);
      const simulationData = {
        ...wizardData.simulationData,
        ...productPayload,
        produit: selectedProduct
      };
      console.log("Sending Simulation Payload (filtered):", simulationData);

      updateWizardData({ simulationData });

      // Appel API pour simuler (création temporaire ou calcul)
      const result = await createSimulation(selectedProduct, { ...simulationData, sauvegarder: false });

      console.log("API Simulation Result:", result);

      if (result) {
        updateWizardData({
          createdSimulationId: result.id,
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

  return (
    <div className="space-y-6">
      <div className="mb-8 px-4">
        <div className="flex justify-between items-center relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 -z-10 rounded-full"></div>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-600 -z-10 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((wizardData.step - 1) / 4) * 100}%` }}></div>

          {[
            { step: 1, label: "Client" },
            { step: 2, label: "Produit" },
            { step: 3, label: "Résultat" },
            { step: 4, label: "Santé" },
            { step: 5, label: "BIA" },
          ].map((item) => {
            const isActive = wizardData.step === item.step;
            const isCompleted = wizardData.step > item.step;

            return (
              <div key={item.step} className="flex flex-col items-center group cursor-default">
                <div className={`
                            w-10 h-10 rounded-full flex items-center justify-center border-2 text-sm font-bold transition-all duration-300 bg-white
                            ${isActive ? "border-blue-600 text-blue-600 shadow-md scale-110" :
                    isCompleted ? "border-blue-600 bg-blue-600 text-white" : "border-gray-200 text-gray-400"}
                        `}>
                  {isCompleted ? <CheckCircle className="w-5 h-5" /> : item.step}
                </div>
                <span className={`
                            text-xs mt-2 font-medium bg-white px-2 rounded-full transition-colors
                            ${isActive ? "text-blue-700 font-bold" : isCompleted ? "text-blue-600" : "text-gray-400"}
                        `}>
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ÉTAPE 1 : Infos Client */}
      {wizardData.step === 1 && (
        <form onSubmit={handleSubmit(onStep1Submit)} className="space-y-6 animate-in slide-in-from-right-4 duration-500">
          <Card className="border-none shadow-lg">
            <CardHeader className="bg-slate-50 border-b border-gray-100 pb-4">
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <div className="bg-blue-100 p-2 rounded-lg"><UserCircle className="w-5 h-5 text-blue-600" /></div>
                Informations Client
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="prenom" className="text-gray-700 font-medium">Prénom <span className="text-red-500">*</span></Label>
                  <Input id="prenom" autoComplete="given-name" {...register("prenom")} className="h-11 bg-gray-50/50 border-gray-200 focus:bg-white transition-colors" placeholder="Jean" />
                  {errors.prenom && <p className="text-xs text-red-600 font-medium mt-1">{errors.prenom.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nom" className="text-gray-700 font-medium">Nom <span className="text-red-500">*</span></Label>
                  <Input id="nom" autoComplete="family-name" {...register("nom")} className="h-11 bg-gray-50/50 border-gray-200 focus:bg-white transition-colors" placeholder="Dupont" />
                  {errors.nom && <p className="text-xs text-red-600 font-medium mt-1">{errors.nom.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">Email <span className="text-gray-400 text-xs font-normal">(Optionnel)</span></Label>
                <div className="relative">
                  <Input id="email" type="email" autoComplete="email" {...register("email")} className="h-11 pl-10 bg-gray-50/50 border-gray-200 focus:bg-white transition-colors" placeholder="jean.dupont@example.com" />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
                {errors.email && <p className="text-xs text-red-600 font-medium mt-1">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_naissance" className="text-gray-700 font-medium">Date de Naissance <span className="text-red-500">*</span></Label>
                <DatePickerInput
                  id="date_naissance"
                  value={watch("date_naissance") || undefined}
                  onChange={(value) => setValue("date_naissance", value)}
                  placeholder="JJ/MM/AAAA"
                  error={!!errors.date_naissance}
                />
                {errors.date_naissance && <p className="text-xs text-red-600 font-medium mt-1">{errors.date_naissance.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="telephone" className="text-gray-700 font-medium">Téléphone <span className="text-red-500">*</span></Label>
                  <Input
                    id="telephone"
                    autoComplete="tel"
                    {...register("telephone")}
                    className="h-11 bg-gray-50/50 border-gray-200 focus:bg-white transition-colors"
                    placeholder="06 123 4567"
                  />
                  {errors.telephone && <p className="text-xs text-red-600 font-medium mt-1">{errors.telephone.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profession" className="text-gray-700 font-medium">Profession</Label>
                  <Input id="profession" autoComplete="organization-title" {...register("profession")} className="h-11 bg-gray-50/50 border-gray-200 focus:bg-white transition-colors" placeholder="Enseignant" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adresse" className="text-gray-700 font-medium">Adresse <span className="text-red-500">*</span></Label>
                <Input id="adresse" autoComplete="street-address" {...register("adresse")} className="h-11 bg-gray-50/50 border-gray-200 focus:bg-white transition-colors" placeholder="123 Avenue de la Paix, Brazzaville" />
                {errors.adresse && <p className="text-xs text-red-600 font-medium mt-1">{errors.adresse.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="employeur" className="text-gray-700 font-medium">Employeur <span className="text-red-500">*</span></Label>
                  <Input id="employeur" autoComplete="organization" {...register("employeur")} className="h-11 bg-gray-50/50 border-gray-200 focus:bg-white transition-colors" placeholder="Nom de l'entreprise" />
                  {errors.employeur && <p className="text-xs text-red-600 font-medium mt-1">{errors.employeur.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numero_compte" className="text-gray-700 font-medium">Numéro de Compte <span className="text-red-500">*</span></Label>
                  <Input id="numero_compte" {...register("numero_compte")} className="h-11 bg-gray-50/50 border-gray-200 focus:bg-white transition-colors font-mono" placeholder="0000 0000 0000" />
                  {errors.numero_compte && <p className="text-xs text-red-600 font-medium mt-1">{errors.numero_compte.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="situation_matrimoniale" className="text-gray-700 font-medium">Situation Matrimoniale <span className="text-red-500">*</span></Label>
                <Select
                  onValueChange={(v) => setValue("situation_matrimoniale", v)}
                  defaultValue={watch("situation_matrimoniale")}
                >
                  <SelectTrigger id="situation_matrimoniale" className="h-11 bg-gray-50/50 border-gray-200 focus:bg-white transition-colors">
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="celibataire">Célibataire</SelectItem>
                    <SelectItem value="marie">Marié(e)</SelectItem>
                    <SelectItem value="divorce">Divorcé(e)</SelectItem>
                    <SelectItem value="veuf">Veuf/Veuve</SelectItem>
                  </SelectContent>
                </Select>
                {errors.situation_matrimoniale && <p className="text-xs text-red-600 font-medium mt-1">{errors.situation_matrimoniale.message}</p>}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end pt-4">
            <Button type="submit" size="lg" className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 px-8">
              Suivant <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      )}

      {/* ÉTAPE 2 : Produit */}
      {wizardData.step === 2 && (
        <form
          onSubmit={handleSubmit(onStep2Submit, (errors) => {
            console.error("Form validation errors:", errors);
            toast.error(`Erreur de validation: ${Object.keys(errors).map(k => k.replace(/_/g, ' ')).join(", ")}`);
          })}
          className="space-y-6 animate-in slide-in-from-right-4 duration-500"
        >
          <div className="flex items-center gap-2 mb-6">
            <Button variant="ghost" size="sm" type="button" onClick={() => setWizardStep(1)} className="text-gray-500 hover:text-gray-800 -ml-2">
              <ArrowLeft className="mr-1 h-4 w-4" /> Retour
            </Button>
          </div>

          <Card className="border-none shadow-lg">
            <CardHeader className="bg-slate-50 border-b border-gray-100 pb-4">
              <CardTitle className="text-slate-800">Sélection du Produit</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {availableProducts.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <p className="text-gray-500 font-medium">Aucun produit disponible pour cette configuration.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableProducts.map((product) => {
                    const isSelected = selectedProduct === product;
                    const icon = getProductIcon(product);
                    return (
                      <button
                        key={product}
                        type="button"
                        onClick={() => setSelectedProduct(product)}
                        className={`
                                    relative p-5 rounded-xl text-left transition-all duration-300 group
                                    ${isSelected
                            ? "bg-blue-50 border-2 border-blue-500 shadow-md transform scale-[1.02]"
                            : "bg-white border border-gray-200 hover:border-blue-300 hover:bg-slate-50 hover:shadow-sm"}
                                `}
                      >
                        <div className={`
                                    w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-colors
                                    ${isSelected ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600"}
                                `}>
                          {icon}
                        </div>
                        <h3 className={`font-bold text-base mb-1 ${isSelected ? "text-blue-800" : "text-gray-800"}`}>
                          {PRODUIT_LABELS[product]}
                        </h3>
                        <p className="text-xs text-gray-500 line-clamp-2">
                          Simulez votre contrat {PRODUIT_LABELS[product]} dès maintenant.
                        </p>
                        {isSelected && (
                          <div className="absolute top-3 right-3 text-blue-500 animate-in fade-in zoom-in">
                            <CheckCircle className="w-5 h-5 fill-current" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
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

                {/* Elikia Scolaire */}
                {selectedProduct === "elikia_scolaire" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="rente_annuelle">Rente Annuelle (FCFA) *</Label>
                        <Select
                          onValueChange={(v) => setValue("rente_annuelle", parseInt(v), { shouldValidate: true, shouldDirty: true })}
                          defaultValue={watch("rente_annuelle")?.toString()}
                        >
                          <SelectTrigger id="rente_annuelle">
                            <SelectValue placeholder="Sélectionner la rente" />
                          </SelectTrigger>
                          <SelectContent>
                            {ELIKIA_RENTES_ANNUELLES.map((rente) => (
                              <SelectItem key={rente} value={rente.toString()}>
                                {rente.toLocaleString("fr-FR")} FCFA
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="age_parent">Âge de l'Assuré (calculé automatiquement)</Label>
                        <Input
                          id="age_parent"
                          type="number"
                          {...register("age_parent", { valueAsNumber: true })}
                          readOnly
                          className="bg-gray-100 cursor-not-allowed"
                          title="L'âge est calculé automatiquement au 1er janvier à partir de la date de naissance"
                        />
                        {watch("age_parent") && getElikiaTrancheAge(watch("age_parent") || 0) && (
                          <p className="text-xs text-blue-600 font-medium">
                            Tranche: {getElikiaTrancheAge(watch("age_parent") || 0)?.label}
                          </p>
                        )}
                        {watch("age_parent") && !isElikiaAgeEligible(watch("age_parent") || 0) && (
                          <p className="text-xs text-red-600">
                            Âge non éligible (18-64 ans requis)
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="duree_rente">Durée de la Rente (ans) *</Label>
                        <Select
                          onValueChange={(v) => setValue("duree_rente", parseInt(v), { shouldValidate: true, shouldDirty: true })}
                          defaultValue={watch("duree_rente")?.toString() || "5"}
                        >
                          <SelectTrigger id="duree_rente">
                            <SelectValue placeholder="Sélectionner la durée" />
                          </SelectTrigger>
                          <SelectContent>
                            {ELIKIA_DUREES_RENTE.map((duree) => (
                              <SelectItem key={duree} value={duree.toString()}>
                                {duree} ans
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Affichage du tarif calculé */}
                    {watch("rente_annuelle") && watch("age_parent") && watch("duree_rente") && (() => {
                      const tarif = getElikiaTarif(
                        watch("rente_annuelle") || 0,
                        watch("duree_rente") || 5,
                        watch("age_parent") || 0
                      );
                      if (tarif) {
                        return (
                          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <h4 className="font-semibold text-blue-900 mb-3">Tarification Elikia Scolaire</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div className="bg-white p-3 rounded-lg">
                                <p className="text-gray-600">Prime Annuelle</p>
                                <p className="text-xl font-bold text-blue-700">
                                  {tarif.prime_annuelle.toLocaleString("fr-FR")} FCFA
                                </p>
                              </div>
                              <div className="bg-white p-3 rounded-lg">
                                <p className="text-gray-600">Prime Unique</p>
                                <p className="text-xl font-bold text-green-700">
                                  {tarif.prime_unique.toLocaleString("fr-FR")} FCFA
                                </p>
                              </div>
                              <div className="bg-white p-3 rounded-lg">
                                <p className="text-gray-600">Tranche d'âge</p>
                                <p className="text-lg font-semibold text-gray-800">
                                  {tarif.tranche_age}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      } else if (!isElikiaAgeEligible(watch("age_parent") || 0)) {
                        return (
                          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-700 font-medium">
                              L'âge de l'assuré doit être compris entre 18 et 64 ans.
                            </p>
                          </div>
                        );
                      }
                      return null;
                    })()}
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
                      <Label htmlFor="age">Âge (calculé automatiquement)</Label>
                      <Input
                        id="age"
                        type="number"
                        {...register("age", { valueAsNumber: true })}
                        readOnly
                        className="bg-gray-100 cursor-not-allowed"
                        title="L'âge est calculé automatiquement au 1er janvier à partir de la date de naissance"
                      />
                    </div>
                  </div>
                )}

                {/* Confort Etudes */}
                {selectedProduct === "confort_etudes" && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="age_parent">Âge du Parent (calculé automatiquement)</Label>
                      <Input
                        id="age_parent"
                        type="number"
                        {...register("age_parent", { valueAsNumber: true })}
                        readOnly
                        className="bg-gray-100 cursor-not-allowed"
                        title="L'âge est calculé automatiquement au 1er janvier à partir de la date de naissance"
                      />
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
                      <Label htmlFor="age_retraite">Age (calculé automatiquement)</Label>
                      <Input
                        id="age_retraite"
                        type="number"
                        {...register("age", { valueAsNumber: true })}
                        readOnly
                        className="bg-gray-100 cursor-not-allowed"
                        title="L'âge est calculé automatiquement au 1er janvier à partir de la date de naissance"
                      />
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
            <CardContent className="space-y-6 pt-6">
              {(() => {
                const displayData = {
                  ...wizardData.simulationData,
                  ...(wizardData.simulationData?.resultats_calcul || {})
                };

                const productName = PRODUIT_LABELS[(selectedProduct || displayData.produit) as ProduitType] || displayData.produit || "-";
                const clientName = `${displayData.prenom || watch("prenom")} ${displayData.nom || watch("nom")}`;

                return (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg shrink-0">
                          <UserCircle className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">Client</p>
                          <p className="text-sm font-semibold text-gray-900">{clientName}</p>
                          <p className="text-xs text-gray-500">{displayData.email || watch("email") || "Sans email"}</p>
                        </div>
                      </div>

                      <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 flex items-start gap-3">
                        <div className="bg-emerald-100 p-2 rounded-lg shrink-0">
                          <Briefcase className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider mb-1">Produit</p>
                          <p className="text-sm font-semibold text-gray-900">{productName}</p>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800 mt-1">
                            Simulation
                          </span>
                        </div>
                      </div>
                    </div>

                    {wizardData.simulationData && (
                      <div className="border rounded-xl overflow-hidden shadow-sm">
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
                          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                            <HandCoins className="w-4 h-4 text-gray-500" />
                            Détails Financiers
                          </h3>
                        </div>
                        <div className="p-4 bg-white">
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
            </CardContent >
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
          {/* Header with back button and title */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => setWizardStep(4)} className="hover:bg-gray-100">
                <ArrowLeft className="mr-2 h-4 w-4" /> Retour
              </Button>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Validation BIA</h2>
                <p className="text-sm text-gray-500">Vérifiez les informations avant validation finale</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-700">Prêt à valider</span>
            </div>
          </div>

          {wizardData.biaInfo ? (
            <>
              {/* Main Content Grid */}
              {(() => {
                const apiSimulation = wizardData.biaInfo?.simulation || {};
                const apiRoot = wizardData.biaInfo || {};
                const localData = wizardData.simulationData || {};

                const info = {
                  ...localData,
                  ...apiRoot,
                  ...apiSimulation,
                  nom: apiSimulation.nom || apiSimulation.nom_client || localData.nom,
                  prenom: apiSimulation.prenom || apiSimulation.prenom_client || localData.prenom,
                  email: apiSimulation.email || apiSimulation.email_client || localData.email,
                  produit: localData.produit || apiSimulation.produit,
                };

                const questionnaire = wizardData.biaInfo?.["questionnaire medical"] || wizardData.questionnaireData || {};

                return (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Client Info & Questionnaire */}
                    <div className="lg:col-span-2 space-y-6">
                      {/* Reference Card */}
                      <Card className="border-l-4 border-l-blue-500 shadow-sm">
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                <FileText className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Référence BIA</p>
                                <p className="text-xl font-bold text-gray-900">{info.reference || "En attente de génération"}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-500">Date d'effet</p>
                              <p className="text-base font-semibold text-gray-700">{info.date_effet || info.date_creation || info.created_at || "Non définie"}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Client Info Card */}
                      <Card className="shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                              <User className="h-4 w-4 text-purple-600" />
                            </div>
                            <CardTitle className="text-lg">Informations de l'Assuré</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                            <div className="space-y-1">
                              <p className="text-xs uppercase tracking-wide text-gray-400 font-medium">Nom complet</p>
                              <p className="text-base font-semibold text-gray-900">{info.prenom_client || info.prenom} {info.nom_client || info.nom}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs uppercase tracking-wide text-gray-400 font-medium">Date de naissance</p>
                              <p className="text-base font-semibold text-gray-900">{info.date_naissance || "-"}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs uppercase tracking-wide text-gray-400 font-medium">Email</p>
                              <p className="text-base text-gray-700">{info.email_client || info.email || "-"}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs uppercase tracking-wide text-gray-400 font-medium">Téléphone</p>
                              <p className="text-base text-gray-700">{info.telephone_client || info.telephone || "-"}</p>
                            </div>
                            {info.profession && (
                              <div className="space-y-1">
                                <p className="text-xs uppercase tracking-wide text-gray-400 font-medium">Profession</p>
                                <p className="text-base text-gray-700">{info.profession}</p>
                              </div>
                            )}
                            {info.adresse && (
                              <div className="space-y-1 col-span-2">
                                <p className="text-xs uppercase tracking-wide text-gray-400 font-medium">Adresse</p>
                                <p className="text-base text-gray-700">{info.adresse}</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Questionnaire Card (if present) */}
                      {questionnaire && Object.keys(questionnaire).length > 0 && (
                        <Card className="shadow-sm hover:shadow-md transition-shadow">
                          <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                                <Heart className="h-4 w-4 text-red-600" />
                              </div>
                              <CardTitle className="text-lg">Questionnaire Médical</CardTitle>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-3 gap-4">
                              <div className="p-4 bg-gray-50 rounded-xl text-center">
                                <p className="text-2xl font-bold text-gray-900">{questionnaire.taille_cm || "-"}</p>
                                <p className="text-xs text-gray-500 mt-1">Taille (cm)</p>
                              </div>
                              <div className="p-4 bg-gray-50 rounded-xl text-center">
                                <p className="text-2xl font-bold text-gray-900">{questionnaire.poids_kg || "-"}</p>
                                <p className="text-xs text-gray-500 mt-1">Poids (kg)</p>
                              </div>
                              <div className="p-4 bg-gray-50 rounded-xl text-center">
                                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${questionnaire.fumeur ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                  }`}>
                                  {questionnaire.fumeur ? "Fumeur" : "Non-fumeur"}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>

                    {/* Right Column: Product & Primes */}
                    <div className="space-y-6">
                      {/* Product Card */}
                      <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-blue-200" />
                            <p className="text-sm text-blue-200 font-medium">Produit sélectionné</p>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold mb-4">
                            {info.produit ? PRODUIT_LABELS[info.produit as ProduitType] : "-"}
                          </p>

                          <div className="h-px bg-white/20 my-4"></div>

                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-blue-200">Prime Totale</span>
                              <span className="text-2xl font-bold">{Number(info.prime_totale || 0).toLocaleString()} FCFA</span>
                            </div>

                            {info.prime_mensuelle && (
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-blue-200">Mensualité</span>
                                <span className="font-semibold">{Number(info.prime_mensuelle).toLocaleString()} FCFA</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Financial Details Card */}
                      <Card className="shadow-sm">
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                              <DollarSign className="h-4 w-4 text-green-600" />
                            </div>
                            <CardTitle className="text-lg">Détails Financiers</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {info.montant_pret && (
                            <div className="flex justify-between py-2 border-b border-gray-100">
                              <span className="text-gray-500">Montant Prêt</span>
                              <span className="font-semibold">{Number(info.montant_pret).toLocaleString()} FCFA</span>
                            </div>
                          )}
                          {info.duree_mois && (
                            <div className="flex justify-between py-2 border-b border-gray-100">
                              <span className="text-gray-500">Durée</span>
                              <span className="font-semibold">{info.duree_mois} mois</span>
                            </div>
                          )}
                          {info.prime_nette && (
                            <div className="flex justify-between py-2 border-b border-gray-100">
                              <span className="text-gray-500">Prime Nette</span>
                              <span className="font-semibold">{Number(info.prime_nette).toLocaleString()} FCFA</span>
                            </div>
                          )}
                          {info.surprime_montant && (
                            <div className="flex justify-between py-2 border-b border-gray-100">
                              <span className="text-gray-500">Surprime</span>
                              <span className="font-semibold text-orange-600">{info.surprime_montant} FCFA</span>
                            </div>
                          )}
                          {info.net_a_debourser && (
                            <div className="flex justify-between py-2 border-b border-gray-100">
                              <span className="text-gray-500">Net à débourser</span>
                              <span className="font-bold text-blue-600">{Number(info.net_a_debourser).toLocaleString()} FCFA</span>
                            </div>
                          )}
                          {info.prime_periodique_commerciale && (
                            <div className="flex justify-between py-2 border-b border-gray-100">
                              <span className="text-gray-500">Prime Périodique</span>
                              <span className="font-semibold">{Number(info.prime_periodique_commerciale).toLocaleString()} FCFA</span>
                            </div>
                          )}
                          {info.capital_deces !== undefined && (
                            <div className="flex justify-between py-2 border-b border-gray-100">
                              <span className="text-gray-500">Capital Décès</span>
                              <span className="font-semibold">{Number(info.capital_deces).toLocaleString()} FCFA</span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                );
              })()}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-6 border-t">
                <p className="text-sm text-gray-500">
                  En cliquant sur "Confirmer et Valider", le BIA sera généré et finalisé.
                </p>
                <Button
                  onClick={onFinalSubmit}
                  disabled={isFinalSubmitting}
                  size="lg"
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all px-8"
                >
                  {isFinalSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Validation en cours...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-5 w-5" />
                      Confirmer et Valider
                    </>
                  )}
                </Button>
              </div>
            </>
          ) : (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 text-red-600">
                  <AlertCircle className="h-6 w-6" />
                  <p className="font-medium">Impossible de charger les informations du BIA.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

