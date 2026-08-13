const { query } = require("../db/connection");

/**
 * Repository for PostgreSQL attendance table queries
 */

const findAttendanceById = async (id) => {
  const sql = `
    SELECT id, student_id, date, status, remarks, check_in_time, check_out_time, created_at, updated_at
    FROM attendance
    WHERE id = $1
    LIMIT 1;
  `;
  const result = await query(sql, [id]);
  return result.rows[0] || null;
};

const findAttendanceByStudentAndDate = async (studentId, date) => {
  const sql = `
    SELECT id, student_id, date, status, remarks, check_in_time, check_out_time, created_at, updated_at
    FROM attendance
    WHERE student_id = $1 AND date = $2
    LIMIT 1;
  `;
  const result = await query(sql, [studentId, date]);
  return result.rows[0] || null;
};

const findAttendanceRecords = async (filters = {}) => {
  let sql = `
    SELECT id, student_id, date, status, remarks, check_in_time, check_out_time, created_at, updated_at
    FROM attendance
  `;
  const conditions = [];
  const values = [];

  if (filters.student_id) {
    values.push(filters.student_id);
    conditions.push(`student_id = $${values.length}`);
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

const createAttendance = async ({ student_id, date, status, remarks, check_in_time, check_out_time }) => {
  const sql = `
    INSERT INTO attendance (student_id, date, status, remarks, check_in_time, check_out_time, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
    RETURNING id, student_id, date, status, remarks, check_in_time, check_out_time, created_at, updated_at;
  `;
  const values = [
    student_id,
    date,
    status,
    remarks || "",
    check_in_time || null,
    check_out_time || null,
  ];
  const result = await query(sql, values);
  return result.rows[0];
};

const updateAttendance = async (id, fields) => {
  const sql = `
    UPDATE attendance
    SET status = COALESCE($1, status),
        date = COALESCE($2, date),
        remarks = COALESCE($3, remarks),
        check_in_time = COALESCE($4, check_in_time),
        check_out_time = COALESCE($5, check_out_time),
        updated_at = NOW()
    WHERE id = $6
    RETURNING id, student_id, date, status, remarks, check_in_time, check_out_time, created_at, updated_at;
  `;
  const values = [
    fields.status || null,
    fields.date || null,
    fields.remarks !== undefined ? fields.remarks : null,
    fields.check_in_time !== undefined ? fields.check_in_time : null,
    fields.check_out_time !== undefined ? fields.check_out_time : null,
    id,
  ];
  const result = await query(sql, values);
  return result.rows[0];
};

const deleteAttendance = async (id) => {
  const sql = `
    DELETE FROM attendance
    WHERE id = $1
    RETURNING id, student_id, date, status, remarks, check_in_time, check_out_time, created_at, updated_at;
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
