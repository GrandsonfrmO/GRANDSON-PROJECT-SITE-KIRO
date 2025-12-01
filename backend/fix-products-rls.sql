-- ============================================
-- Script de correction RLS pour la table products
-- Exécuter dans Supabase SQL Editor
-- ============================================

-- 1. D'abord, voir les policies existantes sur products
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'products';

-- 2. Voir les triggers sur products
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'products';

-- 3. Vérifier si la table users existe (elle ne devrait pas dans votre schéma)
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'users'
) as users_table_exists;

-- ============================================
-- SOLUTION : Désactiver RLS ou créer des policies permissives
-- ============================================

-- Option A : Désactiver complètement RLS sur products (plus simple)
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- Option B : Si vous voulez garder RLS mais permettre toutes les opérations
-- (décommentez les lignes ci-dessous si vous préférez cette option)

-- Supprimer toutes les policies existantes sur products
-- DROP POLICY IF EXISTS "Enable read access for all users" ON products;
-- DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON products;
-- DROP POLICY IF EXISTS "Enable update for authenticated users only" ON products;
-- DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON products;
-- DROP POLICY IF EXISTS "products_select_policy" ON products;
-- DROP POLICY IF EXISTS "products_insert_policy" ON products;
-- DROP POLICY IF EXISTS "products_update_policy" ON products;
-- DROP POLICY IF EXISTS "products_delete_policy" ON products;

-- Créer une policy permissive pour toutes les opérations
-- CREATE POLICY "Allow all operations on products" ON products
-- FOR ALL
-- USING (true)
-- WITH CHECK (true);

-- ============================================
-- Vérification après correction
-- ============================================

-- Vérifier que RLS est désactivé
SELECT 
  relname as table_name,
  relrowsecurity as rls_enabled
FROM pg_class
WHERE relname = 'products';

-- Tester une insertion simple
-- INSERT INTO products (name, description, price, category, stock)
-- VALUES ('Test Product', 'Test description', 10000, 'Tshirt', 5)
-- RETURNING *;

-- Si le test fonctionne, supprimer le produit test
-- DELETE FROM products WHERE name = 'Test Product';
