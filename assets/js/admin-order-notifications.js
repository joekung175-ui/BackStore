import { supabase } from './supabase.js';
import { toast } from './utils.js';

if (document.body.dataset.page?.startsWith('admin-') && supabase) {
  const mount = async () => {
    const header = document.querySelector('.admin-header'); if (!header || header.querySelector('#admin-order-bell')) return;
    const bell=document.createElement('a'); bell.id='admin-order-bell'; bell.className='btn btn-outline-primary btn-sm me-2'; bell.href='orders.html'; bell.innerHTML='<i class="bi bi-bell"></i> ออเดอร์ใหม่ <span class="badge text-bg-danger" id="admin-order-count">0</span>'; header.querySelector('.badge')?.before(bell);
    const refresh = async () => { const { count } = await supabase.from('orders').select('*',{count:'exact',head:true}).is('deleted_at',null).eq('status','pending_payment'); const countNode=document.querySelector('#admin-order-count'); if(countNode)countNode.textContent=count||0; };
    await refresh(); supabase.channel('admin-new-order-alerts').on('postgres_changes',{event:'INSERT',schema:'public',table:'orders'},payload=>{toast(`มีคำสั่งซื้อใหม่ ${payload.new.order_number}`,'success');refresh();}).subscribe();
  };
  new MutationObserver(()=>mount()).observe(document.documentElement,{childList:true,subtree:true}); mount();
}
