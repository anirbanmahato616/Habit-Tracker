const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const path = require('path');

// Create Express App
const app = express();
const PORT = process.env.PORT || 3000;

// PostgreSQL Setup
const pool = new Pool({
    user:"postgres",
    host:"localhost",
    database:"habits",
    password:"Anirban@123",
    port:5432,
});

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM habits ORDER BY date DESC');
        const habits = result.rows;
        res.render('index', { habits });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

app.post('/add-habit', async (req, res) => {
    const { date, cycling, reading, coding, yoga, comments, month } = req.body;
    try {
        await pool.query(
            'INSERT INTO habits (date, cycling, reading, coding, yoga, comments, month) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [date, cycling , reading , coding , yoga , comments, month]
        );
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
