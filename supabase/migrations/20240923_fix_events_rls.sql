-- Enable RLS on events table if not already enabled
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable public read access" ON events;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON events;
DROP POLICY IF EXISTS "Enable all access for admins" ON events;

-- Public read access for active events
CREATE POLICY "Enable public read access" 
ON events 
FOR SELECT 
TO public 
USING (is_active = true);

-- Authenticated users can read all events (including inactive ones)
CREATE POLICY "Enable read access for authenticated users" 
ON events 
FOR SELECT 
TO authenticated 
USING (true);

-- Admins have full access
CREATE POLICY "Enable all access for admins" 
ON events 
FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role IN ('ADMIN', 'SUPERADMIN')
  )
) 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role IN ('ADMIN', 'SUPERADMIN')
  )
);

-- Create a function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role IN ('ADMIN', 'SUPERADMIN')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT SELECT ON events TO anon, authenticated;
GRANT ALL ON events TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE events IS 'Stores information about events';
COMMENT ON COLUMN events.is_active IS 'Whether the event is visible to the public';
COMMENT ON COLUMN events.created_by IS 'User ID of the event creator';

-- Create an index on the is_active column for better performance
CREATE INDEX IF NOT EXISTS idx_events_is_active ON events(is_active);
