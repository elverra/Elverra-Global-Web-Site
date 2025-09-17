-- Update profiles table to add image fields and email column
-- Add profile image and identity card image columns
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS profile_image_url TEXT,
ADD COLUMN IF NOT EXISTS identity_card_image_url TEXT;

-- Add email column to profiles table (optional field, separate from auth.users)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

-- Add card identifier column with unique constraint
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS card_identifier VARCHAR(20) UNIQUE;

-- Create index for card identifier for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_card_identifier ON profiles(card_identifier);

-- Update existing profiles to generate card identifiers (run this after implementing the generation function)
-- This will be handled in the application code to ensure proper format

-- Add affiliate code column to replace email-based codes
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS affiliate_code VARCHAR(12) UNIQUE;

-- Create index for affiliate code
CREATE INDEX IF NOT EXISTS idx_profiles_affiliate_code ON profiles(affiliate_code);

-- Add comment to document the card identifier format
COMMENT ON COLUMN profiles.card_identifier IS 'Format: ML25-XXXXXXXXX-01 where ML=country, 25=year, XXXXXXXXX=unique chars, 01=country number';
COMMENT ON COLUMN profiles.affiliate_code IS 'Unique 8-12 character affiliate referral code replacing email-based codes';
COMMENT ON COLUMN profiles.email IS 'Optional email field in profiles table, separate from auth.users email for authentication';
