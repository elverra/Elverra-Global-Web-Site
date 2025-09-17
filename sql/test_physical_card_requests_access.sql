-- Script de test pour vérifier l'accès à physical_card_requests

-- 1) Vérifier si la table existe
SELECT 
    table_name,
    table_schema,
    CASE 
        WHEN table_name IS NOT NULL THEN '✅ Table EXISTS'
        ELSE '❌ Table DOES NOT EXIST'
    END as table_status
FROM information_schema.tables 
WHERE table_name = 'physical_card_requests' 
AND table_schema = 'public';

-- 2) Vérifier les colonnes de la table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'physical_card_requests' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3) Vérifier le statut RLS
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity = true THEN '⚠️  RLS ENABLED (peut causer 403)'
        ELSE '✅ RLS DISABLED (accès libre)'
    END as rls_status
FROM pg_tables 
WHERE tablename = 'physical_card_requests';

-- 4) Lister toutes les politiques RLS
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual as using_clause,
    with_check
FROM pg_policies 
WHERE tablename = 'physical_card_requests'
ORDER BY policyname;

-- 5) Test d'accès simple (SELECT)
DO $$
BEGIN
    BEGIN
        PERFORM COUNT(*) FROM physical_card_requests;
        RAISE NOTICE '✅ SELECT access: SUCCESS';
    EXCEPTION 
        WHEN insufficient_privilege THEN
            RAISE NOTICE '❌ SELECT access: PERMISSION DENIED';
        WHEN undefined_table THEN
            RAISE NOTICE '❌ SELECT access: TABLE DOES NOT EXIST';
        WHEN OTHERS THEN
            RAISE NOTICE '❌ SELECT access: ERROR - %', SQLERRM;
    END;
END $$;

-- 6) Afficher le résumé
DO $$
DECLARE
    table_exists boolean;
    rls_enabled boolean;
    policy_count integer;
BEGIN
    -- Check if table exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'physical_card_requests' AND table_schema = 'public'
    ) INTO table_exists;
    
    -- Check RLS status
    SELECT COALESCE(rowsecurity, false) 
    FROM pg_tables 
    WHERE tablename = 'physical_card_requests' 
    INTO rls_enabled;
    
    -- Count policies
    SELECT COUNT(*) 
    FROM pg_policies 
    WHERE tablename = 'physical_card_requests' 
    INTO policy_count;
    
    RAISE NOTICE '=== DIAGNOSTIC SUMMARY ===';
    RAISE NOTICE 'Table exists: %', CASE WHEN table_exists THEN '✅ YES' ELSE '❌ NO' END;
    RAISE NOTICE 'RLS enabled: %', CASE WHEN rls_enabled THEN '⚠️  YES (peut bloquer)' ELSE '✅ NO (accès libre)' END;
    RAISE NOTICE 'Policies count: %', policy_count;
    
    IF NOT table_exists THEN
        RAISE NOTICE '🔧 ACTION: Créer la table avec le script de création';
    ELSIF rls_enabled AND policy_count = 0 THEN
        RAISE NOTICE '🔧 ACTION: RLS activé mais aucune politique - désactiver RLS ou ajouter des politiques';
    ELSIF rls_enabled AND policy_count > 0 THEN
        RAISE NOTICE '🔧 ACTION: Vérifier que les politiques permettent l''accès à votre utilisateur';
    ELSE
        RAISE NOTICE '🎉 STATUS: Configuration semble correcte';
    END IF;
END $$;
