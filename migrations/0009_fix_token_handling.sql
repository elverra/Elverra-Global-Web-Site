-- Ensure the refresh token columns exist and are properly indexed
ALTER TABLE users 
    ALTER COLUMN refresh_token TYPE TEXT,
    ALTER COLUMN refresh_token_expires_at TYPE TIMESTAMP WITH TIME ZONE,
    ALTER COLUMN cinetpay_auth_token TYPE TEXT,
    ALTER COLUMN cinetpay_token_expires_at TYPE TIMESTAMP WITH TIME ZONE;

-- Recreate the index with proper conditions
DROP INDEX IF EXISTS idx_users_refresh_token;
CREATE INDEX IF NOT EXISTS idx_users_refresh_token ON users(refresh_token) 
WHERE refresh_token IS NOT NULL;

-- Add index for CinetPay auth token
CREATE INDEX IF NOT EXISTS idx_users_cinetpay_token ON users(cinetpay_auth_token) 
WHERE cinetpay_auth_token IS NOT NULL;
