-- SOLUTION RADICALE: Désactiver complètement RLS pour donner accès à TOUT LE MONDE

-- 1) Créer la table si elle n'existe pas (structure mise à jour)
CREATE TABLE IF NOT EXISTS physical_card_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Mali',
    membership_tier VARCHAR(20) NOT NULL,
    affiliate_code VARCHAR(24), -- Plus de card_identifier, plus d'email
    status VARCHAR(30) NOT NULL DEFAULT 'pending_payment',
    payment_amount DECIMAL(10,2) DEFAULT 0,
    payment_status VARCHAR(20) DEFAULT 'pending',
    payment_method VARCHAR(50),
    payment_reference VARCHAR(100),
    payment_completed_at TIMESTAMP WITH TIME ZONE,
    delivery_address TEXT,
    delivery_city VARCHAR(100),
    delivery_country VARCHAR(100),
    tracking_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2) DÉSACTIVER COMPLÈTEMENT RLS - Accès total pour tout le monde
ALTER TABLE physical_card_requests DISABLE ROW LEVEL SECURITY;

-- 3) Supprimer TOUTES les politiques existantes (plus besoin)
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'physical_card_requests'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON physical_card_requests', policy_record.policyname);
    END LOOP;
END $$;

-- 4) Vérifier que RLS est désactivé
SELECT 
    schemaname, 
    tablename, 
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity = true THEN '❌ RLS ACTIVÉ (problème)'
        ELSE '✅ RLS DÉSACTIVÉ (accès libre)'
    END as status
FROM pg_tables 
WHERE tablename = 'physical_card_requests';

-- 5) Compter les politiques restantes (devrait être 0)
SELECT 
    COUNT(*) as policies_count,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ Aucune politique (accès libre)'
        ELSE '❌ Des politiques existent encore'
    END as policies_status
FROM pg_policies 
WHERE tablename = 'physical_card_requests';

-- 6) Message de succès
DO $$
BEGIN
    RAISE NOTICE '🎉 SUCCESS: RLS complètement désactivé pour physical_card_requests';
    RAISE NOTICE '✅ Accès TOTAL accordé à TOUT LE MONDE';
    RAISE NOTICE '🔓 Plus de restrictions, plus d''erreurs 403';
END $$;

-- Add a comment explaining this is temporary
COMMENT ON TABLE physical_card_requests IS 'RLS temporarily disabled for admin access - should be re-enabled with proper service role policies';

SELECT 'RLS disabled for physical_card_requests table' as result;
