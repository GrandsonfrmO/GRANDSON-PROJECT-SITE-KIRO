-- ============================================
-- SUPPRIMER TOUTES LES FOREIGN KEYS SUR PRODUCTS
-- ============================================

-- 1. LISTER TOUTES LES FOREIGN KEYS sur products
SELECT 
  conname as constraint_name,
  conrelid::regclass as table_name,
  confrelid::regclass as references_table
FROM pg_constraint
WHERE conrelid = 'products'::regclass
AND contype = 'f';

-- 2. SUPPRIMER TOUTES LES FOREIGN KEYS
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'products'::regclass
    AND contype = 'f'
  ) LOOP
    EXECUTE format('ALTER TABLE products DROP CONSTRAINT IF EXISTS %I CASCADE', r.conname);
    RAISE NOTICE 'Supprimé FK: %', r.conname;
  END LOOP;
END $$;

-- 3. VÉRIFIER QU'IL N'Y A PLUS DE FK
SELECT conname
FROM pg_constraint
WHERE conrelid = 'products'::regclass
AND contype = 'f';

-- 4. TEST FINAL
INSERT INTO products (name, description, base_price, price, images, category, is_active)
VALUES ('TEST-NO-FK', 'Test sans FK', 10000, 10000, '[]', 'Tshirt', true)
RETURNING id, name;

-- 5. Nettoyer
DELETE FROM products WHERE name = 'TEST-NO-FK';
