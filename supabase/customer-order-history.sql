-- Run this entire file in Supabase SQL Editor.
-- Customers can view only order summaries that match the phone number entered.
create or replace function public.customer_order_history(p_phone text)
returns table (
  order_number text,
  status public.order_status,
  payment_status public.payment_status,
  total_satang integer,
  created_at timestamptz,
  carrier text,
  tracking_number text
)
language sql
security definer
set search_path = public
as $$
  select o.order_number, o.status, o.payment_status, o.total_satang, o.created_at,
         s.carrier, s.tracking_number
  from public.orders o
  join public.customers c on c.id = o.customer_id
  left join public.shipping s on s.order_id = o.id and s.deleted_at is null
  where c.phone = trim(p_phone)
    and o.deleted_at is null
  order by o.created_at desc;
$$;

grant execute on function public.customer_order_history(text) to anon, authenticated;
