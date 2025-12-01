-- Exécuter dans Supabase SQL Editor pour voir la structure de la table products

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'products'
ORDER BY ordinal_position;
