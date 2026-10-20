const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');
const nodemailer = require('nodemailer'); 

const app = express();
app.use(cors());
app.use(express.json()); 

// ==========================================
// STATIC FILES & ROUTING
// ==========================================
// This serves your CSS, JS, and Images perfectly
app.use(express.static(path.join(__dirname, 'public')));

// THIS FIXES THE "Cannot GET /" ERROR
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get(['/admin', '/admin/'], (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'index.html'));
});

// ==========================================
// POSTGRES DATABASE CONNECTION (SUPABASE)
// ==========================================
// PASTE YOUR ACTUAL LINK HERE!
const connectionString = 'YOUR_SUPABASE_URI_HERE'; 

const pool = new Pool({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
});

pool.connect((err) => {
    if (err) console.error('❌ DB Error:', err.message);
    else console.log('✅ Connected to Supabase!');
});

// ==========================================
// EMAIL SETUP (NODEMAILER)
// ==========================================
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'jmblindstar88@gmail.com', 
        pass: 'YOUR_GMAIL_APP_PASSWORD' // PASTE YOUR 16-LETTER APP PASSWORD HERE
    }
});

// ==========================================
// API ROUTES
// ==========================================
app.post('/api/inquiries', async (req, res) => {
    const { name, phone, email, product, message } = req.body;
    
    try {
        await pool.query(`INSERT INTO inquiries (name, phone, email, product, message) VALUES ($1, $2, $3, $4, $5)`, [name, phone, email, product, message]);
        
        const mailOptions = {
            from: 'jmblindstar88@gmail.com',
            to: 'jmblindstar88@gmail.com', 
            subject: `🚨 NEW QUOTE REQUEST: ${name} - ${product}`,
            html: `
                <h2>New Inquiry from Website</h2>
                <p><b>Name:</b> ${name}</p>
                <p><b>Phone:</b> ${phone}</p>
                <p><b>Email:</b> ${email}</p>
                <p><b>Product Interest:</b> ${product}</p>
                <p><b>Message:</b> ${message}</p>
            `
        };

        transporter.sendMail(mailOptions, function(error, info){
            if (error) console.log("Email Error:", error);
            else console.log('📧 Email sent: ' + info.response);
        });

        res.status(201).json({ success: true });
    } catch (err) { 
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