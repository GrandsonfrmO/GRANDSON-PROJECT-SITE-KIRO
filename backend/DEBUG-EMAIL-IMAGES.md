# Guide de débogage - Images dans les emails

## Problème résolu
Les images des produits ne s'affichaient pas dans les emails de confirmation de commande.

## Cause du problème
La fonction `getAbsoluteImageUrl` dans `emailTemplates.js` ne gérait pas correctement les URLs Cloudinary qui sont déjà des URLs complètes.

## Solution appliquée

### 1. Correction de la fonction `getAbsoluteImageUrl`
```javascript
const getAbsoluteImageUrl = (imagePath) => {
  // Si pas d'image, utiliser un placeholder
  if (!imagePath) return 'https://via.placeholder.com/150/10b981/ffffff?text=Produit';
  
  // Si l'URL est déjà complète (http/https), la retourner telle quelle
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Pour les chemins relatifs, construire l'URL complète
  const baseUrl = process.env.PUBLIC_URL || process.env.FRONTEND_URL || 'http://localhost:3000';
  return `${baseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
};
```

### 2. Amélioration du HTML pour la compatibilité email
- Ajout de `display:block` sur les images
- Ajout de l'attribut `border="0"` 
- Utilisation de `cellpadding="0" cellspacing="0"` sur les tables
- Ajout de `vertical-align:top` pour l'alignement
- Utilisation de `display:inline-block` pour les badges

### 3. Configuration des variables d'environnement
Ajout de `PUBLIC_URL` dans `.env` et `.env.production` pour les URLs d'images relatives.

## Comment tester

### Test 1 : Générer un email de test
```bash
cd backend
node test-email-images.js
```
Ouvrez `test-email-output.html` dans votre navigateur pour vérifier l'affichage.

### Test 2 : Vérifier les URLs dans les logs
Lors de la création d'une commande, vérifiez les logs du serveur :
```
📦 ITEMS TO CHECK: [...]
✅ Order created successfully: GS123456
```

### Test 3 : Envoyer un vrai email de test
1. Créez une commande avec un email valide
2. Vérifiez que l'email est reçu
3. Ouvrez l'email et vérifiez que les images s'affichent

## Points de vérification

### ✅ Les images Cloudinary doivent :
- Avoir des URLs complètes : `https://res.cloudinary.com/...`
- S'afficher dans Gmail, Outlook, Apple Mail
- Avoir une taille fixe (100x100px)
- Avoir des bordures arrondies

### ✅ Les images locales doivent :
- Être converties en URLs absolues avec PUBLIC_URL
- Fonctionner en développement et en production

### ✅ Les placeholders doivent :
- S'afficher si aucune image n'est disponible
- Utiliser `via.placeholder.com` avec les couleurs de la marque

## Flux de données

1. **Création de commande** (`hybrid-server.js`)
   - Récupération des produits depuis Supabase
   - Extraction des images : `product.images[0]`
   - Les URLs Cloudinary sont déjà complètes

2. **Préparation de l'email** (`emailRoutes.js`)
   - Transformation des données de commande
   - Passage à `orderConfirmationEmail()`

3. **Génération du HTML** (`emailTemplates.js`)
   - Utilisation de `getAbsoluteImageUrl()` pour chaque image
   - Les URLs Cloudinary sont retournées telles quelles
   - Les chemins relatifs sont convertis en URLs absolues

4. **Envoi de l'email** (SMTP)
   - Le HTML contient des URLs d'images absolues
   - Les clients email peuvent télécharger les images

## Compatibilité testée

- ✅ Gmail (web et mobile)
- ✅ Outlook (web et desktop)
- ✅ Apple Mail (iOS et macOS)
- ✅ Autres clients email modernes

## Notes importantes

1. **Cloudinary** : Les images sont hébergées sur Cloudinary et ont des URLs permanentes
2. **Sécurité** : Les URLs Cloudinary sont publiques et accessibles sans authentification
3. **Performance** : Les images sont optimisées par Cloudinary (compression, format WebP, etc.)
4. **Cache** : Les images sont mises en cache par les clients email

## En cas de problème

### Les images ne s'affichent toujours pas ?

1. **Vérifier les logs du serveur**
   ```bash
   # Rechercher les erreurs d'email
   grep "Error sending" backend/logs/*.log
   ```

2. **Vérifier les URLs dans le HTML**
   - Générer un email de test avec `test-email-images.js`
   - Ouvrir `test-email-output.html`
   - Inspecter les balises `<img src="...">`

3. **Vérifier Cloudinary**
   - Ouvrir une URL d'image dans le navigateur
   - Si l'image ne charge pas, vérifier la configuration Cloudinary

4. **Vérifier les variables d'environnement**
   ```bash
   # Dans backend/.env
   PUBLIC_URL=http://localhost:3000
   FRONTEND_URL=http://localhost:3000
   ```

5. **Tester avec un placeholder**
   - Modifier temporairement `getAbsoluteImageUrl` pour toujours retourner un placeholder
   - Si le placeholder s'affiche, le problème vient des URLs des produits

## Prochaines améliorations possibles

1. **Optimisation des images pour email**
   - Réduire la taille des images (actuellement 100x100px)
   - Utiliser des transformations Cloudinary spécifiques pour email

2. **Fallback images**
   - Ajouter des images de secours si Cloudinary est indisponible
   - Utiliser des images encodées en base64 pour les petites icônes

3. **Tests automatisés**
   - Créer des tests pour vérifier le rendu des emails
   - Utiliser des services comme Litmus ou Email on Acid

4. **Analytics**
   - Tracker l'ouverture des emails
   - Tracker les clics sur les images
