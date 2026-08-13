const { query } = require("../db/connection");

/**
 * Repository for PostgreSQL movement_passes table queries.
 *
 * Table schema assumed (from 009_create_movement_passes.sql):
 *   id, student_id, pass_type, purpose, destination, out_time, in_time,
 *   status, created_at, updated_at
 */

const findMovementPassById = async (id) => {
  const sql = `
    SELECT id, student_id, pass_type, purpose, destination, out_time, in_time,
           status, created_at, updated_at
    FROM movement_passes
    WHERE id = $1
    LIMIT 1;
  `;
  const result = await query(sql, [id]);
  return result.rows[0] || null;
};

const findMovementPasses = async (filters = {}) => {
  let sql = `
    SELECT id, student_id, pass_type, purpose, destination, out_time, in_time,
           status, created_at, updated_at
    FROM movement_passes
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

  if (filters.pass_type) {
    values.push(filters.pass_type.toUpperCase());
    conditions.push(`pass_type = $${values.length}`);
  }

  if (conditions.length > 0) {
    sql += ` WHERE ` + conditions.join(" AND ");
  }

  sql += ` ORDER BY created_at DESC;`;

  const result = await query(sql, values);
  return result.rows;
};

/**
 * Check for overlapping movement pass for the student (excluding CANCELLED / REJECTED records)
 */
const findOverlappingMovementPass = async (studentId, outTime, inTime) => {
  const sql = `
    SELECT id, student_id, pass_type, purpose, out_time, in_time, status
    FROM movement_passes
    WHERE student_id = $1
      AND status NOT IN ('CANCELLED', 'REJECTED')
      AND out_time < $3
      AND in_time > $2
    LIMIT 1;
  `;
  const result = await query(sql, [studentId, outTime, inTime]);
  return result.rows[0] || null;
};

const createMovementPass = async ({
  student_id,
  pass_type,
  purpose,
  destination,
  out_time,
  in_time,
  status,
}) => {
  const sql = `
    INSERT INTO movement_passes
      (student_id, pass_type, purpose, destination, out_time, in_time, status, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
    RETURNING id, student_id, pass_type, purpose, destination, out_time, in_time,
              status, created_at, updated_at;
  `;
  const values = [
    student_id,
    pass_type,
    purpose,
    destination || null,
    out_time,
    in_time,
    status || "PENDING",
  ];
  const result = await query(sql, values);
  return result.rows[0];
};

const updateMovementPass = async (id, fields) => {
  const sql = `
    UPDATE movement_passes
    SET purpose     = COALESCE($1, purpose),
        out_time    = COALESCE($2, out_time),
        in_time     = COALESCE($3, in_time),
        pass_type   = COALESCE($4, pass_type),
        destination = COALESCE($5, destination),
        status      = COALESCE($6, status),
        updated_at  = NOW()
    WHERE id = $7
    RETURNING id, student_id, pass_type, purpose, destination, out_time, in_time,
              status, created_at, updated_at;
  `;
  const values = [
    fields.purpose     || null,
    fields.out_time    || null,
    fields.in_time     || null,
    fields.pass_type   || null,
    fields.destination !== undefined ? fields.destination : null,
    fields.status      || null,
    id,
  ];
  const result = await query(sql, values);
  return result.rows[0];
};

const updateMovementPassStatus = async (id, status) => {
  const sql = `
    UPDATE movement_passes
    SET status     = $1,
        updated_at = NOW()
    WHERE id = $2
    RETURNING id, student_id, pass_type, purpose, destination, out_time, in_time,
              status, created_at, updated_at;
  `;
  const result = await query(sql, [status, id]);
  return result.rows[0];
};

const deleteMovementPass = async (id) => {
  const sql = `
    DELETE FROM movement_passes
    WHERE id = $1
    RETURNING id, student_id, pass_type, purpose, destination, out_time, in_time,
              status, created_at, updated_at;
  `;
  const result = await query(sql, [id]);
  return result.rows[0];
};

module.exports = {
  findMovementPassById,
  findMovementPasses,
  findOverlappingMovementPass,
  createMovementPass,
  updateMovementPass,
  updateMovementPassStatus,
  deleteMovementPass,
};
