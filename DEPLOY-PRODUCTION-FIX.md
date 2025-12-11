# 🚀 Déployer les Corrections en Production

## 📋 Checklist Avant Déploiement

- [x] Variables d'environnement configurées dans `.env.production`
- [x] Scripts SQL créés pour identifier les produits problématiques
- [x] Documentation complète fournie
- [ ] Redéploiement effectué sur Vercel
- [ ] Produit problématique supprimé de la base de données
- [ ] Tests en production effectués

---

## 🔧 Étape 1: Redéployer sur Vercel

### Option A: Via Git (Recommandé)

```bash
# 1. Vérifier les changements
git status

# 2. Ajouter les fichiers modifiés
git add .env.production

# 3. Créer un commit
git commit -m "Fix: Configure production environment variables for images and orders

- Set BACKEND_URL to https://grandson-backend.onrender.com
- Set NEXT_PUBLIC_API_URL to https://grandson-backend.onrender.com
- Set FRONTEND_URL to https://grandsonproject.com

This fixes:
- Product images not displaying
- Order creation failing
- Backend communication issues"

# 4. Pousser vers GitHub
git push origin main

# 5. Vercel va automatiquement redéployer
# Attendez 2-3 minutes pour que le déploiement soit complet
```

### Option B: Via Vercel Dashboard

1. Allez sur https://vercel.com/dashboard
2. Sélectionnez le projet "grandsonproject"
3. Allez dans "Settings" → "Environment Variables"
4. Vérifiez que les variables sont correctement configurées:
   - `BACKEND_URL=https://grandson-backend.onrender.com`
   - `NEXT_PUBLIC_API_URL=https://grandson-backend.onrender.com`
   - `FRONTEND_URL=https://grandsonproject.com`
5. Cliquez sur "Redeploy" pour forcer un redéploiement

---

## 🔧 Étape 2: Identifier et Supprimer le Produit Problématique

### Via Supabase Dashboard

1. Allez sur https://app.supabase.com
2. Sélectionnez votre projet
3. Allez dans "SQL Editor"
4. Créez une nouvelle requête
5. Exécutez ce script pour identifier les produits problématiques:

```sql
-- Trouver les produits sans images
SELECT id, name, price, stock, images, updated_at
FROM products
WHERE (images IS NULL OR images = '' OR images = '[]')
AND is_active = true
ORDER BY updated_at DESC;
```

6. Notez l'ID du produit problématique (celui édité par Timberly)

7. Exécutez l'une de ces commandes:

**Option A: Désactiver le produit** (recommandé, réversible)
```sql
UPDATE products 
SET is_active = false 
WHERE id = [ID_DU_PRODUIT];
```

**Option B: Supprimer le produit** (permanent)
```sql
DELETE FROM products 
WHERE id = [ID_DU_PRODUIT];
```

8. Vérifiez que le produit a été supprimé:
```sql
SELECT COUNT(*) as total_active_products
FROM products
WHERE is_active = true;
```

---

## ✅ Étape 3: Vérifier que Tout Fonctionne

### Test 1: Vérifier les Images

1. Allez sur https://grandsonproject.com/products
2. Vérifiez que les images s'affichent correctement
3. Cliquez sur un produit pour voir les détails
4. Vérifiez que l'image s'affiche en grand

**Résultat attendu**: ✅ Toutes les images s'affichent correctement

### Test 2: Vérifier les Commandes

1. Allez sur https://grandsonproject.com/products
2. Cliquez sur un produit
3. Sélectionnez une taille et une quantité
4. Cliquez sur "Ajouter au panier"
5. Allez au panier
6. Cliquez sur "Passer la commande"
7. Remplissez le formulaire:
   - Nom: "Test Client"
   - Téléphone: "+224662662958"
   - Email: "test@example.com"
   - Adresse: "Test Address, Conakry"
   - Quartier: "Kaloum"
8. Cliquez sur "Confirmer la Commande"

**Résultat attendu**: 
- ✅ La commande est créée avec succès
- ✅ Un numéro de commande est affiché
- ✅ Un email de confirmation est reçu

### Test 3: Vérifier le Backend

```bash
# Vérifier que le backend est accessible
curl https://grandson-backend.onrender.com/api/products

# Vérifier que les commandes peuvent être créées
curl -X POST https://grandson-backend.onrender.com/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Test",
    "customerPhone": "+224662662958",
    "customerEmail": "test@example.com",
    "deliveryAddress": "Test",
    "deliveryZone": "Kaloum",
    "items": [],
    "deliveryFee": 0,
    "totalAmount": 0
  }'
```

---

## 🔍 Vérification Complète

### Exécuter le Script de Vérification

```bash
# Exécuter le script de vérification
node backend/verify-production-fix.js
```

Ce script va:
- ✓ Vérifier la connexion au backend
- ✓ Lister tous les produits
- ✓ Identifier les produits sans images
- ✓ Vérifier l'accessibilité des URLs d'images
- ✓ Vérifier l'endpoint de création de commandes

---

## 📊 Vérification des Logs

### Logs Vercel
1. Allez sur https://vercel.com/dashboard
2. Sélectionnez le projet
3. Allez dans "Deployments"
4. Vérifiez que le dernier déploiement est "Ready"
5. Cliquez sur le déploiement pour voir les logs

### Logs Render (Backend)
1. Allez sur https://dashboard.render.com
2. Sélectionnez le service "grandson-backend"
3. Allez dans "Logs"
4. Vérifiez qu'il n'y a pas d'erreurs

### Logs Supabase
1. Allez sur https://app.supabase.com
2. Sélectionnez votre projet
3. Allez dans "Logs"
4. Vérifiez qu'il n'y a pas d'erreurs de base de données

---

## 🆘 Troubleshooting

### Les images ne s'affichent toujours pas?

**Cause 1**: Vercel n'a pas redéployé
- Solution: Attendre 5 minutes et rafraîchir la page
- Ou forcer un redéploiement via Vercel Dashboard

**Cause 2**: Cache du navigateur
- Solution: Vider le cache (Ctrl+Shift+Delete)
- Ou ouvrir en mode incognito

**Cause 3**: Backend non accessible
- Solution: Vérifier que https://grandson-backend.onrender.com est accessible
- Vérifier les logs Render

### Les commandes ne se créent toujours pas?

**Cause 1**: Backend URL non configurée
- Solution: Vérifier que `BACKEND_URL` est configurée dans Vercel
- Vérifier que `NEXT_PUBLIC_API_URL` est configurée

**Cause 2**: Backend non accessible
- Solution: Vérifier que https://grandson-backend.onrender.com/api/orders est accessible
- Vérifier les logs Render

**Cause 3**: Erreur de validation
- Solution: Ouvrir la console du navigateur (F12)
- Vérifier les messages d'erreur
- Vérifier que tous les champs du formulaire sont remplis

### Le produit problématique n'a pas été supprimé?

**Cause 1**: Produit non trouvé
- Solution: Exécuter le script SQL pour identifier le produit
- Vérifier que l'ID est correct

**Cause 2**: Produit toujours actif
- Solution: Vérifier que `is_active = false` a été exécuté
- Vérifier que le changement a été sauvegardé

---

## 📞 Support

Si les problèmes persistent:

1. **Vérifier les logs**: Vercel, Render, Supabase
2. **Exécuter le script de vérification**: `node backend/verify-production-fix.js`
3. **Contacter le support**: contact@grandsonproject.com

---

## ✅ Checklist Finale

- [ ] Redéploiement effectué sur Vercel
- [ ] Produit problématique identifié
- [ ] Produit problématique supprimé
- [ ] Images s'affichent correctement
- [ ] Commandes se créent avec succès
- [ ] Emails de confirmation reçus
- [ ] Pas d'erreurs dans les logs
- [ ] Tests en production réussis

---

**Temps estimé**: 15-20 minutes
**Dernière mise à jour**: 11 Décembre 2025
**Statut**: ✅ Prêt pour le déploiement
