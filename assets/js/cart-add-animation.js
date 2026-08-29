import { cartCount } from './cart.js';

const styleId = 'cart-add-animation-style';

function addStyles() {
  if (document.getElementById(styleId)) return;
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    .cart-add-flyer { position:fixed; z-index:1100; display:grid; place-items:center; width:2.35rem; height:2.35rem; border-radius:.85rem; color:#fff; background:linear-gradient(135deg,#2d8058,#155139); box-shadow:0 .7rem 1.2rem rgba(21,81,57,.28); pointer-events:none; transform:translate3d(0,0,0) rotate(0deg) scale(1); opacity:1; transition:transform .68s cubic-bezier(.22,.75,.24,1),opacity .68s ease; }
    .cart-add-target-pulse { animation:cart-add-target-pulse .58s ease both; }
    .add-cart.cart-added-pop,.add-detail.cart-added-pop { animation:cart-added-pop .42s ease both; }
    @keyframes cart-add-target-pulse { 0%,100%{transform:scale(1)} 45%{transform:scale(1.12)} 70%{transform:scale(.96)} }
    @keyframes cart-added-pop { 0%,100%{transform:translateY(0)} 45%{transform:translateY(-3px) scale(1.025)} 70%{transform:translateY(1px) scale(.99)} }
    @media (prefers-reduced-motion:reduce) { .cart-add-flyer { display:none; }.cart-add-target-pulse,.add-cart.cart-added-pop,.add-detail.cart-added-pop { animation:none; } }
  `;
  document.head.append(style);
}

function refreshCounts() {
  const count = cartCount();
  document.querySelectorAll('.cart-count').forEach(node => {
    node.textContent = String(count);
    node.setAttribute('aria-label', `สินค้าในตะกร้า ${count} ชิ้น`);
  });
}

function replayClass(element, className) {
  element.classList.remove(className);
  void element.offsetWidth;
  element.classList.add(className);
  window.setTimeout(() => element.classList.remove(className), 700);
}

function flyToCart(button) {
  const target = document.querySelector('.cart-count')?.closest('a');
  if (!target || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const sourceBox = button.getBoundingClientRect();
  const targetBox = target.getBoundingClientRect();
  if (!sourceBox.width || !targetBox.width) return;

  const flyer = document.createElement('span');
  flyer.className = 'cart-add-flyer';
  flyer.setAttribute('aria-hidden', 'true');
  flyer.innerHTML = '<i class="bi bi-bag-check-fill"></i>';
  flyer.style.left = `${sourceBox.left + sourceBox.width / 2 - 18}px`;
  flyer.style.top = `${sourceBox.top + sourceBox.height / 2 - 18}px`;
  document.body.append(flyer);

  requestAnimationFrame(() => {
    const x = targetBox.left + targetBox.width / 2 - (sourceBox.left + sourceBox.width / 2);
    const y = targetBox.top + targetBox.height / 2 - (sourceBox.top + sourceBox.height / 2);
    flyer.style.transform = `translate3d(${x}px,${y}px,0) rotate(14deg) scale(.38)`;
    flyer.style.opacity = '0';
  });
  window.setTimeout(() => flyer.remove(), 760);
  replayClass(target, 'cart-add-target-pulse');
}

function setup() {
  addStyles();
  document.addEventListener('click', event => {
    const button = event.target.closest('.add-cart, .add-detail');
    if (!button || button.disabled) return;
    const previousCount = cartCount();
    window.setTimeout(() => {
      const nextCount = cartCount();
      if (nextCount <= previousCount) return;
      refreshCounts();
      flyToCart(button);
      replayClass(button, 'cart-added-pop');
    }, 0);
  }, true);
}

setup();
