-- =====================================================
-- CREATE EVENT PARTICIPATION FUNCTION
-- =====================================================

-- Create or replace the function to handle event participation with proper permissions
CREATE OR REPLACE FUNCTION public.create_event_participation(
  p_event_id UUID,
  p_user_id UUID,
  p_full_name TEXT,
  p_email TEXT,
  p_phone TEXT,
  p_motivation TEXT,
  p_additional_info TEXT,
  p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS JSONB AS $$
DECLARE
  v_participation_id UUID;
  v_event_record RECORD;
BEGIN
  -- Vérifier si l'événement existe et est actif
  SELECT * INTO v_event_record FROM events WHERE id = p_event_id AND is_active = true;
  
  IF v_event_record IS NULL THEN
    RETURN '{"success":false,"error":"Événement non trouvé ou inactif"}'::jsonb;
  END IF;
  
  -- Vérifier la date limite d'inscription si elle existe
  IF v_event_record.registration_deadline IS NOT NULL AND v_event_record.registration_deadline < NOW() THEN
    RETURN '{"success":false,"error":"Les inscriptions pour cet événement sont closes"}'::jsonb;
  END IF;
  
  -- Vérifier s'il reste de la place
  IF v_event_record.max_participants IS NOT NULL AND 
     v_event_record.participant_count >= v_event_record.max_participants THEN
    RETURN '{"success":false,"error":"Plus de places disponibles pour cet événement"}'::jsonb;
  END IF;
  
  -- Insérer la participation
  INSERT INTO event_participants (
    event_id, 
    user_id, 
    full_name, 
    email,
    phone, 
    motivation,
    additional_info,
    metadata,
    status
  ) VALUES (
    p_event_id,
    p_user_id,
    p_full_name,
    p_email,
    p_phone,
    p_motivation,
    p_additional_info,
    p_metadata,
    'pending'
  ) RETURNING id INTO v_participation_id;
  
  -- Update participant count
  UPDATE events 
  SET participant_count = COALESCE(participant_count, 0) + 1
  WHERE id = p_event_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'participation_id', v_participation_id
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN '{"success":false,"code":500}'::jsonb;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_event_participation(
  UUID,   -- p_event_id
  UUID,   -- p_user_id
  TEXT,   -- p_full_name
  TEXT,   -- p_email
  TEXT,   -- p_phone
  TEXT,   -- p_motivation
  TEXT,   -- p_additional_info
  JSONB   -- p_metadata
) TO authenticated;
