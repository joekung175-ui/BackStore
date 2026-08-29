import { uploadSlip } from './checkout.js';
import { qs, setLoading, toast } from './utils.js';

function addSlipForm() {
  const result = qs('#track-result');
  const token = sessionStorage.getItem('trackedOrderToken');
  if (!result || !token || result.querySelector('#track-slip-form')) return;
  const paymentPending = /pending|submitted|rejected/.test(result.textContent.toLowerCase());
  if (!paymentPending) return;
  const form = document.createElement('form');
  form.id = 'track-slip-form'; form.className = 'mt-3 pt-3 border-top';
  form.innerHTML = '<label class="form-label fw-bold" for="track-slip">แนบสลิปการชำระเงิน</label><input id="track-slip" class="form-control" name="slip" type="file" accept="image/jpeg,image/png,image/webp" required><button class="btn btn-primary mt-2" type="submit"><i class="bi bi-cloud-arrow-up"></i> ส่งสลิปให้ร้านตรวจสอบ</button>';
  result.append(form);
  form.addEventListener('submit', async event => { event.preventDefault(); const button = qs('button', form); try { setLoading(button, true); await uploadSlip(token, new FormData(form).get('slip')); toast('ส่งสลิปแล้ว รอร้านค้าตรวจสอบ'); form.innerHTML = '<p class="mb-0 text-success fw-bold"><i class="bi bi-check2-circle"></i> ส่งสลิปเรียบร้อยแล้ว</p>'; } catch (error) { toast(error.message, 'danger'); } finally { setLoading(button, false); } });
}

if (document.body.dataset.page === 'track') { const observer = new MutationObserver(addSlipForm); observer.observe(document.documentElement, { childList: true, subtree: true }); }
