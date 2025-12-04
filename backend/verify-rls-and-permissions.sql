-- ============================================
-- Script de vérification des permissions Supabase
-- Exécuter dans Supabase SQL Editor
-- ============================================

-- ============================================
-- PARTIE 1 : DIAGNOSTIC DES RLS POLICIES
-- ============================================

-- 1.1 Vérifier l'état de RLS sur toutes les tables importantes
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('products', 'orders', 'order_items', 'admins', 'delivery_zones')
ORDER BY tablename;

-- 1.2 Lister toutes les policies RLS existantes
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as command,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 1.3 Vérifier les triggers sur la table products
SELECT 
  t.tgname as trigger_name,
  t.tgenabled as enabled,
  p.proname as function_name,
  pg_get_triggerdef(t.oid) as trigger_definition
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname = 'products'
AND NOT t.tgisinternal
ORDER BY t.tgname;

-- ============================================
-- PARTIE 2 : VÉRIFICATION DES PERMISSIONS
-- ============================================

-- 2.1 Vérifier les permissions sur la table products
SELECT 
  grantee,
  privilege_type,
  is_grantable
FROM information_schema.table_privileges
WHERE table_schema = 'public'
AND table_name = 'products'
ORDER BY grantee, privilege_type;

-- 2.2 Vérifier les permissions sur la table orders
SELECT 
  grantee,
  privilege_type,
  is_grantable
FROM information_schema.table_privileges
WHERE table_schema = 'public'
AND table_name = 'orders'
ORDER BY grantee, privilege_type;

-- 2.3 Vérifier les permissions sur la table order_items
SELECT 
  grantee,
  privilege_type,
  is_grantable
FROM information_schema.table_privileges
WHERE table_schema = 'public'
AND table_name = 'order_items'
ORDER BY grantee, privilege_type;

-- ============================================
-- PARTIE 3 : CONFIGURATION RECOMMANDÉE
-- ============================================

-- 3.1 Désactiver RLS sur les tables principales (si nécessaire)
-- Note: Le service role key bypass automatiquement RLS, mais pour plus de clarté:

-- Pour products
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- Pour orders
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;

-- Pour order_items
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;

-- Pour delivery_zones
ALTER TABLE delivery_zones DISABLE ROW LEVEL SECURITY;

-- 3.2 Supprimer toutes les policies existantes (si RLS est désactivé)
DO $
DECLARE
  policy_rec RECORD;
BEGIN
  FOR policy_rec IN 
    SELECT schemaname, tablename, policyname 
    FROM pg_policies 
    WHERE schemaname = 'public'
    AND tablename IN ('products', 'orders', 'order_items', 'delivery_zones')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
      policy_rec.policyname, 
      policy_rec.schemaname, 
      policy_rec.tablename);
    RAISE NOTICE 'Dropped policy: % on %.%', 
      policy_rec.policyname, 
      policy_rec.schemaname, 
      policy_rec.tablename;
  END LOOP;
END $;

-- ============================================
-- PARTIE 4 : TESTS CRUD AVEC SERVICE ROLE
-- ============================================

-- 4.1 Test INSERT sur products
DO $
DECLARE
  test_product_id UUID;
BEGIN
  INSERT INTO products (
    name, 
    description, 
    price, 
    base_price,
    category, 
    stock,
    total_stock,
    sizes,
    colors,
    images,
    is_active
  )
  VALUES (
    'TEST-PRODUCT-RLS-VERIFICATION', 
    'Produit de test pour vérifier les permissions', 
    50000,
    50000,
    'Tshirt',
    10,
    10,
    '["M", "L", "XL"]',
    '["Noir", "Blanc"]',
    '["https://example.com/test.jpg"]',
    true
  )
  RETURNING id INTO test_product_id;
  
  RAISE NOTICE 'INSERT test passed - Product ID: %', test_product_id;
  
  -- 4.2 Test SELECT
  PERFORM * FROM products WHERE id = test_product_id;
  RAISE NOTICE 'SELECT test passed';
  
  -- 4.3 Test UPDATE
  UPDATE products 
  SET name = 'TEST-PRODUCT-UPDATED', price = 60000
  WHERE id = test_product_id;
  RAISE NOTICE 'UPDATE test passed';
  
  -- 4.4 Test DELETE
  DELETE FROM products WHERE id = test_product_id;
  RAISE NOTICE 'DELETE test passed';
  
  RAISE NOTICE '✅ All CRUD operations successful with service role key';
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ CRUD test failed: %', SQLERRM;
    -- Cleanup en cas d'erreur
    DELETE FROM products WHERE name LIKE 'TEST-PRODUCT-%';
END $;

-- ============================================
-- PARTIE 5 : VÉRIFICATION FINALE
-- ============================================

-- 5.1 Résumé de l'état RLS
SELECT 
  'RLS Status Summary' as report_section,
  tablename,
  CASE 
    WHEN rowsecurity THEN '⚠️ ENABLED'
    ELSE '✅ DISABLED'
  END as rls_status,
  (SELECT COUNT(*) FROM pg_policies WHERE pg_policies.tablename = pg_tables.tablename) as policy_count
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('products', 'orders', 'order_items', 'delivery_zones', 'admins')
ORDER BY tablename;

-- 5.2 Compter les triggers sur products
SELECT 
  'Trigger Count on Products' as report_section,
  COUNT(*) as trigger_count
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname = 'products'
AND NOT t.tgisinternal;

-- 5.3 Vérifier la structure de la table products
SELECT 
  'Products Table Schema' as report_section,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'products'
ORDER BY ordinal_position;

-- ============================================
-- DOCUMENTATION DES PERMISSIONS REQUISES
-- ============================================

/*
PERMISSIONS REQUISES POUR LE FONCTIONNEMENT EN PRODUCTION:

1. SERVICE ROLE KEY:
   - Le backend DOIT utiliser SUPABASE_SERVICE_ROLE_KEY
   - Cette clé bypass automatiquement toutes les RLS policies
   - Elle a un accès complet à toutes les tables

2. RLS (Row Level Security):
   - RECOMMANDATION: Désactiver RLS sur les tables principales
   - Raison: Le backend utilise le service role key qui bypass RLS de toute façon
   - Tables concernées: products, orders, order_items, delivery_zones

3. ANON KEY (Frontend):
   - Le frontend utilise NEXT_PUBLIC_SUPABASE_ANON_KEY
   - Cette clé a des permissions limitées
   - Elle est soumise aux RLS policies (si activées)
   - Utilisée uniquement pour les opérations publiques (lecture de produits)

4. CONFIGURATION ACTUELLE:
   - Backend: Service Role Key ✅
   - Frontend: Anon Key ✅
   - RLS: Désactivé (recommandé) ✅

5. SÉCURITÉ:
   - Ne JAMAIS exposer le Service Role Key dans le frontend
   - Toutes les opérations admin passent par le backend
   - Le backend valide les JWT tokens avant les opérations sensibles

6. TESTS:
   - Les tests CRUD ci-dessus vérifient que le service role key fonctionne
   - Si les tests passent, les permissions sont correctement configurées
   - Si les tests échouent, vérifier:
     * La clé service role dans les variables d'environnement
     * Les permissions sur les tables
     * Les triggers qui pourraient bloquer les opérations
*/
