// app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const path = require('path');

const app = express();

// CORS configuration for Live Server frontend
app.use(cors({
  origin: 'http://127.0.0.1:5500', // Allow Live Server frontend
  methods: ['GET', 'POST'],        // Allow needed HTTP methods
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static front-end files from 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || 'Phantomgamer72@',
  database: process.env.DB_NAME || 'dinedash',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// POST /api/orders - create new order
app.post('/api/orders', async (req, res) => {
  try {
    const { guest_name, room_number, food, quantity } = req.body;

    // Basic server-side validation
    if (!guest_name || !room_number || !food || !quantity) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    const [result] = await pool.execute(
      'INSERT INTO orders (guest_name, room_number, food, quantity) VALUES (?, ?, ?, ?)',
      [guest_name, room_number, food, quantity]
    );

    res.status(201).json({ message: 'Order placed', orderId: result.insertId });
  } catch (err) {
    console.error('Error saving order:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/orders - list orders (for testing / admin)
app.get('/api/orders', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM orders ORDER BY order_time DESC');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
