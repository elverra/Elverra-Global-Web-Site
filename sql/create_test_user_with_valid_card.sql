-- Script pour créer un utilisateur de test avec une carte Premium valide et active

-- 1) Créer l'utilisateur dans auth.users (simulation)
-- Note: En production, ceci serait fait via l'inscription normale
DO $$
DECLARE
    test_user_id UUID := 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'; -- ID fixe pour les tests
    test_email TEXT := 'testuser@elverra.com';
    test_phone TEXT := '+223 70 12 34 56';
    test_full_name TEXT := 'Amadou Traoré';
    test_affiliate_code TEXT := 'ELV-' || upper(substring(md5(random()::text), 1, 12));
BEGIN
    -- Vérifier si l'utilisateur existe déjà
    IF EXISTS (SELECT 1 FROM profiles WHERE id = test_user_id) THEN
        RAISE NOTICE '⚠️  Utilisateur test existe déjà, mise à jour...';
        
        -- Mettre à jour le profil existant
        UPDATE profiles SET
            full_name = test_full_name,
            phone = test_phone,
            city = 'Bamako',
            country = 'Mali',
            address = 'Quartier ACI 2000, Rue 123',
            membership_tier = 'premium',
            affiliate_code = test_affiliate_code,
            profile_image_url = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
            identity_card_image_url = 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=300',
            -- Carte physique demandée et livrée
            physical_card_requested = true,
            has_physical_card = true,
            physical_card_status = 'delivered',
            physical_card_request_date = NOW() - INTERVAL '30 days',
            physical_card_delivery_date = NOW() - INTERVAL '7 days',
            physical_card_tracking_number = 'TRK-ML-2024-001',
            physical_card_notes = 'Carte Premium livrée avec succès',
            updated_at = NOW()
        WHERE id = test_user_id;
        
    ELSE
        RAISE NOTICE '✅ Création nouvel utilisateur test...';
        
        -- Créer le profil
        INSERT INTO profiles (
            id,
            full_name,
            phone,
            city,
            country,
            address,
            membership_tier,
            affiliate_code,
            profile_image_url,
            identity_card_image_url,
            -- Carte physique demandée et livrée
            physical_card_requested,
            has_physical_card,
            physical_card_status,
            physical_card_request_date,
            physical_card_delivery_date,
            physical_card_tracking_number,
            physical_card_notes,
            created_at,
            updated_at
        ) VALUES (
            test_user_id,
            test_full_name,
            test_phone,
            'Bamako',
            'Mali',
            'Quartier ACI 2000, Rue 123',
            'premium',
            test_affiliate_code,
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
            'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=300',
            -- Carte physique
            true,
            true,
            'delivered',
            NOW() - INTERVAL '30 days',
            NOW() - INTERVAL '7 days',
            'TRK-ML-2024-001',
            'Carte Premium livrée avec succès',
            NOW() - INTERVAL '45 days',
            NOW()
        );
    END IF;

    -- 2) Créer une subscription active Premium
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
        test_user_id,
        'premium-membership-2024', -- ID du produit Premium
        'active',
        NOW() - INTERVAL '30 days', -- Commencé il y a 30 jours
        NOW() + INTERVAL '335 days', -- Expire dans 335 jours (1 an total)
        false,
        NOW() - INTERVAL '30 days',
        NOW()
    ) ON CONFLICT (user_id, product_id) DO UPDATE SET
        status = 'active',
        start_date = NOW() - INTERVAL '30 days',
        end_date = NOW() + INTERVAL '335 days',
        updated_at = NOW();

    -- 3) Créer un paiement réussi pour la carte
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
        test_user_id,
        25000, -- 25,000 FCFA pour Premium
        'XOF',
        'completed',
        'orange_money',
        'OM-' || to_char(NOW(), 'YYYYMMDD') || '-' || lpad(floor(random() * 10000)::text, 4, '0'),
        'Paiement carte Premium - ' || test_full_name,
        jsonb_build_object(
            'membership_tier', 'premium',
            'phone', test_phone,
            'affiliate_code', test_affiliate_code
        ),
        NOW() - INTERVAL '30 days',
        NOW() - INTERVAL '30 days'
    );

    -- 4) Ajouter quelques tokens Ô Secours
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
        test_user_id,
        'purchase',
        'auto',
        15000, -- 15,000 FCFA
        750, -- 750 FCFA par token
        20, -- 20 tokens
        'Achat initial tokens Auto',
        'completed',
        NOW() - INTERVAL '25 days'
    ),
    (
        gen_random_uuid(),
        test_user_id,
        'purchase',
        'telephone',
        5000, -- 5,000 FCFA
        250, -- 250 FCFA par token
        20, -- 20 tokens
        'Achat tokens Téléphone',
        'completed',
        NOW() - INTERVAL '20 days'
    );

    -- 5) Mettre à jour les soldes de tokens
    UPDATE profiles SET
        auto_token_balance = 18, -- 20 - 2 utilisés
        telephone_token_balance = 20,
        motors_token_balance = 0,
        cata_catanis_token_balance = 0,
        school_fees_token_balance = 0
    WHERE id = test_user_id;

    RAISE NOTICE '=== UTILISATEUR TEST CRÉÉ ===';
    RAISE NOTICE 'ID: %', test_user_id;
    RAISE NOTICE 'Email: %', test_email;
    RAISE NOTICE 'Nom: %', test_full_name;
    RAISE NOTICE 'Téléphone: %', test_phone;
    RAISE NOTICE 'Code affilié: %', test_affiliate_code;
    RAISE NOTICE 'Membership: Premium (actif)';
    RAISE NOTICE 'Carte physique: Livrée';
    RAISE NOTICE 'Tokens Auto: 18';
    RAISE NOTICE 'Tokens Téléphone: 20';
END $$;

-- 6) Vérifier la création
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
    s.status as subscription_status,
    s.start_date,
    s.end_date,
    CASE 
        WHEN s.end_date > NOW() THEN '✅ ACTIF'
        ELSE '❌ EXPIRÉ'
    END as membership_status
FROM profiles p
LEFT JOIN subscriptions s ON p.id = s.user_id AND s.status = 'active'
WHERE p.id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

-- 7) Vérifier les paiements
SELECT 
    amount,
    currency,
    status,
    payment_method,
    payment_reference,
    description,
    created_at
FROM payments 
WHERE user_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
ORDER BY created_at DESC;

-- 8) Vérifier les tokens
SELECT 
    service_type,
    transaction_type,
    total_tokens,
    token_value,
    amount,
    description,
    created_at
FROM token_transactions 
WHERE user_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
ORDER BY created_at DESC;

-- 9) Message final
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 UTILISATEUR TEST PRÊT !';
    RAISE NOTICE '';
    RAISE NOTICE '📋 POUR TESTER:';
    RAISE NOTICE '1. Connectez-vous avec cet ID utilisateur';
    RAISE NOTICE '2. Vérifiez le dashboard - doit montrer Premium actif';
    RAISE NOTICE '3. Vérifiez les réductions - doit avoir accès (10%%)';
    RAISE NOTICE '4. Vérifiez Ô Secours - doit avoir des tokens';
    RAISE NOTICE '5. Vérifiez admin/physical-cards - doit voir la demande livrée';
    RAISE NOTICE '';
    RAISE NOTICE '🔑 ID UTILISATEUR: a1b2c3d4-e5f6-7890-abcd-ef1234567890';
END $$;
