import { supabase } from './supabase.js';
import { escapeHtml } from './utils.js';

const typeLabel = { reserve: 'จองสินค้า', release: 'คืนสินค้าจากออเดอร์', deduct: 'ตัดสต็อกหลังชำระเงิน', adjustment: 'ปรับสต็อก' };

if (document.body.dataset.page === 'admin-inventory' && supabase) {
  let mounted = false;
  const mount = async () => {
    const host = document.querySelector('#admin-content');
    if (!host || mounted || !host.querySelector('.inventory-table')) return;
    mounted = true;
    try {
      const { data, error } = await supabase.from('inventory_movements')
        .select('quantity_change,movement_type,reason,created_at,products(name,sku)')
        .is('deleted_at', null).order('created_at', { ascending: false }).limit(12);
      if (error) throw error;
      const panel = document.createElement('section');
      panel.className = 'card border-0 shadow-sm mt-4';
      panel.innerHTML = `<div class="card-body"><div class="d-flex justify-content-between align-items-center mb-3"><div><h2 class="h5 mb-1">ประวัติการเคลื่อนไหวสต็อก</h2><p class="small text-secondary mb-0">แสดง 12 รายการล่าสุด</p></div><i class="bi bi-clock-history fs-4 text-success"></i></div><div class="table-responsive"><table class="table align-middle"><thead><tr><th>เวลา</th><th>สินค้า</th><th>รายการ</th><th>เหตุผล</th><th class="text-end">จำนวน</th></tr></thead><tbody>${data?.length ? data.map(item => `<tr><td><small>${new Intl.DateTimeFormat('th-TH', { dateStyle:'short', timeStyle:'short' }).format(new Date(item.created_at))}</small></td><td><strong>${escapeHtml(item.products?.name || '-')}</strong><small class="d-block text-secondary">${escapeHtml(item.products?.sku || '')}</small></td><td>${escapeHtml(typeLabel[item.movement_type] || item.movement_type)}</td><td>${escapeHtml(item.reason)}</td><td class="text-end fw-bold ${item.quantity_change > 0 ? 'text-success' : 'text-danger'}">${item.quantity_change > 0 ? '+' : ''}${item.quantity_change}</td></tr>`).join('') : '<tr><td colspan="5" class="text-center text-secondary py-4">ยังไม่มีประวัติการเคลื่อนไหว</td></tr>'}</tbody></table></div></div>`;
      host.append(panel);
    } catch (_) { mounted = false; }
  };
  new MutationObserver(mount).observe(document.documentElement, { childList:true, subtree:true });
  mount();
}
