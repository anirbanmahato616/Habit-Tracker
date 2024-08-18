const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

let habits = []; // Store habit data in memory for now

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
    res.render('index.ejs', { habits });
});

app.post('/add-habit', (req, res) => {
    const newHabit = {
        date: req.body.date,
        cycling: req.body.cycling || 'No',
        reading: req.body.reading || 'No',
        coding: req.body.coding || 'No',
        yoga: req.body.yoga || 'No',
        comments: req.body.comments || ''
    };
    //console.log(newHabit);
    habits.push(newHabit);
    res.redirect('/');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
