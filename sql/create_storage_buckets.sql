-- Create storage buckets for profile and identity card images
-- Note: These commands should be run in Supabase dashboard or via Supabase CLI

-- Create profile images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'profile-images',
    'profile-images',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Create identity card images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'identity-cards',
    'identity-cards',
    false, -- Private bucket for security
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/pdf']
) ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for profile images bucket
CREATE POLICY "Users can upload their own profile images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'profile-images' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view their own profile images" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'profile-images' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update their own profile images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'profile-images' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete their own profile images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'profile-images' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Create RLS policies for identity card images bucket
CREATE POLICY "Users can upload their own identity cards" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'identity-cards' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view their own identity cards" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'identity-cards' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update their own identity cards" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'identity-cards' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete their own identity cards" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'identity-cards' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Admin policies for both buckets (uncomment if you have admin role)
-- CREATE POLICY "Admins can manage all profile images" ON storage.objects
--     FOR ALL USING (
--         bucket_id = 'profile-images' 
--         AND auth.jwt() ->> 'role' = 'admin'
--     );

-- CREATE POLICY "Admins can manage all identity cards" ON storage.objects
--     FOR ALL USING (
--         bucket_id = 'identity-cards' 
--         AND auth.jwt() ->> 'role' = 'admin'
--     );
