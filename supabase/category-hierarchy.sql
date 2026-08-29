-- Run this entire file after main-categories.sql.
-- Creates main categories and subcategories, then moves the old black-tea products into Chinese tea.
alter table public.categories add column if not exists parent_id uuid references public.categories(id) on delete restrict;
create index if not exists categories_parent_id_idx on public.categories(parent_id);

insert into public.categories(name,slug,is_active) values
  ('เครื่องดื่ม','beverages',true),
  ('ผลิตภัณฑ์','products',true)
on conflict (name) do update set is_active=true, deleted_at=null;

insert into public.categories(name,slug,parent_id,is_active)
select item.name,item.slug,parent.id,true
from (values
  ('ชาเขียว','green-tea','เครื่องดื่ม'),
  ('ชาจีน','chinese-tea','เครื่องดื่ม'),
  ('ชาผลไม้','fruit-tea','เครื่องดื่ม'),
  ('ชาสมุนไพร','herbal-tea','เครื่องดื่ม'),
  ('ผงชาเขียว','green-tea-powder','ผลิตภัณฑ์'),
  ('ผงมัจฉะ','matcha-powder','ผลิตภัณฑ์'),
  ('ผงชาสมุนไพร','herbal-tea-powder','ผลิตภัณฑ์'),
  ('ผงชาต่างๆ','tea-powder','ผลิตภัณฑ์')
) as item(name,slug,parent_name)
join public.categories parent on parent.name=item.parent_name
on conflict (name) do update set parent_id=excluded.parent_id,is_active=true,deleted_at=null;

-- Existing green/fruit/herbal tea categories become children of เครื่องดื่ม.
update public.categories child set parent_id=parent.id,is_active=true
from public.categories parent
where parent.name='เครื่องดื่ม' and child.name in ('ชาเขียว','ชาผลไม้','ชาสมุนไพร');

-- Move all old "ชาดำ" products to "ชาจีน", then hide the old category.
update public.products p set category_id=target.id
from public.categories old_category, public.categories target
where old_category.name='ชาดำ' and target.name='ชาจีน' and p.category_id=old_category.id;
update public.categories set is_active=false where name='ชาดำ';
