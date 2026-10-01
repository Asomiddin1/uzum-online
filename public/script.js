let allItems = [];
let currentPage = 1;
const itemsPerPage = 3;

// Serverdan ma'lumotlarni olish
async function fetchItems() {
    try {
        const response = await fetch('/api/items');
        allItems = await response.json();
        displayItems();
    } catch (error) {
        console.error('Ma\'lumot olishda xatolik:', error);
    }
}

// Sahifadagi elementlarni ko'rsatish
function displayItems() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = allItems.slice(startIndex, endIndex);
    
    const itemsGrid = document.getElementById('itemsGrid');
    itemsGrid.innerHTML = '';
    
    currentItems.forEach(item => {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.innerHTML = `
            <h2>${item.name}</h2>
            <p>${item.description}</p>
            <div class="price">${item.price}</div>
        `;
        itemsGrid.appendChild(card);
    });
    
    updatePagination();
}

// Sahifa ma'lumotlarini yangilash
function updatePagination() {
    const totalPages = Math.ceil(allItems.length / itemsPerPage);
    document.getElementById('pageInfo').textContent = `Sahifa ${currentPage} / ${totalPages}`;
    document.getElementById('prevBtn').disabled = currentPage === 1;
    document.getElementById('nextBtn').disabled = currentPage === totalPages;
}

// Keyingi sahifa
function nextPage() {
    const totalPages = Math.ceil(allItems.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        displayItems();
        scrollToProducts();
    }
}

// Oldingi sahifa
function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        displayItems();
        scrollToProducts();
    }
}

// Mahsulotlar bo'limiga scroll
function scrollToProducts() {
    const itemsGrid = document.getElementById('itemsGrid');
    itemsGrid.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert(`Xush kelibsiz, ${data.user.name}!`);
            closeLoginModal();
            
            // Login tugmasini o'zgartirish
            const loginBtn = document.querySelector('.login-btn');
            loginBtn.innerHTML = '👤 ' + data.user.name.split(' ')[0];
            
            // Foydalanuvchi ma'lumotlarini saqlash
            localStorage.setItem('user', JSON.stringify(data.user));
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
            const loginBtn = document.querySelector('.login-btn');
            loginBtn.innerHTML = '👤 ' + data.user.name.split(' ')[0];
            
            // Foydalanuvchi ma'lumotlarini saqlash
            localStorage.setItem('user', JSON.stringify(data.user));
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
