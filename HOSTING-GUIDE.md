# Guide de Déploiement - Grandson Project

## Architecture de Production

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     Vercel      │────▶│     Render      │────▶│    Supabase     │
│   (Frontend)    │     │    (Backend)    │     │   (Database)    │
│  Next.js App    │     │  Express API    │     │   PostgreSQL    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │   Cloudinary    │
                        │    (Images)     │
                        └─────────────────┘
```

## Étape 1: Déployer le Backend sur Render

1. Va sur [render.com](https://render.com) et connecte-toi
2. Clique sur "New" → "Web Service"
3. Connecte ton repo GitHub
4. Configure:
   - **Name**: `grandson-backend`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node hybrid-server.js`
   - **Plan**: Free

5. Ajoute les variables d'environnement (Environment → Add Environment Variable):

| Variable | Valeur |
|----------|--------|
| `NODE_ENV` | `production` |
| `PORT` | `3001` |
| `SUPABASE_URL` | `https://idxzsbdpvyfexrwmuchq.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://idxzsbdpvyfexrwmuchq.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | *(ta clé anon)* |
| `SUPABASE_SERVICE_ROLE_KEY` | *(ta clé service role)* |
| `JWT_SECRET` | *(générer une clé sécurisée)* |
| `JWT_EXPIRES_IN` | `8h` |
| `FRONTEND_URL` | `https://grandson-project.vercel.app` |
| `BACKEND_URL` | `https://grandson-backend.onrender.com` |
| `CLOUDINARY_CLOUD_NAME` | `dssrjnhoj` |
| `CLOUDINARY_API_KEY` | *(ta clé API)* |
| `CLOUDINARY_API_SECRET` | *(ton secret)* |
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_SECURE` | `false` |
| `SMTP_USER` | *(ton email)* |
| `SMTP_PASS` | *(ton mot de passe app)* |
| `ADMIN_EMAIL` | *(ton email admin)* |
| `CONTACT_PHONE` | `+224662662958` |
| `CONTACT_EMAIL` | `contact@grandsonproject.com` |

6. Clique "Create Web Service"

## Étape 2: Déployer le Frontend sur Vercel

1. Va sur [vercel.com](https://vercel.com) et connecte-toi
2. Clique "Add New" → "Project"
3. Importe ton repo GitHub
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`

5. Ajoute les variables d'environnement:

| Variable | Valeur |
|----------|--------|
| `NEXT_PUBLIC_API_URL` | `https://grandson-backend.onrender.com` |
| `BACKEND_URL` | `https://grandson-backend.onrender.com` |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://idxzsbdpvyfexrwmuchq.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | *(ta clé anon)* |
| `SUPABASE_SERVICE_ROLE_KEY` | *(ta clé service role)* |
| `JWT_SECRET` | *(même clé que le backend)* |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | *(ta clé VAPID publique)* |
| `VAPID_PRIVATE_KEY` | *(ta clé VAPID privée)* |
| `VAPID_SUBJECT` | `mailto:contact@grandsonproject.com` |

6. Clique "Deploy"

## Étape 3: Configurer le Domaine Personnalisé (Optionnel)

### Sur Vercel:
1. Va dans Settings → Domains
2. Ajoute ton domaine (ex: `grandsonproject.com`)
3. Configure les DNS chez ton registrar

### Sur Render:
1. Va dans Settings → Custom Domains
2. Ajoute ton sous-domaine API (ex: `api.grandsonproject.com`)

## Vérification Post-Déploiement

### Test du Backend:
```bash
curl https://grandson-backend.onrender.com/health
```
Réponse attendue: `{"status":"ok","message":"Grandson Project API is running"}`

### Test du Frontend:
- Ouvre `https://grandson-project.vercel.app`
- Vérifie que les produits se chargent
- Teste le panier et le checkout
- Teste la connexion admin: `/admin/login`

## Commandes Utiles

### Générer une clé JWT sécurisée:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Voir les logs Render:
- Dashboard → grandson-backend → Logs

### Voir les logs Vercel:
- Dashboard → grandson-project → Deployments → View Logs

## Dépannage

### Le backend ne démarre pas:
1. Vérifie les logs sur Render
2. Assure-toi que toutes les variables d'environnement sont définies
3. Vérifie que Supabase est accessible

### Le frontend ne se connecte pas au backend:
1. Vérifie que `NEXT_PUBLIC_API_URL` pointe vers le bon URL
2. Vérifie les CORS dans le backend (`FRONTEND_URL`)
3. Teste l'endpoint `/health` du backend

### Les images ne s'affichent pas:
1. Vérifie la configuration Cloudinary
2. Assure-toi que les images sont uploadées sur Cloudinary

### Les emails ne s'envoient pas:
1. Vérifie les credentials SMTP
2. Pour Gmail, utilise un "App Password" (pas le mot de passe normal)

## Notes Importantes

- Le plan gratuit de Render met le serveur en veille après 15 min d'inactivité
- Premier chargement peut prendre ~30 secondes (cold start)
- Pour éviter ça, upgrade vers un plan payant ou utilise un service de ping
