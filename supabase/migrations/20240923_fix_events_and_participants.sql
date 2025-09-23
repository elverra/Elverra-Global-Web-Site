-- =====================================================
-- FIX EVENTS AND PARTICIPANTS TABLES
-- =====================================================

-- 1. Create the increment_views function
CREATE OR REPLACE FUNCTION public.increment_views(event_id_param UUID)
RETURNS void AS $$
BEGIN
  UPDATE events 
  SET views = COALESCE(views, 0) + 1,
      updated_at = NOW()
  WHERE id = event_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create event_participants table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.event_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  motivation TEXT,
  additional_info TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'waiting_list')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- 3. Enable RLS on event_participants
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for event_participants
-- Public can view approved participants
CREATE POLICY "Public can view approved participants" 
ON event_participants 
FOR SELECT 
TO public 
USING (status = 'approved');

-- Authenticated users can view their own participation
CREATE POLICY "Users can view their own participation" 
ON event_participants 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Users can create their own participation
CREATE POLICY "Users can create their own participation" 
ON event_participants 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own participation
CREATE POLICY "Users can update their own participation" 
ON event_participants 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Admins have full access to all participants
CREATE POLICY "Admins have full access to participants" 
ON event_participants 
FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role IN ('ADMIN', 'SUPERADMIN')
  )
);

-- 5. Add a trigger to update participant_count in events
CREATE OR REPLACE FUNCTION update_participant_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE events
    SET participant_count = (
      SELECT COUNT(*) 
      FROM event_participants 
      WHERE event_id = NEW.event_id 
      AND status = 'approved'
    )
    WHERE id = NEW.event_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE events
    SET participant_count = (
      SELECT COUNT(*) 
      FROM event_participants 
      WHERE event_id = OLD.event_id 
      AND status = 'approved'
    )
    WHERE id = OLD.event_id;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 6. Create the trigger
DROP TRIGGER IF EXISTS update_participant_count_trigger ON event_participants;
CREATE TRIGGER update_participant_count_trigger
AFTER INSERT OR UPDATE OF status OR DELETE ON event_participants
FOR EACH ROW EXECUTE FUNCTION update_participant_count();

-- 7. Update events table if needed
DO $$
BEGIN
  -- Add participant_count column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'events' AND column_name = 'participant_count') THEN
    ALTER TABLE events ADD COLUMN participant_count INTEGER DEFAULT 0;
  END IF;
  
  -- Add created_by column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'events' AND column_name = 'created_by') THEN
    ALTER TABLE events ADD COLUMN created_by UUID REFERENCES auth.users(id);
  END IF;
END $$;

-- 8. Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.increment_views(UUID) TO anon, authenticated;
GRANT ALL ON event_participants TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE event_participants_id_seq TO authenticated;

-- 9. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_event_participants_event_id ON event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_user_id ON event_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_status ON event_participants(status);

-- 10. Add comments for documentation
COMMENT ON TABLE event_participants IS 'Stores event participation information';
COMMENT ON COLUMN event_participants.status IS 'Status of the participation: pending, approved, rejected, or waiting_list';
COMMENT ON FUNCTION public.increment_views(UUID) IS 'Increments the view count for an event';

-- 11. Update the events table to set default values for new columns if they're null
UPDATE events SET 
  participant_count = COALESCE(participant_count, 0),
  views = COALESCE(views, 0);

-- 12. Create a function to check if user is event creator
CREATE OR REPLACE FUNCTION is_event_creator(event_id_param UUID)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM events 
    WHERE id = event_id_param 
    AND created_by = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. Update RLS policies on events table to allow creators to update their own events
CREATE POLICY "Creators can update their own events" 
ON events 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

-- 14. Create a function to check if user is event participant
CREATE OR REPLACE FUNCTION is_event_participant(event_id_param UUID)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM event_participants 
    WHERE event_id = event_id_param 
    AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
