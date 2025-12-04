# Configuration des Variables d'Environnement Vercel

## Variables à Configurer sur Vercel

Pour que l'intégration Cloudinary fonctionne en production, vous devez configurer les variables d'environnement suivantes sur Vercel:

### 1. Accéder aux Variables d'Environnement
1. Allez sur https://vercel.com/dashboard
2. Sélectionnez votre projet
3. Allez dans **Settings** > **Environment Variables**

### 2. Variables Cloudinary (NOUVELLES - À AJOUTER)

```
CLOUDINARY_CLOUD_NAME=dssrjnhoj
CLOUDINARY_API_KEY=573993535329651
CLOUDINARY_API_SECRET=CtuH5dgm88SeJSe5-x9dokuZWKg
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dssrjnhoj
```

**Important**: Ces variables sont nécessaires pour l'upload d'images vers Cloudinary.

### 3. Variables Supabase (Déjà Configurées)

```
NEXT_PUBLIC_SUPABASE_URL=https://idxzsbdpvyfexrwmuchq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkeHpzYmRwdnlmZXhyd211Y2hxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNjA0NDksImV4cCI6MjA3ODkzNjQ0OX0.VgjwbDJHwyyG3JBSydvNN9JssDO00H3fCf4IfVBi0Mw
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkeHpzYmRwdnlmZXhyd211Y2hxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzM2MDQ0OSwiZXhwIjoyMDc4OTM2NDQ5fQ.iODs7iRhUCMHA-5HgMQPsEX-MKbwNFNLmudxG5yFDDQ
```

### 4. Variables JWT (Déjà Configurées)

```
JWT_SECRET=CHANGE_THIS_TO_A_SECURE_RANDOM_STRING_IN_PRODUCTION
```

### 5. Variables Backend URL (À VÉRIFIER)

```
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
BACKEND_URL=https://your-backend-domain.com
```

**Important**: Remplacez `your-backend-domain.com` par l'URL réelle de votre backend Render.

### 6. Variables VAPID (Déjà Configurées)

```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BKsqp3DaZYaDA_8pFLcwUivRSGz9577yl9TcGGS3hmjtL_c5EmpwnIbaBPxI5JZnfVcvrHDowVrMW1X4OqRCVQ4
VAPID_PRIVATE_KEY=qeOQBKTeskCmqhU_qFGUxl_rWkjEUWcAjTj2zIC0Cls
VAPID_SUBJECT=mailto:contact@grandsonproject.com
```

## Étapes de Déploiement

### 1. Vérifier le Déploiement Automatique
- Le push sur `main` déclenche automatiquement un déploiement sur Vercel
- Vérifiez l'état du déploiement sur https://vercel.com/dashboard

### 2. Ajouter les Variables Cloudinary
1. Allez dans **Settings** > **Environment Variables**
2. Ajoutez les 4 variables Cloudinary listées ci-dessus
3. Sélectionnez **Production**, **Preview**, et **Development**
4. Cliquez sur **Save**

### 3. Redéployer
Après avoir ajouté les variables:
1. Allez dans **Deployments**
2. Cliquez sur les trois points (...) du dernier déploiement
3. Sélectionnez **Redeploy**
4. Cochez **Use existing Build Cache** pour un déploiement plus rapide

### 4. Tester en Production
Une fois le déploiement terminé:
1. Allez sur votre site en production
2. Connectez-vous à l'admin
3. Essayez d'ajouter un produit avec une image
4. Vérifiez que l'image s'upload vers Cloudinary
5. Vérifiez que l'image s'affiche correctement

## Vérification des Variables

Pour vérifier que les variables sont bien configurées, vous pouvez:

1. Aller dans **Settings** > **Environment Variables**
2. Vérifier que toutes les variables listées ci-dessus sont présentes
3. Vérifier qu'elles sont activées pour **Production**

## Troubleshooting

### L'upload d'image échoue
- Vérifiez que les 4 variables Cloudinary sont bien configurées
- Vérifiez les logs de déploiement pour les erreurs
- Vérifiez les logs de fonction dans Vercel

### Les images ne s'affichent pas
- Vérifiez que `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` est bien configurée
- Vérifiez que les URLs Cloudinary sont correctes dans la base de données

### Erreur de configuration
- Vérifiez que toutes les variables sont bien orthographiées
- Vérifiez qu'il n'y a pas d'espaces avant/après les valeurs
- Redéployez après avoir modifié les variables

## Prochaines Étapes

Après avoir configuré Vercel:
1. Configurer les variables sur Render (backend)
2. Tester l'intégration complète
3. Exécuter le script de smoke test
