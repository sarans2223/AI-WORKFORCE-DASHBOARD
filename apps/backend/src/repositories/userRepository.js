const { query } = require("../db/connection");

/**
 * User Repository for PostgreSQL users table
 *
 * Tables:
 *   users
 *   students
 *
 * users.student_id → students.id
 *
 * STUDENT user:
 *   users.student_id contains the corresponding students.id
 *
 * ADMIN user:
 *   users.student_id is NULL
 */

/**
 * Find a user by email/username.
 *
 * Returns login information plus the linked student information
 * when the user is a STUDENT.
 */
const findByEmail = async (email) => {
  const sql = `
    SELECT
      u.id,
      u.username AS email,
      u.username,
      u.password_hash AS password,
      u.user_type AS role,
      u.student_id,
      s.name,
      s.register_number,
      s.email AS student_email,
      u.created_at,
      u.updated_at
    FROM users u
    LEFT JOIN students s
      ON u.student_id = s.id
    WHERE LOWER(u.username) = LOWER($1)
    LIMIT 1;
  `;

  const result = await query(sql, [email]);

  return result.rows[0] || null;
};

/**
 * Find a user by user ID.
 *
 * Used after JWT authentication to retrieve the
 * current user's latest information.
 */
const findById = async (id) => {
  const sql = `
    SELECT
      u.id,
      u.username AS email,
      u.username,
      u.user_type AS role,
      u.student_id,
      s.name,
      s.register_number,
      s.email AS student_email,
      u.created_at,
      u.updated_at
    FROM users u
    LEFT JOIN students s
      ON u.student_id = s.id
    WHERE u.id = $1
    LIMIT 1;
  `;

  const result = await query(sql, [id]);

  return result.rows[0] || null;
};

/**
 * Create a new user.
 *
 * For STUDENT:
 *   studentId should contain the corresponding students.id.
 *
 * For ADMIN:
 *   studentId should normally be null.
 */
const createUser = async ({
  email,
  password,
  role = "STUDENT",
  studentId = null,
}) => {
  const sql = `
    INSERT INTO users (
      username,
      password_hash,
      user_type,
      student_id,
      created_at,
      updated_at
    )
    VALUES (
      $1,
      $2,
      $3,
      $4,
      NOW(),
      NOW()
    )
    RETURNING
      id,
      username AS email,
      username,
      user_type AS role,
      student_id,
      created_at,
      updated_at;
  `;

  const values = [
    email.toLowerCase(),
    password,
    role,
    studentId,
  ];

  const result = await query(sql, values);

  return result.rows[0];
};

module.exports = {
  findByEmail,
  findById,
  createUser,
};