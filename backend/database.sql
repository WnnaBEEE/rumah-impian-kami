-- File: backend/database.sql
-- Simpan di: rumah-impian-kami/backend/database.sql
-- Jalankan file ini di MySQL untuk membuat database dan tabel

-- Buat Database
CREATE DATABASE IF NOT EXISTS rumah_impian_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE rumah_impian_db;

-- Tabel Users
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    phone VARCHAR(20),
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel Properties
CREATE TABLE IF NOT EXISTS properties (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    title VARCHAR(200) NOT NULL,
    price DECIMAL(15, 2) NOT NULL,
    address TEXT NOT NULL,
    type VARCHAR(50) NOT NULL COMMENT 'Contoh: Rumah, Apartemen, Villa, Ruko',
    status ENUM('Jual', 'Sewa') NOT NULL,
    bedrooms INT NOT NULL,
    bathrooms INT NOT NULL,
    area INT NOT NULL COMMENT 'Luas dalam meter persegi',
    image VARCHAR(255),
    description TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    views INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_type (type),
    INDEX idx_price (price),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel Contacts
CREATE TABLE IF NOT EXISTS contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    message TEXT NOT NULL,
    status ENUM('new', 'read', 'replied') DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel Property Images (untuk multiple images per property)
CREATE TABLE IF NOT EXISTS property_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    property_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    INDEX idx_property_id (property_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel Favorites (wishlist user)
CREATE TABLE IF NOT EXISTS favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    property_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    UNIQUE KEY unique_favorite (user_id, property_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert Sample Data

-- Insert Admin User (password: admin123)
INSERT INTO users (username, email, password, full_name, phone, role) VALUES 
('admin', 'admin@rumahimpian.com', '$2a$10$XqWYJvXvVqGvXq6Xz5YZKeLJZFgE7VK3kLUJvQk3mJ8YNz9X5Y8Ky', 'Administrator', '081234567890', 'admin');

-- Insert Sample Properties
INSERT INTO properties (user_id, title, price, address, type, status, bedrooms, bathrooms, area, image, description) VALUES
(1, 'Rumah Minimalis Modern Jatijajar', 200000000, 'Jl. Jatijajar 1, Depok', 'Rumah', 'Jual', 3, 3, 500, '/uploads/properties/home1.jpg', 'Rumah minimalis modern dengan desain elegan dan lokasi strategis'),
(1, 'Rumah Siap Huni Beji', 100000000, 'Jl. Beji Depok', 'Rumah', 'Jual', 4, 2, 300, '/uploads/properties/home2.jpg', 'Rumah siap huni dengan akses mudah ke pusat kota'),
(1, 'Rumah Mewah Cibinong', 500000000, 'Jl. Cibinong Bogor', 'Rumah', 'Jual', 5, 3, 600, '/uploads/properties/home3.jpg', 'Rumah mewah dengan taman luas dan pemandangan hijau'),
(1, 'Rumah Elite Kelapa Dua', 550000000, 'Jl. Kelapa Dua No.11, Depok', 'Rumah', 'Jual', 5, 4, 650, '/uploads/properties/home4.jpg', 'Rumah elite di kawasan premium dengan fasilitas lengkap'),
(1, 'Rumah Modern Jakarta Selatan', 800000000, 'Jl. Jakarta Selatan Blok 4', 'Rumah', 'Jual', 5, 3, 700, '/uploads/properties/home5.jpg', 'Rumah modern di lokasi strategis Jakarta Selatan'),
(1, 'Rumah Nyaman Margonda', 200000000, 'Jl. Margonda Raya, Depok', 'Rumah', 'Jual', 4, 3, 450, '/uploads/properties/home6.jpg', 'Rumah nyaman dekat dengan kampus dan pusat perbelanjaan');

-- Insert Sample Contacts
INSERT INTO contacts (name, email, phone, message) VALUES
('Budi Santoso', 'budi@email.com', '081234567890', 'Saya tertarik dengan rumah di Jatijajar, apakah masih tersedia?'),
('Siti Nurhaliza', 'siti@email.com', '082345678901', 'Bisa dibantu untuk survey rumah di Beji?');

-- Create View untuk Property dengan User Info
CREATE OR REPLACE VIEW v_properties_with_user AS
SELECT 
    p.*,
    u.username as owner_username,
    u.email as owner_email,
    u.phone as owner_phone,
    u.full_name as owner_name
FROM properties p
LEFT JOIN users u ON p.user_id = u.id;

-- Stored Procedure untuk increment views
DELIMITER //
CREATE PROCEDURE increment_property_views(IN prop_id INT)
BEGIN
    UPDATE properties SET views = views + 1 WHERE id = prop_id;
END //
DELIMITER ;