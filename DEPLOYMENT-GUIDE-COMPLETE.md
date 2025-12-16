# 🚀 Guide Complet de Déploiement - Frontend + Backend

## 📋 Vue d'ensemble

Tu as deux services à déployer :
1. **Frontend** (Next.js) → Vercel
2. **Backend** (Express TypeScript) → Render

## 🎯 Architecture de déploiement

```
┌─────────────────────────────────────────────────────────┐
│                    PRODUCTION                            │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Frontend (Vercel)          Backend (Render)             │
│  https://grandsonproject.com  https://grandson-backend   │
│                                                           │
│  Next.js 15                 Express + TypeScript         │
│  React 19                   Supabase                     │
│  Tailwind CSS               JWT Auth                     │
│                                                           │
└─────────────────────────────────────────────────────────┘
         ↓                              ↓
    Supabase Database (Partagée)
```

## 🔧 ÉTAPE 1 : Préparer le Backend

### 1.1 Vérifier la structure

```bash
backend/
├── src/
│   ├── index.ts
│   ├── types/
│   ├── middleware/
│   └── routes/
├── dist/                    # Sera créé lors du build
├── package.json
├── tsconfig.json
├── .env.example
├── .env.production
└── render.yaml
```

### 1.2 Vérifier package.json

```bash
cd backend
npm install
```

Vérifier que les scripts sont corrects :
```json
{
  "scripts": {
    "dev": "nodemon --config nodemon.json --exec ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

### 1.3 Générer une clé JWT sécurisée

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copier la sortie pour plus tard.

## 🌐 ÉTAPE 2 : Déployer le Backend sur Render

### 2.1 Créer un compte Render

1. Aller sur https://render.com
2. S'inscrire avec GitHub
3. Autoriser l'accès au repo

### 2.2 Créer un Web Service

1. Cliquer "New +" → "Web Service"
2. Sélectionner le repo GitHub
3. Configurer :

| Paramètre | Valeur |
|-----------|--------|
| Name | `grandson-backend` |
| Environment | `Node` |
| Build Command | `npm run build` |
| Start Command | `npm start` |
| Plan | `Starter` (gratuit) |

### 2.3 Ajouter les variables d'environnement

Aller dans "Environment" et ajouter :

```
NODE_ENV=production
PORT=3001
SUPABASE_URL=https://idxzsbdpvyfexrwmuchq.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkeHpzYmRwdnlmZXhyd211Y2hxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzM2MDQ0OSwiZXhwIjoyMDc4OTM2NDQ5fQ.iODs7iRhUCMHA-5HgMQPsEX-MKbwNFNLmudxG5yFDDQ
JWT_SECRET=<ta-clé-générée>
FRONTEND_URL=https://grandsonproject.com
BACKEND_URL=https://grandson-backend.onrender.com
```

### 2.4 Déployer

1. Cliquer "Create Web Service"
2. Attendre le déploiement (2-3 minutes)
3. Vérifier l'URL : https://grandson-backend.onrender.com

### 2.5 Tester le backend

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

## 🎨 ÉTAPE 3 : Configurer le Frontend

### 3.1 Mettre à jour les variables d'environnement

Éditer `frontend/.env.production` :

```env
NEXT_PUBLIC_API_URL=https://grandson-backend.onrender.com
BACKEND_URL=https://grandson-backend.onrender.com
NEXT_PUBLIC_SUPABASE_URL=https://idxzsbdpvyfexrwmuchq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkeHpzYmRwdnlmZXhyd211Y2hxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNjA0NDksImV4cCI6MjA3ODkzNjQ0OX0.VgjwbDJHwyyG3JBSydvNN9JssDO00H3fCf4IfVBi0Mw
```

### 3.2 Vérifier les appels API

S'assurer que le frontend utilise `NEXT_PUBLIC_API_URL` :

```typescript
// frontend/app/lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function fetchProducts() {
  const response = await fetch(`${API_URL}/api/products`);
  return response.json();
}
```

### 3.3 Déployer sur Vercel

1. Aller sur https://vercel.com
2. Importer le projet
3. Configurer les variables d'environnement
4. Déployer

## 📊 ÉTAPE 4 : Vérifier le déploiement

### 4.1 Tester les endpoints

```bash
# Health check
curl https://grandson-backend.onrender.com/health

# Produits
curl https://grandson-backend.onrender.com/api/products

# Zones de livraison
curl https://grandson-backend.onrender.com/api/delivery-zones
```

### 4.2 Tester depuis le frontend

1. Aller sur https://grandsonproject.com
2. Vérifier que les produits se chargent
3. Vérifier que les commandes fonctionnent
4. Vérifier l'admin

### 4.3 Vérifier les logs

**Render** :
- Aller dans "Logs" sur le dashboard Render
- Vérifier qu'il n'y a pas d'erreurs

**Vercel** :
- Aller dans "Deployments" sur Vercel
- Vérifier les logs de build

## 🔐 ÉTAPE 5 : Sécurité

### 5.1 Vérifier les variables sensibles

- ✅ JWT_SECRET changé
- ✅ Pas de clés en dur dans le code
- ✅ CORS configuré correctement
- ✅ HTTPS forcé

### 5.2 Configurer les domaines autorisés

Dans `backend/src/index.ts`, vérifier CORS :

```typescript
const allowedOrigins = [
  'https://grandsonproject.com',
  'https://www.grandsonproject.com'
];
```

### 5.3 Ajouter des headers de sécurité

Helmet est déjà configuré dans le backend.

## 📈 ÉTAPE 6 : Monitoring

### 6.1 Configurer les alertes Render

1. Aller dans "Settings" → "Alerts"
2. Ajouter une alerte pour les erreurs
3. Configurer l'email

### 6.2 Vérifier les performances

```bash
# Tester la latence
curl -w "@curl-format.txt" -o /dev/null -s https://grandson-backend.onrender.com/health
```

### 6.3 Monitorer les logs

Render affiche les logs en temps réel dans le dashboard.

## 🔄 ÉTAPE 7 : Déploiement continu

### 7.1 Configuration automatique

Render déploie automatiquement à chaque push sur `main`.

Pour désactiver :
- Settings → Auto-Deploy → Désactiver

### 7.2 Déployer manuellement

```bash
# Push sur GitHub
git add .
git commit -m "Deploy backend"
git push origin main

# Render déploiera automatiquement
```

## 🐛 ÉTAPE 8 : Dépannage

### Erreur: "Build failed"

```bash
# Tester localement
cd backend
npm install
npm run build
npm start
```

### Erreur: "Cannot find module"

```bash
# Vérifier les dépendances
npm install
npm run build
```

### Erreur: "SUPABASE_URL not found"

1. Vérifier les variables d'environnement sur Render
2. Attendre 1-2 minutes après l'ajout
3. Redéployer

### Service ne démarre pas

1. Vérifier les logs
2. S'assurer que `npm start` fonctionne localement
3. Vérifier le PORT (doit être 3001)

## 📝 Checklist de déploiement

### Backend
- [ ] Code poussé sur GitHub
- [ ] Variables d'environnement configurées
- [ ] Build fonctionne localement
- [ ] Service créé sur Render
- [ ] Déploiement réussi
- [ ] Health check OK
- [ ] Endpoints testés

### Frontend
- [ ] Variables d'environnement mises à jour
- [ ] API URL pointant vers Render
- [ ] Build fonctionne localement
- [ ] Déployé sur Vercel
- [ ] Produits se chargent
- [ ] Commandes fonctionnent
- [ ] Admin fonctionne

### Sécurité
- [ ] JWT_SECRET changé
- [ ] CORS configuré
- [ ] HTTPS forcé
- [ ] Variables sensibles en env
- [ ] Pas de clés en dur

## 🎉 Prochaines étapes

1. Déployer le backend sur Render
2. Configurer le frontend
3. Tester tous les endpoints
4. Monitorer les logs
5. Configurer les alertes

## 📞 URLs importantes

| Service | URL |
|---------|-----|
| Frontend | https://grandsonproject.com |
| Backend | https://grandson-backend.onrender.com |
| Render Dashboard | https://dashboard.render.com |
| Vercel Dashboard | https://vercel.com/dashboard |
| Supabase | https://app.supabase.com |

## 📚 Documentation

- Backend: `backend/README.md`
- Deployment: `BACKEND-DEPLOYMENT.md`
- Migration: `BACKEND-MIGRATION.md`

## ✅ Status

Prêt pour le déploiement ! Suis les étapes ci-dessus.
