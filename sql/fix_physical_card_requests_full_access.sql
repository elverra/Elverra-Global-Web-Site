-- Script pour donner accès complet à physical_card_requests à tous les utilisateurs authentifiés

-- 1) Créer la table si elle n'existe pas
CREATE TABLE IF NOT EXISTS physical_card_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Mali',
    membership_tier VARCHAR(20) NOT NULL,
    affiliate_code VARCHAR(24),
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

-- 2) Activer RLS
ALTER TABLE physical_card_requests ENABLE ROW LEVEL SECURITY;

-- 3) Supprimer TOUTES les politiques existantes
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

-- 4) Créer UNE SEULE politique qui donne accès COMPLET à TOUS les utilisateurs authentifiés
CREATE POLICY "full_access_for_all_authenticated_users" ON physical_card_requests
    FOR ALL 
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 5) Créer aussi une politique pour le service role (backend)
CREATE POLICY "service_role_full_access" ON physical_card_requests
    FOR ALL 
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 6) Vérifier que les politiques ont été créées
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd,
    CASE 
        WHEN qual IS NOT NULL THEN 'USING: ' || qual 
        ELSE 'No USING clause' 
    END as using_clause,
    CASE 
        WHEN with_check IS NOT NULL THEN 'WITH CHECK: ' || with_check 
        ELSE 'No WITH CHECK clause' 
    END as with_check_clause
FROM pg_policies 
WHERE tablename = 'physical_card_requests'
ORDER BY policyname;

-- 7) Afficher un message de confirmation
DO $$
BEGIN
    RAISE NOTICE 'SUCCESS: physical_card_requests table configured with full access for all authenticated users';
END $$;
