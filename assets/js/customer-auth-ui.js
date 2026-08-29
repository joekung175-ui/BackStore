import { supabase } from './supabase.js';
import { escapeHtml, money, qs, setLoading, toast } from './utils.js';

const page = document.body.dataset.page;
const statusLabel = status => ({ pending_payment: 'รอชำระเงิน', paid: 'ชำระเงินแล้ว', preparing: 'กำลังเตรียมสินค้า', packing: 'กำลังแพ็ก', shipped: 'จัดส่งแล้ว', completed: 'สำเร็จ', cancelled: 'ยกเลิก', refunded: 'คืนเงินแล้ว' }[status] || status);

function addAccountLink() {
  const nav = document.querySelector('.navbar-nav');
  if (!nav || nav.querySelector('[data-account-link]')) return false;
  const item = document.createElement('li');
  item.className = 'nav-item';
  item.innerHTML = '<a class="nav-link" data-account-link href="account-login.html"><i class="bi bi-person-circle"></i> เข้าสู่ระบบ</a>';
  nav.insertBefore(item, nav.lastElementChild);
  return true;
}

async function refreshAccountLink() {
  const link = document.querySelector('[data-account-link]');
  if (!link || !supabase) return;
  const { data: { session } } = await supabase.auth.getSession();
  const trackingItem = document.querySelector('.navbar-nav a[href="track-order.html"]')?.closest('.nav-item');
  if (trackingItem) trackingItem.hidden = Boolean(session);
  link.href = session ? 'account.html' : 'account-login.html';
  link.innerHTML = session ? '<i class="bi bi-person-check-fill"></i> บัญชีของฉัน' : '<i class="bi bi-person-circle"></i> เข้าสู่ระบบ';
}

const navObserver = new MutationObserver(() => { if (addAccountLink()) { navObserver.disconnect(); refreshAccountLink(); } });
navObserver.observe(document.documentElement, { childList: true, subtree: true });
const navTimer = window.setInterval(() => { if (addAccountLink()) { window.clearInterval(navTimer); refreshAccountLink(); } }, 250);
window.setTimeout(() => window.clearInterval(navTimer), 8000);
if (supabase) supabase.auth.onAuthStateChange(() => refreshAccountLink());

async function customerLogin() {
  qs('#app').innerHTML = `<main class="container py-5"><div class="card border-0 shadow-sm mx-auto login-card"><div class="card-body p-4 p-md-5"><span class="feature-icon mb-3"><i class="bi bi-box-arrow-in-right"></i></span><h1 class="h3">เข้าสู่ระบบ</h1><p class="text-secondary">เข้าสู่ระบบเพื่อดูประวัติคำสั่งซื้อของคุณได้ทันที</p><form id="customer-login-form" class="mt-4"><label class="form-label" for="customer-email">อีเมล</label><input id="customer-email" name="email" class="form-control" type="email" autocomplete="email" required><label class="form-label mt-3" for="customer-password">รหัสผ่าน</label><input id="customer-password" name="password" class="form-control" type="password" autocomplete="current-password" minlength="6" required><button class="btn btn-primary w-100 mt-4">เข้าสู่ระบบ</button></form><div class="text-center mt-4 pt-3 border-top"><span class="text-secondary">ยังไม่มีบัญชี?</span><a class="btn btn-outline-primary w-100 mt-3" href="account-signup.html">สมัครสมาชิก</a></div></div></div></main>`;
  qs('#customer-login-form').addEventListener('submit', async event => { event.preventDefault(); const button = qs('button', event.currentTarget); const { email, password } = Object.fromEntries(new FormData(event.currentTarget)); try { setLoading(button, true); const { error } = await supabase.auth.signInWithPassword({ email, password }); if (error) throw error; location.assign('account.html'); } catch (error) { toast(error.message, 'danger'); } finally { setLoading(button, false); } });
}

async function customerSignup() {
  qs('#app').innerHTML = `<main class="container py-5"><div class="card border-0 shadow-sm mx-auto login-card"><div class="card-body p-4 p-md-5"><span class="feature-icon mb-3"><i class="bi bi-person-plus-fill"></i></span><h1 class="h3">สมัครสมาชิก</h1><p class="text-secondary">สร้างบัญชีเพื่อเก็บประวัติการสั่งซื้อไว้ในที่เดียว</p><form id="customer-signup-form" class="mt-4"><label class="form-label" for="signup-email">อีเมล</label><input id="signup-email" name="email" class="form-control" type="email" autocomplete="email" required><label class="form-label mt-3" for="signup-password">ตั้งรหัสผ่าน (อย่างน้อย 6 ตัว)</label><input id="signup-password" name="password" class="form-control" type="password" autocomplete="new-password" minlength="6" required><label class="form-label mt-3" for="signup-confirm-password">ยืนยันรหัสผ่าน</label><input id="signup-confirm-password" name="confirm_password" class="form-control" type="password" autocomplete="new-password" minlength="6" required><button class="btn btn-primary w-100 mt-4">สมัครสมาชิก</button></form><p class="text-center mt-4 mb-0 text-secondary">มีบัญชีแล้ว? <a href="account-login.html">เข้าสู่ระบบ</a></p></div></div></main>`;
  qs('#customer-signup-form').addEventListener('submit', async event => { event.preventDefault(); const form = event.currentTarget; const button = qs('button', form); const { email, password, confirm_password: confirmPassword } = Object.fromEntries(new FormData(form)); if (password !== confirmPassword) { toast('รหัสผ่านทั้งสองช่องไม่ตรงกัน', 'danger'); return; } try { setLoading(button, true); const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${location.origin}/account.html` } }); if (error) throw error; if (data.session) location.assign('account.html'); else toast('สมัครสำเร็จ กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี'); } catch (error) { toast(error.message, 'danger'); } finally { setLoading(button, false); } });
}

async function customerAccount() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) { location.assign('account-login.html'); return; }
  qs('#app').innerHTML = '<main class="container py-5"><div class="text-center py-5"><div class="spinner-border text-success"></div></div></main>';
  try {
    const { data: orders, error } = await supabase.rpc('my_order_history');
    if (error) throw error;
    qs('#app').innerHTML = `<main class="container py-5"><div class="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4"><div><p class="text-primary fw-bold mb-1"><i class="bi bi-person-check-fill"></i> บัญชีของฉัน</p><h1 class="h2 mb-1">ประวัติการสั่งซื้อ</h1><p class="text-secondary mb-0">${escapeHtml(session.user.email || '')}</p><small class="text-secondary d-block mt-1"><i class="bi bi-arrow-repeat"></i> สถานะจะตรวจสอบกับหลังบ้านอัตโนมัติ</small></div><button id="customer-logout" class="btn btn-outline-primary"><i class="bi bi-box-arrow-right"></i> ออกจากระบบ</button></div>${orders.length ? `<div class="row g-3">${orders.map(order => `<div class="col-md-6"><article class="card border-0 shadow-sm h-100" data-order-number="${escapeHtml(order.order_number)}"><div class="card-body"><div class="d-flex justify-content-between gap-2 align-items-start"><strong>${escapeHtml(order.order_number)}</strong><span class="badge customer-order-badge text-bg-primary">กำลังตรวจสอบสถานะ</span></div><p class="text-secondary small mt-2 mb-1">${new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium' }).format(new Date(order.created_at))}</p><p class="fs-5 fw-bold mb-0">${money(order.total_satang)}</p><p class="small mt-3 mb-0 shipping-status">${order.tracking_number ? `<i class="bi bi-truck"></i> ${escapeHtml(order.carrier || 'พัสดุ')} · ${escapeHtml(order.tracking_number)}` : '<i class="bi bi-box-seam"></i> ร้านกำลังรออัปเดตการจัดส่ง'}</p></div></article></div>`).join('')}</div>` : '<div class="status-empty"><i class="bi bi-receipt fs-1"></i><p class="mt-3">ยังไม่มีคำสั่งซื้อในบัญชีนี้</p><a class="btn btn-primary" href="products.html">เลือกชมสินค้า</a></div>'}</main>`;
    qs('#customer-logout').addEventListener('click', async () => { await supabase.auth.signOut(); location.assign('index.html'); });
  } catch (error) { qs('#app').innerHTML = `<main class="container py-5"><div class="alert alert-danger">${escapeHtml(error.message)}</div></main>`; }
}

if (!supabase && (page === 'customer-login' || page === 'customer-signup' || page === 'customer-account')) qs('#app').innerHTML = '<main class="container py-5"><div class="alert alert-warning">กรุณาตั้งค่า Supabase ก่อนใช้งานบัญชีลูกค้า</div></main>';
if (supabase && page === 'customer-login') customerLogin();
if (supabase && page === 'customer-signup') customerSignup();
if (supabase && page === 'customer-account') customerAccount();
