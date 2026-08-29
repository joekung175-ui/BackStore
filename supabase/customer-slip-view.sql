-- Run once after policies.sql. It lets a signed-in customer view only a slip in their own order folder.
drop policy if exists "customer reads own payment slip" on storage.objects;
create policy "customer reads own payment slip"
on storage.objects for select to authenticated
using (
  bucket_id = 'payment-slips'
  and exists (
    select 1 from public.orders o
    join public.customers c on c.id = o.customer_id
    where c.user_id = auth.uid()
      and o.tracking_token::text = (storage.foldername(name))[1]
      and o.deleted_at is null
  )
);
