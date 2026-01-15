# 🌱 EcoCampus - Sürdürülebilir Kampüs Pazaryeri

> **YMH3007 Fullstack Web ve Mobil Uygulama Geliştirme - Final Projesi**

EcoCampus, üniversite öğrencilerinin kullanmadıkları ders materyallerini, kitaplarını ve eşyalarını satabilecekleri veya ücretsiz bağışlayabilecekleri bir dijital platformdur.

---

## 📋 İçindekiler

* [Proje Hakkında](#-proje-hakkında)
* [Teknolojiler](#-teknolojiler)
* [Mimari Yapı](#️-mimari-yapı)
* [Veritabanı](#-veritabanı)
* [Kurulum](#-kurulum)
* [Kullanım](#-kullanım)
* [API Dokümantasyonu](#-api-dokümantasyonu)
* [Ekran Görüntüleri](#-ekran-görüntüleri)
* [Öğrenci Bilgileri](#-öğrenci-bilgileri)

---

## 🎯 Proje Hakkında

EcoCampus, döngüsel ekonomi prensiplerine uygun olarak geliştirilmiş **3-katmanlı (Backend API + Web Dashboard + Mobil Uygulama)** bir fullstack uygulamadır.

### Temel Özellikler

✅ Kullanıcı kayıt ve giriş sistemi (JWT tabanlı)
✅ Ürün ekleme, düzenleme ve silme
✅ Kategori bazlı ürün listeleme
✅ Bağış sistemi (0 TL fiyatlı ürünler)
✅ Web ve mobil platformlar arası gerçek zamanlı senkronizasyon
✅ Güvenli kimlik doğrulama ve yetkilendirme

---

## 🛠 Teknolojiler

### Backend

* **Node.js** (v20.x)
* **Express.js** (v5.2.1)
* **PostgreSQL** (v8.16.3)
* **JWT** - Kimlik doğrulama
* **Bcrypt** - Şifre hashleme
* **CORS** - Cross-origin resource sharing

### Frontend Web

* **React** (v19.2.0)
* **React Router DOM** (v7.12.0)
* **Vite** (v7.2.4)
* **Axios** - HTTP istekleri
* **React Toastify** - Bildirimler

### Frontend Mobil

* **React Native** (v0.81.5)
* **Expo** (SDK v54.0.31)
* **React Navigation** (v7.1.26)
* **Axios** - HTTP istekleri
* **AsyncStorage** - Yerel veri saklama

---

## 🏗️ Mimari Yapı

```
ecocampus-final/
│
├── backend/                # Node.js + Express API
├── web/                   # React Web Dashboard
└── mobile/                # React Native Mobil Uygulama
```

**Backend MVC Katmanları:**

* `controllers/` → İş mantığı
* `models/` → Veritabanı işlemleri
* `routes/` → API endpoint’leri
* `middleware/` → JWT doğrulama

---

## 🗄️ Veritabanı (PostgreSQL)

### Tablo Yapıları

#### Users

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_users_email ON users(email);
```

#### Categories

```sql
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT
);
```

#### Products

```sql
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    price DECIMAL(10, 2) DEFAULT 0.00,
    description TEXT,
    image_url VARCHAR(500),
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_products_user ON products(user_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_created ON products(created_at DESC);
```

### Örnek Veriler

#### Kategoriler

```sql
INSERT INTO categories (name, description) VALUES 
('Ders Kitapları', 'Üniversite ders kitapları ve akademik yayınlar'),
('Dergi', 'Farklı konularda dergiler'),
('Şiir Kitapları', 'Şiir ve antoloji kitapları'),
('Anı Kitapları', 'Anı ve biyografi kitapları'),
('Romanlar', 'Roman ve kurgu eserleri'),
('Hikaye Kitapları', 'Kısa hikaye kitapları'),
('Gezi Kitapları', 'Gezi ve seyahat kitapları');
```

#### Kullanıcılar

```sql
INSERT INTO users (username, email, password) VALUES 
('ahmet_yilmaz', 'ahmet@kgu.edu.tr', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW'),
('zeynep_kara', 'zeynep@kgu.edu.tr', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW'),
('mehmet_demir', 'mehmet@kgu.edu.tr', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW');
```

#### Ürünler

```sql
INSERT INTO products (title, price, description, image_url, user_id, category_id) VALUES 
('Calculus Ders Kitabı - James Stewart', 150.00, 'Az kullanılmış, üzerinde notlar var. 9. baskı.', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400', 1, 1),
('Mühendislik Matematiği Notları', 0.00, 'Kendi aldığım notlar, PDF olarak paylaşabilirim.', 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400', 3, 1),
('Türk Edebiyatı Romanları', 75.00, 'Klasik Türk romanları. Az kullanılmış.', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400', 2, 5);
```

### Otomatik Güncelleme Trigger’ları

```sql
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_timestamp
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_products_timestamp
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();
```

### Veritabanı Durum Kontrolü

```sql
SELECT 'Veritabanı başarıyla oluşturuldu!' AS status;
SELECT COUNT(*) AS user_count FROM users;
SELECT COUNT(*) AS category_count FROM categories;
SELECT COUNT(*) AS product_count FROM products;
```

---

## 📦 Kurulum

1️⃣ Repository'yi klonlayın:

```bash
git clone https://github.com/ferayakar/ecocampus-final.git
cd ecocampus-final
```

2️⃣ Backend kurulumu:

```bash
cd backend
npm install
```

3️⃣ `.env` dosyasını oluşturun:

```env
PORT=2022
DB_USER=postgres
DB_PASSWORD=feray12345!
DB_HOST=localhost
DB_NAME=campus_marketplace_db
DB_PORT=5432
JWT_SECRET=secret_book_feray
```

4️⃣ Backend çalıştırın:

```bash
npm run dev
```

5️⃣ Web uygulaması:

```bash
cd ../web
npm install
npm run dev
```

6️⃣ Mobil uygulama:

```bash
cd ../mobile
npm install
npx expo start
```

---

## 🔗 Öğrenci Bilgileri

* **Ad Soyad:** Feray Akar

* **Öğrenci No:** 232010080030

* **Ders:** YMH3007

* **Öğretim Görevlisi:** Dr. Öğr. Üyesi Muhammed Ali KOŞAN

* **Dönem:** 2025-2026 Güz

* **GitHub Repository:** [https://github.com/ferayakar/ecocampus-final](https://github.com/ferayakar/ecocampus-final)