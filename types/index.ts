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

  // API Response fields (Nested structure)
  donnees_entree?: Record<string, any>;
  resultats_calcul?: Record<string, any>;

  // Backward compatibility (optional, for smooth transition if needed)
  // Additional fields for Etudes and other products
  montant_rente_annuel?: number;
  age_parent?: number;
  age_enfant?: number;
  duree_paiement?: number;
  duree_service?: number;
  debut_service?: number;
  fin_service?: number;
  prime_unique?: string;
  prime_annuelle?: string;

  // Elikia
  rente_annuelle?: number;
  duree_rente?: number;
  prime_nette_annuelle?: number;
  prime_mensuelle?: number;
  capital_garanti?: number;
  tranche_age?: string;

  // Emprunteur
  age_emprunteur?: number;
  taux_applique?: number;
  prime_nette?: number;
  surprime?: number; // Montant surprime
  frais_accessoires?: number;
  net_a_debourser?: number;
  date_effet?: string;

  // Mobateli
  capital_dtc_iad?: number;
  age?: number;

  // Retraite
  prime_periodique_commerciale?: number;
  capital_deces?: number;
  duree?: number;
  periodicite?: string;
  periodicite_libelle?: string;
  prime_deces?: number;
  prime_epargne?: number;
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
  taille_cm: number;
  poids_kg: number;
  tension_arterielle?: string;
  fumeur: boolean;
  nb_cigarettes_jour?: number;
  consomme_alcool: boolean;
  distractions?: string;
  pratique_sport: boolean;
  type_sport?: string;
  a_infirmite: boolean;
  malade_6_derniers_mois: boolean;
  souvent_fatigue: boolean;
  perte_poids_recente: boolean;
  prise_poids_recente: boolean;
  a_ganglions: boolean;
  fievre_persistante: boolean;
  plaies_buccales: boolean;
  diarrhee_frequente: boolean;
  ballonnement: boolean;
  oedemes_membres_inferieurs: boolean;
  essoufflement: boolean;
  a_eu_perfusion: boolean;
  a_eu_transfusion: boolean;
  infos_complementaires?: string;
  commentaire_medical?: string;
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

