const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");

const app = express();
app.use(bodyParser.json());
app.use(express.static("client"));

// The Hybrid Approach
const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS,
  database: process.env.DB_NAME || "notesdb"
});


// The Strict Approach
// const db = mysql.createConnection({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASS,
//   database: process.env.DB_NAME
// });

const createTableQuery = `
    CREATE TABLE IF NOT EXISTS notes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      content TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;


 db.query(createTableQuery, (err) => {
      if (err) {
        console.error("❌ Failed to create table:", err.message);
      } else {
        console.log("✅ Notes table ready");
      }
    });
  



app.post("/addNote", (req, res) => {
  const { title, content } = req.body;
  db.query("INSERT INTO notes (title, content) VALUES (?, ?)", [title, content], (err) => {
    if (err) throw err;
    res.sendStatus(200);
  });
});

app.get("/notes", (req, res) => {
  db.query("SELECT * FROM notes", (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

app.listen(3000, () => console.log("Server running on port 3000"));
