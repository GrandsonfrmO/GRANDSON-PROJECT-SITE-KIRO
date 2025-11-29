-- Table pour les abonnements push
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_email 
ON push_subscriptions(user_email);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_created_at 
ON push_subscriptions(created_at DESC);

-- Table pour les paramètres de notifications automatiques
CREATE TABLE IF NOT EXISTS notification_settings (
  id TEXT PRIMARY KEY,
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insérer les paramètres par défaut
INSERT INTO notification_settings (id, settings)
VALUES ('auto_notifications', '{
  "newOrders": true,
  "lowStock": true,
  "promotions": false
}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Table pour l'historique des notifications
CREATE TABLE IF NOT EXISTS notification_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL,
  audience TEXT DEFAULT 'all',
  sent_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_notification_history_created_at 
ON notification_history(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notification_history_type 
ON notification_history(type);

-- Fonction pour nettoyer l'historique ancien (> 30 jours)
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS void AS $$
BEGIN
  DELETE FROM notification_history
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Commentaires
COMMENT ON TABLE notification_settings IS 'Paramètres des notifications automatiques';
COMMENT ON TABLE notification_history IS 'Historique des notifications envoyées';
