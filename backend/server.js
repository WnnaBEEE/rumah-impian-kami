// File: backend/server.js
// Simpan di: rumah-impian-kami/backend/server.js

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Create uploads directory if not exists
const uploadsDir = path.join(__dirname, 'uploads/properties');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('📁 Created uploads directory');
}

// Database Configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'rumah_impian_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Database Connection Pool
let pool;

async function initializeDatabase() {
    try {
        pool = mysql.createPool(dbConfig);
        
        // Test connection
        const connection = await pool.getConnection();
        console.log('✅ Database connected successfully');
        connection.release();
        
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        console.log('💡 Make sure MySQL is running and database exists');
        console.log('💡 Run database.sql to create the database');
        return false;
    }
}

// Multer Configuration for Image Upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/properties/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed!'));
    }
});

// Middleware untuk autentikasi
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Middleware untuk cek role agen
const requireAgent = async (req, res, next) => {
    try {
        const [users] = await pool.query(
            'SELECT role FROM users WHERE id = ?',
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userRole = users[0].role;

        // Allow agen and admin
        if (userRole === 'agen' || userRole === 'admin') {
            next();
        } else {
            return res.status(403).json({ 
                message: 'Akses ditolak. Hanya agen yang dapat menambahkan properti.',
                requiredRole: 'agen',
                currentRole: userRole
            });
        }
    } catch (error) {
        console.error('Role check error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Error handling middleware
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
    
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ 
            message: 'File upload error', 
            error: err.message 
        });
    }
    
    res.status(500).json({ 
        message: 'Internal server error', 
        error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
};

// ============ ROUTES ============

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Server is running',
        database: pool ? 'Connected' : 'Disconnected'
    });
});

// 1. AUTH ROUTES

// Register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password, full_name, phone, role } = req.body;
        
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Username, email, and password are required' });
        }

        // Validate role
        const allowedRoles = ['user', 'agen'];
        const userRole = role && allowedRoles.includes(role) ? role : 'user';

        const [existingUser] = await pool.query(
            'SELECT * FROM users WHERE email = ? OR username = ?',
            [email, username]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await pool.query(
            'INSERT INTO users (username, email, password, full_name, phone, role) VALUES (?, ?, ?, ?, ?, ?)',
            [username, email, hashedPassword, full_name, phone, userRole]
        );

        res.status(201).json({ 
            message: 'User registered successfully',
            userId: result.insertId,
            role: userRole
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const [users] = await pool.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = users[0];
        const isValidPassword = await bcrypt.compare(password, user.password);
        
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                full_name: user.full_name,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// 2. PROPERTY ROUTES

// Get all properties
app.get('/api/properties', async (req, res) => {
    try {
        if (!pool) {
            return res.status(503).json({ 
                message: 'Database not available',
                success: false 
            });
        }

        const { type, status, min_price, max_price, location, limit = 50 } = req.query;
        
        let query = 'SELECT * FROM properties WHERE 1=1';
        let params = [];

        if (type) {
            query += ' AND type = ?';
            params.push(type);
        }

        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }

        if (min_price) {
            query += ' AND price >= ?';
            params.push(min_price);
        }

        if (max_price) {
            query += ' AND price <= ?';
            params.push(max_price);
        }

        if (location) {
            query += ' AND address LIKE ?';
            params.push(`%${location}%`);
        }

        query += ' ORDER BY created_at DESC LIMIT ?';
        params.push(parseInt(limit));

        const [properties] = await pool.query(query, params);
        
        res.json({
            success: true,
            count: properties.length,
            data: properties
        });
    } catch (error) {
        console.error('Get properties error:', error);
        res.status(500).json({ 
            message: 'Failed to fetch properties', 
            error: error.message,
            success: false 
        });
    }
});

// Get single property
app.get('/api/properties/:id', async (req, res) => {
    try {
        const [properties] = await pool.query(
            'SELECT * FROM properties WHERE id = ?',
            [req.params.id]
        );

        if (properties.length === 0) {
            return res.status(404).json({ message: 'Property not found' });
        }

        res.json({
            success: true,
            data: properties[0]
        });
    } catch (error) {
        console.error('Get property error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create property (protected route - agen only)
app.post('/api/properties', authenticateToken, requireAgent, upload.single('image'), async (req, res) => {
    try {
        const {
            title,
            price,
            address,
            type,
            status,
            bedrooms,
            bathrooms,
            area,
            description
        } = req.body;

        const image = req.file ? `/uploads/properties/${req.file.filename}` : null;

        const [result] = await pool.query(
            `INSERT INTO properties 
            (title, price, address, type, status, bedrooms, bathrooms, area, image, description, user_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [title, price, address, type, status, bedrooms, bathrooms, area, image, description, req.user.id]
        );

        res.status(201).json({
            success: true,
            message: 'Property created successfully',
            data: {
                id: result.insertId,
                title,
                price,
                address,
                image
            }
        });
    } catch (error) {
        console.error('Create property error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update property (protected route - agen only)
app.put('/api/properties/:id', authenticateToken, requireAgent, upload.single('image'), async (req, res) => {
    try {
        const {
            title,
            price,
            address,
            type,
            status,
            bedrooms,
            bathrooms,
            area,
            description
        } = req.body;

        let query = `UPDATE properties SET 
                    title = ?, price = ?, address = ?, type = ?, status = ?, 
                    bedrooms = ?, bathrooms = ?, area = ?, description = ?`;
        
        let params = [title, price, address, type, status, bedrooms, bathrooms, area, description];

        if (req.file) {
            query += ', image = ?';
            params.push(`/uploads/properties/${req.file.filename}`);
        }

        query += ' WHERE id = ? AND user_id = ?';
        params.push(req.params.id, req.user.id);

        const [result] = await pool.query(query, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Property not found or unauthorized' });
        }

        res.json({
            success: true,
            message: 'Property updated successfully'
        });
    } catch (error) {
        console.error('Update property error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete property (protected route - agen only)
app.delete('/api/properties/:id', authenticateToken, requireAgent, async (req, res) => {
    try {
        const [result] = await pool.query(
            'DELETE FROM properties WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Property not found or unauthorized' });
        }

        res.json({
            success: true,
            message: 'Property deleted successfully'
        });
    } catch (error) {
        console.error('Delete property error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// 3. CONTACT ROUTES

// Submit contact form
app.post('/api/contact', async (req, res) => {
    try {
        const { email, message, name, phone } = req.body;

        if (!email || !message) {
            return res.status(400).json({ message: 'Email and message are required' });
        }

        const [result] = await pool.query(
            'INSERT INTO contacts (name, email, phone, message) VALUES (?, ?, ?, ?)',
            [name, email, phone, message]
        );

        res.status(201).json({
            success: true,
            message: 'Contact form submitted successfully',
            id: result.insertId
        });
    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all contacts (protected route)
app.get('/api/contacts', authenticateToken, async (req, res) => {
    try {
        const [contacts] = await pool.query(
            'SELECT * FROM contacts ORDER BY created_at DESC'
        );

        res.json({
            success: true,
            count: contacts.length,
            data: contacts
        });
    } catch (error) {
        console.error('Get contacts error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// 4. STATISTICS ROUTES

// Get dashboard statistics
app.get('/api/stats', async (req, res) => {
    try {
        const [totalProperties] = await pool.query('SELECT COUNT(*) as count FROM properties');
        const [totalJual] = await pool.query('SELECT COUNT(*) as count FROM properties WHERE status = "Jual"');
        const [totalSewa] = await pool.query('SELECT COUNT(*) as count FROM properties WHERE status = "Sewa"');
        const [avgPrice] = await pool.query('SELECT AVG(price) as avg FROM properties');

        res.json({
            success: true,
            data: {
                totalProperties: totalProperties[0].count,
                totalJual: totalJual[0].count,
                totalSewa: totalSewa[0].count,
                averagePrice: avgPrice[0].avg
            }
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server with database check
async function startServer() {
    const dbConnected = await initializeDatabase();
    
    if (!dbConnected) {
        console.log('\n⚠️  Server starting WITHOUT database connection');
        console.log('💡 Some features will not work until database is connected\n');
    }
    
    app.listen(PORT, () => {
        console.log('\n🚀 ================================');
        console.log(`   Server running on http://localhost:${PORT}`);
        console.log(`   Database: ${dbConnected ? '✅ Connected' : '❌ Not Connected'}`);
        console.log('   ================================\n');
        console.log('📚 API Endpoints:');
        console.log(`   - GET  /api/health`);
        console.log(`   - POST /api/auth/register`);
        console.log(`   - POST /api/auth/login`);
        console.log(`   - GET  /api/properties`);
        console.log(`   - POST /api/contact`);
        console.log('\n💡 Press Ctrl+C to stop\n');
    });
}

startServer();