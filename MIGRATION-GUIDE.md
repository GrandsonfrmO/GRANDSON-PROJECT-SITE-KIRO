# Guide de Migration - Page Produits v2.0

## 🎯 Objectif

Ce guide vous aide à migrer de l'ancienne version de la page produits vers la version 2.0 optimisée.

---

## 📋 Pré-requis

- Node.js >= 18.x
- npm >= 9.x
- Backup de la base de données
- Backup du code actuel

---

## 🚀 Étapes de Migration

### 1. Backup

```bash
# Backup du code
git checkout -b backup-before-v2
git push origin backup-before-v2

# Backup de la base de données
# (Selon votre système)
```

### 2. Installation

```bash
cd frontend
npm install
```

### 3. Configuration

Mettre à jour `.env.production`:
```env
NEXT_PUBLIC_API_URL=your-api-url
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
```

### 4. Build & Test

```bash
npm run build
npm start
npm run test:prod
```

### 5. Déploiement

```bash
vercel --prod
```

---

## ✅ Checklist Post-Migration

- [ ] Cache fonctionne
- [ ] Filtres fonctionnent
- [ ] Analytics track
- [ ] Performance OK
- [ ] Mobile responsive

---

**Version**: 2.0.0
**Date**: 4 Décembre 2024
