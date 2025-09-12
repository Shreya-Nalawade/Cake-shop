const express = require("express");
const path = require("path");
const multer = require("multer");

const app = express();
const PORT = process.env.PORT || 3000;

// Set EJS as template engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
const upload = multer({ storage });

// Fake database
let cakes = [
  { name: "Chocolate Delight", image: "/uploads/chocolate.jpeg" },
  { name: "Strawberry Dream", image: "/uploads/strawberry.jpeg" }
];

// Routes
app.get("/", (req, res) => {
  res.render("index", { cakes });
});

app.get("/upload", (req, res) => {
  res.render("upload");
});

app.post("/upload", upload.single("cakeImage"), (req, res) => {
  const { cakeName } = req.body;
  if (cakeName && req.file) {
    cakes.push({ name: cakeName, image: "/uploads/" + req.file.filename });
  }
  res.redirect("/");
});

// Start server
app.listen(PORT, () => {
  console.log(`Cake Shop running on port ${PORT}`);
});
