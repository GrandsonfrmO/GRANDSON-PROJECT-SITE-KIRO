-- Schema pour la galerie de personnalisation
-- Exécuter dans Supabase SQL Editor

CREATE TABLE IF NOT EXISTS customization_gallery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  subtitle VARCHAR(200),
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour l'ordre d'affichage
CREATE INDEX IF NOT EXISTS idx_customization_gallery_order ON customization_gallery(display_order);

-- Activer RLS
ALTER TABLE customization_gallery ENABLE ROW LEVEL SECURITY;

-- Politique de lecture publique
CREATE POLICY "Public can read active gallery items" ON customization_gallery
  FOR SELECT USING (is_active = true);

-- Politique admin pour tout
CREATE POLICY "Admin full access to gallery" ON customization_gallery
  FOR ALL USING (true);

-- Données initiales (optionnel)
INSERT INTO customization_gallery (title, subtitle, image_url, display_order) VALUES
  ('T-shirt Logo', 'Impression numérique', '', 1),
  ('Hoodie Custom', 'Design personnalisé', '', 2),
  ('Casquette Brodée', 'Broderie premium', '', 3),
  ('Survêtement Équipe', 'Uniformes sportifs', '', 4),
  ('T-shirt Bootleg', 'Style vintage', '', 5),
  ('Bonnet Personnalisé', 'Broderie 3D', '', 6);
