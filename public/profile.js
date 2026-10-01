// Sahifa yuklanganda
window.addEventListener('DOMContentLoaded', () => {
    loadUserProfile();
    checkAuth();
});

// Foydalanuvchini autentifikatsiya qilish
function checkAuth() {
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!user) {
        // Agar login qilmagan bo'lsa, bosh sahifaga yo'naltirish
        alert('Iltimos, avval login qiling');
        window.location.href = 'index.html';
        return;
    }
    
    // Navbar tugmasini o'zgartirish
    const navUserBtn = document.getElementById('navUserBtn');
    if (navUserBtn) {
        navUserBtn.innerHTML = '👤 ' + user.name.split(' ')[0];
    }
}

// Foydalanuvchi profilini yuklash
function loadUserProfile() {
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!user) return;
    
    // Avatar initiallarini o'rnatish
    const initials = user.name.split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    document.getElementById('avatarInitials').textContent = initials;
    
    // Form maydonlarini to'ldirish
    document.getElementById('profileName').value = user.name;
    document.getElementById('profileEmail').value = user.email;
    document.getElementById('profilePhone').value = user.phone;
    
    // Ro'yxatdan o'tgan sanani formatlash
    if (user.created_at) {
        const date = new Date(user.created_at);
        const formatted = date.toLocaleDateString('uz-UZ', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        document.getElementById('profileDate').value = formatted;
    }
}

// Sectionlarni ko'rsatish
function showSection(sectionName) {
    // Barcha sectionlarni yashirish
    const sections = document.querySelectorAll('.profile-section');
    sections.forEach(section => section.classList.remove('active'));
    
    // Barcha nav itemlarni deaktiv qilish
    const navItems = document.querySelectorAll('.profile-nav-item');
    navItems.forEach(item => item.classList.remove('active'));
    
    // Tanlangan sectionni ko'rsatish
    const targetSection = document.getElementById(sectionName + 'Section');
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Tanlangan nav itemni aktiv qilish
    event.currentTarget.classList.add('active');
}

// Profilni yangilash
async function updateProfile(event) {
    event.preventDefault();
    
    const user = JSON.parse(localStorage.getItem('user'));
    const name = document.getElementById('profileName').value;
    const phone = document.getElementById('profilePhone').value;
    
    try {
        const response = await fetch('/api/profile/update', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: user.id,
                name,
                phone
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // LocalStorage ni yangilash
            user.name = name;
            user.phone = phone;
            localStorage.setItem('user', JSON.stringify(user));
            
            alert('Ma\'lumotlar muvaffaqiyatli yangilandi!');
            location.reload();
        } else {
            alert(data.error || 'Yangilashda xatolik');
        }
    } catch (error) {
        console.error('Xatolik:', error);
        alert('Serverga ulanishda xatolik');
    }
}

// Parolni o'zgartirish
async function changePassword(event) {
    event.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;
    
    if (newPassword !== confirmNewPassword) {
        alert('Yangi parollar bir xil emas!');
        return;
    }
    
    const user = JSON.parse(localStorage.getItem('user'));
    
    try {
        const response = await fetch('/api/profile/change-password', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: user.id,
                email: user.email,
                currentPassword,
                newPassword
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Parol muvaffaqiyatli o\'zgartirildi!');
            document.getElementById('passwordForm').reset();
        } else {
            alert(data.error || 'Parolni o\'zgartirishda xatolik');
        }
    } catch (error) {
        console.error('Xatolik:', error);
        alert('Serverga ulanishda xatolik');
    }
}

// Navbar user tugmasini bosish
function handleNavUserClick() {
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (user) {
        // Agar login qilgan bo'lsa, profilga o'tish
        window.location.href = 'profile.html';
    } else {
        // Agar login qilmagan bo'lsa, bosh sahifaga o'tish
        window.location.href = 'index.html';
    }
}

// Chiqish
function handleLogout() {
    if (confirm('Haqiqatan ham chiqmoqchimisiz?')) {
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    }
}
