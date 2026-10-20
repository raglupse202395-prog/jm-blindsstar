const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json()); 

// Serve static files (CSS, JS, Images)
app.use(express.static(__dirname)); 
app.use(express.static(path.join(__dirname, 'public')));

// Routes for Customer Home and Admin Dashboard
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get(['/admin', '/admin/'], (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'index.html'));
});

// ==========================================
// POSTGRES DATABASE CONNECTION (SUPABASE)
// ==========================================
// ⚠️ MAKE SURE YOUR ACTUAL SUPABASE LINK IS HERE
const connectionString = 'postgresql://postgres.mgqkpylfucamnfmrknai:raglupse202395@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres'; 

const pool = new Pool({ 
    connectionString: connectionString, 
    ssl: { rejectUnauthorized: false } 
});

// ==========================================
// API ROUTES
// ==========================================
app.post('/api/inquiries', async (req, res) => {
    const { name, phone, email, product, message } = req.body;
    try {
        // 1. Save to Supabase Database (THIS IS THE IMPORTANT PART)
        await pool.query(`INSERT INTO inquiries (name, phone, email, product, message) VALUES ($1, $2, $3, $4, $5)`, [name, phone, email, product, message]);
        
        // 2. EMAIL PART IS COMMENTED OUT SO IT DOES NOT CRASH
        /*
        transporter.sendMail({
            from: 'jmblindstar88@gmail.com', to: 'jmblindstar88@gmail.com', 
            subject: `🚨 NEW QUOTE: ${name} - ${product}`,
            html: `<p><b>Name:</b> ${name}</p><p><b>Phone:</b> ${phone}</p><p><b>Email:</b> ${email}</p><p><b>Product:</b> ${product}</p><p><b>Message:</b> ${message}</p>`
        }, (error) => { if (error) console.log("Email Error:", error); });
        */
        
        res.status(201).json({ success: true });
    } catch (err) { 
        console.error("Database Error:", err.message);
        res.status(500).json({ error: err.message }); 
    }
});

app.get('/api/inquiries', async (req, res) => {
    try {
        const result = await pool.query(`SELECT * FROM inquiries ORDER BY id DESC`);
        res.status(200).json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/orders', async (req, res) => {
    const { customerName, product, quantity, amount } = req.body;
    try {
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));