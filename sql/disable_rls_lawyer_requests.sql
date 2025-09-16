-- Quick fix: Disable RLS for lawyer_requests table
-- This will allow immediate insertion while we fix the policies properly

ALTER TABLE lawyer_requests DISABLE ROW LEVEL SECURITY;

-- Optional: Re-enable later with proper policies
-- ALTER TABLE lawyer_requests ENABLE ROW LEVEL SECURITY;
