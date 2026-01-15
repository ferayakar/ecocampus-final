const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

// --- KAYIT OLMA (REGISTER) ---
const register = async (req, res) => {
  try {
    console.log("📝 KAYIT İSTEĞİ GELDİ (Web/Mobil):", req.body);

    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      console.log("❌ EKSİK BİLGİ GÖNDERİLDİ");
      return res.status(400).json({ message: "Eksik bilgi" });
    }

    // Email formatı kontrolü
    if (!email.includes('@')) {
      return res.status(400).json({ message: "Geçersiz email formatı" });
    }

    // Şifre uzunluk kontrolü
    if (password.length < 6) {
      return res.status(400).json({ message: "Şifre en az 6 karakter olmalı" });
    }

    // Email zaten kayıtlı mı kontrol et
    const existingUser = await userModel.findUserByEmail(email);
    if (existingUser) {
      console.log("❌ BU EMAIL ZATEN KAYITLI:", email);
      return res.status(409).json({ message: "Bu email zaten kayıtlı" });
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Veritabanına kaydet
    const newUser = await userModel.createUser(username, email, hashedPassword);
    
    console.log("✅ KULLANICI BAŞARIYLA OLUŞTURULDU:", newUser);
    
    res.status(201).json({ 
      message: "Kayıt başarılı", 
      user: { 
        id: newUser.id, 
        username: newUser.username, 
        email: newUser.email 
      } 
    });

  } catch (error) {
    console.error("🔥 KAYIT HATASI (Detay):", error);
    res.status(500).json({
      message: "Kayıt sırasında hata oluştu",
      error: error.message
    });
  }
};

// --- GİRİŞ YAPMA (LOGIN) ---
const login = async (req, res) => {
  try {
    console.log("🔑 GİRİŞ İSTEĞİ GELDİ:", req.body);

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email ve şifre gerekli" });
    }

    // Kullanıcıyı bul
    const user = await userModel.findUserByEmail(email);
    if (!user) {
      console.log("❌ KULLANICI BULUNAMADI:", email);
      return res.status(401).json({ message: "Email veya şifre hatalı" });
    }

    // Şifreyi kontrol et
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("❌ HATALI ŞİFRE:", email);
      return res.status(401).json({ message: "Email veya şifre hatalı" });
    }

    // Token oluştur
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" } // 7 gün geçerli
    );

    console.log("✅ GİRİŞ BAŞARILI, TOKEN VERİLDİ. User ID:", user.id);
    
    // ✅ ÖNEMLİ: userId'yi response'a ekledim
    res.json({ 
      token,
      userId: user.id, // ← BURASI EKLENDİ (Mobil için önemli)
      user: { 
        id: user.id, 
        username: user.username,
        email: user.email 
      } 
    });

  } catch (error) {
    console.error("🔥 GİRİŞ HATASI:", error);
    res.status(500).json({ 
      message: "Giriş hatası", 
      error: error.message 
    });
  }
};

module.exports = { register, login };