# ✅ Checklist Post-Déploiement

## 🚀 Après le déploiement, vérifier les points suivants

### 1️⃣ Backend (Render)

#### Health Check
```bash
curl https://grandson-backend.onrender.com/health
```

Réponse attendue :
```json
{
  "status": "ok",
  "message": "Backend is running",
  "database": "Supabase",
  "timestamp": "2024-12-13T10:30:00.000Z"
}
```

#### Endpoints publics
```bash
# Produits
curl https://grandson-backend.onrender.com/api/products

# Zones de livraison
curl https://grandson-backend.onrender.com/api/delivery-zones

# Login
curl -X POST https://grandson-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'
```

#### Logs
1. Aller sur https://dashboard.render.com
2. Cliquer sur `grandson-backend`
3. Vérifier les logs (pas d'erreurs)

### 2️⃣ Frontend (Vercel)

#### Vérifier le chargement
1. Aller sur https://grandsonproject.com
2. Attendre le chargement complet
3. Vérifier qu'il n'y a pas d'erreurs

#### Vérifier les produits
1. Aller sur la page produits
2. Vérifier que les produits se chargent
3. Vérifier que les images s'affichent

#### Vérifier les commandes
1. Ajouter un produit au panier
2. Aller au checkout
3. Créer une commande
4. Vérifier que la commande est créée

#### Vérifier l'admin
1. Aller sur https://grandsonproject.com/admin/login
2. Se connecter avec les identifiants admin
3. Vérifier que le dashboard se charge
4. Vérifier que les produits s'affichent

#### Console du navigateur (F12)
1. Ouvrir la console
2. Vérifier qu'il n'y a pas d'erreurs
3. Vérifier qu'il n'y a pas d'erreurs CORS
4. Vérifier que les requêtes API réussissent

### 3️⃣ Supabase

#### Vérifier la base de données
1. Aller sur https://app.supabase.com
2. Sélectionner le projet
3. Vérifier que les tables existent
4. Vérifier que les données sont présentes

#### Vérifier les permissions
1. Aller dans "Authentication" → "Policies"
2. Vérifier que les RLS sont configurées
3. Vérifier que les permissions sont correctes

### 4️⃣ Sécurité

#### HTTPS
- [ ] Frontend utilise HTTPS
- [ ] Backend utilise HTTPS
- [ ] Pas de contenu mixte (HTTP + HTTPS)

#### CORS
- [ ] Pas d'erreurs CORS dans la console
- [ ] Backend accepte les requêtes du frontend
- [ ] Pas de requêtes bloquées

#### JWT
- [ ] Les tokens sont générés correctement
- [ ] Les tokens expirent après 8 heures
- [ ] Les routes admin sont protégées

#### Variables d'environnement
- [ ] Pas de clés en dur dans le code
- [ ] Pas de clés dans les logs
- [ ] Pas de clés sur GitHub

### 5️⃣ Performance

#### Temps de réponse
```bash
# Tester la latence
curl -w "Time: %{time_total}s\n" -o /dev/null -s https://grandson-backend.onrender.com/health
```

Acceptable : < 1 seconde

#### Taille des réponses
```bash
# Vérifier la taille
curl -w "Size: %{size_download} bytes\n" -o /dev/null -s https://grandson-backend.onrender.com/api/products
```

#### Compression
```bash
# Vérifier la compression
curl -I https://grandson-backend.onrender.com/api/products | grep -i "content-encoding"
```

Attendu : `gzip` ou `deflate`

### 6️⃣ Monitoring

#### Logs Render
1. Aller sur https://dashboard.render.com
2. Cliquer sur `grandson-backend`
3. Vérifier les logs
4. Chercher les erreurs

#### Logs Vercel
1. Aller sur https://vercel.com/dashboard
2. Cliquer sur le projet
3. Aller dans "Deployments"
4. Vérifier les logs de build

#### Erreurs
- [ ] Pas d'erreurs 500
- [ ] Pas d'erreurs 404
- [ ] Pas d'erreurs de connexion
- [ ] Pas d'erreurs de base de données

### 7️⃣ Fonctionnalités

#### Produits
- [ ] Lister les produits
- [ ] Voir les détails d'un produit
- [ ] Rechercher des produits
- [ ] Filtrer par catégorie

#### Commandes
- [ ] Créer une commande
- [ ] Voir les détails d'une commande
- [ ] Recevoir un email de confirmation
- [ ] Auto-subscribe à la newsletter

#### Admin
- [ ] Login admin
- [ ] Voir le dashboard
- [ ] Lister les produits
- [ ] Créer un produit
- [ ] Modifier un produit
- [ ] Supprimer un produit
- [ ] Lister les commandes
- [ ] Modifier une commande
- [ ] Supprimer une commande

### 8️⃣ Intégrations

#### Supabase
- [ ] Connexion à la base de données
- [ ] Lecture des produits
- [ ] Création de commandes
- [ ] Authentification admin

#### Cloudinary
- [ ] Images des produits s'affichent
- [ ] Upload d'images fonctionne
- [ ] Optimisation des images

#### Email
- [ ] Emails de confirmation envoyés
- [ ] Emails de newsletter envoyés
- [ ] Pas d'erreurs d'envoi

### 9️⃣ Responsive Design

#### Mobile
- [ ] Site s'affiche correctement
- [ ] Pas de scroll horizontal
- [ ] Boutons sont cliquables
- [ ] Images sont optimisées

#### Tablet
- [ ] Layout s'adapte
- [ ] Contenu lisible
- [ ] Navigation fonctionne

#### Desktop
- [ ] Layout complet
- [ ] Tous les éléments visibles
- [ ] Performance acceptable

### 🔟 Accessibilité

#### Clavier
- [ ] Navigation au clavier fonctionne
- [ ] Focus visible
- [ ] Pas de pièges au clavier

#### Lecteur d'écran
- [ ] Texte alternatif sur les images
- [ ] Titres structurés
- [ ] Formulaires accessibles

#### Contraste
- [ ] Texte lisible
- [ ] Contraste suffisant
- [ ] Pas de texte blanc sur blanc

## 📊 Résultats

### ✅ Tout fonctionne ?

Si oui, le déploiement est réussi ! 🎉

### ❌ Quelque chose ne fonctionne pas ?

1. Vérifier les logs
2. Vérifier les variables d'environnement
3. Vérifier la configuration CORS
4. Vérifier la base de données
5. Consulter la documentation

## 📝 Rapport de déploiement

```
Date: 2024-12-13
Backend: ✅ Déployé sur Render
Frontend: ✅ Déployé sur Vercel
Health Check: ✅ OK
Produits: ✅ Chargent correctement
Commandes: ✅ Fonctionnent
Admin: ✅ Accessible
Sécurité: ✅ OK
Performance: ✅ Acceptable
```

## 🎉 Prochaines étapes

1. Monitorer les logs
2. Configurer les alertes
3. Ajouter des tests
4. Optimiser les performances
5. Ajouter des fonctionnalités

## 📞 Support

- Render: https://render.com/support
- Vercel: https://vercel.com/support
- Supabase: https://supabase.com/support
