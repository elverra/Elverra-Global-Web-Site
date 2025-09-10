-- Add last_rescue_claim_date column to secours_subscriptions table
ALTER TABLE "secours_subscriptions" 
ADD COLUMN IF NOT EXISTS "last_rescue_claim_date" timestamp;
