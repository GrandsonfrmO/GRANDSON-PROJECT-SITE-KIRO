# Tester le Fix Localement

## 🚀 Démarrer le Développement

### Étape 1 : Installer les dépendances
```bash
cd "GRANDSON PROJECT SITE KIRO"
npm install
```

### Étape 2 : Démarrer le serveur de développement
```bash
npm run dev
```

### Étape 3 : Ouvrir le navigateur
```
http://localhost:3000
```

## 🧪 Tester le Checkout

### Étape 1 : Ajouter un produit au panier
1. Allez sur http://localhost:3000
2. Cliquez sur un produit
3. Sélectionnez une taille
4. Cliquez "Ajouter au panier"

### Étape 2 : Aller au checkout
1. Cliquez sur l'icône du panier
2. Cliquez "Passer la commande"

### Étape 3 : Remplir le formulaire
1. Nom : `Test User`
2. Téléphone : `+224 612 345 678`
3. Email : `test@example.com`
4. Adresse : `Test Address, Conakry`
5. Zone : `Ratoma`
6. Cliquez "Confirmer la Commande"

### Étape 4 : Vérifier la page de confirmation
- [ ] La page affiche votre nom (pas "Client Démo")
- [ ] La page affiche votre email
- [ ] La page affiche votre téléphone
- [ ] La page affiche votre adresse
- [ ] La page affiche votre zone de livraison

## 🔍 Vérifier les Logs

### Étape 1 : Ouvrir la console du navigateur
1. Appuyez sur F12
2. Allez à l'onglet "Console"

### Étape 2 : Vérifier les logs
Vous devriez voir des logs comme :
```
[Supabase] 💾 Saving order...
[Supabase] ✅ Order saved successfully
```

### Étape 3 : Vérifier localStorage
1. Allez à l'onglet "Application"
2. Sélectionnez "Local Storage"
3. Cherchez `demo-order-GS592791`
4. Vérifiez que les données sont sauvegardées

## 🔄 Tester le Fallback

### Étape 1 : Désactiver Supabase (optionnel)
1. Ouvrez `frontend/app/lib/supabaseOrders.ts`
2. Commentez la ligne `const supabase = createClient(...)`
3. Sauvegardez

### Étape 2 : Créer une commande
1. Allez au checkout
2. Remplissez le formulaire
3. Cliquez "Confirmer la Commande"

### Étape 3 : Vérifier le fallback
- [ ] La commande est créée en mode démo
- [ ] Les données sont sauvegardées en localStorage
- [ ] La page de confirmation affiche vos données

### Étape 4 : Réactiver Supabase
1. Décommentez la ligne
2. Sauvegardez

## 📊 Vérifier Supabase

### Étape 1 : Accéder à Supabase
1. Allez sur https://app.supabase.com
2. Sélectionnez le projet "grandson-project"
3. Allez à "Table Editor"

### Étape 2 : Vérifier la table orders
- [ ] La table "orders" existe
- [ ] La table a les colonnes correctes

### Étape 3 : Vérifier les données
1. Cliquez sur la table "orders"
2. [ ] Vous voyez votre commande
3. [ ] Les données correspondent à ce que vous avez entré

## 🧪 Tester les Scripts

### Tester la santé du backend
```bash
node test-backend-health.js
```

Résultat attendu :
```
❌ Backend appears to be unavailable or in sleep mode.
```

(C'est normal, le backend Render est en sommeil)

### Tester la création de commande
```bash
node test-order-creation.js
```

Résultat attendu :
```
✅ Order Created Successfully!
✅ Order Retrieved Successfully!
✅ Data Integrity Verified!
```

## 🔧 Dépannage

### Les données affichent "Client Démo"
**Cause :** Supabase n'a pas sauvegardé la commande

**Solution :**
1. Vérifiez que la table "orders" existe
2. Vérifiez les permissions RLS
3. Exécutez `backend/verify-orders-table.sql`
4. Vérifiez les logs du navigateur (F12)

### Les données disparaissent après rechargement
**Cause :** localStorage n'est pas activé

**Solution :**
1. Vérifiez que localStorage est activé dans le navigateur
2. Vérifiez que le domaine n'est pas en mode privé
3. Vérifiez les logs du navigateur (F12)

### Erreur "Supabase not configured"
**Cause :** Les variables d'environnement ne sont pas définies

**Solution :**
1. Vérifiez `frontend/.env.local`
2. Vérifiez que `NEXT_PUBLIC_SUPABASE_URL` est défini
3. Vérifiez que `NEXT_PUBLIC_SUPABASE_ANON_KEY` est défini
4. Redémarrez le serveur de développement

## 📋 Checklist de Test

- [ ] Le serveur de développement démarre
- [ ] Le site charge correctement
- [ ] Vous pouvez ajouter un produit au panier
- [ ] Vous pouvez aller au checkout
- [ ] Vous pouvez remplir le formulaire
- [ ] Vous pouvez valider la commande
- [ ] La page de confirmation affiche vos données
- [ ] Les données persistent après rechargement
- [ ] Les données sont sauvegardées en localStorage
- [ ] Les données sont sauvegardées dans Supabase

## 🎉 Succès !

Si vous avez coché toutes les cases, le fix fonctionne correctement localement ! 🚀

## 📞 Support

Si vous avez des problèmes :

1. Vérifiez les logs du navigateur (F12)
2. Vérifiez les logs du serveur de développement
3. Consultez `PRODUCTION-ORDERS-FIX-COMPLETE.md`
4. Consultez `VERIFY-PRODUCTION-FIX.md`
