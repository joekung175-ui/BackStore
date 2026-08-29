const savedPhoneKey = 'customerOrderPhone';

document.addEventListener('submit', event => {
  if (event.target?.id !== 'checkout-form') return;
  const phone = new FormData(event.target).get('phone')?.trim();
  if (phone) sessionStorage.setItem(savedPhoneKey, phone);
});

if (document.body.dataset.page === 'track') {
  const observer = new MutationObserver(() => {
    const form = document.querySelector('#history-form');
    const input = document.querySelector('#history-phone');
    const phone = sessionStorage.getItem(savedPhoneKey);
    if (!form || !input || !phone) return;
    input.value = phone;
    observer.disconnect();
    form.requestSubmit();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
}
