

-- 2. Convertir les colonnes TEXT en JSONB si nécessaire
-- ATTENTION: Cela va convertir les chaînes JSON en objets JSON

-- Convertir images
ALTER TABLE products 
ALTER COLUMN images TYPE JSONB 
USING CASE 
  WHEN images::text ~ '^\[.*\]$' THEN images::jsonb
  ELSE '[]'::jsonb
END;

-- Convertir sizes
ALTER TABLE products 
ALTER COLUMN sizes TYPE JSONB 
USING CASE 
  WHEN sizes::text ~ '^\[.*\]$' THEN sizes::jsonb
  ELSE '["Unique"]'::jsonb
END;

-- Convertir colors (peut être NULL)
ALTER TABLE products 
ALTER COLUMN colors TYPE JSONB 
USING CASE 
  WHEN colors IS NULL THEN NULL
  WHEN colors::text ~ '^\[.*\]$' THEN colors::jsonb
  ELSE NULL
END;

-- 3. Vérifier après conversion
SELECT 
  id,
  name,
  images,
  pg_typeof(images) as images_type,
  sizes,
  pg_typeof(sizes) as sizes_type,
  colors,
  pg_typeof(colors) as colors_type
FROM products;

-- 4. Mettre à jour les valeurs par défaut
ALTER TABLE products ALTER COLUMN images SET DEFAULT '[]'::jsonb;
ALTER TABLE products ALTER COLUMN sizes SET DEFAULT '[]'::jsonb;
ALTER TABLE products ALTER COLUMN colors SET DEFAULT NULL;
