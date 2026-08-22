const { query } = require("../db/connection");

/**
 * Repository for PostgreSQL attendance table
 *
 * Actual database columns:
 * id
 * student_id
 * date
 * status
 * session
 * created_at
 */

// ============================================================
// GET ATTENDANCE BY ID
// ============================================================
const findAttendanceById = async (id) => {
  const sql = `
    SELECT
      id,
      student_id,
      date,
      status,
      session,
      created_at
    FROM attendance
    WHERE id = $1
    LIMIT 1;
  `;

  const result = await query(sql, [id]);

  return result.rows[0] || null;
};

// ============================================================
// GET ATTENDANCE BY STUDENT AND DATE
// ============================================================
const findAttendanceByStudentAndDate = async (studentId, date, session = null) => {
  let sql = `
    SELECT
      id,
      student_id,
      date,
      status,
      session,
      created_at
    FROM attendance
    WHERE student_id = $1
      AND date = $2
  `;
  const params = [studentId, date];
  if (session !== null) {
    sql += ` AND UPPER(session) = UPPER($3)`;
    params.push(session);
  }
  sql += ` LIMIT 1;`;

  const result = await query(sql, params);

  return result.rows[0] || null;
};

// ============================================================
// GET ATTENDANCE RECORDS
// ============================================================
const findAttendanceRecords = async (filters = {}) => {
  let sql = `
    SELECT
      id,
      student_id,
      date,
      status,
      session,
      created_at
    FROM attendance
  `;

  const conditions = [];
  const values = [];

  // Filter by student
  if (
    filters.student_id !== undefined &&
    filters.student_id !== null
  ) {
    values.push(filters.student_id);
    conditions.push(`student_id = $${values.length}`);
  }

  // Filter by status
  if (filters.status) {
    values.push(filters.status.toUpperCase());
    conditions.push(`status = $${values.length}`);
  }

  // Filter by session
  if (filters.session) {
    values.push(filters.session.toUpperCase());
    conditions.push(`session = $${values.length}`);
  }

  // Filter by exact date
  if (filters.date) {
    values.push(filters.date);
    conditions.push(`date = $${values.length}`);
  }

  // Filter by start date
  if (filters.start_date) {
    values.push(filters.start_date);
    conditions.push(`date >= $${values.length}`);
  }

  // Filter by end date
  if (filters.end_date) {
    values.push(filters.end_date);
    conditions.push(`date <= $${values.length}`);
  }

  if (conditions.length > 0) {
    sql += ` WHERE ${conditions.join(" AND ")}`;
  }

  sql += `
    ORDER BY date DESC, created_at DESC;
  `;

  const result = await query(sql, values);

  return result.rows;
};

// ============================================================
// CREATE ATTENDANCE
// ============================================================
const createAttendance = async ({
  student_id,
  date,
  status,
  session = 'FORENOON',
}) => {
  const sql = `
    INSERT INTO attendance (
      student_id,
      date,
      status,
      session,
      created_at
    )
    VALUES (
      $1,
      $2,
      $3,
      $4,
      NOW()
    )
    RETURNING
      id,
      student_id,
      date,
      status,
      session,
      created_at;
  `;

  const values = [
    student_id,
    date,
    status,
    session.toUpperCase(),
  ];

  const result = await query(sql, values);

  return result.rows[0];
};

// ============================================================
// UPDATE ATTENDANCE
// ============================================================
const updateAttendance = async (id, fields) => {
  let sql = `
    UPDATE attendance
    SET
      status = COALESCE($1, status),
      date = COALESCE($2, date)
  `;
  const values = [
    fields.status || null,
    fields.date || null,
  ];

  if (fields.session !== undefined) {
    values.push(fields.session ? fields.session.toUpperCase() : null);
    sql += `, session = COALESCE($${values.length}, session)`;
  }

  values.push(id);
  sql += `
    WHERE id = $${values.length}
    RETURNING
      id,
      student_id,
      date,
      status,
      session,
      created_at;
  `;

  const result = await query(sql, values);

  return result.rows[0] || null;
};

// ============================================================
// DELETE ATTENDANCE
// ============================================================
const deleteAttendance = async (id) => {
  const sql = `
    DELETE FROM attendance
    WHERE id = $1
    RETURNING
      id,
      student_id,
      date,
      status,
      session,
      created_at;
  `;

  const result = await query(sql, [id]);

  return result.rows[0] || null;
};

// ============================================================
// EXPORTS
// ============================================================
module.exports = {
  findAttendanceById,
  findAttendanceByStudentAndDate,
  findAttendanceRecords,
  createAttendance,
  updateAttendance,
  deleteAttendance,
};