-- Run this entire file after customer-auth.sql.
create or replace function public.my_order_detail(p_order_number text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare result jsonb;
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;
  select jsonb_build_object(
    'order_number', o.order_number, 'status', o.status, 'payment_status', o.payment_status,
    'total_satang', o.total_satang, 'created_at', o.created_at,
    'carrier', s.carrier, 'tracking_number', s.tracking_number,
    'slip_uploaded', exists(select 1 from payment_slips ps where ps.order_id=o.id and ps.deleted_at is null),
    'slip_path', (select ps.storage_path from payment_slips ps where ps.order_id=o.id and ps.deleted_at is null order by ps.created_at desc limit 1),
    'items', coalesce((select jsonb_agg(jsonb_build_object('name',oi.product_name,'sku',oi.sku,'quantity',oi.quantity,'total_satang',oi.line_total_satang) order by oi.created_at) from order_items oi where oi.order_id=o.id and oi.deleted_at is null), '[]'::jsonb),
    'timeline', coalesce((select jsonb_agg(jsonb_build_object('status',h.status,'note',h.note,'created_at',h.created_at) order by h.created_at) from order_status_history h where h.order_id=o.id and h.deleted_at is null), '[]'::jsonb)
  ) into result
  from orders o join customers c on c.id=o.customer_id
  left join shipping s on s.order_id=o.id and s.deleted_at is null
  where o.order_number=p_order_number and c.user_id=auth.uid() and o.deleted_at is null;
  if result is null then raise exception 'order not found'; end if;
  return result;
end $$;
grant execute on function public.my_order_detail(text) to authenticated;
