const trackingUrl = (carrier, number) => {
  const code = encodeURIComponent(number.trim()); const name = String(carrier || '').toLowerCase();
  if (/thai.?post|ไปรษณีย์/.test(name)) return `https://track.thailandpost.co.th/?trackNumber=${code}`;
  if (/flash/.test(name)) return `https://www.flashexpress.com/fle/tracking?se=${code}`;
  if (/kerry/.test(name)) return `https://th.kerryexpress.com/th/track/?track=${code}`;
  if (/j&t|jnt/.test(name)) return `https://www.jtexpress.co.th/index/query/gzquery.html?bills=${code}`;
  if (/best/.test(name)) return `https://www.best-inc.co.th/track?bills=${code}`;
  return null;
};

if (['customer-account','customer-order-detail','track'].includes(document.body.dataset.page)) {
  const mount = () => document.querySelectorAll('.shipping-status,.detail-row').forEach(node => {
    if (node.dataset.trackingLinked || !/เลขพัสดุ|พัสดุ/.test(node.textContent)) return;
    const text = node.textContent.trim(); const match = text.match(/(.+?)\s·\s([^\s]+)$/); if (!match) return;
    const url = trackingUrl(match[1], match[2]); if (!url) return;
    const target = node.querySelector('strong') || node;
    target.innerHTML = `<a class="text-decoration-none" target="_blank" rel="noopener" href="${url}"><i class="bi bi-box-arrow-up-right"></i> ${target.textContent.trim()}</a>`; node.dataset.trackingLinked='true';
  });
  new MutationObserver(mount).observe(document.documentElement,{childList:true,subtree:true}); mount();
}
