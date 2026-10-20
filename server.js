const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(cors());
app.use(express.json()); 
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// DATABASE SETUP (SQLITE)
// ==========================================
const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) console.error('❌ Database error:', err.message);
    else console.log('✅ Connected to Local SQLite Database!');
});

db.serialize(() => {
    // Inquiries Table
    db.run(`CREATE TABLE IF NOT EXISTS inquiries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT, phone TEXT, email TEXT, product TEXT, message TEXT, date TEXT
    )`);

    // Orders Table
    db.run(`CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customerName TEXT, product TEXT, quantity INTEGER, amount REAL, status TEXT, date TEXT
    )`);

    // Customers Table
    db.run(`CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT, email TEXT, phone TEXT, address TEXT, status TEXT
    )`);
});

// ==========================================
// API ROUTES
// ==========================================

// Inquiries
app.post('/api/inquiries', (req, res) => {
    const { name, phone, email, product, message } = req.body;
    const date = new Date().toISOString();
    db.run(`INSERT INTO inquiries (name, phone, email, product, message, date) VALUES (?, ?, ?, ?, ?, ?)`,
        [name, phone, email, product, message, date],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ success: true, message: "Inquiry saved!" });
        }
    );
});

app.get('/api/inquiries', (req, res) => {
    db.all(`SELECT * FROM inquiries ORDER BY id DESC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(rows);
    });
});

// Orders
app.post('/api/orders', (req, res) => {
    const { customerName, product, quantity, amount } = req.body;
    const date = new Date().toISOString();
    const status = 'Pending';
    db.run(`INSERT INTO orders (customerName, product, quantity, amount, status, date) VALUES (?, ?, ?, ?, ?, ?)`,
        [customerName, product, quantity, amount, status, date],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ success: true, message: "Order saved!" });
        }
    );
});

app.get('/api/orders', (req, res) => {
    db.all(`SELECT * FROM orders ORDER BY id DESC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(rows);
    });
});

// Customers
app.get('/api/customers', (req, res) => {
    db.all(`SELECT * FROM customers ORDER BY id DESC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(rows);
    });
});

// ==========================================
// ROUTING
// ==========================================
// This handles /admin and /admin/ perfectly so CSS loads every time
app.get(['/admin', '/admin/'], (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'index.html'));
});

// ==========================================
// START SERVER
// ==========================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});