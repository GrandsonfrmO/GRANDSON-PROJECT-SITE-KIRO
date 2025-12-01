-- ============================================
-- SOLUTION FINALE : Supprimer la foreign key sur seller_id
-- ============================================

-- 1. Voir la structure de la table users
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users';

-- 2. SUPPRIMER LA FOREIGN KEY CONSTRAINT
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_seller_id_fkey;

-- 3. Rendre seller_id nullable (optionnel mais recommandé)
ALTER TABLE products ALTER COLUMN seller_id DROP NOT NULL;

-- 4. TEST - Insérer un produit SANS seller_id
INSERT INTO products (name, description, base_price, price, images, category, is_active)
VALUES ('TEST-FINAL', 'Test sans seller_id', 10000, 10000, '[]', 'Tshirt', true)
RETURNING id, name;

-- 5. Supprimer le produit test
DELETE FROM products WHERE name = 'TEST-FINAL';

-- 6. Vérifier que la contrainte est bien supprimée
SELECT conname, contype
FROM pg_constraint
WHERE conrelid = 'products'::regclass;
