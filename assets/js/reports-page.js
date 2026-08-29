import { reportProfitLoss } from './finance.js';
import { escapeHtml, money, qs, setLoading, toast } from './utils.js';

const names = {
  gross_sales: 'ยอดขายก่อนหัก', discounts: 'ส่วนลด', refunds: 'คืนเงิน', net_sales: 'ยอดขายสุทธิ',
  cogs: 'ต้นทุนสินค้า', gross_profit: 'กำไรขั้นต้น', other_income: 'รายรับอื่น', expenses: 'รายจ่าย', net_profit: 'กำไรสุทธิ'
};
const localDate = date => new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

if (document.body.dataset.page === 'admin-reports') {
  let ready = false;
  const mount = () => {
    const host = qs('#admin-content');
    if (!host || ready) return;
    ready = true;
    const end = new Date(); const start = new Date(); start.setDate(end.getDate() - 29);
    host.innerHTML = `<section class="card border-0 shadow-sm"><div class="card-body p-4"><div class="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4"><div><h2 class="h5 mb-1">รายงานกำไร–ขาดทุน</h2><p class="text-secondary small mb-0">เลือกช่วงวันที่เพื่อดูยอดขาย ต้นทุน และกำไรจริง</p></div><button id="report-export" type="button" class="btn btn-outline-primary"><i class="bi bi-download"></i> ส่งออก CSV</button></div><form id="report-filter" class="row g-3 align-items-end"><div class="col-sm-5"><label class="form-label" for="report-start">ตั้งแต่วันที่</label><input id="report-start" class="form-control" type="date" name="start" value="${localDate(start)}"></div><div class="col-sm-5"><label class="form-label" for="report-end">ถึงวันที่</label><input id="report-end" class="form-control" type="date" name="end" value="${localDate(end)}"></div><div class="col-sm-2 d-grid"><button class="btn btn-primary" type="submit">ดูรายงาน</button></div></form></div></section><section id="report-result" class="mt-4"></section>`;
    const render = async (form = qs('#report-filter')) => {
      const raw = Object.fromEntries(new FormData(form));
      if (!raw.start || !raw.end || raw.start > raw.end) { toast('กรุณาเลือกช่วงวันที่ให้ถูกต้อง', 'danger'); return; }
      const result = qs('#report-result'); result.innerHTML = '<div class="py-4 text-center"><div class="spinner-border text-success"></div></div>';
      try {
        const report = await reportProfitLoss(raw.start, raw.end);
        result.dataset.report = JSON.stringify(report);
        result.innerHTML = `<div class="row g-3">${['gross_sales','net_sales','gross_profit','expenses','net_profit'].map(key => `<div class="col-sm-6 col-xl"><article class="card metric-card h-100"><div class="card-body"><p class="text-secondary small mb-1">${names[key]}</p><strong class="fs-5 ${key === 'expenses' ? 'text-danger' : key === 'net_profit' ? 'text-success' : ''}">${money(report[key] || 0)}</strong></div></article>`).join('')}</div><section class="card border-0 shadow-sm mt-4"><div class="card-body"><h3 class="h6 mb-3">รายละเอียดรายงาน</h3><div class="table-responsive"><table class="table align-middle"><tbody>${Object.entries(names).map(([key, title]) => `<tr><th>${title}</th><td class="text-end fw-bold">${money(report[key] || 0)}</td></tr>`).join('')}</tbody></table></div></div></section>`;
      } catch (error) { result.innerHTML = `<div class="alert alert-danger">${escapeHtml(error.message)}</div>`; }
    };
    qs('#report-filter').addEventListener('submit', event => { event.preventDefault(); render(event.currentTarget); });
    qs('#report-export').addEventListener('click', async event => { const report = JSON.parse(qs('#report-result').dataset.report || 'null'); if (!report) { toast('กรุณาดูรายงานก่อนส่งออกไฟล์', 'danger'); return; } try { setLoading(event.currentTarget, true); const csv = ['รายการ,จำนวนเงิน (บาท)', ...Object.entries(names).map(([key, title]) => `${title},${((report[key] || 0) / 100).toFixed(2)}`)].join('\n'); const link = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([`\ufeff${csv}`], { type:'text/csv;charset=utf-8' })), download:`รายงาน-${qs('#report-start').value}-ถึง-${qs('#report-end').value}.csv` }); link.click(); URL.revokeObjectURL(link.href); } finally { setLoading(event.currentTarget, false); } });
    render();
  };
  new MutationObserver(mount).observe(document.documentElement, { childList:true, subtree:true });
  mount();
}
