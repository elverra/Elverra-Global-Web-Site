-- =====================================================
-- FIX GET_USER_ROLE FUNCTION
-- =====================================================

-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS public.get_user_role();

-- Create a more robust get_user_role function
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- First try to get the role from user_roles table
  SELECT role INTO user_role
  FROM public.user_roles 
  WHERE user_id = auth.uid()
  ORDER BY 
    CASE role 
      WHEN 'SUPERADMIN' THEN 1 
      WHEN 'ADMIN' THEN 2
      WHEN 'SUPPORT' THEN 3
      WHEN 'USER' THEN 4
      ELSE 5 
    END
  LIMIT 1;
  
  -- If no role found, return 'USER' as default
  IF user_role IS NULL THEN
    RETURN 'USER';
  END IF;
  
  RETURN user_role;
EXCEPTION WHEN OTHERS THEN
  -- In case of any error, return 'USER' as default
  RETURN 'USER';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated;
