-- Run this entire file in Supabase SQL Editor after schema.sql and policies.sql.
-- It links new orders to the currently signed-in customer account.
alter table public.customers add column if not exists user_id uuid references auth.users(id) on delete set null;
create index if not exists customers_user_id_idx on public.customers(user_id) where user_id is not null;

create or replace function public.create_order(p_customer jsonb, p_items jsonb, p_payment_method text, p_idempotency_key uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_customer uuid; v_order uuid; v_item jsonb; v_product public.products%rowtype; v_subtotal integer := 0; v_shipping integer; v_number text; v_settings public.store_settings%rowtype; v_user uuid := auth.uid();
begin
 if exists(select 1 from orders where idempotency_key = p_idempotency_key) then return (select jsonb_build_object('order_number',order_number,'tracking_token',tracking_token) from orders where idempotency_key=p_idempotency_key); end if;
 select * into v_settings from store_settings where is_published and deleted_at is null limit 1; if v_settings.id is null or jsonb_array_length(p_items)=0 then raise exception 'invalid order'; end if;
 if v_user is not null then select id into v_customer from customers where user_id=v_user and deleted_at is null order by created_at limit 1; end if;
 if v_customer is null then
   insert into customers(full_name,phone,email,address,user_id) values (p_customer->>'name',p_customer->>'phone',nullif(p_customer->>'email',''),jsonb_build_object('address',p_customer->>'address','subdistrict',p_customer->>'subdistrict','district',p_customer->>'district','province',p_customer->>'province','postal_code',p_customer->>'postal_code'),v_user) returning id into v_customer;
 else
   update customers set full_name=p_customer->>'name',phone=p_customer->>'phone',email=nullif(p_customer->>'email',''),address=jsonb_build_object('address',p_customer->>'address','subdistrict',p_customer->>'subdistrict','district',p_customer->>'district','province',p_customer->>'province','postal_code',p_customer->>'postal_code') where id=v_customer;
 end if;
 for v_item in select * from jsonb_array_elements(p_items) loop select * into v_product from products where id=(v_item->>'product_id')::uuid and is_active and deleted_at is null for update; if v_product.id is null or v_product.available_stock < (v_item->>'quantity')::int then raise exception 'insufficient stock'; end if; v_subtotal := v_subtotal + v_product.price_satang*(v_item->>'quantity')::int; end loop;
 v_shipping := case when v_subtotal >= v_settings.free_shipping_min_satang then 0 else v_settings.shipping_fee_satang end; v_number := 'ORD-'||to_char(now(),'YYYYMMDD')||'-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,6));
 insert into orders(order_number,customer_id,subtotal_satang,shipping_satang,total_satang,payment_method,idempotency_key,customer_note) values(v_number,v_customer,v_subtotal,v_shipping,v_subtotal+v_shipping,p_payment_method,p_idempotency_key,p_customer->>'note') returning id into v_order;
 for v_item in select * from jsonb_array_elements(p_items) loop select * into v_product from products where id=(v_item->>'product_id')::uuid for update; update products set reserved_stock=reserved_stock+(v_item->>'quantity')::int where id=v_product.id; insert into order_items(order_id,product_id,product_name,sku,quantity,unit_price_satang,unit_cost_satang,line_total_satang) values(v_order,v_product.id,v_product.name,v_product.sku,(v_item->>'quantity')::int,v_product.price_satang,v_product.cost_satang,v_product.price_satang*(v_item->>'quantity')::int); insert into inventory_movements(product_id,order_id,quantity_change,movement_type,reason,idempotency_key) values(v_product.id,v_order,-(v_item->>'quantity')::int,'reserve','จองสินค้า',gen_random_uuid()); end loop;
 insert into payments(order_id,method,amount_satang) values(v_order,p_payment_method,v_subtotal+v_shipping); insert into order_status_history(order_id,status,note) values(v_order,'pending_payment','สร้างคำสั่งซื้อ'); insert into notifications(type,title,order_id) values('new_order','มีคำสั่งซื้อใหม่',v_order); return jsonb_build_object('order_number',v_number,'tracking_token',(select tracking_token from orders where id=v_order));
end $$;

create or replace function public.claim_orders_for_current_user()
returns integer language plpgsql security definer set search_path = public as $$
declare changed_count integer;
begin
 if auth.uid() is null then return 0; end if;
 update public.customers set user_id=auth.uid()
 where user_id is null
   and lower(coalesce(email,'')) = lower(coalesce(auth.jwt() ->> 'email',''));
 get diagnostics changed_count = row_count;
 return changed_count;
end $$;

create or replace function public.my_order_history()
returns table(order_number text,status public.order_status,payment_status public.payment_status,total_satang integer,created_at timestamptz,carrier text,tracking_number text)
language plpgsql security definer set search_path = public as $$
begin
 if auth.uid() is null then raise exception 'authentication required'; end if;
 perform public.claim_orders_for_current_user();
 return query
 select o.order_number,o.status,o.payment_status,o.total_satang,o.created_at,s.carrier,s.tracking_number
 from public.orders o join public.customers c on c.id=o.customer_id
 left join public.shipping s on s.order_id=o.id and s.deleted_at is null
 where c.user_id=auth.uid() and o.deleted_at is null
 order by o.created_at desc;
end $$;

grant execute on function public.claim_orders_for_current_user(), public.my_order_history() to authenticated;
