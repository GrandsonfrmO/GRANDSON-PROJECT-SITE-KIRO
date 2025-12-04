# Guide de Déploiement - Grandson Project

## 🚀 Déploiement sur Vercel

### Prérequis

1. **Compte Vercel** : https://vercel.com
2. **Vercel CLI** : `npm install -g vercel`
3. **Git** : Tout le code doit être commité
4. **Variables d'environnement** : Configurées dans Vercel Dashboard

### Étapes de Déploiement

#### 1. Vérifier le Code

```bash
# Vérifier que tout est commité
git status

# Si des changements non commités
git add -A
git commit -m "description des changements"
```

#### 2. Pousser sur GitHub

```bash
git push origin main
```

#### 3. Déployer sur Vercel

**Option A : Déploiement Automatique (Recommandé)**
- Vercel se connecte automatiquement à GitHub
- Chaque push sur `main` déclenche un déploiement
- Vérifier sur https://vercel.com/dashboard

**Option B : Déploiement Manuel**

Windows :
```bash
deploy-vercel.bat
```

Linux/Mac :
```bash
chmod +x deploy-vercel.sh
./deploy-vercel.sh
```

Ou directement :
```bash
vercel --prod
```

### Configuration Vercel

#### Variables d'Environnement

Aller dans **Vercel Dashboard** → **Settings** → **Environment Variables**

Ajouter les variables suivantes :

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Backend
BACKEND_URL=https://your-backend-domain.com

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
ADMIN_EMAIL=admin@example.com
CONTACT_EMAIL=contact@example.com
CONTACT_PHONE=+224662662958

# Push Notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-public-key
VAPID_PRIVATE_KEY=your-private-key
VAPID_SUBJECT=mailto:contact@example.com

# JWT
JWT_SECRET=your-secret-key-change-this

# Cloudinary (optionnel)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

#### Domaine Personnalisé

1. Aller dans **Vercel Dashboard** → **Domains**
2. Ajouter votre domaine
3. Configurer les DNS records selon les instructions Vercel

### Vérification du Déploiement

Après le déploiement, vérifier :

```bash
# 1. Vérifier que le site est accessible
curl https://your-domain.com

# 2. Vérifier les logs
vercel logs

# 3. Vérifier les variables d'environnement
vercel env list
```

### Rollback (Revenir à une Version Antérieure)

```bash
# Voir l'historique des déploiements
vercel list

# Redéployer une version antérieure
vercel rollback
```

---

## 📋 Checklist de Déploiement

### Avant le Déploiement

- [ ] Tout le code est commité
- [ ] Les tests passent localement
- [ ] La build est réussie (`npm run build`)
- [ ] Les variables d'environnement sont configurées
- [ ] Le backend est accessible
- [ ] La base de données est à jour

### Pendant le Déploiement

- [ ] Vercel construit le projet
- [ ] Les tests passent en CI/CD
- [ ] Le déploiement est réussi
- [ ] Les logs ne montrent pas d'erreurs

### Après le Déploiement

- [ ] Le site est accessible
- [ ] Les pages se chargent correctement
- [ ] Les API fonctionnent
- [ ] Les emails sont envoyés
- [ ] Les notifications push fonctionnent
- [ ] Les images s'affichent

---

## 🔧 Dépannage

### Erreur : "Vercel CLI not found"

```bash
npm install -g vercel
vercel login
```

### Erreur : "Build failed"

1. Vérifier les logs : `vercel logs`
2. Vérifier les variables d'environnement
3. Vérifier que le backend est accessible
4. Vérifier les dépendances : `npm install`

### Erreur : "Environment variables not set"

1. Aller dans Vercel Dashboard
2. Settings → Environment Variables
3. Ajouter les variables manquantes
4. Redéployer

### Erreur : "Database connection failed"

1. Vérifier que Supabase est accessible
2. Vérifier les clés Supabase
3. Vérifier les règles RLS (Row Level Security)
4. Vérifier les migrations de base de données

### Erreur : "Email not sending"

1. Vérifier les credentials SMTP
2. Vérifier que le port SMTP est correct (587 pour TLS)
3. Vérifier les logs du backend
4. Tester avec un email de test

---

## 📊 Monitoring

### Vercel Analytics

1. Aller dans **Vercel Dashboard** → **Analytics**
2. Voir les performances du site
3. Voir les erreurs et les logs

### Logs en Temps Réel

```bash
vercel logs --follow
```

### Métriques

- **First Contentful Paint (FCP)** : < 1.8s
- **Largest Contentful Paint (LCP)** : < 2.5s
- **Cumulative Layout Shift (CLS)** : < 0.1

---

## 🔐 Sécurité

### Bonnes Pratiques

1. **Ne jamais commiter les secrets** : Utiliser `.env.local` et `.gitignore`
2. **Utiliser des variables d'environnement** : Pour tous les secrets
3. **Activer HTTPS** : Vercel le fait automatiquement
4. **Configurer les CORS** : Si nécessaire
5. **Valider les entrées** : Côté serveur et client

### Secrets Sensibles

Ne jamais commiter :
- Clés API
- Mots de passe
- Tokens JWT
- Clés privées

Utiliser Vercel Secrets :
```bash
vercel env add SECRET_NAME
```

---

## 📈 Performance

### Optimisations

1. **Images** : Utiliser Next.js Image Optimization
2. **Code Splitting** : Automatique avec Next.js
3. **Caching** : Configurer les headers de cache
4. **CDN** : Vercel utilise Vercel Edge Network

### Vérifier les Performances

```bash
# Lighthouse
npm run lighthouse

# Web Vitals
npm run web-vitals
```

---

## 🆘 Support

### Ressources

- **Vercel Docs** : https://vercel.com/docs
- **Next.js Docs** : https://nextjs.org/docs
- **Supabase Docs** : https://supabase.com/docs
- **GitHub Issues** : https://github.com/GrandsonfrmO/GRANDSON-PROJECT-SITE-KIRO/issues

### Contact

- Email : contact@grandsonproject.com
- Phone : +224662662958

---

## 📝 Notes

- Les déploiements prennent généralement 2-5 minutes
- Les changements sont en direct immédiatement après le déploiement
- Les logs sont disponibles pendant 24 heures
- Les rollbacks sont possibles jusqu'à 30 jours

---

## ✅ Déploiement Réussi

Après un déploiement réussi, vous devriez voir :

```
✅ Production: https://your-domain.com
✅ Preview: https://your-project-preview.vercel.app
✅ Logs: Available in Vercel Dashboard
✅ Monitoring: Real-time analytics
```

Félicitations ! Votre site est maintenant en production ! 🎉
