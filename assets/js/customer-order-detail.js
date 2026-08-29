import { supabase } from './supabase.js';
import { escapeHtml, money, qs } from './utils.js';

const labels = { pending_payment:'รอชำระเงิน', paid:'ชำระเงินแล้ว', preparing:'กำลังเตรียมสินค้า', packing:'กำลังแพ็ก', shipped:'จัดส่งแล้ว', completed:'สำเร็จ', cancelled:'ยกเลิกคำสั่งซื้อ', refunded:'คืนเงินแล้ว' };
const payment = { pending:'รอชำระเงิน', submitted:'รอตรวจสอบสลิป', approved:'ชำระเงินแล้ว', rejected:'กรุณาแนบสลิปใหม่' };
const date = value => new Intl.DateTimeFormat('th-TH', { dateStyle:'medium', timeStyle:'short' }).format(new Date(value));

async function renderDetail() {
  if (document.body.dataset.page !== 'customer-order-detail') return;
  if (!supabase) { qs('#app').innerHTML = '<main class="container py-5"><div class="alert alert-warning">กรุณาตั้งค่า Supabase ก่อนใช้งาน</div></main>'; return; }
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) { location.assign('account-login.html'); return; }
  const number = new URLSearchParams(location.search).get('order');
  if (!number) { location.assign('account.html'); return; }
  qs('#app').innerHTML = '<main class="container py-5"><div class="app-skeleton"><span></span><span></span><span></span></div></main>';
  const { data: order, error } = await supabase.rpc('my_order_detail', { p_order_number:number });
  if (error) { qs('#app').innerHTML = `<main class="container py-5"><div class="alert alert-danger">${escapeHtml(error.message)}</div></main>`; return; }
  if (order.slip_path) { const { data } = await supabase.storage.from('payment-slips').createSignedUrl(order.slip_path, 300); order.slip_url = data?.signedUrl || null; }
  qs('#app').innerHTML = `<main class="container py-5"><a class="order-history-back-button" href="account.html"><span class="order-history-back-icon"><i class="bi bi-arrow-left"></i></span><span>กลับไปประวัติการสั่งซื้อ</span></a><div class="row g-4 mt-3"><section class="col-lg-7"><article class="card border-0 shadow-sm"><div class="card-body p-4"><div class="d-flex justify-content-between gap-3"><div><p class="text-secondary small mb-1">หมายเลขคำสั่งซื้อ</p><h1 class="h4 mb-1">${escapeHtml(order.order_number)}</h1><small class="text-secondary">${date(order.created_at)}</small></div><span class="badge text-bg-success align-self-start">${escapeHtml(labels[order.status] || order.status)}</span></div><hr><h2 class="h6">รายการสินค้า</h2><div class="vstack gap-2">${order.items.map(item => `<div class="d-flex justify-content-between gap-3 border-bottom pb-2"><span>${escapeHtml(item.name)} <small class="text-secondary">× ${item.quantity}</small></span><strong>${money(item.total_satang)}</strong></div>`).join('')}</div><div class="d-flex justify-content-between fs-5 fw-bold mt-3"><span>ยอดรวม</span><span>${money(order.total_satang)}</span></div></div></article><article class="card border-0 shadow-sm mt-4"><div class="card-body p-4"><h2 class="h5">ไทม์ไลน์คำสั่งซื้อ</h2><ol class="order-timeline">${order.timeline.map(item => `<li><span class="timeline-dot"></span><strong>${escapeHtml(labels[item.status] || item.status)}</strong><small>${date(item.created_at)}${item.note ? ` · ${escapeHtml(item.note)}` : ''}</small></li>`).join('')}</ol></div></article></section><aside class="col-lg-5"><article class="card border-0 shadow-sm"><div class="card-body p-4"><h2 class="h5">การชำระเงินและการจัดส่ง</h2><div class="detail-row"><i class="bi bi-credit-card"></i><div><small>สถานะชำระเงิน</small><strong>${escapeHtml(payment[order.payment_status] || order.payment_status)}</strong></div></div><div class="detail-row"><i class="bi bi-receipt"></i><div><small>หลักฐานการชำระเงิน</small><strong>${order.slip_uploaded ? 'แนบสลิปแล้ว' : 'ยังไม่พบสลิป'} ${order.slip_url ? `<a class="btn btn-outline-primary btn-sm mt-2" target="_blank" href="${escapeHtml(order.slip_url)}">ดูสลิป</a>` : ''}</strong></div></div><div class="detail-row"><i class="bi bi-truck"></i><div><small>เลขพัสดุ</small><strong>${order.tracking_number ? `${escapeHtml(order.carrier || 'พัสดุ')} · ${escapeHtml(order.tracking_number)}` : 'ร้านยังไม่อัปเดตเลขพัสดุ'}</strong></div></div></div></article></aside></div></main>`;
}
renderDetail();
