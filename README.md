# บ้านใบชา — ร้านค้าออนไลน์ภาษาไทย

เว็บแอปร้านค้าเดียวแบบ Vanilla JavaScript, Bootstrap 5 และ Supabase สำหรับหน้าร้าน, ตะกร้า, checkout, ระบบหลังบ้าน, สต็อก, การเงิน และรายงานกำไร–ขาดทุน

## เทคโนโลยี

- HTML5, CSS3, JavaScript ES Modules และ Vite
- Bootstrap 5 / Bootstrap Icons
- Supabase JavaScript SDK, PostgreSQL, Auth และ Storage
- Node test สำหรับตรรกะที่สำคัญ

ไม่มี React, Next.js, Vue, Angular, Tailwind, jQuery, TypeScript หรือ Service Role Key ในโค้ดเว็บไซต์

## ติดตั้งและรัน

1. ติดตั้ง Node.js รุ่น LTS แล้วรัน `npm install`
2. คัดลอก `.env.example` เป็น `.env` และใส่ค่า

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

3. เปิด Supabase SQL Editor แล้วรันตามลำดับ `supabase/schema.sql`, `supabase/policies.sql` แล้วจึงรันไฟล์ฟีเจอร์ที่ต้องการ
4. สร้าง Storage buckets: `product-images`, `payment-slips`, `expense-receipts`, `store-assets`
   - ตั้ง `product-images`, `store-assets` เป็น Public
   - ตั้ง `payment-slips`, `expense-receipts` เป็น Private
   - ใส่ MIME/ขนาดไฟล์ที่ bucket level เพิ่มเติมตามนโยบายองค์กร
5. ที่ Supabase Dashboard เปิด Email/Password provider และสร้างบัญชีเจ้าของร้านเอง จากนั้นกำหนด `app_metadata.role` เป็น `owner` ด้วยกระบวนการผู้ดูแลที่ปลอดภัย
6. รัน `npm run dev`, เปิด URL ที่ Vite แสดง

## คำสั่งตรวจสอบ

```bash
npm run lint
npm test
npm run build
```

## ความปลอดภัยและข้อควรทราบ

- ราคาและสต็อกถูกคำนวณใหม่ใน `create_order` ซึ่ง lock แถวสินค้าไว้ใน transaction
- `idempotency_key` ป้องกันคำสั่งซื้อและตัดสต็อกซ้ำ
- การยืนยันชำระเงินและยกเลิกคำสั่งซื้อเรียก PostgreSQL functions เท่านั้น
- สลิปใช้ชื่อ UUID ภายใต้โฟลเดอร์ tracking token และเป็น bucket private; เจ้าของร้านเท่านั้นที่อ่านได้
- Anon key ใช้บน browser ได้เฉพาะเมื่อ RLS ที่ให้มาตั้งค่าอย่างถูกต้อง ห้ามใส่ Service Role Key ใน `.env` ฝั่ง Vite
- ก่อนใช้งานจริง ควรเพิ่ม Edge Function สำหรับสร้าง signed upload URL ของสลิป และกำหนด custom claim `role=owner` จาก Admin API/แดชบอร์ดเท่านั้น

## โครงสร้าง

หน้าร้านอยู่ที่รากโปรเจกต์, หลังบ้านอยู่ใน `admin/`, JavaScript แยกตาม domain ใน `assets/js/`, และ SQL ของ Supabase อยู่ใน `supabase/`.

## Deploy

สร้าง production bundle ด้วย `npm run build` แล้ว deploy เฉพาะ `dist/` บนโฮสต์ที่รองรับ static SPA/multi-page app. ตั้งค่า environment variables บนผู้ให้บริการ deploy แยกจาก source code และตรวจ RLS ด้วยบัญชี anon ก่อนเปิดใช้งานจริง.
