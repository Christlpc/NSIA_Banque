# 📋 Planning d'Intégration API et Création d'Interfaces
## NSIA Bancassurance - Frontend

**Date de création** : 2025-01-27  
**Version API** : 1.0.0  
**Base URL** : `https://nsia-bancassurance.onrender.com/api/`  
**Documentation** : https://nsia-bancassurance.onrender.com/api/docs/

---

## 🎯 Objectif

Intégrer complètement l'API backend NSIA Bancassurance et créer toutes les interfaces utilisateur manquantes pour une expérience complète et professionnelle.

---

## 📊 État Actuel de l'Intégration

### ✅ Endpoints Déjà Intégrés

| Module | Endpoints | Statut | Fichier |
|--------|-----------|--------|---------|
| **Authentification** | `/api/v1/token/`, `/api/v1/token/refresh/`, `/api/v1/auth/logout/` | ✅ Intégré | `lib/api/auth.ts` |
| **Utilisateurs** | `/api/v1/utilisateurs/` (CRUD complet) | ✅ Intégré | `lib/api/users.ts` |
| **Banques** | `/api/v1/banques/` (CRUD complet) | ✅ Intégré | `lib/api/banques.ts` |
| **Simulations** | `/api/v1/simulations/historique/` (CRUD partiel) | ⚠️ Partiel | `lib/api/simulations.ts` |

### ❌ Endpoints Non Intégrés

| Module | Endpoints | Priorité | Complexité |
|--------|-----------|----------|------------|
| **Simulations par Produit** | `/api/v1/simulations/emprunteur/`, `/api/v1/simulations/elikia/`, `/api/v1/simulations/etudes/`, `/api/v1/simulations/mobateli/`, `/api/v1/simulations/retraite/` | 🔴 Haute | Moyenne |
| **Questionnaires Médicaux** | `/api/v1/simulations/questionnaires-medicaux/` (CRUD complet) | 🔴 Haute | Moyenne |
| **Souscriptions** | `/api/v1/simulations/souscriptions/` (CRUD complet) | 🟡 Moyenne | Élevée |
| **Export BIA** | `/api/v1/simulations/simulations/{id}/export-bia/`, `/api/v1/simulations/simulations/{id}/preview-bia/` | 🔴 Haute | Faible |
| **Validation/Conversion** | `/api/v1/simulations/historique/{id}/valider/`, `/api/v1/simulations/historique/{id}/souscrire/` | 🔴 Haute | Faible |
| **Profil Utilisateur** | `/api/v1/auth/me/` | 🟡 Moyenne | Faible |
| **Utilisateurs Banque** | `/api/v1/banques/{id}/utilisateurs/` | 🟢 Basse | Faible |
| **Reset Password** | `/api/v1/utilisateurs/{id}/reset_password/` | 🟡 Moyenne | Faible |
| **Toggle Status** | `/api/v1/utilisateurs/{id}/toggle_status/` | 🟢 Basse | Faible |

---

## 🏗️ Architecture d'Intégration

### Structure Actuelle

```
lib/api/
├── client.ts          # Client axios configuré avec intercepteurs
├── auth.ts           # ✅ Authentification
├── users.ts          # ✅ Utilisateurs
├── banques.ts        # ✅ Banques
├── simulations.ts    # ⚠️ Simulations (partiel)
├── profile.ts        # ⚠️ Profil (mock uniquement)
└── notifications.ts  # ⚠️ Notifications (mock uniquement)
```

### Structure Cible

```
lib/api/
├── client.ts
├── auth.ts                    # ✅ Complet
├── users.ts                   # ✅ Complet + Reset Password + Toggle Status
├── banques.ts                 # ✅ Complet + Utilisateurs Banque
├── simulations/
│   ├── index.ts              # Export centralisé
│   ├── historique.ts         # CRUD simulations (historique)
│   ├── produits.ts           # Simulations par produit (emprunteur, elikia, etc.)
│   ├── questionnaires.ts     # Gestion questionnaires médicaux
│   ├── souscriptions.ts      # Gestion souscriptions
│   └── exports.ts            # Export BIA
├── profile.ts                 # ✅ Profil réel
└── notifications.ts          # ⚠️ À vérifier si endpoint existe
```

---

## 📅 Planning Détaillé par Phase

### 🔴 Phase 1 : Intégration Critique (Semaine 1)
**Durée estimée** : 5 jours  
**Objectif** : Intégrer les endpoints essentiels au workflow principal

#### Jour 1-2 : Simulations par Produit
- [ ] **Créer** `lib/api/simulations/produits.ts`
  - [ ] Endpoint `POST /api/v1/simulations/emprunteur/`
  - [ ] Endpoint `POST /api/v1/simulations/elikia/`
  - [ ] Endpoint `POST /api/v1/simulations/etudes/`
  - [ ] Endpoint `POST /api/v1/simulations/mobateli/`
  - [ ] Endpoint `POST /api/v1/simulations/retraite/`
- [ ] **Mettre à jour** `types/index.ts` avec les types de réponse
- [ ] **Adapter** `components/simulations/SimulationForm.tsx` pour utiliser les nouveaux endpoints
- [ ] **Tester** chaque produit avec données réelles

#### Jour 3 : Validation et Conversion
- [ ] **Mettre à jour** `lib/api/simulations.ts`
  - [ ] Endpoint `POST /api/v1/simulations/historique/{id}/valider/`
  - [ ] Endpoint `POST /api/v1/simulations/historique/{id}/souscrire/`
- [ ] **Adapter** `components/simulations/ValidateSimulationDialog.tsx`
- [ ] **Adapter** `components/simulations/ConvertSimulationDialog.tsx`
- [ ] **Tester** le workflow complet

#### Jour 4 : Export BIA
- [ ] **Créer** `lib/api/simulations/exports.ts`
  - [ ] Endpoint `GET /api/v1/simulations/simulations/{id}/export-bia/`
  - [ ] Endpoint `GET /api/v1/simulations/simulations/{id}/preview-bia/`
  - [ ] Endpoint `GET /api/v1/simulations/simulations/{id}/bia-info/`
- [ ] **Mettre à jour** `components/exports/BIAPreview.tsx`
- [ ] **Tester** export et preview

#### Jour 5 : Questionnaires Médicaux
- [ ] **Créer** `lib/api/simulations/questionnaires.ts`
  - [ ] `GET /api/v1/simulations/questionnaires-medicaux/` (liste)
  - [ ] `POST /api/v1/simulations/questionnaires-medicaux/` (création)
  - [ ] `GET /api/v1/simulations/questionnaires-medicaux/{id}/` (détail)
  - [ ] `PATCH /api/v1/simulations/questionnaires-medicaux/{id}/` (mise à jour)
  - [ ] `POST /api/v1/simulations/questionnaires-medicaux/{id}/appliquer-a-simulation/`
  - [ ] `POST /api/v1/simulations/questionnaires-medicaux/{id}/recalculer-surprime/`
  - [ ] `GET /api/v1/simulations/questionnaires-medicaux/bareme/`
- [ ] **Mettre à jour** `components/questionnaire/MedicalForm.tsx`
- [ ] **Tester** création et application de questionnaire

---

### 🟡 Phase 2 : Intégration Secondaire (Semaine 2)
**Durée estimée** : 3-4 jours  
**Objectif** : Compléter les fonctionnalités de gestion

#### Jour 1 : Souscriptions
- [ ] **Créer** `lib/api/simulations/souscriptions.ts`
  - [ ] `GET /api/v1/simulations/souscriptions/` (liste)
  - [ ] `POST /api/v1/simulations/souscriptions/` (création)
  - [ ] `GET /api/v1/simulations/souscriptions/{id}/` (détail)
  - [ ] `PATCH /api/v1/simulations/souscriptions/{id}/` (mise à jour)
  - [ ] `DELETE /api/v1/simulations/souscriptions/{id}/` (suppression)
  - [ ] `POST /api/v1/simulations/souscriptions/{id}/valider/`
  - [ ] `POST /api/v1/simulations/souscriptions/{id}/rejeter/`
- [ ] **Créer** interface de gestion des souscriptions
  - [ ] `app/(dashboard)/souscriptions/page.tsx`
  - [ ] `components/souscriptions/SouscriptionTable.tsx`
  - [ ] `components/souscriptions/SouscriptionDetail.tsx`
- [ ] **Tester** workflow de souscription

#### Jour 2 : Profil Utilisateur
- [ ] **Mettre à jour** `lib/api/profile.ts`
  - [ ] `GET /api/v1/auth/me/` (remplacer mock)
- [ ] **Vérifier** tous les endpoints profil existants
- [ ] **Tester** mise à jour profil

#### Jour 3 : Utilisateurs - Fonctionnalités Avancées
- [ ] **Mettre à jour** `lib/api/users.ts`
  - [ ] `POST /api/v1/utilisateurs/{id}/reset_password/`
  - [ ] `POST /api/v1/utilisateurs/{id}/toggle_status/`
- [ ] **Mettre à jour** `components/users/UsersTable.tsx`
  - [ ] Ajouter bouton "Réinitialiser mot de passe"
  - [ ] Améliorer toggle status
- [ ] **Tester** fonctionnalités

#### Jour 4 : Banques - Utilisateurs
- [ ] **Mettre à jour** `lib/api/banques.ts`
  - [ ] `GET /api/v1/banques/{id}/utilisateurs/`
- [ ] **Mettre à jour** `app/(dashboard)/banques/[id]/page.tsx`
  - [ ] Afficher liste des utilisateurs de la banque
- [ ] **Tester** affichage

---

### 🟢 Phase 3 : Interfaces Utilisateur (Semaine 3)
**Durée estimée** : 4-5 jours  
**Objectif** : Créer toutes les interfaces manquantes

#### Jour 1-2 : Interface Souscriptions
- [ ] **Créer** `app/(dashboard)/souscriptions/page.tsx`
  - [ ] Liste des souscriptions avec filtres
  - [ ] Statistiques (validées, rejetées, en attente)
  - [ ] Actions (valider, rejeter, voir détail)
- [ ] **Créer** `app/(dashboard)/souscriptions/[id]/page.tsx`
  - [ ] Détail complet d'une souscription
  - [ ] Historique des modifications
  - [ ] Actions contextuelles
- [ ] **Créer** composants
  - [ ] `components/souscriptions/SouscriptionTable.tsx`
  - [ ] `components/souscriptions/SouscriptionFilters.tsx`
  - [ ] `components/souscriptions/SouscriptionDetail.tsx`
  - [ ] `components/souscriptions/ValidateSouscriptionDialog.tsx`
  - [ ] `components/souscriptions/RejectSouscriptionDialog.tsx`

#### Jour 3 : Amélioration Interface Questionnaires
- [ ] **Créer** `app/(dashboard)/questionnaires/page.tsx`
  - [ ] Liste des questionnaires médicaux
  - [ ] Filtres (simulation, statut)
  - [ ] Actions (créer, modifier, appliquer)
- [ ] **Améliorer** `components/questionnaire/MedicalForm.tsx`
  - [ ] Intégration avec API réelle
  - [ ] Calcul automatique de surprime
  - [ ] Application à simulation
- [ ] **Créer** composants
  - [ ] `components/questionnaire/QuestionnaireTable.tsx`
  - [ ] `components/questionnaire/QuestionnaireDetail.tsx`
  - [ ] `components/questionnaire/BaremeDisplay.tsx`

#### Jour 4 : Amélioration Interface Simulations
- [ ] **Créer** `app/(dashboard)/simulations/new/[produit]/page.tsx`
  - [ ] Formulaire spécifique par produit
  - [ ] Calcul en temps réel
  - [ ] Sauvegarde automatique
- [ ] **Améliorer** `app/(dashboard)/simulations/[id]/page.tsx`
  - [ ] Affichage complet des résultats
  - [ ] Intégration questionnaire médical
  - [ ] Actions contextuelles (valider, convertir, exporter)
- [ ] **Créer** composants
  - [ ] `components/simulations/ProductSimulationForm.tsx`
  - [ ] `components/simulations/SimulationResults.tsx`
  - [ ] `components/simulations/SimulationTimeline.tsx`

#### Jour 5 : Interface Paramètres Complète
- [ ] **Mettre à jour** `app/(dashboard)/settings/page.tsx`
  - [ ] Profil utilisateur (avec API réelle)
  - [ ] Changement de mot de passe
  - [ ] Préférences de notification
  - [ ] Historique des connexions
  - [ ] Sessions actives
- [ ] **Tester** toutes les fonctionnalités

---

### 🔵 Phase 4 : Optimisations et Finitions (Semaine 4)
**Durée estimée** : 3-4 jours  
**Objectif** : Optimiser, tester et documenter

#### Jour 1 : Gestion d'Erreurs et Validation
- [ ] **Améliorer** gestion d'erreurs dans tous les appels API
- [ ] **Ajouter** validation Zod pour tous les formulaires
- [ ] **Créer** messages d'erreur utilisateur-friendly
- [ ] **Tester** tous les cas d'erreur

#### Jour 2 : Performance et Optimisation
- [ ] **Optimiser** requêtes API (cache, debounce)
- [ ] **Implémenter** optimistic UI pour nouvelles actions
- [ ] **Ajouter** loading states appropriés
- [ ] **Optimiser** bundle size

#### Jour 3 : Tests et Documentation
- [ ] **Tester** tous les workflows end-to-end
- [ ] **Documenter** nouveaux endpoints intégrés
- [ ] **Créer** guide d'utilisation pour nouvelles interfaces
- [ ] **Mettre à jour** README.md

#### Jour 4 : Revue et Corrections
- [ ] **Revue** code complète
- [ ] **Corriger** bugs identifiés
- [ ] **Optimiser** UX/UI
- [ ] **Préparer** déploiement

---

## 🔧 Détails Techniques par Endpoint

### Simulations par Produit

#### Emprunteur
```typescript
POST /api/v1/simulations/emprunteur/
Body: {
  montant_pret: number;
  duree_mois: number;
  date_naissance: string; // YYYY-MM-DD
  date_effet: string; // YYYY-MM-DD
  taux_surprime?: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  sauvegarder: boolean;
}
Response: {
  simulation?: Simulation;
  resultats: {
    age_emprunteur: number;
    taux_applique: number;
    prime_nette: number;
    surprime: number;
    frais_accessoires: number;
    prime_totale: number;
    net_a_debourser: number;
    // ...
  };
  message: string;
}
```

#### Elikia (BCI)
```typescript
POST /api/v1/simulations/elikia/
Body: {
  rente_annuelle: number;
  age_parent: number;
  duree_rente: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  sauvegarder: boolean;
}
Response: {
  simulation?: Simulation;
  resultats: {
    prime_nette_annuelle: number;
    prime_mensuelle: number;
    prime_totale: number;
    capital_garanti: number;
    rente_annuelle: number;
    tranche_age: string;
    // ...
  };
  message: string;
}
```

#### Études
```typescript
POST /api/v1/simulations/etudes/
Body: {
  age_parent: number;
  age_enfant: number;
  montant_rente: number;
  duree_paiement: number;
  duree_service: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  sauvegarder: boolean;
}
Response: {
  simulation?: Simulation;
  resultats: {
    prime_unique: number;
    prime_annuelle: number;
    prime_mensuelle: number;
    montant_rente_annuel: number;
    debut_service: number;
    fin_service: number;
    // ...
  };
  message: string;
}
```

#### Mobateli (BCI)
```typescript
POST /api/v1/simulations/mobateli/
Body: {
  capital_dtc_iad: number;
  age: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  sauvegarder: boolean;
}
Response: {
  simulation?: Simulation;
  resultats: {
    prime_nette: number;
    prime_mensuelle: number;
    capital_dtc_iad: number;
    tranche_age: string;
    // ...
  };
  message: string;
}
```

#### Retraite
```typescript
POST /api/v1/simulations/retraite/
Body: {
  // À documenter depuis l'API
}
Response: {
  simulation?: Simulation;
  resultats: {
    // À documenter depuis l'API
  };
  message: string;
}
```

### Questionnaires Médicaux

```typescript
// Liste
GET /api/v1/simulations/questionnaires-medicaux/

// Création
POST /api/v1/simulations/questionnaires-medicaux/
Body: QuestionnaireMedical

// Détail
GET /api/v1/simulations/questionnaires-medicaux/{id}/

// Mise à jour
PATCH /api/v1/simulations/questionnaires-medicaux/{id}/

// Appliquer à simulation
POST /api/v1/simulations/questionnaires-medicaux/{id}/appliquer-a-simulation/
Body: { simulation_id: string }

// Recalculer surprime
POST /api/v1/simulations/questionnaires-medicaux/{id}/recalculer-surprime/

// Barème
GET /api/v1/simulations/questionnaires-medicaux/bareme/
```

### Souscriptions

```typescript
// Liste
GET /api/v1/simulations/souscriptions/
Query: { page?, search?, statut?, ordering? }

// Création
POST /api/v1/simulations/souscriptions/
Body: {
  simulation: string; // UUID
  nom: string;
  prenom: string;
  date_naissance: string;
  email: string;
  telephone: string;
  adresse?: string;
  profession?: string;
  employeur?: string;
  numero_compte?: string;
  date_effet_contrat: string;
}

// Détail
GET /api/v1/simulations/souscriptions/{id}/

// Mise à jour
PATCH /api/v1/simulations/souscriptions/{id}/

// Suppression
DELETE /api/v1/simulations/souscriptions/{id}/

// Valider
POST /api/v1/simulations/souscriptions/{id}/valider/

// Rejeter
POST /api/v1/simulations/souscriptions/{id}/rejeter/
Body: { raison?: string }
```

---

## 🎨 Interfaces à Créer

### 1. Page Souscriptions (`app/(dashboard)/souscriptions/page.tsx`)

**Fonctionnalités** :
- Tableau des souscriptions avec pagination
- Filtres : statut, date, recherche
- Statistiques en haut (validées, rejetées, en attente)
- Actions : voir détail, valider, rejeter
- Export CSV/Excel

**Composants nécessaires** :
- `SouscriptionTable.tsx`
- `SouscriptionFilters.tsx`
- `SouscriptionStats.tsx`
- `ValidateSouscriptionDialog.tsx`
- `RejectSouscriptionDialog.tsx`

### 2. Page Détail Souscription (`app/(dashboard)/souscriptions/[id]/page.tsx`)

**Fonctionnalités** :
- Informations complètes de la souscription
- Simulation associée
- Historique des modifications
- Actions contextuelles (valider, rejeter)
- Export PDF

**Composants nécessaires** :
- `SouscriptionDetail.tsx`
- `SouscriptionTimeline.tsx`
- `SouscriptionActions.tsx`

### 3. Page Questionnaires (`app/(dashboard)/questionnaires/page.tsx`)

**Fonctionnalités** :
- Liste des questionnaires médicaux
- Filtres : simulation, date
- Création/édition de questionnaire
- Application à simulation
- Affichage barème

**Composants nécessaires** :
- `QuestionnaireTable.tsx`
- `QuestionnaireFilters.tsx`
- `QuestionnaireForm.tsx`
- `BaremeDisplay.tsx`

### 4. Page Simulation par Produit (`app/(dashboard)/simulations/new/[produit]/page.tsx`)

**Fonctionnalités** :
- Formulaire spécifique selon le produit
- Calcul en temps réel
- Prévisualisation des résultats
- Sauvegarde automatique

**Composants nécessaires** :
- `ProductSimulationForm.tsx` (générique)
- `EmprunteurForm.tsx`
- `ElikiaForm.tsx`
- `EtudesForm.tsx`
- `MobateliForm.tsx`
- `RetraiteForm.tsx`
- `SimulationResults.tsx`

---

## 🧪 Tests à Effectuer

### Tests Unitaires
- [ ] Tous les appels API
- [ ] Validation des formulaires
- [ ] Calculs de primes
- [ ] Gestion d'erreurs

### Tests d'Intégration
- [ ] Workflow complet simulation → validation → conversion
- [ ] Workflow questionnaire médical → application → recalcul
- [ ] Workflow souscription → validation/rejet
- [ ] Authentification et permissions

### Tests End-to-End
- [ ] Création simulation emprunteur
- [ ] Création simulation elikia
- [ ] Application questionnaire médical
- [ ] Validation et conversion
- [ ] Export BIA
- [ ] Gestion souscriptions

---

## 📝 Checklist de Validation

### Avant Déploiement
- [ ] Tous les endpoints intégrés et testés
- [ ] Toutes les interfaces créées et fonctionnelles
- [ ] Gestion d'erreurs complète
- [ ] Validation des formulaires
- [ ] Tests passés
- [ ] Documentation à jour
- [ ] Code review effectué
- [ ] Performance optimisée
- [ ] Accessibilité vérifiée
- [ ] Responsive design validé

---

## 🚀 Prochaines Étapes

1. **Valider** ce planning avec l'équipe
2. **Configurer** l'environnement de développement avec l'API réelle
3. **Commencer** Phase 1 - Jour 1 : Simulations par Produit
4. **Suivre** le planning jour par jour
5. **Documenter** les décisions techniques au fur et à mesure

---

## 📚 Ressources

- **Documentation API** : https://nsia-bancassurance.onrender.com/api/docs/
- **Schéma OpenAPI** : `api-schema.json` (local)
- **Codebase Frontend** : Structure actuelle analysée
- **Types TypeScript** : `types/index.ts`

---

**Note** : Ce planning est flexible et peut être ajusté selon les priorités business et les retours de test.

