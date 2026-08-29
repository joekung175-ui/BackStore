-- Run this entire file after checkout-features.sql.
-- Allows only the owner account to create, edit, and view coupons in the back office.
alter table public.coupons enable row level security;
drop policy if exists "owner manages coupons" on public.coupons;
create policy "owner manages coupons"
on public.coupons
for all
to authenticated
using (public.is_owner())
with check (public.is_owner());
