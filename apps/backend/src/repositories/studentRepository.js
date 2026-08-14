const { query } = require("../db/connection");

/**
 * Repository for PostgreSQL student table queries
 * Table name: students
 * Column schema:
 *   id (bigint), register_number (varchar), name (varchar), email (varchar),
 *   phone (varchar), github_url (text), created_at (timestamp), updated_at (timestamp)
 */

const findStudentByStudentId = async (studentId) => {
  const sql = `
    SELECT id, register_number AS student_id, register_number, name, email, phone, github_url, created_at, updated_at
    FROM students
    WHERE register_number = $1 OR id::text = $1
    LIMIT 1;
  `;
  const result = await query(sql, [studentId]);
  return result.rows[0] || null;
};

const findStudentById = async (identifier) => {
  const sql = `
    SELECT id, register_number AS student_id, register_number, name, email, phone, github_url, created_at, updated_at
    FROM students
    WHERE register_number = $1 OR id::text = $1
    LIMIT 1;
  `;
  const result = await query(sql, [identifier]);
  return result.rows[0] || null;
};

const findStudentByRollNumber = async (rollNumber) => {
  const sql = `
    SELECT id, register_number AS student_id, register_number, name, email, phone, github_url, created_at, updated_at
    FROM students
    WHERE register_number = $1
    LIMIT 1;
  `;
  const result = await query(sql, [rollNumber]);
  return result.rows[0] || null;
};

const findStudentByEmail = async (email) => {
  const sql = `
    SELECT id, register_number AS student_id, register_number, name, email, phone, github_url, created_at, updated_at
    FROM students
    WHERE LOWER(email) = LOWER($1)
    LIMIT 1;
  `;
  const result = await query(sql, [email]);
  return result.rows[0] || null;
};

const findAllStudents = async () => {
  const sql = `
    SELECT id, register_number AS student_id, register_number, name, email, phone, github_url, created_at, updated_at
    FROM students
    ORDER BY created_at DESC;
  `;
  const result = await query(sql);
  return result.rows;
};

const createStudent = async ({ student_id, name, roll_number, email, phone, github_url }) => {
  const regNo = student_id || roll_number;
  const sql = `
    INSERT INTO students (register_number, name, email, phone, github_url, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
    RETURNING id, register_number AS student_id, register_number, name, email, phone, github_url, created_at, updated_at;
  `;
  const values = [regNo, name, email, phone || null, github_url || null];
  const result = await query(sql, values);
  return result.rows[0];
};

const updateStudent = async (identifier, { name, roll_number, email, phone, github_url }) => {
  const sql = `
    UPDATE students
    SET name = COALESCE($1, name),
        email = COALESCE($2, email),
        phone = COALESCE($3, phone),
        github_url = COALESCE($4, github_url),
        register_number = COALESCE($5, register_number),
        updated_at = NOW()
    WHERE register_number = $6 OR id::text = $6
    RETURNING id, register_number AS student_id, register_number, name, email, phone, github_url, created_at, updated_at;
  `;
  const values = [name, email, phone, github_url, roll_number || null, identifier];
  const result = await query(sql, values);
  return result.rows[0];
};

const deleteStudent = async (identifier) => {
  const sql = `
    DELETE FROM students
    WHERE register_number = $1 OR id::text = $1
    RETURNING id, register_number AS student_id, register_number, name, email, phone, github_url, created_at, updated_at;
  `;
  const result = await query(sql, [identifier]);
  return result.rows[0];
};

module.exports = {
  findStudentByStudentId,
  findStudentById,
  findStudentByRollNumber,
  findStudentByEmail,
  findAllStudents,
  createStudent,
  updateStudent,
  deleteStudent,
};
