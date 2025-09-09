-- SQL pour créer un utilisateur avec membership essential déjà inscrit
-- Remplacez les valeurs par celles souhaitées

-- 1. Insérer l'utilisateur
INSERT INTO users (
    id,
    email,
    password,
    full_name,
    phone,
    address,
    city,
    country,
    membership_tier,
    is_email_verified,
    is_phone_verified,
    referral_code,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'client.essential@example.com',
    '$2b$10$example.hashed.password.here', -- Remplacez par un hash bcrypt valide
    'Client Essential Test',
    '+237600000000',
    '123 Rue Example',
    'Douala',
    'Cameroun',
    'essential',
    true,
    true,
    'ESS' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 6)), -- Code référent automatique
    NOW(),
    NOW()
);

-- 2. Créer un abonnement actif pour cet utilisateur
INSERT INTO subscriptions (
    id,
    user_id,
    membership_tier,
    status,
    start_date,
    end_date,
    is_recurring,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    (SELECT id FROM users WHERE email = 'client.essential@example.com'),
    'essential',
    'active',
    NOW(),
    NOW() + INTERVAL '1 year', -- Abonnement valide 1 an
    true,
    NOW(),
    NOW()
);

-- 3. Créer un paiement réussi pour justifier l'abonnement
INSERT INTO payments (
    id,
    user_id,
    subscription_id,
    amount,
    currency,
    status,
    payment_method,
    transaction_id,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    (SELECT id FROM users WHERE email = 'client.essential@example.com'),
    (SELECT id FROM subscriptions WHERE user_id = (SELECT id FROM users WHERE email = 'client.essential@example.com')),
    25000, -- Prix carte essential en FCFA
    'XAF',
    'completed',
    'orange_money',
    'TEST_' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 10)),
    NOW(),
    NOW()
);

-- Vérification : Afficher l'utilisateur créé
SELECT 
    u.id,
    u.email,
    u.full_name,
    u.membership_tier,
    s.status as subscription_status,
    s.end_date,
    p.status as payment_status,
    p.amount
FROM users u
LEFT JOIN subscriptions s ON u.id = s.user_id
LEFT JOIN payments p ON s.id = p.subscription_id
WHERE u.email = 'client.essential@example.com';
