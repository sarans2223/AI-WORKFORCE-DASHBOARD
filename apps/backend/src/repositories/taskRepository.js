const { query } = require("../db/connection");

const findTasksByStudentId = async (studentId) => {
  const sql = `
    SELECT id, student_id, title, description, due_date, status, assigned_by, created_at
    FROM assigned_tasks
    WHERE student_id = $1
    ORDER BY created_at DESC;
  `;
  const result = await query(sql, [studentId]);
  return result.rows;
};

const findAllTasks = async () => {
  const sql = `
    SELECT at.id, at.student_id, at.title, at.description, at.due_date, at.status, at.assigned_by, at.created_at,
           s.name AS student_name, s.register_number AS student_register_number
      FROM assigned_tasks at
      JOIN students s ON at.student_id = s.id
      ORDER BY at.created_at DESC;
  `;
  const result = await query(sql);
  return result.rows;
};

const createTaskAssignment = async ({ student_id, title, description, due_date, assigned_by }) => {
  const sql = `
    INSERT INTO assigned_tasks (student_id, title, description, due_date, status, assigned_by, created_at)
    VALUES ($1, $2, $3, $4, 'PENDING', $5, NOW())
    RETURNING id, student_id, title, description, due_date, status, assigned_by, created_at;
  `;
  const values = [student_id, title, description || "", due_date, assigned_by || "Admin"];
  const result = await query(sql, values);
  return result.rows[0];
};

const updateTaskStatus = async (id, status) => {
  const sql = `
    UPDATE assigned_tasks
    SET status = $2
    WHERE id = $1
    RETURNING id, student_id, title, description, due_date, status, assigned_by, created_at;
  `;
  const result = await query(sql, [id, status]);
  return result.rows[0] || null;
};

module.exports = {
  findTasksByStudentId,
  findAllTasks,
  createTaskAssignment,
  updateTaskStatus
};
