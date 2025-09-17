-- Alter physical_card_requests: remove email and card_identifier, enforce affiliate_code, ensure payment_status

-- 1) Drop columns no longer needed
ALTER TABLE physical_card_requests DROP COLUMN IF EXISTS email;
ALTER TABLE physical_card_requests DROP COLUMN IF EXISTS card_identifier;

-- 2) Add affiliate_code column (referrer's code) and enforce format ELV-XXXXXXXXXXXX
ALTER TABLE physical_card_requests ADD COLUMN IF NOT EXISTS affiliate_code VARCHAR(24);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'physical_card_requests_affiliate_code_format_check'
  ) THEN
    ALTER TABLE physical_card_requests DROP CONSTRAINT physical_card_requests_affiliate_code_format_check;
  END IF;
END$$;

ALTER TABLE physical_card_requests
  ADD CONSTRAINT physical_card_requests_affiliate_code_format_check
  CHECK (affiliate_code IS NULL OR affiliate_code ~ '^ELV-[A-Z0-9]{12}$');

CREATE INDEX IF NOT EXISTS idx_physical_card_requests_affiliate_code ON physical_card_requests(affiliate_code);

-- 3) Ensure payment_status column exists
ALTER TABLE physical_card_requests 
  ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending','completed','failed'));
