-- Script pour transformer un utilisateur existant en utilisateur Premium avec carte valide

-- ⚠️  REMPLACEZ CET EMAIL PAR L'EMAIL DE L'UTILISATEUR EXISTANT
-- Ou utilisez l'ID utilisateur directement si vous le connaissez
DO $$
DECLARE
    target_user_email TEXT := 'user@example.com'; -- 🔧 CHANGEZ CET EMAIL
    target_user_id UUID;
    user_name TEXT;
    user_phone TEXT;
    affiliate_code TEXT;
BEGIN
    -- 1) Trouver l'utilisateur par email
    SELECT id, full_name, phone INTO target_user_id, user_name, user_phone
    FROM profiles 
    WHERE email = target_user_email 
    OR id::text = target_user_email; -- Au cas où vous passez directement l'ID
    
    IF target_user_id IS NULL THEN
        RAISE EXCEPTION '❌ Utilisateur non trouvé avec email/ID: %', target_user_email;
    END IF;
    
    RAISE NOTICE '✅ Utilisateur trouvé: % (ID: %)', user_name, target_user_id;
    
    -- Générer un code affilié s'il n'en a pas
    SELECT COALESCE(profiles.affiliate_code, 'ELV-' || upper(substring(md5(random()::text), 1, 12)))
    INTO affiliate_code
    FROM profiles WHERE id = target_user_id;
    
    -- 2) Mettre à jour le profil vers Premium
    UPDATE profiles SET
        membership_tier = 'premium',
        affiliate_code = affiliate_code,
        -- Ajouter des images par défaut si manquantes
        profile_image_url = COALESCE(profile_image_url, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'),
        identity_card_image_url = COALESCE(identity_card_image_url, 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=300'),
        -- Carte physique demandée et livrée
        physical_card_requested = true,
        has_physical_card = true,
        physical_card_status = 'delivered',
        physical_card_request_date = COALESCE(physical_card_request_date, NOW() - INTERVAL '30 days'),
        physical_card_delivery_date = NOW() - INTERVAL '7 days',
        physical_card_tracking_number = 'TRK-ML-2024-' || lpad(floor(random() * 1000)::text, 3, '0'),
        physical_card_notes = 'Carte Premium activée par admin - ' || to_char(NOW(), 'DD/MM/YYYY'),
        -- Ajouter des tokens par défaut
        auto_token_balance = COALESCE(auto_token_balance, 0) + 15,
        telephone_token_balance = COALESCE(telephone_token_balance, 0) + 20,
        motors_token_balance = COALESCE(motors_token_balance, 0) + 10,
        updated_at = NOW()
    WHERE id = target_user_id;
    
    RAISE NOTICE '✅ Profil mis à jour vers Premium';
    
    -- 3) Créer/Mettre à jour la subscription active
    INSERT INTO subscriptions (
        id,
        user_id,
        product_id,
        status,
        start_date,
        end_date,
        is_child,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        target_user_id,
        'premium-membership-2024',
        'active',
        NOW() - INTERVAL '1 day', -- Commencé hier
        NOW() + INTERVAL '364 days', -- Expire dans 364 jours
        false,
        NOW(),
        NOW()
    ) ON CONFLICT (user_id, product_id) DO UPDATE SET
        status = 'active',
        start_date = NOW() - INTERVAL '1 day',
        end_date = NOW() + INTERVAL '364 days',
        updated_at = NOW();
    
    RAISE NOTICE '✅ Subscription Premium créée/mise à jour';
    
    -- 4) Créer un paiement réussi
    INSERT INTO payments (
        id,
        user_id,
        amount,
        currency,
        status,
        payment_method,
        payment_reference,
        description,
        metadata,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        target_user_id,
        25000, -- 25,000 FCFA pour Premium
        'XOF',
        'completed',
        'admin_upgrade',
        'ADM-' || to_char(NOW(), 'YYYYMMDD') || '-' || lpad(floor(random() * 10000)::text, 4, '0'),
        'Upgrade vers Premium par admin - ' || COALESCE(user_name, 'Utilisateur'),
        jsonb_build_object(
            'membership_tier', 'premium',
            'upgrade_type', 'admin',
            'affiliate_code', affiliate_code,
            'upgraded_by', 'admin',
            'upgrade_date', NOW()
        ),
        NOW(),
        NOW()
    );
    
    RAISE NOTICE '✅ Paiement Premium enregistré';
    
    -- 5) Ajouter des transactions de tokens
    INSERT INTO token_transactions (
        id,
        user_id,
        transaction_type,
        service_type,
        amount,
        token_value,
        total_tokens,
        description,
        status,
        created_at
    ) VALUES 
    (
        gen_random_uuid(),
        target_user_id,
        'admin_grant',
        'auto',
        11250, -- 15 tokens × 750 FCFA
        750,
        15,
        'Tokens Auto offerts - Upgrade Premium',
        'completed',
        NOW()
    ),
    (
        gen_random_uuid(),
        target_user_id,
        'admin_grant',
        'telephone',
        5000, -- 20 tokens × 250 FCFA
        250,
        20,
        'Tokens Téléphone offerts - Upgrade Premium',
        'completed',
        NOW()
    ),
    (
        gen_random_uuid(),
        target_user_id,
        'admin_grant',
        'motors',
        2500, -- 10 tokens × 250 FCFA
        250,
        10,
        'Tokens Motors offerts - Upgrade Premium',
        'completed',
        NOW()
    );
    
    RAISE NOTICE '✅ Tokens ajoutés (Auto: 15, Téléphone: 20, Motors: 10)';
    
    -- 6) Résumé final
    RAISE NOTICE '';
    RAISE NOTICE '=== UPGRADE TERMINÉ ===';
    RAISE NOTICE 'Utilisateur: %', COALESCE(user_name, 'N/A');
    RAISE NOTICE 'ID: %', target_user_id;
    RAISE NOTICE 'Email: %', target_user_email;
    RAISE NOTICE 'Téléphone: %', COALESCE(user_phone, 'N/A');
    RAISE NOTICE 'Code affilié: %', affiliate_code;
    RAISE NOTICE 'Membership: Premium (actif pour 1 an)';
    RAISE NOTICE 'Carte physique: Livrée';
    RAISE NOTICE 'Tokens: Auto(15), Téléphone(20), Motors(10)';
    RAISE NOTICE '';
    RAISE NOTICE '🎉 L''utilisateur peut maintenant:';
    RAISE NOTICE '   ✅ Accéder aux réductions (10%% Premium)';
    RAISE NOTICE '   ✅ Utiliser Ô Secours avec ses tokens';
    RAISE NOTICE '   ✅ Voir sa carte physique comme livrée';
    RAISE NOTICE '   ✅ Accéder à toutes les fonctionnalités Premium';
    
END $$;

-- 7) Vérification de l'upgrade
DO $$
DECLARE
    target_user_email TEXT := 'user@example.com'; -- 🔧 MÊME EMAIL QU'AU DÉBUT
    verification_result RECORD;
BEGIN
    SELECT 
        p.id,
        p.full_name,
        p.phone,
        p.membership_tier,
        p.affiliate_code,
        p.physical_card_requested,
        p.has_physical_card,
        p.physical_card_status,
        p.auto_token_balance,
        p.telephone_token_balance,
        p.motors_token_balance,
        s.status as subscription_status,
        s.end_date,
        CASE 
            WHEN s.end_date > NOW() THEN '✅ ACTIF'
            ELSE '❌ EXPIRÉ'
        END as membership_status
    INTO verification_result
    FROM profiles p
    LEFT JOIN subscriptions s ON p.id = s.user_id AND s.status = 'active'
    WHERE p.email = target_user_email OR p.id::text = target_user_email;
    
    IF verification_result.id IS NOT NULL THEN
        RAISE NOTICE '';
        RAISE NOTICE '=== VÉRIFICATION FINALE ===';
        RAISE NOTICE 'Nom: %', verification_result.full_name;
        RAISE NOTICE 'Membership: % (%)', verification_result.membership_tier, verification_result.membership_status;
        RAISE NOTICE 'Carte physique: % (Status: %)', 
            CASE WHEN verification_result.has_physical_card THEN 'Oui' ELSE 'Non' END,
            verification_result.physical_card_status;
        RAISE NOTICE 'Tokens - Auto: %, Téléphone: %, Motors: %', 
            verification_result.auto_token_balance,
            verification_result.telephone_token_balance,
            verification_result.motors_token_balance;
        RAISE NOTICE 'Subscription expire: %', verification_result.end_date;
    END IF;
END $$;

-- 8) Instructions finales
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '📋 PROCHAINES ÉTAPES:';
    RAISE NOTICE '1. L''utilisateur peut se connecter normalement';
    RAISE NOTICE '2. Dashboard montrera "Premium Member"';
    RAISE NOTICE '3. Accès aux réductions débloqué';
    RAISE NOTICE '4. Tokens Ô Secours disponibles';
    RAISE NOTICE '5. Carte physique visible comme livrée dans admin';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  N''OUBLIEZ PAS: Changez l''email au début du script !';
END $$;
