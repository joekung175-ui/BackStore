import { supabase } from './supabase.js';

const orderLabel = status => ({ pending_payment: 'รอชำระเงิน', paid: 'ชำระเงินแล้ว', preparing: 'กำลังเตรียมสินค้า', packing: 'กำลังแพ็ก', shipped: 'จัดส่งแล้ว', completed: 'สำเร็จ', cancelled: 'ยกเลิกคำสั่งซื้อ', refunded: 'คืนเงินแล้ว' }[status] || status);
const paymentInfo = status => ({ submitted: ['รอตรวจสอบสลิป', 'text-bg-warning'], approved: ['ชำระเงินแล้ว', 'text-bg-success'], rejected: ['กรุณาแนบสลิปใหม่', 'text-bg-danger'], pending: ['รอชำระเงิน', 'text-bg-secondary'] }[status] || ['รอชำระเงิน', 'text-bg-secondary']);
const combinedStatus = order => {
  const [payment, paymentColor] = paymentInfo(order.payment_status);
  if (['cancelled', 'refunded', 'completed'].includes(order.status)) return [orderLabel(order.status), order.status === 'completed' ? 'text-bg-success' : 'text-bg-secondary'];
  if (['pending_payment', 'paid'].includes(order.status)) return [payment, paymentColor];
  return [`${payment} · ${orderLabel(order.status)}`, order.status === 'shipped' ? 'text-bg-info' : 'text-bg-primary'];
};

async function updatePaymentLabels() {
  if (!supabase || !['customer-account', 'track'].includes(document.body.dataset.page)) return;
  const { data: orders, error } = await supabase.rpc('my_order_history');
  if (error || !orders) return;
  for (const order of orders) {
    const card = document.querySelector(`#app article[data-order-number="${CSS.escape(order.order_number)}"]`);
    if (!card) continue;
    const badge = card.querySelector('.customer-order-badge');
    const shipping = card.querySelector('.shipping-status');
    if (badge) { const [label, color] = combinedStatus(order); badge.className = `badge customer-order-badge ${color}`; badge.textContent = label; }
    if (shipping) shipping.innerHTML = order.tracking_number ? `<i class="bi bi-truck"></i> ${order.carrier || 'พัสดุ'} · ${order.tracking_number}` : `<i class="bi bi-box-seam"></i> ${['shipped', 'completed'].includes(order.status) ? 'ร้านกำลังอัปเดตเลขพัสดุ' : 'ร้านกำลังรออัปเดตการจัดส่ง'}`;
  }
}

if (['customer-account', 'track'].includes(document.body.dataset.page)) {
  const observer = new MutationObserver(updatePaymentLabels);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.setInterval(updatePaymentLabels, 15000);
}
