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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUserStore } from "@/lib/store/userStore";
import { ROLES } from "@/lib/utils/constants";
import { getRoleDisplayName } from "@/lib/utils/theme";
import { banqueApi } from "@/lib/api/banques";
import type { User, UserRole, Banque } from "@/types";
import type { UserCreateData, UserUpdateData } from "@/lib/api/users";
import { cn } from "@/lib/utils/cn";
import toast from "react-hot-toast";

const userSchema = z.object({
  username: z.string().min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères"),
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères").optional(),
  nom: z.string().min(1, "Le nom est requis"),
  prenom: z.string().min(1, "Le prénom est requis"),
  role: z.enum([
    "SUPER_ADMIN",
    "ADMIN",
    "RESPONSABLE_BANQUE",
    "GESTIONNAIRE",
    "SUPPORT",
  ]),
  banque: z.union([z.number(), z.string()]).optional(), // Banque optionnelle (null pour SUPER_ADMIN)
  matricule: z.string().optional(), // Matricule employé
  telephone: z.string().optional(), // Téléphone de contact
  is_active: z.boolean().optional(),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserFormProps {
  user?: User & { is_active?: boolean };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserForm({ user, open, onOpenChange }: UserFormProps) {
  const { createUser, updateUser, fetchUsers, filters } = useUserStore();
  const [banques, setBanques] = useState<Banque[]>([]);
  const isEditing = !!user;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: user?.username || "",
      email: user?.email || "",
      password: "",
      nom: user?.nom || "",
      prenom: user?.prenom || "",
      role: user?.role || "GESTIONNAIRE",
      banque: user?.banque?.id || undefined,
      matricule: user?.matricule || "",
      telephone: user?.telephone || "",
      is_active: user?.is_active !== false,
    },
  });

  const selectedRole = watch("role");
  const selectedBanque = watch("banque");

  useEffect(() => {
    const loadBanques = async () => {
      try {
        const response = await banqueApi.getBanques();
        setBanques(response.results);
      } catch (error) {
        console.error("Erreur lors du chargement des banques", error);
      }
    };
    loadBanques();
  }, []);

  useEffect(() => {
    if (user) {
      reset({
        username: user.username || "",
        email: user.email,
        password: "",
        nom: user.nom,
        prenom: user.prenom,
        role: user.role,
        banque: user.banque?.id || undefined,
        matricule: user.matricule || "",
        telephone: user.telephone || "",
        is_active: user.is_active !== false,
      });
    } else {
      reset({
        username: "",
        email: "",
        password: "",
        nom: "",
        prenom: "",
        role: "GESTIONNAIRE",
        banque: undefined,
        matricule: "",
        telephone: "",
        is_active: true,
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: UserFormData) => {
    // Validation de banque seulement si non SUPER_ADMIN
    const needsBanque = data.role !== "SUPER_ADMIN" && data.role !== "ADMIN";
    if (needsBanque && (!data.banque || data.banque === "" || data.banque === 0)) {
      toast.error("Veuillez sélectionner une banque");
      setValue("banque", undefined as any, { shouldValidate: true });
      return;
    }

    try {
      if (isEditing && user) {
        const updateData: UserUpdateData = {
          username: data.username,
          email: data.email,
          nom: data.nom,
          prenom: data.prenom,
          role: data.role,
          banque: data.banque || undefined,
          matricule: data.matricule,
          telephone: data.telephone,
          is_active: data.is_active,
        };
        // Si un nouveau mot de passe est fourni
        if (data.password && data.password.length >= 8) {
          (updateData as any).password = data.password;
        }
        await updateUser(user.id as number, updateData);
      } else {
        if (!data.password || data.password.length < 8) {
          toast.error("Le mot de passe est requis pour créer un utilisateur");
          return;
        }
        const createData: UserCreateData = {
          username: data.username,
          email: data.email,
          password: data.password,
          nom: data.nom,
          prenom: data.prenom,
          role: data.role,
          banque: data.banque || undefined,
          matricule: data.matricule,
          telephone: data.telephone,
          is_active: data.is_active !== false,
        };
        await createUser(createData);
      }
      onOpenChange(false);
      fetchUsers(filters);
    } catch (error: any) {
      // Erreur gérée par le store
    }
  };

  const roleOptions = [
    { value: ROLES.SUPER_ADMIN_NSIA, label: getRoleDisplayName(ROLES.SUPER_ADMIN_NSIA) },
    { value: ROLES.ADMIN_NSIA, label: getRoleDisplayName(ROLES.ADMIN_NSIA) },
    { value: ROLES.RESPONSABLE_BANQUE, label: getRoleDisplayName(ROLES.RESPONSABLE_BANQUE) },
    { value: ROLES.GESTIONNAIRE, label: getRoleDisplayName(ROLES.GESTIONNAIRE) },
    { value: ROLES.SUPPORT, label: getRoleDisplayName(ROLES.SUPPORT) },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg" className="max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Modifier l'utilisateur" : "Créer un nouvel utilisateur"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifiez les informations de l'utilisateur ci-dessous"
              : "Remplissez le formulaire pour créer un nouvel utilisateur dans le système"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
          <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-200px)] flex-1">
            <div className="space-y-6">
              {/* Nom d'utilisateur */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-semibold text-gray-700">
                  Nom d'utilisateur *
                </Label>
                <Input
                  id="username"
                  {...register("username")}
                  placeholder="jean.dupont"
                  className={cn(
                    "transition-all",
                    errors.username ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"
                  )}
                />
                {errors.username && (
                  <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                    <span>•</span>
                    {errors.username.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="prenom" className="text-sm font-semibold text-gray-700">
                    Prénom *
                  </Label>
                  <Input
                    id="prenom"
                    {...register("prenom")}
                    placeholder="Jean"
                    className={cn(
                      "transition-all",
                      errors.prenom ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"
                    )}
                  />
                  {errors.prenom && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <span>•</span>
                      {errors.prenom.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nom" className="text-sm font-semibold text-gray-700">
                    Nom *
                  </Label>
                  <Input
                    id="nom"
                    {...register("nom")}
                    placeholder="Dupont"
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="jean.dupont@example.com"
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
                <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                  Mot de passe {isEditing ? "(laisser vide pour ne pas changer)" : "*"}
                </Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  placeholder={isEditing ? "Nouveau mot de passe (optionnel)" : "Minimum 8 caractères"}
                  className={cn(
                    "transition-all",
                    errors.password ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"
                  )}
                />
                {errors.password && (
                  <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                    <span>•</span>
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-sm font-semibold text-gray-700">
                    Rôle *
                  </Label>
                  <Select
                    value={selectedRole}
                    onValueChange={(value) => setValue("role", value as UserRole)}
                  >
                    <SelectTrigger
                      className={cn(
                        "transition-all",
                        errors.role ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"
                      )}
                    >
                      <SelectValue placeholder="Sélectionner un rôle" />
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.role && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <span>•</span>
                      {errors.role.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="banque" className="text-sm font-semibold text-gray-700">
                    Banque *
                  </Label>
                  <Select
                    value={selectedBanque ? String(selectedBanque) : ""}
                    onValueChange={(value) => {
                      // Les IDs peuvent être des UUIDs (strings) ou des nombres
                      if (value && value.trim() !== "") {
                        setValue("banque", value, { shouldValidate: true });
                      } else {
                        setValue("banque", undefined as any, { shouldValidate: true });
                      }
                    }}
                  >
                    <SelectTrigger
                      className={cn(
                        "transition-all",
                        errors.banque ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"
                      )}
                    >
                      <SelectValue placeholder="Sélectionner une banque" />
                    </SelectTrigger>
                    <SelectContent>
                      {banques.filter(b => b.id).length === 0 ? (
                        <div className="px-2 py-4 text-center text-sm text-gray-500">
                          Aucune banque disponible
                        </div>
                      ) : (
                        banques
                          .filter((banque) => banque.id)
                          .map((banque) => (
                            <SelectItem key={String(banque.id)} value={String(banque.id)}>
                              {banque.nom || `Banque ${banque.id}`}
                            </SelectItem>
                          ))
                      )}
                    </SelectContent>
                  </Select>
                  {errors.banque && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <span>•</span>
                      {errors.banque.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Matricule et Téléphone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="matricule" className="text-sm font-semibold text-gray-700">
                    Matricule
                  </Label>
                  <Input
                    id="matricule"
                    {...register("matricule")}
                    placeholder="MAT-001"
                    className={cn(
                      "transition-all",
                      errors.matricule ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"
                    )}
                    maxLength={50}
                  />
                  {errors.matricule && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <span>•</span>
                      {errors.matricule.message}
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
                    placeholder="+242 06 123 45 67"
                    className={cn(
                      "transition-all",
                      errors.telephone ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"
                    )}
                    maxLength={20}
                  />
                  {errors.telephone && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <span>•</span>
                      {errors.telephone.message}
                    </p>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={watch("is_active")}
                    onChange={(e) => setValue("is_active", e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                  />
                  <Label htmlFor="is_active" className="text-sm font-medium text-gray-700 cursor-pointer">
                    Utilisateur actif
                  </Label>
                </div>
              )}
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

