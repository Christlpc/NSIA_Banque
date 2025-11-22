# 📊 Documentation : Tableau Statistique du Dashboard

**Date** : 2025-01-27  
**Composant** : `QuickStats`

---

## 🔍 Architecture Technique

### 1. **Source des Données**

Le tableau statistique (`QuickStats`) utilise **Zustand Store** pour récupérer les données :

```typescript
const { simulations, fetchSimulations } = useSimulationStore();
```

**Flux de données** :
```
QuickStats Component
    ↓
useSimulationStore (Zustand)
    ↓
simulationApi.getSimulations()
    ↓
GET /api/v1/simulations/historique/
    ↓
API Backend (Django REST Framework)
```

### 2. **Endpoint API Utilisé**

**Endpoint** : `GET /api/v1/simulations/historique/`

**Fichier** : `lib/api/simulations/historique.ts`

```typescript
getSimulations: async (filters?: SimulationFilters): Promise<PaginatedResponse<Simulation>> => {
  const params = new URLSearchParams();
  // ... paramètres de filtrage
  const response = await apiClient.get(`/simulations/historique/?${params}`);
  return response.data;
}
```

**Réponse API** :
```json
{
  "count": 150,
  "next": "...",
  "previous": null,
  "results": [
    {
      "id": 1,
      "reference": "SIM-2025-001",
      "statut": "validee",
      "produit": "emprunteur",
      ...
    }
  ]
}
```

---

## 📈 Calcul des Statistiques

### **Données Réelles (Connectées à l'API)**

Les statistiques principales sont **calculées depuis les simulations réelles** :

```typescript
const stats = {
  total: simulations.length,  // ✅ Réel
  enCours: simulations.filter((s) => 
    s.statut === "brouillon" || s.statut === "calculee"
  ).length,  // ✅ Réel
  validees: simulations.filter((s) => 
    s.statut === "validee"
  ).length,  // ✅ Réel
  converties: simulations.filter((s) => 
    s.statut === "convertie"
  ).length,  // ✅ Réel
};
```

**✅ Ces données sont connectées à l'API** via `fetchSimulations()`.

---

### **Données Mockées (Non Connectées)**

#### 1. **Pourcentages de Changement**

```typescript
const statsCards = [
  {
    change: "+12%",  // ❌ Hardcodé
    change: "+5%",    // ❌ Hardcodé
    change: "+8%",    // ❌ Hardcodé
    change: "+15%",   // ❌ Hardcodé
  }
];
```

**Statut** : ❌ **Non connecté** - Valeurs hardcodées

**Solution** : Calculer depuis l'historique réel (comparaison avec période précédente)

---

#### 2. **Graphiques Mini-Charts**

```typescript
const generateChartData = (baseValue: number) => {
  return Array.from({ length: 7 }, (_, i) => ({
    value: baseValue + Math.random() * 10 - 5,  // ❌ Aléatoire
  }));
};
```

**Statut** : ❌ **Non connecté** - Données générées aléatoirement

**Solution** : Utiliser l'historique réel des simulations (7 derniers jours)

---

#### 3. **Montant Total (FCFA)**

```typescript
amount: `${(stats.total * 12500).toLocaleString("fr-FR")} FCFA`
```

**Statut** : ⚠️ **Calculé approximativement** - Multiplie le nombre par 12500

**Solution** : Utiliser `prime_totale` réelle depuis les simulations

---

## 🔧 Technologies Utilisées

### **Frontend**
- **React** (Next.js 14+)
- **Zustand** : State management
- **Recharts** : Bibliothèque de graphiques
  - `LineChart` : Graphiques mini dans les cartes
  - `ResponsiveContainer` : Responsive design

### **Backend**
- **Django REST Framework**
- **Endpoint** : `/api/v1/simulations/historique/`
- **Format** : JSON (PaginatedResponse)

---

## 📊 Résumé

| Élément | Statut | Source |
|---------|--------|--------|
| **Total Simulations** | ✅ Réel | API `/simulations/historique/` |
| **En Cours** | ✅ Réel | Calcul depuis API |
| **Validées** | ✅ Réel | Calcul depuis API |
| **Converties** | ✅ Réel | Calcul depuis API |
| **Pourcentages (%)** | ❌ Mocké | Hardcodé |
| **Graphiques** | ❌ Mocké | Aléatoire |
| **Montant FCFA** | ⚠️ Approximatif | Calcul (total × 12500) |

---

## 🚀 Améliorations Possibles

### 1. **Endpoint Statistiques Dédié**

Créer un endpoint API pour les statistiques :

```typescript
GET /api/v1/statistiques/dashboard/
```

**Réponse** :
```json
{
  "total": 150,
  "en_cours": 45,
  "validees": 80,
  "converties": 25,
  "evolution": {
    "total": "+12%",
    "en_cours": "+5%",
    "validees": "+8%",
    "converties": "+15%"
  },
  "graphiques": {
    "7_jours": [
      { "date": "2025-01-20", "total": 10, "validees": 5, "converties": 2 },
      ...
    ]
  },
  "montant_total": 1875000
}
```

### 2. **Calcul des Tendances**

Calculer les pourcentages depuis l'historique :

```typescript
// Comparer avec période précédente
const previousPeriod = await getSimulationsForPeriod(previousMonth);
const currentPeriod = simulations;
const evolution = calculateEvolution(previousPeriod, currentPeriod);
```

### 3. **Graphiques Réels**

Utiliser l'historique des 7 derniers jours :

```typescript
const chartData = simulations
  .filter(s => isLast7Days(s.created_at))
  .map(s => ({
    date: formatDate(s.created_at),
    value: getStatValue(s)
  }));
```

---

## ✅ Conclusion

**Le tableau statistique est partiellement connecté à l'API** :
- ✅ **Données principales** : Connectées via `useSimulationStore` → API
- ❌ **Tendances (%)** : Hardcodées
- ❌ **Graphiques** : Données aléatoires
- ⚠️ **Montants** : Calcul approximatif

**Recommandation** : Créer un endpoint API dédié pour les statistiques complètes avec tendances et graphiques réels.

