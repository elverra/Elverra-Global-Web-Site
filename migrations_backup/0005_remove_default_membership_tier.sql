-- Migration: Remove default membership tier for new users
-- This ensures users don't get automatic access without purchasing a card

-- Remove the default value from membership_tier column
ALTER TABLE "users" ALTER COLUMN "membership_tier" DROP DEFAULT;

-- Set existing users with 'essential' tier to NULL if they don't have an active subscription
-- This is to ensure consistency - users should only have a tier if they've actually paid for it
UPDATE "users" 
SET "membership_tier" = NULL 
WHERE "membership_tier" = 'essential' 
AND "id" NOT IN (
    SELECT DISTINCT "user_id" 
    FROM "subscriptions" 
    WHERE "status" = 'active' 
    AND ("end_date" IS NULL OR "end_date" > NOW())
);

-- Add a comment to document the change
COMMENT ON COLUMN "users"."membership_tier" IS 'Membership tier assigned only after successful payment - no default value';
