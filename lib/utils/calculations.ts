/**
 * Calcule l'IMC (Indice de Masse Corporelle)
 */
export function calculateIMC(poids: number, taille: number): number {
  const tailleEnMetres = taille / 100;
  return poids / (tailleEnMetres * tailleEnMetres);
}

/**
 * Calcule le score IMC pour le questionnaire médical
 */
export function getIMCScore(imc: number): number {
  if (imc < 18.5) return 3; // Sous-poids
  if (imc >= 18.5 && imc < 25) return 0; // Normal
  if (imc >= 25 && imc < 30) return 2; // Surpoids
  return 5; // Obésité
}

/**
 * Calcule le score tabac
 */
export function getTabacScore(fumeur: boolean, nbCigarettes?: number): number {
  if (!fumeur) return 0;
  if (!nbCigarettes) return 2;
  if (nbCigarettes <= 10) return 2;
  if (nbCigarettes <= 20) return 4;
  return 6;
}

/**
 * Calcule le score alcool
 */
export function getAlcoolScore(alcool: boolean): number {
  return alcool ? 2 : 0;
}

/**
 * Calcule le score des antécédents médicaux
 */
export function getAntecedentsScore(questionnaire: {
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
}): number {
  let score = 0;
  const questions = [
    questionnaire.a_infirmite,
    questionnaire.malade_6mois,
    questionnaire.fatigue_frequente,
    questionnaire.perte_poids,
    questionnaire.douleur_poitrine,
    questionnaire.essoufflement,
    questionnaire.hypertension,
    questionnaire.diabete,
    questionnaire.maladie_cardiaque,
    questionnaire.maladie_respiratoire,
    questionnaire.maladie_renale,
    questionnaire.maladie_hepatique,
    questionnaire.cancer,
    questionnaire.autre_maladie,
  ];

  questions.forEach((q) => {
    if (q) score += 1;
  });

  return score;
}

/**
 * Calcule le taux de surprime basé sur le score total
 */
export function getTauxSurprime(scoreTotal: number): number {
  if (scoreTotal <= 5) return 0;
  if (scoreTotal <= 10) return 5;
  if (scoreTotal <= 15) return 10;
  if (scoreTotal <= 20) return 15;
  return 20;
}

/**
 * Détermine la catégorie de risque
 */
export function getCategorieRisque(scoreTotal: number): "faible" | "moyen" | "eleve" | "tres_eleve" {
  if (scoreTotal <= 5) return "faible";
  if (scoreTotal <= 10) return "moyen";
  if (scoreTotal <= 15) return "eleve";
  return "tres_eleve";
}




