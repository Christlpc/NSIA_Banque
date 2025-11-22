# 🔍 Analyse des Fonctionnalités UI Non Connectées à l'API

**Date d'analyse** : 2025-01-27  
**Statut** : Analyse complète effectuée

---

## 📋 Résumé Exécutif

Cette analyse identifie toutes les fonctionnalités UI qui ne sont **pas connectées à des endpoints API** et qui ne déclenchent donc **aucune action réelle** côté backend.

---

## ❌ Fonctionnalités Non Connectées Identifiées

### 1. 🔴 **Bouton "Calculer" dans SimulationActions** (CRITIQUE)

**Fichier** : `components/simulations/SimulationActions.tsx`  
**Ligne** : 40-47

**Problème** :
```typescript
const handleCalculate = async () => {
  try {
    await calculatePrime(simulation.id);
    toast.success("Prime calculée avec succès");
  } catch (error: any) {
    toast.error(error?.message || "Erreur lors du calcul");
  }
};
```

**Analyse** :
- ✅ Appelle `simulationApi.calculatePrime(id)`
- ❌ **L'endpoint `/api/v1/simulations/{id}/calculer/` n'existe PAS dans l'API réelle**
- ❌ Dans `lib/api/simulations.ts`, la méthode `calculatePrime` est marquée `@deprecated` et lance une erreur
- ❌ L'API réelle calcule automatiquement lors de la création via `produitsApi.simulate*()`

**Impact** : 🔴 **CRITIQUE** - Le bouton "Calculer" ne fonctionne pas avec l'API réelle

**Solution** :
- Supprimer le bouton "Calculer" (le calcul se fait automatiquement lors de la création)
- OU utiliser les endpoints de simulation par produit qui calculent automatiquement

---

### 2. 🟡 **Sélecteur de période dans ConversionChart** (MOYEN)

**Fichier** : `components/dashboard/ConversionChart.tsx`  
**Ligne** : 73-77

**Problème** :
```tsx
<select className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-gray-100">
  <option>Hebdomadaire</option>
  <option>Mensuel</option>
  <option>Annuel</option>
</select>
```

**Analyse** :
- ❌ Le select n'a **aucun `onChange`** ou gestionnaire d'événement
- ❌ Ne modifie pas les données affichées
- ❌ Aucune action API associée

**Impact** : 🟡 **MOYEN** - UI non fonctionnelle, peut induire en erreur

**Solution** :
- Ajouter un handler `onChange` pour filtrer les données
- OU supprimer le select si non nécessaire

---

### 3. 🟡 **Boutons "Première" et "Dernière" dans RecentActivity** (MOYEN)

**Fichier** : `components/dashboard/RecentActivity.tsx`  
**Ligne** : 42-49

**Problème** :
```tsx
<Button variant="ghost" size="sm" className="text-xs">
  <ArrowDown className="h-3 w-3 mr-1" />
  Première
</Button>
<Button variant="ghost" size="sm" className="text-xs">
  <ArrowUp className="h-3 w-3 mr-1" />
  Dernière
</Button>
```

**Analyse** :
- ❌ Aucun `onClick` défini
- ❌ Aucune action associée
- ❌ Boutons non fonctionnels

**Impact** : 🟡 **MOYEN** - UI non fonctionnelle

**Solution** :
- Ajouter des handlers pour trier les simulations
- OU supprimer les boutons

---

### 4. 🟡 **Bouton "MoreVertical" dans RecentActivity** (MOYEN)

**Fichier** : `components/dashboard/RecentActivity.tsx`  
**Ligne** : 50-52

**Problème** :
```tsx
<Button variant="ghost" size="icon" className="h-8 w-8">
  <MoreVertical className="h-4 w-4" />
</Button>
```

**Analyse** :
- ❌ Aucun `onClick` ou `DropdownMenu` associé
- ❌ Bouton non fonctionnel

**Impact** : 🟡 **MOYEN** - UI non fonctionnelle

**Solution** :
- Ajouter un menu déroulant avec actions
- OU supprimer le bouton

---

### 5. 🟢 **ProductDistribution - Données Mockées** (FAIBLE)

**Fichier** : `components/dashboard/ProductDistribution.tsx`  
**Ligne** : 6-12

**Problème** :
```typescript
// Données mockées - À remplacer par des données réelles
const data = [
  { name: "Emprunteur", value: 45 },
  { name: "Confort Retraite", value: 25 },
  { name: "Confort Études", value: 20 },
  { name: "Autres", value: 10 },
];
```

**Analyse** :
- ❌ Données hardcodées, pas d'appel API
- ⚠️ Commentaire indique "À remplacer par des données réelles"
- ✅ Pas d'action utilisateur déclenchée (affichage uniquement)

**Impact** : 🟢 **FAIBLE** - Affichage uniquement, pas d'action utilisateur

**Solution** :
- Calculer depuis les simulations réelles
- OU créer un endpoint API pour statistiques

---

### 6. 🟡 **Lien "Éditer" dans SimulationActions** (MOYEN)

**Fichier** : `components/simulations/SimulationActions.tsx`  
**Ligne** : 154-156

**Problème** :
```tsx
<DropdownMenuItem onClick={() => router.push(`/simulations/${simulation.id}/edit`)}>
  Éditer
</DropdownMenuItem>
```

**Analyse** :
- ❌ Redirige vers `/simulations/${id}/edit`
- ❌ **Cette route n'existe PAS** dans `app/(dashboard)/simulations/`
- ❌ Pas de page d'édition créée

**Impact** : 🟡 **MOYEN** - Lien vers une page inexistante (404)

**Solution** :
- Créer la page d'édition `/simulations/[id]/edit/page.tsx`
- OU supprimer l'option d'édition si non nécessaire

---

### 7. 🟢 **QuickStats - Données Calculées Localement** (FAIBLE)

**Fichier** : `components/dashboard/QuickStats.tsx`  
**Ligne** : 22-27, 30-34

**Analyse** :
- ✅ Utilise `useSimulationStore` pour récupérer les simulations
- ✅ Calcule les stats depuis les données locales
- ⚠️ Les pourcentages de changement (`+12%`, `+5%`, etc.) sont **hardcodés**
- ⚠️ Les graphiques utilisent des données générées aléatoirement

**Impact** : 🟢 **FAIBLE** - Fonctionne mais avec données mockées pour les tendances

**Solution** :
- Calculer les tendances depuis l'historique réel
- OU créer un endpoint API pour statistiques avec tendances

---

### 8. 🟢 **RecentActivity - Badge "Fichiers" avec Nombre Aléatoire** (FAIBLE)

**Fichier** : `components/dashboard/RecentActivity.tsx`  
**Ligne** : 86-89

**Problème** :
```tsx
<Badge variant="outline" className="text-xs px-1.5 py-0">
  +{Math.floor(Math.random() * 20) + 1}
</Badge>
```

**Analyse** :
- ❌ Nombre généré aléatoirement à chaque rendu
- ❌ Aucune donnée réelle
- ⚠️ Peut induire en erreur

**Impact** : 🟢 **FAIBLE** - Affichage décoratif mais trompeur

**Solution** :
- Supprimer si non nécessaire
- OU récupérer depuis l'API si cette fonctionnalité existe

---

### 9. 🟢 **BIAPreview - Contrôles Zoom/Page** (FAIBLE)

**Fichier** : `components/exports/BIAPreview.tsx`  
**Ligne** : 13-39

**Analyse** :
- ✅ Contrôles UI fonctionnels (zoom, pagination)
- ✅ Gestion d'état locale uniquement
- ✅ Pas d'action API nécessaire (affichage PDF)

**Impact** : 🟢 **FAIBLE** - Fonctionnalité UI pure, pas d'API nécessaire

**Statut** : ✅ **OK** - Pas de problème, fonctionnalité UI pure

---

### 10. 🟡 **ConversionChart - Labels Incorrects** (MOYEN)

**Fichier** : `components/dashboard/ConversionChart.tsx`  
**Ligne** : 66-72

**Problème** :
```tsx
<div className="flex items-center gap-2">
  <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm" />
  <span className="font-medium text-gray-700">Dépenses</span>
</div>
<div className="flex items-center gap-2">
  <div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm" />
  <span className="font-medium text-gray-700">Paiements</span>
</div>
```

**Analyse** :
- ❌ Labels incorrects : "Dépenses" et "Paiements"
- ✅ Devrait être "Validées" et "Converties" (selon les données)
- ⚠️ Incohérence entre labels et données

**Impact** : 🟡 **MOYEN** - Labels trompeurs

**Solution** :
- Corriger les labels pour correspondre aux données

---

## ✅ Fonctionnalités Correctement Connectées

### Simulations
- ✅ Création via `createSimulation()` → `historiqueApi.createSimulation()`
- ✅ Validation via `validateSimulation()` → `historiqueApi.validateSimulation()`
- ✅ Conversion via `convertSimulation()` → `historiqueApi.souscrireSimulation()`
- ✅ Suppression via `deleteSimulation()` → `historiqueApi.deleteSimulation()`
- ✅ Export BIA via `exportBIA()` → `exportsApi.exportBIA()`

### Souscriptions
- ✅ Toutes les actions connectées à `souscriptionsApi`

### Questionnaires
- ✅ Création et application connectées à `questionnairesApi`

### Utilisateurs
- ✅ Toutes les actions connectées à `userApi`

### Paramètres
- ✅ Profil connecté à `profileApi`
- ✅ Sessions connectées à `profileApi`
- ✅ Historique connecté à `profileApi`
- ✅ Préférences notifications connectées à `profileApi`

---

## 📊 Statistiques

### Problèmes Identifiés
- 🔴 **CRITIQUE** : 1 (Bouton "Calculer")
- 🟡 **MOYEN** : 5 (Sélecteurs, boutons non fonctionnels, liens 404)
- 🟢 **FAIBLE** : 3 (Données mockées, labels incorrects)

**Total** : 9 problèmes identifiés

---

## 🔧 Actions Recommandées

### Priorité 1 (Critique)
1. **Supprimer ou corriger le bouton "Calculer"**
   - Option A : Supprimer (calcul automatique lors de la création)
   - Option B : Utiliser les endpoints de simulation par produit

### Priorité 2 (Moyen)
2. **Créer la page d'édition de simulation** (`/simulations/[id]/edit`)
3. **Corriger les labels du ConversionChart**
4. **Ajouter handlers aux boutons RecentActivity** ou les supprimer
5. **Ajouter handler au select de période** ou le supprimer

### Priorité 3 (Faible)
6. **Remplacer données mockées ProductDistribution** par calcul réel
7. **Calculer tendances réelles dans QuickStats**
8. **Supprimer badge "Fichiers" aléatoire** dans RecentActivity

---

## 📝 Notes Techniques

### Calcul de Prime
L'API réelle calcule automatiquement la prime lors de la création via :
- `produitsApi.simulateEmprunteur()`
- `produitsApi.simulateElikia()`
- `produitsApi.simulateEtudes()`
- `produitsApi.simulateMobateli()`
- `produitsApi.simulateRetraite()`

Il n'y a **pas d'endpoint séparé** pour recalculer une prime existante.

### Édition de Simulation
L'API supporte la mise à jour via `historiqueApi.updateSimulation()`, mais la page d'édition n'existe pas encore.

---

**Note** : Cette analyse est complète et prête pour correction.

