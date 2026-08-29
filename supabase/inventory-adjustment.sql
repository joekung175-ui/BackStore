-- Run once in Supabase SQL Editor to enable the stock adjustment form for the owner.
create or replace function public.adjust_inventory(p_product_id uuid, p_quantity integer, p_reason text, p_idempotency_key uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_owner() then raise exception 'forbidden'; end if;
  if p_quantity = 0 or length(trim(coalesce(p_reason, ''))) = 0 then raise exception 'invalid adjustment'; end if;
  if exists(select 1 from public.inventory_movements where idempotency_key = p_idempotency_key) then return; end if;
  update public.products
  set total_stock = total_stock + p_quantity
  where id = p_product_id and total_stock + p_quantity >= reserved_stock;
  if not found then raise exception 'cannot reduce stock below reserved quantity'; end if;
  insert into public.inventory_movements(product_id, quantity_change, movement_type, reason, idempotency_key, created_by)
  values (p_product_id, p_quantity, 'adjustment', trim(p_reason), p_idempotency_key, auth.uid());
end $$;
grant execute on function public.adjust_inventory(uuid,integer,text,uuid) to authenticated;
