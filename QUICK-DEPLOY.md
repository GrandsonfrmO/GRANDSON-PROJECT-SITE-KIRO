# ⚡ Déploiement Rapide

## 🚀 Déployer en 5 minutes

### Prérequis
- Compte Render (https://render.com)
- Compte Vercel (https://vercel.com)
- Repo GitHub connecté

### Étape 1 : Générer une clé JWT (1 min)

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copier la sortie.

### Étape 2 : Déployer le backend (2 min)

1. Aller sur https://dashboard.render.com
2. Cliquer "New +" → "Web Service"
3. Sélectionner le repo
4. Configurer :
   - Name: `grandson-backend`
   - Build: `npm run build`
   - Start: `npm start`
5. Ajouter les variables d'environnement :

```
NODE_ENV=production
PORT=3001
SUPABASE_URL=https://idxzsbdpvyfexrwmuchq.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkeHpzYmRwdnlmZXhyd211Y2hxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzM2MDQ0OSwiZXhwIjoyMDc4OTM2NDQ5fQ.iODs7iRhUCMHA-5HgMQPsEX-MKbwNFNLmudxG5yFDDQ
JWT_SECRET=<ta-clé-générée>
FRONTEND_URL=https://grandsonproject.com
BACKEND_URL=https://grandson-backend.onrender.com
```

6. Cliquer "Create Web Service"
7. Attendre le déploiement

### Étape 3 : Configurer le frontend (1 min)

1. Aller sur https://vercel.com/dashboard
2. Sélectionner le projet
3. Aller dans "Settings" → "Environment Variables"
4. Ajouter :

```
NEXT_PUBLIC_API_URL=https://grandson-backend.onrender.com
BACKEND_URL=https://grandson-backend.onrender.com
```

5. Aller dans "Deployments"
6. Cliquer "Redeploy" sur le dernier déploiement

### Étape 4 : Vérifier (1 min)

```bash
# Tester le backend
curl https://grandson-backend.onrender.com/health

# Tester le frontend
# Aller sur https://grandsonproject.com
```

## ✅ C'est fait !

Le déploiement est terminé. Vérifier :
- [ ] Backend répond au health check
- [ ] Frontend se charge
- [ ] Produits s'affichent
- [ ] Commandes fonctionnent

## 🔄 Redéployer après des changements

```bash
# 1. Faire les changements
# 2. Commit et push
git add .
git commit -m "Update backend"
git push origin main

# 3. Render redéploiera automatiquement
# 4. Vercel redéploiera automatiquement
```

## 📊 URLs

| Service | URL |
|---------|-----|
| Frontend | https://grandsonproject.com |
| Backend | https://grandson-backend.onrender.com |
| Render | https://dashboard.render.com |
| Vercel | https://vercel.com/dashboard |

## 🆘 Problèmes ?

### Backend ne démarre pas
```bash
# Vérifier localement
cd backend
npm install
npm run build
npm start
```

### Frontend ne se charge pas
1. Vérifier les variables d'environnement
2. Vérifier que le backend est accessible
3. Vérifier les logs Vercel

### Erreurs CORS
1. Vérifier FRONTEND_URL sur Render
2. Vérifier que le backend a redémarré
3. Vérifier les logs

## 📞 Support

- Render: https://render.com/support
- Vercel: https://vercel.com/support
