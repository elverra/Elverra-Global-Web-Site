-- Nettoyer l'ancienne table physical_card_requests puisqu'on utilise maintenant les colonnes dans profiles

-- 1) Vérifier si l'ancienne table existe
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'physical_card_requests') THEN
        RAISE NOTICE '⚠️  Ancienne table physical_card_requests trouvée';
        RAISE NOTICE '🔄 Migration vers les colonnes profiles recommandée';
    ELSE
        RAISE NOTICE '✅ Aucune ancienne table à nettoyer';
    END IF;
END $$;

-- 2) Optionnel: Migrer les données existantes vers profiles (si l'ancienne table existe)
DO $$
DECLARE
    migration_count integer := 0;
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'physical_card_requests') THEN
        -- Migrer les demandes existantes vers profiles
        UPDATE profiles 
        SET 
            physical_card_requested = true,
            physical_card_status = 'requested',
            physical_card_request_date = pcr.created_at,
            physical_card_notes = pcr.notes,
            physical_card_tracking_number = pcr.tracking_number
        FROM physical_card_requests pcr
        WHERE profiles.id = pcr.user_id;
        
        GET DIAGNOSTICS migration_count = ROW_COUNT;
        RAISE NOTICE '📦 % demandes migrées vers profiles', migration_count;
    END IF;
END $$;

-- 3) Supprimer l'ancienne table (ATTENTION: perte de données si pas migrées)
-- Décommentez cette section SEULEMENT après avoir vérifié la migration
/*
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'physical_card_requests') THEN
        DROP TABLE physical_card_requests CASCADE;
        RAISE NOTICE '🗑️  Ancienne table physical_card_requests supprimée';
    END IF;
END $$;
*/

-- 4) Vérifier que les nouvelles colonnes existent dans profiles
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    CASE 
        WHEN column_name LIKE '%physical_card%' THEN '✅ NOUVELLE COLONNE'
        ELSE '📋 COLONNE STANDARD'
    END as column_status
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name LIKE '%physical_card%'
ORDER BY column_name;

-- 5) Statistiques des demandes de cartes physiques
SELECT 
    COUNT(*) as total_users,
    COUNT(*) FILTER (WHERE physical_card_requested = true) as requested_cards,
    COUNT(*) FILTER (WHERE has_physical_card = true) as delivered_cards,
    COUNT(*) FILTER (WHERE physical_card_status = 'requested') as pending_requests,
    COUNT(*) FILTER (WHERE physical_card_status = 'delivered') as completed_requests
FROM profiles;

-- 6) Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '=== MIGRATION TERMINÉE ===';
    RAISE NOTICE '✅ Nouvelles colonnes dans profiles configurées';
    RAISE NOTICE '📱 Page admin mise à jour: /admin/physical-cards';
    RAISE NOTICE '🔧 Code d''inscription mis à jour pour utiliser profiles';
    RAISE NOTICE '';
    RAISE NOTICE '📋 PROCHAINES ÉTAPES:';
    RAISE NOTICE '1. Tester l''inscription avec "Request Physical Card"';
    RAISE NOTICE '2. Vérifier la page admin /admin/physical-cards';
    RAISE NOTICE '3. Si tout fonctionne, décommenter la section de suppression';
END $$;
