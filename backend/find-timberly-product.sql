-- Find products edited by Timberly that might be problematic

-- 1. Find products with missing or invalid images (most likely culprit)
SELECT 
  id,
  name,
  price,
  stock,
  category,
  images,
  is_active,
  created_at,
  updated_at
FROM products
WHERE 
  (images IS NULL 
   OR images = '' 
   OR images = '[]' 
   OR images = 'null'
   OR images = '{""}')
  AND is_active = true
ORDER BY updated_at DESC;

-- 2. Find products with empty or invalid names
SELECT 
  id,
  name,
  price,
  stock,
  images,
  is_active,
  updated_at
FROM products
WHERE 
  (name IS NULL OR name = '' OR name = 'null')
  AND is_active = true;

-- 3. Find products with invalid prices or stock
SELECT 
  id,
  name,
  price,
  stock,
  images,
  is_active,
  updated_at
FROM products
WHERE 
  (price IS NULL OR price <= 0 OR stock < 0)
  AND is_active = true
ORDER BY updated_at DESC;

-- 4. Find recently updated products (likely Timberly's edits)
SELECT 
  id,
  name,
  price,
  stock,
  category,
  images,
  is_active,
  created_at,
  updated_at
FROM products
WHERE is_active = true
ORDER BY updated_at DESC
LIMIT 10;

-- 5. If you find the problematic product, deactivate it:
-- UPDATE products SET is_active = false WHERE id = [PRODUCT_ID];

-- 6. Or delete it completely:
-- DELETE FROM products WHERE id = [PRODUCT_ID];

-- 7. Verify all active products have valid data
SELECT 
  COUNT(*) as total_active,
  COUNT(CASE WHEN images IS NOT NULL AND images != '' AND images != '[]' THEN 1 END) as with_images,
  COUNT(CASE WHEN images IS NULL OR images = '' OR images = '[]' THEN 1 END) as without_images
FROM products
WHERE is_active = true;
