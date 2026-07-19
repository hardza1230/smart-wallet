# วิธีสร้างไฟล์ APK ลงมือถือ (Android) + อัปเดตอัตโนมัติ

แอปนี้ถูกตั้งค่าเป็น **PWA (Progressive Web App)** ที่ติดตั้งได้จริง มี service worker
และระบบแจ้งเตือน "มีเวอร์ชันใหม่" ในตัวแล้ว จึงห่อเป็น APK ได้ทันที

วิธีที่แนะนำคือ **TWA (Trusted Web Activity)** — APK จะโหลดหน้าเว็บที่ deploy บน
Vercel เข้ามาแสดง ข้อดีคือ **พอ deploy โค้ดใหม่ แอปในมือถืออัปเดตเองอัตโนมัติ
ไม่ต้องลง APK ใหม่**

---

## วิธีที่ 0 — Auto-build APK อัตโนมัติด้วย GitHub Actions ⚡ (แบบเดียวกับที่โปรเจกต์อื่นทำได้)

ทำไมโปรเจกต์อื่น "สร้าง APK เองได้"? เพราะการ build ไปรันบนเครื่องที่มี **Android SDK**
(เช่น GitHub Actions) ไม่ใช่รันในเครื่องเรา — โปรเจกต์นี้ตั้งค่า CI แบบนั้นให้แล้วที่
`.github/workflows/build-apk.yml`

**ทำงานยังไง:** ทุกครั้งที่ push โค้ด GitHub จะ build เว็บ → ห่อด้วย Capacitor →
สร้างไฟล์ `.apk` ให้อัตโนมัติ

**โหลดไฟล์ APK:**
1. ไปที่ repo บน GitHub → แท็บ **Actions** → เลือก run ล่าสุดของ "Build Android APK"
2. เลื่อนลงล่าง → หัวข้อ **Artifacts** → โหลด **OurWallet-APK**
3. (ถ้า push เข้า `main`) จะมีใน **Releases → "Latest APK"** ให้โหลดตรง ๆ ด้วย
4. ส่งเข้ามือถือ → เปิดติดตั้ง (อนุญาต "ติดตั้งจากแหล่งที่ไม่รู้จัก")

> APK นี้เป็น **debug build** (เซ็นด้วย debug key) ติดตั้งใช้ส่วนตัวได้เลย ไม่ต้องตั้งค่าอะไรเพิ่ม
> ข้อมูลยังดึงสด ๆ จาก Firebase ตลอด — แต่ถ้าแก้ **หน้าตา UI** ต้องโหลด APK ตัวใหม่ (ที่ CI build ให้อัตโนมัติทุก push)
> ถ้าอยากให้ **UI อัปเดตเองโดยไม่ต้องลง APK ใหม่** ให้ใช้วิธีที่ 1 (TWA) ด้านล่างแทน

---

## สิ่งที่ต้องมีก่อน (สำหรับวิธี TWA)
1. **URL สาธารณะ (public)** ที่รันเวอร์ชันล่าสุด — เช่น production `https://smart-wallet-black.vercel.app`
   > ต้อง merge branch เข้า `main` ก่อน production ถึงจะเป็นเวอร์ชันใหม่ (preview URL เป็น private ใช้ทำ APK ไม่ได้)
2. เว็บต้องเปิดผ่าน **HTTPS** และผ่านเกณฑ์ PWA (มี manifest + service worker + icon) — ✅ ตั้งค่าให้แล้ว

---

## วิธีที่ 1 — PWABuilder (ง่ายสุด ไม่ต้องลง Android SDK) ⭐ แนะนำ

1. เปิด **https://www.pwabuilder.com**
2. ใส่ URL ของแอป (เช่น `https://smart-wallet-black.vercel.app`) แล้วกด **Start**
3. รอวิเคราะห์ — ควรผ่านทั้ง Manifest / Service Worker / Security
4. กด **Package For Stores** → เลือก **Android**
5. ตั้งค่า:
   - **Package ID**: เช่น `com.hartjah.wallet` (ตั้งครั้งเดียว ห้ามเปลี่ยนภายหลัง)
   - **App name**: `OurWallet`
   - **Signing key**: เลือก **"Create new"** แล้ว **ดาวน์โหลดไฟล์ .keystore + รหัสผ่านเก็บไว้ให้ดี**
     (ใช้เซ็นแอปทุกครั้งที่อัปเดต ถ้าหายต้องเปลี่ยน Package ID ใหม่ทั้งหมด)
6. กด **Generate** → ได้ไฟล์ zip ข้างในมี:
   - `*.apk` — ไฟล์สำหรับ **ติดตั้งทดสอบบนมือถือ** (sideload)
   - `*.aab` — สำหรับอัปขึ้น Google Play (ถ้าจะลง Store)
   - `assetlinks.json` — ไฟล์ยืนยันโดเมน (ดูขั้นตอนถัดไป)

### ติดตั้ง APK บนมือถือ
- ส่งไฟล์ `.apk` เข้ามือถือ (LINE/Drive/สาย USB)
- เปิดไฟล์ → อนุญาต **"ติดตั้งจากแหล่งที่ไม่รู้จัก" (Install unknown apps)** → ติดตั้ง

### ยืนยันโดเมน (เอาแถบ URL ออกให้เป็นแอปเต็มจอ)
1. เอาไฟล์ `assetlinks.json` จาก PWABuilder มาวางที่:
   ```
   public/.well-known/assetlinks.json
   ```
2. commit + push แล้วให้ Vercel deploy — ตรวจได้ที่
   `https://<โดเมน>/.well-known/assetlinks.json`
3. เปิดแอปใหม่ แถบ URL ด้านบนจะหายไป กลายเป็นแอปเต็มจอ

---

## การอัปเดตเวอร์ชันใหม่ (ตั้งค่าไว้ให้แล้ว ✅)

- **อัตโนมัติ**: เพราะ TWA โหลดหน้าเว็บสด ทุกครั้งที่ deploy โค้ดใหม่ขึ้น Vercel
  แอปจะแสดงเวอร์ชันใหม่เองเมื่อเปิดครั้งถัดไป
- **แจ้งเตือนในแอป**: ถ้าเปิดแอปค้างไว้แล้วมีเวอร์ชันใหม่ จะขึ้นแถบ
  **"✨ มีเวอร์ชันใหม่พร้อมใช้งาน [อัปเดต]"** ให้กดอัปเดตได้ทันที
  (ตรวจเช็คให้อัตโนมัติทุก 30 นาที — ดู `src/main.jsx`)

> ไม่ต้องสร้าง/ลง APK ใหม่เมื่อแก้โค้ด ยกเว้นเปลี่ยน icon, ชื่อแอป, หรือ Package ID

---

## วิธีที่ 2 — Capacitor (ฝังไฟล์ลง APK, ทำงาน offline ได้เต็มที่)

เหมาะถ้าอยากให้แอปทำงานแบบ native มากขึ้น แต่ **การอัปเดตต้อง build + ลง APK ใหม่ทุกครั้ง**
(หรือใช้บริการ live-update แยก) — ต้องมี **Android Studio + JDK**

```bash
npm install @capacitor/core @capacitor/android
npm install -D @capacitor/cli
npx cap init OurWallet com.hartjah.wallet --web-dir=dist
npm run build
npx cap add android
npx cap sync
npx cap open android      # เปิด Android Studio แล้ว Build > Build APK(s)
```

เพราะเหตุนี้ สำหรับ "อัปเดตเวอร์ชันใหม่อัตโนมัติ" จึง **แนะนำวิธีที่ 1 (TWA)** มากกว่า
