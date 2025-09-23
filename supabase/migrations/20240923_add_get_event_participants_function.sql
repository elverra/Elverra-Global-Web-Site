-- =====================================================
-- ADD GET_EVENT_PARTICIPANTS FUNCTION
-- =====================================================

-- Fonction pour récupérer les participants d'un événement
-- Cette fonction est sécurisée et peut être appelée via RPC
CREATE OR REPLACE FUNCTION public.get_event_participants(event_id_param UUID)
RETURNS TABLE (
  id UUID,
  event_id UUID,
  user_id UUID,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  motivation TEXT,
  status TEXT,
  additional_info TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Vérifier si l'utilisateur est admin ou créateur de l'événement
  IF NOT (public.is_admin() OR public.is_event_creator(event_id_param)) THEN
    RAISE EXCEPTION 'Accès non autorisé. Vous devez être administrateur ou créateur de l\'événement.';
  END IF;
  
  -- Retourner les participants
  RETURN QUERY
  SELECT 
    ep.id,
    ep.event_id,
    ep.user_id,
    ep.full_name,
    ep.email,
    ep.phone,
    ep.motivation,
    ep.status,
    ep.additional_info,
    ep.created_at,
    ep.updated_at
  FROM 
    public.event_participants ep
  WHERE 
    ep.event_id = event_id_param
  ORDER BY 
    ep.created_at DESC;
END;
$$;

-- Donner les permissions d'exécution à tous les utilisateurs authentifiés
GRANT EXECUTE ON FUNCTION public.get_event_participants(UUID) TO authenticated;
