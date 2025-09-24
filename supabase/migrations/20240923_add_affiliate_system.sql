-- =====================================================
-- ADD AFFILIATE SYSTEM
-- =====================================================

-- 1. Add referrer_id to auth.users table
DO $$
BEGIN
    -- Add referrer_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'auth' 
        AND table_name = 'users' 
        AND column_name = 'referrer_id'
    ) THEN
        ALTER TABLE auth.users 
        ADD COLUMN referrer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
        
        RAISE NOTICE 'Added referrer_id column to auth.users';
    END IF;

    -- Create commissions table if it doesn't exist
    CREATE TABLE IF NOT EXISTS public.commissions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        referred_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        amount DECIMAL(10, 2) NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
        UNIQUE(referrer_id, referred_user_id, payment_id)
    );
    
    RAISE NOTICE 'Created commissions table';

    -- Create RLS policies for commissions
    ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
    
    -- Policy for referrers to view their own commissions
    DROP POLICY IF EXISTS "Users can view their own commissions" ON public.commissions;
    CREATE POLICY "Users can view their own commissions" 
    ON public.commissions
    FOR SELECT
    USING (auth.uid() = referrer_id);
    
    -- Policy for admins to manage all commissions
    DROP POLICY IF EXISTS "Admins can manage all commissions" ON public.commissions;
    CREATE POLICY "Admins can manage all commissions" 
    ON public.commissions
    USING (EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('SUPERADMIN', 'SUPPORT')
    ));
    
    -- Create a function to handle commission calculation
    CREATE OR REPLACE FUNCTION public.calculate_affiliate_commission(
        p_payment_id UUID
    )
    RETURNS VOID AS $$
    DECLARE
        v_user_id UUID;
        v_referrer_id UUID;
        v_amount DECIMAL(10, 2);
        v_commission_amount DECIMAL(10, 2);
        v_payment_type TEXT;
        v_membership_type TEXT;
    BEGIN
        -- Get payment details
        SELECT 
            p.user_id,
            u.referrer_id,
            p.amount,
            p.payment_type,
            p.metadata->>'membership_type' AS membership_type
        INTO 
            v_user_id,
            v_referrer_id,
            v_amount,
            v_payment_type,
            v_membership_type
        FROM public.payments p
        LEFT JOIN auth.users u ON p.user_id = u.id
        WHERE p.id = p_payment_id;
        
        -- Only process if this is a card payment and has a referrer
        IF v_referrer_id IS NOT NULL AND v_payment_type = 'card' THEN
            -- Calculate commission (10% of the payment amount)
            v_commission_amount := v_amount * 0.10;
            
            -- Insert commission record
            INSERT INTO public.commissions (
                referrer_id,
                referred_user_id,
                amount,
                status,
                payment_id
            ) VALUES (
                v_referrer_id,
                v_user_id,
                v_commission_amount,
                'pending',
                p_payment_id
            );
            
            RAISE NOTICE 'Commission of % created for referrer % (user: %, payment: %)', 
                v_commission_amount, v_referrer_id, v_user_id, p_payment_id;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Error calculating affiliate commission: %', SQLERRM;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
    
    -- Create a trigger to calculate commission after payment
    CREATE OR REPLACE FUNCTION public.trigger_calculate_affiliate_commission()
    RETURNS TRIGGER AS $$
    BEGIN
        -- Only process for successful card payments
        IF NEW.status = 'succeeded' AND NEW.payment_type = 'card' THEN
            PERFORM public.calculate_affiliate_commission(NEW.id);
        END IF;
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    
    -- Create the trigger if it doesn't exist
    DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1 
            FROM pg_trigger 
            WHERE tgname = 'after_payment_insert_affiliate_commission'
        ) THEN
            CREATE TRIGGER after_payment_insert_affiliate_commission
            AFTER INSERT OR UPDATE ON public.payments
            FOR EACH ROW
            WHEN (NEW.status = 'succeeded' AND NEW.payment_type = 'card')
            EXECUTE FUNCTION public.trigger_calculate_affiliate_commission();
            
            RAISE NOTICE 'Created after_payment_insert_affiliate_commission trigger';
        END IF;
    END $$;
    
    RAISE NOTICE 'Affiliate system setup completed';
EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Error setting up affiliate system: %', SQLERRM;
END $$;
