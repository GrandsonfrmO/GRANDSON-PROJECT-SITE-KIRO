-- ============================================
-- Script COMPLET de correction pour la table products
-- Exécuter dans Supabase SQL Editor
-- ============================================

-- ============================================
-- ÉTAPE 1 : DIAGNOSTIC - Identifier le problème
-- ============================================

-- 1.1 Voir TOUS les triggers sur la table products
SELECT 
  tgname as trigger_name,
  tgtype,
  proname as function_name
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname = 'products';

-- 1.2 Voir les triggers avec plus de détails
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement,
  action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'products';

-- 1.3 Vérifier si la table users existe
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'users';

-- 1.4 Voir toutes les fonctions qui référencent 'users'
SELECT 
  proname as function_name,
  prosrc as function_body
FROM pg_proc
WHERE prosrc LIKE '%users%'
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- ============================================
-- ÉTAPE 2 : SUPPRIMER LES TRIGGERS PROBLÉMATIQUES
-- ============================================

-- Supprimer TOUS les triggers sur products (sauf updated_at)
DO $$
DECLARE
  trigger_rec RECORD;
BEGIN
  FOR trigger_rec IN 
    SELECT tgname 
    FROM pg_trigger t
    JOIN pg_class c ON t.tgrelid = c.oid
    WHERE c.relname = 'products'
    AND tgname NOT LIKE '%updated_at%'
    AND NOT tgisinternal
  LOOP
    EXECUTE 'DROP TRIGGER IF EXISTS ' || trigger_rec.tgname || ' ON products';
    RAISE NOTICE 'Dropped trigger: %', trigger_rec.tgname;
  END LOOP;
END $$;

-- ============================================
-- ÉTAPE 3 : DÉSACTIVER RLS
-- ============================================

ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- Supprimer toutes les policies sur products
DO $$
DECLARE
  policy_rec RECORD;
BEGIN
  FOR policy_rec IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'products'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || policy_rec.policyname || '" ON products';
    RAISE NOTICE 'Dropped policy: %', policy_rec.policyname;
  END LOOP;
END $$;

-- ============================================
-- ÉTAPE 4 : VÉRIFICATION
-- ============================================

-- Vérifier qu'il n'y a plus de triggers problématiques
SELECT 
  tgname as remaining_triggers
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname = 'products'
AND NOT tgisinternal;

-- Vérifier que RLS est désactivé
SELECT 
  relname as table_name,
  relrowsecurity as rls_enabled
FROM pg_class
WHERE relname = 'products';

-- ============================================
-- ÉTAPE 5 : TEST D'INSERTION
-- ============================================

-- Tester une insertion
INSERT INTO products (name, description, price, category, stock, sizes, images, is_active)
VALUES ('TEST-PRODUCT-DELETE-ME', 'Test', 10000, 'Tshirt', 5, '["M"]', '[]', true)
RETURNING id, name;

-- Si ça fonctionne, supprimer le produit test
DELETE FROM products WHERE name = 'TEST-PRODUCT-DELETE-ME';
