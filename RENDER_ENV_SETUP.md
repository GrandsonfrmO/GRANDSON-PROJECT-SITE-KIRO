# Configuration des Variables d'Environnement Render (Backend)

## Variables à Configurer sur Render

Pour que le backend fonctionne correctement avec Cloudinary et Supabase, vous devez configurer les variables d'environnement suivantes sur Render:

### 1. Accéder aux Variables d'Environnement
1. Allez sur https://dashboard.render.com
2. Sélectionnez votre service backend
3. Allez dans **Environment**

### 2. Variables Cloudinary (À VÉRIFIER/AJOUTER)

```
CLOUDINARY_CLOUD_NAME=dssrjnhoj
CLOUDINARY_API_KEY=573993535329651
CLOUDINARY_API_SECRET=CtuH5dgm88SeJSe5-x9dokuZWKg
```

### 3. Variables Supabase (À VÉRIFIER)

```
SUPABASE_URL=https://idxzsbdpvyfexrwmuchq.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkeHpzYmRwdnlmZXhyd211Y2hxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzM2MDQ0OSwiZXhwIjoyMDc4OTM2NDQ5fQ.iODs7iRhUCMHA-5HgMQPsEX-MKbwNFNLmudxG5yFDDQ
```

### 4. Variables JWT (À VÉRIFIER)

```
JWT_SECRET=CHANGE_THIS_TO_A_SECURE_RANDOM_STRING_IN_PRODUCTION
JWT_EXPIRES_IN=8h
```

**IMPORTANT**: Changez `JWT_SECRET` pour une valeur sécurisée en production!

### 5. Variables CORS (À VÉRIFIER)

```
FRONTEND_URL=https://your-vercel-domain.vercel.app
```

**Important**: Remplacez par l'URL réelle de votre frontend Vercel.

### 6. Variables Email (Déjà Configurées)

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=papicamara22@gmail.com
SMTP_PASS=fugecvhqiuistluq
ADMIN_EMAIL=papicamara22@gmail.com
CONTACT_PHONE=+224662662958
CONTACT_EMAIL=contact@grandsonproject.com
```

### 7. Variables Serveur (À VÉRIFIER)

```
PORT=3001
NODE_ENV=production
BACKEND_URL=https://your-render-service.onrender.com
```

**Important**: Remplacez par l'URL réelle de votre service Render.

### 8. Variables Upload (Optionnelles)

```
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
```

## Étapes de Configuration

### 1. Ajouter/Vérifier les Variables
1. Allez dans **Environment** de votre service
2. Vérifiez que toutes les variables ci-dessus sont présentes
3. Ajoutez les variables manquantes (surtout Cloudinary)
4. Cliquez sur **Save Changes**

### 2. Redéployer le Service
Après avoir modifié les variables:
1. Le service se redéploie automatiquement
2. Ou cliquez sur **Manual Deploy** > **Deploy latest commit**
3. Attendez que le déploiement soit terminé

### 3. Vérifier les Logs
1. Allez dans **Logs**
2. Vérifiez qu'il n'y a pas d'erreurs de configuration
3. Vérifiez que le serveur démarre correctement

## Configuration CORS

Assurez-vous que le backend accepte les requêtes du frontend Vercel:

Dans `backend/hybrid-server.js` ou `backend/supabase-server.js`, vérifiez:

```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
```

## Vérification de la Configuration

### Test de Santé
Accédez à: `https://your-render-service.onrender.com/health`

Vous devriez voir:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Test Cloudinary
Essayez d'uploader une image depuis l'admin en production.

### Test Supabase
Essayez de créer un produit depuis l'admin en production.

## Troubleshooting

### Erreur "Missing Cloudinary configuration"
- Vérifiez que les 3 variables Cloudinary sont bien configurées
- Vérifiez l'orthographe des noms de variables
- Redéployez le service

### Erreur CORS
- Vérifiez que `FRONTEND_URL` pointe vers votre domaine Vercel
- Vérifiez que le code CORS utilise bien cette variable
- Redéployez le service

### Erreur Supabase
- Vérifiez que `SUPABASE_SERVICE_ROLE_KEY` est bien configurée
- Vérifiez que l'URL Supabase est correcte
- Vérifiez les permissions RLS dans Supabase

### Le service ne démarre pas
- Vérifiez les logs pour voir l'erreur exacte
- Vérifiez que toutes les variables requises sont présentes
- Vérifiez que `PORT` est bien défini

## Prochaines Étapes

Après avoir configuré Render:
1. Tester l'upload d'images en production
2. Tester la création de produits
3. Exécuter le script de smoke test
4. Vérifier les logs pour les erreurs

## Script de Test

Vous pouvez utiliser le script de smoke test pour vérifier que tout fonctionne:

```bash
node scripts/production-smoke-test.js
```

Ce script testera:
- La création de produits
- L'upload d'images
- La modification de produits
- La récupération de produits
- La suppression de produits
