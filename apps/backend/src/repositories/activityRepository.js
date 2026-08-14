const { query } = require("../db/connection");

/**
 * Repository for PostgreSQL daily_activities table queries
 * Table: daily_activities
 * Columns: id (bigint), student_id (bigint), activity_name (varchar), description (text),
 *          start_time (timestamp), end_time (timestamp), extended_until (timestamp),
 *          progress (integer), status (varchar), completed_at (timestamp), created_at (timestamp), updated_at (timestamp)
 */

const findActivityById = async (id) => {
  const sql = `
    SELECT id, student_id, activity_name, description, start_time, end_time,
           extended_until, progress, status, completed_at, created_at, updated_at
    FROM daily_activities
    WHERE id = $1
    LIMIT 1;
  `;
  const result = await query(sql, [id]);
  return result.rows[0] || null;
};

const findActivities = async (filters = {}) => {
  let sql = `
    SELECT id, student_id, activity_name, description, start_time, end_time,
           extended_until, progress, status, completed_at, created_at, updated_at
    FROM daily_activities
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
    conditions.push(`DATE(start_time) = $${values.length}`);
  }

  if (conditions.length > 0) {
    sql += ` WHERE ` + conditions.join(" AND ");
  }

  sql += ` ORDER BY created_at DESC;`;

  const result = await query(sql, values);
  return result.rows;
};

const findActivitiesByStudentId = async (studentId) => {
  return findActivities({ student_id: studentId });
};

const createActivity = async ({
  student_id,
  activity_name,
  description,
  start_time,
  end_time,
  status,
  progress,
}) => {
  let numericStudentId = student_id;
  if (isNaN(Number(student_id))) {
    const sRes = await query("SELECT id FROM students WHERE register_number = $1 LIMIT 1;", [student_id]);
    if (sRes.rows[0]) numericStudentId = sRes.rows[0].id;
  }

  const sql = `
    INSERT INTO daily_activities
      (student_id, activity_name, description, start_time, end_time, status, progress, created_at, updated_at)
    VALUES
      ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
    RETURNING id, student_id, activity_name, description, start_time, end_time,
              extended_until, progress, status, completed_at, created_at, updated_at;
  `;
  const values = [
    numericStudentId,
    activity_name,
    description || "",
    start_time,
    end_time,
    status || "PLANNED",
    progress || 0,
  ];
  const result = await query(sql, values);
  return result.rows[0];
};

const updateActivity = async (id, fields) => {
  const isCompleted = fields.progress === 100 || fields.status === "COMPLETED";

  const sql = `
    UPDATE daily_activities
    SET activity_name = COALESCE($1, activity_name),
        description = COALESCE($2, description),
        start_time = COALESCE($3, start_time),
        end_time = COALESCE($4, end_time),
        status = COALESCE($5, status),
        progress = COALESCE($6, progress),
        completed_at = CASE WHEN ${isCompleted ? "true" : "false"} THEN COALESCE(completed_at, NOW()) ELSE completed_at END,
        updated_at = NOW()
    WHERE id = $7
    RETURNING id, student_id, activity_name, description, start_time, end_time,
              extended_until, progress, status, completed_at, created_at, updated_at;
  `;
  const values = [
    fields.activity_name || null,
    fields.description !== undefined ? fields.description : null,
    fields.start_time || null,
    fields.end_time || null,
    fields.status || null,
    fields.progress !== undefined ? fields.progress : null,
    id,
  ];
  const result = await query(sql, values);
  return result.rows[0];
};

const updateProgress = async (id, { progress, status }) => {
  const isCompleted = progress === 100 || status === "COMPLETED";

  let sql = `
    UPDATE daily_activities
    SET progress = $1,
        completed_at = CASE WHEN ${isCompleted ? "true" : "false"} THEN COALESCE(completed_at, NOW()) ELSE completed_at END,
        updated_at = NOW()
  `;
  const values = [progress];

  if (status) {
    values.push(status);
    sql += `, status = $${values.length}`;
  }

  values.push(id);
  sql += ` WHERE id = $${values.length}
    RETURNING id, student_id, activity_name, description, start_time, end_time,
              extended_until, progress, status, completed_at, created_at, updated_at;
  `;

  const result = await query(sql, values);
  return result.rows[0];
};

const extendActivity = async (id, { new_end_time }) => {
  const sql = `
    UPDATE daily_activities
    SET extended_until = $1,
        end_time = COALESCE($1, end_time),
        updated_at = NOW()
    WHERE id = $2
    RETURNING id, student_id, activity_name, description, start_time, end_time,
              extended_until, progress, status, completed_at, created_at, updated_at;
  `;
  const values = [new_end_time, id];
  const result = await query(sql, values);
  return result.rows[0];
};

const deleteActivity = async (id) => {
  const sql = `
    DELETE FROM daily_activities
    WHERE id = $1
    RETURNING id, student_id, activity_name, description, start_time, end_time,
              extended_until, progress, status, completed_at, created_at, updated_at;
  `;
  const result = await query(sql, [id]);
  return result.rows[0];
};

module.exports = {
  findActivityById,
  findActivities,
  findActivitiesByStudentId,
  createActivity,
  updateActivity,
  updateProgress,
  extendActivity,
  deleteActivity,
};
