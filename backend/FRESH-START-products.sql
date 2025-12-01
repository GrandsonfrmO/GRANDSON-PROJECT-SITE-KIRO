-- ============================================
-- NOUVEAU DÉPART : Supprimer et recréer products proprement
-- ============================================

-- 1. SAUVEGARDER les produits existants (si tu veux les garder)
CREATE TEMP TABLE products_backup AS SELECT * FROM products;

-- 2. SUPPRIMER COMPLÈTEMENT la table products
DROP TABLE IF EXISTS products CASCADE;

-- 3. CRÉER UNE NOUVELLE TABLE PRODUCTS SIMPLE
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  base_price NUMERIC NOT NULL,
  price NUMERIC NOT NULL,
  images TEXT NOT NULL DEFAULT '[]',
  category TEXT NOT NULL,
  attributes TEXT,
  total_stock INTEGER DEFAULT 0,
  sizes TEXT DEFAULT '["Unique"]',
  colors TEXT,
  stock INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  seller_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. DÉSACTIVER RLS
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- 5. CRÉER LES INDEX
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_created_at ON products(created_at DESC);

-- 6. CRÉER LE TRIGGER updated_at (SEUL trigger autorisé)
CREATE OR REPLACE FUNCTION update_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at_trigger
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_products_updated_at();

-- 7. VÉRIFIER qu'il n'y a qu'un seul trigger
SELECT 
  t.tgname as trigger_name,
  p.proname as function_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname = 'products'
AND NOT t.tgisinternal;

-- 8. TEST FINAL - Insérer un produit
INSERT INTO products (
  name, 
  description, 
  base_price, 
  price, 
  images, 
  category, 
  sizes,
  colors,
  stock,
  total_stock,
  is_active
)
VALUES (
  'Produit Test', 
  'Description test', 
  50000, 
  50000, 
  '["https://example.com/image.jpg"]', 
  'Tshirt',
  '["M", "L", "XL"]',
  '["Noir", "Blanc"]',
  10,
  10,
  true
)
RETURNING id, name, price, stock;

-- 9. Vérifier que le produit est bien créé
SELECT id, name, price, stock, created_at FROM products WHERE name = 'Produit Test';

-- 10. Supprimer le produit test
DELETE FROM products WHERE name = 'Produit Test';

-- 11. Si tu veux restaurer les anciens produits (OPTIONNEL)
-- INSERT INTO products SELECT * FROM products_backup;

-- 12. Afficher la structure finale
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'products'
ORDER BY ordinal_position;
