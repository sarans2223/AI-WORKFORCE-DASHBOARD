const { query } = require("../db/connection");

/**
 * Repository for PostgreSQL daily_activities table queries
 */

const findActivityById = async (id) => {
  const sql = `
    SELECT id, student_id, activity_name, description, start_time, end_time,
           original_end_time, extension_duration, status, progress, date, created_at, updated_at
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
           original_end_time, extension_duration, status, progress, date, created_at, updated_at
    FROM daily_activities
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

  if (conditions.length > 0) {
    sql += ` WHERE ` + conditions.join(" AND ");
  }

  sql += ` ORDER BY created_at DESC;`;

  const result = await query(sql, values);
  return result.rows;
};

const createActivity = async ({
  student_id,
  activity_name,
  description,
  start_time,
  end_time,
  status,
  progress,
  date,
}) => {
  const sql = `
    INSERT INTO daily_activities
      (student_id, activity_name, description, start_time, end_time, status, progress, date, created_at, updated_at)
    VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
    RETURNING id, student_id, activity_name, description, start_time, end_time,
              original_end_time, extension_duration, status, progress, date, created_at, updated_at;
  `;
  const values = [
    student_id,
    activity_name,
    description || "",
    start_time,
    end_time,
    status || "PLANNED",
    progress || 0,
    date || new Date().toISOString().split("T")[0],
  ];
  const result = await query(sql, values);
  return result.rows[0];
};

const updateActivity = async (id, fields) => {
  const sql = `
    UPDATE daily_activities
    SET activity_name = COALESCE($1, activity_name),
        description = COALESCE($2, description),
        start_time = COALESCE($3, start_time),
        end_time = COALESCE($4, end_time),
        status = COALESCE($5, status),
        progress = COALESCE($6, progress),
        updated_at = NOW()
    WHERE id = $7
    RETURNING id, student_id, activity_name, description, start_time, end_time,
              original_end_time, extension_duration, status, progress, date, created_at, updated_at;
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
  let sql = `
    UPDATE daily_activities
    SET progress = $1,
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
              original_end_time, extension_duration, status, progress, date, created_at, updated_at;
  `;

  const result = await query(sql, values);
  return result.rows[0];
};

const extendActivity = async (id, { original_end_time, extension_duration, new_end_time }) => {
  const sql = `
    UPDATE daily_activities
    SET original_end_time = COALESCE(original_end_time, $1),
        extension_duration = COALESCE(extension_duration, 0) + $2,
        end_time = COALESCE($3, end_time),
        updated_at = NOW()
    WHERE id = $4
    RETURNING id, student_id, activity_name, description, start_time, end_time,
              original_end_time, extension_duration, status, progress, date, created_at, updated_at;
  `;
  const values = [original_end_time, extension_duration, new_end_time, id];
  const result = await query(sql, values);
  return result.rows[0];
};

const deleteActivity = async (id) => {
  const sql = `
    DELETE FROM daily_activities
    WHERE id = $1
    RETURNING id, student_id, activity_name, description, start_time, end_time,
              original_end_time, extension_duration, status, progress, date, created_at, updated_at;
  `;
  const result = await query(sql, [id]);
  return result.rows[0];
};

module.exports = {
  findActivityById,
  findActivities,
  createActivity,
  updateActivity,
  updateProgress,
  extendActivity,
  deleteActivity,
};
