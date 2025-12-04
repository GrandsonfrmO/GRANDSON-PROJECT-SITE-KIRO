# Corrections Production - Gestion des Commandes

## Problèmes Résolus

### 1. ✅ Admin non informé des nouvelles commandes
**Problème** : Lorsqu'un client passe une commande, l'admin ne reçoit pas de notification.

**Solution** : 
- Ajout d'un appel à `/api/push/send` après la création d'une commande
- La notification est envoyée à tous les abonnés push avec le numéro et le montant de la commande
- Redirection vers `/admin/orders` pour accès rapide

**Fichier modifié** : `frontend/app/api/orders/route.ts`

---

### 2. ✅ Admin ne peut pas éditer/supprimer ses propres commandes
**Problème** : L'admin crée une commande mais ne peut pas la modifier ou la supprimer.

**Solutions implémentées** :

#### a) Création de commandes par l'admin
- Nouvelle route `POST /api/admin/orders`
- Permet à l'admin de créer directement une commande
- Génère automatiquement un numéro de commande
- Crée les articles associés
- Envoie une notification

#### b) Édition de commandes
- Route `PUT /api/admin/orders/[id]` améliorée
- Permet de modifier :
  - Le statut
  - Les informations client (nom, email, téléphone)
  - L'adresse et la zone de livraison
  - Les frais de livraison
  - Les articles de la commande

#### c) Suppression de commandes
- Route `DELETE /api/admin/orders/[id]` améliorée
- Supprime d'abord les articles associés
- Puis supprime la commande
- Évite les erreurs de contrainte de clé étrangère

**Fichiers modifiés** :
- `frontend/app/api/admin/orders/route.ts`
- `frontend/app/api/admin/orders/[id]/route.ts`

---

### 3. ✅ Images des commandes ne s'affichent pas
**Problème** : Les images des produits ne sont pas incluses dans les données des commandes.

**Solution** :
- Modification de la requête `GET /api/admin/orders` pour inclure les relations :
  - `order_items` : articles de la commande
  - `products` : détails des produits (nom, images)
- Les images sont maintenant retournées dans la structure `items[].product.images`
- Transformation des données pour correspondre au format attendu par le frontend

**Fichier modifié** : `frontend/app/api/admin/orders/route.ts`

---

## Nouvelles Routes API

### Admin Orders Management

#### GET `/api/admin/orders`
Récupère toutes les commandes avec images et détails produits.

**Réponse** :
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "uuid",
        "orderNumber": "GS123456",
        "customerName": "Jean Dupont",
        "customerEmail": "jean@example.com",
        "customerPhone": "+224662662958",
        "deliveryAddress": "123 Rue de la Paix",
        "deliveryZone": "Kaloum",
        "deliveryFee": 5000,
        "total": 50000,
        "totalAmount": 50000,
        "status": "pending",
        "createdAt": "2025-12-04T10:30:00Z",
        "updatedAt": "2025-12-04T10:30:00Z",
        "items": [
          {
            "id": "item-uuid",
            "productId": "prod-uuid",
            "size": "M",
            "quantity": 2,
            "price": 25000,
            "color": "Noir",
            "product": {
              "id": "prod-uuid",
              "name": "T-Shirt Premium",
              "images": ["https://example.com/image1.jpg"]
            }
          }
        ]
      }
    ]
  }
}
```

#### POST `/api/admin/orders`
Crée une nouvelle commande (admin uniquement).

**Payload** :
```json
{
  "customerName": "Jean Dupont",
  "customerEmail": "jean@example.com",
  "customerPhone": "+224662662958",
  "deliveryAddress": "123 Rue de la Paix",
  "deliveryZone": "Kaloum",
  "deliveryFee": 5000,
  "totalAmount": 50000,
  "items": [
    {
      "productId": "prod-uuid",
      "size": "M",
      "quantity": 2,
      "price": 25000,
      "color": "Noir"
    }
  ]
}
```

#### GET `/api/admin/orders/[id]`
Récupère une commande spécifique avec tous les détails.

#### PUT `/api/admin/orders/[id]`
Édite une commande existante.

**Payload** (tous les champs optionnels) :
```json
{
  "status": "confirmed",
  "customerName": "Jean Dupont",
  "customerEmail": "jean@example.com",
  "customerPhone": "+224662662958",
  "deliveryAddress": "123 Rue de la Paix",
  "deliveryZone": "Kaloum",
  "deliveryFee": 5000,
  "items": [
    {
      "productId": "prod-uuid",
      "size": "M",
      "quantity": 2,
      "price": 25000,
      "color": "Noir"
    }
  ]
}
```

#### DELETE `/api/admin/orders/[id]`
Supprime une commande et ses articles associés.

---

## Configuration Production

Assurez-vous que les variables d'environnement suivantes sont configurées :

### `.env.production`
```bash
# Backend URL pour les notifications
BACKEND_URL=https://your-backend-domain.com

# Frontend URL
NEXT_PUBLIC_API_URL=https://your-backend-domain.com

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-url.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## Tests Recommandés

1. **Créer une commande client** → Vérifier que l'admin reçoit une notification
2. **Admin crée une commande** → Vérifier qu'elle apparaît dans la liste
3. **Admin édite une commande** → Vérifier que les modifications sont sauvegardées
4. **Admin supprime une commande** → Vérifier qu'elle disparaît
5. **Vérifier les images** → Ouvrir une commande et voir les images des produits

---

## Notes Importantes

- Les notifications push nécessitent que les utilisateurs soient abonnés
- Les images doivent être stockées dans Supabase ou Cloudinary
- Le statut est mappé en base de données (PROCESSING → CONFIRMED, SHIPPED → CONFIRMED)
- Les articles supprimés lors de l'édition ne peuvent pas être récupérés
