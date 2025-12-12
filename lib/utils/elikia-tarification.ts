/**
 * Table de tarification Elikia Scolaire
 * 
 * Cette table contient les primes prédéfinies basées sur:
 * - La rente annuelle choisie
 * - La durée de la rente
 * - La tranche d'âge du parent/assuré
 */

export interface ElikiaTrancheAge {
    label: string;
    age_min: number;
    age_max: number;
}

export interface ElikiaTarif {
    rente_annuelle: number;
    duree_rente: number;
    prime_unique: number;
    tranche_age: string;
    age_min: number;
    age_max: number;
    prime_annuelle: number;
}

// Tranches d'âge définies
export const ELIKIA_TRANCHES_AGE: ElikiaTrancheAge[] = [
    { label: "45 ans et moins", age_min: 18, age_max: 45 },
    { label: "46-55 ans", age_min: 46, age_max: 55 },
    { label: "56-64 ans", age_min: 56, age_max: 64 },
];

// Montants de rente disponibles
export const ELIKIA_RENTES_ANNUELLES = [200000, 400000, 600000, 800000, 1000000] as const;

// Durées de rente disponibles
export const ELIKIA_DUREES_RENTE = [5] as const;

// Table de tarification complète
export const ELIKIA_TARIFICATION: ElikiaTarif[] = [
    // Rente 200,000 FCFA - Durée 5 ans
    { rente_annuelle: 200000, duree_rente: 5, prime_unique: 953308, tranche_age: "45 ans et moins", age_min: 18, age_max: 45, prime_annuelle: 5000 },
    { rente_annuelle: 200000, duree_rente: 5, prime_unique: 953308, tranche_age: "46-55 ans", age_min: 46, age_max: 55, prime_annuelle: 10000 },
    { rente_annuelle: 200000, duree_rente: 5, prime_unique: 953308, tranche_age: "56-64 ans", age_min: 56, age_max: 64, prime_annuelle: 20000 },

    // Rente 400,000 FCFA - Durée 5 ans
    { rente_annuelle: 400000, duree_rente: 5, prime_unique: 1906616, tranche_age: "45 ans et moins", age_min: 18, age_max: 45, prime_annuelle: 10000 },
    { rente_annuelle: 400000, duree_rente: 5, prime_unique: 1906616, tranche_age: "46-55 ans", age_min: 46, age_max: 55, prime_annuelle: 20000 },
    { rente_annuelle: 400000, duree_rente: 5, prime_unique: 1906616, tranche_age: "56-64 ans", age_min: 56, age_max: 64, prime_annuelle: 37000 },

    // Rente 600,000 FCFA - Durée 5 ans
    { rente_annuelle: 600000, duree_rente: 5, prime_unique: 2859924, tranche_age: "45 ans et moins", age_min: 18, age_max: 45, prime_annuelle: 15000 },
    { rente_annuelle: 600000, duree_rente: 5, prime_unique: 2859924, tranche_age: "46-55 ans", age_min: 46, age_max: 55, prime_annuelle: 30000 },
    { rente_annuelle: 600000, duree_rente: 5, prime_unique: 2859924, tranche_age: "56-64 ans", age_min: 56, age_max: 64, prime_annuelle: 55000 },

    // Rente 800,000 FCFA - Durée 5 ans
    { rente_annuelle: 800000, duree_rente: 5, prime_unique: 3813233, tranche_age: "45 ans et moins", age_min: 18, age_max: 45, prime_annuelle: 20000 },
    { rente_annuelle: 800000, duree_rente: 5, prime_unique: 3813233, tranche_age: "46-55 ans", age_min: 46, age_max: 55, prime_annuelle: 40000 },
    { rente_annuelle: 800000, duree_rente: 5, prime_unique: 3813233, tranche_age: "56-64 ans", age_min: 56, age_max: 64, prime_annuelle: 73000 },

    // Rente 1,000,000 FCFA - Durée 5 ans
    { rente_annuelle: 1000000, duree_rente: 5, prime_unique: 4766541, tranche_age: "45 ans et moins", age_min: 18, age_max: 45, prime_annuelle: 25000 },
    { rente_annuelle: 1000000, duree_rente: 5, prime_unique: 4766541, tranche_age: "46-55 ans", age_min: 46, age_max: 55, prime_annuelle: 50000 },
    { rente_annuelle: 1000000, duree_rente: 5, prime_unique: 4766541, tranche_age: "56-64 ans", age_min: 56, age_max: 64, prime_annuelle: 90000 },
];

/**
 * Détermine la tranche d'âge pour un âge donné
 */
export function getElikiaTrancheAge(age: number): ElikiaTrancheAge | null {
    return ELIKIA_TRANCHES_AGE.find(t => age >= t.age_min && age <= t.age_max) || null;
}

/**
 * Récupère le tarif Elikia basé sur les paramètres
 */
export function getElikiaTarif(
    rente_annuelle: number,
    duree_rente: number,
    age: number
): ElikiaTarif | null {
    const tranche = getElikiaTrancheAge(age);
    if (!tranche) return null;

    return ELIKIA_TARIFICATION.find(
        t => t.rente_annuelle === rente_annuelle &&
            t.duree_rente === duree_rente &&
            t.tranche_age === tranche.label
    ) || null;
}

/**
 * Vérifie si l'âge est éligible pour le produit Elikia
 */
export function isElikiaAgeEligible(age: number): boolean {
    return age >= 18 && age <= 64;
}
