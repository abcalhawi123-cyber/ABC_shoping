# 🧸 ABC الحاوي — E-Commerce

متجر ألعاب الأطفال الكامل | Node.js + React + MongoDB Atlas

---

## 📁 هيكل المشروع

```
abc-alhawi/
├── .env                    # بيانات السيرفر السرية
├── .gitignore
├── package.json
├── railway.toml            # إعدادات Railway
├── vercel.json             # إعدادات Vercel
├── server/
│   ├── app.js              # نقطة الدخول للسيرفر
│   ├── config/
│   │   ├── db.js           # اتصال MongoDB
│   │   └── cloudinary.js   # إعداد Cloudinary + Multer
│   ├── middleware/
│   │   ├── auth.js         # JWT + حماية المسارات
│   │   └── security.js     # Helmet, CORS, Rate Limit, XSS
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js      # مع low-stock auto-flag
│   │   ├── Order.js        # مع auto-restock عند الإرجاع
│   │   ├── Review.js       # مع auto-rating update
│   │   └── ShippingZone.js # محافظات قابلة للتعديل
│   └── routes/
│       ├── auth.routes.js
│       ├── product.routes.js
│       ├── order.routes.js
│       ├── review.routes.js
│       ├── shipping.routes.js
│       └── admin.routes.js  # مخفي بـ prefix سري
└── client/                  # React + Vite
    ├── .env                 # VITE_API_URL + VITE_ADMIN_PATH
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx          # Routing كامل
        ├── i18n/            # عربي + إنجليزي
        ├── api/             # Axios instance + كل الـ endpoints
        ├── context/         # Cart + Auth
        ├── components/      # Header, Footer, ProductCard, ...
        └── pages/
            ├── Home.jsx
            ├── Products.jsx
            ├── ProductDetail.jsx  # مع dynamic SEO
            ├── Cart.jsx
            ├── Checkout.jsx       # Guest + مسجل + كل طرق الدفع
            ├── OrderConfirmation.jsx
            ├── OrderTrack.jsx
            ├── Login.jsx
            ├── Register.jsx
            └── admin/
                ├── AdminLayout.jsx
                ├── AdminLogin.jsx
                ├── AdminDashboard.jsx
                ├── AdminProducts.jsx  # text inputs فقط
                ├── AdminOrders.jsx    # pipeline كامل
                ├── AdminShipping.jsx  # محافظات مصر كاملة
                └── AdminReports.jsx   # export Excel + PDF
```

---

## 🚀 خطوات التشغيل

### 1. نسخ المشروع
```bash
git clone https://github.com/YOUR_USERNAME/abc-alhawi.git
cd abc-alhawi
```

### 2. تثبيت الـ packages (Backend)
```bash
npm install
```

### 3. تثبيت الـ packages (Frontend)
```bash
cd client && npm install
```

### 4. ضبط ملف `.env` في الجذر
```
PORT=5000
MONGO_URI=mongodb://abcalhawi123_db_user:Gx740tFG4Un9jsCe@...
JWT_SECRET=8fK!mXz@2qL#nV$pR7wY&cA9eT0uB3hD5jG6iO1sN4kE
CLOUDINARY_CLOUD_NAME=dsfgoqmct
CLOUDINARY_API_KEY=875844286465396
CLOUDINARY_API_SECRET=KQwjCl2WJWcgfDZNPj_0bsUzu0Q
ADMIN_SECRET_KEY=al_hawi_for-children's-toys_from(0 to 9)
ADMIN_ROUTE_PREFIX=admin-al-hawi-sdG345cR2hdhvNvh56_D563h4f44C87B
CLIENT_URL=https://your-vercel-app.vercel.app
PAYMOB_API_KEY=         ← أضفها لاحقاً
PAYMOB_INTEGRATION_ID_CARD= ← أضفها لاحقاً
PAYMOB_IFRAME_ID=       ← أضفها لاحقاً
PAYMOB_HMAC_SECRET=     ← أضفها لاحقاً
```

### 5. ضبط `client/.env`
```
VITE_API_URL=https://your-railway-app.up.railway.app/api
VITE_ADMIN_PREFIX=admin-al-hawi-sdG345cR2hdhvNvh56_D563h4f44C87B
VITE_ADMIN_PATH=admin-al-hawi-sdG345cR2hdhvNvh56_D563h4f44C87B
```

### 6. تشغيل محلي
```bash
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend
cd client && npm run dev
```

---

## ☁️ Deploy على Railway (Backend)

1. ادفع الكود على GitHub
2. افتح [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. اختر الـ repo
4. في Variables أضف كل متغيرات `.env`
5. السيرفر هيشتغل تلقائياً على المنفذ الافتراضي

## ⚡ Deploy على Vercel (Frontend)

1. افتح [vercel.com](https://vercel.com) → New Project
2. اختر نفس الـ repo
3. **Root Directory:** `client`
4. **Build Command:** `npm run build`
5. **Output Directory:** `dist`
6. في Environment Variables أضف `VITE_API_URL` و `VITE_ADMIN_PREFIX` و `VITE_ADMIN_PATH`
7. بعد الـ deploy انسخ رابط Vercel وحدّث `CLIENT_URL` في Railway

---

## 🔐 إنشاء حساب الأدمين

بعد رفع السيرفر، شغّل هذا الكود مرة واحدة:

```js
// في Mongo Atlas → Browse Collections → Users
// أو عبر أي MongoDB client:
// أنشئ user بـ role: "admin" يدوياً، ثم استخدم صفحة:
// https://your-vercel-app.vercel.app/admin-al-hawi-sdG345cR2hdhvNvh56_D563h4f44C87B/login
```

أو عبر API مؤقتاً (احذف بعد الاستخدام):
```bash
curl -X POST https://your-railway.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Daniel","email":"admin@abcalhawi.com","password":"YourPass123","role":"admin"}'
```
ثم حدّث الـ role في Atlas مباشرة من `user` إلى `admin`.

---

## 🚢 إضافة محافظات الشحن

بعد تسجيل دخول الأدمين:
1. روح **لوحة التحكم** → **الشحن**
2. اضغط **"إضافة كل محافظات مصر"** → هيضيف كل الـ 27 محافظة بأسعار البريد المصري تلقائياً
3. عدّل أي سعر أو وقت توصيل من نفس الصفحة

---

## ✅ ملخص الأمان

| الميزة | التطبيق |
|--------|---------|
| Helmet | ✅ HTTP security headers |
| CORS | ✅ Vercel domain فقط |
| Rate Limiting | ✅ 100 req/15min عام، 10 للتسجيل، 5 للأدمين |
| NoSQL Injection | ✅ express-mongo-sanitize |
| XSS | ✅ xss-clean |
| HTTP Param Pollution | ✅ hpp |
| Password | ✅ bcrypt (12 rounds) |
| JWT | ✅ httpOnly + expiry 7 days |
| Admin Route | ✅ مخفية بـ prefix سري |
| Admin Key | ✅ double verification |
| File Upload | ✅ type + size validation |

---

## 📋 TODO (Paymob Integration)

عند حصولك على بيانات Paymob:
1. أضف `PAYMOB_API_KEY`, `PAYMOB_INTEGRATION_ID_CARD`, `PAYMOB_IFRAME_ID`, `PAYMOB_HMAC_SECRET` في Railway
2. أنشئ ملف `server/utils/paymob.js` لإنشاء payment tokens
3. أضف route `/api/orders/paymob-callback` لاستقبال الـ webhook
