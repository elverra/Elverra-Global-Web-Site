-- SOLUTION RAPIDE: Créer la table lawyer_requests et désactiver RLS
-- Exécutez ce script complet dans Supabase SQL Editor

-- Étape 1: Créer la table
CREATE TABLE IF NOT EXISTS lawyer_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20) NOT NULL,
  case_type VARCHAR(100),
  message TEXT,
  audio_url TEXT,
  request_type VARCHAR(10) CHECK (request_type IN ('form', 'voice')) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'in_progress', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notification_sent_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Étape 2: Désactiver RLS immédiatement
ALTER TABLE lawyer_requests DISABLE ROW LEVEL SECURITY;

-- Étape 3: Ajouter les index pour les performances
CREATE INDEX IF NOT EXISTS idx_lawyer_requests_status ON lawyer_requests(status);
CREATE INDEX IF NOT EXISTS idx_lawyer_requests_created_at ON lawyer_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_lawyer_requests_case_type ON lawyer_requests(case_type);

-- Étape 4: Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_lawyer_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_lawyer_requests_updated_at
  BEFORE UPDATE ON lawyer_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_lawyer_requests_updated_at();

-- Confirmation
SELECT 'Table lawyer_requests créée avec succès!' as message;
