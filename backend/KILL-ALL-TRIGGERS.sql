-- ============================================
-- SUPPRIMER TOUS LES TRIGGERS SUR PRODUCTS
-- ============================================

-- 1. LISTER TOUS LES TRIGGERS (copie le résultat ici)
SELECT 
  t.tgname as trigger_name,
  p.proname as function_name,
  pg_get_triggerdef(t.oid) as trigger_definition
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname = 'products';

-- 2. SUPPRIMER TOUS LES TRIGGERS SUR PRODUCTS (TOUS, sans exception)
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT t.tgname
    FROM pg_trigger t
    JOIN pg_class c ON t.tgrelid = c.oid
    WHERE c.relname = 'products'
    AND NOT t.tgisinternal
  ) LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON products CASCADE', r.tgname);
    RAISE NOTICE 'SUPPRIMÉ: %', r.tgname;
  END LOOP;
END $$;

-- 3. LISTER TOUTES LES FONCTIONS QUI CONTIENNENT "users" OU "email"
SELECT proname, prosrc 
FROM pg_proc 
WHERE (prosrc ILIKE '%users%' OR prosrc ILIKE '%email%')
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- 4. SUPPRIMER LES FONCTIONS SUSPECTES
DROP FUNCTION IF EXISTS handle_new_product() CASCADE;
DROP FUNCTION IF EXISTS create_user_for_product() CASCADE;
DROP FUNCTION IF EXISTS on_product_insert() CASCADE;
DROP FUNCTION IF EXISTS sync_seller() CASCADE;
DROP FUNCTION IF EXISTS create_seller_user() CASCADE;
DROP FUNCTION IF EXISTS handle_product_insert() CASCADE;

-- 5. VÉRIFIER QU'IL N'Y A PLUS DE TRIGGERS
SELECT t.tgname
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname = 'products'
AND NOT t.tgisinternal;

-- 6. TEST FINAL
INSERT INTO products (name, description, base_price, price, images, category, is_active)
VALUES ('TEST-KILL-TRIGGERS', 'Test', 10000, 10000, '[]', 'Tshirt', true)
RETURNING id, name;

-- 7. Nettoyer
DELETE FROM products WHERE name = 'TEST-KILL-TRIGGERS';
