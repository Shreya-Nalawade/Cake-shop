const express = require("express");
const path = require("path");
const multer = require("multer");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// Set EJS as template engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// MySQL connection pool
const db = mysql.createPool({
  host: "localhost",
  user: "root",            // change if needed
  password: "Shreya@0708", // change to your MySQL password
  database: "cake_shop"
});

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(uploadDir));
app.use(bodyParser.urlencoded({ extended: true }));

// Multer setup for file uploads with image validation
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed!"), false);
  }
});

// Routes
app.get("/", (req, res) => {
  db.query("SELECT * FROM cakes", (err, results) => {
    if (err) {
      console.error("Database fetch error:", err);
      return res.status(500).send("Database error");
    }
    res.render("index", { cakes: results });
  });
});

app.get("/upload", (req, res) => {
  res.render("upload");
});

app.post("/upload", upload.single("cakeImage"), (req, res) => {
  const { cakeName, cakePrice, cakeQuantity } = req.body;

  if (!cakeName || !cakePrice || !cakeQuantity || !req.file) {
    return res.redirect("/upload");
  }

  const imagePath = "/uploads/" + req.file.filename;

  db.query(
    "INSERT INTO cakes (name, price, quantity, inStock, image) VALUES (?, ?, ?, ?, ?)",
    [cakeName, parseFloat(cakePrice), parseInt(cakeQuantity), parseInt(cakeQuantity) > 0, imagePath],
    (err) => {
      if (err) {
        console.error("Insert error:", err);
        return res.status(500).send("Database insert error");
      }
      res.redirect("/");
    }
  );
});

app.post("/delete/:id", (req, res) => {
  const cakeId = req.params.id;

  // First get the image path
  db.query("SELECT image FROM cakes WHERE id = ?", [cakeId], (err, results) => {
    if (err) {
      console.error("Database fetch error:", err);
      return res.status(500).send("Database error");
    }

    if (results.length > 0) {
      const imagePath = path.join(__dirname, results[0].image);
      // Delete the file
      fs.unlink(imagePath, (err) => {
        if (err) console.error("Error deleting image:", err);
      });
    }

    // Delete the cake record
    db.query("DELETE FROM cakes WHERE id = ?", [cakeId], (err) => {
      if (err) {
        console.error("Delete error:", err);
        return res.status(500).send("Database delete error");
      }
      res.redirect("/");
    });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Cake Shop running on http://localhost:${PORT}`);
});
