# Backend - Grandson Project

Backend moderne en TypeScript avec Express et Supabase.

## Structure

```
src/
├── index.ts              # Point d'entrée principal
├── types/                # Types TypeScript
├── middleware/           # Middleware Express
│   ├── auth.ts          # Authentification JWT
│   ├── errorHandler.ts  # Gestion des erreurs
│   └── requestLogger.ts # Logging des requêtes
└── routes/              # Routes API
    ├── auth.ts          # Authentification
    ├── products.ts      # Produits
    ├── orders.ts        # Commandes
    ├── admin.ts         # Admin
    └── deliveryZones.ts # Zones de livraison
```

## Installation

```bash
cd backend
npm install
```

## Configuration

1. Copier `.env.example` en `.env`
2. Remplir les variables d'environnement Supabase
3. Générer une clé JWT sécurisée

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Développement

```bash
npm run dev
```

Le serveur démarre sur `http://localhost:3001`

## Build

```bash
npm run build
```

## Production

```bash
npm start
```

## API Endpoints

### Public
- `GET /health` - Health check
- `GET /api/products` - Tous les produits
- `GET /api/products/:id` - Produit spécifique
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

## Gestion des erreurs

Les erreurs sont centralisées avec la classe `AppError` :

```typescript
throw new AppError(400, 'Message d\'erreur', 'ERROR_CODE');
```

Réponse d'erreur standardisée :

```json
{
  "success": false,
  "error": {
    "message": "Message d'erreur",
    "code": "ERROR_CODE"
  }
}
```

## Authentification

Les routes admin utilisent JWT. Inclure le token dans le header :

```
Authorization: Bearer <token>
```

## Variables d'environnement

| Variable | Description | Requis |
|----------|-------------|--------|
| SUPABASE_URL | URL Supabase | ✅ |
| SUPABASE_SERVICE_ROLE_KEY | Clé service Supabase | ✅ |
| JWT_SECRET | Clé secrète JWT | ✅ |
| PORT | Port du serveur | ❌ (défaut: 3001) |
| NODE_ENV | Environnement | ❌ (défaut: development) |
| FRONTEND_URL | URL du frontend | ❌ |
| BACKEND_URL | URL du backend | ❌ |

## Déploiement

### Render

1. Connecter le repo GitHub
2. Créer un nouveau Web Service
3. Configurer les variables d'environnement
4. Build command: `npm run build`
5. Start command: `npm start`

### Vercel

Le backend peut être déployé comme fonction serverless, mais Express fonctionne mieux sur Render.

## Tests

```bash
npm test
npm run test:watch
```

## Logs

Les logs incluent des emojis pour une meilleure lisibilité :
- 🚀 Démarrage
- ✅ Succès
- ❌ Erreur
- 📦 Produits
- 📝 Commandes
- 🔐 Authentification
- 🚚 Livraison
