-- SCRIPT DE CORRECTION FORCÉE DES COLONNES JSONB
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Afficher le type actuel
SELECT 
  column_name, 
  data_type
FROM information_schema.columns 
WHERE table_name = 'products' 
  AND column_name IN ('images', 'sizes', 'colors', 'attributes');

-- 2. Si les colonnes sont TEXT, les convertir en JSONB
-- Méthode 1: Conversion directe (si les données sont déjà au format JSON)
DO $$
BEGIN
  -- Convertir images
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' 
      AND column_name = 'images' 
      AND data_type = 'text'
  ) THEN
    ALTER TABLE products ALTER COLUMN images TYPE jsonb USING images::jsonb;
    ALTER TABLE products ALTER COLUMN images SET DEFAULT '[]'::jsonb;
    RAISE NOTICE 'Images converti en JSONB';
  END IF;

  -- Convertir sizes
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' 
      AND column_name = 'sizes' 
      AND data_type = 'text'
  ) THEN
    ALTER TABLE products ALTER COLUMN sizes TYPE jsonb USING sizes::jsonb;
    ALTER TABLE products ALTER COLUMN sizes SET DEFAULT '[]'::jsonb;
    RAISE NOTICE 'Sizes converti en JSONB';
  END IF;

  -- Convertir colors
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' 
      AND column_name = 'colors' 
      AND data_type = 'text'
  ) THEN
    ALTER TABLE products ALTER COLUMN colors TYPE jsonb USING 
      CASE 
        WHEN colors IS NULL OR colors = '' THEN NULL
        ELSE colors::jsonb
      END;
    RAISE NOTICE 'Colors converti en JSONB';
  END IF;

  -- Convertir attributes
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' 
      AND column_name = 'attributes' 
      AND data_type = 'text'
  ) THEN
    ALTER TABLE products ALTER COLUMN attributes TYPE jsonb USING 
      CASE 
        WHEN attributes IS NULL OR attributes = '' THEN '{}'::jsonb
        ELSE attributes::jsonb
      END;
    ALTER TABLE products ALTER COLUMN attributes SET DEFAULT '{}'::jsonb;
    RAISE NOTICE 'Attributes converti en JSONB';
  END IF;
END $$;

-- 3. Vérifier le résultat
SELECT 
  column_name, 
  data_type,
  column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
  AND column_name IN ('images', 'sizes', 'colors', 'attributes')
ORDER BY column_name;

-- 4. Afficher les données des produits
SELECT 
  id,
  name,
  jsonb_typeof(images) as images_type,
  jsonb_array_length(images) as images_count,
  images,
  jsonb_typeof(sizes) as sizes_type,
  sizes,
  jsonb_typeof(colors) as colors_type,
  colors
FROM products;
