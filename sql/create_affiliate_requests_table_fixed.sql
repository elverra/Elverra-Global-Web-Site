-- =====================================================
-- AFFILIATE REQUESTS TABLE - CORRECTED VERSION
-- =====================================================
-- This script creates the affiliate_requests table with correct role references

-- Create affiliate_requests table
CREATE TABLE IF NOT EXISTS affiliate_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  business_name VARCHAR(255) NOT NULL,
  business_type VARCHAR(100) NOT NULL,
  business_description TEXT,
  website_url VARCHAR(255),
  contact_person VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(20),
  expected_monthly_sales DECIMAL(12,2),
  marketing_channels TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'under_review')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE affiliate_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own requests
CREATE POLICY "Users can create affiliate requests" ON affiliate_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can view their own requests
CREATE POLICY "Users can view own affiliate requests" ON affiliate_requests
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Support and super admins can view all requests
CREATE POLICY "Admins can read all affiliate requests" ON affiliate_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('SUPPORT', 'SUPERADMIN')
    )
  );

-- Policy: Support and super admins can update requests
CREATE POLICY "Admins can update affiliate requests" ON affiliate_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('SUPPORT', 'SUPERADMIN')
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_affiliate_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER affiliate_requests_updated_at
  BEFORE UPDATE ON affiliate_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_affiliate_requests_updated_at();

-- Add affiliate_status column to users table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'users' 
                 AND column_name = 'affiliate_status') THEN
    ALTER TABLE users ADD COLUMN affiliate_status VARCHAR(20) DEFAULT 'inactive' 
    CHECK (affiliate_status IN ('inactive', 'pending', 'active', 'suspended'));
  END IF;
END $$;

-- Create index on affiliate_status
CREATE INDEX IF NOT EXISTS idx_users_affiliate_status ON users(affiliate_status);

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Affiliate requests table created successfully with correct role references!';
END $$;
