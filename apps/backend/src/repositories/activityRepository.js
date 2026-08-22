const { query } = require("../db/connection");

/**
 * Activity Repository
 * Handles all PostgreSQL operations for daily_activities.
 *
 * Database table:
 * daily_activities
 *
 * Columns:
 * id
 * student_id
 * activity_name
 * description
 * start_time
 * end_time
 * extended_until
 * progress
 * status
 * completed_at
 * created_at
 * updated_at
 */

// ============================================================
// GET ALL ACTIVITIES
// ============================================================
const findActivities = async (filters = {}) => {
  let sql = `
    SELECT
      id,
      student_id,
      activity_name,
      description,
      start_time,
      end_time,
      extended_until,
      progress,
      status,
      completed_at,
      created_at,
      updated_at
    FROM daily_activities
  `;

  const conditions = [];
  const values = [];

  // Filter by student
  if (filters.student_id !== undefined && filters.student_id !== null) {
    values.push(filters.student_id);
    conditions.push(`student_id = $${values.length}`);
  }

  // Filter by date
  if (filters.date) {
    values.push(filters.date);
    conditions.push(`DATE(start_time) = $${values.length}`);
  }

  if (conditions.length > 0) {
    sql += ` WHERE ${conditions.join(" AND ")}`;
  }

  sql += ` ORDER BY start_time ASC`;

  const result = await query(sql, values);

  return result.rows;
};

// ============================================================
// GET ACTIVITY BY ID
// ============================================================
const findActivityById = async (id) => {
  const sql = `
    SELECT
      id,
      student_id,
      activity_name,
      description,
      start_time,
      end_time,
      extended_until,
      progress,
      status,
      completed_at,
      created_at,
      updated_at
    FROM daily_activities
    WHERE id = $1
    LIMIT 1;
  `;

  const result = await query(sql, [id]);

  return result.rows[0] || null;
};

// ============================================================
// GET ACTIVITIES BY STUDENT ID
// ============================================================
const findActivitiesByStudentId = async (studentId) => {
  const sql = `
    SELECT
      id,
      student_id,
      activity_name,
      description,
      start_time,
      end_time,
      extended_until,
      progress,
      status,
      completed_at,
      created_at,
      updated_at
    FROM daily_activities
    WHERE student_id = $1
    ORDER BY start_time ASC;
  `;

  const result = await query(sql, [studentId]);

  return result.rows;
};

// ============================================================
// CREATE ACTIVITY
// ============================================================
const createActivity = async (data) => {
  const sql = `
    INSERT INTO daily_activities (
      student_id,
      activity_name,
      description,
      start_time,
      end_time,
      progress,
      status,
      created_at,
      updated_at
    )
    VALUES (
      $1,
      $2,
      $3,
      $4,
      $5,
      $6,
      $7,
      NOW(),
      NOW()
    )
    RETURNING
      id,
      student_id,
      activity_name,
      description,
      start_time,
      end_time,
      extended_until,
      progress,
      status,
      completed_at,
      created_at,
      updated_at;
  `;

  const values = [
    data.student_id,
    data.activity_name,
    data.description || "",
    data.start_time,
    data.end_time,
    data.progress !== undefined ? Number(data.progress) : 0,
    data.status || "PLANNED",
  ];

  const result = await query(sql, values);

  return result.rows[0];
};

// ============================================================
// UPDATE ACTIVITY
// ============================================================
const updateActivity = async (id, data) => {
  const sql = `
    UPDATE daily_activities
    SET
      activity_name = COALESCE($1, activity_name),
      description = COALESCE($2, description),
      start_time = COALESCE($3, start_time),
      end_time = COALESCE($4, end_time),
      status = COALESCE($5, status),
      progress = COALESCE($6, progress),
      updated_at = NOW()
    WHERE id = $7
    RETURNING
      id,
      student_id,
      activity_name,
      description,
      start_time,
      end_time,
      extended_until,
      progress,
      status,
      completed_at,
      created_at,
      updated_at;
  `;

  const values = [
    data.activity_name ?? null,
    data.description ?? null,
    data.start_time ?? null,
    data.end_time ?? null,
    data.status ?? null,
    data.progress !== undefined ? Number(data.progress) : null,
    id,
  ];

  const result = await query(sql, values);

  return result.rows[0] || null;
};

// ============================================================
// UPDATE PROGRESS
// ============================================================
const updateProgress = async (id, data) => {
  let completedAt = null;

  if (Number(data.progress) === 100) {
    completedAt = new Date();
  }

  const sql = `
    UPDATE daily_activities
    SET
      progress = $1,
      status = COALESCE($2, status),
      completed_at = $3,
      updated_at = NOW()
    WHERE id = $4
    RETURNING
      id,
      student_id,
      activity_name,
      description,
      start_time,
      end_time,
      extended_until,
      progress,
      status,
      completed_at,
      created_at,
      updated_at;
  `;

  const values = [
    Number(data.progress),
    data.status || null,
    completedAt,
    id,
  ];

  const result = await query(sql, values);

  return result.rows[0] || null;
};

// ============================================================
// EXTEND ACTIVITY
// ============================================================
const extendActivity = async (id, data) => {
  const sql = `
    UPDATE daily_activities
    SET
      extended_until = $1,
      updated_at = NOW()
    WHERE id = $2
    RETURNING
      id,
      student_id,
      activity_name,
      description,
      start_time,
      end_time,
      extended_until,
      progress,
      status,
      completed_at,
      created_at,
      updated_at;
  `;

  const values = [
    data.new_end_time,
    id,
  ];

  const result = await query(sql, values);

  return result.rows[0] || null;
};

// ============================================================
// DELETE ACTIVITY
// ============================================================
const deleteActivity = async (id) => {
  const sql = `
    DELETE FROM daily_activities
    WHERE id = $1
    RETURNING
      id,
      student_id,
      activity_name,
      description,
      start_time,
      end_time,
      extended_until,
      progress,
      status,
      completed_at,
      created_at,
      updated_at;
  `;

  const result = await query(sql, [id]);

  return result.rows[0] || null;
};

// ============================================================
// EXPORTS
// ============================================================
module.exports = {
  findActivities,
  findActivityById,
  findActivitiesByStudentId,
  createActivity,
  updateActivity,
  updateProgress,
  extendActivity,
  deleteActivity,
};