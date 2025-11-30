// File: frontend/js/add-property.js
// Simpan di: rumah-impian-kami/frontend/js/add-property.js

const API_BASE_URL = 'http://localhost:3000/api';

// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const imageInput = document.getElementById('imageInput');
const imagePreview = document.getElementById('imagePreview');
const fileInfo = document.getElementById('fileInfo');
const propertyForm = document.getElementById('propertyForm');
const submitBtn = document.getElementById('submitBtn');

// ============ IMAGE UPLOAD HANDLING ============

// Click to upload
uploadArea.addEventListener('click', () => imageInput.click());

// File input change
imageInput.addEventListener('change', handleFileSelect);

// Drag and drop events
uploadArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
  uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadArea.classList.remove('dragover');
  
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    imageInput.files = files;
    handleFileSelect();
  }
});

// Handle file selection
function handleFileSelect() {
  const file = imageInput.files[0];
  
  if (file) {
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showAlert('Ukuran file terlalu besar! Maksimal 5MB', 'danger');
      imageInput.value = '';
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showAlert('File harus berupa gambar!', 'danger');
      imageInput.value = '';
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.src = e.target.result;
      imagePreview.classList.add('show');
      uploadArea.style.display = 'none';
    };
    reader.readAsDataURL(file);

    // Show file info
    fileInfo.innerHTML = `✓ ${file.name} (${(file.size / 1024).toFixed(2)} KB)`;
  }
}

// Reset image upload
function resetImageUpload() {
  imageInput.value = '';
  imagePreview.classList.remove('show');
  imagePreview.src = '';
  uploadArea.style.display = 'block';
  fileInfo.innerHTML = '';
}

// ============ PRICE FORMATTING ============

document.getElementById('price').addEventListener('input', (e) => {
  const price = parseFloat(e.target.value);
  if (price) {
    const formatted = new Intl.NumberFormat('id-ID').format(price);
    document.getElementById('priceFormat').textContent = `IDR ${formatted}`;
  } else {
    document.getElementById('priceFormat').textContent = '';
  }
});

// ============ FORM SUBMISSION ============

propertyForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Check if user is logged in
  const token = localStorage.getItem('authToken');
  if (!token) {
    showAlert('Anda harus login terlebih dahulu!', 'warning');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 2000);
    return;
  }

  // Disable button and show loading
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Menambahkan...';

  try {
    // Create FormData
    const formData = new FormData();
    formData.append('image', imageInput.files[0]);
    formData.append('title', document.getElementById('title').value);
    formData.append('price', document.getElementById('price').value);
    formData.append('address', document.getElementById('address').value);
    formData.append('type', document.getElementById('type').value);
    formData.append('status', document.getElementById('status').value);
    formData.append('bedrooms', document.getElementById('bedrooms').value);
    formData.append('bathrooms', document.getElementById('bathrooms').value);
    formData.append('area', document.getElementById('area').value);
    formData.append('description', document.getElementById('description').value);

    // Send to API
    const response = await fetch(`${API_BASE_URL}/properties`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Gagal menambahkan properti');
    }

    // Success
    showAlert('✅ Properti berhasil ditambahkan!', 'success');
    
    // Reset form
    propertyForm.reset();
    resetImageUpload();
    document.getElementById('priceFormat').textContent = '';
    
    // Redirect after 2 seconds
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 2000);

  } catch (error) {
    console.error('Error:', error);
    
    let errorMessage = 'Gagal menambahkan properti';
    
    if (error.message.includes('Failed to fetch')) {
      errorMessage = 'Backend tidak dapat diakses. Pastikan server berjalan di port 3000.';
    } else if (error.message.includes('Database')) {
      errorMessage = 'Database tidak tersedia. Pastikan MySQL sudah running.';
    } else {
      errorMessage = error.message;
    }
    
    showAlert(errorMessage, 'danger');
    
    // Re-enable button
    submitBtn.disabled = false;
    submitBtn.innerHTML = 'Tambahkan Properti';
  }
});

// ============ ALERT FUNCTION ============

function showAlert(message, type) {
  const alertDiv = document.getElementById('alertMessage');
  alertDiv.className = `alert alert-${type}`;
  alertDiv.innerHTML = message;
  alertDiv.style.display = 'block';

  // Scroll to top to show alert
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Auto hide after 5 seconds
  setTimeout(() => {
    alertDiv.style.display = 'none';
  }, 5000);
}

// ============ FORM VALIDATION ENHANCEMENT ============

// Real-time validation
const requiredInputs = document.querySelectorAll('[required]');
requiredInputs.forEach(input => {
  input.addEventListener('blur', () => {
    if (!input.value) {
      input.style.borderColor = '#dc3545';
    } else {
      input.style.borderColor = '#28a745';
    }
  });

  input.addEventListener('input', () => {
    if (input.value) {
      input.style.borderColor = '#e0e0e0';
    }
  });
});

// ============ CHECK LOGIN STATUS & ROLE ============

window.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('authToken');
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  
  if (!token) {
    showAlert('⚠️ Anda harus login untuk menambahkan properti', 'warning');
    
    setTimeout(() => {
      if (confirm('Anda belum login. Redirect ke halaman login?')) {
        window.location.href = 'login.html';
      }
    }, 2000);
  } else if (user) {
    // Check if user is agen or admin
    if (user.role !== 'agen' && user.role !== 'admin') {
      showAlert('❌ Akses ditolak! Hanya agen yang dapat menambahkan properti.', 'danger');
      
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 3000);
    } else {
      console.log('✅ User logged in as:', user.role);
      
      // Show role badge
      const headerSection = document.querySelector('.header-section p');
      if (headerSection) {
        headerSection.innerHTML = `Lengkapi form di bawah untuk menambahkan properti Anda<br>
          <span style="display: inline-block; margin-top: 10px; padding: 5px 15px; background: #048853; color: white; border-radius: 20px; font-size: 12px; font-weight: 600;">
            👤 ${user.role.toUpperCase()}
          </span>`;
      }
    }
  }
});

// ============ KEYBOARD SHORTCUTS ============

document.addEventListener('keydown', (e) => {
  // Ctrl/Cmd + S to submit form
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    propertyForm.dispatchEvent(new Event('submit'));
  }
  
  // ESC to go back
  if (e.key === 'Escape') {
    if (confirm('Kembali ke beranda? Perubahan yang belum disimpan akan hilang.')) {
      window.location.href = 'index.html';
    }
  }
});

// ============ PREVENT ACCIDENTAL NAVIGATION ============

let formModified = false;

propertyForm.addEventListener('input', () => {
  formModified = true;
});

window.addEventListener('beforeunload', (e) => {
  if (formModified && !submitBtn.disabled) {
    e.preventDefault();
    e.returnValue = '';
    return 'Anda memiliki perubahan yang belum disimpan. Yakin ingin keluar?';
  }
});

// ============ AUTO SAVE TO LOCAL STORAGE (DRAFT) ============

// Save draft every 30 seconds
setInterval(() => {
  if (formModified && !submitBtn.disabled) {
    const draft = {
      title: document.getElementById('title').value,
      price: document.getElementById('price').value,
      address: document.getElementById('address').value,
      type: document.getElementById('type').value,
      status: document.getElementById('status').value,
      bedrooms: document.getElementById('bedrooms').value,
      bathrooms: document.getElementById('bathrooms').value,
      area: document.getElementById('area').value,
      description: document.getElementById('description').value,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('propertyDraft', JSON.stringify(draft));
    console.log('💾 Draft saved');
  }
}, 30000);

// Load draft on page load
window.addEventListener('DOMContentLoaded', () => {
  const draft = localStorage.getItem('propertyDraft');
  
  if (draft) {
    const confirmed = confirm('Ditemukan draft yang belum disimpan. Muat draft?');
    
    if (confirmed) {
      const data = JSON.parse(draft);
      document.getElementById('title').value = data.title || '';
      document.getElementById('price').value = data.price || '';
      document.getElementById('address').value = data.address || '';
      document.getElementById('type').value = data.type || '';
      document.getElementById('status').value = data.status || '';
      document.getElementById('bedrooms').value = data.bedrooms || '';
      document.getElementById('bathrooms').value = data.bathrooms || '';
      document.getElementById('area').value = data.area || '';
      document.getElementById('description').value = data.description || '';
      
      showAlert('✅ Draft berhasil dimuat', 'success');
    } else {
      localStorage.removeItem('propertyDraft');
    }
  }
});

// Clear draft on successful submit
propertyForm.addEventListener('submit', () => {
  localStorage.removeItem('propertyDraft');
  formModified = false;
});