-- Add address column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS address TEXT;

-- Update RLS policies if needed
DROP POLICY IF EXISTS "Enable update for users based on id" ON public.profiles;
CREATE POLICY "Enable update for users based on id" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);
