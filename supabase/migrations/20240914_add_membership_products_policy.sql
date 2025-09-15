-- Enable RLS on membership_products table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables 
              WHERE table_schema = 'public' AND table_name = 'membership_products') THEN
        -- Enable RLS
        EXECUTE 'ALTER TABLE public.membership_products ENABLE ROW LEVEL SECURITY';
        
        -- Drop existing policy if it exists
        DROP POLICY IF EXISTS "Allow public read access to membership_products" ON public.membership_products;
        
        -- Create new policy to allow public read access
        CREATE POLICY "Allow public read access to membership_products" 
        ON public.membership_products
        FOR SELECT
        USING (true);
        
        RAISE NOTICE 'RLS policy for membership_products has been updated';
    ELSE
        RAISE NOTICE 'membership_products table does not exist, skipping RLS setup';
    END IF;
END $$;
