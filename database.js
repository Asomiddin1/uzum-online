const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

// Ma'lumotlar bazasini yaratish
const db = new sqlite3.Database(path.join(__dirname, 'shop.db'), (err) => {
    if (err) {
        console.error('Ma\'lumotlar bazasiga ulanishda xatolik:', err.message);
    } else {
        console.log('Ma\'lumotlar bazasiga muvaffaqiyatli ulandi');
        initDatabase();
    }
});

// Jadvallarni yaratish
function initDatabase() {
    // Foydalanuvchilar jadvali
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            phone TEXT NOT NULL,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Users jadvalini yaratishda xatolik:', err.message);
        } else {
            console.log('Users jadvali tayyor');
        }
    });

    // Mahsulotlar jadvali
    db.run(`
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            price REAL NOT NULL,
            image TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Products jadvalini yaratishda xatolik:', err.message);
        } else {
            console.log('Products jadvali tayyor');
            insertDefaultProducts();
        }
    });
}

// Dastlabki mahsulotlarni qo'shish
function insertDefaultProducts() {
    const products = [
        { name: 'Olma', description: 'Qizil va mazali olma', price: 15000 },
        { name: 'Banan', description: 'Sariq va shirin banan', price: 20000 },
        { name: 'Apelsin', description: 'Vitaminli apelsin', price: 18000 },
        { name: 'Anor', description: 'Toza anor', price: 25000 },
        { name: 'Uzum', description: 'Shirin uzum', price: 22000 }
    ];

    const checkQuery = 'SELECT COUNT(*) as count FROM products';
    db.get(checkQuery, [], (err, row) => {
        if (err) {
            console.error('Mahsulotlarni tekshirishda xatolik:', err.message);
            return;
        }

        if (row.count === 0) {
            const stmt = db.prepare('INSERT INTO products (name, description, price) VALUES (?, ?, ?)');
            products.forEach(product => {
                stmt.run(product.name, product.description, product.price);
            });
            stmt.finalize();
            console.log('Dastlabki mahsulotlar qo\'shildi');
        }
    });
}

// Foydalanuvchini ro'yxatdan o'tkazish
function registerUser(name, email, phone, password, callback) {
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            return callback(err);
        }

        const query = 'INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)';
        db.run(query, [name, email, phone, hashedPassword], function(err) {
            if (err) {
                return callback(err);
            }
            callback(null, { id: this.lastID, name, email, phone });
        });
    });
}

// Foydalanuvchini login qilish
function loginUser(email, password, callback) {
    const query = 'SELECT * FROM users WHERE email = ?';
    db.get(query, [email], (err, user) => {
        if (err) {
            return callback(err);
        }
        if (!user) {
            return callback(new Error('Foydalanuvchi topilmadi'));
        }

        bcrypt.compare(password, user.password, (err, result) => {
            if (err) {
                return callback(err);
            }
            if (!result) {
                return callback(new Error('Parol noto\'g\'ri'));
            }
            
            // Parolni qaytarmaslik
            delete user.password;
            callback(null, user);
        });
    });
}

// Barcha mahsulotlarni olish
function getAllProducts(callback) {
    const query = 'SELECT * FROM products ORDER BY id';
    db.all(query, [], callback);
}

// Bitta mahsulotni olish
function getProductById(id, callback) {
    const query = 'SELECT * FROM products WHERE id = ?';
    db.get(query, [id], callback);
}

module.exports = {
    db,
    registerUser,
    loginUser,
    getAllProducts,
    getProductById
};
