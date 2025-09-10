-- Migration: Create Ô Secours tables
-- Created: 2025-01-08

-- Create secours_subscriptions table
CREATE TABLE IF NOT EXISTS "secours_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"subscription_type" text NOT NULL,
	"token_balance" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"subscription_date" timestamp DEFAULT now(),
	"last_token_purchase_date" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Create secours_transactions table
CREATE TABLE IF NOT EXISTS "secours_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subscription_id" uuid NOT NULL,
	"transaction_type" text NOT NULL,
	"token_amount" integer NOT NULL,
	"token_value_fcfa" numeric(10,2) NOT NULL,
	"payment_method" text,
	"transaction_reference" text,
	"status" text DEFAULT 'pending',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Create secours_rescue_requests table
CREATE TABLE IF NOT EXISTS "secours_rescue_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subscription_id" uuid NOT NULL,
	"request_description" text NOT NULL,
	"rescue_value_fcfa" numeric(10,2) NOT NULL,
	"status" text DEFAULT 'pending',
	"request_date" timestamp DEFAULT now(),
	"processed_date" timestamp,
	"admin_notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Add foreign key constraints
DO $$ BEGIN
 ALTER TABLE "secours_subscriptions" ADD CONSTRAINT "secours_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "secours_transactions" ADD CONSTRAINT "secours_transactions_subscription_id_secours_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "secours_subscriptions"("id") ON DELETE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "secours_rescue_requests" ADD CONSTRAINT "secours_rescue_requests_subscription_id_secours_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "secours_subscriptions"("id") ON DELETE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_secours_subscriptions_user_id" ON "secours_subscriptions" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_secours_subscriptions_type" ON "secours_subscriptions" ("subscription_type");
CREATE INDEX IF NOT EXISTS "idx_secours_transactions_subscription_id" ON "secours_transactions" ("subscription_id");
CREATE INDEX IF NOT EXISTS "idx_secours_transactions_type" ON "secours_transactions" ("transaction_type");
CREATE INDEX IF NOT EXISTS "idx_secours_rescue_requests_subscription_id" ON "secours_rescue_requests" ("subscription_id");
CREATE INDEX IF NOT EXISTS "idx_secours_rescue_requests_status" ON "secours_rescue_requests" ("status");

-- Create trigger to update token balance automatically
CREATE OR REPLACE FUNCTION update_token_balance()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.transaction_type = 'purchase' AND NEW.status = 'completed' THEN
        UPDATE secours_subscriptions 
        SET token_balance = token_balance + NEW.token_amount,
            last_token_purchase_date = NOW(),
            updated_at = NOW()
        WHERE id = NEW.subscription_id;
    ELSIF NEW.transaction_type = 'usage' AND NEW.status = 'completed' THEN
        UPDATE secours_subscriptions 
        SET token_balance = GREATEST(0, token_balance - NEW.token_amount),
            updated_at = NOW()
        WHERE id = NEW.subscription_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_token_balance ON secours_transactions;
CREATE TRIGGER trigger_update_token_balance
    AFTER INSERT OR UPDATE ON secours_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_token_balance();

-- Insert sample data for testing
INSERT INTO secours_subscriptions (user_id, subscription_type, token_balance, is_active) 
SELECT 
    (SELECT id FROM users LIMIT 1),
    'auto',
    45,
    true
WHERE EXISTS (SELECT 1 FROM users LIMIT 1);

INSERT INTO secours_subscriptions (user_id, subscription_type, token_balance, is_active) 
SELECT 
    (SELECT id FROM users LIMIT 1),
    'motors',
    25,
    true
WHERE EXISTS (SELECT 1 FROM users LIMIT 1);
