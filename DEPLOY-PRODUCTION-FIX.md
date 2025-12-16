# Déployer le Fix Production sur Vercel

## 🚀 Déploiement Automatique

Si vous avez poussé les changements sur GitHub, Vercel devrait déployer automatiquement.

### Vérifier le déploiement
1. Allez sur https://vercel.com/dashboard
2. Sélectionnez le projet "grandson-project-site-kiro"
3. Allez à "Deployments"
4. Vérifiez que le dernier déploiement est "Ready"

## 📝 Déploiement Manuel

### Étape 1 : Vérifier les changements localement
```bash
# Allez dans le répertoire du projet
cd "GRANDSON PROJECT SITE KIRO"

# Vérifiez que les fichiers existent
ls frontend/app/lib/supabaseOrders.ts
ls frontend/app/api/orders/route.ts
ls frontend/app/api/orders/[orderNumber]/route.ts

# Testez localement
npm run dev
# Allez à http://localhost:3000
# Testez le checkout
```

### Étape 2 : Pousser sur GitHub
```bash
# Ajoutez les changements
git add .

# Commitez
git commit -m "Fix: Production demo mode - Add Supabase direct fallback for orders"

# Poussez
git push origin main
```

### Étape 3 : Vérifier le déploiement Vercel
1. Allez sur https://vercel.com/dashboard
2. Sélectionnez le projet
3. Attendez que le déploiement se termine
4. Vérifiez que le statut est "Ready"

## 🔧 Configuration Vercel

### Vérifier les variables d'environnement
1. Allez sur https://vercel.com/dashboard
2. Sélectionnez le projet
3. Allez à "Settings" → "Environment Variables"
4. Vérifiez que ces variables existent :
   - `NEXT_PUBLIC_SUPABASE_URL` ✅
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✅
   - `BACKEND_URL` ✅

### Si les variables manquent
1. Allez à "Settings" → "Environment Variables"
2. Cliquez "Add"
3. Ajoutez les variables manquantes
4. Redéployez

## 📊 Vérifier le Déploiement

### Étape 1 : Vérifier que le site fonctionne
1. Allez sur https://grandson-project-site-kiro.vercel.app
2. Vérifiez que le site charge correctement
3. Vérifiez que les produits s'affichent

### Étape 2 : Tester le checkout
1. Ajoutez un produit au panier
2. Allez au checkout
3. Entrez vos informations
4. Validez
5. Vérifiez que la page de confirmation affiche VOS données (pas "Client Démo")

### Étape 3 : Vérifier les logs
1. Allez sur https://vercel.com/dashboard
2. Sélectionnez le projet
3. Allez à "Deployments"
4. Sélectionnez le dernier déploiement
5. Cliquez "View Logs"
6. Vérifiez qu'il n'y a pas d'erreurs

## 🔄 Rollback (Si Problème)

Si quelque chose ne fonctionne pas :

### Étape 1 : Identifier le problème
1. Vérifiez les logs Vercel
2. Vérifiez les logs du navigateur (F12)
3. Vérifiez la table "orders" dans Supabase

### Étape 2 : Rollback
```bash
# Revenez au commit précédent
git revert HEAD

# Poussez
git push origin main

# Vercel redéploiera automatiquement
```

### Étape 3 : Vérifier le rollback
1. Allez sur https://vercel.com/dashboard
2. Attendez que le déploiement se termine
3. Testez le site

## 📋 Checklist de Déploiement

- [ ] Les fichiers existent localement
- [ ] Les changements sont testés localement
- [ ] Les changements sont poussés sur GitHub
- [ ] Vercel a déployé (status "Ready")
- [ ] Le site fonctionne
- [ ] Le checkout fonctionne
- [ ] Les données s'affichent correctement
- [ ] Pas d'erreurs dans les logs

## 🎉 Succès !

Si vous avez coché toutes les cases, le déploiement est réussi ! 🚀

## 📞 Support

Si vous avez des problèmes :

1. Vérifiez les logs Vercel
2. Vérifiez les logs du navigateur (F12)
3. Consultez `PRODUCTION-ORDERS-FIX-COMPLETE.md`
4. Consultez `VERIFY-PRODUCTION-FIX.md`
