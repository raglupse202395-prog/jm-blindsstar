const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json()); 

// Serve static files from "public"
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// POSTGRES CONNECTION (SUPABASE)
// ==========================================
// REPLACE THIS WITH YOUR ACTUAL SUPABASE LINK!
const connectionString = 'postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxx.supabase.co:5432/postgres'; 

const pool = new Pool({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
});

pool.connect((err) => {
    if (err) console.error('❌ DB Error:', err.message);
    else console.log('✅ Connected to Supabase!');
});

// ==========================================
// ROUTES
// ==========================================
app.post('/api/inquiries', async (req, res) => {
    try {
        const { name, phone, email, product, message } = req.body;
        await pool.query(`INSERT INTO inquiries (name, phone, email, product, message) VALUES ($1, $2, $3, $4, $5)`, [name, phone, email, product, message]);
        res.status(201).json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/inquiries', async (req, res) => {
    try {
        const result = await pool.query(`SELECT * FROM inquiries ORDER BY id DESC`);
        res.status(200).json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/orders', async (req, res) => {
    try {
        const { customerName, product, quantity, amount } = req.body;
        await pool.query(`INSERT INTO orders (customerName, product, quantity, amount, status) VALUES ($1, $2, $3, $4, 'Pending')`, [customerName, product, quantity, amount]);
        res.status(201).json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/orders', async (req, res) => {
    try {
        const result = await pool.query(`SELECT * FROM orders ORDER BY id DESC`);
        res.status(200).json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/orders/:id/cancel', async (req, res) => {
    try {
        await pool.query(`UPDATE orders SET status = 'Cancelled' WHERE id = $1`, [req.params.id]);
        res.status(200).json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/customers', async (req, res) => {
    try {
        const result = await pool.query(`SELECT * FROM customers ORDER BY id DESC`);
        res.status(200).json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Serve the admin dashboard
app.get(['/admin', '/admin/'], (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));