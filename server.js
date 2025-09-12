const express = require("express");
const path = require("path");
const multer = require("multer");
const bodyParser = require("body-parser");
const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = process.env.PORT || 3000;


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);


const dataDir = path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

const dbPath = path.join(dataDir, "cake_shop.db");
const db = new sqlite3.Database(dbPath);

db.run(`
  CREATE TABLE IF NOT EXISTS cakes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    quantity INTEGER NOT NULL,
    inStock BOOLEAN NOT NULL,
    image TEXT NOT NULL
  )
`);

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




app.get("/", (req, res) => {
  db.all("SELECT * FROM cakes", (err, rows) => {
    if (err) {
      console.error("Database fetch error:", err);
      return res.status(500).send("Database error");
    }
    res.render("index", { cakes: rows });
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
  const inStock = parseInt(cakeQuantity) > 0 ? 1 : 0;

  db.run(
    `INSERT INTO cakes (name, price, quantity, inStock, image) VALUES (?, ?, ?, ?, ?)`,
    [cakeName, parseFloat(cakePrice), parseInt(cakeQuantity), inStock, imagePath],
    function (err) {
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

  db.get("SELECT image FROM cakes WHERE id = ?", [cakeId], (err, row) => {
    if (err) {
      console.error("Database fetch error:", err);
      return res.status(500).send("Database error");
    }

    if (row) {
      const imagePath = path.join(__dirname, row.image);
      fs.unlink(imagePath, (err) => {
        if (err) console.error("Error deleting image:", err);
      });
    }

    db.run("DELETE FROM cakes WHERE id = ?", [cakeId], (err) => {
      if (err) {
        console.error("Delete error:", err);
        return res.status(500).send("Database delete error");
      }
      res.redirect("/");
    });
  });
});

app.listen(PORT, () => {
  console.log(`Cake Shop running on http://localhost:${PORT}`);
});
