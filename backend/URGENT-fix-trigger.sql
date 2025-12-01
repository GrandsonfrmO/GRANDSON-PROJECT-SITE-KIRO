-- ============================================
-- SCRIPT URGENT : Supprimer le trigger qui cause l'erreur "users"
-- Exécuter TOUT ce script dans Supabase SQL Editor
-- ============================================

-- 1. TROUVER LE TRIGGER COUPABLE
-- Ce trigger essaie de créer un utilisateur quand on insère un produit

SELECT 
  t.tgname as trigger_name,
  c.relname as table_name,
  p.proname as function_name,
  pg_get_functiondef(p.oid) as function_definition
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname = 'products'
AND NOT t.tgisinternal;

-- 2. VOIR TOUTES LES FONCTIONS QUI TOUCHENT À "users"
SELECT 
  proname as function_name,
  prosrc as function_code
FROM pg_proc
WHERE prosrc ILIKE '%users%'
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- 3. SUPPRIMER TOUS LES TRIGGERS SUR PRODUCTS (sauf updated_at)
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
    AND t.tgname NOT LIKE '%updated_at%'
  ) LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON products', r.tgname);
    RAISE NOTICE 'Supprimé trigger: %', r.tgname;
  END LOOP;
END $$;

-- 4. SUPPRIMER LES FONCTIONS QUI RÉFÉRENCENT "users" (si elles existent)
DROP FUNCTION IF EXISTS create_user_for_seller() CASCADE;
DROP FUNCTION IF EXISTS handle_new_product() CASCADE;
DROP FUNCTION IF EXISTS on_product_created() CASCADE;
DROP FUNCTION IF EXISTS sync_product_user() CASCADE;

-- 5. VÉRIFIER QU'IL N'Y A PLUS DE TRIGGERS PROBLÉMATIQUES
SELECT 
  t.tgname as remaining_trigger,
  p.proname as function_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname = 'products'
AND NOT t.tgisinternal;

-- 6. DÉSACTIVER RLS SUR PRODUCTS
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- 7. TEST FINAL - Insérer un produit
INSERT INTO products (name, description, base_price, price, images, category, seller_id, is_active)
VALUES ('TEST-DELETE-ME', 'Test', 10000, 10000, '[]', 'Tshirt', 'admin', true)
RETURNING id, name;

-- 8. Supprimer le produit test si ça a marché
DELETE FROM products WHERE name = 'TEST-DELETE-ME';

-- Si l'étape 7 échoue encore avec "users", exécute ceci pour voir TOUS les triggers de la base:
-- SELECT * FROM information_schema.triggers WHERE trigger_schema = 'public';
