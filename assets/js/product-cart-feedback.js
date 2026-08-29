import { cartCount, getCart } from './cart.js';

const styleId = 'product-cart-feedback-style';
const feedbackId = 'product-cart-feedback';
let scheduled = false;

function injectStyles() {
  if (document.getElementById(styleId)) return;

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    body[data-page="product"] .quantity-control { align-items:stretch; }
    body[data-page="product"] .add-detail.detail-cart-button--in-cart {
      position:relative;
      overflow:hidden;
      border-color:#0f754a;
      background:linear-gradient(135deg,#147448,#239b61);
      box-shadow:0 .55rem 1.1rem rgba(20,116,72,.2);
    }
    body[data-page="product"] .add-detail.detail-cart-button--in-cart::after {
      position:absolute;
      inset:0;
      content:"";
      background:linear-gradient(115deg,transparent 20%,rgba(255,255,255,.2) 44%,transparent 66%);
      transform:translateX(-115%);
      animation:product-cart-sheen .72s ease-out both;
      pointer-events:none;
    }
    body[data-page="product"] .add-detail.detail-cart-button--in-cart > * { position:relative; z-index:1; }
    body[data-page="product"] .detail-cart-feedback {
      display:flex;
      align-items:center;
      flex-wrap:wrap;
      gap:.55rem .75rem;
      margin-top:.8rem;
      min-height:2.8rem;
      padding:.62rem .75rem;
      border:1px solid #dce9de;
      border-radius:.85rem;
      background:linear-gradient(135deg,#f8fbf7,#eef7ef);
      color:#52705b;
      font-size:.88rem;
      line-height:1.35;
      transition:background .2s ease,border-color .2s ease,box-shadow .2s ease;
    }
    body[data-page="product"] .detail-cart-feedback__mark {
      display:grid;
      place-items:center;
      flex:0 0 auto;
      width:1.72rem;
      height:1.72rem;
      border-radius:50%;
      background:#e3f2e5;
      color:#24764b;
      font-size:.9rem;
    }
    body[data-page="product"] .detail-cart-feedback__copy { min-width:0; }
    body[data-page="product"] .detail-cart-feedback__copy strong { color:#175e3a; }
    body[data-page="product"] .detail-cart-feedback__link {
      display:inline-flex;
      align-items:center;
      gap:.35rem;
      margin-left:auto;
      padding:.34rem .63rem;
      border-radius:.62rem;
      background:#fff;
      color:#176443;
      font-weight:800;
      text-decoration:none;
      box-shadow:0 .2rem .55rem rgba(20,84,49,.08);
      transition:transform .18s ease,background .18s ease,box-shadow .18s ease;
    }
    body[data-page="product"] .detail-cart-feedback__link:hover {
      color:#0e4d30;
      background:#fefcf4;
      transform:translateY(-1px);
      box-shadow:0 .42rem .9rem rgba(20,84,49,.14);
    }
    body[data-page="product"] .detail-cart-feedback.is-in-cart {
      border-color:#b9dfc1;
      background:linear-gradient(135deg,#f3fbf4,#e8f5ea);
      box-shadow:0 .45rem .9rem rgba(30,105,61,.08);
      color:#347052;
    }
    body[data-page="product"] .detail-cart-feedback.is-in-cart .detail-cart-feedback__mark {
      background:#1c9257;
      color:#fff;
      box-shadow:0 .26rem .6rem rgba(23,113,63,.23);
    }
    @keyframes product-cart-sheen { to { transform:translateX(115%); } }
    @media (max-width:420px) {
      body[data-page="product"] .detail-cart-feedback { align-items:flex-start; }
      body[data-page="product"] .detail-cart-feedback__link { width:100%; justify-content:center; margin-left:0; }
    }
  `;
  document.head.append(style);
}

function getProductId() {
  return new URLSearchParams(window.location.search).get('id');
}

function getLine(productId) {
  try {
    return getCart().find(line => String(line.product_id) === String(productId));
  } catch {
    return null;
  }
}

function refreshHeaderCartCount() {
  let count = 0;
  try {
    count = cartCount();
  } catch {
    // The normal cart action will still surface its own error if local storage is unavailable.
  }
  document.querySelectorAll('.cart-count').forEach(node => {
    node.textContent = String(count);
    node.setAttribute('aria-label', `สินค้าในตะกร้า ${count} ชิ้น`);
  });
}

function updateButton(button, quantityInput, line) {
  if (!line?.quantity) {
    button.classList.remove('detail-cart-button--in-cart');
    button.removeAttribute('data-cart-quantity');
    button.setAttribute('aria-label', 'เพิ่มสินค้าลงตะกร้า');
    button.innerHTML = '<span><i class="bi bi-bag-plus" aria-hidden="true"></i> เพิ่มลงตะกร้า</span>';
    return;
  }

  const amountToAdd = Math.max(1, Number(quantityInput?.value) || 1);
  button.classList.add('detail-cart-button--in-cart');
  button.dataset.cartQuantity = String(line.quantity);
  button.setAttribute('aria-label', `มีสินค้าอยู่ในตะกร้าแล้ว ${line.quantity} ชิ้น เพิ่มอีก ${amountToAdd} ชิ้น`);
  button.innerHTML = `<span><i class="bi bi-bag-plus" aria-hidden="true"></i> เพิ่มอีก ${amountToAdd} ชิ้น</span>`;
}

function updateFeedback(feedback, line) {
  const mark = feedback.querySelector('.detail-cart-feedback__mark');
  const copy = feedback.querySelector('.detail-cart-feedback__copy');
  const link = feedback.querySelector('.detail-cart-feedback__link');
  const amount = Number(line?.quantity || 0);

  feedback.classList.toggle('is-in-cart', amount > 0);
  if (amount > 0) {
    mark.innerHTML = '<i class="bi bi-check-lg" aria-hidden="true"></i>';
    copy.innerHTML = `อยู่ในตะกร้าแล้ว <strong>${amount} ชิ้น</strong> · เพิ่มจำนวนได้อีกตามต้องการ`;
    link.hidden = false;
  } else {
    mark.innerHTML = '<i class="bi bi-bag" aria-hidden="true"></i>';
    copy.textContent = 'เลือกจำนวนที่ต้องการ แล้วเพิ่มสินค้านี้ลงตะกร้า';
    link.hidden = true;
  }
}

function createFeedback() {
  const feedback = document.createElement('div');
  feedback.id = feedbackId;
  feedback.className = 'detail-cart-feedback';
  feedback.setAttribute('role', 'status');
  feedback.setAttribute('aria-live', 'polite');
  feedback.setAttribute('aria-atomic', 'true');
  feedback.innerHTML = `
    <span class="detail-cart-feedback__mark" aria-hidden="true"></span>
    <span class="detail-cart-feedback__copy"></span>
    <a class="detail-cart-feedback__link" href="cart.html" hidden>ไปที่ตะกร้า <i class="bi bi-arrow-right" aria-hidden="true"></i></a>
  `;
  return feedback;
}

function mountCartFeedback() {
  if (document.body.dataset.page !== 'product') return;

  const productId = getProductId();
  const button = document.querySelector('.add-detail');
  const quantityInput = document.querySelector('#qty');
  if (!productId || !button || !quantityInput) return;

  let feedback = document.getElementById(feedbackId);
  if (!feedback) {
    feedback = createFeedback();
    button.closest('.quantity-control')?.insertAdjacentElement('afterend', feedback);
  }

  const refresh = () => {
    const line = getLine(productId);
    updateButton(button, quantityInput, line);
    updateFeedback(feedback, line);
    refreshHeaderCartCount();
  };

  refresh();

  if (button.dataset.cartFeedbackBound !== 'true') {
    button.dataset.cartFeedbackBound = 'true';
    button.addEventListener('click', () => {
      // The product page's original click handler adds to localStorage first. Queue this
      // refresh so the feedback always reads the final cart state, regardless of listener order.
      window.setTimeout(refresh, 0);
    });
    quantityInput.addEventListener('input', refresh);
  }
}

function scheduleMount() {
  if (scheduled) return;
  scheduled = true;
  window.requestAnimationFrame(() => {
    scheduled = false;
    mountCartFeedback();
  });
}

if (document.body.dataset.page === 'product') {
  injectStyles();
  new MutationObserver(scheduleMount).observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('storage', event => {
    if (event.key) scheduleMount();
  });
  scheduleMount();
}
