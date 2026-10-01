const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Ma'lumotlar bazasini ulash
const { registerUser, loginUser, getAllProducts, getProductById } = require('./database');

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
app.post('/api/register', (req, res) => {
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
    
    res.json({ success: true, user });
  });
});

// Login API
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email va parolni kiriting' });
  }
  
  loginUser(email, password, (err, user) => {
    if (err) {
      return res.status(401).json({ error: err.message });
    }
    
    res.json({ success: true, user });
  });
});

// Profilni yangilash API
app.put('/api/profile/update', (req, res) => {
  const { userId, name, phone } = req.body;
  
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
app.put('/api/profile/change-password', (req, res) => {
  const { userId, email, currentPassword, newPassword } = req.body;
  
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

app.listen(PORT, () => {
  console.log(`Server http://localhost:${PORT} da ishlamoqda`);
});