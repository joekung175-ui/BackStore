-- Run this entire file in Supabase SQL Editor once.
-- Replace the placeholder below with the email used to log in to /admin/login.html.

update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', 'owner')
where lower(email) = lower('narinyusoh22@gmail.com');

-- Recreate the owner check used by every back-office action.
create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() is not null
    and exists (
      select 1
      from auth.users
      where id = auth.uid()
        and raw_app_meta_data ->> 'role' = 'owner'
    )
$$;

grant execute on function public.is_owner() to authenticated;

-- Verify that the account was assigned correctly.
-- The SQL Editor itself has no browser session, so do not use public.is_owner() here.
select email, raw_app_meta_data ->> 'role' as role
from auth.users
where lower(email) = lower('PUT_YOUR_ADMIN_EMAIL_HERE');
