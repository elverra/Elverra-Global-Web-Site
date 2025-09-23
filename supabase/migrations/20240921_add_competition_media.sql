-- =====================================================
-- MIGRATION POUR SUPPORTER LES CONCOURS AVEC MÉDIAS
-- =====================================================

-- 1. Ajouter une colonne pour indiquer si l'événement est un concours
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS is_competition BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS media_types VARCHAR(50)[] DEFAULT ARRAY['image']::VARCHAR(50)[],
ADD COLUMN IF NOT EXISTS max_media_files INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS competition_rules TEXT;

-- 2. Créer une table pour les soumissions de médias des participants
CREATE TABLE IF NOT EXISTS competition_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participant_id UUID REFERENCES event_participants(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    description TEXT,
    submission_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'winner')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Table pour stocker les médias des soumissions
CREATE TABLE IF NOT EXISTS submission_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID REFERENCES competition_submissions(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size BIGINT NOT NULL,
    media_type VARCHAR(50) NOT NULL CHECK (media_type IN ('image', 'video', 'document', 'audio')),
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Ajouter des index pour les performances
CREATE INDEX IF NOT EXISTS idx_competition_submissions_event_id ON competition_submissions(event_id);
CREATE INDEX IF NOT EXISTS idx_competition_submissions_user_id ON competition_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submission_media_submission_id ON submission_media(submission_id);

-- 5. Ajouter des politiques RLS pour la sécurité
ALTER TABLE competition_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE submission_media ENABLE ROW LEVEL SECURITY;

-- Politiques pour competition_submissions
CREATE POLICY "Enable read access for public" ON public.competition_submissions
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.competition_submissions
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Enable update for submission owners" ON public.competition_submissions
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Politiques pour submission_media
CREATE POLICY "Enable read access for public" ON public.submission_media
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.submission_media
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM competition_submissions cs 
            WHERE cs.id = submission_id AND cs.user_id = auth.uid()
        )
    );

-- 6. Fonction pour mettre à jour le timestamp updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Déclencher pour la table competition_submissions
CREATE TRIGGER update_competition_submissions_updated_at
BEFORE UPDATE ON competition_submissions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 8. Fonction utilitaire pour obtenir l'URL signée d'un média
CREATE OR REPLACE FUNCTION get_signed_url(bucket_name TEXT, object_path TEXT, expires_in INT DEFAULT 3600)
RETURNS TEXT AS $$
DECLARE
    url TEXT;
BEGIN
    SELECT storage.filename_lts(object_path) INTO object_path;
    SELECT storage.signed_urls.object_signed_url INTO url
    FROM storage.signed_urls(bucket_name, object_path, make_interval(secs => expires_in), 'GET');
    
    RETURN url;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
