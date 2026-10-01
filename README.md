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
- 📦 Mahsulotlar ro'yxati
- 🔍 Sahifalash (pagination)
- 💰 Narx ko'rsatish
- 📱 Responsive dizayn

### UI/UX
- 🎨 Gradient dizayn
- ✨ Animatsiyalar
- 📱 Mobil qurilmalar uchun moslashtirilgan
- 🌐 O'zbekcha interfeys
- 🎯 Navbar va navigation

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

### Frontend
- **HTML5**
- **CSS3** (Gradient, Flexbox, Grid)
- **JavaScript (ES6+)**
- **Fetch API** - AJAX so'rovlari
- **LocalStorage** - Client-side storage

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

3. Serverni ishga tushiring:
```bash
npm run dev
```

4. Brauzeringizda oching:
```
http://localhost:3000
```

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
│   ├── index.html          # Bosh sahifa
│   ├── profile.html        # Profil sahifasi
│   ├── style.css           # Asosiy stillar
│   ├── profile.css         # Profil stillari
│   ├── script.js           # Bosh sahifa JS
│   └── profile.js          # Profil JS
├── database.js             # Ma'lumotlar bazasi konfiguratsiyasi
├── server.js               # Express server
├── package.json
└── README.md
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
    image TEXT,
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
- `GET /api/items` - Barcha mahsulotlar
- `GET /api/items/:id` - Bitta mahsulot

### Profile (Protected)
- `PUT /api/profile/update` - Profilni yangilash
- `PUT /api/profile/change-password` - Parolni o'zgartirish

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
