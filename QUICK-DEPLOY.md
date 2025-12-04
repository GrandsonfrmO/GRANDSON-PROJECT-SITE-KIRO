# ⚡ Déploiement Rapide - 5 Minutes

## 🚀 Déployer Maintenant

### Étape 1 : Vérifier le Code (30 secondes)
```bash
git status
# Doit afficher: "working tree clean"
```

### Étape 2 : Déployer sur Vercel (2-3 minutes)

**Windows :**
```bash
deploy-vercel.bat
```

**Linux/Mac :**
```bash
./deploy-vercel.sh
```

**Ou directement :**
```bash
vercel --prod
```

### Étape 3 : Vérifier le Déploiement (1-2 minutes)

Aller sur https://vercel.com/dashboard et vérifier :
- ✅ Déploiement réussi
- ✅ Pas d'erreurs
- ✅ Site accessible

---

## ⚙️ Configuration (À faire une seule fois)

### 1. Vercel Dashboard

Aller sur https://vercel.com/dashboard

### 2. Ajouter les Variables d'Environnement

**Settings** → **Environment Variables**

Copier-coller ces variables :

```
NEXT_PUBLIC_SUPABASE_URL=https://idxzsbdpvyfexrwmuchq.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkeHpzYmRwdnlmZXhyd211Y2hxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzM2MDQ0OSwiZXhwIjoyMDc4OTM2NDQ5fQ.iODs7iRhUCMHA-5HgMQPsEX-MKbwNFNLmudxG5yFDDQ
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkeHpzYmRwdnlmZXhyd211Y2hxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNjA0NDksImV4cCI6MjA3ODkzNjQ0OX0.VgjwbDJHwyyG3JBSydvNN9JssDO00H3fCf4IfVBi0Mw

BACKEND_URL=https://your-backend-domain.com

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
ADMIN_EMAIL=admin@example.com
CONTACT_EMAIL=contact@example.com
CONTACT_PHONE=+224662662958

NEXT_PUBLIC_VAPID_PUBLIC_KEY=BKsqp3DaZYaDA_8pFLcwUivRSGz9577yl9TcGGS3hmjtL_c5EmpwnIbaBPxI5JZnfVcvrHDowVrMW1X4OqRCVQ4
VAPID_PRIVATE_KEY=qeOQBKTeskCmqhU_qFGUxl_rWkjEUWcAjTj2zIC0Cls
VAPID_SUBJECT=mailto:contact@grandsonproject.com

JWT_SECRET=your-secret-key-change-this

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dssrjnhoj
CLOUDINARY_API_KEY=573993535329651
CLOUDINARY_API_SECRET=CtuH5dgm88SeJSe5-x9dokuZWKg
```

### 3. Redéployer

Après avoir ajouté les variables, redéployer :

```bash
vercel --prod
```

---

## ✅ Vérification Rapide

Après le déploiement, tester :

### 1. Site Accessible
```bash
curl https://your-domain.com
# Doit retourner du HTML
```

### 2. API Fonctionnelle
```bash
curl https://your-domain.com/api/products
# Doit retourner du JSON
```

### 3. Admin Accessible
```
https://your-domain.com/admin/login
```

### 4. Commandes Visibles
```
https://your-domain.com/admin/orders
```

---

## 🆘 Problèmes Courants

### Erreur : "Build failed"
```bash
# Vérifier les logs
vercel logs

# Vérifier les variables d'environnement
vercel env list
```

### Erreur : "Environment variables not set"
1. Aller dans Vercel Dashboard
2. Settings → Environment Variables
3. Ajouter les variables manquantes
4. Redéployer

### Erreur : "Database connection failed"
1. Vérifier que Supabase est accessible
2. Vérifier les clés Supabase
3. Vérifier les règles RLS

### Erreur : "Email not sending"
1. Vérifier les credentials SMTP
2. Vérifier le port SMTP (587)
3. Vérifier les logs du backend

---

## 📊 Monitoring

### Voir les Logs
```bash
vercel logs --follow
```

### Voir les Déploiements
```bash
vercel list
```

### Voir les Performances
https://vercel.com/dashboard → Analytics

---

## 🎯 Résumé

1. **Vérifier le code** : `git status`
2. **Déployer** : `vercel --prod`
3. **Vérifier** : https://vercel.com/dashboard
4. **Tester** : https://your-domain.com

C'est tout ! 🚀

---

## 📞 Besoin d'Aide ?

- **Documentation Complète** : Voir `DEPLOYMENT-GUIDE.md`
- **Résumé Final** : Voir `FINAL-DEPLOYMENT-SUMMARY.md`
- **Problèmes de Commandes** : Voir `PRODUCTION-ORDERS-COMPLETE-FIX.md`
