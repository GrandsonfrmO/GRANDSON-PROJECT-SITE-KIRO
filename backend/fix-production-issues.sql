-- Fix Production Issues
-- 1. Find and remove problematic product edited by Timberly
-- 2. Ensure all products have valid images

-- First, let's see what products might be problematic
-- Products with missing or invalid images
SELECT 
  id, 
  name, 
  images, 
  is_active,
  updated_at,
  created_at
FROM products
WHERE 
  images IS NULL 
  OR images = '' 
  OR images = '[]'
  OR images = 'null'
ORDER BY updated_at DESC
LIMIT 20;

-- Check for products with empty or invalid data
SELECT 
  id, 
  name, 
  price, 
  stock, 
  images,
  is_active
FROM products
WHERE 
  name IS NULL 
  OR name = ''
  OR price IS NULL 
  OR price <= 0
  OR stock < 0
ORDER BY updated_at DESC;

-- Deactivate products with no images (they won't display)
UPDATE products
SET is_active = false
WHERE 
  (images IS NULL OR images = '' OR images = '[]' OR images = 'null')
  AND is_active = true;

-- Verify the update
SELECT COUNT(*) as deactivated_products
FROM products
WHERE is_active = false;

-- Show all active products with valid images
SELECT 
  id,
  name,
  price,
  stock,
  category,
  images,
  is_active,
  updated_at
FROM products
WHERE is_active = true
ORDER BY created_at DESC;
