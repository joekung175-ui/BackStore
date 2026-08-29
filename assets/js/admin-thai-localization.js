// แปลงคำที่อาจหลงเหลือจากชื่อไฟล์หรือคีย์รายงานให้เป็นภาษาไทยบนหลังบ้าน
const translations = new Map([
  ['บ้านใบชา admin', 'บ้านใบชา ผู้ดูแลร้าน'],
  ['dashboard', 'ภาพรวมร้านค้า'],
  ['products', 'สินค้า'],
  ['product-form', 'เพิ่ม / แก้ไขสินค้า'],
  ['categories', 'หมวดหมู่สินค้า'],
  ['inventory', 'สต็อกสินค้า'],
  ['orders', 'คำสั่งซื้อ'],
  ['finance', 'การเงิน'],
  ['reports', 'รายงาน'],
  ['settings', 'ตั้งค่าร้าน'],
  ['coupons', 'คูปอง'],
  ['staff', 'พนักงาน'],
  ['gross sales', 'ยอดขายก่อนหัก'],
  ['discounts', 'ส่วนลด'],
  ['refunds', 'คืนเงิน'],
  ['net sales', 'ยอดขายสุทธิ'],
  ['cogs', 'ต้นทุนสินค้า'],
  ['gross profit', 'กำไรขั้นต้น'],
  ['other income', 'รายรับอื่น'],
  ['expenses', 'รายจ่าย'],
  ['net profit', 'กำไรสุทธิ'],
  ['facebook url', 'ลิงก์ Facebook'],
  ['line url', 'ลิงก์ LINE']
]);

function normalize(value) {
  return String(value || '').replace(/\s+/g, ' ').trim().toLowerCase();
}

function translateNode(node) {
  const original = node.nodeValue;
  const translated = translations.get(normalize(original));
  if (!translated) return;
  const leading = original.match(/^\s*/)?.[0] || '';
  const trailing = original.match(/\s*$/)?.[0] || '';
  node.nodeValue = `${leading}${translated}${trailing}`;
}

function translateAdminText(root = document.body) {
  if (!root || !document.body?.dataset.page?.startsWith('admin')) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      return parent && !['SCRIPT', 'STYLE'].includes(parent.tagName)
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT;
    }
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(translateNode);
}

function initialize() {
  if (!document.body?.dataset.page?.startsWith('admin')) return;
  translateAdminText();
  new MutationObserver(records => {
    records.forEach(record => {
      if (record.type === 'characterData') translateNode(record.target);
      record.addedNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) translateNode(node);
        if (node.nodeType === Node.ELEMENT_NODE) translateAdminText(node);
      });
    });
  }).observe(document.body, { childList: true, subtree: true, characterData: true });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
else initialize();
