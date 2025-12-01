-- ============================================
-- OPTION NUCLÉAIRE : Tout supprimer et recréer la table products
-- ============================================

-- 1. SAUVEGARDER LES PRODUITS EXISTANTS
CREATE TEMP TABLE products_backup AS SELECT * FROM products;

-- 2. SUPPRIMER LA TABLE PRODUCTS (avec CASCADE pour supprimer tous les triggers/FK)
DROP TABLE IF EXISTS products CASCADE;

-- 3. RECRÉER LA TABLE PRODUCTS (structure simplifiée, sans FK vers users)
CREATE TABLE products (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  base_price NUMERIC NOT NULL,
  price NUMERIC NOT NULL,
  images TEXT NOT NULL DEFAULT '[]',
  category TEXT NOT NULL,
  attributes TEXT,
  total_stock INTEGER DEFAULT 0,
  sizes TEXT,
  colors TEXT,
  stock INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  seller_id TEXT,  -- NULLABLE, sans foreign key
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. RESTAURER LES PRODUITS
INSERT INTO products SELECT * FROM products_backup;

-- 5. DÉSACTIVER RLS
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- 6. CRÉER L'INDEX
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_is_active ON products(is_active);

-- 7. CRÉER LE TRIGGER updated_at (le seul trigger autorisé)
CREATE OR REPLACE FUNCTION update_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_products_updated_at();

-- 8. TEST
INSERT INTO products (name, description, base_price, price, images, category, is_active)
VALUES ('TEST-NUCLEAR', 'Test', 10000, 10000, '[]', 'Tshirt', true)
RETURNING id, name;

-- 9. Nettoyer
DELETE FROM products WHERE name = 'TEST-NUCLEAR';

-- 10. Vérifier qu'il n'y a qu'un seul trigger
SELECT t.tgname
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname = 'products'
AND NOT t.tgisinternal;
