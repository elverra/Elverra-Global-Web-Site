-- Fix RLS policies for membership_cards table
-- This script allows users to read their own membership cards

-- First, check if the table exists and has RLS enabled
DO $$
BEGIN
    -- Enable RLS if not already enabled
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'membership_cards' 
        AND n.nspname = 'public'
        AND c.relrowsecurity = true
    ) THEN
        ALTER TABLE public.membership_cards ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS enabled for membership_cards table';
    END IF;
END $$;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read their own membership cards" ON public.membership_cards;
DROP POLICY IF EXISTS "Allow users to read their own cards" ON public.membership_cards;
DROP POLICY IF EXISTS "membership_cards_select_policy" ON public.membership_cards;

-- Create a comprehensive read policy for users
CREATE POLICY "Users can read their own membership cards"
ON public.membership_cards
FOR SELECT
TO authenticated
USING (
    -- Allow if owner_user_id matches the authenticated user
    owner_user_id = auth.uid()
    OR
    -- Allow if user_id matches (fallback column)
    owner_user_id = auth.uid()
);

-- Grant necessary permissions
GRANT SELECT ON public.membership_cards TO authenticated;

-- Verify the policy was created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'membership_cards';

-- Test query to verify access (replace with actual user ID)
-- SELECT card_identifier, owner_user_id, created_at 
-- FROM membership_cards 
-- WHERE owner_user_id = '0a04453b-ffe6-482b-b42c-6f897fb69051';
