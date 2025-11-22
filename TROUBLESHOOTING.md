# Guide de Dépannage

## Erreur Router / installHook.js

### Problème
L'erreur `installHook.js` dans le composant Router de Next.js est généralement causée par :
1. Utilisation de hooks React avant le montage côté client
2. Problèmes d'hydratation SSR avec Zustand persist
3. Navigation avant que le router soit prêt

### Solutions Appliquées

#### 1. Hook `useSafeRouter`
Tous les composants utilisent maintenant `useSafeRouter` au lieu de `useRouter` directement :
- Vérifie que le composant est monté avant navigation
- Gère les erreurs avec try/catch
- Fournit `isReady` pour vérifier l'état

#### 2. Store Zustand avec SSR
- `skipHydration: true` pour éviter les problèmes d'hydratation
- Storage conditionnel avec vérification `typeof window`
- Hydratation manuelle dans `StoreHydration`

#### 3. Composants Protégés
- `DashboardLayout` et `ProtectedRoute` vérifient `isMounted` et `router.isReady`
- Les hooks Next.js ne s'exécutent qu'après le montage

### Si l'erreur persiste

1. **Vérifier la version de Next.js** :
```bash
npm list next
```

2. **Mettre à jour Next.js** si nécessaire :
```bash
npm install next@latest
```

3. **Nettoyer le cache** :
```bash
rm -rf .next
npm run dev
```

4. **Vérifier les erreurs dans la console** :
- Ouvrez les DevTools (F12)
- Regardez l'onglet Console pour plus de détails

### Vérifications

- ✅ Tous les `useRouter` remplacés par `useSafeRouter`
- ✅ Store Zustand avec `skipHydration: true`
- ✅ Composants avec vérification `isMounted`
- ✅ Storage conditionnel pour SSR



