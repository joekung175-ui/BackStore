import { supabase } from './supabase.js';
import { getProducts } from './store.js';
import { qs, escapeHtml } from './utils.js';

const insight = (icon, title, body, tone) => `<article class="insight-card ${tone}"><span class="insight-icon"><i class="bi bi-${icon}"></i></span><div><h3>${escapeHtml(title)}</h3><p>${escapeHtml(body)}</p></div></article>`;

export async function setupLocalAiPage(container) {
  const heading = qs('.admin-header h1'); if (heading) heading.textContent = 'ผู้ช่วยวิเคราะห์ร้าน';
  const render = async () => {
    container.innerHTML = '<div class="py-5 text-center"><div class="spinner-border text-success" role="status"><span class="visually-hidden">กำลังวิเคราะห์</span></div></div>';
    try {
      const products = await getProducts();
      let orders = []; let transactions = [];
      if (supabase) { const [{ data: orderData, error: orderError }, { data: transactionData, error: transactionError }] = await Promise.all([supabase.from('orders').select('status,payment_status,total_satang,created_at').is('deleted_at', null), supabase.from('transactions').select('type,amount_satang,transaction_date').is('deleted_at', null)]); if (orderError || transactionError) throw orderError || transactionError; orders = orderData; transactions = transactionData; }
      const today = new Date().toISOString().slice(0, 10); const low = products.filter(item => item.available_stock > 0 && item.available_stock <= item.low_stock_threshold); const out = products.filter(item => item.available_stock <= 0); const pending = orders.filter(item => item.status === 'pending_payment').length; const revenue = orders.filter(item => item.payment_status === 'approved' && item.created_at.slice(0, 10) === today).reduce((sum, item) => sum + item.total_satang, 0); const expenses = transactions.filter(item => item.type === 'expense' && item.transaction_date === today).reduce((sum, item) => sum + item.amount_satang, 0);
      const insights = [];
      if (out.length) insights.push(insight('x-octagon-fill', 'สินค้าหมดแล้ว', `${out.map(item => item.name).join(', ')} ควรเติมสต็อกก่อนรับออเดอร์ใหม่`, 'danger'));
      if (low.length) insights.push(insight('exclamation-triangle-fill', 'สินค้าใกล้หมด', `${low.map(item => `${item.name} เหลือ ${item.available_stock}`).join(', ')} ควรวางแผนเติมสินค้า`, 'warning'));
      if (pending) insights.push(insight('credit-card-2-front-fill', 'มีออเดอร์รอตรวจสอบ', `มี ${pending} ออเดอร์ที่รอการตรวจสอบการชำระเงิน`, 'info'));
      if (!out.length && !low.length && !pending) insights.push(insight('check2-circle', 'สถานะร้านดี', 'ยังไม่มีสินค้าใกล้หมดและไม่มีออเดอร์ค้างตรวจสอบ', 'success'));
      const net = revenue - expenses;
      container.innerHTML = `<div class="analysis-hero"><div><span class="analysis-kicker"><i class="bi bi-lightning-charge-fill"></i> วิเคราะห์จากข้อมูลร้าน</span><h2>สรุปสิ่งที่ควรทำวันนี้</h2><p>คำแนะนำสร้างจากยอดขาย สต็อก และคำสั่งซื้อที่มีอยู่ในระบบ โดยไม่ส่งข้อมูลไปยังบริการภายนอก</p></div><button id="refresh-insights" class="btn btn-light"><i class="bi bi-arrow-clockwise"></i>วิเคราะห์ใหม่</button></div><div class="row g-3 mb-4"><div class="col-md-4"><div class="card metric-card"><div class="card-body"><p class="text-secondary mb-1">ยอดขายวันนี้</p><strong class="fs-4">฿${(revenue / 100).toLocaleString('th-TH')}</strong></div></div></div><div class="col-md-4"><div class="card metric-card metric-warning"><div class="card-body"><p class="text-secondary mb-1">ค่าใช้จ่ายวันนี้</p><strong class="fs-4">฿${(expenses / 100).toLocaleString('th-TH')}</strong></div></div></div><div class="col-md-4"><div class="card metric-card"><div class="card-body"><p class="text-secondary mb-1">สุทธิวันนี้</p><strong class="fs-4">฿${(net / 100).toLocaleString('th-TH')}</strong></div></div></div></div><section class="card border-0 shadow-sm"><div class="card-body p-4"><div class="d-flex justify-content-between align-items-center mb-3"><div><h2 class="h5 mb-1">คำแนะนำสำหรับคุณ</h2><p class="text-secondary small mb-0">อัปเดตล่าสุด ${new Intl.DateTimeFormat('th-TH', { timeStyle: 'short' }).format(new Date())}</p></div><span class="badge text-bg-light border">Smart Analysis</span></div><div class="insight-grid">${insights.join('')}</div></div></section>`;
      qs('#refresh-insights').addEventListener('click', render);
    } catch (error) { container.innerHTML = `<div class="alert alert-danger">วิเคราะห์ข้อมูลไม่สำเร็จ: ${escapeHtml(error.message)}</div>`; }
  };
  await render();
}
