DO $$
DECLARE
  -- REMPLACEZ ICI: l'UUID du profil existant (public.profiles.id)
  v_profile_id uuid := '00000000-0000-0000-0000-000000000000';

  -- Adaptez ces noms si vos produits ont d’autres libellés dans membership_products.name
  v_child_names text[] := ARRAY['kiddies','child','kids','enfant','kiddie'];

  v_prod_child int;

  v_now timestamptz := now();
  v_end timestamptz := (now() + interval '1 month');

  v_child_sub_id uuid;

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

  -- Résoudre les product_id depuis membership_products
  SELECT id INTO v_prod_child
  FROM public.membership_products
  WHERE lower(name) = ANY (SELECT lower(n) FROM unnest(v_child_names) AS n)
  LIMIT 1;

  IF v_prod_child IS NULL THEN
    RAISE EXCEPTION 'Produit KIDDIES introuvable dans membership_products.name (essayé: %)', array_to_string(v_child_names, ', ');
  END IF;

  -- 1) Kiddies (is_child = true): upsert
  SELECT id INTO v_child_sub_id
  FROM public.subscriptions
  WHERE user_id = v_profile_id AND is_child = true
  LIMIT 1;

  IF v_child_sub_id IS NULL THEN
    INSERT INTO public.subscriptions (user_id, product_id, status, start_date, end_date, is_recurring, metadata, is_child, created_at, updated_at)
    VALUES (v_profile_id, v_prod_child, 'active', v_now, v_end, true, jsonb_build_object('label','kiddies'), true, v_now, v_now)
    RETURNING id INTO v_child_sub_id;
  ELSE
    UPDATE public.subscriptions
    SET product_id = v_prod_child,
        status = 'active',
        start_date = v_now,
        end_date = v_end,
        is_recurring = true,
        metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object('label','kiddies'),
        updated_at = v_now
    WHERE id = v_child_sub_id;
  END IF;

    


  -- 3) membership_cards pour les 2 subs (créer si non existantes pour chaque subscription_id)
  -- Kiddies
  IF NOT EXISTS (
    SELECT 1 FROM public.membership_cards WHERE subscription_id = v_child_sub_id
  ) THEN
    INSERT INTO public.membership_cards (
      card_identifier, qr_code, holder_full_name, holder_city,
      owner_user_id, subscription_id, product_id, status,
      issued_at, card_expiry_date, qr_data, qr_version, created_at
    ) VALUES (
      'KID-' || substr(v_profile_id::text,1,8) || '-' || substr(v_child_sub_id::text,1,6),
      'QR-'  || substr(v_child_sub_id::text,1,12),
      COALESCE(v_holder_full_name, 'Client'),
      v_holder_city,
      v_profile_id, v_child_sub_id, v_prod_child, 'active',
      v_now, v_end,
      jsonb_build_object(
        'type','child',
        'user_id', v_profile_id::text,
        'subscription_id', v_child_sub_id::text
      ),
      1, v_now
    );
  END IF;


  -- 4) payments (historique “completed”) – ignorer si doublons par référence
  IF NOT EXISTS (SELECT 1 FROM public.payments WHERE user_id = v_profile_id AND payment_reference = ('KIDDIES-'||v_child_sub_id::text)) THEN
    INSERT INTO public.payments (user_id, subscription_id, amount, currency, status, payment_method, payment_reference, metadata, created_at, updated_at)
    VALUES (v_profile_id, v_child_sub_id, 25000, 'XOF', 'completed', 'orange_money', 'KIDDIES-'||v_child_sub_id::text, jsonb_build_object('label','kiddies'), v_now, v_now);
  END IF;

  RAISE NOTICE 'OK: Kiddies créés/mis à jour pour user_id=%', v_profile_id;
END $$;