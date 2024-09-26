import bcrypt from "bcrypt";
import bodyParser from "body-parser";
import express from "express";
import pg from "pg";

const app = express();
const port = 3000;
const saltRounds = 10;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Set EJS as the view engine
app.set('view engine', 'ejs');

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "habits",
  password: "Anirban@123",
  port: 5432,
});
db.connect();

let currentUserId = 0;

// Helper function to get the current user
async function getCurrentUser() {
  try {
    const result = await db.query("SELECT * FROM users WHERE id = $1", [currentUserId]);
    return result.rows[0]; // Return the user object
  } catch (err) {
    console.error("Error fetching user:", err);
    return null;
  }
}

// Home route
app.get("/", (req, res) => {
  res.render("home.ejs");
});

// Login route
app.get("/login", (req, res) => {
  res.render("login.ejs");
});

// Register route
app.get("/register", (req, res) => {
  res.render("register.ejs");
});

// Habit tracking route
app.get("/habit", async (req, res) => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return res.status(400).send("User not found");
    }

    const table_name = currentUser.allocation_tables; // Fix this line
    const result = await db.query(`
      SELECT * FROM ${table_name} 
      WHERE user_id = $1 
      ORDER BY date DESC`, [currentUser.id]);
    
    const habits = result.rows;
    console.log(habits);
    res.render("new.ejs", { habits });
  } catch (err) {
    console.error("Error fetching habits:", err);
    res.status(500).send('Server error');
  }
});

// Adding a habit
app.post('/add-habit', async (req, res) => {
  const { date, comments, month, habits, habitValues } = req.body;
  let habitData = {};
  
  // Pairing habit names with values
  habits.forEach((habit, index) => {
    habitData[habit] = habitValues[index];
  });

  try {
    const currentUser = await getCurrentUser();
    const table_name = currentUser.allocation_tables;
    
    await db.query(
      `INSERT INTO ${table_name} (date, comments, month, habit_values, user_id) 
       VALUES ($1, $2, $3, $4, $5)`,
      [date, comments, month, habitData, currentUser.id]
    );
    res.redirect('/habit');
  } catch (err) {
    console.error("Error adding habit:", err);
    res.status(500).send('Server error');
  }
});

// User registration
app.post("/register", async (req, res) => {
  const email = req.body.username;
  const password = req.body.password;

  try {
    const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    if (checkResult.rows.length > 0) {
      res.send("Email already exists. Try logging in.");
    } else {
      // Hashing the password and saving it in the database
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) {
          console.error("Error hashing password:", err);
        } else {
          const result = await db.query(
            "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id",
            [email, hash]
          );
          currentUserId = result.rows[0].id;

          // Dynamically setting the table name for the user
          const tableName = `table_${currentUserId}`;
          await db.query(
            `UPDATE users SET allocation_tables = $1 WHERE id = $2`,
            [tableName, currentUserId]
          );

          // Create the dynamic table for this user
          await db.query(`
            CREATE TABLE IF NOT EXISTS ${tableName} (
              id SERIAL PRIMARY KEY,
              date DATE,
              comments TEXT,
              month VARCHAR(50),
              habit_values JSONB,
              user_id INTEGER REFERENCES users(id)
            );
          `);

          res.redirect("/habit");
        }
      });
    }
  } catch (err) {
    console.error("Error during registration:", err);
    res.status(500).send('Server error');
  }
});

// User login
app.post("/login", async (req, res) => {
  const email = req.body.username;
  const loginPassword = req.body.password;

  try {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const storedHashedPassword = user.password;

      // Verifying the password
      bcrypt.compare(loginPassword, storedHashedPassword, (err, isMatch) => {
        if (err) {
          console.error("Error comparing passwords:", err);
          res.status(500).send('Server error');
        } else if (isMatch) {
          currentUserId = user.id;
          res.redirect("/habit");
        } else {
          res.send("Incorrect Password");
        }
      });
    } else {
      res.send("User not found");
    }
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).send('Server error');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
