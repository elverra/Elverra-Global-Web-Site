-- Enable RLS on profiles table
alter table public.profiles enable row level security;

-- Drop all existing policies in a simpler way
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Drop all policies on profiles
    FOR policy_record IN SELECT policyname, tablename FROM pg_policies 
                        WHERE schemaname = 'public' AND tablename = 'profiles'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 
                      policy_record.policyname, policy_record.tablename);
    END LOOP;
    
    -- Drop all policies on subscriptions
    FOR policy_record IN SELECT policyname, tablename FROM pg_policies 
                        WHERE schemaname = 'public' AND tablename = 'subscriptions'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 
                      policy_record.policyname, policy_record.tablename);
    END LOOP;
    
    -- Drop all policies on membership_cards if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' AND table_name = 'membership_cards') THEN
        FOR policy_record IN SELECT policyname, tablename FROM pg_policies 
                           WHERE schemaname = 'public' AND tablename = 'membership_cards'
        LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 
                          policy_record.policyname, policy_record.tablename);
        END LOOP;
    END IF;
END $$;

-- Create permissive policies for all tables
-- Allow all operations for all users (temporary for development)
create policy "Temporary: Allow all operations on profiles"
on public.profiles for all
to public
using (true)
with check (true);

-- Enable RLS on subscriptions table
alter table public.subscriptions enable row level security;

create policy "Temporary: Allow all operations on subscriptions"
on public.subscriptions for all
to public
using (true)
with check (true);

-- If membership_cards table exists, add policies for it
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'membership_cards') THEN
        alter table public.membership_cards enable row level security;
        
        create policy "Temporary: Allow all operations on membership_cards"
        on public.membership_cards for all
        to public
        using (true)
        with check (true);
    END IF;
END $$;

-- Service role access for each table
create policy "Service role can access profiles"
on public.profiles for all
to service_role
using (true)
with check (true);

create policy "Service role can access subscriptions"
on public.subscriptions for all
to service_role
using (true)
with check (true);

-- Add service role access to membership_cards if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'membership_cards') THEN
        create policy "Service role can access membership_cards"
        on public.membership_cards for all
        to service_role
        using (true)
        with check (true);
    END IF;
END $$;
