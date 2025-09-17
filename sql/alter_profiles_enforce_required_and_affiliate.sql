-- Enforce required fields and affiliate code format on profiles

-- 1) Ensure columns exist
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS profile_image_url TEXT,
  ADD COLUMN IF NOT EXISTS identity_card_image_url TEXT,
  ADD COLUMN IF NOT EXISTS affiliate_code VARCHAR(24) UNIQUE,
  ADD COLUMN IF NOT EXISTS referrer_affiliate_code VARCHAR(24);

-- 2) Remove email column from profiles (no longer stored here)
ALTER TABLE profiles DROP COLUMN IF EXISTS email;

-- 3) Backfill placeholders for existing NULL images to allow NOT NULL constraint
UPDATE profiles SET profile_image_url = COALESCE(profile_image_url, 'pending://upload');
UPDATE profiles SET identity_card_image_url = COALESCE(identity_card_image_url, 'pending://upload');

-- 4) Make images required going forward
ALTER TABLE profiles 
  ALTER COLUMN profile_image_url SET DEFAULT 'pending://upload',
  ALTER COLUMN identity_card_image_url SET DEFAULT 'pending://upload',
  ALTER COLUMN profile_image_url SET NOT NULL,
  ALTER COLUMN identity_card_image_url SET NOT NULL;

-- 5) Enforce affiliate code format: ELV-XXXXXXXXXXXX (12 uppercase alnum)
-- Drop existing constraint if any
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_affiliate_code_format_check'
  ) THEN
    ALTER TABLE profiles DROP CONSTRAINT profiles_affiliate_code_format_check;
  END IF;
END$$;

ALTER TABLE profiles 
  ADD CONSTRAINT profiles_affiliate_code_format_check 
  CHECK (affiliate_code IS NULL OR affiliate_code ~ '^ELV-[A-Z0-9]{12}$');

-- 6) Index referrer_affiliate_code for quick lookup of referrer profile
CREATE INDEX IF NOT EXISTS idx_profiles_referrer_affiliate_code ON profiles(referrer_affiliate_code);
