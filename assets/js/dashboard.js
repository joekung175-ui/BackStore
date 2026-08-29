import { supabase } from './supabase.js';
import { money, escapeHtml } from './utils.js';

const dayKey = value => new Date(value).toISOString().slice(0, 10);
const metricCard = (label, value, icon, accent = '') => `<div class="col-sm-6 col-xl-3"><div class="card metric-card ${accent}"><div class="card-body"><div class="d-flex justify-content-between align-items-start"><div><p class="text-secondary mb-1">${label}</p><strong class="fs-4">${value}</strong></div><span class="metric-icon"><i class="bi bi-${icon}"></i></span></div></div></div></div>`;

async function getSummary() {
  if (!supabase) return { todaySales: 0, monthSales: 0, newOrders: 0, lowStock: 0, alerts: [] };
  const [{ data: orders, error: orderError }, { data: products, error: productError }, { data: notices, error: noticeError }] = await Promise.all([
    supabase.from('orders').select('total_satang,status,payment_status,created_at').is('deleted_at', null),
    supabase.from('products').select('available_stock,low_stock_threshold').is('deleted_at', null),
    supabase.from('notifications').select('title,body,created_at').is('deleted_at', null).eq('is_read', false).order('created_at', { ascending: false }).limit(4)
  ]);
  if (orderError || productError || noticeError) throw orderError || productError || noticeError;
  const today = new Date().toISOString().slice(0, 10);
  const month = today.slice(0, 7);
  const paidOrders = orders.filter(order => order.payment_status === 'approved');
  return {
    todaySales: paidOrders.filter(order => dayKey(order.created_at) === today).reduce((total, order) => total + order.total_satang, 0),
    monthSales: paidOrders.filter(order => dayKey(order.created_at).slice(0, 7) === month).reduce((total, order) => total + order.total_satang, 0),
    newOrders: orders.filter(order => order.status === 'pending_payment').length,
    lowStock: products.filter(product => product.available_stock <= product.low_stock_threshold).length,
    alerts: notices
  };
}

export async function setupLiveDashboard(container) {
  const render = async () => {
    container.innerHTML = '<div class="py-5 text-center"><div class="spinner-border text-success" role="status"><span class="visually-hidden">กำลังโหลด</span></div></div>';
    try {
      const summary = await getSummary();
      container.innerHTML = `<div class="d-flex justify-content-between align-items-center mb-3"><p class="mb-0 text-secondary"><span class="live-dot"></span>อัปเดตแบบเรียลไทม์</p><small class="text-secondary">อัปเดตล่าสุด ${new Intl.DateTimeFormat('th-TH', { timeStyle: 'short' }).format(new Date())}</small></div><div class="row g-3">${metricCard('ยอดขายวันนี้', money(summary.todaySales), 'cash-stack')}${metricCard('ยอดขายเดือนนี้', money(summary.monthSales), 'graph-up-arrow')}${metricCard('คำสั่งซื้อใหม่', String(summary.newOrders), 'bag-check')}${metricCard('สินค้าใกล้หมด', String(summary.lowStock), 'exclamation-triangle', 'metric-warning')}</div><div class="row g-4 mt-1"><div class="col-lg-7"><div class="card border-0 dashboard-panel"><div class="card-body"><h2 class="h5 mb-1">ศูนย์ติดตามร้านค้า</h2><p class="text-secondary small">ยอดขายและสถานะคำสั่งซื้อจะอัปเดตทันทีเมื่อมีการเปลี่ยนแปลง</p><div class="live-wave"><span></span><span></span><span></span><span></span><span></span></div></div></div></div><div class="col-lg-5"><div class="card border-0 dashboard-panel"><div class="card-body"><h2 class="h5">การแจ้งเตือนล่าสุด</h2>${summary.alerts.length ? `<ul class="live-alerts">${summary.alerts.map(item => `<li><i class="bi bi-bell-fill"></i><span><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.body || '')}</small></span></li>`).join('')}</ul>` : '<p class="text-secondary mb-0">ไม่มีรายการแจ้งเตือนใหม่</p>'}</div></div></div></div>`;
    } catch (error) { container.innerHTML = `<div class="alert alert-danger">ไม่สามารถโหลด Dashboard ได้: ${escapeHtml(error.message)}</div>`; }
  };
  await render();
  if (!supabase) return;
  let timer;
  const refreshSoon = () => { clearTimeout(timer); timer = window.setTimeout(render, 450); };
  const channel = supabase.channel('owner-dashboard-live')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, refreshSoon)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, refreshSoon)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, refreshSoon)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, refreshSoon)
    .subscribe();
  window.addEventListener('beforeunload', () => supabase.removeChannel(channel), { once: true });
}
