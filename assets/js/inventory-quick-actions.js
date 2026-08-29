import { adjustInventory } from './inventory.js';
import { toast } from './utils.js';

if (document.body.dataset.page === 'admin-inventory' && document.body.dataset.backofficeRole !== 'staff') {
  const productIdFor = row => {
    const sku = row.querySelector('code')?.textContent.trim();
    return [...document.querySelectorAll('#stock-product option')].find(option => option.textContent.includes(`(${sku})`))?.value;
  };
  const mount = () => {
    const table = document.querySelector('.inventory-table'); const body = document.querySelector('#inventory-rows');
    if (!table || !body) return;
    const header = table.querySelector('thead tr');
    if (header && !header.querySelector('.quick-actions-head')) { const th = document.createElement('th'); th.className='quick-actions-head text-end'; th.textContent='ปรับด่วน'; header.append(th); }
    const urgent = [];
    [...body.querySelectorAll('tr')].forEach(row => {
      const cells = row.querySelectorAll('td'); if (cells.length < 6 || row.querySelector('.quick-actions')) return;
      const available = Number(cells[4].textContent.trim()); const status = cells[5].textContent.trim();
      if (available <= 0 || status === 'ใกล้หมด') urgent.push({ name:cells[0].querySelector('strong')?.textContent.trim() || 'สินค้า', available, status });
      const id = productIdFor(row); if (!id) return;
      const action = document.createElement('td'); action.className='quick-actions text-end text-nowrap';
      action.innerHTML = '<button type="button" class="btn btn-outline-success btn-sm" data-change="1" title="เพิ่ม 1 ชิ้น">+1</button> <button type="button" class="btn btn-outline-danger btn-sm" data-change="-1" title="ลด 1 ชิ้น">−1</button>';
      action.querySelectorAll('button').forEach(button => button.addEventListener('click', async () => {
        const change = Number(button.dataset.change); if (change < 0 && !confirm(`ยืนยันลดสต็อก ${cells[0].querySelector('strong')?.textContent.trim()} จำนวน 1 ชิ้นหรือไม่?`)) return;
        try { button.disabled=true; await adjustInventory(id, change, change > 0 ? 'เติมสต็อกด่วนจากตาราง' : 'ลดสต็อกด่วนจากตาราง', crypto.randomUUID()); window.dispatchEvent(new CustomEvent('inventory:changed')); toast(change > 0 ? 'เติมสต็อกแล้ว 1 ชิ้น' : 'ลดสต็อกแล้ว 1 ชิ้น'); } catch (error) { toast(error.message,'danger'); } finally { button.disabled=false; }
      })); row.append(action);
    });
    const card = table.closest('.card');
    if (card && !document.querySelector('#urgent-stock-card')) { const panel=document.createElement('div'); panel.id='urgent-stock-card'; panel.className='alert alert-warning d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3'; panel.innerHTML=urgent.length ? `<div><strong><i class="bi bi-exclamation-triangle-fill"></i> ต้องเติมสินค้า ${urgent.length} รายการ</strong><small class="d-block mt-1">${urgent.map(item=>`${item.name} (${item.available} ชิ้น)`).join(' · ')}</small></div><button type="button" class="btn btn-warning btn-sm" id="show-low-stock">ดูเฉพาะรายการนี้</button>` : '<span><i class="bi bi-check-circle-fill"></i> สต็อกทั้งหมดอยู่ในระดับปกติ</span>'; card.before(panel); panel.querySelector('#show-low-stock')?.addEventListener('click', () => { document.querySelector('#inventory-filter-low')?.click(); }); }
    const search = document.querySelector('#inventory-search');
    if (search && !document.querySelector('#inventory-filter-all')) { const filters=document.createElement('div'); filters.className='d-flex flex-wrap gap-2 mt-2'; filters.innerHTML='<button id="inventory-filter-all" class="btn btn-outline-primary btn-sm active" type="button">ทั้งหมด</button><button id="inventory-filter-low" class="btn btn-outline-warning btn-sm" type="button">ใกล้หมด</button><button id="inventory-filter-out" class="btn btn-outline-secondary btn-sm" type="button">หมด</button>'; search.closest('.d-flex').after(filters); const apply=mode=>{ document.querySelectorAll('#inventory-rows tr').forEach(row=>{const available=Number(row.querySelectorAll('td')[4]?.textContent.trim()); row.hidden=mode==='low'?!(available>0&&available<=5):mode==='out'?available!==0:false;}); filters.querySelectorAll('button').forEach(button=>button.classList.toggle('active',button.id===`inventory-filter-${mode}`)); }; filters.addEventListener('click',event=>{const button=event.target.closest('button');if(button)apply(button.id.replace('inventory-filter-',''));}); }
  };
  new MutationObserver(mount).observe(document.documentElement,{childList:true,subtree:true}); mount();
}
