// Types utilisateur et authentification
export interface User {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  role: UserRole;
  banque: Banque;
  is_active?: boolean; // Statut actif/inactif de l'utilisateur
}

export type UserRole =
  | "super_admin_nsia"
  | "admin_nsia"
  | "responsable_banque"
  | "gestionnaire"
  | "support";

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

// Types banque
export interface Banque {
  id: number;
  code: string; // ECO, CDCO, BGFI, BCI, etc.
  nom: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  produits_disponibles: ProduitType[];
  nombre_simulations?: number; // Statistique calculée côté serveur
  date_partenariat?: string; // Format: "YYYY-MM-DD"
}

// Types produits
export type ProduitType =
  | "emprunteur"
  | "confort_retraite"
  | "confort_etudes"
  | "elikia_scolaire"
  | "mobateli"
  | "epargne_plus";

export const PRODUIT_LABELS: Record<ProduitType, string> = {
  emprunteur: "Emprunteur (ADI)",
  confort_retraite: "Confort Retraite",
  confort_etudes: "Confort Études",
  elikia_scolaire: "Elikia Scolaire",
  mobateli: "Mobateli",
  epargne_plus: "Épargne Plus",
};

// Types simulation
export type SimulationStatut = "brouillon" | "calculee" | "validee" | "convertie";

export interface Simulation {
  id: string;
  reference: string;
  produit: ProduitType;
  statut: SimulationStatut;
  // Client fields
  nom_client: string;
  prenom_client: string;
  email_client: string;
  telephone_client: string;
  adresse_postale?: string;
  profession?: string;
  employeur?: string;
  numero_compte?: string;
  situation_matrimoniale?: string;
  date_naissance: string; // Kept as is, assuming it maps correctly or needs check

  // Financial fields
  montant_pret?: number;
  duree_mois?: number;
  taux_interet?: number;
  prime_base?: string;
  surprime_taux?: string;
  surprime_montant?: string;
  prime_totale?: string;
  taux_surprime?: number;
  categorie_risque?: string;
  score_total?: number;

  // System fields
  created_at: string; // Maps to date_creation
  updated_at: string; // Maps to date_modification
  created_by: number;
  banque: number;

  // Backward compatibility (optional, for smooth transition if needed)
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  adresse?: string;
}

export interface SimulationCreateData {
  nom: string;
  prenom: string;
  email?: string;
  date_naissance: string;
  date_effet?: string;
  montant_pret?: number;
  duree_mois?: number;
  taux_interet?: number;
  taux_surprime?: number;
  rente_annuelle?: number;
  // Elikia Scolaire & Etudes
  age_parent?: number;
  duree_rente?: number;

  // Confort Etudes
  age_enfant?: number;
  montant_rente?: number;
  duree_paiement?: number;
  duree_service?: number;

  // Mobateli
  capital_dtc_iad?: number;
  age?: number;

  // Confort Retraite
  prime_periodique_commerciale?: number;
  capital_deces?: number;
  duree?: number;
  periodicite?: string;

  profession?: string;
  adresse?: string;
  telephone?: string;
  sauvegarder?: boolean;
}

export interface SimulationFilters {
  statut?: SimulationStatut;
  produit?: ProduitType;
  search?: string;
  date_debut?: string;
  date_fin?: string;
  page?: number;
}

// Types questionnaire médical
export interface QuestionnaireMedical {
  taille: number; // cm
  poids: number; // kg
  fumeur: boolean;
  nb_cigarettes_jour?: number;
  alcool: boolean;
  sport: boolean;
  a_infirmite: boolean;
  malade_6mois: boolean;
  fatigue_frequente: boolean;
  perte_poids: boolean;
  douleur_poitrine: boolean;
  essoufflement: boolean;
  hypertension: boolean;
  diabete: boolean;
  maladie_cardiaque: boolean;
  maladie_respiratoire: boolean;
  maladie_renale: boolean;
  maladie_hepatique: boolean;
  cancer: boolean;
  autre_maladie: boolean;
}

export interface QuestionnaireResponse {
  taux_surprime: number; // 0-20%
  categorie_risque: "faible" | "moyen" | "eleve" | "tres_eleve";
  score_total: number;
  details_scoring: {
    imc_score: number;
    tabac_score: number;
    alcool_score: number;
    antecedents_score: number;
  };
}

// Types calcul
export interface CalculResponse {
  prime_base: string;
  surprime_taux: string;
  surprime_montant: string;
  prime_totale: string;
  details_calcul: Record<string, unknown>;
}

// Types pagination
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Types notification
export interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  duration?: number;
}

// Types pour les réponses de simulation par produit (extensions)
export interface SimulationResultats {
  [key: string]: any;
}

// Types pour les IDs (peuvent être string UUID ou number selon l'API)
export type SimulationId = string | number;

// Types souscriptions
export type SouscriptionStatut = "en_attente" | "validee" | "rejetee";

export interface Souscription {
  id: string; // UUID
  simulation: string; // UUID de la simulation
  nom: string;
  prenom: string;
  date_naissance: string; // YYYY-MM-DD
  email: string;
  telephone: string;
  adresse?: string;
  profession?: string;
  employeur?: string;
  numero_compte?: string;
  date_effet_contrat?: string; // YYYY-MM-DD
  statut: SouscriptionStatut;
  raison_rejet?: string;
  created_at: string;
  updated_at: string;
  created_by: number;
  validated_by?: number;
  validated_at?: string;
  rejected_by?: number;
  rejected_at?: string;
}

