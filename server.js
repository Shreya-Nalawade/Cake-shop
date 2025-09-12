const express = require("express");
const path = require("path");
const multer = require("multer");
const bodyParser = require("body-parser");
const fs = require("fs");
const Database = require("better-sqlite3");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const dataDir = path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

const dbPath = path.join(dataDir, "cake_shop.db");
const db = new Database(dbPath);

db.prepare(`
  CREATE TABLE IF NOT EXISTS cakes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    quantity INTEGER NOT NULL,
    inStock BOOLEAN NOT NULL,
    image TEXT NOT NULL
  )
`).run();

app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(uploadDir));
app.use(bodyParser.urlencoded({ extended: true }));


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



// Homepage - list all cakes
app.get("/", (req, res) => {
  const cakes = db.prepare("SELECT * FROM cakes").all();
  res.render("index", { cakes });
});

// Upload page
app.get("/upload", (req, res) => {
  res.render("upload");
});

// Upload cake
app.post("/upload", upload.single("cakeImage"), (req, res) => {
  const { cakeName, cakePrice, cakeQuantity } = req.body;
  if (!cakeName || !cakePrice || !cakeQuantity || !req.file) return res.redirect("/upload");

  const imagePath = "/uploads/" + req.file.filename;
  const inStock = parseInt(cakeQuantity) > 0 ? 1 : 0;

  try {
    db.prepare(
      `INSERT INTO cakes (name, price, quantity, inStock, image) VALUES (?, ?, ?, ?, ?)`
    ).run(cakeName, parseFloat(cakePrice), parseInt(cakeQuantity), inStock, imagePath);

    res.redirect("/");
  } catch (err) {
    console.error("Insert error:", err);
    res.status(500).send("Database insert error");
  }
});

app.post("/delete/:id", (req, res) => {
  const cakeId = req.params.id;

  try {
    const row = db.prepare("SELECT image FROM cakes WHERE id = ?").get(cakeId);
    if (row) {
      const imagePath = path.join(__dirname, row.image);
      fs.unlink(imagePath, (err) => {
        if (err) console.error("Error deleting image:", err);
      });
    }

    db.prepare("DELETE FROM cakes WHERE id = ?").run(cakeId);
    res.redirect("/");
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).send("Database delete error");
  }
});

app.listen(PORT, () => {
  console.log(`🍰 Cake Shop running on http://localhost:${PORT}`);
});
