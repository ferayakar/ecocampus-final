// server.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors"); // Bunu ekledik

// Önce konfigürasyonu yükle
dotenv.config();

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");

const app = express();

// Middleware'ler
app.use(cors()); // Frontend (React/Mobil) erişimi için şart
app.use(express.json()); // JSON verisini okumak için şart

// Rotalar
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});