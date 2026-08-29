-- Run this entire file in Supabase SQL Editor after customer-auth.sql.
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_type text not null check (discount_type in ('percent','fixed')),
  discount_value integer not null check (discount_value > 0),
  min_order_satang integer not null default 0 check (min_order_satang >= 0),
  max_uses integer,
  used_count integer not null default 0 check (used_count >= 0),
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
insert into public.coupons(code,discount_type,discount_value,min_order_satang,max_uses) values ('WELCOME10','percent',10,0,1000) on conflict(code) do nothing;

create or replace function public.coupon_discount(p_code text, p_subtotal_satang integer)
returns integer language plpgsql security definer set search_path = public as $$
declare c public.coupons%rowtype; v_discount integer;
begin
 select * into c from public.coupons where code=upper(trim(p_code)) and is_active and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at >= now()) and (max_uses is null or used_count < max_uses) for update;
 if c.id is null then raise exception 'ไม่พบโค้ดส่วนลด หรือโค้ดหมดอายุแล้ว'; end if;
 if p_subtotal_satang < c.min_order_satang then raise exception 'ยอดสั่งซื้อยังไม่ถึงขั้นต่ำสำหรับโค้ดนี้'; end if;
 v_discount := case when c.discount_type='percent' then floor(p_subtotal_satang * c.discount_value / 100.0)::integer else c.discount_value end;
 return least(v_discount, p_subtotal_satang);
end $$;

create or replace function public.validate_coupon(p_code text, p_subtotal_satang integer)
returns table(code text, discount_satang integer) language plpgsql security definer set search_path = public as $$
begin return query select upper(trim(p_code)), public.coupon_discount(p_code,p_subtotal_satang); end $$;

create or replace function public.my_customer_profile()
returns table(full_name text, phone text, address jsonb) language sql security definer set search_path = public as $$
 select c.full_name,c.phone,c.address from public.customers c where c.user_id=auth.uid() and c.deleted_at is null order by c.updated_at desc limit 1;
$$;

create or replace function public.create_order_with_coupon(p_customer jsonb, p_items jsonb, p_payment_method text, p_idempotency_key uuid, p_coupon_code text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_customer uuid; v_order uuid; v_item jsonb; v_product public.products%rowtype; v_subtotal integer := 0; v_shipping integer; v_discount integer := 0; v_number text; v_settings public.store_settings%rowtype; v_user uuid := auth.uid();
begin
 if exists(select 1 from orders where idempotency_key=p_idempotency_key) then return (select jsonb_build_object('order_number',order_number,'tracking_token',tracking_token,'total_satang',total_satang) from orders where idempotency_key=p_idempotency_key); end if;
 select * into v_settings from store_settings where is_published and deleted_at is null limit 1; if v_settings.id is null or jsonb_array_length(p_items)=0 then raise exception 'invalid order'; end if;
 if v_user is not null then select id into v_customer from customers where user_id=v_user and deleted_at is null order by created_at limit 1; end if;
 if v_customer is null then insert into customers(full_name,phone,email,address,user_id) values(p_customer->>'name',p_customer->>'phone',nullif(p_customer->>'email',''),jsonb_build_object('address',p_customer->>'address','subdistrict',p_customer->>'subdistrict','district',p_customer->>'district','province',p_customer->>'province','postal_code',p_customer->>'postal_code'),v_user) returning id into v_customer; else update customers set full_name=p_customer->>'name',phone=p_customer->>'phone',email=nullif(p_customer->>'email',''),address=jsonb_build_object('address',p_customer->>'address','subdistrict',p_customer->>'subdistrict','district',p_customer->>'district','province',p_customer->>'province','postal_code',p_customer->>'postal_code') where id=v_customer; end if;
 for v_item in select * from jsonb_array_elements(p_items) loop select * into v_product from products where id=(v_item->>'product_id')::uuid and is_active and deleted_at is null for update; if v_product.id is null or v_product.available_stock < (v_item->>'quantity')::int then raise exception 'insufficient stock'; end if; v_subtotal:=v_subtotal+v_product.price_satang*(v_item->>'quantity')::int; end loop;
 v_discount:=public.coupon_discount(p_coupon_code,v_subtotal); update public.coupons set used_count=used_count+1 where code=upper(trim(p_coupon_code));
 v_shipping:=case when v_subtotal-v_discount >= v_settings.free_shipping_min_satang then 0 else v_settings.shipping_fee_satang end; v_number:='ORD-'||to_char(now(),'YYYYMMDD')||'-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,6));
 insert into orders(order_number,customer_id,subtotal_satang,discount_satang,shipping_satang,total_satang,payment_method,idempotency_key,customer_note) values(v_number,v_customer,v_subtotal,v_discount,v_shipping,v_subtotal-v_discount+v_shipping,p_payment_method,p_idempotency_key,p_customer->>'note') returning id into v_order;
 for v_item in select * from jsonb_array_elements(p_items) loop select * into v_product from products where id=(v_item->>'product_id')::uuid for update; update products set reserved_stock=reserved_stock+(v_item->>'quantity')::int where id=v_product.id; insert into order_items(order_id,product_id,product_name,sku,quantity,unit_price_satang,unit_cost_satang,line_total_satang) values(v_order,v_product.id,v_product.name,v_product.sku,(v_item->>'quantity')::int,v_product.price_satang,v_product.cost_satang,v_product.price_satang*(v_item->>'quantity')::int); insert into inventory_movements(product_id,order_id,quantity_change,movement_type,reason,idempotency_key) values(v_product.id,v_order,-(v_item->>'quantity')::int,'reserve','จองสินค้า',gen_random_uuid()); end loop;
 insert into payments(order_id,method,amount_satang) values(v_order,p_payment_method,v_subtotal-v_discount+v_shipping); insert into order_status_history(order_id,status,note) values(v_order,'pending_payment','สร้างคำสั่งซื้อ'); insert into notifications(type,title,order_id) values('new_order','มีคำสั่งซื้อใหม่',v_order); return jsonb_build_object('order_number',v_number,'tracking_token',(select tracking_token from orders where id=v_order),'total_satang',v_subtotal-v_discount+v_shipping);
end $$;

grant execute on function public.validate_coupon(text,integer), public.create_order_with_coupon(jsonb,jsonb,text,uuid,text), public.my_customer_profile() to anon, authenticated;
