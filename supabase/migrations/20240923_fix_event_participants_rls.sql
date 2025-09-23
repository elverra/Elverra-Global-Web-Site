-- =====================================================
-- FIX EVENT PARTICIPANTS RLS POLICIES
-- =====================================================

-- 1. Drop all existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can create their own participation" ON event_participants;
DROP POLICY IF EXISTS "Users can update their own participation" ON event_participants;
DROP POLICY IF EXISTS "Admins have full access to event_participants" ON event_participants;
DROP POLICY IF EXISTS "Event creators can view their event participants" ON event_participants;

-- 2. Create policy to allow users to insert their own participation
CREATE POLICY "Users can create their own participation" 
ON event_participants 
FOR INSERT 
TO authenticated 
WITH CHECK (
  auth.uid() = user_id
);

-- 3. Allow users to update their own participation
CREATE POLICY "Users can update their own participation"
ON event_participants
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. Create a function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role IN ('ADMIN', 'SUPERADMIN')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Allow admins full access to event_participants
CREATE POLICY "Admins have full access to event_participants"
ON event_participants
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- 6. Create a function to check if user is event creator
CREATE OR REPLACE FUNCTION public.is_event_creator(event_id_param UUID)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM events 
    WHERE id = event_id_param 
    AND created_by = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Drop existing policy if it exists
DROP POLICY IF EXISTS "Event creators and admins can view event participants" ON event_participants;

-- 8. Create new policy to allow event creators and admins to view all participants of events
CREATE POLICY "Event creators and admins can view event participants"
ON event_participants
FOR SELECT
TO authenticated
USING (
  is_event_creator(event_id) OR
  is_admin()
);

-- 9. Add more detailed logging for debugging RLS
CREATE OR REPLACE FUNCTION public.log_rls_check()
RETURNS trigger AS $$
BEGIN
  RAISE NOTICE 'RLS Check - User: %, Table: %, Operation: %', 
    auth.uid(), 
    TG_TABLE_NAME, 
    TG_OP;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Create a trigger for RLS debugging (optional, can be removed in production)
DROP TRIGGER IF EXISTS log_event_participants_access ON event_participants;
CREATE TRIGGER log_event_participants_access
  AFTER INSERT OR UPDATE OR DELETE ON event_participants
  FOR EACH STATEMENT
  EXECUTE FUNCTION log_rls_check();

-- Note: Les déclencheurs AFTER SELECT ne sont pas supportés en standard par PostgreSQL
