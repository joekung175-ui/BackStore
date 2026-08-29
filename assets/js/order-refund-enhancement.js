function addRefundOption() {
  const select = document.querySelector('#order-status');
  if (!select || select.querySelector('option[value="refunded"]')) return;
  const option = document.createElement('option');
  option.value = 'refunded'; option.textContent = 'คืนเงินแล้ว';
  select.append(option);
}

if (document.body.dataset.page === 'admin-orders') {
  const observer = new MutationObserver(addRefundOption);
  observer.observe(document.documentElement, { childList: true, subtree: true });
}
