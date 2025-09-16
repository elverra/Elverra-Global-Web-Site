-- Create affiliate_requests table for managing affiliate applications
CREATE TABLE IF NOT EXISTS affiliate_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  neighborhood VARCHAR(200) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_affiliate_requests_user_id ON affiliate_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_requests_status ON affiliate_requests(status);
CREATE INDEX IF NOT EXISTS idx_affiliate_requests_created_at ON affiliate_requests(created_at);

-- Enable RLS
ALTER TABLE affiliate_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own requests
CREATE POLICY "Users can create affiliate requests" ON affiliate_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can view their own requests
CREATE POLICY "Users can view own affiliate requests" ON affiliate_requests
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Admins and super admins can view all requests
CREATE POLICY "Admins can read all affiliate requests" ON affiliate_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('SUPPORT', 'SUPERADMIN')
    )
  );

-- Policy: Admins and super admins can update requests
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

-- Add affiliate_status column to profiles table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'profiles' 
                 AND column_name = 'affiliate_status') THEN
    ALTER TABLE profiles ADD COLUMN affiliate_status VARCHAR(20) DEFAULT 'inactive' 
    CHECK (affiliate_status IN ('inactive', 'pending', 'active', 'suspended'));
  END IF;
END $$;

-- Create index on affiliate_status
CREATE INDEX IF NOT EXISTS idx_profiles_affiliate_status ON profiles(affiliate_status);
