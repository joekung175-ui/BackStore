import { supabase } from './supabase.js';
import { qs, setLoading, toast } from './utils.js';

const moneyToSatang = value => Math.round(Number(value || 0) * 100);

if (document.body.dataset.page === 'admin-products' && supabase && document.body.dataset.backofficeRole !== 'staff') {
  const mountList = async () => {
    const table = document.querySelector('.admin-table'); if (!table || table.dataset.editReady) return;
    const { data, error } = await supabase.from('products').select('id,sku,is_active').is('deleted_at',null); if (error) return;
    const bySku = new Map(data.map(product => [product.sku, product])); const header=table.querySelector('thead tr'); const body=table.querySelector('tbody'); if (!header || !body) return;
    const th=document.createElement('th'); th.textContent='จัดการ'; header.append(th);
    [...body.rows].forEach(row => { const sku=row.cells[1]?.textContent.trim(); const product=bySku.get(sku); if(!product) return; const cell=row.insertCell(); cell.className='text-end text-nowrap'; cell.innerHTML=`<a class="btn btn-outline-primary btn-sm" href="product-form.html?id=${encodeURIComponent(product.id)}"><i class="bi bi-pencil-square"></i> แก้ไข</a> <button class="btn btn-outline-${product.is_active ? 'secondary' : 'success'} btn-sm product-toggle" data-id="${product.id}" data-active="${product.is_active}">${product.is_active ? 'ปิดขาย' : 'เปิดขาย'}</button>`; });
    body.addEventListener('click', async event => { const button=event.target.closest('.product-toggle'); if(!button) return; const willBeActive=button.dataset.active !== 'true'; if(!confirm(`${willBeActive ? 'เปิดขาย' : 'ปิดขาย'}สินค้านี้หรือไม่?`)) return; try { setLoading(button,true); const { error:updateError }=await supabase.from('products').update({is_active:willBeActive}).eq('id',button.dataset.id); if(updateError) throw updateError; toast(willBeActive ? 'เปิดขายสินค้าแล้ว' : 'ปิดขายสินค้าแล้ว'); location.reload(); } catch(error) { toast(error.message,'danger'); } finally { setLoading(button,false); } }); table.dataset.editReady='true';
  };
  new MutationObserver(()=>mountList()).observe(document.documentElement,{childList:true,subtree:true}); mountList();
}

if (document.body.dataset.page === 'admin-product-form' && supabase) {
  const editId = new URLSearchParams(location.search).get('id');
  if (editId) {
    const mountEdit = async () => {
      const form=document.querySelector('#product-create-form'); if(!form || form.dataset.editReady) return;
      const { data: product, error }=await supabase.from('products').select('*, product_images(id,url,storage_path,sort_order)').eq('id',editId).single(); if(error){toast(error.message,'danger');return;}
      form.dataset.editReady='true'; document.querySelector('.admin-header h1').textContent='แก้ไขสินค้า'; form.querySelector('h2').textContent='แก้ไขข้อมูลสินค้า';
      form.name.value=product.name; form.sku.value=product.sku; form.category_id.value=product.category_id; window.setTimeout(()=>{form.category_id.value=product.category_id;},0); form.price.value=(product.price_satang/100).toFixed(2); form.cost.value=(product.cost_satang/100).toFixed(2); form.compare_at.value=product.compare_at_satang ? (product.compare_at_satang/100).toFixed(2):''; form.stock.value=product.total_stock; form.low_stock_threshold.value=product.low_stock_threshold; form.description.value=product.description||''; form.featured.checked=product.is_featured; form.best.checked=product.is_best_seller; form.image_url.value=product.product_images?.[0]?.url||'';
      form.addEventListener('submit',async event=>{event.preventDefault();event.stopImmediatePropagation();const button=qs('[type="submit"]',form),raw=Object.fromEntries(new FormData(form)),compare=raw.compare_at===''?null:moneyToSatang(raw.compare_at);if(compare!==null&&compare<moneyToSatang(raw.price)){toast('ราคาเดิมต้องมากกว่าหรือเท่ากับราคาขาย','danger');return;}try{setLoading(button,true);const {error:updateError}=await supabase.from('products').update({category_id:raw.category_id,name:raw.name.trim(),sku:raw.sku.trim().toUpperCase(),description:raw.description.trim()||null,price_satang:moneyToSatang(raw.price),cost_satang:moneyToSatang(raw.cost),compare_at_satang:compare,total_stock:Number(raw.stock),low_stock_threshold:Number(raw.low_stock_threshold),is_featured:form.featured.checked,is_best_seller:form.best.checked}).eq('id',editId);if(updateError)throw updateError;const image=product.product_images?.[0];if(raw.image_url.trim()){const payload={url:raw.image_url.trim(),alt_text:raw.name.trim(),storage_path:image?.storage_path||`external-admin/${editId}.jpg`,sort_order:0};const result=image?await supabase.from('product_images').update(payload).eq('id',image.id):await supabase.from('product_images').insert({product_id:editId,...payload});if(result.error)throw result.error;}toast('บันทึกการแก้ไขสินค้าแล้ว');location.assign('products.html');}catch(err){toast(err.message,'danger')}finally{setLoading(button,false)}},true);
    };
    new MutationObserver(()=>mountEdit()).observe(document.documentElement,{childList:true,subtree:true}); mountEdit();
  }
}
