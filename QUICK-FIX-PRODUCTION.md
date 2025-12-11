# 🚀 Quick Fix - Production Issues

## ✅ Corrections Appliquées

### 1. Variables d'Environnement Configurées
**Fichier**: `.env.production`

```env
BACKEND_URL=https://grandson-backend.onrender.com
NEXT_PUBLIC_API_URL=https://grandson-backend.onrender.com
FRONTEND_URL=https://grandsonproject.com
```

**Impact**: 
- ✅ Les images vont maintenant s'afficher correctement
- ✅ Les commandes vont se créer avec succès

---

## 🔧 Actions à Effectuer Maintenant

### Étape 1: Redéployer sur Vercel
```bash
git add .env.production
git commit -m "Fix: Configure production environment variables"
git push
```

Vercel va automatiquement redéployer. Attendez 2-3 minutes.

### Étape 2: Identifier et Supprimer le Produit Problématique

1. Allez sur https://app.supabase.com
2. Sélectionnez votre projet
3. Allez dans "SQL Editor"
4. Exécutez ce script:

```sql
-- Trouver les produits sans images
SELECT id, name, images, updated_at
FROM products
WHERE images IS NULL OR images = '' OR images = '[]'
ORDER BY updated_at DESC;
```

5. Notez l'ID du produit problématique
6. Exécutez:

```sql
-- Désactiver le produit
UPDATE products 
SET is_active = false 
WHERE id = [ID_DU_PRODUIT];
```

Ou pour le supprimer complètement:

```sql
-- Supprimer le produit
DELETE FROM products 
WHERE id = [ID_DU_PRODUIT];
```

### Étape 3: Vérifier que Tout Fonctionne

1. Allez sur https://grandsonproject.com/products
2. Vérifiez que les images s'affichent ✓
3. Essayez de créer une commande ✓
4. Vérifiez que vous recevez un email de confirmation ✓

---

## 📊 Vérification Rapide

### Vérifier les produits actifs
```sql
SELECT COUNT(*) as total_products
FROM products
WHERE is_active = true;
```

### Vérifier les produits sans images
```sql
SELECT COUNT(*) as products_without_images
FROM products
WHERE (images IS NULL OR images = '' OR images = '[]')
AND is_active = true;
```

### Voir les 5 derniers produits modifiés
```sql
SELECT id, name, images, updated_at
FROM products
WHERE is_active = true
ORDER BY updated_at DESC
LIMIT 5;
```

---

## 🎯 Résumé des Corrections

| Problème | Cause | Solution | Statut |
|----------|-------|----------|--------|
| Images ne s'affichent pas | URLs non configurées | Configuré BACKEND_URL | ✅ |
| Commandes ne fonctionnent pas | Backend URL manquant | Configuré NEXT_PUBLIC_API_URL | ✅ |
| Produit à supprimer | Données invalides | Script SQL fourni | ⏳ À faire |

---

## 🔍 Troubleshooting

### Les images ne s'affichent toujours pas?
1. Vider le cache du navigateur (Ctrl+Shift+Delete)
2. Vérifier que Vercel a redéployé (voir les logs)
3. Vérifier que le backend est accessible: https://grandson-backend.onrender.com/api/products

### Les commandes ne se créent toujours pas?
1. Ouvrir la console du navigateur (F12)
2. Vérifier les erreurs réseau
3. Vérifier que le backend répond: https://grandson-backend.onrender.com/api/orders

### Le produit problématique n'apparaît pas?
1. Vérifier que le produit a `is_active = true`
2. Vérifier que le produit a des images valides
3. Vérifier que le produit a un prix > 0

---

## 📞 Support

Si les problèmes persistent après ces corrections:

1. **Vérifier les logs Vercel**: https://vercel.com/dashboard
2. **Vérifier les logs Render**: https://dashboard.render.com
3. **Vérifier Supabase**: https://app.supabase.com
4. **Contacter le support**: contact@grandsonproject.com

---

**Temps estimé pour la correction**: 5-10 minutes
**Dernière mise à jour**: 2025-12-11
