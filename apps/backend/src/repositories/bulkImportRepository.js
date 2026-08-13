const { query } = require("../db/connection");
const studentRepository = require("./studentRepository");

/**
 * Bulk Import Repository for transactional PostgreSQL batch operations
 */

const findExistingStudentIdentifiers = async (studentIds, rollNumbers, emails) => {
  const sql = `
    SELECT student_id, roll_number, email
    FROM students
    WHERE student_id = ANY($1::text[])
       OR roll_number = ANY($2::text[])
       OR LOWER(email) = ANY($3::text[]);
  `;
  const result = await query(sql, [studentIds, rollNumbers, emails.map((e) => e.toLowerCase())]);
  return result.rows;
};

/**
 * Inserts multiple valid student records using parameterized query within a transaction.
 */
const bulkInsertStudents = async (studentRecords) => {
  if (!studentRecords || studentRecords.length === 0) return [];

  // Build parameterized batch query
  // VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()), ($7, $8, ...)
  const valueClauses = [];
  const queryParams = [];

  studentRecords.forEach((record, index) => {
    const base = index * 6;
    valueClauses.push(
      `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, NOW(), NOW())`
    );
    queryParams.push(
      record.student_id,
      record.name,
      record.roll_number,
      record.email,
      record.phone || null,
      record.github_url || null
    );
  });

  const sql = `
    INSERT INTO students (student_id, name, roll_number, email, phone, github_url, created_at, updated_at)
    VALUES ${valueClauses.join(", ")}
    RETURNING id, student_id, name, roll_number, email, phone, github_url;
  `;

  const result = await query(sql, queryParams);
  return result.rows;
};

module.exports = {
  findExistingStudentIdentifiers,
  bulkInsertStudents,
};
