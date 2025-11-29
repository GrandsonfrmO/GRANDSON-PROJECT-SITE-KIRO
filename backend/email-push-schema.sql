-- Table pour les abonnés aux notifications via email
CREATE TABLE IF NOT EXISTS email_push_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  customer_name VARCHAR(255),
  phone VARCHAR(50),
  subscribed BOOLEAN DEFAULT true,
  last_order_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour recherche rapide par email
CREATE INDEX IF NOT EXISTS idx_email_push_subscribers_email ON email_push_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_email_push_subscribers_subscribed ON email_push_subscribers(subscribed);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_email_push_subscribers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS email_push_subscribers_updated_at ON email_push_subscribers;
CREATE TRIGGER email_push_subscribers_updated_at
  BEFORE UPDATE ON email_push_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION update_email_push_subscribers_updated_at();

-- Activer RLS (Row Level Security)
ALTER TABLE email_push_subscribers ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre l'insertion depuis l'API
CREATE POLICY "Permettre insertion email_push_subscribers"
  ON email_push_subscribers
  FOR INSERT
  WITH CHECK (true);

-- Politique pour permettre la lecture depuis l'API
CREATE POLICY "Permettre lecture email_push_subscribers"
  ON email_push_subscribers
  FOR SELECT
  USING (true);

-- Politique pour permettre la mise à jour
CREATE POLICY "Permettre mise à jour email_push_subscribers"
  ON email_push_subscribers
  FOR UPDATE
  USING (true);
