import { delay, mockSimulations } from "./data";
import type {
  Simulation,
  SimulationCreateData,
  SimulationFilters,
  PaginatedResponse,
  CalculResponse,
  QuestionnaireMedical,
  QuestionnaireResponse,
} from "@/types";

export const mockSimulationApi = {
  getSimulations: async (filters?: SimulationFilters): Promise<PaginatedResponse<Simulation>> => {
    await delay(500);

    let filtered = [...mockSimulations];

    // Filtrer par statut
    if (filters?.statut) {
      filtered = filtered.filter((s) => s.statut === filters.statut);
    }

    // Filtrer par produit
    if (filters?.produit) {
      filtered = filtered.filter((s) => s.produit === filters.produit);
    }

    // Filtrer par recherche
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          (s.nom_client || "").toLowerCase().includes(search) ||
          (s.prenom_client || "").toLowerCase().includes(search) ||
          s.reference.toLowerCase().includes(search)
      );
    }

    // Pagination
    const page = filters?.page || 1;
    const pageSize = 10;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginated = filtered.slice(start, end);

    return {
      count: filtered.length,
      next: end < filtered.length ? `?page=${page + 1}` : null,
      previous: page > 1 ? `?page=${page - 1}` : null,
      results: paginated,
    };
  },

  getSimulation: async (id: string): Promise<Simulation> => {
    await delay(300);
    const simulation = mockSimulations.find((s) => s.id === id);
    if (!simulation) {
      throw new Error("Simulation introuvable");
    }
    return simulation;
  },

  createSimulation: async (product: string, data: SimulationCreateData): Promise<Simulation> => {
    await delay(600);
    const newId = (mockSimulations.length + 1).toString();
    const newSimulation: Simulation = {
      id: newId,
      reference: `SIM-${newId}`,
      produit: data.produit as any, // Cast for mock purposes
      statut: "brouillon",
      ...data,
      // Map create data to client fields
      nom_client: data.nom,
      prenom_client: data.prenom,
      email_client: data.email || "",
      telephone_client: data.telephone || "",
      adresse_postale: data.adresse,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 1,
      banque: 1,
    };
    mockSimulations.push(newSimulation);
    return newSimulation;
  },

  updateSimulation: async (id: string, data: Partial<SimulationCreateData>): Promise<Simulation> => {
    await delay(400);
    const index = mockSimulations.findIndex((s) => s.id === id);
    if (index === -1) {
      throw new Error("Simulation introuvable");
    }
    mockSimulations[index] = {
      ...mockSimulations[index],
      ...data,
      updated_at: new Date().toISOString(),
    };
    return mockSimulations[index];
  },

  deleteSimulation: async (id: string): Promise<void> => {
    await delay(300);
    const index = mockSimulations.findIndex((s) => s.id === id);
    if (index !== -1) {
      mockSimulations.splice(index, 1);
    }
  },

  calculatePrime: async (id: string): Promise<CalculResponse> => {
    await delay(800);
    const simulation = mockSimulations.find((s) => s.id === id);
    if (!simulation) {
      throw new Error("Simulation introuvable");
    }

    const primeBase = 100000 + Math.random() * 500000;
    const surprimeTaux = (Math.random() * 20).toFixed(1);
    const surprimeMontant = (primeBase * (parseFloat(surprimeTaux) / 100)).toFixed(2);
    const primeTotale = (primeBase + parseFloat(surprimeMontant)).toFixed(2);

    // Mettre à jour la simulation
    simulation.statut = "calculee";
    simulation.prime_base = primeBase.toFixed(2);
    simulation.surprime_taux = surprimeTaux;
    simulation.surprime_montant = surprimeMontant;
    simulation.prime_totale = primeTotale;
    simulation.updated_at = new Date().toISOString();

    return {
      prime_base: primeBase.toFixed(2),
      surprime_taux: surprimeTaux,
      surprime_montant: surprimeMontant,
      prime_totale: primeTotale,
      details_calcul: {},
    };
  },

  submitQuestionnaire: async (
    id: string,
    questionnaire: QuestionnaireMedical
  ): Promise<QuestionnaireResponse> => {
    await delay(600);
    const simulation = mockSimulations.find((s) => s.id === id);
    if (!simulation) {
      throw new Error("Simulation introuvable");
    }

    // Calculer le score (simplifié)
    const imc = questionnaire.poids / Math.pow(questionnaire.taille / 100, 2);
    let score = 0;
    if (imc < 18.5) score += 3;
    else if (imc >= 25 && imc < 30) score += 2;
    else if (imc >= 30) score += 5;
    if (questionnaire.fumeur) score += questionnaire.nb_cigarettes_jour ? 4 : 2;
    if (questionnaire.alcool) score += 2;

    const antecedents = [
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
    ].filter(Boolean).length;

    score += antecedents;

    let tauxSurprime = 0;
    if (score <= 5) tauxSurprime = 0;
    else if (score <= 10) tauxSurprime = 5;
    else if (score <= 15) tauxSurprime = 10;
    else if (score <= 20) tauxSurprime = 15;
    else tauxSurprime = 20;

    const categorie =
      score <= 5 ? "faible" : score <= 10 ? "moyen" : score <= 15 ? "eleve" : "tres_eleve";

    // Mettre à jour la simulation
    simulation.taux_surprime = tauxSurprime;
    simulation.categorie_risque = categorie;
    simulation.score_total = score;
    simulation.updated_at = new Date().toISOString();

    return {
      taux_surprime: tauxSurprime,
      categorie_risque: categorie as any,
      score_total: score,
      details_scoring: {
        imc_score: imc < 18.5 ? 3 : imc >= 25 && imc < 30 ? 2 : imc >= 30 ? 5 : 0,
        tabac_score: questionnaire.fumeur ? (questionnaire.nb_cigarettes_jour ? 4 : 2) : 0,
        alcool_score: questionnaire.alcool ? 2 : 0,
        antecedents_score: antecedents,
      },
    };
  },

  validateSimulation: async (id: string): Promise<Simulation> => {
    await delay(400);
    const simulation = mockSimulations.find((s) => s.id === id);
    if (!simulation) {
      throw new Error("Simulation introuvable");
    }
    simulation.statut = "validee";
    simulation.updated_at = new Date().toISOString();
    return simulation;
  },

  convertSimulation: async (id: string): Promise<Simulation> => {
    await delay(500);
    const simulation = mockSimulations.find((s) => s.id === id);
    if (!simulation) {
      throw new Error("Simulation introuvable");
    }
    simulation.statut = "convertie";
    simulation.updated_at = new Date().toISOString();
    return simulation;
  },

  exportBIA: async (id: string): Promise<Blob> => {
    await delay(1000);
    // Retourner un blob PDF mock (vide pour l'instant)
    return new Blob(["Mock PDF content"], { type: "application/pdf" });
  },

  previewBIA: async (id: string): Promise<string> => {
    await delay(800);
    // Retourner une URL mock pour le preview
    return "data:application/pdf;base64,JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKL01lZGlhQm94IFswIDAgNjEyIDc5Ml0KPj4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovUmVzb3VyY2VzIDw8Ci9Gb250IDw8Ci9GMSA0IDAgUgo+Pgo+PgovQ29udGVudHMgNSAwIFIKPj4KZW5kb2JqCjQgMCBvYmoKPDwKL1R5cGUgL0ZvbnQKL1N1YnR5cGUgL1R5cGUxCi9CYXNlRm9udCAvSGVsdmV0aWNhCj4+CmV5ZG9iago1IDAgb2JqCjw8Ci9MZW5ndGggNDQKPj4Kc3RyZWFtCkJUCi9GMSAxMiBUZgoxMDAgNzAwIFRkCihNb2NrIFBERiBQcmV2aWV3KSBUagpFVAplbmRzdHJlYW0KZW5kb2JqCnhyZWYKMCA2CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAwOSAwMDAwMCBuIAowMDAwMDAwMDc3IDAwMDAwIG4gCjAwMDAwMDAwMzMgMDAwMDAgbgowMDAwMDAwMTIxIDAwMDAwIG4gCjAwMDAwMDAxNzYgMDAwMDAgbgp0cmFpbGVyCjw8Ci9TaXplIDYKL1Jvb3QgMSAwIFIKPj4Kc3RhcnR4cmVmCjI0NQolJUVPRgo=";
  },
};




