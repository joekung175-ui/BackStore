export const money = (satang = 0) => new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(Number(satang) / 100);
export const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
export const qs = (selector, parent = document) => parent.querySelector(selector);
export const qsa = (selector, parent = document) => [...parent.querySelectorAll(selector)];
export const toast = (message, type = 'success') => {
  const host = qs('#toast-host');
  const node = document.createElement('div');
  node.className = `toast align-items-center text-bg-${type} border-0`;
  node.setAttribute('role', 'status');
  node.innerHTML = `<div class="d-flex"><div class="toast-body"></div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="ปิด"></button></div>`;
  qs('.toast-body', node).textContent = message;
  host.append(node); new bootstrap.Toast(node, { delay: 3200 }).show();
};
export const setLoading = (button, loading) => { button.disabled = loading; button.dataset.original ||= button.textContent; button.textContent = loading ? 'กำลังดำเนินการ…' : button.dataset.original; };
export const validateSlip = file => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (!file || !allowed.includes(file.type) || file.size > 5 * 1024 * 1024) throw new Error('รองรับไฟล์ JPG, PNG หรือ WebP ขนาดไม่เกิน 5 MB เท่านั้น');
};
