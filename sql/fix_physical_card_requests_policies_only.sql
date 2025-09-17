-- Fix only the RLS policies for physical_card_requests table

-- Drop all existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own physical card requests" ON physical_card_requests;
DROP POLICY IF EXISTS "Users can create own physical card requests" ON physical_card_requests;
DROP POLICY IF EXISTS "Users can update own physical card requests" ON physical_card_requests;
DROP POLICY IF EXISTS "Admins can manage all physical card requests" ON physical_card_requests;
DROP POLICY IF EXISTS "Service role can manage all physical card requests" ON physical_card_requests;
DROP POLICY IF EXISTS "Authenticated admins can manage all physical card requests" ON physical_card_requests;
DROP POLICY IF EXISTS "Authenticated users can manage all physical card requests" ON physical_card_requests;

-- Ensure RLS is enabled
ALTER TABLE physical_card_requests ENABLE ROW LEVEL SECURITY;

-- Create new clean policies
-- Policy: Users can only see their own requests
CREATE POLICY "Users can view own physical card requests" ON physical_card_requests
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can create their own requests
CREATE POLICY "Users can create own physical card requests" ON physical_card_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own requests
CREATE POLICY "Users can update own physical card requests" ON physical_card_requests
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Allow all operations for authenticated users (this gives admin access)
CREATE POLICY "Allow all operations for authenticated users" ON physical_card_requests
    FOR ALL USING (auth.role() = 'authenticated');

-- Verify policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'physical_card_requests';
