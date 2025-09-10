-- Migration pour ajouter les champs CinetPay à la table users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS cinetpay_auth_token TEXT,
ADD COLUMN IF NOT EXISTS cinetpay_token_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS refresh_token TEXT,
ADD COLUMN IF NOT EXISTS refresh_token_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE;

-- Créer un index sur refresh_token pour les recherches rapides
CREATE INDEX IF NOT EXISTS idx_users_refresh_token ON users(refresh_token) 
WHERE refresh_token IS NOT NULL;

-- Mettre à jour le type payment_attempts pour inclure les métadonnées CinetPay
ALTER TABLE payment_attempts 
ALTER COLUMN metadata TYPE JSONB 
USING COALESCE(metadata, '{}'::jsonb);

-- Ajouter des commentaires pour la documentation
COMMENT ON COLUMN users.cinetpay_auth_token IS 'Token d''authentification CinetPay pour les paiements récurrents';
COMMENT ON COLUMN users.cinetpay_token_expires_at IS 'Date d''expiration du token CinetPay';
COMMENT ON COLUMN users.refresh_token IS 'Refresh token JWT pour renouveler les tokens d''accès';
COMMENT ON COLUMN users.refresh_token_expires_at IS 'Date d''expiration du refresh token';
COMMENT ON COLUMN users.last_login_at IS 'Date de la dernière connexion (utilisé pour invalider les tokens)';
