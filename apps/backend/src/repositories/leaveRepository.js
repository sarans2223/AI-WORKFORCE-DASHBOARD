const { query } = require("../db/connection");

/**
 * Repository for PostgreSQL leave_applications table queries
 * Table: leave_applications
 * Columns: id (bigint), student_id (bigint), start_date (date), end_date (date), reason (text), created_at (timestamp)
 */

const findLeaveById = async (id) => {
  const sql = `
    SELECT id, student_id, start_date, end_date, reason, 'PENDING' AS status, created_at
    FROM leave_applications
    WHERE id = $1
    LIMIT 1;
  `;
  const result = await query(sql, [id]);
  return result.rows[0] || null;
};

const findLeaveApplications = async (filters = {}) => {
  let sql = `
    SELECT id, student_id, start_date, end_date, reason, 'PENDING' AS status, created_at
    FROM leave_applications
  `;
  const conditions = [];
  const values = [];

  if (filters.student_id) {
    values.push(filters.student_id);
    conditions.push(
      `(student_id = $${values.length} OR student_id IN (SELECT id FROM students WHERE register_number = $${values.length}::text))`
    );
  }

  if (filters.start_date) {
    values.push(filters.start_date);
    conditions.push(`start_date >= $${values.length}`);
  }

  if (filters.end_date) {
    values.push(filters.end_date);
    conditions.push(`end_date <= $${values.length}`);
  }

  if (conditions.length > 0) {
    sql += ` WHERE ` + conditions.join(" AND ");
  }

  sql += ` ORDER BY created_at DESC;`;

  const result = await query(sql, values);
  return result.rows;
};

const findOverlappingLeave = async (studentId, startDate, endDate) => {
  const sql = `
    SELECT id, student_id, start_date, end_date, reason
    FROM leave_applications
    WHERE (student_id = $1 OR student_id IN (SELECT id FROM students WHERE register_number = $1::text))
      AND start_date <= $3
      AND end_date   >= $2
    LIMIT 1;
  `;
  const result = await query(sql, [studentId, startDate, endDate]);
  return result.rows[0] || null;
};

const createLeaveApplication = async ({
  student_id,
  reason,
  start_date,
  end_date,
}) => {
  let numericStudentId = student_id;
  if (isNaN(Number(student_id))) {
    const sRes = await query("SELECT id FROM students WHERE register_number = $1 LIMIT 1;", [student_id]);
    if (sRes.rows[0]) numericStudentId = sRes.rows[0].id;
  }

  const sql = `
    INSERT INTO leave_applications (student_id, start_date, end_date, reason, created_at)
    VALUES ($1, $2, $3, $4, NOW())
    RETURNING id, student_id, start_date, end_date, reason, 'PENDING' AS status, created_at;
  `;
  const values = [numericStudentId, start_date, end_date, reason];
  const result = await query(sql, values);
  return result.rows[0];
};

const updateLeaveApplication = async (id, fields) => {
  const sql = `
    UPDATE leave_applications
    SET reason     = COALESCE($1, reason),
        start_date = COALESCE($2, start_date),
        end_date   = COALESCE($3, end_date)
    WHERE id = $4
    RETURNING id, student_id, start_date, end_date, reason, 'PENDING' AS status, created_at;
  `;
  const values = [
    fields.reason    || null,
    fields.start_date || null,
    fields.end_date   || null,
    id,
  ];
  const result = await query(sql, values);
  return result.rows[0];
};

const cancelLeaveApplication = async (id) => {
  return deleteLeaveApplication(id);
};

const deleteLeaveApplication = async (id) => {
  const sql = `
    DELETE FROM leave_applications
    WHERE id = $1
    RETURNING id, student_id, start_date, end_date, reason, created_at;
  `;
  const result = await query(sql, [id]);
  return result.rows[0];
};

module.exports = {
  findLeaveById,
  findLeaveApplications,
  findOverlappingLeave,
  createLeaveApplication,
  updateLeaveApplication,
  cancelLeaveApplication,
  deleteLeaveApplication,
};
