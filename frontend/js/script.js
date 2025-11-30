// File: frontend/js/script.js
// Simpan di: rumah-impian-kami/frontend/js/script.js

// ============ NAVBAR SCROLL EFFECT ============
(function() {
    const navbar = document.getElementsByTagName('nav')[0];
    
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 1) {
                navbar.classList.replace('bg-transparent', 'nav-color');
            } else if (window.scrollY <= 0) {
                navbar.classList.replace('nav-color', 'bg-transparent');
            }
        });
    }
})();

// ============ AUTH UI UPDATE ============
function updateAuthUI() {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
    
    // Get buttons
    const daftarBtn = document.querySelector('.button-primary');
    const masukBtn = document.querySelector('.button-secundary');
    
    // Get add property button container
    const addPropertyBtnContainer = document.getElementById('addPropertyBtnContainer');
    const emptyStateBtn = document.getElementById('emptyStateBtn');
    
    if (token && user) {
        // User is logged in
        if (daftarBtn) {
            daftarBtn.textContent = user.username || user.full_name || 'User';
            daftarBtn.style.cursor = 'default';
            daftarBtn.onclick = (e) => {
                e.preventDefault();
                showUserMenu(e);
            };
        }
        
        if (masukBtn) {
            masukBtn.textContent = 'Logout';
            masukBtn.onclick = (e) => {
                e.preventDefault();
                handleLogout();
            };
        }kkk
        
        // Show add property button only for agen and admin
        if (user.role === 'agen' || user.role === 'admin') {
            if (addPropertyBtnContainer) {
                addPropertyBtnContainer.style.display = 'block';
            }
            if (emptyStateBtn) {
                emptyStateBtn.style.display = 'inline-block';
            }
        }
    } else {
        // User is not logged in
        if (daftarBtn) {
            daftarBtn.onclick = () => window.location.href = 'register.html';
        }
        
        if (masukBtn) {
            masukBtn.onclick = () => window.location.href = 'login.html';
        }
        
        // Hide add property buttons
        if (addPropertyBtnContainer) {
            addPropertyBtnContainer.style.display = 'none';
        }
        if (emptyStateBtn) {
            emptyStateBtn.style.display = 'none';
        }
    }
}

// ============ USER MENU ============
function showUserMenu(event) {
    event.preventDefault();
    
    // Remove existing menu if any
    const existingMenu = document.querySelector('.user-dropdown-menu');
    if (existingMenu) {
        existingMenu.remove();
        return;
    }
    
    const user = JSON.parse(localStorage.getItem('user'));
    
    // Role badge color
    const roleColors = {
        'admin': '#dc3545',
        'agen': '#048853',
        'user': '#6c757d'
    };
    
    const roleColor = roleColors[user.role] || '#6c757d';
    
    // Create dropdown menu
    const menu = document.createElement('div');
    menu.className = 'user-dropdown-menu';
    menu.style.cssText = `
        position: absolute;
        top: 60px;
        right: 150px;
        background: white;
        border-radius: 10px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        padding: 15px;
        min-width: 200px;
        z-index: 1000;
    `;
    
    menu.innerHTML = `
        <div style="padding: 10px; border-bottom: 1px solid #eee; margin-bottom: 10px;">
            <strong style="color: #048853;">${user.username}</strong>
            <div style="font-size: 12px; color: #666;">${user.email}</div>
            <div style="margin-top: 5px;">
                <span style="display: inline-block; padding: 3px 10px; background: ${roleColor}; color: white; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: uppercase;">
                    ${user.role}
                </span>
            </div>
        </div>
        ${user.role === 'agen' || user.role === 'admin' ? `
        <a href="add-property.html" style="display: block; padding: 10px; color: #333; text-decoration: none; border-radius: 5px;">
            ➕ Tambah Properti
        </a>
        ` : ''}
        <a href="#" onclick="handleLogout()" style="display: block; padding: 10px; color: #333; text-decoration: none; border-radius: 5px;">
            🚪 Logout
        </a>
    `;
    
    document.body.appendChild(menu);
    
    // Close menu when clicking outside
    setTimeout(() => {
        document.addEventListener('click', function closeMenu(e) {
            if (!menu.contains(e.target)) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        });
    }, 100);
}

// ============ LOGOUT HANDLER ============
function handleLogout() {
    if (confirm('Apakah Anda yakin ingin logout?')) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('rememberMe');
        
        showNotification('Logout berhasil!', 'success');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }
}

// ============ NOTIFICATION ============
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existing = document.querySelector('.custom-notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = 'custom-notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#048853'};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        z-index: 9999;
        font-family: 'Poppins', sans-serif;
        animation: slideIn 0.3s ease-out;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animation styles
if (!document.querySelector('#notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// ============ PROPERTY CARD INTERACTIONS ============
function initPropertyCards() {
    const cards = document.querySelectorAll('.card');
    
    cards.forEach(card => {
        card.style.cursor = 'pointer';
        
        card.addEventListener('click', function(e) {
            // Jika sudah ada API integration, tampilkan detail
            const propertyTitle = this.querySelector('h4')?.textContent;
            if (propertyTitle) {
                console.log('Clicked property:', propertyTitle);
                // TODO: Show property detail modal or navigate to detail page
            }
        });
    });
}

// ============ SEARCH FUNCTIONALITY ============
function initSearchForm() {
    const searchButton = document.querySelector('#search .button-primary');
    
    if (searchButton) {
        searchButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            const locationInput = document.querySelector('#search input[type="text"]');
            const location = locationInput ? locationInput.value : '';
            
            if (location.trim() === '') {
                showNotification('Masukkan lokasi pencarian', 'error');
                return;
            }
            
            // Check if API client is loaded
            if (typeof PropertiesAPI !== 'undefined') {
                searchProperties(location);
            } else {
                showNotification('Mencari: ' + location, 'info');
                console.log('Searching for:', location);
            }
        });
    }
}

// ============ SEARCH PROPERTIES ============
async function searchProperties(location) {
    try {
        showNotification('Mencari properti...', 'info');
        
        // This will work if api-client.js is loaded
        const response = await PropertiesAPI.search(location);
        
        if (response.success) {
            console.log('Found properties:', response.data);
            // TODO: Display results
            showNotification(`Ditemukan ${response.count} properti`, 'success');
        }
    } catch (error) {
        console.error('Search error:', error);
        showNotification('Pencarian gagal', 'error');
    }
}

// ============ CONTACT FORM ============
function initContactForm() {
    const contactForm = document.querySelector('#contact form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const emailInput = this.querySelector('input[type="email"]');
            const messageInput = this.querySelectorAll('.form-control')[1];
            
            if (!emailInput || !messageInput) return;
            
            const email = emailInput.value;
            const message = messageInput.value;
            
            if (!email || !message) {
                showNotification('Email dan pesan harus diisi', 'error');
                return;
            }
            
            try {
                // Check if API client is loaded
                if (typeof ContactAPI !== 'undefined') {
                    const response = await ContactAPI.submit({
                        email,
                        message,
                        name: '',
                        phone: ''
                    });
                    
                    if (response.success) {
                        showNotification('Pesan berhasil dikirim!', 'success');
                        contactForm.reset();
                    }
                } else {
                    // Fallback if API not available
                    showNotification('Pesan berhasil dikirim!', 'success');
                    contactForm.reset();
                    console.log('Contact form submitted:', { email, message });
                }
            } catch (error) {
                console.error('Contact form error:', error);
                showNotification('Gagal mengirim pesan', 'error');
            }
        });
    }
}

// ============ SMOOTH SCROLL ============
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Skip if href is just "#"
            if (href === '#') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ============ INITIALIZE ON PAGE LOAD ============
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏠 Rumah Impian Kami - Initialized');
    
    // Update auth UI
    updateAuthUI();
    
    // Initialize features
    initPropertyCards();
    initSearchForm();
    initContactForm();
    initSmoothScroll();
    
    // Load properties if API is available
    if (typeof loadProperties === 'function') {
        loadProperties();
    }
});

// ============ WINDOW LOAD ============
window.addEventListener('load', function() {
    console.log('✅ Page fully loaded');
});

// Make functions available globally
window.handleLogout = handleLogout;
window.showNotification = showNotification;