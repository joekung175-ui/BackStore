if (document.body.dataset.page === 'products') {
  const mount = () => {
    const form = document.querySelector('#filter-form'); const category = document.querySelector('#category'); const heading = document.querySelector('main h1'); const term = document.querySelector('#term');
    if (!form || !category || category.dataset.autoFilter) return;
    category.innerHTML = '<option value="">ผงทุกประเภท</option><option>ผงชาเขียว</option><option>ผงมัจฉะ</option><option>ผงชาสมุนไพร</option><option>ผงชาต่างๆ</option>';
    if (heading) heading.textContent = 'ผลิตภัณฑ์แบบผง'; if (term) term.placeholder = 'ค้นหาชื่อผลิตภัณฑ์ผง หรือ SKU'; category.dataset.autoFilter = 'true';
    category.addEventListener('change', () => form.requestSubmit());
  };
  new MutationObserver(mount).observe(document.documentElement,{childList:true,subtree:true}); mount();
}
