DO $$
DECLARE
  -- REMPLACEZ ICI: l'UUID du profil existant (public.profiles.id)
  v_profile_id uuid := '8d456e51-5286-42b7-94df-c80e920358c1';

  v_elite_names text[] := ARRAY['elite','adult elite','elite adulte','adult_elite'];

  v_prod_elite int;

  v_now timestamptz := now();
  v_end timestamptz := (now() + interval '1 month');

 
  v_adult_sub_id uuid;

  v_holder_full_name text;
  v_holder_city text;
BEGIN
  -- Vérifier que le profil existe
  PERFORM 1 FROM public.profiles WHERE id = v_profile_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profil introuvable pour id=%', v_profile_id;
  END IF;

  -- Récupérer infos pour la carte
  SELECT full_name, city INTO v_holder_full_name, v_holder_city
  FROM public.profiles WHERE id = v_profile_id;



  SELECT id INTO v_prod_elite
  FROM public.membership_products
  WHERE lower(name) = ANY (SELECT lower(n) FROM unnest(v_elite_names) AS n)
  LIMIT 1;

  IF v_prod_elite IS NULL THEN
    RAISE EXCEPTION 'Produit ADULTE ELITE introuvable dans membership_products.name (essayé: %)', array_to_string(v_elite_names, ', ');
  END IF;


  -- 2) Adulte Premium (is_child = false): forcer Premium et désactiver autres variantes adultes si existantes
  SELECT id INTO v_adult_sub_id
  FROM public.subscriptions
  WHERE user_id = v_profile_id AND is_child = false
  LIMIT 1;

  IF v_adult_sub_id IS NULL THEN
    INSERT INTO public.subscriptions (user_id, product_id, status, start_date, end_date, is_recurring, metadata, is_child, created_at, updated_at)
    VALUES (v_profile_id, v_prod_elite, 'active', v_now, v_end, true, jsonb_build_object('tier','elite'), false, v_now, v_now)
    RETURNING id INTO v_adult_sub_id;
  ELSE
    UPDATE public.subscriptions
    SET product_id = v_prod_elite,
        status = 'active',
        start_date = v_now,
        end_date = v_end,
        is_recurring = true,
        metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object('tier','elite'),
        updated_at = v_now
    WHERE id = v_adult_sub_id;

    -- S’il y avait d’autres abonnements adultes (théorique), on les annule
    UPDATE public.subscriptions
    SET status = 'cancelled', updated_at = v_now
    WHERE user_id = v_profile_id AND is_child = false AND id <> v_adult_sub_id;
  END IF;

 

  -- Adulte Premium
  IF NOT EXISTS (
    SELECT 1 FROM public.membership_cards WHERE subscription_id = v_adult_sub_id
  ) THEN
    INSERT INTO public.membership_cards (
      card_identifier, qr_code, holder_full_name, holder_city,
      owner_user_id, subscription_id, product_id, status,
      issued_at, card_expiry_date, qr_data, qr_version, created_at
    ) VALUES (
      'ML25-' || substr(v_profile_id::text,1,9) || '-' || '01',
      'QR-'  || substr(v_adult_sub_id::text,1,12),
      COALESCE(v_holder_full_name, 'Client'),
      v_holder_city,
      v_profile_id, v_adult_sub_id, v_prod_elite, 'active',
      v_now, v_end,
      jsonb_build_object(
        'type','adult',
        'tier','elite',
        'user_id', v_profile_id::text,
        'subscription_id', v_adult_sub_id::text
      ),
      1, v_now
    );
  END IF;

  

  IF NOT EXISTS (SELECT 1 FROM public.payments WHERE user_id = v_profile_id AND payment_reference = ('ELITE-'||v_adult_sub_id::text)) THEN
    INSERT INTO public.payments (user_id, subscription_id, amount, currency, status, payment_method, payment_reference, metadata, created_at, updated_at)
    VALUES (v_profile_id, v_adult_sub_id, 15000, 'XOF', 'completed', 'orange_money', 'ELITE-'||v_adult_sub_id::text, jsonb_build_object('tier','elite'), v_now, v_now);
  END IF;

  RAISE NOTICE ' Adult Elite créés/mis à jour pour user_id=%', v_profile_id;
END $$;