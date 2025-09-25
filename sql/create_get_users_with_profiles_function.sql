-- Create or replace the function to get users with their profiles
create or replace function public.get_users_with_profiles()
returns table (
  id uuid,
  email text,
  full_name text,
  role text,
  created_at timestamptz,
  updated_at timestamptz,
  is_active boolean,
  last_sign_in_at timestamptz
) 
language plpgsql
security definer
as $$
begin
  return query
  select 
    p.id,
    u.email::text,
    p.full_name,
    p.role,
    u.created_at,
    p.updated_at,
    (u.last_sign_in_at is not null) as is_active,
    u.last_sign_in_at
  from 
    auth.users u
  left join 
    profiles p on u.id = p.id
  order by 
    u.created_at desc;
end;
$$;

-- Grant execute permission to authenticated users
do $$
begin
  if not exists (
    select 1 from pg_proc 
    where proname = 'get_users_with_profiles' 
    and pronamespace = 'public'::regnamespace
  ) then
    execute 'grant execute on function public.get_users_with_profiles() to authenticated';
  end if;
  
  -- Only create the policies if they don't exist
  if not exists (
    select 1 from pg_policies 
    where tablename = 'profiles' 
    and policyname = 'Users can view their own profile'
  ) then
    execute 'create policy "Users can view their own profile"
      on public.profiles
      for select
      to authenticated
      using (auth.uid() = id);';
  end if;
  
  if not exists (
    select 1 from pg_policies 
    where tablename = 'profiles' 
    and policyname = 'Admins can view all profiles'
  ) then
    execute 'create policy "Admins can view all profiles"
      on public.profiles
      for select
      to authenticated
      using (
        exists (
          select 1 from auth.users
          where auth.uid() = id and (
            raw_user_meta_data->>''role'' = ''ADMIN'' or 
            raw_user_meta_data->>''role'' = ''SUPERADMIN'' or
            raw_user_meta_data->>''role'' = ''SUPPORT''
          )
        )
      );';
  end if;
end $$;
