const { query } = require("../db/connection");

/**
 * Repository for PostgreSQL student table queries
 */

const findStudentByStudentId = async (studentId) => {
  const sql = `
    SELECT id, student_id, name, roll_number, email, phone, github_url, created_at, updated_at
    FROM students
    WHERE student_id = $1
    LIMIT 1;
  `;
  const result = await query(sql, [studentId]);
  return result.rows[0] || null;
};

const findStudentById = async (identifier) => {
  const sql = `
    SELECT id, student_id, name, roll_number, email, phone, github_url, created_at, updated_at
    FROM students
    WHERE student_id = $1 OR id::text = $1
    LIMIT 1;
  `;
  const result = await query(sql, [identifier]);
  return result.rows[0] || null;
};

const findStudentByRollNumber = async (rollNumber) => {
  const sql = `
    SELECT id, student_id, name, roll_number, email, phone, github_url, created_at, updated_at
    FROM students
    WHERE roll_number = $1
    LIMIT 1;
  `;
  const result = await query(sql, [rollNumber]);
  return result.rows[0] || null;
};

const findStudentByEmail = async (email) => {
  const sql = `
    SELECT id, student_id, name, roll_number, email, phone, github_url, created_at, updated_at
    FROM students
    WHERE LOWER(email) = LOWER($1)
    LIMIT 1;
  `;
  const result = await query(sql, [email]);
  return result.rows[0] || null;
};

const findAllStudents = async () => {
  const sql = `
    SELECT id, student_id, name, roll_number, email, phone, github_url, created_at, updated_at
    FROM students
    ORDER BY created_at DESC;
  `;
  const result = await query(sql);
  return result.rows;
};

const createStudent = async ({ student_id, name, roll_number, email, phone, github_url }) => {
  const sql = `
    INSERT INTO students (student_id, name, roll_number, email, phone, github_url, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
    RETURNING id, student_id, name, roll_number, email, phone, github_url, created_at, updated_at;
  `;
  const values = [student_id, name, roll_number, email, phone || null, github_url || null];
  const result = await query(sql, values);
  return result.rows[0];
};

const updateStudent = async (identifier, { name, roll_number, email, phone, github_url }) => {
  const sql = `
    UPDATE students
    SET name = COALESCE($1, name),
        roll_number = COALESCE($2, roll_number),
        email = COALESCE($3, email),
        phone = COALESCE($4, phone),
        github_url = COALESCE($5, github_url),
        updated_at = NOW()
    WHERE student_id = $6 OR id::text = $6
    RETURNING id, student_id, name, roll_number, email, phone, github_url, created_at, updated_at;
  `;
  const values = [name, roll_number, email, phone, github_url, identifier];
  const result = await query(sql, values);
  return result.rows[0];
};

const deleteStudent = async (identifier) => {
  const sql = `
    DELETE FROM students
    WHERE student_id = $1 OR id::text = $1
    RETURNING id, student_id, name, roll_number, email, phone, github_url, created_at, updated_at;
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
