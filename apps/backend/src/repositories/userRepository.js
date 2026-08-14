const { query } = require("../db/connection");

/**
 * User Repository for PostgreSQL users table
 * Table: users
 * Columns: id (bigint), username (varchar), password_hash (text), user_type (varchar), created_at, updated_at
 */

const findByEmail = async (email) => {
  const sql = `
    SELECT id, username AS email, username, password_hash AS password, user_type AS role, created_at, updated_at
    FROM users
    WHERE LOWER(username) = LOWER($1)
    LIMIT 1;
  `;
  const result = await query(sql, [email]);
  return result.rows[0] || null;
};

const findById = async (id) => {
  const sql = `
    SELECT id, username AS email, username, user_type AS role, created_at, updated_at
    FROM users
    WHERE id = $1
    LIMIT 1;
  `;
  const result = await query(sql, [id]);
  return result.rows[0] || null;
};

const createUser = async ({ email, password, role = "STUDENT", studentId = null, name = "" }) => {
  const sql = `
    INSERT INTO users (username, password_hash, user_type, created_at, updated_at)
    VALUES ($1, $2, $3, NOW(), NOW())
    RETURNING id, username AS email, username, user_type AS role, created_at, updated_at;
  `;
  const values = [email.toLowerCase(), password, role];
  const result = await query(sql, values);
  return result.rows[0];
};

module.exports = {
  findByEmail,
  findById,
  createUser,
};
