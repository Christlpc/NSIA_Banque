import { describe, it, expect } from "vitest";
import {
  calculateIMC,
  getIMCScore,
  getTabacScore,
  getAlcoolScore,
  getAntecedentsScore,
  getTauxSurprime,
  getCategorieRisque,
} from "@/lib/utils/calculations";
import type { QuestionnaireMedical } from "@/types";

describe("Calculations Utils", () => {
  describe("calculateIMC", () => {
    it("should calculate IMC correctly", () => {
      expect(calculateIMC(70, 175)).toBeCloseTo(22.86, 2);
      expect(calculateIMC(80, 180)).toBeCloseTo(24.69, 2);
    });
  });

  describe("getIMCScore", () => {
    it("should return correct score for normal IMC", () => {
      expect(getIMCScore(22)).toBe(0);
      expect(getIMCScore(24.9)).toBe(0);
    });

    it("should return correct score for overweight", () => {
      expect(getIMCScore(25)).toBe(2);
      expect(getIMCScore(29.9)).toBe(2);
    });

    it("should return correct score for obesity", () => {
      expect(getIMCScore(30)).toBe(5);
      expect(getIMCScore(35)).toBe(5);
    });
  });

  describe("getTabacScore", () => {
    it("should return 0 for non-smoker", () => {
      expect(getTabacScore(false, 0)).toBe(0);
    });

    it("should return correct score for smoker", () => {
      expect(getTabacScore(true, 5)).toBe(2);
      expect(getTabacScore(true, 10)).toBe(4);
      expect(getTabacScore(true, 20)).toBe(6);
    });
  });

  describe("getAlcoolScore", () => {
    it("should return 0 for non-drinker", () => {
      expect(getAlcoolScore(false)).toBe(0);
    });

    it("should return 2 for drinker", () => {
      expect(getAlcoolScore(true)).toBe(2);
    });
  });

  describe("getAntecedentsScore", () => {
    it("should return 0 for no medical history", () => {
      const questionnaire: QuestionnaireMedical = {
        taille_cm: 175,
        poids_kg: 70,
        fumeur: false,
        consomme_alcool: false,
        pratique_sport: false,
        a_infirmite: false,
        malade_6_derniers_mois: false,
        souvent_fatigue: false,
        perte_poids_recente: false,
        prise_poids_recente: false,
        a_ganglions: false,
        fievre_persistante: false,
        plaies_buccales: false,
        diarrhee_frequente: false,
        ballonnement: false,
        oedemes_membres_inferieurs: false,
        essoufflement: false,
        a_eu_perfusion: false,
        a_eu_transfusion: false,
      };

      expect(getAntecedentsScore(questionnaire)).toBe(0);
    });

    it("should calculate score for medical conditions", () => {
      const questionnaire: QuestionnaireMedical = {
        taille_cm: 175,
        poids_kg: 70,
        fumeur: false,
        consomme_alcool: false,
        pratique_sport: false,
        a_infirmite: false,
        malade_6_derniers_mois: true,
        souvent_fatigue: true,
        perte_poids_recente: false,
        prise_poids_recente: false,
        a_ganglions: false,
        fievre_persistante: false,
        plaies_buccales: false,
        diarrhee_frequente: false,
        ballonnement: false,
        oedemes_membres_inferieurs: false,
        essoufflement: false,
        a_eu_perfusion: false,
        a_eu_transfusion: false,
      };

      const score = getAntecedentsScore(questionnaire);
      expect(score).toBeGreaterThan(0);
    });
  });

  describe("getTauxSurprime", () => {
    it("should return 0% for low score", () => {
      expect(getTauxSurprime(5)).toBe(0);
    });

    it("should return 5% for medium score", () => {
      expect(getTauxSurprime(8)).toBe(5);
    });

    it("should return 10% for high score", () => {
      expect(getTauxSurprime(13)).toBe(10);
    });

    it("should return 15% for very high score", () => {
      expect(getTauxSurprime(18)).toBe(15);
    });

    it("should return 20% for maximum score", () => {
      expect(getTauxSurprime(25)).toBe(20);
    });
  });

  describe("getCategorieRisque", () => {
    it("should return 'faible' for low score", () => {
      expect(getCategorieRisque(5)).toBe("faible");
    });

    it("should return 'moyen' for medium score", () => {
      expect(getCategorieRisque(12)).toBe("moyen");
    });

    it("should return 'eleve' for high score", () => {
      expect(getCategorieRisque(18)).toBe("eleve");
    });

    it("should return 'tres_eleve' for very high score", () => {
      expect(getCategorieRisque(25)).toBe("tres_eleve");
    });
  });
});

