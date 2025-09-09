-- Migration pour ajouter CinetPay comme méthode de paiement
-- Ajouter 'cinetpay' à l'enum payment_method

ALTER TYPE payment_method ADD VALUE IF NOT EXISTS 'cinetpay';

-- Optionnel: Mettre à jour les tentatives de paiement existantes si nécessaire
-- UPDATE payment_attempts SET payment_method = 'cinetpay' WHERE payment_method IS NULL AND metadata->>'transactionId' LIKE 'ELVERRA-%';
