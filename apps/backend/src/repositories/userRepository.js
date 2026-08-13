const { query } = require("../db/connection");

/**
 * User Repository for PostgreSQL database interactions
 */

const findByEmail = async (email) => {
  const sql = `
    SELECT id, email, password, role, student_id, name, created_at, updated_at
    FROM users
    WHERE LOWER(email) = LOWER($1)
    LIMIT 1;
  `;
  const result = await query(sql, [email]);
  return result.rows[0] || null;
};

const findById = async (id) => {
  const sql = `
    SELECT id, email, role, student_id, name, created_at, updated_at
    FROM users
    WHERE id = $1
    LIMIT 1;
  `;
  const result = await query(sql, [id]);
  return result.rows[0] || null;
};

const createUser = async ({ email, password, role = "STUDENT", studentId = null, name = "" }) => {
  const sql = `
    INSERT INTO users (email, password, role, student_id, name, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
    RETURNING id, email, role, student_id, name, created_at, updated_at;
  `;
  const values = [email.toLowerCase(), password, role, studentId, name];
  const result = await query(sql, values);
  return result.rows[0];
};

module.exports = {
  findByEmail,
  findById,
  createUser,
};
