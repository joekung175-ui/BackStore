import { uploadSlip } from './checkout.js';
import { escapeHtml, qs, setLoading, toast } from './utils.js';

function setup() {
  const host = qs('#app'); const order = JSON.parse(sessionStorage.getItem('latestOrder') || 'null');
  if (!host || !order || host.dataset.slipEnhanced) return;
  host.dataset.slipEnhanced = 'true';
  host.innerHTML = `<main class="container py-5 text-center"><div class="card border-0 shadow-sm mx-auto narrow-card"><div class="card-body p-5"><i class="bi bi-check-circle-fill text-success display-3"></i><h1 class="mt-3">สั่งซื้อสำเร็จ</h1><p>หมายเลขคำสั่งซื้อของคุณคือ <strong>${escapeHtml(order.order_number || '-')}</strong></p>${order.slip_uploaded ? '<div class="alert alert-success mt-4"><i class="bi bi-check2-circle"></i> ส่งสลิปให้ร้านตรวจสอบเรียบร้อยแล้ว</div>' : '<div class="alert alert-warning text-start mt-4"><strong><i class="bi bi-receipt"></i> ขั้นตอนถัดไป: แนบสลิปการชำระเงิน</strong><p class="small mb-3">รองรับไฟล์ JPG, PNG หรือ WebP ขนาดไม่เกิน 5 MB</p><form id="slip-form"><input class="form-control" name="slip" type="file" accept="image/jpeg,image/png,image/webp" required><button class="btn btn-primary w-100 mt-3" type="submit"><i class="bi bi-cloud-arrow-up"></i> อัปโหลดสลิป</button></form></div>'}<div class="d-flex justify-content-center flex-wrap gap-2 mt-3"><a class="btn btn-primary" href="account.html"><i class="bi bi-clock-history"></i> ดูประวัติการสั่งซื้อ</a></div></div></div></main>`;
  qs('#slip-form')?.addEventListener('submit', async event => { event.preventDefault(); const button = qs('button', event.currentTarget); const file = new FormData(event.currentTarget).get('slip'); try { setLoading(button, true); await uploadSlip(order.tracking_token, file); toast('ส่งสลิปแล้ว รอร้านค้าตรวจสอบ'); qs('#slip-form').innerHTML = '<div class="text-success fw-bold"><i class="bi bi-check2-circle"></i> ส่งสลิปเรียบร้อยแล้ว</div>'; } catch (error) { toast(error.message, 'danger'); } finally { setLoading(button, false); } });
}

if (document.body.dataset.page === 'success') { const observer = new MutationObserver(setup); observer.observe(document.documentElement, { childList: true, subtree: true }); }
