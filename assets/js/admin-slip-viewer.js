import { supabase } from './supabase.js';

let currentOrderId = null;
async function addViewer() {
  const modal = document.querySelector('#order-modal.show');
  const orderId = modal?.querySelector('[name="order_id"]')?.value;
  const host = modal?.querySelector('#payment-actions');
  if (!modal || !orderId || !host || currentOrderId === orderId || host.querySelector('.view-slip')) return;
  currentOrderId = orderId;
  const { data: slips, error } = await supabase.from('payment_slips').select('storage_path').eq('order_id', orderId).is('deleted_at', null).order('created_at', { ascending: false }).limit(1);
  if (error || !slips?.[0]?.storage_path) return;
  const { data } = await supabase.storage.from('payment-slips').createSignedUrl(slips[0].storage_path, 300);
  if (!data?.signedUrl || !document.querySelector('#order-modal.show')?.querySelector('#payment-actions')) return;
  const link = document.createElement('a');
  link.className = 'btn btn-outline-primary btn-sm mt-2 view-slip'; link.target = '_blank'; link.rel = 'noopener'; link.href = data.signedUrl;
  link.innerHTML = '<i class="bi bi-image"></i> ดูสลิป';
  document.querySelector('#order-modal.show #payment-actions')?.append(link);
}

if (document.body.dataset.page === 'admin-orders') { const observer = new MutationObserver(() => { addViewer().catch(() => {}); }); observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] }); }
