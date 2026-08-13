const { query } = require("../db/connection");

/**
 * Repository for PostgreSQL leave_applications table queries.
 *
 * Assumed schema (migration file was empty):
 *   id, student_id, leave_type, reason, start_date, end_date,
 *   status, created_at, updated_at
 */

const findLeaveById = async (id) => {
  const sql = `
    SELECT id, student_id, leave_type, reason, start_date, end_date,
           status, created_at, updated_at
    FROM leave_applications
    WHERE id = $1
    LIMIT 1;
  `;
  const result = await query(sql, [id]);
  return result.rows[0] || null;
};

const findLeaveApplications = async (filters = {}) => {
  let sql = `
    SELECT id, student_id, leave_type, reason, start_date, end_date,
           status, created_at, updated_at
    FROM leave_applications
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

/**
 * Check whether a student already has an overlapping leave application
 * that is not cancelled. Returns any conflicting record.
 */
const findOverlappingLeave = async (studentId, startDate, endDate) => {
  const sql = `
    SELECT id, student_id, leave_type, reason, start_date, end_date, status
    FROM leave_applications
    WHERE student_id = $1
      AND status != 'CANCELLED'
      AND start_date <= $3
      AND end_date   >= $2
    LIMIT 1;
  `;
  const result = await query(sql, [studentId, startDate, endDate]);
  return result.rows[0] || null;
};

const createLeaveApplication = async ({
  student_id,
  leave_type,
  reason,
  start_date,
  end_date,
  status,
}) => {
  const sql = `
    INSERT INTO leave_applications
      (student_id, leave_type, reason, start_date, end_date, status, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
    RETURNING id, student_id, leave_type, reason, start_date, end_date,
              status, created_at, updated_at;
  `;
  const values = [student_id, leave_type, reason, start_date, end_date, status || "PENDING"];
  const result = await query(sql, values);
  return result.rows[0];
};

const updateLeaveApplication = async (id, fields) => {
  const sql = `
    UPDATE leave_applications
    SET reason     = COALESCE($1, reason),
        start_date = COALESCE($2, start_date),
        end_date   = COALESCE($3, end_date),
        leave_type = COALESCE($4, leave_type),
        updated_at = NOW()
    WHERE id = $5
    RETURNING id, student_id, leave_type, reason, start_date, end_date,
              status, created_at, updated_at;
  `;
  const values = [
    fields.reason    || null,
    fields.start_date || null,
    fields.end_date   || null,
    fields.leave_type || null,
    id,
  ];
  const result = await query(sql, values);
  return result.rows[0];
};

const cancelLeaveApplication = async (id) => {
  const sql = `
    UPDATE leave_applications
    SET status     = 'CANCELLED',
        updated_at = NOW()
    WHERE id = $1
    RETURNING id, student_id, leave_type, reason, start_date, end_date,
              status, created_at, updated_at;
  `;
  const result = await query(sql, [id]);
  return result.rows[0];
};

const deleteLeaveApplication = async (id) => {
  const sql = `
    DELETE FROM leave_applications
    WHERE id = $1
    RETURNING id, student_id, leave_type, reason, start_date, end_date,
              status, created_at, updated_at;
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
