// File: frontend/js/api-client.js
// Simpan di: rumah-impian-kami/frontend/js/api-client.js

const API_BASE_URL = 'http://localhost:3000/api';
let apiAvailable = true;

// Check if API is available
async function checkAPIAvailability() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        apiAvailable = response.ok;
        return apiAvailable;
    } catch (error) {
        console.warn('⚠️ Backend API not available:', error.message);
        apiAvailable = false;
        return false;
    }
}

// Utility function untuk request API
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        }
    };

    // Tambahkan token jika ada
    const token = localStorage.getItem('authToken');
    if (token) {
        defaultOptions.headers['Authorization'] = `Bearer ${token}`;
    }

    const config = { ...defaultOptions, ...options };

    try {
        const response = await fetch(url, config);
        
        // Handle different status codes
        if (response.status === 503) {
            throw new Error('Database tidak tersedia. Pastikan MySQL sudah running.');
        }
        
        if (response.status === 500) {
            throw new Error('Server error. Periksa console backend untuk detail.');
        }
        
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        
        if (error.message.includes('Failed to fetch')) {
            throw new Error('Backend tidak dapat diakses. Pastikan server sudah berjalan di port 3000.');
        }
        
        throw error;
    }
}

// ============ AUTH API ============

const AuthAPI = {
    register: async (userData) => {
        return await apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    },

    login: async (email, password) => {
        const data = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        if (data.token) {
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
        }

        return data;
    },

    logout: () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/';
    },

    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    isLoggedIn: () => {
        return !!localStorage.getItem('authToken');
    }
};

// ============ PROPERTIES API ============

const PropertiesAPI = {
    getAll: async (filters = {}) => {
        const queryParams = new URLSearchParams(filters).toString();
        const endpoint = queryParams ? `/properties?${queryParams}` : '/properties';
        return await apiRequest(endpoint);
    },

    getById: async (id) => {
        return await apiRequest(`/properties/${id}`);
    },

    create: async (formData) => {
        const token = localStorage.getItem('authToken');
        
        return await fetch(`${API_BASE_URL}/properties`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        }).then(res => res.json());
    },

    update: async (id, formData) => {
        const token = localStorage.getItem('authToken');
        
        return await fetch(`${API_BASE_URL}/properties/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        }).then(res => res.json());
    },

    delete: async (id) => {
        return await apiRequest(`/properties/${id}`, {
            method: 'DELETE'
        });
    },

    search: async (keyword, filters = {}) => {
        const params = { ...filters, location: keyword };
        return await PropertiesAPI.getAll(params);
    }
};

// ============ CONTACT API ============

const ContactAPI = {
    submit: async (contactData) => {
        return await apiRequest('/contact', {
            method: 'POST',
            body: JSON.stringify(contactData)
        });
    },

    getAll: async () => {
        return await apiRequest('/contacts');
    }
};

// ============ STATS API ============

const StatsAPI = {
    get: async () => {
        return await apiRequest('/stats');
    }
};

// ============ FRONTEND INTEGRATION FUNCTIONS ============

// Load properties ke halaman
async function loadProperties(filters = {}) {
    const container = document.getElementById('properties-container');
    if (!container) return;

    // Check API availability first
    const isAvailable = await checkAPIAvailability();
    
    if (!isAvailable) {
        console.warn('⚠️ Backend API not available - using placeholder data');
        showNotification('Backend tidak terhubung. Menampilkan data contoh.', 'info');
        loadPlaceholderProperties();
        return;
    }

    try {
        const response = await PropertiesAPI.getAll(filters);
        
        if (!response.success || response.count === 0) {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <h4 style="color: #666;">Belum ada properti tersedia</h4>
                    <p>Silakan tambahkan properti baru atau coba lagi nanti</p>
                </div>
            `;
            return;
        }

        const properties = response.data;
        container.innerHTML = '';

        properties.forEach(property => {
            const propertyCard = createPropertyCard(property);
            container.innerHTML += propertyCard;
        });

    } catch (error) {
        console.error('Error loading properties:', error);
        
        // Show user-friendly error message
        let errorMsg = 'Gagal memuat properti';
        
        if (error.message.includes('Backend tidak dapat diakses')) {
            errorMsg = 'Backend tidak dapat diakses. Pastikan server berjalan di http://localhost:3000';
        } else if (error.message.includes('Database tidak tersedia')) {
            errorMsg = 'Database tidak tersedia. Pastikan MySQL sudah running dan database sudah dibuat.';
        }
        
        showNotification(errorMsg, 'error');
        
        // Load placeholder data as fallback
        loadPlaceholderProperties();
    }
}

// Load placeholder properties when backend is unavailable
function loadPlaceholderProperties() {
    const container = document.getElementById('properties-container');
    if (!container) return;

    const placeholderProperties = [
        {
            id: 1,
            title: 'Rumah Minimalis Jatijajar',
            price: 200000000,
            address: 'Jl. Jatijajar 1, Depok',
            status: 'Jual',
            bedrooms: 3,
            bathrooms: 3,
            area: 500,
            image: 'Assets/img/Home image 1.png'
        },
        {
            id: 2,
            title: 'Rumah Siap Huni Beji',
            price: 100000000,
            address: 'Jl. Beji Depok',
            status: 'Jual',
            bedrooms: 4,
            bathrooms: 2,
            area: 300,
            image: 'Assets/img/icon rumah 2.png'
        },
        {
            id: 3,
            title: 'Rumah Mewah Cibinong',
            price: 500000000,
            address: 'Jl. Cibinong Bogor',
            status: 'Jual',
            bedrooms: 5,
            bathrooms: 3,
            area: 600,
            image: 'Assets/img/icon rumah 3.png'
        }
    ];

    container.innerHTML = placeholderProperties.map(prop => 
        createPropertyCard(prop, true)
    ).join('');
}

// Create property card HTML
function createPropertyCard(property, isPlaceholder = false) {
    // SVG placeholder sebagai data URI
    const placeholderSVG = 'data:image/svg+xml,%3Csvg width="400" height="300" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="400" height="300" fill="%23e8f5f1"/%3E%3Ctext x="50%25" y="45%25" font-family="Arial" font-size="24" fill="%23048853" text-anchor="middle" font-weight="bold"%3E🏠%3C/text%3E%3Ctext x="50%25" y="55%25" font-family="Arial" font-size="16" fill="%23666" text-anchor="middle"%3ERumah Impian%3C/text%3E%3C/svg%3E';
    
    const imageSrc = isPlaceholder ? property.image : 
                     property.image ? `${API_BASE_URL.replace('/api', '')}${property.image}` : 
                     placeholderSVG;
    
    return `
        <div class="col-md-4 mb-4">
            <div class="card p-2" style="width: 22rem;">
                <img src="${imageSrc}" alt="${property.title}" 
                     onerror="this.src='${placeholderSVG}'"
                     style="width: 100%; height: 250px; object-fit: cover; background: #e8f5f1;">
                <div class="card-body">
                    <h4>IDR ${formatPrice(property.price)}</h4>
                    <p class="mb-4 lh-sm">${property.address} <br> 
                       <span class="text-danger">${property.status}</span>
                    </p>
                </div>
                <div class="card-fasilitas d-flex justify-content-between px-4">
                    <span>
                        <img src="Assets/img/bed icon.png" alt=""> ${property.bedrooms}
                        <p>Kamar Tidur</p>
                    </span>
                    <span>
                        <img src="Assets/img/bath icon.png" alt=""> ${property.bathrooms}
                        <p>Kamar Mandi</p>
                    </span>
                    <span>
                        <img src="Assets/img/luas rumah icon.png" alt=""> ${property.area}m²
                        <p>Luas Rumah</p>
                    </span>
                </div>
            </div>
        </div>
    `;
}

// Format price dengan separator
function formatPrice(price) {
    return new Intl.NumberFormat('id-ID').format(price);
}

// Handle contact form submission
async function handleContactSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const formData = {
        email: form.querySelector('#floatingInput').value,
        message: form.querySelector('#floatingMessage').value,
        name: '',
        phone: ''
    };

    try {
        const response = await ContactAPI.submit(formData);
        showNotification('Pesan berhasil dikirim!', 'success');
        form.reset();
    } catch (error) {
        console.error('Contact form error:', error);
        showNotification('Gagal mengirim pesan: ' + error.message, 'error');
    }
}

// Handle search form
async function handleSearch(event) {
    event.preventDefault();

    const form = event.target;
    const location = form.querySelector('input[type="text"]').value;

    try {
        await loadProperties({ location });
    } catch (error) {
        showNotification('Pencarian gagal', 'error');
    }
}

// Show notification
function showNotification(message, type = 'info') {
    if (typeof window.showNotification === 'function') {
        window.showNotification(message, type);
    } else {
        console.log(`[${type.toUpperCase()}] ${message}`);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔌 API Client initialized');
    
    // Check API availability
    checkAPIAvailability().then(available => {
        if (!available) {
            console.warn('⚠️ Backend API is not available');
            console.log('💡 Make sure backend server is running: npm run dev');
            console.log('💡 Make sure MySQL is running and database exists');
        } else {
            console.log('✅ Backend API is available');
        }
    });

    // Load properties
    loadProperties();

    // Setup contact form
    const contactForm = document.querySelector('#contact form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }

    // Setup search
    const searchButton = document.querySelector('#search .button-primary');
    if (searchButton) {
        searchButton.addEventListener('click', handleSearch);
    }
});

// Export untuk digunakan di file lain
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AuthAPI,
        PropertiesAPI,
        ContactAPI,
        StatsAPI,
        loadProperties
    };
}