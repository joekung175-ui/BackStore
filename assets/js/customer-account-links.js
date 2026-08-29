if (document.body.dataset.page === 'customer-account') {
  const wire = () => document.querySelectorAll('article[data-order-number]').forEach(card => {
    if (card.dataset.detailBound) return;
    card.dataset.detailBound = 'true'; card.classList.add('customer-order-card'); card.tabIndex = 0; card.setAttribute('role', 'link');
    const open = () => location.assign(`order-detail.html?order=${encodeURIComponent(card.dataset.orderNumber)}`);
    card.addEventListener('click', open); card.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(); } });
  });
  new MutationObserver(wire).observe(document.documentElement, { childList:true, subtree:true }); wire();
}
