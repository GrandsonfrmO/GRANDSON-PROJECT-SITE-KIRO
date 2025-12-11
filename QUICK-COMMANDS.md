# ⚡ Quick Commands - Production Fix

## 🚀 Déployer les Corrections

```bash
# 1. Ajouter les changements
git add .env.production

# 2. Créer un commit
git commit -m "Fix: Configure production environment variables for images and orders"

# 3. Pousser vers GitHub
git push origin main

# Vercel va redéployer automatiquement (2-3 minutes)
```

---

## 🔍 Identifier le Produit Problématique

### Via Supabase SQL Editor

```sql
-- Trouver les produits sans images
SELECT id, name, images, updated_at
FROM products
WHERE (images IS NULL OR images = '' OR images = '[]')
AND is_active = true
ORDER BY updated_at DESC;
```

---

## 🗑️ Supprimer le Produit Problématique

### Option 1: Désactiver (Recommandé)

```sql
UPDATE products 
SET is_active = false 
WHERE id = [ID_DU_PRODUIT];
```

### Option 2: Supprimer Complètement

```sql
DELETE FROM products 
WHERE id = [ID_DU_PRODUIT];
```

---

## ✅ Vérifier les Corrections

### Vérifier les Images
```bash
# Vérifier que le backend est accessible
curl https://grandson-backend.onrender.com/api/products

# Vérifier que les images s'affichent
curl https://grandsonproject.com/api/products
```

### Vérifier les Commandes
```bash
# Vérifier que l'endpoint de commandes existe
curl https://grandson-backend.onrender.com/api/orders
```

### Exécuter le Script de Vérification
```bash
node backend/verify-production-fix.js
```

---

## 📊 Vérifier les Produits en Base de Données

### Voir tous les produits actifs
```sql
SELECT COUNT(*) as total_active
FROM products
WHERE is_active = true;
```

### Voir les produits sans images
```sql
SELECT COUNT(*) as without_images
FROM products
WHERE (images IS NULL OR images = '' OR images = '[]')
AND is_active = true;
```

### Voir les 10 derniers produits modifiés
```sql
SELECT id, name, images, updated_at
FROM products
WHERE is_active = true
ORDER BY updated_at DESC
LIMIT 10;
```

---

## 🧪 Tester en Production

### Test 1: Images
1. Aller sur https://grandsonproject.com/products
2. Vérifier que les images s'affichent
3. Cliquer sur un produit
4. Vérifier que l'image s'affiche en grand

### Test 2: Commandes
1. Aller sur https://grandsonproject.com/products
2. Ajouter un produit au panier
3. Aller au panier
4. Cliquer sur "Passer la commande"
5. Remplir le formulaire
6. Cliquer sur "Confirmer la Commande"
7. Vérifier que la commande est créée

### Test 3: Email
1. Vérifier que vous recevez un email de confirmation
2. Vérifier que l'email contient les détails de la commande

---

## 🔧 Redéployer Manuellement

### Via Vercel CLI
```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter à Vercel
vercel login

# Redéployer
vercel --prod
```

### Via Vercel Dashboard
1. Aller sur https://vercel.com/dashboard
2. Sélectionner le projet
3. Aller dans "Deployments"
4. Cliquer sur "Redeploy" sur le dernier déploiement

---

## 📋 Checklist Rapide

- [ ] Redéploiement effectué
- [ ] Produit problématique supprimé
- [ ] Images s'affichent correctement
- [ ] Commandes se créent avec succès
- [ ] Emails de confirmation reçus

---

## 🆘 Troubleshooting Rapide

### Images ne s'affichent pas?
```bash
# Vider le cache et rafraîchir
# Ctrl+Shift+Delete (Windows/Linux)
# Cmd+Shift+Delete (Mac)

# Ou ouvrir en mode incognito
# Ctrl+Shift+N (Windows/Linux)
# Cmd+Shift+N (Mac)
```

### Commandes ne se créent pas?
```bash
# Ouvrir la console du navigateur
# F12 ou Cmd+Option+I

# Vérifier les erreurs réseau
# Vérifier que le backend répond
curl https://grandson-backend.onrender.com/api/orders
```

### Produit toujours visible?
```sql
-- Vérifier que le produit a été désactivé
SELECT id, name, is_active
FROM products
WHERE id = [ID_DU_PRODUIT];

-- Si toujours actif, désactiver
UPDATE products 
SET is_active = false 
WHERE id = [ID_DU_PRODUIT];
```

---

## 📞 Support Rapide

| Problème | Solution |
|----------|----------|
| Images ne s'affichent pas | Vider le cache, vérifier BACKEND_URL |
| Commandes ne se créent pas | Vérifier NEXT_PUBLIC_API_URL, vérifier backend |
| Produit toujours visible | Vérifier is_active = false, rafraîchir |
| Backend non accessible | Vérifier https://grandson-backend.onrender.com |
| Vercel n'a pas redéployé | Attendre 5 minutes, forcer redéploiement |

---

**Temps estimé**: 5-20 minutes  
**Complexité**: Faible  
**Risque**: Très faible
