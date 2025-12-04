# Guide des Permissions Supabase

## Vue d'ensemble

Ce document explique comment les permissions Supabase sont configurées pour le projet Grandson et comment vérifier qu'elles fonctionnent correctement.

## Architecture des Permissions

### 1. Service Role Key (Backend)

**Utilisation**: Backend Express (backend/supabase-server.js)

**Caractéristiques**:
- Accès complet à toutes les tables
- Bypass automatique des Row Level Security (RLS) policies
- Ne doit JAMAIS être exposé dans le frontend
- Utilisé pour toutes les opérations admin

**Configuration**:
```javascript
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
```

**Variable d'environnement**:
```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Anon Key (Frontend)

**Utilisation**: Frontend Next.js (frontend/app/lib/supabase.ts)

**Caractéristiques**:
- Accès limité aux opérations publiques
- Soumis aux RLS policies (si activées)
- Peut être exposé dans le frontend
- Utilisé pour la lecture publique des produits

**Configuration**:
```typescript
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

**Variables d'environnement**:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Row Level Security (RLS)

### Configuration Recommandée

Pour ce projet, nous recommandons de **DÉSACTIVER** RLS sur les tables principales:

**Raisons**:
1. Le backend utilise le service role key qui bypass RLS de toute façon
2. Simplifie la configuration et le débogage
3. Toute la sécurité est gérée au niveau de l'application (JWT tokens)
4. Les opérations sensibles passent par le backend authentifié

**Tables concernées**:
- `products`
- `orders`
- `order_items`
- `delivery_zones`
- `admins`

**Commandes SQL**:
```sql
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_zones DISABLE ROW LEVEL SECURITY;
```

### Alternative: RLS Activé

Si vous préférez activer RLS, vous devez créer des policies appropriées:

```sql
-- Exemple: Permettre la lecture publique des produits actifs
CREATE POLICY "Public products are viewable by everyone"
ON products FOR SELECT
USING (is_active = true);

-- Exemple: Permettre toutes les opérations avec le service role
CREATE POLICY "Service role has full access"
ON products FOR ALL
USING (auth.role() = 'service_role');
```

## Vérification des Permissions

### Méthode 1: Script SQL

Exécutez le script `verify-rls-and-permissions.sql` dans Supabase SQL Editor:

```bash
# Le script est dans: backend/verify-rls-and-permissions.sql
```

**Ce script vérifie**:
- L'état RLS sur toutes les tables
- Les policies existantes
- Les triggers sur la table products
- Les permissions sur les tables
- Effectue des tests CRUD

### Méthode 2: Script Node.js

Exécutez le script de test depuis le terminal:

```bash
cd backend
node test-supabase-permissions.js
```

**Ce script teste**:
- ✅ Lecture avec le service role key
- ✅ INSERT (création de produit)
- ✅ SELECT (lecture de produit)
- ✅ UPDATE (modification de produit)
- ✅ DELETE (suppression de produit)
- ✅ Accès à la table orders
- ✅ Accès à la table delivery_zones

**Résultat attendu**:
```
╔════════════════════════════════════════════════════════════╗
║   TEST DES PERMISSIONS SUPABASE - SERVICE ROLE KEY        ║
╚════════════════════════════════════════════════════════════╝

📊 Résultats:
   RLS Status Check:     ✅ PASS
   INSERT (Create):      ✅ PASS
   SELECT (Read):        ✅ PASS
   UPDATE (Modify):      ✅ PASS
   DELETE (Remove):      ✅ PASS
   Orders Table:         ✅ PASS
   Delivery Zones Table: ✅ PASS

🎉 TOUS LES TESTS SONT PASSÉS!
✅ Le service role key a un accès complet à toutes les tables
✅ Les permissions Supabase sont correctement configurées
```

## Problèmes Courants

### Erreur: "new row violates row-level security policy"

**Cause**: RLS est activé et il n'y a pas de policy permettant l'opération

**Solution**:
1. Désactiver RLS: `ALTER TABLE products DISABLE ROW LEVEL SECURITY;`
2. OU créer une policy appropriée
3. Vérifier que vous utilisez bien le service role key dans le backend

### Erreur: "permission denied for table products"

**Cause**: Le rôle utilisé n'a pas les permissions nécessaires

**Solution**:
1. Vérifier que vous utilisez `SUPABASE_SERVICE_ROLE_KEY` et non `SUPABASE_ANON_KEY`
2. Vérifier que la clé est correcte dans les variables d'environnement
3. Vérifier les permissions de la table dans Supabase

### Erreur: "relation 'users' does not exist"

**Cause**: Un trigger ou une fonction référence une table qui n'existe pas

**Solution**:
1. Identifier le trigger problématique: voir `verify-rls-and-permissions.sql`
2. Supprimer le trigger: `DROP TRIGGER trigger_name ON products;`
3. Supprimer la fonction associée si nécessaire

## Sécurité

### ✅ Bonnes Pratiques

1. **Ne JAMAIS exposer le service role key dans le frontend**
   ```typescript
   // ❌ MAUVAIS
   const supabase = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY);
   
   // ✅ BON
   const supabase = createClient(url, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
   ```

2. **Toutes les opérations admin passent par le backend**
   ```typescript
   // Frontend fait une requête au backend
   const response = await fetch('/api/admin/products', {
     method: 'POST',
     headers: {
       'Authorization': `Bearer ${token}`, // JWT token
       'Content-Type': 'application/json'
     },
     body: JSON.stringify(productData)
   });
   
   // Backend valide le token puis utilise le service role key
   ```

3. **Valider les JWT tokens avant les opérations sensibles**
   ```javascript
   const authenticateToken = (req, res, next) => {
     const token = req.headers['authorization']?.split(' ')[1];
     if (!token) return res.status(401).json({ error: 'Token required' });
     
     try {
       const decoded = jwt.decode(token, process.env.JWT_SECRET);
       req.user = decoded;
       next();
     } catch (error) {
       return res.status(403).json({ error: 'Invalid token' });
     }
   };
   ```

### ⚠️ Erreurs à Éviter

1. ❌ Utiliser le service role key dans le frontend
2. ❌ Exposer le service role key dans les logs
3. ❌ Commit le service role key dans Git
4. ❌ Permettre des opérations admin sans authentification
5. ❌ Utiliser l'anon key pour des opérations admin

## Configuration en Production

### Vercel (Frontend)

Variables d'environnement requises:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (pour API routes)
```

### Render (Backend)

Variables d'environnement requises:
```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
JWT_SECRET=your-production-secret
```

## Checklist de Vérification

Avant de déployer en production:

- [ ] Le service role key est configuré dans le backend
- [ ] L'anon key est configuré dans le frontend
- [ ] RLS est désactivé sur les tables principales (ou policies configurées)
- [ ] Les tests de permissions passent (`node test-supabase-permissions.js`)
- [ ] Le service role key n'est PAS exposé dans le frontend
- [ ] Les JWT tokens sont validés avant les opérations admin
- [ ] Les variables d'environnement sont configurées sur Vercel et Render
- [ ] Les logs ne contiennent pas de clés sensibles

## Support

Si vous rencontrez des problèmes:

1. Exécutez `node test-supabase-permissions.js` pour diagnostiquer
2. Vérifiez les logs du backend pour les erreurs Supabase
3. Consultez la documentation Supabase: https://supabase.com/docs/guides/auth/row-level-security
4. Vérifiez que les variables d'environnement sont correctes

## Références

- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Service Role Key](https://supabase.com/docs/guides/api/api-keys)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
