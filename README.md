# Uzum Online - E-commerce Platform

Online do'kon uchun to'liq funksional web ilovasi. Node.js, Express, SQLite va modern frontend texnologiyalari bilan qurilgan.

## 🚀 Xususiyatlar

### Authentication & Security
- ✅ **JWT (JSON Web Token)** autentifikatsiya
- ✅ **Session Management** - Express session bilan
- ✅ **Rate Limiting** - Login urinishlarini cheklash (15 daqiqada 5 ta)
- ✅ **Password Hashing** - bcrypt bilan xavfsiz parol shifrlash
- ✅ **Remember Me** funksiyasi (30 kunlik token)
- ✅ **Secure Cookies** - HttpOnly cookies
- ✅ **Token Verification** middleware

### Foydalanuvchi Boshqaruvi
- 📝 Ro'yxatdan o'tish (Register)
- 🔐 Kirish (Login)
- 👤 Profil sahifasi
- ✏️ Profil ma'lumotlarini tahrirlash
- 🔒 Parolni o'zgartirish
- 🚪 Xavfsiz chiqish (Logout)

### Mahsulotlar
- 📦 Mahsulotlar ro'yxati (8 ta professional mahsulot)
- 🖼️ **Unsplash API** integratsiyasi - yuqori sifatli rasmlar
- 🏷️ Kategoriya filtrlash (Elektronika, Kiyim, Uy-joy, Sport)
- 🔍 Real-time qidiruv
- ⭐ Reyting ko'rsatish (yulduzchalar)
- 💸 Chegirma badgelari
- ❤️ Wishlist funksiyasi
- 🛒 Savat (Cart) boshqaruvi
- 📄 Sahifalash (8 mahsulot/sahifa)

### UI/UX (Uzum.uz dizayni)
- 🎨 Zamonaviy purple gradient (#7000FF)
- 🔍 Navbar bilan qidiruv tizimi
- 🛒 Cart badge (real-time hisoblagich)
- 👤 Profil tugmasi
- 🏷️ Kategoriya tanlash
- ✨ Hover animatsiyalari
- 📱 To'liq responsive dizayn
- 🌐 O'zbekcha interfeys

## 🛠️ Texnologiyalar

### Backend
- **Node.js** - Server muhiti
- **Express.js** - Web framework
- **SQLite3** - Ma'lumotlar bazasi
- **JWT (jsonwebtoken)** - Token autentifikatsiya
- **bcrypt** - Parol shifrlash
- **express-session** - Session boshqaruvi
- **express-rate-limit** - Rate limiting
- **cookie-parser** - Cookie boshqaruvi
- **dotenv** - Environment variables
- **unsplash-js** - Unsplash API SDK
- **node-fetch** - HTTP requests

### Frontend
- **HTML5**
- **CSS3** (CSS Variables, Flexbox, Grid, Animations)
- **JavaScript (ES6+)**
- **Fetch API** - AJAX so'rovlari
- **LocalStorage** - Wishlist va Cart saqlash

## 📦 O'rnatish

### Talablar
- Node.js (v14 yoki yuqori)
- npm yoki yarn

### Qadamlar

1. Repository ni clone qiling:
```bash
git clone https://github.com/Asomiddin1/uzum-online.git
cd uzum-online
```

2. Dependencies ni o'rnating:
```bash
npm install
```

3. `.env` faylini sozlang:
```bash
# .env faylini yarating va quyidagilarni kiriting:
UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here
PORT=3000
JWT_SECRET=your-jwt-secret-key
SESSION_SECRET=your-session-secret-key
```

**Unsplash API kalitini olish:**
- https://unsplash.com/developers saytiga kiring
- "Register as a developer" tugmasini bosing
- "New Application" yarating
- Access Key ni nusxalab, `.env` fayliga qo'ying

4. Serverni ishga tushiring:
```bash
npm run dev
```

5. Brauzeringizda oching:
```
http://localhost:3000
```

6. (Ixtiyoriy) Mahsulot rasmlarini Unsplash dan yuklab olish:
```bash
# Browser da yoki Postman orqali:
POST http://localhost:3000/api/unsplash/sync-all
```
Bu barcha mahsulotlar uchun Unsplash dan yuqori sifatli rasmlarni yuklab, database'ga saqlaydi.

## 🔐 Xavfsizlik Xususiyatlari

### Implemented
✅ JWT token autentifikatsiya
✅ Password hashing (bcrypt)
✅ Rate limiting (5 urinish/15 daqiqa)
✅ HttpOnly cookies
✅ Session management
✅ Authorization checks
✅ Input validation

### Production uchun tavsiyalar
- [ ] HTTPS ishlatish (cookie secure: true)
- [ ] Environment variables (.env fayli)
- [ ] CSRF protection qo'shish
- [ ] SQL injection himoyasi (prepared statements)
- [ ] XSS himoyasi
- [ ] Helmet.js middleware
- [ ] CORS konfiguratsiyasi

## 📁 Loyiha Tuzilishi

```
uzum-online/
├── public/
│   ├── index.html          # Bosh sahifa (Uzum.uz dizayni)
│   ├── profile.html        # Profil sahifasi
│   ├── style.css           # Asosiy stillar (CSS Variables)
│   ├── profile.css         # Profil stillari
│   ├── script.js           # Bosh sahifa JS (qidiruv, cart, wishlist)
│   └── profile.js          # Profil JS
├── database.js             # Ma'lumotlar bazasi konfiguratsiyasi
├── server.js               # Express server + API endpoints
├── unsplash.js             # Unsplash API integratsiyasi
├── .env                    # Environment variables (API keys)
├── .gitignore              # Git ignore fayli
├── package.json            # Dependencies
└── README.md               # Dokumentatsiya
```

## 🗄️ Ma'lumotlar Bazasi

### Users jadvali
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Products jadvali
```sql
CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    original_price REAL,           -- Chegirma oldidan narx
    discount_percent INTEGER,      -- Chegirma foizi (0-100)
    rating REAL DEFAULT 0,         -- Reyting (0-5)
    rating_count INTEGER DEFAULT 0, -- Reyting berishlar soni
    category TEXT,                 -- Kategoriya (Elektronika, Kiyim, va h.k.)
    in_stock INTEGER DEFAULT 1,    -- Mavjudligi (1=ha, 0=yo'q)
    image TEXT,                    -- Rasm URL (Unsplash dan)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🔌 API Endpoints

### Authentication
- `POST /api/register` - Ro'yxatdan o'tish
- `POST /api/login` - Kirish
- `POST /api/logout` - Chiqish
- `GET /api/verify-token` - Token tekshirish (protected)

### Products
- `GET /api/items` - Barcha mahsulotlar (formatlangan)
- `GET /api/items-with-images` - Barcha mahsulotlar (rasmlar bilan)
- `GET /api/items/:id` - Bitta mahsulot

### Profile (Protected)
- `PUT /api/profile/update` - Profilni yangilash
- `PUT /api/profile/change-password` - Parolni o'zgartirish

### Unsplash API Integration
- `GET /api/unsplash/product/:id` - Bitta mahsulot uchun rasm olish
- `POST /api/unsplash/sync-all` - Barcha mahsulotlar uchun rasmlarni sinxronlash

## 🚦 Rate Limiting

Login va Register endpointlarda rate limiting qo'llangan:
- **Window**: 15 daqiqa
- **Max requests**: 5 ta urinish
- **Message**: "Juda ko'p urinish. 15 daqiqadan keyin qayta urinib ko'ring."

## 🔑 JWT Token

### Token Structure
```javascript
{
  id: user.id,
  email: user.email,
  exp: expiresIn // 24h yoki 30d (remember me)
}
```

### Token Storage
- **Server**: HttpOnly cookie
- **Client**: LocalStorage (backup)

## 📝 Scripts

```bash
# Development mode (nodemon)
npm run dev

# Production mode
npm start
```

## 🤝 Contributing

1. Fork qiling
2. Feature branch yarating (`git checkout -b feature/AmazingFeature`)
3. Commit qiling (`git commit -m 'Add some AmazingFeature'`)
4. Branch ga push qiling (`git push origin feature/AmazingFeature`)
5. Pull Request oching

## 📄 License

Bu loyiha MIT litsenziyasi ostida.

## 👨‍💻 Muallif

**Asomiddin**
- GitHub: [@Asomiddin1](https://github.com/Asomiddin1)

## 🙏 Minnatdorchilik

- Express.js jamoasi
- SQLite jamoasi
- Barcha open-source contributors

---

⭐ Agar loyiha foydali bo'lsa, star bering!
