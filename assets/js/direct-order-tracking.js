const savedPhoneKey = 'customerOrderPhone';

if (document.body.dataset.page === 'success') {
  const wireSuccess = () => {
    const order = new URLSearchParams(location.search).get('order');
    const link = document.querySelector('a[href="track-order.html"]');
    if (order && link) link.href = `track-order.html?order=${encodeURIComponent(order)}`;
  };
  new MutationObserver(wireSuccess).observe(document.documentElement, { childList:true, subtree:true }); wireSuccess();
}

if (document.body.dataset.page === 'track') {
  const openLatest = () => {
    const order = new URLSearchParams(location.search).get('order');
    const form = document.querySelector('#track-form'); if (!order || !form || form.dataset.directTracking) return;
    form.dataset.directTracking = 'true';
    form.querySelector('[name="order"]').value = order;
    const history = document.querySelector('#history'); if (history) history.hidden = true;
    const message = document.createElement('p'); message.className = 'small text-secondary mb-3'; message.innerHTML = '<i class="bi bi-lightning-charge-fill"></i> เปิดการติดตามสำหรับออเดอร์ล่าสุดของคุณ'; form.before(message);
    const phone = sessionStorage.getItem(savedPhoneKey);
    if (phone) { form.querySelector('[name="phone"]').value = phone; form.requestSubmit(); } else form.querySelector('[name="phone"]').focus();
  };
  new MutationObserver(openLatest).observe(document.documentElement, { childList:true, subtree:true }); openLatest();
}
