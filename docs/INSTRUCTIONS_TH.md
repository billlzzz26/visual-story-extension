# INSTRUCTIONS_TH.md — คำแนะนำการพัฒนาโปรเจ็ค

เอกสารนี้ออกแบบมาเพื่อใช้เป็นคู่มือสำหรับนักพัฒนาไทยที่ต้องการพัฒนาโค้ดในโปรเจ็ค `visual-story-extension` โดยเน้น:

- การเขียนโค้ดมาตรฐาน
- การคอมเม้นโค้ดเป็นภาษาไทยเพื่อการเรียนรู้
- UI แบบ mobile-first
- การใช้ `shadcn` และ `ai-element`
- แนวทางการ deploy บน Vercel ตาม Best Practice
- การให้ความสำคัญกับ UX และ performance
- อัปเดต `TODO.md` ทุกครั้งเมื่อจบงานใด ๆ

## 1. คำแนะนำทั่วไป

1. ใช้โครงสร้างไฟล์และแพ็กเกจที่มีอยู่แล้วในโปรเจ็ค ไม่เปลี่ยนโครงสร้างโดยไม่จำเป็น
2. เขียนโค้ดให้เข้าใจง่าย และคอมเม้นเป็นภาษาไทยเพื่ออธิบาย logic, ข้อจำกัด, และจุดสำคัญ
3. ใช้ style guide ตามที่กำหนดใน `AGENTS.md` และ `CLAUDE.md`
4. ถ้าทำงานกับ TypeScript ให้ใช้ `strict: true` และหลีกเลี่ยง `any`
5. เขียน unit test สำหรับฟีเจอร์ใหม่หรือ bug fix เพื่อยืนยันพฤติกรรม

## 2. โค้ดคอมเม้นภาษาไทย

- ใส่คอมเม้นอธิบาย intent ของฟังก์ชันหลัก และเหตุผลของการตัดสินใจ
- ถ้ารหัสซับซ้อน ให้เพิ่ม comment ที่อ่านง่ายและสั้น
- ตัวอย่าง:
  ```ts
  // ตรวจสอบว่า input เป็นข้อความเปล่าหรือไม่
  if (text.trim().length === 0) {
    return []
  }
  ```
- ไม่ต้องคอมเม้นทุกบรรทัด แต่ต้องคอมเม้นส่วนที่ยากหรือสำคัญ

## 3. UI Mobile-First

1. ออกแบบหน้าจอโดยเริ่มจากมือถือก่อน: เลย์เอาต์หลักต้องใช้งานได้ดีบนหน้าจอเล็ก
2. ให้แยก component ตามหน้าจอเล็กก่อน แล้วค่อยปรับขนาดขึ้นสำหรับ tablet/desktop
3. ใช้ระบบ responsive class ของ Tailwind หรือ utility class ของ `shadcn`
4. ให้คำนึงถึงความเร็วในการโหลดบนมือถือ: images, fonts, และ asset ต้องเรียกใช้น้อยที่สุด
5. ตรวจสอบ `packages/tauri-app` ถ้ามี UI ด้านหน้า ให้ปรับให้รองรับ viewport แบบมือถือด้วย

## 4. การใช้ `shadcn`

1. ถ้ามีการใช้งาน `shadcn/ui` ให้ตั้งชื่อ component ชัดเจนและ reusable
2. ใช้ component ที่ออกแบบไว้แล้วก่อนสร้าง component ใหม่
3. ถ้าต้องสร้าง component ใหม่ ให้ใช้ pattern ของ `shadcn` เช่น `button`, `card`, `input`, `dialog`
4. ปรับ theme สีและ spacing ให้สอดคล้องกับ UI ทั้งแอป
5. หากมีการทำ dark mode ให้รองรับทั้ง mobile และ desktop

## 5. การใช้ `ai-element`

1. หากต้องทำ UI ที่มีปฏิสัมพันธ์กับ AI หรือ chatbot ให้ใช้ `ai-element` ตาม component ของระบบ
2. ตรวจสอบ API contract และ state flow ว่ารองรับการแก้ไขข้อความหรือ interaction บนมือถือ
3. คอมเม้นบรรยาย flow ของ AI interaction เป็นไทย เช่น:
   ```ts
   // เมื่อผู้ใช้ส่งข้อความ ระบบจะส่งคำขอไปยังตัวประมวลผล AI
   // และอัปเดต state ของ conversation
   ```
4. คำนึงถึง latency: แสดง loading state ชัดเจน และอย่าให้หน้าจอค้าง

## 6. Vercel Best Practice

1. รักษาขนาด bundle ให้เล็กที่สุด: tree-shaking, lazy loading, และ import แบบ dynamic เฉพาะเมื่อจำเป็น
2. ใช้งาน Environment Variables ด้วย `VERCEL_ENV`, `NEXT_PUBLIC_...` และอย่าเก็บ secret ลงใน repo
3. ถ้า deploy บน Vercel ให้ตรวจสอบ `vercel.json` ว่ามี rewrites/redirects หรือ build settings ที่จำเป็น
4. ใช้ `pnpm` และ cache dependencies ใน pipeline เพื่อให้ build เร็ว
5. หากมี Next.js / Vite ให้เปิด `experimental.appDir` หรือ `esm` ตาม requirement ของโปรเจ็ค และอย่า disable optimizations
6. เก็บ assets เล็กที่สุดและใช้ CDN ของ Vercel เมื่อเป็นไปได้

## 7. UX First Performance

1. ให้คิดจากผู้ใช้ก่อนเสมอ: ฟีเจอร์ไหนช่วยให้งานเสร็จเร็วที่สุด
2. ลดจำนวนคลิกและลดความซับซ้อนของหน้าจอ
3. ใช้ skeleton loaders หรือ placeholder แทนการรอโหลดข้อมูล
4. เพิ่ม accessibility: keyboard navigation, focus state, aria label
5. ตรวจสอบ performance ด้วยเครื่องมือเช่น Lighthouse หรือ profile ใน browser

## 8. อัปเดต `TODO.md`

- ทุกครั้งที่จบงานให้แก้สถานะใน `TODO.md` ด้วย
- ถ้างานเสร็จให้เปลี่ยน `[]` เป็น `[x]`
- ถ้ากำลังทำอยู่ให้ใช้ `[~]`
- ถ้ามีงานใหม่เพิ่ม ให้เพิ่มรายการใหม่ในหมวดที่เหมาะสม และระบุ `type:` กับ `label:` ให้ชัดเจน

## 9. ตัวอย่างโครงสร้างการพัฒนา

1. อ่าน requirement แล้วเลือก issue/task ใน `TODO.md`
2. สร้าง branch ใหม่ตามงาน เช่น `feature/ui-mobile-first` หรือ `fix/vercel-config`
3. เขียนโค้ด พร้อมคอมเม้นภาษาไทยในส่วนสำคัญ
4. เขียน/ปรับ unit tests ถ้ามี
5. รัน `pnpm test` และ `pnpm run check`
6. อัปเดต `TODO.md` เมื่องานเสร็จหรือเปลี่ยนสถานะ
7. สร้าง PR พร้อมสรุปภาษาไทยสั้น ๆ และอ้างอิงงานใน TODO
