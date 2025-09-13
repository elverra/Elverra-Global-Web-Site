-- Find the user ID for your email
select id from auth.users where email = 'your.email@example.com';

-- Promote that user to SUPERADMIN (or SUPPORT)
insert into public.user_roles (user_id, role)
values ('<THE-UUID-YOU-FOUND>', 'SUPERADMIN')
on conflict (user_id) do update set role = 'SUPERADMIN';

update public.user_roles set role = 'SUPPORT' where user_id = '<UUID>';a