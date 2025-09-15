-- Fix the public read policy for membership_products
BEGIN;

-- 1. Désactiver temporairement RLS
ALTER TABLE public.membership_products DISABLE ROW LEVEL SECURITY;

-- 2. Supprimer toutes les politiques existantes
DROP POLICY IF EXISTS "Allow public read access to membership_products" ON public.membership_products;

-- 3. Donner les permissions nécessaires
GRANT SELECT ON TABLE public.membership_products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.membership_products TO authenticated;

-- 4. Réactiver RLS
ALTER TABLE public.membership_products ENABLE ROW LEVEL SECURITY;

-- 5. Créer les politiques RLS
-- Politique de lecture publique
CREATE POLICY "Allow public read access to membership_products" 
ON public.membership_products
FOR SELECT
TO public
USING (true);

-- Politique pour les opérations d'écriture par les utilisateurs authentifiés
CREATE POLICY "Allow authenticated users to manage products"
ON public.membership_products
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

COMMIT;
