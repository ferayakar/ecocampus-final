const productModel = require("../models/productModel");

// ✅ TÜM ÜRÜNLERİ ÇEKME (User bilgisiyle birlikte)
const getProducts = async (req, res) => {
  try {
    const products = await productModel.getAllProducts();
    console.log("📦 Ürünler listelendi, toplam:", products.length);
    res.json(products);
  } catch (error) {
    console.error("🔥 Ürünler çekilirken hata:", error);
    res.status(500).json({ error: "Ürünler yüklenemedi" });
  }
};

// ✅ TEK BİR ÜRÜN DETAYI ÇEKME
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productModel.getProductById(id);
    
    if (!product) {
      return res.status(404).json({ message: "Ürün bulunamadı" });
    }
    
    console.log("📦 Ürün detayı döndürüldü:", product);
    res.json(product);
  } catch (error) {
    console.error("🔥 Ürün detayı çekilirken hata:", error);
    res.status(500).json({ error: "Ürün detayı yüklenemedi" });
  }
};

// ✅ YENİ ÜRÜN EKLEME
const addProduct = async (req, res) => {
  try {
    const { title, price, description, image_url, category_id } = req.body;

    if (!title || price === undefined) {
      return res.status(400).json({ message: "Başlık ve fiyat zorunludur" });
    }

    const product = await productModel.createProduct(
      title,
      price,
      description,
      image_url,
      req.user.id, // Token'dan gelen user ID
      category_id || 1 // Kategori yoksa varsayılan 1
    );

    console.log("✅ YENİ ÜRÜN EKLENDİ:", product);
    res.status(201).json(product);
  } catch (error) {
    console.error("🔥 Ürün eklenirken hata:", error);
    res.status(500).json({ error: "Ürün eklenemedi" });
  }
};

// ✅ ÜRÜN GÜNCELLEME
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, price, description, image_url, category_id } = req.body;
    const userIdFromToken = req.user.id;

    console.log(`🔄 GÜNCELLEME İSTEĞİ: Ürün ID=${id}, User ID=${userIdFromToken}`);

    const updatedProduct = await productModel.updateProduct(
      id,
      title,
      price,
      description,
      image_url,
      category_id || 1, // Kategori yoksa varsayılan 1
      userIdFromToken
    );

    if (!updatedProduct) {
      console.log("❌ GÜNCELLEME BAŞARISIZ: Yetki yok veya ürün bulunamadı");
      return res.status(403).json({ 
        message: "Bu ürünü güncelleme yetkiniz yok veya ürün bulunamadı" 
      });
    }

    console.log("✅ ÜRÜN GÜNCELLENDİ:", updatedProduct);
    res.json({ 
      message: "Ürün başarıyla güncellendi", 
      product: updatedProduct 
    });

  } catch (error) {
    console.error("🔥 GÜNCELLEME HATASI:", error);
    res.status(500).json({ error: "Güncelleme başarısız" });
  }
};

// ✅ ÜRÜN SİLME
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const userIdFromToken = req.user.id;

    console.log(`🗑️ SİLME İSTEĞİ: Ürün ID=${id}, User ID=${userIdFromToken}`);

    const deletedProduct = await productModel.deleteProduct(id, userIdFromToken);

    if (!deletedProduct) {
      console.log("❌ SİLME BAŞARISIZ: Yetki yok veya ürün bulunamadı");
      return res.status(403).json({ 
        message: "Bu ürünü silme yetkiniz yok veya ürün bulunamadı" 
      });
    }

    console.log("✅ ÜRÜN SİLİNDİ:", deletedProduct);
    res.json({ 
      message: "Ürün başarıyla silindi",
      product: deletedProduct 
    });

  } catch (error) {
    console.error("🔥 SİLME HATASI:", error);
    res.status(500).json({ error: "Silme işlemi başarısız" });
  }
};

module.exports = {
  getProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct
};