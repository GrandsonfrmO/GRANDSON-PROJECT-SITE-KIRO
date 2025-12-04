# Guide de Déploiement en Production

Ce guide décrit comment déployer le projet Grandson Project en production sur Vercel (frontend) et Render (backend).

## Table des matières

1. [Prérequis](#prérequis)
2. [Configuration des services externes](#configuration-des-services-externes)
3. [Déploiement du Backend (Render)](#déploiement-du-backend-render)
4. [Déploiement du Frontend (Vercel)](#déploiement-du-frontend-vercel)
5. [Vérification du déploiement](#vérification-du-déploiement)
6. [Dépannage](#dépannage)

---

## Prérequis

### Comptes requis

- [ ] Compte GitHub avec le repository du projet
- [ ] Compte Vercel (pour le frontend)
- [ ] Compte Render (pour le backend)
- [ ] Compte Supabase (base de données)
- [ ] Compte Cloudinary (stockage d'images)

### Informations à préparer

- [ ] URL Supabase
- [ ] Clé anonyme Supabase (anon key)
- [ ] Clé service Supabase (service role key)
- [ ] Nom du cloud Cloudinary
- [ ] Clé API Cloudinary
- [ ] Secret API Cloudinary
- [ ] Secret JWT (générer une chaîne aléatoire sécurisée)

---

## Configuration des services externes

### 1. Supabase

#### Vérifier la configuration de la base de données

1. Se connecter à [Supabase](https://supabase.com)
2. Sélectionner votre projet
3. Aller dans **Settings** > **API**
4. Noter les informations suivantes:
   - URL: `https://[project-id].supabase.co`
   - Anon key: `eyJhbGc...`
   - Service role key: `eyJhbGc...`

#### Vérifier les Row Level Security (RLS) policies

1. Aller dans **Database** > **Tables**
2. Sélectionner la table `products`
3. Vérifier que les RLS policies permettent:
   - Lecture publique (pour les clients)
   - Écriture avec service role key (pour l'admin)

#### Vérifier le schéma de la base de données

Exécuter le script de vérification:

```bash
node backend/verify-rls-permissions.js
```

### 2. Cloudinary

#### Configuration du compte

1. Se connecter à [Cloudinary](https://cloudinary.com)
2. Aller dans **Dashboard**
3. Noter les informations suivantes:
   - Cloud name: `dssrjnhoj`
   - API Key: `573993535329651`
   - API Secret: `CtuH5dgm88SeJSe5-x9dokuZWKg`

#### Créer les dossiers

Les dossiers suivants seront créés automatiquement lors du premier upload:
- `grandson-project/products/` - Images de produits
- `grandson-project/brand/` - Images de marque
- `grandson-project/customization/` - Images de personnalisation

---

## Déploiement du Backend (Render)

### 1. Créer le service sur Render

1. Se connecter à [Render](https://render.com)
2. Cliquer sur **New** > **Web Service**
3. Connecter votre repository GitHub
4. Sélectionner le repository `grandson-project`

### 2. Configuration du service

**Build Settings:**
- **Name**: `grandson-backend`
- **Region**: `Frankfurt` (ou le plus proche de vos utilisateurs)
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `node hybrid-server.js`

**Instance Type:**
- **Plan**: `Free` (ou `Starter` pour de meilleures performances)

### 3. Variables d'environnement

Ajouter les variables suivantes dans **Environment** > **Environment Variables**:

```bash
# Node
NODE_ENV=production
PORT=3001

# Supabase
SUPABASE_URL=https://idxzsbdpvyfexrwmuchq.supabase.co
NEXT_PUBLIC_SUPABASE_URL=https://idxzsbdpvyfexrwmuchq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# JWT
JWT_SECRET=[générer une chaîne aléatoire sécurisée]
JWT_EXPIRES_IN=8h

# CORS
FRONTEND_URL=https://grandson-project.vercel.app

# Cloudinary
CLOUDINARY_CLOUD_NAME=dssrjnhoj
CLOUDINARY_API_KEY=573993535329651
CLOUDINARY_API_SECRET=CtuH5dgm88SeJSe5-x9dokuZWKg

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=papicamara22@gmail.com
SMTP_PASS=[votre mot de passe d'application Gmail]
ADMIN_EMAIL=papicamara22@gmail.com
CONTACT_PHONE=+224662662958
CONTACT_EMAIL=contact@grandsonproject.com
```

### 4. Déployer

1. Cliquer sur **Create Web Service**
2. Attendre que le déploiement se termine (5-10 minutes)
3. Noter l'URL du service: `https://grandson-backend.onrender.com`

### 5. Vérifier le déploiement

Tester le health check:

```bash
curl https://grandson-backend.onrender.com/health
```

Résultat attendu:
```json
{
  "status": "ok",
  "message": "Grandson Project API is running"
}
```

---

## Déploiement du Frontend (Vercel)

### 1. Créer le projet sur Vercel

1. Se connecter à [Vercel](https://vercel.com)
2. Cliquer sur **Add New** > **Project**
3. Importer le repository GitHub
4. Sélectionner le repository `grandson-project`

### 2. Configuration du projet

**Build Settings:**
- **Framework Preset**: `Next.js`
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 3. Variables d'environnement

Ajouter les variables suivantes dans **Settings** > **Environment Variables**:

```bash
# API
NEXT_PUBLIC_API_URL=https://grandson-backend.onrender.com
BACKEND_URL=https://grandson-backend.onrender.com

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://idxzsbdpvyfexrwmuchq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# JWT
JWT_SECRET=[même secret que le backend]

# Cloudinary (pour le client)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dssrjnhoj

# Web Push Notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BKsqp3DaZYaDA_8pFLcwUivRSGz9577yl9TcGGS3hmjtL_c5EmpwnIbaBPxI5JZnfVcvrHDowVrMW1X4OqRCVQ4
VAPID_PRIVATE_KEY=qeOQBKTeskCmqhU_qFGUxl_rWkjEUWcAjTj2zIC0Cls
VAPID_SUBJECT=mailto:contact@grandsonproject.com
```

**Important**: Ajouter ces variables pour tous les environnements (Production, Preview, Development)

### 4. Déployer

1. Cliquer sur **Deploy**
2. Attendre que le déploiement se termine (3-5 minutes)
3. Noter l'URL du site: `https://grandson-project.vercel.app`

### 5. Configuration du domaine personnalisé (optionnel)

1. Aller dans **Settings** > **Domains**
2. Ajouter votre domaine personnalisé
3. Suivre les instructions pour configurer les DNS

---

## Vérification du déploiement

### 1. Tests automatisés

Exécuter le script de smoke test:

```bash
# Définir les variables d'environnement
export FRONTEND_URL=https://grandson-project.vercel.app
export BACKEND_URL=https://grandson-backend.onrender.com
export ADMIN_USERNAME=admin
export ADMIN_PASSWORD=[votre mot de passe admin]

# Exécuter les tests
node scripts/production-smoke-test.js
```

### 2. Tests manuels

Suivre la checklist dans `scripts/production-test-checklist.md`:

- [ ] Connexion admin
- [ ] Création de produit
- [ ] Upload d'image
- [ ] Modification de produit
- [ ] Suppression de produit
- [ ] Affichage des images
- [ ] Performance

### 3. Vérifier les logs

**Backend (Render):**
1. Aller sur le dashboard Render
2. Sélectionner le service `grandson-backend`
3. Cliquer sur **Logs**
4. Vérifier qu'il n'y a pas d'erreurs

**Frontend (Vercel):**
1. Aller sur le dashboard Vercel
2. Sélectionner le projet
3. Cliquer sur **Deployments** > **Latest**
4. Cliquer sur **View Function Logs**
5. Vérifier qu'il n'y a pas d'erreurs

---

## Dépannage

### Problème: Images ne s'affichent pas

**Symptômes**: Les images ne se chargent pas, erreurs 404

**Solutions**:
1. Vérifier que les variables Cloudinary sont correctes
2. Vérifier que les images sont bien uploadées vers Cloudinary
3. Vérifier les URLs dans la base de données
4. Vérifier les logs du backend

### Problème: Erreurs CORS

**Symptômes**: Erreurs "blocked by CORS policy" dans la console

**Solutions**:
1. Vérifier que `FRONTEND_URL` est correct dans le backend
2. Vérifier que l'URL Vercel est dans la liste des origines autorisées
3. Redéployer le backend après modification

### Problème: Erreurs d'authentification

**Symptômes**: "Token invalide" ou "Session expirée"

**Solutions**:
1. Vérifier que `JWT_SECRET` est identique sur frontend et backend
2. Vérifier que le token n'est pas expiré (durée: 8h)
3. Se reconnecter à l'interface admin

### Problème: Erreurs de base de données

**Symptômes**: "Database error" ou "Permission denied"

**Solutions**:
1. Vérifier que `SUPABASE_SERVICE_ROLE_KEY` est correct
2. Vérifier les RLS policies sur Supabase
3. Exécuter le script de vérification: `node backend/verify-rls-permissions.js`

### Problème: Backend lent ou timeout

**Symptômes**: Requêtes qui prennent trop de temps

**Solutions**:
1. Vérifier le plan Render (Free tier a des limitations)
2. Vérifier les logs pour identifier les requêtes lentes
3. Considérer un upgrade vers un plan payant

---

## Checklist de déploiement

### Avant le déploiement

- [ ] Code testé en local
- [ ] Variables d'environnement préparées
- [ ] Comptes créés (Vercel, Render, Supabase, Cloudinary)
- [ ] Base de données configurée
- [ ] Schéma de base de données vérifié

### Déploiement Backend

- [ ] Service créé sur Render
- [ ] Variables d'environnement configurées
- [ ] Déploiement réussi
- [ ] Health check fonctionne
- [ ] Logs vérifiés

### Déploiement Frontend

- [ ] Projet créé sur Vercel
- [ ] Variables d'environnement configurées
- [ ] Déploiement réussi
- [ ] Site accessible
- [ ] Logs vérifiés

### Vérification

- [ ] Tests automatisés passés
- [ ] Tests manuels effectués
- [ ] Images s'affichent correctement
- [ ] Authentification fonctionne
- [ ] CRUD produits fonctionne
- [ ] Performance acceptable

### Post-déploiement

- [ ] Monitoring configuré
- [ ] Alertes configurées
- [ ] Documentation mise à jour
- [ ] Équipe informée

---

## Support

Pour toute question ou problème:

- **Email**: contact@grandsonproject.com
- **Téléphone**: +224662662958
- **Documentation**: Voir les fichiers dans `.kiro/specs/production-hosting/`

---

**Dernière mise à jour**: Décembre 2024
