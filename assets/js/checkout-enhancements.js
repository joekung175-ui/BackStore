import { supabase } from './supabase.js';
import { validateCartServerSide } from './cart.js';
import { submitOrder, uploadSlip } from './checkout.js';
import { getSettings } from './store.js';
import { money, qs, setLoading, toast } from './utils.js';

const promptPayPayload = (id, amount) => {
  const digits = String(id || '').replace(/\D/g, '');
  const account = digits.length === 10 && digits.startsWith('0') ? `0066${digits.slice(1)}` : digits;
  const tlv = (tag, value) => `${tag}${String(value.length).padStart(2, '0')}${value}`;
  const crc = value => { let result = 0xFFFF; for (const char of value) { result ^= char.charCodeAt(0) << 8; for (let bit = 0; bit < 8; bit += 1) result = result & 0x8000 ? (result << 1) ^ 0x1021 : result << 1; } return (result & 0xFFFF).toString(16).toUpperCase().padStart(4, '0'); };
  const payload = `000201010212${tlv('29', `0016A000000677010111${tlv('01', account)}`)}5802TH5303764${tlv('54', amount.toFixed(2))}6304`;
  return `${payload}${crc(payload)}`;
};

function addCheckoutSlip(form) {
  const submitButton = qs('[type="submit"]', form);
  if (!submitButton || qs('#checkout-slip-panel')) return;
  const panel = document.createElement('div');
  panel.id = 'checkout-slip-panel'; panel.className = 'mt-4 p-3 rounded-3 border bg-light';
  panel.innerHTML = '<div class="d-flex gap-2"><i class="bi bi-paperclip fs-5 text-primary"></i><div><strong>แนบสลิปตอนนี้ <span class="text-danger">*</span></strong><p class="small text-secondary mb-2">จำเป็นต้องแนบสลิปก่อนยืนยันคำสั่งซื้อ รองรับ JPG, PNG หรือ WebP ขนาดไม่เกิน 5 MB</p></div></div><label class="form-label small" for="checkout-slip">สลิปการชำระเงิน</label><input id="checkout-slip" class="form-control" type="file" accept="image/jpeg,image/png,image/webp" required>';
  submitButton.before(panel);
  form.addEventListener('submit', async event => {
    const file = qs('#checkout-slip')?.files?.[0];
    event.preventDefault(); event.stopImmediatePropagation();
    if (!file) { toast('กรุณาแนบสลิปการชำระเงิน', 'danger'); return; }
    if (!form.checkValidity()) { form.reportValidity(); return; }
    try { setLoading(submitButton, true); const raw = Object.fromEntries(new FormData(form)); const order = await submitOrder(raw, raw.payment_method, crypto.randomUUID()); try { await uploadSlip(order.tracking_token, file); sessionStorage.setItem('latestOrder', JSON.stringify({ ...order, slip_uploaded: true })); } catch (uploadError) { sessionStorage.setItem('latestOrder', JSON.stringify(order)); toast('สร้างออเดอร์แล้ว แต่ส่งสลิปไม่สำเร็จ กรุณาแนบอีกครั้งในหน้าถัดไป', 'warning'); } location.assign(`order-success.html?order=${encodeURIComponent(order.order_number)}`); } catch (error) { toast(error.message, 'danger'); } finally { setLoading(submitButton, false); }
  }, true);
}

async function setup() {
  const form = qs('#checkout-form');
  if (!form || form.dataset.enhanced) return;
  form.dataset.enhanced = 'true';
  const [totals, settings] = await Promise.all([validateCartServerSide(), getSettings()]);
  let discount = 0;
  const renderSummary = () => { const finalTotal = totals.total_satang - discount; const aside = document.querySelector('#app aside .card-body'); if (!aside) return; aside.innerHTML = `<h2 class="h5">สรุปคำสั่งซื้อ</h2><div class="vstack gap-2 small mb-3">${totals.lines.map(line => `<div class="d-flex gap-2 align-items-center"><img src="${line.product.image_url || ''}" alt="" class="rounded" style="width:38px;height:38px;object-fit:cover"><span class="flex-grow-1">${line.product.name} × ${line.quantity}</span><strong>${money(line.product.price_satang * line.quantity)}</strong></div>`).join('')}</div><div class="d-flex justify-content-between"><span>ค่าสินค้า</span><span>${money(totals.subtotal_satang)}</span></div><div class="d-flex justify-content-between"><span>ค่าจัดส่ง</span><span>${money(totals.shipping_satang)}</span></div><div class="d-flex justify-content-between text-success ${discount ? '' : 'd-none'}"><span>ส่วนลด</span><span>−${money(discount)}</span></div><hr><div class="d-flex justify-content-between fw-bold fs-5"><span>ยอดชำระ</span><span>${money(finalTotal)}</span></div><div class="input-group input-group-sm mt-3"><input id="coupon-code" class="form-control" placeholder="โค้ดส่วนลด"><button id="apply-coupon" class="btn btn-outline-primary" type="button">ใช้โค้ด</button></div><small id="coupon-message" class="d-block mt-2 text-secondary">ลองใช้โค้ด WELCOME10 สำหรับการทดสอบ</small>`; qs('#apply-coupon').addEventListener('click', async event => { const code = qs('#coupon-code').value.trim().toUpperCase(); if (!code) return; try { setLoading(event.currentTarget, true); if (!supabase) throw new Error('ต้องตั้งค่า Supabase ก่อนใช้โค้ดส่วนลด'); const { data, error } = await supabase.rpc('validate_coupon', { p_code: code, p_subtotal_satang: totals.subtotal_satang }); if (error) throw error; discount = data?.[0]?.discount_satang || 0; sessionStorage.setItem('checkoutCoupon', code); qs('#coupon-message').className = 'd-block mt-2 text-success'; qs('#coupon-message').textContent = `ใช้โค้ด ${code} สำเร็จ`; renderSummary(); } catch (error) { sessionStorage.removeItem('checkoutCoupon'); discount = 0; qs('#coupon-message').className = 'd-block mt-2 text-danger'; qs('#coupon-message').textContent = error.message; renderSummary(); } finally { setLoading(event.currentTarget, false); } }); };
  renderSummary();
  const payment = qs('#payment'); const guide = document.createElement('div'); guide.id = 'payment-guide'; guide.className = 'col-12'; payment.closest('.col-md-6').after(guide);
  const renderPayment = () => { const total = (totals.total_satang - discount) / 100; if (payment.value === 'promptpay') { const payload = promptPayPayload(settings.promptpay_id, total); guide.innerHTML = `<div class="alert alert-success mb-0 text-center"><strong>สแกน QR PromptPay เพื่อชำระเงิน</strong><img class="d-block mx-auto my-3 rounded" width="180" height="180" alt="QR PromptPay" src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(payload)}"><small>ชื่อบัญชี: ${settings.promptpay_name || '-'} · ยอด ${money(totals.total_satang - discount)}</small></div>`; } else guide.innerHTML = `<div class="alert alert-light border mb-0"><strong>โอนเงินและแนบสลิปหลังสั่งซื้อ</strong><br><small>${settings.bank_name || 'ธนาคาร'} · ${settings.bank_account_name || '-'} · ${settings.bank_account_number || '-'}</small></div>`; };
  payment.addEventListener('change', renderPayment); renderPayment();
  addCheckoutSlip(form);
  if (supabase) { const { data: { session } } = await supabase.auth.getSession(); if (session) { form.email.value = session.user.email || ''; const { data } = await supabase.rpc('my_customer_profile'); const profile = data?.[0]; if (profile) { form.name.value = profile.full_name || ''; form.phone.value = profile.phone || ''; const address = profile.address || {}; form.address.value = address.address || ''; form.subdistrict.value = address.subdistrict || ''; form.district.value = address.district || ''; form.province.value = address.province || ''; form.postal_code.value = address.postal_code || ''; } } }
}

if (document.body.dataset.page === 'checkout') { const observer = new MutationObserver(() => setup().catch(error => toast(error.message, 'danger'))); observer.observe(document.documentElement, { childList: true, subtree: true }); }
