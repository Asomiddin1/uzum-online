require('dotenv').config();
const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const { getImageForProduct, getImagesForProducts } = require('./unsplash');
const app = express();
const PORT = process.env.PORT || 3000;

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production-2024';
const SESSION_SECRET = process.env.SESSION_SECRET || 'your-session-secret-change-in-production-2024';

// Ma'lumotlar bazasini ulash
const { registerUser, loginUser, getAllProducts, getProductById } = require('./database');

// Rate limiting
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 daqiqa
  max: 5, // 5 ta urinish
  message: { error: 'Juda ko\'p urinish. 15 daqiqadan keyin qayta urinib ko\'ring.' }
});

// Middleware
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session konfiguratsiyasi
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Production da true bo'lishi kerak (HTTPS)
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 soat
  }
}));

// JWT token yaratish
function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

// JWT token tekshirish middleware
function authenticateToken(req, res, next) {
  const token = req.cookies.token || req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token topilmadi' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token yaroqsiz' });
    }
    req.user = user;
    next();
  });
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Mahsulotlar API
app.get('/api/items', (req, res) => {
  getAllProducts((err, products) => {
    if (err) {
      return res.status(500).json({ error: 'Ma\'lumotlarni olishda xatolik' });
    }
    
    // Mahsulotlarni formatlash
    const formattedProducts = products.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: `${p.price.toLocaleString()} so'm`
    }));
    
    res.json(formattedProducts);
  });
});

app.get('/api/items/:id', (req, res) => {
  getProductById(req.params.id, (err, product) => {
    if (err) {
      return res.status(500).json({ error: 'Ma\'lumotlarni olishda xatolik' });
    }
    if (!product) {
      return res.status(404).json({ message: 'Topilmadi' });
    }
    
    res.json({
      id: product.id,
      name: product.name,
      description: product.description,
      price: `${product.price.toLocaleString()} so'm`
    });
  });
});

// Ro'yxatdan o'tish API
app.post('/api/register', loginLimiter, (req, res) => {
  const { name, email, phone, password } = req.body;
  
  if (!name || !email || !phone || !password) {
    return res.status(400).json({ error: 'Barcha maydonlarni to\'ldiring' });
  }
  
  registerUser(name, email, phone, password, (err, user) => {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: 'Bu email allaqachon ro\'yxatdan o\'tgan' });
      }
      return res.status(500).json({ error: 'Ro\'yxatdan o\'tishda xatolik' });
    }
    
    // JWT token yaratish
    const token = generateToken(user);
    
    // Session ga saqlash
    req.session.userId = user.id;
    
    // Cookie ga saqlash
    res.cookie('token', token, {
      httpOnly: true,
      secure: false, // Production da true
      maxAge: 24 * 60 * 60 * 1000
    });
    
    res.json({ success: true, user, token });
  });
});

// Login API
app.post('/api/login', loginLimiter, (req, res) => {
  const { email, password, rememberMe } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email va parolni kiriting' });
  }
  
  loginUser(email, password, (err, user) => {
    if (err) {
      return res.status(401).json({ error: err.message });
    }
    
    // JWT token yaratish
    const tokenExpiry = rememberMe ? '30d' : '24h';
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: tokenExpiry }
    );
    
    // Session ga saqlash
    req.session.userId = user.id;
    
    // Cookie ga saqlash
    const cookieMaxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    res.cookie('token', token, {
      httpOnly: true,
      secure: false, // Production da true
      maxAge: cookieMaxAge
    });
    
    res.json({ success: true, user, token });
  });
});

// Logout API
app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Chiqishda xatolik' });
    }
    res.clearCookie('token');
    res.json({ success: true, message: 'Muvaffaqiyatli chiqildi' });
  });
});

// Token tekshirish API
app.get('/api/verify-token', authenticateToken, (req, res) => {
  res.json({ success: true, user: req.user });
});

// Profilni yangilash API
app.put('/api/profile/update', authenticateToken, (req, res) => {
  const { userId, name, phone } = req.body;
  
  // Foydalanuvchi faqat o'z profilini yangilashi mumkin
  if (req.user.id !== userId) {
    return res.status(403).json({ error: 'Ruxsat yo\'q' });
  }
  
  if (!userId || !name || !phone) {
    return res.status(400).json({ error: 'Barcha maydonlarni to\'ldiring' });
  }
  
  const { db } = require('./database');
  const query = 'UPDATE users SET name = ?, phone = ? WHERE id = ?';
  
  db.run(query, [name, phone, userId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Yangilashda xatolik' });
    }
    
    res.json({ success: true, message: 'Profil yangilandi' });
  });
});

// Parolni o'zgartirish API
app.put('/api/profile/change-password', authenticateToken, (req, res) => {
  const { userId, email, currentPassword, newPassword } = req.body;
  
  // Foydalanuvchi faqat o'z parolini o'zgartirishi mumkin
  if (req.user.id !== userId) {
    return res.status(403).json({ error: 'Ruxsat yo\'q' });
  }
  
  if (!userId || !email || !currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Barcha maydonlarni to\'ldiring' });
  }
  
  // Avval joriy parolni tekshirish
  loginUser(email, currentPassword, (err, user) => {
    if (err) {
      return res.status(401).json({ error: 'Joriy parol noto\'g\'ri' });
    }
    
    // Yangi parolni shifrlash va saqlash
    const bcrypt = require('bcrypt');
    bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
      if (err) {
        return res.status(500).json({ error: 'Parolni shifrlab bo\'lmadi' });
      }
      
      const { db } = require('./database');
      const query = 'UPDATE users SET password = ? WHERE id = ?';
      
      db.run(query, [hashedPassword, userId], function(err) {
        if (err) {
          return res.status(500).json({ error: 'Parolni yangilashda xatolik' });
        }
        
        res.json({ success: true, message: 'Parol o\'zgartirildi' });
      });
    });
  });
});

// ==================== UNSPLASH API ENDPOINTS ====================

// Bitta mahsulot uchun rasm olish
app.get('/api/unsplash/product/:id', async (req, res) => {
  const { id } = req.params;
  
  getProductById(id, async (err, product) => {
    if (err || !product) {
      return res.status(404).json({ error: 'Mahsulot topilmadi' });
    }
    
    try {
      const imageData = await getImageForProduct(product.name, product.category);
      
      if (!imageData) {
        return res.status(404).json({ error: 'Rasm topilmadi' });
      }
      
      res.json({
        productId: product.id,
        productName: product.name,
        imageData: imageData
      });
    } catch (error) {
      res.status(500).json({ error: 'Rasmni olishda xatolik', details: error.message });
    }
  });
});

// Barcha mahsulotlar uchun rasmlar olish va database'ga saqlash
app.post('/api/unsplash/sync-all', async (req, res) => {
  getAllProducts(async (err, products) => {
    if (err) {
      return res.status(500).json({ error: 'Mahsulotlarni olishda xatolik' });
    }
    
    try {
      const results = await getImagesForProducts(products);
      
      // Database'ga saqlash
      const { db } = require('./database');
      const updatePromises = results.map(result => {
        return new Promise((resolve, reject) => {
          if (result.imageUrl) {
            db.run(
              'UPDATE products SET image = ? WHERE id = ?',
              [result.imageUrl, result.productId],
              (err) => {
                if (err) reject(err);
                else resolve();
              }
            );
          } else {
            resolve();
          }
        });
      });
      
      await Promise.all(updatePromises);
      
      res.json({
        success: true,
        message: 'Barcha rasmlar yangilandi',
        results: results
      });
    } catch (error) {
      res.status(500).json({ error: 'Rasmlarni sinxronlashda xatolik', details: error.message });
    }
  });
});

// Mahsulotlarni rasmlar bilan olish
app.get('/api/items-with-images', (req, res) => {
  getAllProducts((err, products) => {
    if (err) {
      return res.status(500).json({ error: 'Ma\'lumotlarni olishda xatolik' });
    }
    
    res.json(products);
  });
});

app.listen(PORT, () => {
  console.log(`Server http://localhost:${PORT} da ishlamoqda`);
});