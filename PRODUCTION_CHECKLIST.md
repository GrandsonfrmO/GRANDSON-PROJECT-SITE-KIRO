# 🚀 Production Deployment Checklist

## Avant le Déploiement

### 1. Sécurité
- [ ] Changer le mot de passe admin par défaut
- [ ] Générer un nouveau JWT_SECRET fort
- [ ] Vérifier que les clés API ne sont pas exposées
- [ ] Configurer HTTPS/SSL
- [ ] Activer les en-têtes de sécurité

### 2. Variables d'Environnement
- [ ] Copier `.env.production` et configurer pour production
- [ ] Mettre à jour `NEXT_PUBLIC_API_URL` avec l'URL backend production
- [ ] Mettre à jour `FRONTEND_URL` dans backend avec l'URL frontend production
- [ ] Vérifier `JWT_SECRET` est unique et sécurisé
- [ ] Configurer les credentials SMTP pour les emails
- [ ] Vérifier les clés Cloudinary

### 3. Base de Données
- [ ] Vérifier que Supabase est configuré
- [ ] Tester la connexion à la base de données
- [ ] Vérifier que toutes les tables existent
- [ ] Créer un utilisateur admin de production

### 4. Build & Tests
- [ ] Exécuter `npm run build` sans erreurs
- [ ] Tester le build localement avec `npm start`
- [ ] Vérifier que toutes les pages se chargent
- [ ] Tester le panier et le checkout
- [ ] Tester l'admin panel
- [ ] Tester sur mobile

### 5. Performance
- [ ] Optimiser les images (compression)
- [ ] Vérifier le cache des assets
- [ ] Tester la vitesse de chargement
- [ ] Vérifier les Core Web Vitals

### 6. Monitoring
- [ ] Configurer les logs d'erreur
- [ ] Mettre en place un système de monitoring
- [ ] Configurer les alertes
- [ ] Tester le endpoint `/health`

## Déploiement

### Option 1: Vercel (Frontend uniquement)

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Déployer
cd frontend
vercel --prod
```

**Variables d'environnement Vercel:**
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET`
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT`

### Option 2: Render (Backend + Frontend)

1. **Backend:**
   - Créer un nouveau Web Service
   - Connecter le repo GitHub
   - Build Command: `npm run build:backend`
   - Start Command: `npm run start:backend`
   - Ajouter toutes les variables d'environnement

2. **Frontend:**
   - Créer un nouveau Static Site
   - Build Command: `npm run build:frontend`
   - Publish Directory: `frontend/.next`
   - Ajouter les variables d'environnement

### Option 3: VPS (Serveur dédié)

```bash
# Sur le serveur
git clone <votre-repo>
cd grandson-project

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.production backend/.env
cp .env.production frontend/.env.local
# Éditer les fichiers avec les vraies valeurs

# Build
npm run build

# Démarrer avec PM2
npm install -g pm2
pm2 start npm --name "grandson-backend" -- run start:backend
pm2 start npm --name "grandson-frontend" -- run start:frontend
pm2 save
pm2 startup
```

## Après le Déploiement

### 1. Vérifications Immédiates
- [ ] Le site est accessible
- [ ] Les images se chargent
- [ ] Le panier fonctionne
- [ ] Le checkout fonctionne
- [ ] L'admin panel est accessible
- [ ] Les emails sont envoyés
- [ ] Les notifications push fonctionnent

### 2. Tests Utilisateur
- [ ] Créer un compte client
- [ ] Ajouter des produits au panier
- [ ] Passer une commande complète
- [ ] Vérifier la réception de l'email
- [ ] Tester sur mobile
- [ ] Tester sur différents navigateurs

### 3. Configuration Admin
- [ ] Se connecter à l'admin panel
- [ ] Changer le mot de passe admin
- [ ] Ajouter les premiers produits
- [ ] Configurer les zones de livraison
- [ ] Configurer les paramètres du site
- [ ] Uploader le logo
- [ ] Configurer les images de marque

### 4. Monitoring
- [ ] Vérifier les logs
- [ ] Configurer les alertes
- [ ] Tester le système de backup
- [ ] Documenter les procédures

## URLs Importantes

### Production
- Frontend: `https://your-domain.com`
- Backend API: `https://api.your-domain.com`
- Admin Panel: `https://your-domain.com/admin/login`

### Monitoring
- Health Check: `https://api.your-domain.com/health`
- Supabase Dashboard: `https://app.supabase.com`
- Cloudinary Dashboard: `https://cloudinary.com/console`

## Commandes Utiles

```bash
# Vérifier le build
npm run build

# Tester en production localement
NODE_ENV=production npm start

# Voir les logs (PM2)
pm2 logs

# Redémarrer les services (PM2)
pm2 restart all

# Vérifier le statut (PM2)
pm2 status
```

## Rollback en Cas de Problème

```bash
# Avec PM2
pm2 stop all
git checkout <previous-commit>
npm install
npm run build
pm2 restart all

# Avec Vercel
vercel rollback
```

## Support

En cas de problème:
1. Vérifier les logs d'erreur
2. Consulter DEPLOYMENT.md
3. Vérifier les variables d'environnement
4. Tester la connexion à la base de données
5. Vérifier les credentials API (Cloudinary, SMTP)

## Notes de Sécurité

⚠️ **IMPORTANT:**
- Ne jamais commiter les fichiers `.env`
- Changer tous les mots de passe par défaut
- Utiliser HTTPS en production
- Configurer un firewall
- Mettre en place des backups réguliers
- Monitorer les tentatives de connexion admin
- Limiter les tentatives de login (rate limiting)

## Performance Attendue

- **Temps de chargement:** < 3s
- **First Contentful Paint:** < 1.5s
- **Time to Interactive:** < 3.5s
- **Lighthouse Score:** > 90

## Maintenance

### Quotidienne
- Vérifier les logs d'erreur
- Monitorer les performances
- Vérifier les commandes

### Hebdomadaire
- Backup de la base de données
- Vérifier l'espace disque
- Analyser les métriques

### Mensuelle
- Mettre à jour les dépendances
- Audit de sécurité
- Optimisation des performances
- Nettoyage des logs
