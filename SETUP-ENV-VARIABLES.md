# 🔐 Configuration des Variables d'Environnement

## 📋 Variables requises

### Backend (Render)

```
NODE_ENV=production
PORT=3001
SUPABASE_URL=https://idxzsbdpvyfexrwmuchq.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkeHpzYmRwdnlmZXhyd211Y2hxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzM2MDQ0OSwiZXhwIjoyMDc4OTM2NDQ5fQ.iODs7iRhUCMHA-5HgMQPsEX-MKbwNFNLmudxG5yFDDQ
JWT_SECRET=<GÉNÉRER UNE NOUVELLE CLÉ>
FRONTEND_URL=https://grandsonproject.com
BACKEND_URL=https://grandson-backend.onrender.com
```

### Frontend (Vercel)

```
NEXT_PUBLIC_API_URL=https://grandson-backend.onrender.com
BACKEND_URL=https://grandson-backend.onrender.com
NEXT_PUBLIC_SUPABASE_URL=https://idxzsbdpvyfexrwmuchq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkeHpzYmRwdnlmZXhyd211Y2hxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNjA0NDksImV4cCI6MjA3ODkzNjQ0OX0.VgjwbDJHwyyG3JBSydvNN9JssDO00H3fCf4IfVBi0Mw
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dssrjnhoj
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BKsqp3DaZYaDA_8pFLcwUivRSGz9577yl9TcGGS3hmjtL_c5EmpwnIbaBPxI5JZnfVcvrHDowVrMW1X4OqRCVQ4
```

## 🔑 Générer une clé JWT sécurisée

### Windows (PowerShell)

```powershell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((Get-Random -Count 32 | ForEach-Object { [char]$_ })))
```

Ou plus simplement avec Node.js :

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### macOS/Linux

```bash
openssl rand -hex 32
```

## 🚀 Configurer sur Render

### 1. Aller sur Render Dashboard

https://dashboard.render.com

### 2. Sélectionner le service backend

Cliquer sur `grandson-backend`

### 3. Aller dans "Environment"

Cliquer sur "Environment" dans le menu de gauche

### 4. Ajouter les variables

Cliquer "Add Environment Variable" pour chaque variable :

| Key | Value |
|-----|-------|
| NODE_ENV | production |
| PORT | 3001 |
| SUPABASE_URL | https://idxzsbdpvyfexrwmuchq.supabase.co |
| SUPABASE_SERVICE_ROLE_KEY | (copier depuis backend/.env) |
| JWT_SECRET | (générer une nouvelle clé) |
| FRONTEND_URL | https://grandsonproject.com |
| BACKEND_URL | https://grandson-backend.onrender.com |

### 5. Sauvegarder et redéployer

Cliquer "Save" et le service redémarrera automatiquement.

## 🎨 Configurer sur Vercel

### 1. Aller sur Vercel Dashboard

https://vercel.com/dashboard

### 2. Sélectionner le projet frontend

Cliquer sur `grandson-project-site-kiro`

### 3. Aller dans "Settings"

Cliquer sur "Settings" dans le menu du haut

### 4. Aller dans "Environment Variables"

Cliquer sur "Environment Variables"

### 5. Ajouter les variables

Cliquer "Add New" pour chaque variable :

| Key | Value | Environments |
|-----|-------|--------------|
| NEXT_PUBLIC_API_URL | https://grandson-backend.onrender.com | Production |
| BACKEND_URL | https://grandson-backend.onrender.com | Production |
| NEXT_PUBLIC_SUPABASE_URL | https://idxzsbdpvyfexrwmuchq.supabase.co | Production |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | (copier depuis .env.production) | Production |
| NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME | dssrjnhoj | Production |
| NEXT_PUBLIC_VAPID_PUBLIC_KEY | (copier depuis .env.production) | Production |

### 6. Redéployer

Aller dans "Deployments" et cliquer "Redeploy" sur le dernier déploiement.

## ✅ Vérifier les variables

### Backend

```bash
# Tester que le backend démarre
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

### Frontend

1. Aller sur https://grandsonproject.com
2. Ouvrir la console (F12)
3. Vérifier qu'il n'y a pas d'erreurs CORS
4. Vérifier que les produits se chargent

## 🔒 Sécurité

### À faire

- ✅ Générer une nouvelle clé JWT
- ✅ Ne pas partager les clés
- ✅ Utiliser des variables d'environnement
- ✅ Vérifier les permissions Supabase
- ✅ Activer HTTPS

### À éviter

- ❌ Mettre les clés en dur dans le code
- ❌ Commiter les fichiers .env
- ❌ Partager les clés sur GitHub
- ❌ Utiliser les mêmes clés en dev et prod

## 📝 Checklist

- [ ] Clé JWT générée
- [ ] Variables d'environnement configurées sur Render
- [ ] Variables d'environnement configurées sur Vercel
- [ ] Backend redéployé
- [ ] Frontend redéployé
- [ ] Health check OK
- [ ] Produits se chargent
- [ ] Pas d'erreurs CORS

## 🆘 Dépannage

### Erreur: "SUPABASE_URL not found"

1. Vérifier que la variable est configurée sur Render
2. Attendre 1-2 minutes
3. Redéployer le service

### Erreur: "CORS error"

1. Vérifier que FRONTEND_URL est correct
2. Vérifier que le backend a redémarré
3. Vérifier les logs Render

### Erreur: "Invalid token"

1. Vérifier que JWT_SECRET est correct
2. Générer une nouvelle clé
3. Redéployer

## 📞 Support

- Render: https://render.com/support
- Vercel: https://vercel.com/support
- Supabase: https://supabase.com/support
