-- Ajouter les nouvelles zones de livraison
-- VENIR CHERCHER (GRATUIT)
-- SONFONIA (30000 GNF)
-- YATAYA-KOBAYA (25000 GNF)

INSERT INTO delivery_zones (name, price, is_active) VALUES 
('VENIR CHERCHER', 0, true),
('SONFONIA', 30000, true),
('YATAYA-KOBAYA', 25000, true)
ON CONFLICT (name) DO UPDATE SET
  price = EXCLUDED.price,
  is_active = EXCLUDED.is_active;
