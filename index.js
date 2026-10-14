// const express = require("express");
// const bodyParser = require("body-parser");
// const mysql = require("mysql2");

// const app = express();
// app.use(bodyParser.json());
// app.use(express.static("client"));

// // The Hybrid Approach
// // const db = mysql.createConnection({
// //   host: process.env.DB_HOST || "localhost",
// //   user: process.env.DB_USER || "admin",
// //   password: process.env.DB_PASS,
// //   database: process.env.DB_NAME || "notesdb"
// // });


// // The Strict Approach
// const db = mysql.createConnection({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASS,
//   database: process.env.DB_NAME
// });

// const createTableQuery = `
//     CREATE TABLE IF NOT EXISTS notes (
//       id INT AUTO_INCREMENT PRIMARY KEY,
//       title VARCHAR(255) NOT NULL,
//       content TEXT,
//       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//     )
//   `;


//  db.query(createTableQuery, (err) => {
//       if (err) {
//         console.error("❌ Failed to create table:", err.message);
//       } else {
//         console.log("✅ Notes table ready");
//       }
//     });
  



// app.post("/addNote", (req, res) => {
//   const { title, content } = req.body;
//   db.query("INSERT INTO notes (title, content) VALUES (?, ?)", [title, content], (err) => {
//     if (err) throw err;
//     res.sendStatus(200);
//   });
// });

// app.get("/notes", (req, res) => {
//   db.query("SELECT * FROM notes", (err, results) => {
//     if (err) throw err;
//     res.json(results);
//   });
// });

// app.listen(3000, () => console.log("Server running on port 3000"));






const express = require("express");
const mysql = require("mysql2");

const app = express();

app.use(express.json());
app.use(express.static("client"));

// MySQL connection pool — configuration comes from environment variables
const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Verify database connectivity and initialize the table before starting
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
    console.error("Failed to initialize notes table:", err.message);
    process.exit(1);
  }

  console.log("Notes table ready");

  app.listen(3000, () => {
    console.log("Server running on port 3000");
  });
});

// Save a note
app.post("/addNote", (req, res) => {
  const { title, content } = req.body;

  if (typeof title !== "string" || !title.trim()) {
    return res.status(400).json({ error: "Title is required" });
  }

  db.query(
    "INSERT INTO notes (title, content) VALUES (?, ?)",
    [title.trim(), content || ""],
    (err, result) => {
      if (err) {
        console.error("Failed to save note:", err.message);
        return res.status(500).json({ error: "Failed to save note" });
      }

      res.status(201).json({
        message: "Note saved successfully",
        id: result.insertId
      });
    }
  );
});

// Retrieve saved notes
app.get("/notes", (req, res) => {
  db.query(
    "SELECT * FROM notes ORDER BY created_at DESC, id DESC",
    (err, results) => {
      if (err) {
        console.error("Failed to fetch notes:", err.message);
        return res.status(500).json({ error: "Failed to fetch notes" });
      }

      res.json(results);
    }
  );
});
