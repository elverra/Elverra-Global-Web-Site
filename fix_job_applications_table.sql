-- Fix elverra_job_applications table by adding missing columns and proper structure
-- This script will create the table if it doesn't exist or add missing columns

-- First, let's create the table with all necessary columns
CREATE TABLE IF NOT EXISTS elverra_job_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES elverra_jobs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  resume_url TEXT,
  portfolio_url TEXT,
  cover_letter TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns if they don't exist (for existing table)
DO $$ 
BEGIN
  -- Add created_at column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'elverra_job_applications' AND column_name = 'created_at') THEN
    ALTER TABLE elverra_job_applications ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
  
  -- Add updated_at column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'elverra_job_applications' AND column_name = 'updated_at') THEN
    ALTER TABLE elverra_job_applications ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
  
  -- Add status column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'elverra_job_applications' AND column_name = 'status') THEN
    ALTER TABLE elverra_job_applications ADD COLUMN status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected'));
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON elverra_job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_user_id ON elverra_job_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON elverra_job_applications(status);
CREATE INDEX IF NOT EXISTS idx_job_applications_created_at ON elverra_job_applications(created_at);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_job_applications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_job_applications_updated_at ON elverra_job_applications;
CREATE TRIGGER trigger_update_job_applications_updated_at
  BEFORE UPDATE ON elverra_job_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_job_applications_updated_at();

-- Create trigger to update job application count
CREATE OR REPLACE FUNCTION update_job_application_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE elverra_jobs 
    SET applications_count = COALESCE(applications_count, 0) + 1
    WHERE id = NEW.job_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE elverra_jobs 
    SET applications_count = GREATEST(COALESCE(applications_count, 1) - 1, 0)
    WHERE id = OLD.job_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_job_application_count ON elverra_job_applications;
CREATE TRIGGER trigger_update_job_application_count
  AFTER INSERT OR DELETE ON elverra_job_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_job_application_count();

-- Set up RLS policies
ALTER TABLE elverra_job_applications ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to view their own applications
DROP POLICY IF EXISTS "Users can view their own job applications" ON elverra_job_applications;
CREATE POLICY "Users can view their own job applications"
  ON elverra_job_applications FOR SELECT
  USING (auth.uid() = user_id);

-- Policy for authenticated users to create applications
DROP POLICY IF EXISTS "Users can create job applications" ON elverra_job_applications;
CREATE POLICY "Users can create job applications"
  ON elverra_job_applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy for admins and superadmins to view all applications
DROP POLICY IF EXISTS "Admins can view all job applications" ON elverra_job_applications;
CREATE POLICY "Admins can view all job applications"
  ON elverra_job_applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role IN ('SUPPORT', 'SUPERADMIN')
    )
  );

-- Policy for admins and superadmins to update applications
DROP POLICY IF EXISTS "Admins can update job applications" ON elverra_job_applications;
CREATE POLICY "Admins can update job applications"
  ON elverra_job_applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role IN ('SUPPORT', 'SUPERADMIN')
    )
  );

-- Policy for admins and superadmins to delete applications
DROP POLICY IF EXISTS "Admins can delete job applications" ON elverra_job_applications;
CREATE POLICY "Admins can delete job applications"
  ON elverra_job_applications FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role IN ('SUPPORT', 'SUPERADMIN')
    )
  );
