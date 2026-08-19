const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");

const app = express();
app.use(bodyParser.json());
app.use(express.static("client"));

// const db = mysql.createConnection({
//   host: process.env.DB_HOST || "localhost",
//   user: process.env.DB_USER || "root",
//   password: process.env.DB_PASS || "root",
//   database: process.env.DB_NAME || "notesdb"
// });


const db = mysql.createConnection({
  host: process.env.DB_HOST || "mysql", // container name
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "root",
  database: process.env.DB_NAME || "notesdb"
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







// app.get('/', (req,res)=>{
//   res.send("hiii")
// })










app.listen(3000, () => console.log("Server running on port 3000"));
