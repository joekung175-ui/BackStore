const captions = {
  'admin-dashboard': 'ภาพรวมยอดขาย สต็อก และรายการที่ต้องดำเนินการ',
  'admin-products': 'จัดการข้อมูลสินค้า ราคา และการแสดงผลหน้าร้าน',
  'admin-product-form': 'เพิ่มหรือแก้ไขสินค้าให้พร้อมขาย',
  'admin-inventory': 'ตรวจสอบสต็อกและเติมสินค้าได้จากหน้านี้',
  'admin-orders': 'ตรวจสอบสลิป อัปเดตสถานะ และการจัดส่ง',
  'admin-finance': 'ติดตามรายรับ รายจ่าย และยอดคงเหลือ',
  'admin-reports': 'สรุปผลประกอบการและส่งออกรายงาน',
  'admin-coupons': 'สร้างและควบคุมสิทธิ์ส่วนลดสำหรับลูกค้า',
  'admin-ai': 'ผู้ช่วยวิเคราะห์ข้อมูลร้านแบบ Local ไม่ส่งข้อมูลออกภายนอก',
  'admin-settings': 'ตั้งค่าข้อมูลร้าน การชำระเงิน และหน้าร้าน'
};

if (document.body.dataset.page?.startsWith('admin-')) {
  const mountCaption = () => {
    const header = document.querySelector('.admin-header');
    if (!header || header.querySelector('.admin-page-caption')) return;
    const caption = document.createElement('p');
    caption.className = 'admin-page-caption';
    caption.textContent = captions[document.body.dataset.page] || 'จัดการข้อมูลร้านของคุณ';
    header.append(caption);
  };

  new MutationObserver(mountCaption).observe(document.documentElement, { childList: true, subtree: true });
  mountCaption();
}
