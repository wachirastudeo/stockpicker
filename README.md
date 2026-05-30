# Stock Picker 📈

แดชบอร์ดคัดหุ้นสหรัฐเรียลไทม์ พร้อมข้อมูลตลาดและข่าวมาแรง สร้างด้วย Next.js 14 + Tailwind CSS

## ✨ ฟีเจอร์

- 📊 **ข้อมูลตลาดเรียลไทม์** - S&P 500, Nasdaq, Dow Jones, VIX
- 🔍 **Search & Filter** - ค้นหาหุ้นจากชื่อหรือรหัส
- ⭐ **Watchlist** - บันทึกหุ้นที่สนใจ (localStorage)
- 🏷️ **หมวดหมู่** - Tech / Finance / Healthcare / Energy
- 📱 **Responsive** - ใช้ได้บนทุกอุปกรณ์
- 🌓 **Dark Mode** - รองรับอัตโนมัติตามระบบ
- ⚡ **โหลดเร็ว** - Built-in caching & optimization

## 🚀 เริ่มต้นอย่างรวดเร็ว

### 1. ติดตั้ง Dependencies

```bash
npm install
```

### 2. ตั้งค่า API Key

#### Option A: Local Development
สร้างไฟล์ `.env.local` ในโฟลเดอร์ root:

```bash
FINNHUB_API_KEY=your_api_key_here
```

ได้ Free API Key จาก: https://finnhub.io (ไม่ต้อง credit card)

#### Option B: Vercel Deployment
ดูหัวข้อ "Deploy ไปยัง Vercel" ด้านล่าง

### 3. รันในโลคัล

```bash
npm run dev
```
เปิด http://localhost:3000

## 🌐 Deploy ไปยัง Vercel

### วิธีที่ 1: ผ่าน GitHub (แนะนำ)

1. สร้าง Finnhub API key จาก https://finnhub.io
2. Push code ขึ้น GitHub:
   ```bash
   git init
   git add .
   git commit -m "initial: stock picker dashboard"
   git branch -M main
   git remote add origin https://github.com/<YOUR_USERNAME>/stock-picker.git
   git push -u origin main
   ```
3. ไปที่ https://vercel.com/new → Import repo
4. ตั้งค่า Environment Variable:
   - Key: `FINNHUB_API_KEY`
   - Value: `your_api_key`
5. กด **Deploy** ✨

### วิธีที่ 2: ผ่าน Vercel CLI

```bash
npm i -g vercel
vercel
```
ตั้งค่า environment variable ตามที่ Vercel ถาม

## 📡 API Integration

แอปใช้ **Finnhub API** ดึงข้อมูลหุ้นจริง

- 📍 API Route: `/api/stocks`
- 🔄 Cache: 1 นาที (ป้องกัน rate limiting)
- 🔑 Key ถูกเก็บใน Server-side environment variable (ปลอดภัย)

### ข้อมูลที่ดึงมา
- ✅ ราคาปัจจุบัน (current price)
- ✅ การเปลี่ยนแปลงราคา (change & %)
- ✅ High/Low ของวัน
- ✅ ชื่อบริษัท

## 🎨 UI/UX Improvements

- ✨ Modern gradient design
- 🎯 Smooth animations & transitions
- 💫 Loading states & error handling
- 🎪 Beautiful modals for stock details
- 🔔 Trending news section
- 📊 Market summary cards

## 📝 ตัวแปร Environment

```env
# Finnhub API (บังคับ)
FINNHUB_API_KEY=sk_xxxxx

# ตัวเลือก
NEXT_PUBLIC_APP_NAME=Stock Picker
```

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State**: React Hooks
- **API**: Finnhub (Free tier available)
- **Hosting**: Vercel

## 📦 Dependencies

```json
{
  "next": "14.2.5",
  "react": "^18.3.1",
  "tailwindcss": "^3.4.6"
}
```

Minimal dependencies → ⚡ Fast & Secure

## ⚠️ สำคัญ

- ข้อมูลแสดงเพื่อการศึกษาเท่านั้น ไม่ใช่คำแนะนำการลงทุน
- อัตราการอัปเดต: ทุก 1 นาที (ตามข้อจำกัดของ free tier)
- Free API key มี rate limit ~60 requests/minute

## 🤝 Support

- Issues? เปิด GitHub issue
- API Help? ดู Finnhub docs: https://finnhub.io/docs/api
- Deployment Help? ดู Vercel docs: https://vercel.com/docs

---

**Built with ❤️ using Next.js + Tailwind CSS**
