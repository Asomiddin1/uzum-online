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
            original_price REAL,
            discount_percent INTEGER DEFAULT 0,
            rating REAL DEFAULT 0,
            rating_count INTEGER DEFAULT 0,
            category TEXT DEFAULT 'Boshqa',
            in_stock INTEGER DEFAULT 100,
            image TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Products jadvalini yaratishda xatolik:', err.message);
        } else {
            console.log('Products jadvali tayyor');
            updateProductsSchema();
        }
    });
}

// Mavjud products jadvaliga yangi ustunlar qo'shish
function updateProductsSchema() {
    const alterQueries = [
        'ALTER TABLE products ADD COLUMN original_price REAL',
        'ALTER TABLE products ADD COLUMN discount_percent INTEGER DEFAULT 0',
        'ALTER TABLE products ADD COLUMN rating REAL DEFAULT 0',
        'ALTER TABLE products ADD COLUMN rating_count INTEGER DEFAULT 0',
        'ALTER TABLE products ADD COLUMN category TEXT DEFAULT "Boshqa"',
        'ALTER TABLE products ADD COLUMN in_stock INTEGER DEFAULT 100'
    ];

    let completed = 0;
    alterQueries.forEach(query => {
        db.run(query, (err) => {
            completed++;
            if (err && !err.message.includes('duplicate column')) {
                console.error('Ustun qo\'shishda xatolik:', err.message);
            }
            if (completed === alterQueries.length) {
                insertDefaultProducts();
            }
        });
    });
}

// Dastlabki mahsulotlarni qo'shish
function insertDefaultProducts() {
    const products = [
        { 
            name: 'iPhone 15 Pro', 
            description: 'Eng yangi iPhone model - A17 Pro chip', 
            price: 11500000,
            original_price: 13000000,
            discount_percent: 12,
            rating: 4.8,
            rating_count: 245,
            category: 'Elektronika',
            in_stock: 15
        },
        { 
            name: 'Samsung Galaxy S24', 
            description: 'Flagman Android telefon', 
            price: 9200000,
            original_price: 10000000,
            discount_percent: 8,
            rating: 4.6,
            rating_count: 189,
            category: 'Elektronika',
            in_stock: 23
        },
        { 
            name: 'Nike Air Max 270', 
            description: 'Yumshoq va qulay sport poyabzal', 
            price: 850000,
            original_price: 1200000,
            discount_percent: 29,
            rating: 4.5,
            rating_count: 567,
            category: 'Kiyim',
            in_stock: 45
        },
        { 
            name: 'Sony WH-1000XM5', 
            description: 'Premium shovqinni bekor qiluvchi quloqchin', 
            price: 3200000,
            original_price: 3800000,
            discount_percent: 16,
            rating: 4.9,
            rating_count: 423,
            category: 'Elektronika',
            in_stock: 12
        },
        { 
            name: 'Adidas Originals Hoodie', 
            description: 'Klassik sport kurtka', 
            price: 450000,
            original_price: 600000,
            discount_percent: 25,
            rating: 4.3,
            rating_count: 234,
            category: 'Kiyim',
            in_stock: 67
        },
        { 
            name: 'MacBook Air M2', 
            description: '13.6" Retina displey, 8GB RAM', 
            price: 14500000,
            original_price: 16000000,
            discount_percent: 9,
            rating: 4.7,
            rating_count: 156,
            category: 'Elektronika',
            in_stock: 8
        },
        { 
            name: 'PlayStation 5', 
            description: 'Yangi avlod o\'yin konsoli', 
            price: 6500000,
            original_price: 7200000,
            discount_percent: 10,
            rating: 4.9,
            rating_count: 892,
            category: 'Elektronika',
            in_stock: 5
        },
        { 
            name: 'Levi\'s 501 Jeans', 
            description: 'Klassik denim jinsi', 
            price: 520000,
            original_price: 650000,
            discount_percent: 20,
            rating: 4.4,
            rating_count: 345,
            category: 'Kiyim',
            in_stock: 89
        }
    ];

    const checkQuery = 'SELECT COUNT(*) as count FROM products';
    db.get(checkQuery, [], (err, row) => {
        if (err) {
            console.error('Mahsulotlarni tekshirishda xatolik:', err.message);
            return;
        }

        if (row.count === 0) {
            const stmt = db.prepare(`
                INSERT INTO products 
                (name, description, price, original_price, discount_percent, rating, rating_count, category, in_stock) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);
            products.forEach(product => {
                stmt.run(
                    product.name, 
                    product.description, 
                    product.price,
                    product.original_price,
                    product.discount_percent,
                    product.rating,
                    product.rating_count,
                    product.category,
                    product.in_stock
                );
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
