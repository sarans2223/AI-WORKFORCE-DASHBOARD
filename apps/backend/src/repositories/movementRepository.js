const { query } = require("../db/connection");

/**
 * Repository for PostgreSQL movement_passes table
 *
 * Actual table columns:
 * id
 * student_id
 * pass_date
 * pass_type
 * slot_id
 * reason
 * out_time
 * in_time
 * created_at
 */

// ============================================================
// GET MOVEMENT PASS BY ID
// ============================================================
const findMovementPassById = async (id) => {
  const sql = `
    SELECT
      id,
      student_id,
      pass_date,
      pass_type,
      slot_id,
      reason,
      out_time,
      in_time,
      status,
      created_at
    FROM movement_passes
    WHERE id = $1
    LIMIT 1;
  `;

  const result = await query(sql, [id]);

  return result.rows[0] || null;
};

// ============================================================
// GET ALL MOVEMENT PASSES
// ============================================================
const findMovementPasses = async (filters = {}) => {
  let sql = `
    SELECT
      id,
      student_id,
      pass_date,
      pass_type,
      slot_id,
      reason,
      out_time,
      in_time,
      status,
      created_at
    FROM movement_passes
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

  // Filter by pass type
  if (filters.pass_type) {
    values.push(filters.pass_type.toUpperCase());
    conditions.push(`pass_type = $${values.length}`);
  }

  // Filter by status
  if (filters.status) {
    values.push(filters.status.toUpperCase());
    conditions.push(`status = $${values.length}`);
  }

  // Filter by date
  if (filters.pass_date || filters.date) {
    values.push(filters.pass_date || filters.date);
    conditions.push(`pass_date = $${values.length}`);
  }

  if (conditions.length > 0) {
    sql += ` WHERE ${conditions.join(" AND ")}`;
  }

  sql += ` ORDER BY created_at DESC;`;

  const result = await query(sql, values);

  return result.rows;
};

// ============================================================
// FIND EXISTING PASS
// ============================================================
const findOverlappingMovementPass = async (
  studentId,
  passDate,
  slotId
) => {
  let sql = `
    SELECT
      id,
      student_id,
      pass_date,
      pass_type,
      slot_id,
      reason,
      out_time,
      in_time,
      status,
      created_at
    FROM movement_passes
    WHERE student_id = $1
      AND pass_date = $2
      AND status NOT IN ('CANCELLED', 'REJECTED')
  `;
  const values = [studentId, passDate];
  if (slotId !== null && slotId !== undefined) {
    values.push(slotId);
    sql += ` AND slot_id = $${values.length}`;
  } else {
    sql += ` AND slot_id IS NULL`;
  }
  sql += ` LIMIT 1;`;

  const result = await query(sql, values);
  return result.rows[0] || null;
};

// ============================================================
// CREATE MOVEMENT PASS
// ============================================================
const createMovementPass = async ({
  student_id,
  pass_date,
  pass_type,
  slot_id,
  reason,
  out_time,
  in_time,
  status
}) => {
  const sql = `
    INSERT INTO movement_passes (
      student_id,
      pass_date,
      pass_type,
      slot_id,
      reason,
      out_time,
      in_time,
      status,
      created_at
    )
    VALUES (
      $1,
      $2,
      $3,
      $4,
      $5,
      $6,
      $7,
      $8,
      NOW()
    )
    RETURNING
      id,
      student_id,
      pass_date,
      pass_type,
      slot_id,
      reason,
      out_time,
      in_time,
      status,
      created_at;
  `;

  const values = [
    student_id,
    pass_date,
    pass_type,
    slot_id,
    reason || null,
    out_time || null,
    in_time || null,
    status || 'PENDING'
  ];

  const result = await query(sql, values);

  return result.rows[0];
};

// ============================================================
// UPDATE MOVEMENT PASS
// ============================================================
const updateMovementPass = async (id, fields) => {
  const sql = `
    UPDATE movement_passes
    SET
      pass_date = COALESCE($1, pass_date),
      pass_type = COALESCE($2, pass_type),
      slot_id = COALESCE($3, slot_id),
      reason = COALESCE($4, reason),
      out_time = COALESCE($5, out_time),
      in_time = COALESCE($6, in_time),
      status = COALESCE($7, status)
    WHERE id = $8
    RETURNING
      id,
      student_id,
      pass_date,
      pass_type,
      slot_id,
      reason,
      out_time,
      in_time,
      status,
      created_at;
  `;

  const values = [
    fields.pass_date ?? null,
    fields.pass_type ?? null,
    fields.slot_id ?? null,
    fields.reason !== undefined ? fields.reason : null,
    fields.out_time ?? null,
    fields.in_time ?? null,
    fields.status ?? null,
    id,
  ];

  const result = await query(sql, values);

  return result.rows[0] || null;
};

// ============================================================
// UPDATE PASS STATUS / TYPE
// ============================================================
const updateMovementPassStatus = async (id, passStatus) => {
  const sql = `
    UPDATE movement_passes
    SET status = $1
    WHERE id = $2
    RETURNING
      id,
      student_id,
      pass_date,
      pass_type,
      slot_id,
      reason,
      out_time,
      in_time,
      status,
      created_at;
  `;

  const result = await query(sql, [
    passStatus,
    id,
  ]);

  return result.rows[0] || null;
};

// ============================================================
// DELETE MOVEMENT PASS
// ============================================================
const deleteMovementPass = async (id) => {
  const sql = `
    DELETE FROM movement_passes
    WHERE id = $1
    RETURNING
      id,
      student_id,
      pass_date,
      pass_type,
      slot_id,
      reason,
      out_time,
      in_time,
      status,
      created_at;
  `;

  const result = await query(sql, [id]);

  return result.rows[0] || null;
};

// ============================================================
// EXPORTS
// ============================================================
module.exports = {
  findMovementPassById,
  findMovementPasses,
  findOverlappingMovementPass,
  createMovementPass,
  updateMovementPass,
  updateMovementPassStatus,
  deleteMovementPass,
};