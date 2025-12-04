# 🚀 Étapes de Déploiement en Production

## ✅ Checklist Pré-Déploiement

### 1. Vérifier que le code est prêt
- [x] Intégration Cloudinary implémentée
- [x] API produits améliorée
- [x] CORS configuré
- [x] Logging implémenté
- [x] Messages d'erreur clairs
- [x] Tests créés

### 2. Préparer les Variables d'Environnement

#### Variables pour VERCEL (Frontend)
```bash
NEXT_PUBLIC_API_URL=https://grandson-backend.onrender.com
BACKEND_URL=https://grandson-backend.onrender.com
NEXT_PUBLIC_SUPABASE_URL=https://idxzsbdpvyfexrwmuchq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkeHpzYmRwdnlmZXhyd211Y2hxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNjA0NDksImV4cCI6MjA3ODkzNjQ0OX0.VgjwbDJHwyyG3JBSydvNN9JssDO00H3fCf4IfVBi0Mw
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkeHpzYmRwdnlmZXhyd211Y2hxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzM2MDQ0OSwiZXhwIjoyMDc4OTM2NDQ5fQ.iODs7iRhUCMHA-5HgMQPsEX-MKbwNFNLmudxG5yFDDQ
JWT_SECRET=grandson-project-jwt-secret-production-2024
CLOUDINARY_CLOUD_NAME=dssrjnhoj
CLOUDINARY_API_KEY=573993535329651
CLOUDINARY_API_SECRET=CtuH5dgm88SeJSe5-x9dokuZWKg
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BKsqp3DaZYaDA_8pFLcwUivRSGz9577yl9TcGGS3hmjtL_c5EmpwnIbaBPxI5JZnfVcvrHDowVrMW1X4OqRCVQ4
VAPID_PRIVATE_KEY=qeOQBKTeskCmqhU_qFGUxl_rWkjEUWcAjTj2zIC0Cls
VAPID_SUBJECT=mailto:contact@grandsonproject.com
```

#### Variables pour RENDER (Backend)
```bash
NODE_ENV=production
PORT=3001
SUPABASE_URL=https://idxzsbdpvyfexrwmuchq.supabase.co
NEXT_PUBLIC_SUPABASE_URL=https://idxzsbdpvyfexrwmuchq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkeHpzYmRwdnlmZXhyd211Y2hxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNjA0NDksImV4cCI6MjA3ODkzNjQ0OX0.VgjwbDJHwyyG3JBSydvNN9JssDO00H3fCf4IfVBi0Mw
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkeHpzYmRwdnlmZXhyd211Y2hxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzM2MDQ0OSwiZXhwIjoyMDc4OTM2NDQ5fQ.iODs7iRhUCMHA-5HgMQPsEX-MKbwNFNLmudxG5yFDDQ
JWT_SECRET=grandson-project-jwt-secret-production-2024
JWT_EXPIRES_IN=8h
FRONTEND_URL=https://grandson-project.vercel.app
CLOUDINARY_CLOUD_NAME=dssrjnhoj
CLOUDINARY_API_KEY=573993535329651
CLOUDINARY_API_SECRET=CtuH5dgm88SeJSe5-x9dokuZWKg
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=papicamara22@gmail.com
SMTP_PASS=fugecvhqiuistluq
ADMIN_EMAIL=papicamara22@gmail.com
CONTACT_PHONE=+224662662958
CONTACT_EMAIL=contact@grandsonproject.com
```

---

## 🔄 Étapes de Déploiement

### Étape 1: Commit et Push sur GitHub

```bash
# Ajouter tous les fichiers
git add .

# Commit avec un message descriptif
git commit -m "feat: Production hosting improvements - Cloudinary integration, improved APIs, logging, and error handling"

# Push vers GitHub
git push origin main
```

### Étape 2: Déployer le Backend sur Render

1. **Aller sur [Render Dashboard](https://dashboard.render.com)**
2. Le service `grandson-backend` devrait se redéployer automatiquement
3. **Vérifier les logs** pendant le déploiement
4. **Attendre** que le statut passe à "Live" (5-10 minutes)
5. **Tester** le health check: https://grandson-backend.onrender.com/health

### Étape 3: Déployer le Frontend sur Vercel

1. **Aller sur [Vercel Dashboard](https://vercel.com/dashboard)**
2. Le projet `grandson-project` devrait se redéployer automatiquement
3. **Vérifier les logs** de build
4. **Attendre** que le déploiement soit terminé (3-5 minutes)
5. **Visiter** le site: https://grandson-project.vercel.app

### Étape 4: Vérifier les Variables d'Environnement

#### Sur Vercel:
1. Aller dans **Settings** > **Environment Variables**
2. Vérifier que toutes les variables sont présentes
3. Si manquantes, les ajouter pour **Production**, **Preview**, et **Development**

#### Sur Render:
1. Aller dans le service `grandson-backend`
2. Cliquer sur **Environment**
3. Vérifier que toutes les variables sont présentes
4. Si modifiées, cliquer sur **Save Changes** (redéploiement automatique)

---

## 🧪 Étape 5: Tests Post-Déploiement

### Test Automatique

```bash
# Définir les variables
set BACKEND_URL=https://grandson-backend.onrender.com
set ADMIN_USERNAME=admin
set ADMIN_PASSWORD=votre_mot_de_passe

# Exécuter les tests
node scripts/production-smoke-test.js
```

### Tests Manuels

Suivre la checklist dans `scripts/production-test-checklist.md`:

1. **Se connecter à l'admin**
   - Aller sur https://grandson-project.vercel.app/admin/login
   - Se connecter avec vos identifiants

2. **Créer un produit test**
   - Aller sur "Ajouter un produit"
   - Remplir le formulaire
   - **Uploader une image** (test Cloudinary)
   - Sauvegarder

3. **Vérifier l'affichage**
   - Aller sur la page d'accueil
   - Vérifier que le produit s'affiche
   - Vérifier que l'image Cloudinary se charge

4. **Modifier le produit**
   - Retourner dans l'admin
   - Modifier le produit test
   - Vérifier que les changements sont sauvegardés

5. **Supprimer le produit test**
   - Supprimer le produit
   - Vérifier qu'il disparaît

---

## 🐛 Dépannage

### Si le backend ne démarre pas:
- Vérifier les logs sur Render
- Vérifier que toutes les variables d'environnement sont présentes
- Vérifier que `SUPABASE_SERVICE_ROLE_KEY` est correct

### Si les images ne s'affichent pas:
- Vérifier que `CLOUDINARY_API_SECRET` est configuré sur Vercel
- Vérifier les logs de la route `/api/upload`
- Tester l'upload manuellement

### Si les erreurs CORS apparaissent:
- Vérifier que `FRONTEND_URL` sur Render = `https://grandson-project.vercel.app`
- Vérifier les logs du backend
- Redéployer le backend si nécessaire

---

## ✅ Validation Finale

Une fois tous les tests passés:

- [ ] Backend déployé et fonctionnel
- [ ] Frontend déployé et accessible
- [ ] Variables d'environnement configurées
- [ ] Création de produit fonctionne
- [ ] Upload d'images vers Cloudinary fonctionne
- [ ] Modification de produit fonctionne
- [ ] Suppression de produit fonctionne
- [ ] Images s'affichent correctement
- [ ] Pas d'erreurs dans les logs

**🎉 Félicitations! Votre application est en production!**

---

## 📞 Support

- Email: contact@grandsonproject.com
- Téléphone: +224662662958
- Documentation: `PRODUCTION-DEPLOYMENT-GUIDE.md`
