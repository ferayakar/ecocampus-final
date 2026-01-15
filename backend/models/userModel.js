const pool = require("../config/db");

// Yeni kullanıcı kaydet
const createUser = async (displayName, userEmail, encryptedPass) => {
  const insertSQL = "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *";
  const values = [displayName, userEmail, encryptedPass];
  
  const { rows } = await pool.query(insertSQL, values);
  return rows[0];
};

// Email ile kullanıcı bul
const findUserByEmail = async (userEmail) => {
  const selectSQL = "SELECT * FROM users WHERE email = $1";
  const { rows } = await pool.query(selectSQL, [userEmail]);
  
  return rows.length > 0 ? rows[0] : null;
};

module.exports = {
  createUser,
  findUserByEmail
};