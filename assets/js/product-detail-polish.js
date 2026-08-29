import { getProducts } from './store.js';
import { money } from './utils.js';

const styleId = 'product-detail-polish-style';
const powderCategories = new Set(['ผงชาเขียว', 'ผงมัจฉะ', 'ผงชาสมุนไพร', 'ผงชาต่างๆ']);

const createNode = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

const icon = name => {
  const node = createNode('i', `bi bi-${name}`);
  node.setAttribute('aria-hidden', 'true');
  return node;
};

function injectStyles() {
  if (document.getElementById(styleId)) return;
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    .product-guide-section{margin-top:3.5rem;padding-top:2.25rem;border-top:1px solid #dce7da;color:#183e2e}
    .product-guide-intro{position:relative;overflow:hidden;padding:1.4rem 1.5rem;border-radius:1.35rem;background:linear-gradient(125deg,#143e2e,#2e7053 62%,#6d9c75);color:#fff;box-shadow:0 1rem 2rem rgba(20,62,46,.15)}
    .product-guide-intro:after{content:"";position:absolute;right:-4rem;top:-5.5rem;width:14rem;height:14rem;border:1px solid rgba(255,255,255,.22);border-radius:50%;box-shadow:0 0 0 2rem rgba(255,255,255,.045)}
    .product-guide-kicker{position:relative;z-index:1;display:inline-flex;align-items:center;gap:.45rem;margin:0 0 .38rem;color:#f7ce77;font-size:.77rem;font-weight:800;letter-spacing:.05em;text-transform:uppercase}
    .product-guide-intro h2{position:relative;z-index:1;margin:0;font-size:clamp(1.28rem,2vw,1.75rem);font-weight:800}
    .product-guide-intro p{position:relative;z-index:1;max-width:45rem;margin:.48rem 0 0;color:rgba(255,255,255,.84)}
    .product-guide-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1rem;margin-top:1rem}
    .product-guide-card{height:100%;padding:1.25rem;border:1px solid #dbe7da;border-radius:1.15rem;background:linear-gradient(145deg,#fff,#f7fbf6);box-shadow:0 .6rem 1.4rem rgba(28,67,45,.055)}
    .product-guide-card__icon{display:grid;place-items:center;width:2.55rem;height:2.55rem;margin-bottom:.8rem;border-radius:.85rem;background:#e6f2e8;color:#176044;font-size:1.15rem}
    .product-guide-card h3{margin:0 0 .48rem;font-size:1rem;font-weight:800}
    .product-guide-card p{margin:0;color:#52685a;font-size:.92rem;line-height:1.65}
    .product-guide-card ol{display:grid;gap:.45rem;margin:.05rem 0 0;padding-left:1.2rem;color:#52685a;font-size:.9rem;line-height:1.5}
    .product-guide-card li::marker{color:#1e7452;font-weight:800}
    .product-trust-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.75rem;margin-top:1rem}
    .product-trust-card{display:flex;align-items:center;gap:.72rem;padding:.84rem .9rem;border-radius:1rem;background:#fffaf0;border:1px solid #f0dfbd}
    .product-trust-card i{display:grid;place-items:center;flex:0 0 auto;width:2rem;height:2rem;border-radius:50%;background:#f4d58b;color:#5a4320;font-size:.9rem}
    .product-trust-card strong,.product-trust-card span{display:block}.product-trust-card strong{font-size:.86rem}.product-trust-card span{color:#697369;font-size:.76rem;line-height:1.35}
    .related-powders{margin-top:2.5rem}.related-powders__heading{display:flex;align-items:end;justify-content:space-between;gap:1rem;margin-bottom:1rem}.related-powders__heading h2{margin:0;font-size:1.25rem;font-weight:800}.related-powders__heading p{margin:0;color:#66756b;font-size:.88rem}
    .related-powders__grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1rem}.related-powder-card{display:flex;flex-direction:column;min-width:0;overflow:hidden;border:1px solid #dce8db;border-radius:1.1rem;background:#fff;box-shadow:0 .5rem 1.2rem rgba(28,67,45,.055);text-decoration:none;color:#183e2e;transition:transform .2s ease,box-shadow .2s ease}.related-powder-card:hover{color:#183e2e;transform:translateY(-4px);box-shadow:0 .95rem 1.8rem rgba(28,67,45,.13)}
    .related-powder-card img{width:100%;height:9.6rem;object-fit:cover;background:#e8f0e4}.related-powder-card__body{padding:.9rem}.related-powder-card__category{margin:0 0 .32rem;color:#6c8372;font-size:.72rem;font-weight:700}.related-powder-card__name{display:-webkit-box;overflow:hidden;margin:0;-webkit-box-orient:vertical;-webkit-line-clamp:2;font-size:.9rem;font-weight:800;line-height:1.45}.related-powder-card__price{display:block;margin-top:.66rem;color:#166044;font-size:.95rem;font-weight:900}
    .related-powders__empty{margin:0;padding:1rem;border:1px dashed #bed0bd;border-radius:1rem;color:#63756a;text-align:center}
    @media (max-width:991px){.product-guide-grid{grid-template-columns:1fr}.related-powders__grid{grid-template-columns:repeat(2,minmax(0,1fr))}.product-trust-grid{grid-template-columns:1fr}}
    @media (max-width:480px){.product-guide-section{margin-top:2.4rem}.product-guide-intro{padding:1.2rem}.related-powder-card img{height:7.5rem}.related-powders__heading{align-items:start;flex-direction:column;gap:.35rem}}
  `;
  document.head.append(style);
}

function productProfile(product) {
  const name = String(product.name || '');
  const category = String(product.category || '');
  const source = `${name} ${category}`;

  if (/มัทฉะ.*ลาเต้|ลาเต้/i.test(source)) {
    return {
      flavour: 'ละมุนครีมมี่ หอมมัทฉะ ดื่มง่าย',
      brew: ['ตักผง 2–3 ช้อนชาใส่แก้ว', 'เติมน้ำอุ่นเล็กน้อยแล้วคนให้ละลาย', 'เติมนมหรือน้ำแข็งตามชอบ'],
      ingredients: 'ผงชาเขียวมัทฉะและส่วนผสมสำหรับลาเต้',
      storage: 'ปิดซองให้สนิท เก็บในที่แห้งและพ้นแสงแดด'
    };
  }
  if (/มัทฉะ/i.test(source)) {
    return {
      flavour: 'อูมามิละมุน กลิ่นชาเขียวสดชัด',
      brew: ['ร่อนผง 1–2 กรัมลงถ้วย', 'เติมน้ำ 70–80°C ประมาณ 60 มล.', 'ตีจนเนียนฟู แล้วดื่มทันที'],
      ingredients: 'ผงมัทฉะบดละเอียด',
      storage: 'ปิดซองให้สนิท เก็บให้พ้นความชื้นและกลิ่นรบกวน'
    };
  }
  if (/ขิง|ขมิ้น|กระเจี๊ยบ|สมุนไพร/i.test(source)) {
    return {
      flavour: 'กลิ่นสมุนไพรหอมอุ่น ดื่มง่ายในทุกวัน',
      brew: ['ตักผง 1–2 ช้อนชา', 'เติมน้ำร้อน 150–180 มล.', 'คนให้เข้ากัน ปรุงหวานได้ตามชอบ'],
      ingredients: 'ผงชาสมุนไพรตามสูตรของสินค้า',
      storage: 'เก็บในภาชนะปิดสนิท หลีกเลี่ยงความชื้นและแสงแดด'
    };
  }
  if (/ชาไทย/i.test(source)) {
    return {
      flavour: 'หอมชาไทยเข้มข้น กลมกล่อมแบบร้านเครื่องดื่ม',
      brew: ['ตักผง 2 ช้อนชา', 'ละลายกับน้ำอุ่น 60 มล.', 'เติมนมหรือน้ำแข็งเพื่อรสชาติที่ชอบ'],
      ingredients: 'ผงชาไทยและส่วนผสมตามสูตร',
      storage: 'เก็บในที่แห้ง เย็น และปิดซองทันทีหลังใช้'
    };
  }
  if (/มะลิ/i.test(source)) {
    return {
      flavour: 'กลิ่นมะลิหอมละมุน รสชาสบาย ๆ',
      brew: ['ตักผง 1–2 ช้อนชา', 'เติมน้ำอุ่น 150 มล.', 'คนให้ละลายและเสิร์ฟได้ทันที'],
      ingredients: 'ผงชามะลิปรุงแต่งตามสูตร',
      storage: 'เก็บในที่แห้งและเย็น ปิดซองให้สนิททุกครั้ง'
    };
  }
  return {
    flavour: 'กลิ่นชาอบอุ่น รสนุ่ม ปรับความเข้มได้ตามชอบ',
    brew: ['ตักผง 1–2 ช้อนชา', 'เติมน้ำอุ่น 150 มล.', 'คนให้ละลาย แล้วเติมนมหรือน้ำแข็งได้'],
    ingredients: 'ผลิตภัณฑ์ผงชาตามสูตรของสินค้า',
    storage: 'เก็บในที่แห้งและเย็น ปิดซองให้สนิทหลังใช้งาน'
  };
}

function isPowderProduct(product) {
  return String(product.name || '').trim().startsWith('ผง') || powderCategories.has(String(product.category || '').trim());
}

function addInfoCard(grid, iconName, title, content) {
  const card = createNode('article', 'product-guide-card');
  const iconWrap = createNode('span', 'product-guide-card__icon');
  iconWrap.append(icon(iconName));
  card.append(iconWrap, createNode('h3', '', title));
  if (Array.isArray(content)) {
    const list = createNode('ol');
    content.forEach(step => list.append(createNode('li', '', step)));
    card.append(list);
  } else {
    card.append(createNode('p', '', content));
  }
  grid.append(card);
}

function addTrustCard(grid, iconName, title, description) {
  const card = createNode('div', 'product-trust-card');
  const iconWrap = createNode('i', `bi bi-${iconName}`);
  iconWrap.setAttribute('aria-hidden', 'true');
  const copy = createNode('div');
  copy.append(createNode('strong', '', title), createNode('span', '', description));
  card.append(iconWrap, copy);
  grid.append(card);
}

function createRelatedCard(product) {
  const link = createNode('a', 'related-powder-card');
  link.href = `product.html?id=${encodeURIComponent(product.id)}`;
  link.setAttribute('aria-label', `ดูรายละเอียด ${product.name}`);
  const image = document.createElement('img');
  image.loading = 'lazy';
  image.src = product.image_url || '/assets/images/product-placeholder.svg';
  image.alt = product.name || 'ผลิตภัณฑ์ผง';
  const body = createNode('div', 'related-powder-card__body');
  body.append(
    createNode('p', 'related-powder-card__category', product.category || 'ผลิตภัณฑ์ผง'),
    createNode('h3', 'related-powder-card__name', product.name || 'ผลิตภัณฑ์ผง')
  );
  const price = createNode('strong', 'related-powder-card__price', money(product.price_satang));
  body.append(price);
  link.append(image, body);
  return link;
}

function createSection(product, products) {
  const profile = productProfile(product);
  const section = createNode('section', 'product-guide-section');
  section.dataset.productDetailPolish = 'true';
  section.setAttribute('aria-label', 'ข้อมูลผลิตภัณฑ์และสินค้าเกี่ยวข้อง');

  const intro = createNode('div', 'product-guide-intro');
  const kicker = createNode('p', 'product-guide-kicker');
  kicker.append(icon('stars'), document.createTextNode('คู่มือผลิตภัณฑ์ผง'));
  const introCopy = product.description || 'เลือกความเข้มและปรับเป็นเมนูร้อนได้ตามสไตล์ที่คุณชอบ';
  intro.append(kicker, createNode('h2', '', 'ชงให้อร่อยในแบบของคุณ'), createNode('p', '', introCopy));
  section.append(intro);

  const guideGrid = createNode('div', 'product-guide-grid');
  addInfoCard(guideGrid, 'cup-hot', 'รสชาติและคาแรกเตอร์', profile.flavour);
  addInfoCard(guideGrid, 'list-check', 'วิธีชงแนะนำ', profile.brew);
  addInfoCard(guideGrid, 'shield-check', 'ส่วนผสมและการเก็บรักษา', `${profile.ingredients} · ${profile.storage}`);
  section.append(guideGrid);

  const trustGrid = createNode('div', 'product-trust-grid');
  addTrustCard(trustGrid, 'box-seam', product.available_stock > 0 ? 'พร้อมแพ็กและจัดส่ง' : 'แจ้งเตือนเมื่อเติมสินค้า', product.available_stock > 0 ? 'ตรวจสอบสต็อกก่อนยืนยันทุกออเดอร์' : 'สินค้ารายการนี้กำลังรอเติมสต็อก');
  addTrustCard(trustGrid, 'patch-check', 'เลือกอย่างใส่ใจ', 'รายละเอียดสินค้าและราคาดูได้ก่อนตัดสินใจ');
  addTrustCard(trustGrid, 'chat-heart', 'ดูแลโดยร้าน', 'สอบถามข้อมูลสินค้าก่อนสั่งซื้อได้เสมอ');
  section.append(trustGrid);

  const related = createNode('section', 'related-powders');
  const relatedHead = createNode('div', 'related-powders__heading');
  const headingCopy = createNode('div');
  headingCopy.append(createNode('h2', '', 'ผลิตภัณฑ์ผงที่คุณอาจชอบ'), createNode('p', '', 'เลือกจากกลุ่มผลิตภัณฑ์ผงของบ้านใบชา'));
  relatedHead.append(headingCopy);
  const viewAll = createNode('a', 'btn btn-outline-primary btn-sm', 'ดูผลิตภัณฑ์ทั้งหมด');
  viewAll.href = 'products.html';
  relatedHead.append(viewAll);
  related.append(relatedHead);

  const sameCategory = products.filter(item => item.id !== product.id && isPowderProduct(item) && item.category === product.category);
  const otherPowders = products.filter(item => item.id !== product.id && isPowderProduct(item) && item.category !== product.category);
  const relatedProducts = [...sameCategory, ...otherPowders].slice(0, 4);
  if (relatedProducts.length) {
    const grid = createNode('div', 'related-powders__grid');
    relatedProducts.forEach(item => grid.append(createRelatedCard(item)));
    related.append(grid);
  } else {
    related.append(createNode('p', 'related-powders__empty', 'ผลิตภัณฑ์ที่เกี่ยวข้องจะแสดงที่นี่เมื่อเพิ่มสินค้าในร้านมากขึ้น'));
  }
  section.append(related);
  return section;
}

let isRendering = false;
let scheduled = false;

async function mountProductDetailPolish() {
  if (document.body.dataset.page !== 'product' || isRendering) return;
  const id = new URLSearchParams(window.location.search).get('id');
  const main = document.querySelector('#app main.container');
  const title = main?.querySelector('h1');
  if (!id || !main || !title || main.querySelector('[data-product-detail-polish]')) return;

  isRendering = true;
  try {
    const products = await getProducts();
    const product = products.find(item => String(item.id) === id);
    if (!product || main.querySelector('[data-product-detail-polish]')) return;
    if (!main.isConnected || new URLSearchParams(window.location.search).get('id') !== id) return;
    main.append(createSection(product, products));
  } catch (error) {
    // Keep the original product page usable if supplementary information cannot load.
    console.warn('Product detail enhancement could not be loaded.', error);
  } finally {
    isRendering = false;
  }
}

function scheduleMount() {
  if (scheduled) return;
  scheduled = true;
  window.requestAnimationFrame(() => {
    scheduled = false;
    mountProductDetailPolish();
  });
}

if (document.body.dataset.page === 'product') {
  injectStyles();
  const observer = new MutationObserver(scheduleMount);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  scheduleMount();
}
