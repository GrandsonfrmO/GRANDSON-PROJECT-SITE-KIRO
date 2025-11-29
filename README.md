# Grandson Project - Mode Guinéenne Authentique

Un site e-commerce moderne spécialisé dans la vente de vêtements traditionnels guinéens et produits artisanaux authentiques.

## 🌟 Fonctionnalités

### ✨ Site Public
- **Catalogue authentique** : Collection de vêtements traditionnels guinéens
- **Filtrage intelligent** : Par catégorie (Boubous, Dashikis, Accessoires, etc.)
- **Pages détaillées** : Descriptions complètes avec tailles et couleurs
- **Design moderne** : Interface élégante respectant l'identité culturelle
- **Responsive** : Optimisé pour tous les appareils

### 👑 Administration Complète
- **Authentification sécurisée** : Système de connexion JWT
- **Gestion des produits** : Création, modification, suppression (CRUD complet)
- **Tableau de bord** : Statistiques en temps réel
- **Interface intuitive** : Design moderne avec animations

## 🚀 Technologies

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Base de données**: Supabase (PostgreSQL)
- **Authentification**: JWT sécurisé
- **Upload d'images**: Cloudinary
- **Email**: Nodemailer

## 📦 Installation Rapide

### Option 1: Démarrage automatique
```bash
# Double-cliquez sur start-all.bat (Windows)
# Ou exécutez:
start-all.bat
```

### Option 2: Installation manuelle

1. **Cloner le projet**
```bash
git clone <repository-url>
cd grandson-project
```

2. **Installer les dépendances**
```bash
# Dépendances racine
npm install

# Frontend
cd frontend && npm install

# Backend
cd ../backend && npm install
```

3. **Initialiser la base de données avec de vraies données**
```bash
cd backend
npm run db:seed
```

4. **Démarrer les serveurs**
```bash
# Terminal 1 - Backend
cd backend
node hybrid-server.js

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## 🌐 Accès aux Services

- **🏠 Site public**: http://localhost:3000
- **🔧 API Backend**: http://localhost:3001
- **👑 Administration**: http://localhost:3000/admin/login

### 🔑 Identifiants Admin
- **Username**: `admin`
- **Password**: `admin123`

## 📊 Données Authentiques

Le projet contient maintenant **10 produits authentiques guinéens** :

1. **Boubou Traditionnel Guinéen Premium** - 85,000 GNF
2. **Dashiki Moderne Conakry Style** - 45,000 GNF
3. **Chemise Wax Africaine Élégante** - 35,000 GNF
4. **Robe Pagne Guinéenne Moderne** - 55,000 GNF
5. **Ensemble Complet Homme Guinéen** - 95,000 GNF
6. **Foulard Soie Motifs Guinéens** - 25,000 GNF
7. **Sandales Cuir Artisanales Guinée** - 40,000 GNF
8. **Sac Bandoulière Tissage Traditionnel** - 30,000 GNF
9. **Bijoux Traditionnels Guinéens Set** - 65,000 GNF
10. **Pantalon Bogolan Authentique** - 50,000 GNF

## 🛠️ API Endpoints

### 🌍 Public
- `GET /api/products` - Catalogue des produits
- `GET /api/products/:id` - Détail d'un produit
- `GET /api/settings` - Paramètres du site

### 🔐 Admin (Token requis)
- `POST /api/auth/login` - Connexion administrateur
- `GET /api/admin/products` - Tous les produits (admin)
- `POST /api/admin/products` - Créer un produit
- `PUT /api/admin/products/:id` - Modifier un produit
- `DELETE /api/admin/products/:id` - Supprimer un produit

## 🧪 Tests

Un script de test complet est disponible :
```bash
node test-admin-complete.js
```

Ce script teste :
- ✅ Connexion administrateur
- ✅ Récupération des produits
- ✅ Création de produits
- ✅ Modification de produits
- ✅ Suppression de produits
- ✅ Récupération des paramètres

## 📁 Structure du Projet

```
grandson-project/
├── 🌐 frontend/              # Application Next.js
│   ├── app/                  # Pages et composants
│   │   ├── admin/           # Interface d'administration
│   │   ├── components/      # Composants réutilisables
│   │   └── lib/            # Utilitaires et API
│   └── public/             # Assets statiques
├── 🔧 backend/               # API Express
│   ├── src/                # Code source TypeScript
│   │   ├── controllers/    # Contrôleurs API
│   │   ├── services/       # Services métier
│   │   ├── scripts/        # Scripts (seed, etc.)
│   │   └── config/         # Configuration
│   └── uploads/            # Fichiers uploadés
├── 🚀 start-all.bat         # Script de démarrage automatique
├── 🧪 test-admin-complete.js # Tests complets de l'API
└── 📖 README.md             # Cette documentation
```

## 🎯 Fonctionnalités Admin Complètes

### ✅ Problèmes Résolus
- **Admin fonctionne** : Connexion et authentification JWT
- **APIs connectées** : Toutes les routes admin implémentées
- **Données réelles** : Remplacement des données de test par de vrais produits guinéens
- **Création de produits** : Formulaire complet avec validation
- **Gestion complète** : CRUD complet pour les produits

### 🎨 Interface Admin
- **Tableau de bord moderne** : Statistiques en temps réel
- **Gestion des produits** : Interface intuitive pour créer/modifier/supprimer
- **Formulaire complet** : Tous les champs nécessaires (nom, prix, description, tailles, couleurs, stock)
- **Validation** : Contrôles de saisie et messages d'erreur
- **Design cohérent** : Interface élégante avec animations

## 🌍 Configuration Guinéenne

Le site est maintenant configuré avec :
- **Devise** : Franc Guinéen (GNF)
- **Téléphone** : +224 662 662 958
- **Zones de livraison** : Conakry et environs
- **Produits authentiques** : Vêtements traditionnels guinéens
- **Culture locale** : Respect des traditions et de l'artisanat

## 🚀 Déploiement

Configuré pour :
- **Frontend** : Vercel
- **Backend** : Render
- **Base de données** : Supabase

## 📞 Support

Pour toute question ou assistance :
- **Email** : contact@grandsonproject.com
- **Téléphone** : +224 662 662 958

## 📄 Licence

MIT - Voir le fichier LICENSE pour plus de détails.

---

**🎉 Tout est maintenant fonctionnel ! L'admin fonctionne, les APIs sont connectées, et les vraies données guinéennes remplacent les données de test.**