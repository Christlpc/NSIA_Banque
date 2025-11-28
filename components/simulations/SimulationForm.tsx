"use client";

import { useState } from "react";
import { useSafeRouter } from "@/lib/hooks/useSafeRouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePickerInput } from "@/components/ui/date-picker";
import { useSimulationStore } from "@/lib/store/simulationStore";
import { PRODUIT_LABELS, ProduitType } from "@/types";
import { useAuthStore } from "@/lib/store/authStore";
import { ALL_PRODUITS } from "@/lib/utils/constants";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

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
  taux_surprime: z.number().min(0).max(100).optional(),
  profession: z.string().optional(),
  adresse: z.string().optional(),
  telephone: z.string().optional(),
}).refine((data) => {
  // Validation conditionnelle : si on a des champs de prêt, ils doivent être valides
  // Note: Idéalement on devrait passer le produit au schéma, mais ici on simplifie
  // en vérifiant si les champs sont remplis quand ils sont affichés
  return true;
});

type SimulationFormData = z.infer<typeof simulationSchema>;

export function SimulationForm() {
  const router = useSafeRouter();
  const { user } = useAuthStore();
  const { createSimulation, isLoading } = useSimulationStore();
  const [selectedProduct, setSelectedProduct] = useState<ProduitType | "">("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<SimulationFormData>({
    resolver: zodResolver(simulationSchema),
    defaultValues: {
      taux_surprime: 0,
    }
  });

  // Utiliser les produits de la banque si disponibles, sinon tous les produits
  const availableProducts = user?.banque?.produits_disponibles?.length
    ? user.banque.produits_disponibles
    : ALL_PRODUITS;

  const onSubmit = async (data: SimulationFormData) => {
    if (!selectedProduct) {
      toast.error("Veuillez sélectionner un produit");
      return;
    }

    // Validation spécifique par produit
    if (selectedProduct === "emprunteur") {
      if (!data.montant_pret) {
        toast.error("Le montant du prêt est requis pour ce produit");
        return;
      }
      if (!data.duree_mois) {
        toast.error("La durée du prêt est requise pour ce produit");
        return;
      }
    } else if (selectedProduct === "elikia_scolaire") {
      if (!data.rente_annuelle) {
        toast.error("La rente annuelle est requise pour ce produit");
        return;
      }
      if (!data.age_parent) {
        toast.error("L'âge du parent est requis pour ce produit");
        return;
      }
      if (!data.duree_rente) {
        toast.error("La durée de la rente est requise pour ce produit");
        return;
      }
    }

    try {
      // On s'assure que sauvegarder est à true
      await createSimulation(selectedProduct, { ...data, sauvegarder: true });
      toast.success("Simulation créée avec succès");
      router.push("/simulations");
    } catch (error: any) {
      toast.error(error?.message || "Erreur lors de la création");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Sélection du produit */}
      <Card>
        <CardHeader>
          <CardTitle>1. Sélection du Produit</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {availableProducts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-2">Aucun produit disponible</p>
              <p className="text-sm text-gray-500">
                Veuillez contacter l'administrateur pour configurer les produits de votre banque.
              </p>
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

      {/* Informations client */}
      <Card>
        <CardHeader>
          <CardTitle>2. Informations Client</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prenom">Prénom *</Label>
              <Input id="prenom" {...register("prenom")} disabled={isLoading} />
              {errors.prenom && (
                <p className="text-sm text-red-600">{errors.prenom.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="nom">Nom *</Label>
              <Input id="nom" {...register("nom")} disabled={isLoading} />
              {errors.nom && (
                <p className="text-sm text-red-600">{errors.nom.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input id="email" type="email" {...register("email")} disabled={isLoading} />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date_naissance">Date de Naissance *</Label>
              <DatePickerInput
                id="date_naissance"
                value={watch("date_naissance") || undefined}
                onChange={(value) => setValue("date_naissance", value)}
                placeholder="Sélectionner la date de naissance"
                disabled={isLoading}
                error={!!errors.date_naissance}
                maxDate={new Date()}
              />
              {errors.date_naissance && (
                <p className="text-sm text-red-600">{errors.date_naissance.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="date_effet">Date d'Effet *</Label>
              <DatePickerInput
                id="date_effet"
                value={watch("date_effet") || undefined}
                onChange={(value) => setValue("date_effet", value)}
                placeholder="Sélectionner la date d'effet"
                disabled={isLoading}
                error={!!errors.date_effet}
              />
              {errors.date_effet && (
                <p className="text-sm text-red-600">{errors.date_effet.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telephone">Téléphone</Label>
              <Input id="telephone" {...register("telephone")} disabled={isLoading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profession">Profession</Label>
              <Input id="profession" {...register("profession")} disabled={isLoading} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="adresse">Adresse</Label>
            <Input id="adresse" {...register("adresse")} disabled={isLoading} />
          </div>
        </CardContent>
      </Card>

      {/* Détails du prêt (pour Emprunteur) */}
      {selectedProduct === "emprunteur" && (
        <Card>
          <CardHeader>
            <CardTitle>3. Détails du Prêt</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="montant_pret">Montant du Prêt (FCFA)</Label>
                <Input
                  id="montant_pret"
                  type="number"
                  {...register("montant_pret", { valueAsNumber: true })}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duree_mois">Durée (mois)</Label>
                <Input
                  id="duree_mois"
                  type="number"
                  {...register("duree_mois", { valueAsNumber: true })}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="taux_surprime">Taux de Surprime (%)</Label>
                <Input
                  id="taux_surprime"
                  type="number"
                  step="0.01"
                  {...register("taux_surprime", { valueAsNumber: true })}
                  disabled={isLoading}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/simulations")}
          disabled={isLoading}
        >
          Annuler
        </Button>
        <Button type="submit" disabled={isLoading || !selectedProduct}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Création...
            </>
          ) : (
            "Créer la Simulation"
          )}
        </Button>
      </div>
    </form>
  );
}

