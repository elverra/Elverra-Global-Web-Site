-- Add auth tokens columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS refresh_token TEXT,
ADD COLUMN IF NOT EXISTS refresh_token_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_login_ip TEXT,
ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS cinetpay_auth_token TEXT,
ADD COLUMN IF NOT EXISTS cinetpay_token_expires_at TIMESTAMP WITH TIME ZONE;

-- Create index for refresh token lookup
CREATE INDEX IF NOT EXISTS idx_users_refresh_token ON users(refresh_token) WHERE refresh_token IS NOT NULL;

-- Create index for CinetPay token lookup
CREATE INDEX IF NOT EXISTS idx_users_cinetpay_token ON users(cinetpay_auth_token) WHERE cinetpay_auth_token IS NOT NULL;
