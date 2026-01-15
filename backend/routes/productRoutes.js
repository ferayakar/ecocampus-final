const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/", productController.getProducts); // Tüm ürünleri listele
router.get("/:id", productController.getProductById); // Tek ürün detayı

router.post("/", authMiddleware, productController.addProduct); // Yeni ürün ekle
router.put("/:id", authMiddleware, productController.updateProduct); // Ürün güncelle
router.delete("/:id", authMiddleware, productController.deleteProduct); // Ürün sil

module.exports = router;