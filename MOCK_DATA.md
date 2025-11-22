# Guide d'utilisation des données Mock

## 🎯 Objectif

Ce système permet de développer et tester l'interface utilisateur **sans avoir besoin de l'API backend**. Toutes les fonctionnalités sont disponibles avec des données de test réalistes.

## ✅ Fonctionnalités disponibles en mode Mock

- ✅ **Authentification** : Connexion avec n'importe quel email
- ✅ **Dashboard** : Statistiques et graphiques avec données mock
- ✅ **Liste des simulations** : 25+ simulations de test avec différents statuts
- ✅ **Création de simulation** : Création fonctionnelle avec sauvegarde mock
- ✅ **Détail simulation** : Affichage complet des informations
- ✅ **Questionnaire médical** : Calcul automatique du score et surprime
- ✅ **Workflow complet** : Brouillon → Calculée → Validée → Convertie
- ✅ **Gestion des banques** : Liste des 7 banques partenaires
- ✅ **Filtres et recherche** : Tous les filtres fonctionnent
- ✅ **Pagination** : Pagination complète

## 🚀 Utilisation

### Mode Mock activé par défaut

Le mode mock est **activé par défaut** dans `lib/utils/config.ts`. Vous pouvez travailler immédiatement sans configuration.

### Désactiver le mode Mock

Pour utiliser l'API réelle, modifiez `lib/utils/config.ts` :

```typescript
export const USE_MOCK_DATA = false; // Désactiver les mocks
```

Ou via variable d'environnement dans `.env.local` :

```env
NEXT_PUBLIC_USE_MOCK=false
```

## 🔐 Connexion en mode Mock

Vous pouvez vous connecter avec **n'importe quel email**. Les utilisateurs mock disponibles :

1. **Super Admin NSIA**
   - Email: `admin@nsia.cg`
   - Accès total

2. **Responsable Banque (Ecobank)**
   - Email: `responsable@ecobank.cg`
   - Produits: Emprunteur, Confort Retraite, Confort Études

3. **Gestionnaire (BGFI)**
   - Email: `gestionnaire@bgfi.cg`
   - Produits: Emprunteur, Confort Retraite, Confort Études, Épargne Plus

**Note** : Vous pouvez aussi utiliser n'importe quel autre email, le système utilisera automatiquement un utilisateur mock.

## 📊 Données Mock disponibles

### Simulations
- **25+ simulations** avec différents statuts
- Réparties sur plusieurs banques (Ecobank, BGFI, BCI)
- Différents produits (Emprunteur, Confort Retraite, etc.)
- Données réalistes (noms, montants, dates)

### Banques
- 7 banques partenaires complètes
- Produits disponibles configurés par banque

## 🎨 Indicateur visuel

Un badge **"🧪 Mode Mock Activé"** apparaît en bas à droite de l'écran quand le mode mock est actif, pour vous rappeler que vous travaillez avec des données de test.

## 🔄 Comportement

- **Délais simulés** : Les requêtes ont des délais réalistes (300-1000ms)
- **Erreurs simulées** : Utilisez `error@test.com` pour tester les erreurs
- **Données persistantes** : Les modifications (création, mise à jour) sont sauvegardées en mémoire pendant la session
- **Pagination** : Fonctionne comme avec l'API réelle

## 📝 Modifier les données Mock

Les données mock sont dans :
- `lib/mock/data.ts` : Données de base (utilisateurs, banques, simulations)
- `lib/mock/auth.ts` : Logique d'authentification mock
- `lib/mock/simulations.ts` : Logique des simulations mock
- `lib/mock/banques.ts` : Logique des banques mock

Vous pouvez facilement modifier ces fichiers pour ajouter/modifier des données de test.

## ⚠️ Important

- Les données mock sont **en mémoire** : elles disparaissent au rechargement de la page
- Pour tester la persistance, utilisez l'API réelle
- Le mode mock est parfait pour le développement UI/UX

## 🎯 Avantages

1. **Développement indépendant** : Travaillez sur le frontend sans attendre l'API
2. **Tests rapides** : Pas besoin de configurer une base de données
3. **Données réalistes** : Scénarios de test variés
4. **Basculement facile** : Passez à l'API réelle en changeant une variable



