-- =====================================================
-- FIX EVENT_PARTICIPANTS TABLE STRUCTURE
-- =====================================================

-- 1. Create or update the participation status enum
DO $$
BEGIN
    DROP TYPE IF EXISTS participation_status CASCADE;
    CREATE TYPE participation_status AS ENUM ('pending', 'confirmed', 'cancelled', 'waiting_list');
    RAISE NOTICE 'Created participation_status enum';
EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Error creating participation_status: %', SQLERRM;
END $$;

-- 2. Add missing columns if they don't exist
DO $$
BEGIN
    -- Add created_at with default value
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'event_participants' AND column_name = 'created_at') THEN
        ALTER TABLE event_participants ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
        RAISE NOTICE 'Added created_at column';
    END IF;

    -- Add updated_at with default value
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'event_participants' AND column_name = 'updated_at') THEN
        ALTER TABLE event_participants ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
        RAISE NOTICE 'Added updated_at column';
    END IF;

    -- Update existing rows with default timestamps
    UPDATE event_participants 
    SET created_at = COALESCE(created_at, registered_at, NOW()),
        updated_at = COALESCE(updated_at, confirmed_at, registered_at, NOW())
    WHERE created_at IS NULL OR updated_at IS NULL;

    -- Convert status to enum type
    ALTER TABLE event_participants 
    ALTER COLUMN status TYPE participation_status 
    USING (COALESCE(
        NULLIF(status, '')::participation_status, 
        'pending'::participation_status
    ));
    
    -- Add NOT NULL constraints
    ALTER TABLE event_participants 
    ALTER COLUMN event_id SET NOT NULL,
    ALTER COLUMN user_id SET NOT NULL,
    ALTER COLUMN full_name SET NOT NULL,
    ALTER COLUMN email SET NOT NULL,
    ALTER COLUMN status SET DEFAULT 'pending'::participation_status;

    -- Add unique constraint
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'event_participants_event_id_user_id_key') THEN
        ALTER TABLE event_participants 
        ADD CONSTRAINT event_participants_event_id_user_id_key 
        UNIQUE (event_id, user_id);
    END IF;

    RAISE NOTICE 'Table structure updated successfully';
EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Error updating table structure: %', SQLERRM;
END $$;

-- 3. Create function to update timestamps
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Create trigger for automatic timestamp updates
DO $$
BEGIN
    DROP TRIGGER IF EXISTS update_event_participants_modtime ON event_participants;
    CREATE TRIGGER update_event_participants_modtime
    BEFORE UPDATE ON event_participants
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();
    RAISE NOTICE 'Created update timestamp trigger';
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Could not create trigger: %', SQLERRM;
END $$;
