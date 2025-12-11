# Guide de Débogage - Création de Produit Admin

## Étapes pour Diagnostiquer le Problème

### 1. Vérifier l'Authentification
- [ ] Ouvrez la console du navigateur (F12)
- [ ] Allez dans l'onglet "Application" ou "Storage"
- [ ] Cherchez `authToken` dans le localStorage
- [ ] Vérifiez que le token existe et n'est pas vide

### 2. Vérifier les Erreurs Réseau
- [ ] Ouvrez l'onglet "Network" dans les DevTools
- [ ] Essayez de créer un produit
- [ ] Cherchez la requête POST vers `/api/admin/products`
- [ ] Vérifiez le statut HTTP (200, 400, 401, 500, etc.)
- [ ] Cliquez sur la requête et regardez la réponse

### 3. Vérifier la Console
- [ ] Ouvrez l'onglet "Console" dans les DevTools
- [ ] Cherchez les messages d'erreur rouges
- [ ] Notez les messages d'erreur complets

### 4. Problèmes Courants et Solutions

#### Erreur 401 (Unauthorized)
- **Cause** : Token d'authentification manquant ou invalide
- **Solution** : 
  - Reconnectez-vous à la page admin
  - Vérifiez que le token est stocké dans localStorage

#### Erreur 400 (Bad Request)
- **Cause** : Données invalides
- **Solution** :
  - Vérifiez que tous les champs requis sont remplis
  - Vérifiez que le prix est un nombre positif
  - Vérifiez que le stock est un nombre positif

#### Erreur 500 (Server Error)
- **Cause** : Erreur du serveur
- **Solution** :
  - Vérifiez que le backend est démarré
  - Vérifiez les logs du backend
  - Vérifiez la connexion à Supabase

#### Erreur de Connexion
- **Cause** : Backend non accessible
- **Solution** :
  - Vérifiez que le backend est démarré (`npm run dev` dans le dossier backend)
  - Vérifiez que l'URL du backend est correcte dans les variables d'environnement

### 5. Vérifier les Variables d'Environnement
- [ ] Vérifiez `.env.production` ou `.env.local`
- [ ] Assurez-vous que `NEXT_PUBLIC_SUPABASE_URL` est défini
- [ ] Assurez-vous que `NEXT_PUBLIC_SUPABASE_ANON_KEY` est défini
- [ ] Assurez-vous que `SUPABASE_SERVICE_ROLE_KEY` est défini

### 6. Tester Manuellement avec cURL
```bash
# Remplacez TOKEN par votre token d'authentification
curl -X POST http://localhost:3000/api/admin/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "name": "Test Product",
    "price": 50000,
    "category": "Tshirt",
    "stock": 10,
    "description": "Test",
    "sizes": ["M", "L"],
    "colors": ["Noir"],
    "images": []
  }'
```

## Informations à Fournir pour le Support

Quand vous demandez de l'aide, fournissez :

1. **Le message d'erreur exact** de la console
2. **Le statut HTTP** de la requête
3. **La réponse complète** de la requête (onglet Response)
4. **Les logs du backend** (si disponible)
5. **Les variables d'environnement** (sans les clés sensibles)

## Checklist Rapide

- [ ] Backend démarré et accessible
- [ ] Authentification valide
- [ ] Tous les champs requis remplis
- [ ] Images compressées correctement
- [ ] Supabase accessible
- [ ] Variables d'environnement correctes
