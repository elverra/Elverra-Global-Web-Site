-- Create referrals table and affiliate_profiles view to support affiliate commissions

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) Referrals table - drop and recreate to ensure clean structure
DROP TABLE IF EXISTS referrals CASCADE;

CREATE TABLE referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_user_id uuid NOT NULL,
  referred_user_id uuid NOT NULL,
  reward_type VARCHAR(32) DEFAULT 'membership_payment',
  status VARCHAR(16) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','cancelled')),
  commission_earned NUMERIC(12,2) NOT NULL DEFAULT 0,
  payment_reference TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON referrals(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);

-- 2) RLS policies
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "referrer_can_select" ON referrals;
DROP POLICY IF EXISTS "referred_can_select" ON referrals;

-- Referrer can SELECT their earned referrals
CREATE POLICY "referrer_can_select" ON referrals
  FOR SELECT USING (auth.uid() = referrer_user_id);

-- Referred user may view their own row
CREATE POLICY "referred_can_select" ON referrals
  FOR SELECT USING (auth.uid() = referred_user_id);

-- Service role can manage everything (handled by service key, no explicit policy needed)

-- 3) affiliate_profiles view backed by profiles
DROP VIEW IF EXISTS affiliate_profiles;
CREATE VIEW affiliate_profiles AS
SELECT 
  p.id AS user_id,
  p.affiliate_code AS referral_code,
  10::int AS referral_target,
  0::int AS credit_points
FROM profiles p;

-- 4) Commission calculation function (SECURITY DEFINER) to be called from server
CREATE OR REPLACE FUNCTION award_affiliate_commission(
  paying_user uuid,
  amount_xof numeric,
  payment_ref text,
  reward varchar DEFAULT 'membership_payment'
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  ref_code text;
  referrer_user uuid;
  rate numeric := COALESCE(NULLIF(current_setting('app.affiliate_rate', true), ''), '0.10')::numeric; -- default 10%
  commission numeric;
BEGIN
  -- Find the referrer affiliate code for the paying user
  SELECT referrer_affiliate_code INTO ref_code FROM profiles WHERE id = paying_user;
  IF ref_code IS NULL OR ref_code = '' THEN
    RETURN; -- no referrer
  END IF;

  -- Resolve referrer user id
  SELECT id INTO referrer_user FROM profiles WHERE affiliate_code = ref_code;
  IF referrer_user IS NULL THEN
    RETURN; -- invalid code
  END IF;

  -- Compute commission
  commission := ROUND(amount_xof * rate);
  IF commission <= 0 THEN
    RETURN;
  END IF;

  -- Insert referral record as active
  INSERT INTO referrals (
    referrer_user_id,
    referred_user_id,
    reward_type,
    status,
    commission_earned,
    payment_reference
  ) VALUES (
    referrer_user,
    paying_user,
    reward,
    'active',
    commission,
    payment_ref
  );
END;
$$;
