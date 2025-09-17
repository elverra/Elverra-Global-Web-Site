-- Ajouter les colonnes pour la gestion des cartes physiques dans la table profiles

-- 1) Ajouter les nouvelles colonnes
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS physical_card_requested BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS has_physical_card BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS physical_card_request_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS physical_card_delivery_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS physical_card_status VARCHAR(30) DEFAULT 'not_requested' CHECK (
    physical_card_status IN (
        'not_requested',
        'requested', 
        'approved',
        'printing',
        'shipped',
        'delivered'
    )
),
ADD COLUMN IF NOT EXISTS physical_card_tracking_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS physical_card_notes TEXT;

-- 2) Créer des index pour les requêtes admin
CREATE INDEX IF NOT EXISTS idx_profiles_physical_card_requested ON profiles(physical_card_requested);
CREATE INDEX IF NOT EXISTS idx_profiles_physical_card_status ON profiles(physical_card_status);
CREATE INDEX IF NOT EXISTS idx_profiles_has_physical_card ON profiles(has_physical_card);

-- 3) Fonction pour mettre à jour automatiquement le statut
CREATE OR REPLACE FUNCTION update_physical_card_request_date()
RETURNS TRIGGER AS $$
BEGIN
    -- Si physical_card_requested passe de false à true, mettre la date
    IF OLD.physical_card_requested = false AND NEW.physical_card_requested = true THEN
        NEW.physical_card_request_date = NOW();
        NEW.physical_card_status = 'requested';
    END IF;
    
    -- Si has_physical_card passe de false à true, mettre la date de livraison
    IF OLD.has_physical_card = false AND NEW.has_physical_card = true THEN
        NEW.physical_card_delivery_date = NOW();
        NEW.physical_card_status = 'delivered';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4) Créer le trigger
DROP TRIGGER IF EXISTS trigger_update_physical_card_dates ON profiles;
CREATE TRIGGER trigger_update_physical_card_dates
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_physical_card_request_date();

-- 5) Vérifier que les colonnes ont été ajoutées
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name LIKE '%physical_card%'
ORDER BY column_name;

-- 6) Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Colonnes de carte physique ajoutées à la table profiles';
    RAISE NOTICE '📋 Colonnes ajoutées:';
    RAISE NOTICE '   - physical_card_requested (boolean)';
    RAISE NOTICE '   - has_physical_card (boolean)';
    RAISE NOTICE '   - physical_card_status (varchar)';
    RAISE NOTICE '   - physical_card_request_date (timestamptz)';
    RAISE NOTICE '   - physical_card_delivery_date (timestamptz)';
    RAISE NOTICE '   - physical_card_tracking_number (varchar)';
    RAISE NOTICE '   - physical_card_notes (text)';
    RAISE NOTICE '🔧 Trigger automatique créé pour les dates';
END $$;
