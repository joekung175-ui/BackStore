const badgeFor = name => {
  const value = name.toLowerCase();
  if (value.includes('มัทฉะ')) return { label: 'มัทฉะคัดพิเศษ', tone: 'matcha' };
  if (value.includes('3 อิน 1') || value.includes('ลาเต้')) return { label: 'ชงง่ายในทุกวัน', tone: 'latte' };
  if (value.includes('สมุนไพร') || value.includes('ขิง') || value.includes('ขมิ้น')) return { label: 'กลิ่นหอมสมุนไพร', tone: 'herbal' };
  return { label: 'ผลิตภัณฑ์คัดพิเศษ', tone: 'classic' };
};

const mount = () => {
  document.querySelectorAll('.product-card').forEach(card => {
    if (card.dataset.powderPolished) return;
    const image = card.querySelector('.product-image-wrap');
    const name = card.querySelector('.product-name')?.textContent?.trim() || '';
    if (!image) return;
    card.dataset.powderPolished = 'true';
    const badge = badgeFor(name);
    const ribbon = document.createElement('span');
    ribbon.className = `powder-product-label ${badge.tone}`;
    ribbon.innerHTML = `<i class="bi bi-stars"></i>${badge.label}`;
    image.append(ribbon);
    if (card.querySelector('.text-danger')) card.classList.add('is-low-stock');
  });
};

if (!document.body.dataset.page?.startsWith('admin-')) {
  new MutationObserver(mount).observe(document.documentElement, { childList:true, subtree:true });
  mount();
}
