# Production Testing Checklist

Ce document décrit les tests à effectuer en production pour vérifier que toutes les fonctionnalités fonctionnent correctement.

## Prérequis

- [ ] Frontend déployé sur Vercel
- [ ] Backend déployé sur Render
- [ ] Variables d'environnement configurées
- [ ] Cloudinary configuré
- [ ] Supabase configuré

## Tests à effectuer

### 1. Test de création de produit

**Objectif**: Vérifier que l'ajout de produits fonctionne en production

**Étapes**:
1. Se connecter à l'interface admin
2. Aller sur la page "Ajouter un produit"
3. Remplir le formulaire avec les informations suivantes:
   - Nom: "Test Product Production"
   - Prix: 99.99
   - Catégorie: "Test"
   - Stock: 10
   - Description: "Produit de test pour vérifier la production"
4. Uploader une image de test
5. Cliquer sur "Créer le produit"

**Résultat attendu**:
- ✅ Le produit est créé avec succès
- ✅ Un message de confirmation s'affiche
- ✅ L'image est uploadée vers Cloudinary
- ✅ Le produit apparaît dans la liste des produits

**Vérifications**:
- [ ] Produit créé avec succès
- [ ] Image visible dans Cloudinary
- [ ] Produit visible dans la liste admin
- [ ] Aucune erreur dans la console

---

### 2. Test d'affichage des images

**Objectif**: Vérifier que les images s'affichent correctement

**Étapes**:
1. Aller sur la page d'accueil du site
2. Vérifier que les images des produits s'affichent
3. Cliquer sur un produit pour voir les détails
4. Vérifier que l'image du produit s'affiche en grand

**Résultat attendu**:
- ✅ Les images s'affichent correctement
- ✅ Les URLs Cloudinary sont utilisées
- ✅ Les images sont optimisées (transformations Cloudinary)
- ✅ Un placeholder s'affiche pendant le chargement

**Vérifications**:
- [ ] Images visibles sur la page d'accueil
- [ ] Images visibles sur la page produit
- [ ] URLs Cloudinary dans le code source
- [ ] Pas d'erreurs 404 pour les images

---

### 3. Test de modification de produit

**Objectif**: Vérifier que la modification de produits fonctionne

**Étapes**:
1. Aller dans l'interface admin
2. Sélectionner le produit de test créé précédemment
3. Modifier les informations:
   - Nom: "Test Product Production - Updated"
   - Prix: 149.99
   - Stock: 5
4. Sauvegarder les modifications

**Résultat attendu**:
- ✅ Les modifications sont sauvegardées
- ✅ Un message de confirmation s'affiche
- ✅ Les changements sont visibles dans la liste
- ✅ Les logs montrent les modifications

**Vérifications**:
- [ ] Modifications sauvegardées
- [ ] Message de confirmation affiché
- [ ] Changements visibles
- [ ] Logs corrects dans la console

---

### 4. Test de suppression de produit

**Objectif**: Vérifier que la suppression fonctionne

**Étapes**:
1. Aller dans l'interface admin
2. Sélectionner le produit de test
3. Cliquer sur "Supprimer"
4. Confirmer la suppression

**Résultat attendu**:
- ✅ Le produit est supprimé
- ✅ Un message de confirmation s'affiche
- ✅ Le produit n'apparaît plus dans la liste
- ✅ Les logs montrent la suppression

**Vérifications**:
- [ ] Produit supprimé
- [ ] Message de confirmation
- [ ] Produit absent de la liste
- [ ] Logs corrects

---

### 5. Test des erreurs

**Objectif**: Vérifier que les erreurs sont gérées correctement

**Étapes**:
1. Essayer de créer un produit sans nom
2. Essayer d'uploader un fichier trop volumineux (>5MB)
3. Essayer d'uploader un fichier non-image
4. Essayer d'accéder à l'admin sans être connecté

**Résultat attendu**:
- ✅ Messages d'erreur clairs et en français
- ✅ Validation côté client et serveur
- ✅ Redirection vers login si non authentifié
- ✅ Logs d'erreur détaillés

**Vérifications**:
- [ ] Messages d'erreur clairs
- [ ] Validation fonctionne
- [ ] Redirection correcte
- [ ] Logs d'erreur présents

---

### 6. Test de performance

**Objectif**: Vérifier que le site est rapide

**Étapes**:
1. Ouvrir la page d'accueil
2. Mesurer le temps de chargement
3. Vérifier que les images sont optimisées
4. Vérifier qu'il n'y a pas de requêtes bloquantes

**Résultat attendu**:
- ✅ Page d'accueil charge en < 3 secondes
- ✅ Images optimisées avec Cloudinary
- ✅ Pas de requêtes bloquantes
- ✅ Score Lighthouse > 80

**Vérifications**:
- [ ] Temps de chargement acceptable
- [ ] Images optimisées
- [ ] Pas de blocages
- [ ] Score Lighthouse correct

---

### 7. Test CORS

**Objectif**: Vérifier que les requêtes cross-origin fonctionnent

**Étapes**:
1. Ouvrir la console du navigateur
2. Vérifier qu'il n'y a pas d'erreurs CORS
3. Tester une requête API depuis le frontend
4. Vérifier les headers de réponse

**Résultat attendu**:
- ✅ Pas d'erreurs CORS
- ✅ Headers CORS corrects
- ✅ Requêtes autorisées depuis Vercel
- ✅ Credentials supportés

**Vérifications**:
- [ ] Pas d'erreurs CORS
- [ ] Headers corrects
- [ ] Requêtes fonctionnent
- [ ] Credentials OK

---

### 8. Test d'authentification

**Objectif**: Vérifier que l'authentification fonctionne

**Étapes**:
1. Se déconnecter de l'admin
2. Essayer d'accéder à une page admin
3. Se reconnecter
4. Vérifier que le token est valide
5. Attendre l'expiration du token (8h)

**Résultat attendu**:
- ✅ Redirection vers login si non authentifié
- ✅ Token JWT valide
- ✅ Token expire après 8h
- ✅ Messages d'erreur clairs

**Vérifications**:
- [ ] Redirection fonctionne
- [ ] Token valide
- [ ] Expiration correcte
- [ ] Messages clairs

---

## Résumé des tests

| Test | Statut | Notes |
|------|--------|-------|
| Création de produit | ⬜ | |
| Affichage des images | ⬜ | |
| Modification de produit | ⬜ | |
| Suppression de produit | ⬜ | |
| Gestion des erreurs | ⬜ | |
| Performance | ⬜ | |
| CORS | ⬜ | |
| Authentification | ⬜ | |

## Problèmes rencontrés

_Documenter ici tous les problèmes rencontrés pendant les tests_

---

## Validation finale

- [ ] Tous les tests sont passés
- [ ] Aucun problème critique
- [ ] Performance acceptable
- [ ] Logs corrects
- [ ] Production opérationnelle ✅

**Date de validation**: _______________

**Validé par**: _______________
