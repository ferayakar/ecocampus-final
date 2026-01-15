const pool = require("../config/db");

// Tüm ürünleri getir
const getAllProducts = async () => {
  const sqlQuery = `
    SELECT 
      p.id, p.title, p.price, p.description, 
      p.image_url, p.category_id, p.user_id, p.created_at,
      u.username, 
      c.name AS category
    FROM products p
    INNER JOIN users u ON p.user_id = u.id
    INNER JOIN categories c ON p.category_id = c.id
    ORDER BY p.created_at DESC, p.id DESC
  `;
  
  const { rows } = await pool.query(sqlQuery);
  return rows;
};

// Tek bir ürünü ID'ye göre getir
const getProductById = async (productId) => {
  const sqlQuery = `
    SELECT 
      p.*,
      u.username,
      u.email,
      c.name AS category
    FROM products p
    INNER JOIN users u ON p.user_id = u.id
    INNER JOIN categories c ON p.category_id = c.id
    WHERE p.id = $1
  `;
  
  const { rows } = await pool.query(sqlQuery, [productId]);
  return rows.length > 0 ? rows[0] : null;
};

// Yeni ürün oluştur
const createProduct = async (productTitle, productPrice, productDesc, photoUrl, ownerId, typeId) => {
  const insertQuery = `
    INSERT INTO products (title, price, description, image_url, user_id, category_id) 
    VALUES ($1, $2, $3, $4, $5, $6) 
    RETURNING *
  `;
  
  const params = [productTitle, productPrice, productDesc, photoUrl, ownerId, typeId];
  const { rows } = await pool.query(insertQuery, params);
  
  return rows[0];
};

// Ürünü güncelle
const updateProduct = async (productId, productTitle, productPrice, productDesc, photoUrl, typeId, ownerId) => {
  const updateQuery = `
    UPDATE products 
    SET title = $1, price = $2, description = $3, image_url = $4, category_id = $5, updated_at = CURRENT_TIMESTAMP
    WHERE id = $6 AND user_id = $7 
    RETURNING *
  `;
  
  const params = [productTitle, productPrice, productDesc, photoUrl, typeId, productId, ownerId];
  const { rows } = await pool.query(updateQuery, params);
  
  return rows.length > 0 ? rows[0] : null;
};

// Ürünü sil
const deleteProduct = async (productId, ownerId) => {
  const deleteQuery = `
    DELETE FROM products 
    WHERE id = $1 AND user_id = $2 
    RETURNING *
  `;
  
  const { rows } = await pool.query(deleteQuery, [productId, ownerId]);
  return rows.length > 0 ? rows[0] : null;
};

module.exports = {
  getAllProducts,
  getProductById, 
  createProduct,
  updateProduct,
  deleteProduct
};