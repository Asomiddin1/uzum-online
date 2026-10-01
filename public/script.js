let allItems = [];
let filteredItems = [];
let currentPage = 1;
const itemsPerPage = 8;
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
let currentCategory = 'all';

// Serverdan ma'lumotlarni olish
async function fetchItems() {
    try {
        const response = await fetch('/api/items-with-images');
        allItems = await response.json();
        filteredItems = allItems;
        displayItems();
        updateCartBadge();
    } catch (error) {
        console.error('Ma\'lumot olishda xatolik:', error);
    }
}

// Reyting yulduzchalarini yaratish
function renderStars(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    let stars = '';
    for (let i = 0; i < fullStars; i++) stars += '★';
    if (halfStar) stars += '☆';
    for (let i = 0; i < emptyStars; i++) stars += '☆';
    
    return stars;
}

// Narxni formatlash
function formatPrice(price) {
    return new Intl.NumberFormat('uz-UZ').format(price) + ' so\'m';
}

// Sahifadagi elementlarni ko'rsatish
function displayItems() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = filteredItems.slice(startIndex, endIndex);
    
    const itemsGrid = document.getElementById('itemsGrid');
    itemsGrid.innerHTML = '';
    
    if (currentItems.length === 0) {
        itemsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-gray); padding: 60px 20px;">Mahsulot topilmadi</p>';
        updatePagination();
        return;
    }
    
    currentItems.forEach(item => {
        const isInWishlist = wishlist.includes(item.id);
        
        // Rasm URL ni aniqlash
        const imageUrl = item.image || `https://via.placeholder.com/400x400/7000FF/FFFFFF?text=${encodeURIComponent(item.name)}`;
        
        const card = document.createElement('div');
        card.className = 'item-card';
        card.innerHTML = `
            <div class="product-image-wrapper">
                <img src="${imageUrl}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/400x400/7000FF/FFFFFF?text=No+Image'">
                <button class="wishlist-btn ${isInWishlist ? 'active' : ''}" onclick="toggleWishlist(event, ${item.id})">
                    ${isInWishlist ? '❤️' : '🤍'}
                </button>
                ${item.discount_percent > 0 ? `<div class="discount-badge">-${item.discount_percent}%</div>` : ''}
            </div>
            <div class="product-info">
                <h3 class="product-name">${item.name}</h3>
                <div class="product-rating">
                    <span class="stars">${renderStars(item.rating || 0)}</span>
                    <span class="rating-count">(${item.rating_count || 0})</span>
                </div>
                <div class="product-price-wrapper">
                    <span class="current-price">${formatPrice(item.price)}</span>
                    ${item.original_price ? `<span class="old-price">${formatPrice(item.original_price)}</span>` : ''}
                </div>
                <button class="add-to-cart-btn" onclick="addToCart(event, ${item.id})">
                    Savatga qo'shish
                </button>
            </div>
        `;
        itemsGrid.appendChild(card);
    });
    
    updatePagination();
}

// Wishlist toggle
function toggleWishlist(event, itemId) {
    event.stopPropagation();
    const index = wishlist.indexOf(itemId);
    
    if (index > -1) {
        wishlist.splice(index, 1);
    } else {
        wishlist.push(itemId);
    }
    
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    displayItems();
}

// Savatga qo'shish
function addToCart(event, itemId) {
    event.stopPropagation();
    
    const existingItem = cart.find(item => item.id === itemId);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ id: itemId, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
    
    // Animation
    const btn = event.target;
    btn.textContent = '✓ Qo\'shildi';
    btn.style.background = 'var(--success-green)';
    setTimeout(() => {
        btn.textContent = 'Savatga qo\'shish';
        btn.style.background = '';
    }, 1500);
}

// Savat badge yangilash
function updateCartBadge() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartBadge').textContent = totalItems;
}

// Savat toggle
function toggleCart() {
    alert('Savat funksiyasi ishlab chiqilmoqda...');
}

// Qidiruv
function searchProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    filteredItems = allItems.filter(item => 
        item.name.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm)
    );
    
    currentPage = 1;
    displayItems();
}

// Kategoriya bo'yicha filter
function filterByCategory(category) {
    currentCategory = category;
    
    // Barcha tugmalardan active classni olib tashlash
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Bosilgan tugmaga active class qo'shish
    event.target.classList.add('active');
    
    if (category === 'all') {
        filteredItems = allItems;
    } else {
        filteredItems = allItems.filter(item => item.category === category);
    }
    
    currentPage = 1;
    displayItems();
}

// Sahifa ma'lumotlarini yangilash
function updatePagination() {
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    if (totalPages === 0) {
        document.getElementById('pageInfo').textContent = 'Mahsulot yo\'q';
        document.getElementById('prevBtn').disabled = true;
        document.getElementById('nextBtn').disabled = true;
        return;
    }
    
    document.getElementById('pageInfo').textContent = `${currentPage} / ${totalPages}`;
    document.getElementById('prevBtn').disabled = currentPage === 1;
    document.getElementById('nextBtn').disabled = currentPage === totalPages;
}

// Keyingi sahifa
function nextPage() {
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        displayItems();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Oldingi sahifa
function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        displayItems();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Login Modal Functions
function showLoginModal() {
    document.getElementById('loginModal').style.display = 'block';
}

function closeLoginModal() {
    document.getElementById('loginModal').style.display = 'none';
}

// Register Modal Functions
function showRegisterModal() {
    document.getElementById('registerModal').style.display = 'block';
}

function closeRegisterModal() {
    document.getElementById('registerModal').style.display = 'none';
}

// Modal o'rtasida o'tish
function switchToRegister(event) {
    event.preventDefault();
    closeLoginModal();
    showRegisterModal();
}

function switchToLogin(event) {
    event.preventDefault();
    closeRegisterModal();
    showLoginModal();
}

// Login formani yuborish
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.querySelector('input[type="checkbox"]').checked;
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password, rememberMe })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert(`Xush kelibsiz, ${data.user.name}!`);
            closeLoginModal();
            
            // Login tugmasini o'zgartirish
            const loginBtn = document.getElementById('navUserBtn');
            if (loginBtn) {
                loginBtn.innerHTML = '👤 ' + data.user.name.split(' ')[0];
            }
            
            // Foydalanuvchi ma'lumotlarini saqlash
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('token', data.token);
            
            // Remember me saqlash
            if (rememberMe) {
                localStorage.setItem('rememberMe', 'true');
            }
        } else {
            alert(data.error || 'Login qilishda xatolik');
        }
    } catch (error) {
        console.error('Xatolik:', error);
        alert('Serverga ulanishda xatolik');
    }
}

// Register formani yuborish
async function handleRegister(event) {
    event.preventDefault();
    
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const phone = document.getElementById('regPhone').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    
    // Parolni tekshirish
    if (password !== confirmPassword) {
        alert('Parollar bir xil emas!');
        return;
    }
    
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, phone, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert(`Muvaffaqiyatli ro'yxatdan o'tdingiz, ${data.user.name}!`);
            closeRegisterModal();
            
            // Avtomatik login qilish
            const loginBtn = document.getElementById('navUserBtn');
            if (loginBtn) {
                loginBtn.innerHTML = '👤 ' + data.user.name.split(' ')[0];
            }
            
            // Foydalanuvchi ma'lumotlarini saqlash
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('token', data.token);
        } else {
            alert(data.error || 'Ro\'yxatdan o\'tishda xatolik');
        }
    } catch (error) {
        console.error('Xatolik:', error);
        alert('Serverga ulanishda xatolik');
    }
}

// Modal tashqarisiga bosilganda yopish
window.onclick = function(event) {
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    
    if (event.target === loginModal) {
        closeLoginModal();
    }
    if (event.target === registerModal) {
        closeRegisterModal();
    }
}

// Sahifa yuklanganda
window.addEventListener('DOMContentLoaded', () => {
    fetchItems();
    
    // Saqlangan foydalanuvchini yuklash
    const savedUser = localStorage.getItem('user');
    const navUserBtn = document.getElementById('navUserBtn');
    
    if (savedUser && navUserBtn) {
        const user = JSON.parse(savedUser);
        navUserBtn.innerHTML = '👤 ' + user.name.split(' ')[0];
    }
});

// Navbar user tugmasini bosish
function handleNavUserClick() {
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (user) {
        // Agar login qilgan bo'lsa, profilga o'tish
        window.location.href = 'profile.html';
    } else {
        // Agar login qilmagan bo'lsa, login modalni ochish
        showLoginModal();
    }
}
