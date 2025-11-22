"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useBanqueStore } from "@/lib/store/banqueStore";
import { Input } from "@/components/ui/input";
import { DatePickerInput } from "@/components/ui/date-picker";
import { PRODUIT_LABELS, type ProduitType, type Banque } from "@/types";
import { cn } from "@/lib/utils/cn";
import toast from "react-hot-toast";

const banqueSchema = z.object({
  nom: z.string().min(1, "Le nom est requis"),
  code: z.string().min(1, "Le code est requis").max(10, "Le code doit faire moins de 10 caractères"),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  telephone: z.string().optional(),
  adresse: z.string().optional(),
  produits_disponibles: z.array(z.enum([
    "emprunteur",
    "confort_retraite",
    "confort_etudes",
    "elikia_scolaire",
    "mobateli",
    "epargne_plus",
  ])).min(1, "Au moins un produit doit être sélectionné"),
  date_partenariat: z.string().optional(),
});

type BanqueFormData = z.infer<typeof banqueSchema>;

interface BanqueFormProps {
  banque?: Banque;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ALL_PRODUITS: ProduitType[] = [
  "emprunteur",
  "confort_retraite",
  "confort_etudes",
  "elikia_scolaire",
  "mobateli",
  "epargne_plus",
];

export function BanqueForm({ banque, open, onOpenChange }: BanqueFormProps) {
  const { updateBanque, createBanque, fetchBanques } = useBanqueStore();
  const isEditing = !!banque;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<BanqueFormData>({
    resolver: zodResolver(banqueSchema),
    defaultValues: {
      nom: banque?.nom || "",
      code: banque?.code || "",
      email: banque?.email || "",
      telephone: banque?.telephone || "",
      adresse: banque?.adresse || "",
      produits_disponibles: banque?.produits_disponibles || [],
      date_partenariat: banque?.date_partenariat || "",
    },
  });

  const selectedProduits = watch("produits_disponibles");

  useEffect(() => {
    if (banque) {
      reset({
        nom: banque.nom,
        code: banque.code,
        email: banque.email || "",
        telephone: banque.telephone || "",
        adresse: banque.adresse || "",
        produits_disponibles: banque.produits_disponibles,
        date_partenariat: banque.date_partenariat || "",
      });
    } else {
      reset({
        nom: "",
        code: "",
        email: "",
        telephone: "",
        adresse: "",
        produits_disponibles: [],
        date_partenariat: "",
      });
    }
  }, [banque, reset]);

  const toggleProduit = (produit: ProduitType) => {
    const current = selectedProduits || [];
    if (current.includes(produit)) {
      setValue("produits_disponibles", current.filter((p) => p !== produit));
    } else {
      setValue("produits_disponibles", [...current, produit]);
    }
  };

  const onSubmit = async (data: BanqueFormData) => {
    try {
      if (isEditing && banque) {
        await updateBanque(banque.id, {
          nom: data.nom,
          code: data.code,
          email: data.email || undefined,
          telephone: data.telephone || undefined,
          adresse: data.adresse || undefined,
          produits_disponibles: data.produits_disponibles,
          date_partenariat: data.date_partenariat || undefined,
        });
        await fetchBanques(); // Rafraîchir la liste
        onOpenChange(false);
      } else {
        // Création d'une nouvelle banque
        await createBanque({
          nom: data.nom,
          code: data.code,
          email: data.email || undefined,
          telephone: data.telephone || undefined,
          adresse: data.adresse || undefined,
          produits_disponibles: data.produits_disponibles,
          date_partenariat: data.date_partenariat || undefined,
        });
        await fetchBanques(); // Rafraîchir la liste
        onOpenChange(false);
      }
    } catch (error: any) {
      // L'erreur est déjà gérée par le store avec toast
      // On ne fait rien ici pour éviter de dupliquer les messages
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg" className="max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Modifier la banque" : "Créer une nouvelle banque"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifiez les informations de la banque"
              : "Remplissez le formulaire pour créer une nouvelle banque"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
          <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-200px)] flex-1">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="nom" className="text-sm font-semibold text-gray-700">
                    Nom de la banque *
                  </Label>
                  <Input
                    id="nom"
                    {...register("nom")}
                    placeholder="Ecobank Congo"
                    className={cn(
                      "transition-all",
                      errors.nom ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"
                    )}
                  />
                  {errors.nom && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <span>•</span>
                      {errors.nom.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="code" className="text-sm font-semibold text-gray-700">
                    Code *
                  </Label>
                  <Input
                    id="code"
                    {...register("code")}
                    placeholder="ECO"
                    className={cn(
                      "transition-all uppercase",
                      errors.code ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"
                    )}
                    maxLength={10}
                  />
                  {errors.code && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <span>•</span>
                      {errors.code.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="contact@banque.cg"
                    className={cn(
                      "transition-all",
                      errors.email ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"
                    )}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <span>•</span>
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telephone" className="text-sm font-semibold text-gray-700">
                    Téléphone
                  </Label>
                  <Input
                    id="telephone"
                    {...register("telephone")}
                    placeholder="+242 06 234 56 78"
                    className={cn(
                      "transition-all",
                      errors.telephone ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"
                    )}
                  />
                  {errors.telephone && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <span>•</span>
                      {errors.telephone.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adresse" className="text-sm font-semibold text-gray-700">
                  Adresse
                </Label>
                <Input
                  id="adresse"
                  {...register("adresse")}
                  placeholder="Brazzaville, Congo"
                  className={cn(
                    "transition-all",
                    errors.adresse ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"
                  )}
                />
                {errors.adresse && (
                  <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                    <span>•</span>
                    {errors.adresse.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_partenariat" className="text-sm font-semibold text-gray-700">
                  Date de partenariat
                </Label>
                <DatePickerInput
                  id="date_partenariat"
                  value={watch("date_partenariat") || undefined}
                  onChange={(value) => setValue("date_partenariat", value)}
                  placeholder="Sélectionner une date"
                  disabled={isSubmitting}
                  error={!!errors.date_partenariat}
                  maxDate={new Date()}
                />
                {errors.date_partenariat && (
                  <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                    <span>•</span>
                    {errors.date_partenariat.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">
                  Produits disponibles *
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {ALL_PRODUITS.map((produit) => {
                    const isSelected = selectedProduits?.includes(produit);
                    return (
                      <button
                        key={produit}
                        type="button"
                        onClick={() => toggleProduit(produit)}
                        className={cn(
                          "p-3 rounded-lg border-2 transition-all text-left",
                          isSelected
                            ? "border-blue-500 bg-blue-50 text-blue-900"
                            : "border-gray-200 bg-white hover:border-gray-300 text-gray-700"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "h-4 w-4 rounded border-2 flex items-center justify-center transition-all",
                              isSelected
                                ? "border-blue-500 bg-blue-500"
                                : "border-gray-300"
                            )}
                          >
                            {isSelected && (
                              <svg
                                className="h-3 w-3 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            )}
                          </div>
                          <span className="text-sm font-medium">{PRODUIT_LABELS[produit]}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {errors.produits_disponibles && (
                  <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                    <span>•</span>
                    {errors.produits_disponibles.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="min-w-[100px]"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-w-[120px] bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Enregistrement...
                </span>
              ) : isEditing ? (
                "Modifier"
              ) : (
                "Créer"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

