const { query } = require("../db/connection");

/**
 * Repository for PostgreSQL movement_passes table queries
 * Table: movement_passes
 * Columns: id (bigint), student_id (bigint), pass_date (date), pass_type (varchar),
 *          slot_id (bigint), reason (text), created_at (timestamp)
 */

const findMovementPassById = async (id) => {
  const sql = `
    SELECT id, student_id, pass_type, reason AS purpose, pass_date, slot_id,
           'PENDING' AS status, created_at
    FROM movement_passes
    WHERE id = $1
    LIMIT 1;
  `;
  const result = await query(sql, [id]);
  return result.rows[0] || null;
};

const findMovementPasses = async (filters = {}) => {
  let sql = `
    SELECT id, student_id, pass_type, reason AS purpose, pass_date, slot_id,
           'PENDING' AS status, created_at
    FROM movement_passes
  `;
  const conditions = [];
  const values = [];

  if (filters.student_id) {
    values.push(filters.student_id);
    conditions.push(
      `(student_id = $${values.length} OR student_id IN (SELECT id FROM students WHERE register_number = $${values.length}::text))`
    );
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

const findOverlappingMovementPass = async (studentId, outTime, inTime) => {
  const passDate = outTime ? outTime.split("T")[0] : new Date().toISOString().split("T")[0];
  const sql = `
    SELECT id, student_id, pass_type, reason AS purpose, pass_date
    FROM movement_passes
    WHERE (student_id = $1 OR student_id IN (SELECT id FROM students WHERE register_number = $1::text))
      AND pass_date = $2
    LIMIT 1;
  `;
  const result = await query(sql, [studentId, passDate]);
  return result.rows[0] || null;
};

const createMovementPass = async ({
  student_id,
  pass_type,
  purpose,
  out_time,
  slot_id,
}) => {
  let numericStudentId = student_id;
  if (isNaN(Number(student_id))) {
    const sRes = await query("SELECT id FROM students WHERE register_number = $1 LIMIT 1;", [student_id]);
    if (sRes.rows[0]) numericStudentId = sRes.rows[0].id;
  }

  const passDate = out_time ? out_time.split("T")[0] : new Date().toISOString().split("T")[0];
  const numericSlotId = slot_id ? parseInt(slot_id, 10) : null;

  const sql = `
    INSERT INTO movement_passes (student_id, pass_type, reason, pass_date, slot_id, created_at)
    VALUES ($1, $2, $3, $4, $5, NOW())
    RETURNING id, student_id, pass_type, reason AS purpose, pass_date, slot_id, 'PENDING' AS status, created_at;
  `;
  const values = [numericStudentId, pass_type, purpose, passDate, numericSlotId];
  const result = await query(sql, values);
  return result.rows[0];
};

const updateMovementPass = async (id, fields) => {
  const sql = `
    UPDATE movement_passes
    SET reason    = COALESCE($1, reason),
        pass_type = COALESCE($2, pass_type)
    WHERE id = $3
    RETURNING id, student_id, pass_type, reason AS purpose, pass_date, slot_id, 'PENDING' AS status, created_at;
  `;
  const values = [fields.purpose || null, fields.pass_type || null, id];
  const result = await query(sql, values);
  return result.rows[0];
};

const updateMovementPassStatus = async (id, status) => {
  return findMovementPassById(id);
};

const deleteMovementPass = async (id) => {
  const sql = `
    DELETE FROM movement_passes
    WHERE id = $1
    RETURNING id, student_id, pass_type, reason AS purpose, pass_date, slot_id, created_at;
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
