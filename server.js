const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

const ADMIN_LOGIN = "Artem";
const ADMIN_PASSWORD = "Artemmaunar45"; // поменяй на свой пароль

function adminAuth(req, res, next) {
  const auth = req.headers.authorization;

  if (!auth) {
    res.setHeader("WWW-Authenticate", 'Basic realm="Admin Panel"');
    return res.status(401).send("Нужна авторизация");
  }

  const encoded = auth.split(" ")[1];
  const decoded = Buffer.from(encoded, "base64").toString();
  const [login, password] = decoded.split(":");

  if (login === ADMIN_LOGIN && password === ADMIN_PASSWORD) {
    return next();
  }

  res.setHeader("WWW-Authenticate", 'Basic realm="Admin Panel"');
  return res.status(401).send("Неверный логин или пароль");
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/admin.html", adminAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

app.use(express.static("public", {
  index: "index.html"
}));

app.use("/uploads", express.static("uploads"));

if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

const db = new sqlite3.Database("database.db");

db.run(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    code TEXT,
    price INTEGER NOT NULL,
    sv REAL,
    category TEXT NOT NULL,
    note TEXT,
    image TEXT
  )
`);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

app.post("/add-product", adminAuth, upload.single("image"), (req, res) => {
  const { name, code, price, sv, category, note } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : "";

  db.run(
    `INSERT INTO products (name, code, price, sv, category, note, image)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [name, code, price, sv, category, note, image],
    function (err) {
      if (err) return res.status(500).json({ success: false, error: err.message });
      res.json({ success: true, id: this.lastID });
    }
  );
});

app.get("/products", (req, res) => {
  db.all("SELECT * FROM products ORDER BY id DESC", (err, rows) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json(rows);
  });
});

app.put("/products/:id", adminAuth, upload.single("image"), (req, res) => {
  const id = req.params.id;
  const { name, code, price, sv, category, note } = req.body;

  db.get("SELECT image FROM products WHERE id = ?", [id], (err, oldProduct) => {
    if (err) return res.status(500).json({ success: false, error: err.message });

    const newImage = req.file ? `/uploads/${req.file.filename}` : oldProduct.image;

    db.run(
      `UPDATE products 
       SET name = ?, code = ?, price = ?, sv = ?, category = ?, note = ?, image = ?
       WHERE id = ?`,
      [name, code, price, sv, category, note, newImage, id],
      function (updateErr) {
        if (updateErr) return res.status(500).json({ success: false, error: updateErr.message });

        if (req.file && oldProduct.image) {
          const oldImagePath = path.join(__dirname, oldProduct.image);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }

        res.json({ success: true });
      }
    );
  });
});

app.delete("/products/:id", adminAuth, (req, res) => {
  const id = req.params.id;

  db.get("SELECT image FROM products WHERE id = ?", [id], (err, product) => {
    if (err) return res.status(500).json({ success: false, error: err.message });

    db.run("DELETE FROM products WHERE id = ?", [id], function (deleteErr) {
      if (deleteErr) return res.status(500).json({ success: false, error: deleteErr.message });

      if (product && product.image) {
        const imagePath = path.join(__dirname, product.image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }

      res.json({ success: true });
    });
  });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
});