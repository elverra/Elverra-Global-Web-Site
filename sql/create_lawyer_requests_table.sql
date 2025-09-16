-- Création de la table pour les demandes d'assistance juridique
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

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_lawyer_requests_status ON lawyer_requests(status);
CREATE INDEX IF NOT EXISTS idx_lawyer_requests_created_at ON lawyer_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_lawyer_requests_case_type ON lawyer_requests(case_type);

-- RLS (Row Level Security) policies
ALTER TABLE lawyer_requests ENABLE ROW LEVEL SECURITY;

-- Policy pour permettre l'insertion publique (pour les demandes)
CREATE POLICY "Allow public insert" ON lawyer_requests
  FOR INSERT WITH CHECK (true);

-- Policy pour permettre la lecture aux admins seulement
CREATE POLICY "Allow admin read" ON lawyer_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('SUPPORT', 'SUPERADMIN')
    )
  );

-- Policy pour permettre la mise à jour aux admins seulement
CREATE POLICY "Allow admin update" ON lawyer_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('SUPPORT', 'SUPERADMIN')
    )
  );

-- Trigger pour mettre à jour automatiquement updated_at
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
