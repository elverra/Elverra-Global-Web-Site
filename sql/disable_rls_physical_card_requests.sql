-- Temporarily disable RLS for physical_card_requests table to allow admin access

-- Disable RLS completely for now
ALTER TABLE physical_card_requests DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'physical_card_requests';

-- Add a comment explaining this is temporary
COMMENT ON TABLE physical_card_requests IS 'RLS temporarily disabled for admin access - should be re-enabled with proper service role policies';

SELECT 'RLS disabled for physical_card_requests table' as result;
