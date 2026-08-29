import { cartCount, updateCart } from './cart.js';

const styleId = 'cart-item-remove-style';

function addStyles() {
  if (document.getElementById(styleId)) return;
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    body[data-page="cart"] .cart-line-removable { position:relative; transition:opacity .2s ease, transform .2s ease; }
    body[data-page="cart"] .cart-line-removable.is-removing { opacity:0; transform:translateX(12px); pointer-events:none; }
    body[data-page="cart"] .cart-line-remove-controls { display:flex; align-items:center; gap:.5rem; margin-top:.7rem; min-height:2rem; }
    body[data-page="cart"] .cart-line-remove {
      display:grid; place-items:center; width:2rem; height:2rem; padding:0; appearance:none; border:1px solid #f0c4bf;
      border-radius:.62rem; background:#fff8f7; color:#b4433a; font-size:.85rem; transition:color .18s ease, transform .18s ease, background .18s ease, box-shadow .18s ease;
    }
    body[data-page="cart"] .cart-line-remove:hover { color:#fff; background:#c44b40; border-color:#c44b40; box-shadow:0 .32rem .65rem rgba(157,54,46,.2); transform:translateY(-1px); }
    body[data-page="cart"] .cart-line-remove:focus-visible { outline:3px solid rgba(38,100,71,.26); outline-offset:2px; }
  `;
  document.head.append(style);
}

function updateHeaderCartCount() {
  const count = cartCount();
  document.querySelectorAll('.cart-count').forEach(node => { node.textContent = count; });
}

function buildActions(productId) {
  const wrap = document.createElement('div');
  wrap.className = 'cart-line-remove-controls';
  wrap.innerHTML = `<button class="cart-line-remove" type="button" data-remove-id="${productId}" aria-label="ลบสินค้านี้ออกจากตะกร้า" title="ลบสินค้า"><i class="bi bi-trash3" aria-hidden="true"></i></button>`;
  return wrap;
}

function enhanceCartRows() {
  if (document.body?.dataset.page !== 'cart') return;
  document.querySelectorAll('#cart-lines > .row').forEach(row => {
    if (row.dataset.removeControlReady === 'true') return;
    const productId = row.querySelector('.quantity[data-id]')?.dataset.id;
    const info = row.querySelector('.col-5');
    if (!productId || !info) return;
    row.dataset.removeControlReady = 'true';
    row.classList.add('cart-line-removable');
    info.append(buildActions(productId));
  });
}

function init() {
  if (document.body?.dataset.page !== 'cart') return;
  addStyles();
  enhanceCartRows();

  let queued = false;
  const observeCart = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      enhanceCartRows();
    });
  };
  new MutationObserver(observeCart).observe(document.body, { childList:true, subtree:true });

  document.addEventListener('click', event => {
    const removeButton = event.target.closest('.cart-line-remove');
    if (!removeButton) return;
    const row = removeButton.closest('.cart-line-removable');
    const productId = removeButton.dataset.removeId;
    if (!row || !productId) return;
    try {
      removeButton.disabled = true;
      updateCart(productId, 0, 0);
      updateHeaderCartCount();
      row.classList.add('is-removing');
      window.setTimeout(() => window.dispatchEvent(new Event('cart:changed')), 220);
    } catch (error) {
      removeButton.disabled = false;
    }
  });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once:true });
else init();
