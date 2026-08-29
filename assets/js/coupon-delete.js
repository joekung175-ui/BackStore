import { supabase } from './supabase.js';
import { toast } from './utils.js';

const styleId = 'coupon-delete-style';

function addStyles() {
  if (document.getElementById(styleId)) return;
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    .coupon-delete { display:inline-flex; align-items:center; gap:.32rem; margin-left:.3rem; }
    .coupon-delete.is-deleting { pointer-events:none; opacity:.65; }
    .coupon-row-removing { opacity:0; transform:translateX(10px); transition:opacity .2s ease,transform .2s ease; }
  `;
  document.head.append(style);
}

function mountButtons() {
  if (document.body.dataset.page !== 'admin-coupons' || !supabase) return;
  document.querySelectorAll('.coupon-toggle[data-id]').forEach(toggle => {
    const actions = toggle.parentElement;
    if (!actions || actions.querySelector('.coupon-delete')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn btn-outline-danger btn-sm coupon-delete';
    button.dataset.id = toggle.dataset.id;
    button.setAttribute('aria-label', 'ลบคูปอง');
    button.innerHTML = '<i class="bi bi-trash3"></i> ลบ';
    actions.append(button);
  });
}

function updateCount(table) {
  const rows = [...table.querySelectorAll('tbody > tr')].filter(row => row.querySelector('.coupon-toggle'));
  const card = table.closest('.card-body');
  const count = card?.querySelector('.d-flex.justify-content-between p');
  if (count) count.textContent = `${rows.length} รายการ`;
  if (!rows.length) table.querySelector('tbody').innerHTML = '<tr><td colspan="7" class="text-center text-secondary py-4">ยังไม่มีคูปอง</td></tr>';
}

function setup() {
  if (document.body.dataset.page !== 'admin-coupons' || !supabase) return;
  addStyles();
  mountButtons();
  new MutationObserver(mountButtons).observe(document.documentElement, { childList:true, subtree:true });

  document.addEventListener('click', async event => {
    const button = event.target.closest('.coupon-delete');
    if (!button) return;
    const row = button.closest('tr');
    const code = row?.querySelector('strong')?.textContent?.trim() || 'คูปองนี้';
    if (!confirm(`ลบคูปอง ${code} ออกจากระบบหรือไม่?`)) return;
    try {
      button.classList.add('is-deleting');
      button.disabled = true;
      const { error } = await supabase.from('coupons').delete().eq('id', button.dataset.id);
      if (error) throw error;
      row?.classList.add('coupon-row-removing');
      window.setTimeout(() => {
        row?.remove();
        const table = document.querySelector('.coupon-toggle')?.closest('table') || document.querySelector('table');
        if (table) updateCount(table);
      }, 210);
      toast(`ลบคูปอง ${code} แล้ว`);
    } catch (error) {
      button.classList.remove('is-deleting');
      button.disabled = false;
      toast(error.message, 'danger');
    }
  });
}

setup();
