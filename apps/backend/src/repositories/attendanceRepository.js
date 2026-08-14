const { query } = require("../db/connection");

/**
 * Repository for PostgreSQL attendance table queries
 * Table: attendance
 * Columns: id (bigint), student_id (bigint), date (date), status (varchar), created_at (timestamp)
 */

const findAttendanceById = async (id) => {
  const sql = `
    SELECT id, student_id, date, status, created_at
    FROM attendance
    WHERE id = $1
    LIMIT 1;
  `;
  const result = await query(sql, [id]);
  return result.rows[0] || null;
};

const findAttendanceByStudentAndDate = async (studentId, date) => {
  const sql = `
    SELECT id, student_id, date, status, created_at
    FROM attendance
    WHERE (student_id = $1 OR student_id IN (SELECT id FROM students WHERE register_number = $1::text))
      AND date = $2
    LIMIT 1;
  `;
  const result = await query(sql, [studentId, date]);
  return result.rows[0] || null;
};

const findAttendanceRecords = async (filters = {}) => {
  let sql = `
    SELECT id, student_id, date, status, created_at
    FROM attendance
  `;
  const conditions = [];
  const values = [];

  if (filters.student_id) {
    values.push(filters.student_id);
    conditions.push(
      `(student_id = $${values.length} OR student_id IN (SELECT id FROM students WHERE register_number = $${values.length}::text))`
    );
  }

  if (filters.status) {
    values.push(filters.status.toUpperCase());
    conditions.push(`status = $${values.length}`);
  }

  if (filters.date) {
    values.push(filters.date);
    conditions.push(`date = $${values.length}`);
  }

  if (filters.start_date) {
    values.push(filters.start_date);
    conditions.push(`date >= $${values.length}`);
  }

  if (filters.end_date) {
    values.push(filters.end_date);
    conditions.push(`date <= $${values.length}`);
  }

  if (conditions.length > 0) {
    sql += ` WHERE ` + conditions.join(" AND ");
  }

  sql += ` ORDER BY date DESC, created_at DESC;`;

  const result = await query(sql, values);
  return result.rows;
};

const createAttendance = async ({ student_id, date, status }) => {
  let numericStudentId = student_id;
  if (isNaN(Number(student_id))) {
    const sRes = await query("SELECT id FROM students WHERE register_number = $1 LIMIT 1;", [student_id]);
    if (sRes.rows[0]) numericStudentId = sRes.rows[0].id;
  }

  const sql = `
    INSERT INTO attendance (student_id, date, status, created_at)
    VALUES ($1, $2, $3, NOW())
    RETURNING id, student_id, date, status, created_at;
  `;
  const values = [numericStudentId, date, status];
  const result = await query(sql, values);
  return result.rows[0];
};

const updateAttendance = async (id, fields) => {
  const sql = `
    UPDATE attendance
    SET status = COALESCE($1, status),
        date = COALESCE($2, date)
    WHERE id = $3
    RETURNING id, student_id, date, status, created_at;
  `;
  const values = [fields.status || null, fields.date || null, id];
  const result = await query(sql, values);
  return result.rows[0];
};

const deleteAttendance = async (id) => {
  const sql = `
    DELETE FROM attendance
    WHERE id = $1
    RETURNING id, student_id, date, status, created_at;
  `;
  const result = await query(sql, [id]);
  return result.rows[0];
};

module.exports = {
  findAttendanceById,
  findAttendanceByStudentAndDate,
  findAttendanceRecords,
  createAttendance,
  updateAttendance,
  deleteAttendance,
};
