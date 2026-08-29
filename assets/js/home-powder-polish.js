const isHome = () => document.body?.dataset?.page === 'home';

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function addStyles() {
  if (document.getElementById('home-powder-polish-styles')) return;

  const style = document.createElement('style');
  style.id = 'home-powder-polish-styles';
  style.textContent = `
    body[data-page="home"] .home-powder {
      padding-top: 2rem !important;
    }
    body[data-page="home"] .home-powder .hero {
      background:
        radial-gradient(circle at 88% 12%, rgba(247, 207, 110, .28), transparent 16rem),
        linear-gradient(118deg, #123d2d 0%, #27634b 54%, #d8e4cf 54%);
    }
    body[data-page="home"] .home-powder .hero::after {
      content: "";
      position: absolute;
      inset: auto 49% 1.2rem auto;
      width: 5.75rem;
      height: 5.75rem;
      border: 1px solid rgba(255, 255, 255, .16);
      border-radius: 50%;
      box-shadow: 0 0 0 1.1rem rgba(255, 255, 255, .035);
      pointer-events: none;
    }
    body[data-page="home"] .home-powder .hero .display-4 {
      max-width: 13ch;
    }
    body[data-page="home"] .home-powder .hero-art {
      filter: saturate(.9) contrast(1.03);
    }
    .powder-hero-chips {
      display: flex;
      flex-wrap: wrap;
      gap: .45rem;
      margin: 1.15rem 0 1.45rem;
    }
    .powder-hero-chip {
      display: inline-flex;
      align-items: center;
      gap: .38rem;
      padding: .4rem .62rem;
      border: 1px solid rgba(255, 255, 255, .18);
      border-radius: 999px;
      background: rgba(9, 43, 30, .2);
      color: rgba(255, 255, 255, .9);
      font-size: .76rem;
      font-weight: 700;
      backdrop-filter: blur(5px);
    }
    .powder-hero-chip i { color: #ffd277; }
    .powder-value-strip {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: .75rem;
      margin: 1.1rem 0 3rem;
      padding: .75rem;
      border: 1px solid rgba(87, 124, 94, .16);
      border-radius: 1.35rem;
      background: rgba(255, 255, 255, .62);
      box-shadow: 0 .75rem 1.65rem rgba(25, 50, 41, .06);
    }
    .powder-value-item {
      display: flex;
      align-items: center;
      gap: .75rem;
      min-height: 4.25rem;
      padding: .7rem .8rem;
      border-radius: 1rem;
      transition: transform .2s ease, background-color .2s ease;
    }
    .powder-value-item:hover {
      background: #f5f9f1;
      transform: translateY(-2px);
    }
    .powder-value-icon {
      display: grid;
      flex: 0 0 auto;
      width: 2.55rem;
      height: 2.55rem;
      place-items: center;
      border-radius: .85rem;
      background: linear-gradient(135deg, #eaf3e5, #d2e6cc);
      color: #216044;
      font-size: 1.08rem;
    }
    .powder-value-item:nth-child(2) .powder-value-icon {
      background: linear-gradient(135deg, #fff2d6, #f6d997);
      color: #9a6100;
    }
    .powder-value-item:nth-child(3) .powder-value-icon {
      background: linear-gradient(135deg, #ffebe5, #f6c4b5);
      color: #a14c38;
    }
    .powder-value-copy strong,
    .powder-value-copy span {
      display: block;
    }
    .powder-value-copy strong {
      color: #1d4735;
      font-size: .9rem;
    }
    .powder-value-copy span {
      margin-top: .08rem;
      color: #718075;
      font-size: .78rem;
      line-height: 1.35;
    }
    .powder-section-kicker {
      display: flex;
      align-items: center;
      gap: .42rem;
      margin: 0 0 .35rem;
      color: #d66d52;
      font-size: .75rem;
      font-weight: 800;
      letter-spacing: .075em;
      text-transform: uppercase;
    }
    .powder-section-kicker::before {
      width: 1.4rem;
      height: 1px;
      background: currentColor;
      content: "";
    }
    body[data-page="home"] .home-powder #featured > div {
      animation: powder-card-in .5s both;
    }
    body[data-page="home"] .home-powder #featured > div:nth-child(2) { animation-delay: .06s; }
    body[data-page="home"] .home-powder #featured > div:nth-child(3) { animation-delay: .12s; }
    body[data-page="home"] .home-powder #featured > div:nth-child(4) { animation-delay: .18s; }
    .powder-product-card {
      position: relative;
      border-color: rgba(65, 111, 77, .16) !important;
    }
    .powder-product-card::before {
      position: absolute;
      z-index: 2;
      top: .78rem;
      right: .78rem;
      padding: .28rem .55rem;
      border: 1px solid rgba(255, 255, 255, .48);
      border-radius: 999px;
      background: rgba(22, 75, 52, .88);
      box-shadow: 0 .25rem .7rem rgba(15, 52, 35, .16);
      color: #fff;
      content: "ผลิตภัณฑ์ผง";
      font-size: .68rem;
      font-weight: 800;
      letter-spacing: .02em;
    }
    .powder-product-card .category-pill {
      color: #2e7453;
    }
    .powder-product-card .product-name::after {
      display: block;
      margin-top: .35rem;
      color: #8a9b8b;
      content: "ชงง่าย • เก็บสะดวก";
      font-size: .72rem;
      font-weight: 500;
    }
    .powder-featured-empty {
      grid-column: 1 / -1;
      padding: 1.4rem;
      border: 1px dashed #bfd0bc;
      border-radius: 1rem;
      color: #687b6e;
      text-align: center;
    }
    @keyframes powder-card-in {
      from { opacity: 0; transform: translateY(14px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @media (max-width: 767px) {
      body[data-page="home"] .home-powder { padding-top: 1rem !important; }
      body[data-page="home"] .home-powder .hero::after { display: none; }
      .powder-value-strip { grid-template-columns: 1fr; gap: .15rem; margin-bottom: 2.2rem; }
      .powder-value-item { min-height: 3.8rem; }
    }
    @media (prefers-reduced-motion: reduce) {
      .powder-value-item,
      body[data-page="home"] .home-powder #featured > div { animation: none !important; transition: none !important; }
    }
  `;
  document.head.append(style);
}

function createHeroChips() {
  const chips = el('div', 'powder-hero-chips');
  chips.setAttribute('aria-label', 'จุดเด่นผลิตภัณฑ์');

  [
    ['bi-cup-hot', 'ชงง่ายในทุกวัน'],
    ['bi-leaf', 'คัดวัตถุดิบ'],
    ['bi-box-seam', 'แพ็กพร้อมส่ง'],
  ].forEach(([icon, label]) => {
    const chip = el('span', 'powder-hero-chip');
    const symbol = el('i', `bi ${icon}`);
    symbol.setAttribute('aria-hidden', 'true');
    chip.append(symbol, document.createTextNode(label));
    chips.append(chip);
  });

  return chips;
}

function createValueStrip() {
  const section = el('section', 'powder-value-strip');
  section.setAttribute('aria-label', 'เหตุผลที่เลือกผลิตภัณฑ์ผงบ้านใบชา');

  [
    ['bi-stars', 'คัดสูตรอย่างตั้งใจ', 'รสชัด ชงได้ทุกแก้ว'],
    ['bi-clock-history', 'ชงง่าย ประหยัดเวลา', 'ละลายไว ใช้ได้ทุกวัน'],
    ['bi-truck', 'แพ็กและจัดส่งไว', 'ติดตามออเดอร์ได้ตลอด'],
  ].forEach(([icon, title, detail]) => {
    const item = el('div', 'powder-value-item');
    const iconWrap = el('span', 'powder-value-icon');
    const symbol = el('i', `bi ${icon}`);
    symbol.setAttribute('aria-hidden', 'true');
    iconWrap.append(symbol);

    const copy = el('div', 'powder-value-copy');
    copy.append(el('strong', '', title), el('span', '', detail));
    item.append(iconWrap, copy);
    section.append(item);
  });

  return section;
}

function enhanceHome() {
  if (!isHome()) return false;

  addStyles();
  const main = document.querySelector('#app main.container');
  const hero = main?.querySelector('.hero');
  if (!main || !hero) return false;

  main.classList.add('home-powder');
  const eyebrow = hero.querySelector('.text-warning');
  const heading = hero.querySelector('h1');
  const lead = hero.querySelector('.lead');
  const heroArt = hero.querySelector('.hero-art');

  if (eyebrow) eyebrow.textContent = 'ผลิตภัณฑ์ผงคัดพิเศษ';
  if (heading) heading.textContent = 'ชงง่าย อร่อยได้ทุกวัน';
  if (lead) lead.textContent = 'รวมผงชาและสมุนไพรคุณภาพดี สำหรับทุกแก้วที่คุณอยากดื่ม';
  if (heroArt) heroArt.setAttribute('aria-label', 'ผลิตภัณฑ์ผงชงดื่มจากบ้านใบชา');

  const heroButton = hero.querySelector('.btn');
  if (heroButton) {
    heroButton.innerHTML = '<span>เลือกผลิตภัณฑ์ผง</span><i class="bi bi-arrow-right" aria-hidden="true"></i>';
  }
  if (!hero.querySelector('.powder-hero-chips')) {
    const chips = createHeroChips();
    if (heroButton) heroButton.before(chips);
    else hero.querySelector('.col-lg-6')?.append(chips);
  }

  const featured = main.querySelector('#featured');
  const featuredSection = featured?.closest('section');
  if (featuredSection) {
    const title = featuredSection.querySelector('.section-title');
    if (title) {
      title.textContent = 'ผลิตภัณฑ์ผงแนะนำ';
      if (!title.previousElementSibling?.classList.contains('powder-section-kicker')) {
        title.before(el('p', 'powder-section-kicker', 'เลือกสูตรที่ใช่สำหรับคุณ'));
      }
    }
    const viewAll = featuredSection.querySelector('a[href="products.html"]');
    if (viewAll) {
      viewAll.textContent = 'ดูผลิตภัณฑ์ทั้งหมด';
      viewAll.setAttribute('aria-label', 'ดูผลิตภัณฑ์ผงทั้งหมด');
    }
  }

  if (!main.querySelector('.powder-value-strip')) {
    hero.after(createValueStrip());
  }

  if (featured) {
    featured.querySelectorAll('.product-card').forEach(card => card.classList.add('powder-product-card'));
    if (!featured.children.length && !featured.querySelector('.powder-featured-empty')) {
      featured.append(el('div', 'powder-featured-empty', 'กำลังเตรียมผลิตภัณฑ์ผงแนะนำให้คุณ'));
    }
  }

  return true;
}

if (isHome()) {
  const observer = new MutationObserver(() => {
    if (enhanceHome()) observer.disconnect();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  if (enhanceHome()) observer.disconnect();
}
