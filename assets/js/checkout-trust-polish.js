const styleId = 'checkout-trust-polish-style';

function addStyles() {
  if (document.getElementById(styleId)) return;

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    body[data-page="checkout"] #checkout-progress-trust {
      position: relative;
      overflow: hidden;
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 1rem;
      align-items: center;
      margin: 0 0 1.35rem;
      padding: 1rem 1.15rem;
      border: 1px solid rgba(78, 117, 83, .17);
      border-radius: 1.15rem;
      background: linear-gradient(115deg, rgba(255,255,255,.95), rgba(240,247,237,.92));
      box-shadow: 0 .65rem 1.65rem rgba(25, 50, 41, .07);
    }
    body[data-page="checkout"] #checkout-progress-trust::after {
      content: "";
      position: absolute;
      width: 10rem;
      height: 10rem;
      right: -4.5rem;
      top: -6.5rem;
      border: 1.7rem solid rgba(183, 201, 178, .19);
      border-radius: 50%;
      pointer-events: none;
    }
    .checkout-progress-title {
      margin: 0 0 .56rem;
      color: #345947;
      font-size: .76rem;
      font-weight: 800;
      letter-spacing: .07em;
      text-transform: uppercase;
    }
    .checkout-progress-list {
      display: flex;
      gap: .5rem;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .checkout-progress-item {
      position: relative;
      display: flex;
      align-items: center;
      gap: .46rem;
      min-width: 0;
      color: #718075;
      font-size: .84rem;
      font-weight: 700;
    }
    .checkout-progress-item + .checkout-progress-item { margin-left: .78rem; }
    .checkout-progress-item + .checkout-progress-item::before {
      content: "";
      position: absolute;
      right: calc(100% + .35rem);
      width: .42rem;
      height: 1px;
      background: #c8d7c4;
    }
    .checkout-progress-number {
      display: grid;
      flex: 0 0 auto;
      place-items: center;
      width: 1.62rem;
      height: 1.62rem;
      border-radius: 50%;
      background: #e9f0e5;
      color: #557060;
      font-size: .74rem;
      line-height: 1;
    }
    .checkout-progress-item.is-complete .checkout-progress-number {
      color: #fff;
      background: #3d7a5a;
      box-shadow: 0 .25rem .55rem rgba(43, 109, 78, .2);
    }
    .checkout-progress-item.is-active { color: #1d513a; }
    .checkout-progress-item.is-active .checkout-progress-number {
      color: #fff;
      background: linear-gradient(135deg, #245842, #3e815e);
      box-shadow: 0 .3rem .75rem rgba(36, 88, 66, .24);
    }
    .checkout-progress-secure {
      position: relative;
      z-index: 1;
      display: inline-flex;
      align-items: center;
      gap: .46rem;
      padding: .52rem .7rem;
      border: 1px solid rgba(73, 121, 85, .18);
      border-radius: 999px;
      color: #35624a;
      background: rgba(255,255,255,.78);
      font-size: .75rem;
      font-weight: 800;
      white-space: nowrap;
    }
    .checkout-progress-secure i { color: #d67a5d; }
    body[data-page="checkout"] #checkout-trust-note {
      display: flex;
      gap: .72rem;
      align-items: flex-start;
      margin-top: 1rem;
      padding: .88rem .95rem;
      border: 1px solid rgba(103, 145, 108, .2);
      border-radius: .9rem;
      background: linear-gradient(135deg, #f7fbf5, #edf5ea);
      color: #486454;
    }
    body[data-page="checkout"] #checkout-trust-note .checkout-trust-icon {
      display: grid;
      flex: 0 0 auto;
      place-items: center;
      width: 2rem;
      height: 2rem;
      border-radius: .7rem;
      color: #fff;
      background: linear-gradient(135deg, #245842, #4b8d66);
      box-shadow: 0 .28rem .65rem rgba(36, 88, 66, .2);
    }
    body[data-page="checkout"] #checkout-trust-note strong,
    body[data-page="checkout"] #checkout-trust-note small { display: block; }
    body[data-page="checkout"] #checkout-trust-note strong { color: #234a35; font-size: .87rem; }
    body[data-page="checkout"] #checkout-trust-note small { margin-top: .1rem; color: #65756b; line-height: 1.55; }
    @media (max-width: 767.98px) {
      body[data-page="checkout"] #checkout-progress-trust { grid-template-columns: 1fr; gap: .75rem; padding: .95rem; }
      .checkout-progress-list { gap: .25rem; justify-content: space-between; }
      .checkout-progress-item { flex: 1; flex-direction: column; gap: .3rem; text-align: center; font-size: .67rem; line-height: 1.2; }
      .checkout-progress-item + .checkout-progress-item { margin-left: 0; }
      .checkout-progress-item + .checkout-progress-item::before { right: calc(50% + 1rem); top: .8rem; width: calc(100% - 1.55rem); }
      .checkout-progress-secure { width: max-content; max-width: 100%; font-size: .71rem; }
    }
  `;
  document.head.append(style);
}

function progressMarkup() {
  return `
    <div>
      <p class="checkout-progress-title">ขั้นตอนการสั่งซื้อ</p>
      <ol class="checkout-progress-list" aria-label="สถานะขั้นตอนการสั่งซื้อ">
        <li class="checkout-progress-item is-complete"><span class="checkout-progress-number"><i class="bi bi-check2" aria-hidden="true"></i></span><span>กรอกข้อมูล</span></li>
        <li class="checkout-progress-item is-active" aria-current="step"><span class="checkout-progress-number">2</span><span>ชำระเงิน</span></li>
        <li class="checkout-progress-item"><span class="checkout-progress-number">3</span><span>ยืนยันออเดอร์</span></li>
      </ol>
    </div>
    <div class="checkout-progress-secure"><i class="bi bi-shield-check" aria-hidden="true"></i><span>ข้อมูลสั่งซื้อปลอดภัย</span></div>
  `;
}

function updatePaymentNote() {
  const payment = document.querySelector('#checkout-form #payment');
  const note = document.querySelector('#checkout-trust-note');
  if (!note) return;

  const isPromptPay = payment?.value === 'promptpay';
  const title = isPromptPay ? 'สแกน QR แล้วแนบสลิปเพื่อยืนยัน' : 'ชำระเงินและแนบสลิปก่อนยืนยัน';
  const detail = isPromptPay
    ? 'โปรดตรวจสอบชื่อบัญชีและยอดเงินก่อนโอน จากนั้นแนบสลิปเพื่อให้ร้านตรวจสอบได้รวดเร็ว'
    : 'กรุณาตรวจสอบข้อมูลบัญชีและจำนวนเงินให้ถูกต้อง สลิปจะถูกส่งให้ร้านตรวจสอบก่อนดำเนินการ';

  note.innerHTML = `<span class="checkout-trust-icon"><i class="bi bi-shield-check" aria-hidden="true"></i></span><div><strong>${title}</strong><small>${detail}</small></div>`;
}

function mount() {
  if (document.body.dataset.page !== 'checkout') return;

  addStyles();
  const form = document.querySelector('#checkout-form');
  const main = document.querySelector('#app main.container');
  if (!form || !main) return;

  let progress = document.querySelector('#checkout-progress-trust');
  if (!progress) {
    progress = document.createElement('section');
    progress.id = 'checkout-progress-trust';
    progress.setAttribute('aria-label', 'ขั้นตอนการชำระเงิน');
    progress.innerHTML = progressMarkup();
    const row = main.querySelector(':scope > .row');
    if (row) row.before(progress);
    else main.prepend(progress);
  }

  let note = document.querySelector('#checkout-trust-note');
  const slipPanel = form.querySelector('#checkout-slip-panel');
  const submitButton = form.querySelector('[type="submit"]');
  if (!note && submitButton) {
    note = document.createElement('div');
    note.id = 'checkout-trust-note';
    note.setAttribute('role', 'note');
    if (slipPanel) slipPanel.after(note);
    else submitButton.before(note);
  } else if (note && slipPanel && note.previousElementSibling !== slipPanel) {
    slipPanel.after(note);
  }

  const payment = form.querySelector('#payment');
  if (payment && !payment.dataset.trustPolishBound) {
    payment.dataset.trustPolishBound = 'true';
    payment.addEventListener('change', updatePaymentNote);
  }
  updatePaymentNote();
}

if (document.body.dataset.page === 'checkout') {
  let queued = false;
  const scheduleMount = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      mount();
    });
  };

  const observer = new MutationObserver(scheduleMount);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  scheduleMount();
}
