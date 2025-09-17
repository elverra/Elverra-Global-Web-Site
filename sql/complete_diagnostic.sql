-- DIAGNOSTIC COMPLET POUR PHYSICAL_CARD_REQUESTS
-- Ce script va identifier EXACTEMENT d'où vient le problème

-- ========================================
-- 1. VÉRIFICATION DE L'EXISTENCE DE LA TABLE
-- ========================================
DO $$
BEGIN
    RAISE NOTICE '=== 1. VÉRIFICATION TABLE ===';
END $$;

SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'physical_card_requests' 
            AND table_schema = 'public'
        ) THEN '✅ TABLE EXISTS'
        ELSE '❌ TABLE DOES NOT EXIST'
    END as table_status;

-- ========================================
-- 2. STRUCTURE DE LA TABLE (si elle existe)
-- ========================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'physical_card_requests') THEN
        RAISE NOTICE '=== 2. STRUCTURE DE LA TABLE ===';
    END IF;
END $$;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    CASE 
        WHEN column_name IN ('email', 'card_identifier') THEN '⚠️  ANCIENNE COLONNE (à supprimer)'
        WHEN column_name = 'affiliate_code' THEN '✅ NOUVELLE COLONNE'
        ELSE '📋 COLONNE STANDARD'
    END as column_status
FROM information_schema.columns 
WHERE table_name = 'physical_card_requests' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- ========================================
-- 3. STATUT RLS ET POLITIQUES
-- ========================================
DO $$
BEGIN
    RAISE NOTICE '=== 3. SÉCURITÉ RLS ===';
END $$;

-- Statut RLS
SELECT 
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity = true THEN '⚠️  RLS ACTIVÉ (peut bloquer l''accès)'
        WHEN rowsecurity = false THEN '✅ RLS DÉSACTIVÉ (accès libre)'
        ELSE '❓ STATUT INCONNU'
    END as rls_status
FROM pg_tables 
WHERE tablename = 'physical_card_requests';

-- Politiques existantes
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    CASE 
        WHEN roles = '{authenticated}' THEN '✅ POUR UTILISATEURS AUTHENTIFIÉS'
        WHEN roles = '{service_role}' THEN '🔧 POUR SERVICE ROLE'
        ELSE '❓ RÔLES: ' || array_to_string(roles, ', ')
    END as role_info,
    CASE 
        WHEN qual = 'true' THEN '✅ ACCÈS LIBRE (USING true)'
        WHEN qual LIKE '%auth.uid()%' THEN '🔒 ACCÈS RESTREINT (par user_id)'
        ELSE '❓ CONDITION: ' || COALESCE(qual, 'NULL')
    END as access_condition
FROM pg_policies 
WHERE tablename = 'physical_card_requests'
ORDER BY policyname;

-- ========================================
-- 4. TEST D'ACCÈS DIRECT
-- ========================================
DO $$
DECLARE
    record_count integer;
    access_error text;
BEGIN
    RAISE NOTICE '=== 4. TEST D''ACCÈS ===';
    
    BEGIN
        SELECT COUNT(*) INTO record_count FROM physical_card_requests;
        RAISE NOTICE '✅ SELECT réussi - % enregistrements trouvés', record_count;
    EXCEPTION 
        WHEN insufficient_privilege THEN
            RAISE NOTICE '❌ ERREUR: Permission refusée (403)';
            RAISE NOTICE '🔧 SOLUTION: Désactiver RLS ou ajouter politique permissive';
        WHEN undefined_table THEN
            RAISE NOTICE '❌ ERREUR: Table n''existe pas';
            RAISE NOTICE '🔧 SOLUTION: Créer la table avec le script de création';
        WHEN OTHERS THEN
            GET STACKED DIAGNOSTICS access_error = MESSAGE_TEXT;
            RAISE NOTICE '❌ ERREUR INCONNUE: %', access_error;
    END;
END $$;

-- ========================================
-- 5. VÉRIFICATION DES PERMISSIONS UTILISATEUR
-- ========================================
DO $$
BEGIN
    RAISE NOTICE '=== 5. PERMISSIONS UTILISATEUR ===';
END $$;

-- Rôle actuel
SELECT 
    current_user as current_user_role,
    session_user as session_user_role,
    CASE 
        WHEN current_user = 'postgres' THEN '🔑 SUPER ADMIN'
        WHEN current_user LIKE '%service_role%' THEN '🔧 SERVICE ROLE'
        WHEN current_user = 'authenticated' THEN '👤 UTILISATEUR AUTHENTIFIÉ'
        ELSE '❓ RÔLE: ' || current_user
    END as role_type;

-- ========================================
-- 6. DIAGNOSTIC AUTOMATIQUE ET SOLUTIONS
-- ========================================
DO $$
DECLARE
    table_exists boolean;
    rls_enabled boolean;
    policy_count integer;
    has_permissive_policy boolean;
BEGIN
    RAISE NOTICE '=== 6. DIAGNOSTIC AUTOMATIQUE ===';
    
    -- Vérifications
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'physical_card_requests' AND table_schema = 'public'
    ) INTO table_exists;
    
    SELECT COALESCE(rowsecurity, false) 
    FROM pg_tables 
    WHERE tablename = 'physical_card_requests' 
    INTO rls_enabled;
    
    SELECT COUNT(*) 
    FROM pg_policies 
    WHERE tablename = 'physical_card_requests' 
    INTO policy_count;
    
    SELECT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'physical_card_requests' 
        AND qual = 'true'
    ) INTO has_permissive_policy;
    
    -- Diagnostic
    IF NOT table_exists THEN
        RAISE NOTICE '🚨 PROBLÈME: Table n''existe pas';
        RAISE NOTICE '💡 SOLUTION: Exécuter le script de création de table';
        
    ELSIF rls_enabled AND policy_count = 0 THEN
        RAISE NOTICE '🚨 PROBLÈME: RLS activé mais aucune politique';
        RAISE NOTICE '💡 SOLUTION 1: ALTER TABLE physical_card_requests DISABLE ROW LEVEL SECURITY;';
        RAISE NOTICE '💡 SOLUTION 2: Créer une politique permissive';
        
    ELSIF rls_enabled AND NOT has_permissive_policy THEN
        RAISE NOTICE '🚨 PROBLÈME: RLS activé avec politiques restrictives';
        RAISE NOTICE '💡 SOLUTION 1: ALTER TABLE physical_card_requests DISABLE ROW LEVEL SECURITY;';
        RAISE NOTICE '💡 SOLUTION 2: Créer politique: CREATE POLICY "allow_all" ON physical_card_requests FOR ALL USING (true);';
        
    ELSE
        RAISE NOTICE '✅ CONFIGURATION: Semble correcte';
        RAISE NOTICE '🔍 VÉRIFIER: Permissions au niveau application/frontend';
    END IF;
    
    RAISE NOTICE '=== RÉSUMÉ ===';
    RAISE NOTICE 'Table existe: %', CASE WHEN table_exists THEN 'OUI' ELSE 'NON' END;
    RAISE NOTICE 'RLS activé: %', CASE WHEN rls_enabled THEN 'OUI' ELSE 'NON' END;
    RAISE NOTICE 'Nombre de politiques: %', policy_count;
    RAISE NOTICE 'Politique permissive: %', CASE WHEN has_permissive_policy THEN 'OUI' ELSE 'NON' END;
END $$;

-- ========================================
-- 7. SCRIPT DE CORRECTION AUTOMATIQUE
-- ========================================
DO $$
BEGIN
    RAISE NOTICE '=== 7. SCRIPT DE CORRECTION ===';
    RAISE NOTICE 'Si le problème persiste, exécutez ces commandes:';
    RAISE NOTICE '';
    RAISE NOTICE '-- Créer la table si elle n''existe pas:';
    RAISE NOTICE 'CREATE TABLE IF NOT EXISTS physical_card_requests (';
    RAISE NOTICE '    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),';
    RAISE NOTICE '    user_id UUID NOT NULL,';
    RAISE NOTICE '    full_name VARCHAR(255) NOT NULL,';
    RAISE NOTICE '    phone VARCHAR(20) NOT NULL,';
    RAISE NOTICE '    membership_tier VARCHAR(20) NOT NULL,';
    RAISE NOTICE '    affiliate_code VARCHAR(24),';
    RAISE NOTICE '    status VARCHAR(30) DEFAULT ''pending_payment'',';
    RAISE NOTICE '    created_at TIMESTAMPTZ DEFAULT NOW()';
    RAISE NOTICE ');';
    RAISE NOTICE '';
    RAISE NOTICE '-- Désactiver RLS complètement:';
    RAISE NOTICE 'ALTER TABLE physical_card_requests DISABLE ROW LEVEL SECURITY;';
    RAISE NOTICE '';
    RAISE NOTICE '-- OU créer une politique permissive:';
    RAISE NOTICE 'CREATE POLICY "allow_all_access" ON physical_card_requests FOR ALL USING (true);';
END $$;
