const { query } = require("../db/connection");
const studentRepository = require("./studentRepository");

/**
 * Bulk Import Repository for transactional PostgreSQL batch operations
 * Table: students
 * Columns: id, register_number, name, email, phone, github_url, created_at, updated_at
 */

const findExistingStudentIdentifiers = async (studentIds, rollNumbers, emails) => {
  const sql = `
    SELECT register_number AS student_id, register_number AS roll_number, email
    FROM students
    WHERE register_number = ANY($1::text[])
       OR register_number = ANY($2::text[])
       OR LOWER(email) = ANY($3::text[]);
  `;
  const result = await query(sql, [studentIds, rollNumbers, emails.map((e) => e.toLowerCase())]);
  return result.rows;
};

/**
 * Inserts multiple valid student records using parameterized query.
 */
const bulkInsertStudents = async (studentRecords) => {
  if (!studentRecords || studentRecords.length === 0) return [];

  const valueClauses = [];
  const queryParams = [];

  studentRecords.forEach((record, index) => {
    const base = index * 5;
    valueClauses.push(
      `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, NOW(), NOW())`
    );
    const regNo = record.student_id || record.roll_number;
    queryParams.push(
      regNo,
      record.name,
      record.email,
      record.phone || null,
      record.github_url || null
    );
  });

  const sql = `
    INSERT INTO students (register_number, name, email, phone, github_url, created_at, updated_at)
    VALUES ${valueClauses.join(", ")}
    RETURNING id, register_number AS student_id, name, email, phone, github_url;
  `;

  const result = await query(sql, queryParams);
  return result.rows;
};

module.exports = {
  findExistingStudentIdentifiers,
  bulkInsertStudents,
};