-- =====================================================
-- FIX MISSING COLUMNS AND ENUM ISSUES
-- =====================================================

-- 1. First, let's check the current structure of event_participants
DO $$
BEGIN
    -- Add created_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'event_participants' 
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE event_participants 
        ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
        
        RAISE NOTICE 'Added created_at column to event_participants';
    END IF;

    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'event_participations' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE event_participants 
        ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
        
        RAISE NOTICE 'Added updated_at column to event_participants';
    END IF;
END $$;

-- 2. Create the user_role type if it doesn't exist
DO $$
BEGIN
    -- Drop the type if it exists to avoid conflicts
    DROP TYPE IF EXISTS user_role CASCADE;
    
    -- Create the type with the correct values
    CREATE TYPE user_role AS ENUM ('USER', 'ADMIN', 'SUPERADMIN');
    
    RAISE NOTICE 'Created user_role enum type';
EXCEPTION WHEN others THEN
    RAISE NOTICE 'Error creating user_role type: %', SQLERRM;
END $$;

-- 3. Create or replace the user_roles table with the correct type
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'USER'::user_role,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- 4. Add RLS to user_roles
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- 5. Create or replace the is_admin function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('ADMIN'::user_role, 'SUPERADMIN'::user_role)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create a function to safely add admin role to a user
CREATE OR REPLACE FUNCTION public.make_user_admin(user_email text)
RETURNS void AS $$
DECLARE
    user_id uuid;
BEGIN
    -- Get the user ID from the email
    SELECT id INTO user_id 
    FROM auth.users 
    WHERE email = user_email
    LIMIT 1;
    
    IF user_id IS NULL THEN
        RAISE EXCEPTION 'User with email % not found', user_email;
    END IF;
    
    -- Delete any existing roles to avoid duplicates
    DELETE FROM user_roles WHERE user_id = user_id;
    
    -- Add the admin role
    INSERT INTO user_roles (user_id, role)
    VALUES (user_id, 'ADMIN'::user_role);
    
    RAISE NOTICE 'User % has been granted ADMIN role', user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create a function to get the current user's role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role AS $$
DECLARE
    user_role user_role;
BEGIN
    SELECT role INTO user_role
    FROM user_roles
    WHERE user_id = auth.uid()
    ORDER BY 
        CASE role 
            WHEN 'SUPERADMIN' THEN 1
            WHEN 'ADMIN' THEN 2
            ELSE 3
        END
    LIMIT 1;
    
    RETURN COALESCE(user_role, 'USER'::user_role);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
