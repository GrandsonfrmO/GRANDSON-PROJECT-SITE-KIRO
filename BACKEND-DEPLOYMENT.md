# Guide de Déploiement - Backend TypeScript

## 🚀 Déploiement sur Render

### Prérequis
- Compte Render (https://render.com)
- Repo GitHub avec le code
- Variables d'environnement Supabase

### Étapes

1. **Connecter le repo GitHub**
   - Aller sur https://render.com
   - Cliquer "New +" → "Web Service"
   - Connecter votre repo GitHub

2. **Configurer le service**
   - Name: `grandson-backend`
   - Runtime: `Node`
   - Build Command: `npm run build`
   - Start Command: `npm start`
   - Plan: Starter (gratuit)

3. **Ajouter les variables d'environnement**
   - Aller dans "Environment"
   - Ajouter les variables :

   ```
   NODE_ENV=production
   PORT=3001
   SUPABASE_URL=https://idxzsbdpvyfexrwmuchq.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=<votre-clé>
   JWT_SECRET=<clé-secrète-sécurisée>
   FRONTEND_URL=https://grandsonproject.com
   BACKEND_URL=https://grandson-backend.onrender.com
   ```

4. **Déployer**
   - Cliquer "Create Web Service"
   - Attendre le déploiement (2-3 minutes)
   - Vérifier : https://grandson-backend.onrender.com/health

### Générer une clé JWT sécurisée

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copier la sortie dans `JWT_SECRET`

## 🔄 Déploiement continu

Render déploie automatiquement à chaque push sur la branche principale.

Pour désactiver :
- Aller dans "Settings"
- Désactiver "Auto-Deploy"

## 📊 Monitoring

### Logs
- Aller dans "Logs" sur Render
- Voir les logs en temps réel

### Health Check
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

## 🔧 Dépannage

### Erreur: "Build failed"
1. Vérifier les logs
2. S'assurer que `npm run build` fonctionne localement
3. Vérifier les dépendances dans package.json

### Erreur: "Cannot find module"
```bash
# Localement
npm install
npm run build

# Puis push sur GitHub
```

### Erreur: "SUPABASE_URL not found"
- Vérifier que les variables d'environnement sont configurées
- Attendre 1-2 minutes après l'ajout

### Service ne démarre pas
1. Vérifier les logs
2. S'assurer que `npm start` fonctionne localement
3. Vérifier le PORT (doit être 3001)

## 📈 Performance

### Optimisations
- ✅ Compression gzip activée
- ✅ Caching des réponses
- ✅ Pooling de connexions Supabase
- ✅ Logging optimisé

### Monitoring
- Vérifier les logs pour les erreurs
- Monitorer les temps de réponse
- Vérifier l'utilisation CPU/RAM

## 🔐 Sécurité

### Checklist
- [x] JWT_SECRET changé
- [x] CORS configuré
- [x] Helmet activé
- [x] Variables sensibles en env
- [x] HTTPS forcé
- [x] Rate limiting (à ajouter)

### À faire
1. Ajouter rate limiting
2. Ajouter validation des entrées
3. Ajouter logging des accès
4. Monitorer les erreurs

## 📝 Variables d'environnement

| Variable | Valeur | Requis |
|----------|--------|--------|
| NODE_ENV | production | ✅ |
| PORT | 3001 | ✅ |
| SUPABASE_URL | URL Supabase | ✅ |
| SUPABASE_SERVICE_ROLE_KEY | Clé service | ✅ |
| JWT_SECRET | Clé sécurisée | ✅ |
| FRONTEND_URL | https://grandsonproject.com | ✅ |
| BACKEND_URL | https://grandson-backend.onrender.com | ✅ |

## 🚀 Déploiement local

Pour tester avant de déployer :

```bash
cd backend
npm install
npm run build
NODE_ENV=production npm start
```

Puis tester :
```bash
curl http://localhost:3001/health
```

## 📞 Support Render

- Documentation: https://render.com/docs
- Status: https://status.render.com
- Support: https://render.com/support

## ✅ Checklist de déploiement

- [ ] Code poussé sur GitHub
- [ ] Variables d'environnement configurées
- [ ] Build fonctionne localement
- [ ] Service créé sur Render
- [ ] Déploiement réussi
- [ ] Health check OK
- [ ] Frontend peut accéder au backend
- [ ] Logs vérifiés

## 🎉 Prochaines étapes

1. Configurer le monitoring
2. Ajouter des alertes
3. Configurer les backups Supabase
4. Mettre en place le CI/CD
5. Ajouter des tests automatisés
