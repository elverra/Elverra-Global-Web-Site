-- Remove card_identifier from profiles table since it should only exist in membership_cards
-- The card_identifier will be generated in membership_cards table when a membership is purchased

-- Drop the index first
DROP INDEX IF EXISTS idx_profiles_card_identifier;

-- Remove the card_identifier column from profiles table
ALTER TABLE profiles DROP COLUMN IF EXISTS card_identifier;

-- Add comment to document that card_identifier is now only in membership_cards
COMMENT ON TABLE profiles IS 'User profiles table. card_identifier is managed in membership_cards table only.';
