# Migration Backend - JavaScript vers TypeScript

## 📋 Résumé

Le backend a été migré d'une structure JavaScript simple vers une architecture TypeScript moderne et professionnelle.

## 🎯 Améliorations

### Architecture
- ✅ Structure modulaire avec séparation des responsabilités
- ✅ Routes organisées par domaine (auth, products, orders, admin)
- ✅ Middleware centralisé (authentification, gestion d'erreurs, logging)
- ✅ Types TypeScript stricts pour la sécurité

### Sécurité
- ✅ Validation des entrées
- ✅ Gestion centralisée des erreurs
- ✅ Authentification JWT robuste
- ✅ CORS configuré correctement
- ✅ Helmet pour les headers de sécurité

### Maintenabilité
- ✅ Code typé (TypeScript)
- ✅ Logging structuré avec emojis
- ✅ Gestion d'erreurs cohérente
- ✅ Documentation complète
- ✅ Configuration centralisée

### Performance
- ✅ Async/await avec gestion d'erreurs
- ✅ Middleware optimisé
- ✅ Logging performant

## 📁 Structure

```
backend/
├── src/
│   ├── index.ts                 # Point d'entrée
│   ├── types/
│   │   └── index.ts            # Types TypeScript
│   ├── middleware/
│   │   ├── auth.ts             # Authentification
│   │   ├── errorHandler.ts     # Gestion d'erreurs
│   │   └── requestLogger.ts    # Logging
│   └── routes/
│       ├── auth.ts             # Routes d'authentification
│       ├── products.ts         # Routes produits
│       ├── orders.ts           # Routes commandes
│       ├── admin.ts            # Routes admin
│       └── deliveryZones.ts    # Routes zones de livraison
├── dist/                        # Build compilé
├── package.json
├── tsconfig.json
├── jest.config.js
├── nodemon.json
└── README.md
```

## 🚀 Installation

```bash
cd backend
npm install
```

## 🔧 Configuration

1. Copier `.env.example` en `.env`
2. Remplir les variables Supabase
3. Générer une clé JWT :
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

## 💻 Développement

```bash
npm run dev
```

Ou utiliser le script batch :
```bash
backend-dev.bat
```

Pour démarrer frontend + backend :
```bash
start-all-dev.bat
```

## 🏗️ Build

```bash
npm run build
```

Génère les fichiers compilés dans `dist/`

## 📦 Production

```bash
npm start
```

## 🧪 Tests

```bash
npm test
npm run test:watch
```

## 📚 API Endpoints

### Public
- `GET /health` - Vérifier l'état du serveur
- `GET /api/products` - Lister les produits
- `GET /api/products/:id` - Détail d'un produit
- `GET /api/delivery-zones` - Zones de livraison
- `POST /api/orders` - Créer une commande
- `GET /api/orders/:orderNumber` - Récupérer une commande
- `POST /api/auth/login` - Login admin

### Admin (authentification requise)
- `GET /api/admin/products` - Tous les produits
- `POST /api/admin/products` - Créer un produit
- `PUT /api/admin/products/:id` - Modifier un produit
- `DELETE /api/admin/products/:id` - Supprimer un produit
- `GET /api/admin/orders` - Toutes les commandes
- `PUT /api/admin/orders/:id` - Modifier une commande
- `DELETE /api/admin/orders/:id` - Supprimer une commande

## 🔄 Migration depuis l'ancien backend

### Avant (JavaScript)
```javascript
const express = require('express');
const app = express();

app.get('/api/products', async (req, res) => {
  // ...
});
```

### Après (TypeScript)
```typescript
import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  // ...
});
```

## 🔐 Authentification

Les routes admin utilisent JWT. Inclure le token dans le header :

```
Authorization: Bearer <token>
```

Exemple :
```bash
curl -H "Authorization: Bearer eyJhbGc..." http://localhost:3001/api/admin/products
```

## 📊 Logging

Les logs incluent des emojis pour une meilleure lisibilité :
- 🚀 Démarrage
- ✅ Succès
- ❌ Erreur
- 📦 Produits
- 📝 Commandes
- 🔐 Authentification
- 🚚 Livraison

Exemple :
```
✅ GET /api/products - 200 (45ms)
❌ POST /api/admin/products - 400 (12ms)
📝 Creating order...
```

## 🚢 Déploiement

### Render
1. Connecter le repo GitHub
2. Créer un Web Service
3. Build: `npm run build`
4. Start: `npm start`
5. Configurer les variables d'environnement

### Vercel (Functions)
Le backend peut être déployé comme serverless, mais Express fonctionne mieux sur Render.

## 📝 Variables d'environnement

| Variable | Description | Requis |
|----------|-------------|--------|
| SUPABASE_URL | URL Supabase | ✅ |
| SUPABASE_SERVICE_ROLE_KEY | Clé service | ✅ |
| JWT_SECRET | Clé secrète JWT | ✅ |
| PORT | Port du serveur | ❌ (3001) |
| NODE_ENV | Environnement | ❌ (development) |
| FRONTEND_URL | URL frontend | ❌ |
| BACKEND_URL | URL backend | ❌ |

## 🐛 Dépannage

### Erreur: "Cannot find module 'ts-node'"
```bash
npm install -g ts-node
```

### Erreur: "SUPABASE_URL not found"
Vérifier que `.env` existe et contient les bonnes variables.

### Port déjà utilisé
```bash
# Changer le port dans .env
PORT=3002
```

## 📞 Support

Pour toute question, consulter le README.md du backend ou les fichiers de route.

## ✅ Checklist de migration

- [x] Structure TypeScript créée
- [x] Routes migrées
- [x] Middleware implémenté
- [x] Types définis
- [x] Configuration centralisée
- [x] Gestion d'erreurs robuste
- [x] Documentation complète
- [x] Scripts de démarrage
- [x] Configuration de build
- [x] Tests configurés

## 🎉 Prochaines étapes

1. Installer les dépendances : `npm install`
2. Configurer `.env`
3. Démarrer le développement : `npm run dev`
4. Tester les endpoints
5. Déployer en production
