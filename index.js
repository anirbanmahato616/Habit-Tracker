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

// Get all habits
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

// Add a new habit
app.post('/add-habit', async (req, res) => {
    const { date, cycling, reading, coding, yoga, comments } = req.body;
    try {
        await pool.query(
            'INSERT INTO habits (date, cycling, reading, coding, yoga, comments) VALUES ($1, $2, $3, $4, $5, $6)',
            [date, cycling === 'on', reading === 'on', coding === 'on', yoga === 'on', comments || null]
        );
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Edit habit
app.post('/edit-habit/:id', async (req, res) => {
    const { id } = req.params;
    const { date, cycling, reading, coding, yoga, comments } = req.body;
    try {
        await pool.query(
            'UPDATE habits SET date = $1, cycling = $2, reading = $3, coding = $4, yoga = $5, comments = $6 WHERE id = $7',
            [date, cycling === 'on', reading === 'on', coding === 'on', yoga === 'on', comments || null, id]
        );
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Delete habit
app.post('/delete-habit/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM habits WHERE id = $1', [id]);
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Get a specific habit by ID (for modal pre-fill)
app.get('/habit/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM habits WHERE id = $1', [id]);
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
