
const express = require("express");
const mysql = require("mysql2");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid"); // UUID for session ID

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(cors());
app.use(express.json());


const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Enter your password",
  database: "comments_db",
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed: " + err.stack);
    return;
  }
  console.log("Connected to database.");
});


app.post("/api/login", (req, res) => {
  const { username } = req.body;
  const sessionId = uuidv4(); // More secure and unique session ID
  res.json({ sessionId });
});


app.get("/api/comments", (req, res) => {
  db.query("SELECT * FROM comments ORDER BY timestamp DESC", (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error fetching comments.");
    }
    res.json(results);
  });
});


app.post("/api/comments", (req, res) => {
  const { username, comment } = req.body;

  if (!username || !comment) {
    return res.status(400).send("Username and comment are required.");
  }

  db.query(
    "INSERT INTO comments (username, comment) VALUES (?, ?)",
    [username, comment],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Error saving comment.");
      }

      const newComment = {
        id: results.insertId,
        username,
        comment,
        timestamp: new Date(), 
      };
      io.emit("new_comment", newComment); 
      res.json(newComment);
    }
  );
});


io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});


server.listen(3001, () => {
  console.log("Server is running on http://localhost:3001");
});
