-- Table pour stocker l'historique des campagnes email
CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  audience TEXT NOT NULL CHECK (audience IN ('newsletter', 'customers', 'all')),
  sent_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'sent' CHECK (status IN ('draft', 'sending', 'sent', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_email_campaigns_created_at ON email_campaigns(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_audience ON email_campaigns(audience);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON email_campaigns(status);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_email_campaigns_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_email_campaigns_updated_at
  BEFORE UPDATE ON email_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_email_campaigns_updated_at();

-- Activer RLS (Row Level Security)
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre toutes les opérations (à adapter selon vos besoins)
CREATE POLICY "Enable all operations for email_campaigns" ON email_campaigns
  FOR ALL
  USING (true)
  WITH CHECK (true);
