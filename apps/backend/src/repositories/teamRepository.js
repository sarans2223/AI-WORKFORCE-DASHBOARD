const { query } = require("../db/connection");

const findTeamByStudentId = async (studentId) => {
  const sql = `
    SELECT t.id, t.team_id, t.team_name, t.lead_student_id, t.project_name, t.project_description, t.assigned_by, t.created_at,
           t.git_repo, COALESCE(t.progress, 0) AS progress, COALESCE(t.status, 'ACTIVE') AS status, t.completed_at,
           s.name AS lead_name
    FROM teams t
    LEFT JOIN students s ON t.lead_student_id = s.id
    WHERE t.lead_student_id = $1 
       OR t.id IN (SELECT team_id FROM team_members WHERE student_id = $1)
    ORDER BY CASE WHEN COALESCE(t.status, 'ACTIVE') = 'ACTIVE' THEN 0 ELSE 1 END, t.created_at DESC, t.id DESC
    LIMIT 1;
  `;
  const result = await query(sql, [studentId]);
  return result.rows[0] || null;
};

const findTeamsByStudentId = async (studentId) => {
  const sql = `
    SELECT t.id, t.team_id, t.team_name, t.lead_student_id, t.project_name, t.project_description, t.assigned_by, t.created_at,
           t.git_repo, COALESCE(t.progress, 0) AS progress, COALESCE(t.status, 'ACTIVE') AS status, t.completed_at,
           s.name AS lead_name
    FROM teams t
    LEFT JOIN students s ON t.lead_student_id = s.id
    WHERE t.lead_student_id = $1 
       OR t.id IN (SELECT team_id FROM team_members WHERE student_id = $1)
    ORDER BY CASE WHEN COALESCE(t.status, 'ACTIVE') = 'ACTIVE' THEN 0 ELSE 1 END, t.created_at DESC, t.id DESC;
  `;
  const result = await query(sql, [studentId]);
  return result.rows;
};

const findTeamMembers = async (teamId) => {
  const sql = `
    SELECT s.id, s.register_number, s.name, s.email, s.phone, s.github_url
    FROM team_members tm
    JOIN students s ON tm.student_id = s.id
    WHERE tm.team_id = $1;
  `;
  const result = await query(sql, [teamId]);
  return result.rows;
};

const findAllTeams = async () => {
  const sql = `
    SELECT t.id, t.team_id, t.team_name, t.lead_student_id, t.project_name, t.project_description, t.assigned_by, t.created_at,
           t.git_repo, COALESCE(t.progress, 0) AS progress, COALESCE(t.status, 'ACTIVE') AS status, t.completed_at,
           s.name AS lead_name
    FROM teams t
    LEFT JOIN students s ON t.lead_student_id = s.id
    ORDER BY CASE WHEN COALESCE(t.status, 'ACTIVE') = 'ACTIVE' THEN 0 ELSE 1 END, t.created_at DESC;
  `;
  const result = await query(sql);
  return result.rows;
};

const findTeamById = async (id) => {
  const sql = `
    SELECT t.id, t.team_id, t.team_name, t.lead_student_id, t.project_name, t.project_description, t.assigned_by, t.created_at,
           t.git_repo, COALESCE(t.progress, 0) AS progress, COALESCE(t.status, 'ACTIVE') AS status, t.completed_at,
           s.name AS lead_name
    FROM teams t
    LEFT JOIN students s ON t.lead_student_id = s.id
    WHERE t.id = $1
    LIMIT 1;
  `;
  const result = await query(sql, [id]);
  return result.rows[0] || null;
};

const createTeam = async ({ team_id, team_name, lead_student_id, project_name, project_description, assigned_by, git_repo }) => {
  const sql = `
    INSERT INTO teams (team_id, team_name, lead_student_id, project_name, project_description, assigned_by, git_repo, progress, status, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, 0, 'ACTIVE', NOW())
    RETURNING id, team_id, team_name, lead_student_id, project_name, project_description, assigned_by, git_repo, progress, status, created_at;
  `;
  const values = [team_id, team_name, lead_student_id, project_name, project_description, assigned_by || 'sushanthi736@gmail.com', git_repo || null];
  const result = await query(sql, values);
  return result.rows[0];
};

const updateTeamStatus = async (teamId, status) => {
  const isCompleted = String(status).toUpperCase() === 'COMPLETED';
  const sql = `
    UPDATE teams
    SET status = $1,
        completed_at = ${isCompleted ? 'NOW()' : 'NULL'}
    WHERE id = $2
    RETURNING id, team_id, team_name, lead_student_id, project_name, project_description, assigned_by, git_repo, progress, status, completed_at;
  `;
  const result = await query(sql, [String(status).toUpperCase(), teamId]);
  return result.rows[0] || null;
};

const updateTeamRepo = async (teamId, gitRepo) => {
  const sql = `
    UPDATE teams
    SET git_repo = $1
    WHERE id = $2
    RETURNING id, team_id, git_repo, progress, status;
  `;
  const result = await query(sql, [gitRepo, teamId]);
  return result.rows[0] || null;
};

const addTeamMember = async (teamId, studentId) => {
  const checkSql = `SELECT id FROM team_members WHERE team_id = $1 AND student_id = $2;`;
  const checkRes = await query(checkSql, [teamId, studentId]);
  if (checkRes.rows[0]) return checkRes.rows[0];

  const sql = `
    INSERT INTO team_members (team_id, student_id)
    VALUES ($1, $2)
    RETURNING id, team_id, student_id;
  `;
  const result = await query(sql, [teamId, studentId]);
  return result.rows[0];
};

const removeTeamMember = async (teamId, studentId) => {
  const sql = `
    DELETE FROM team_members
    WHERE team_id = $1 AND student_id = $2
    RETURNING id, team_id, student_id;
  `;
  const result = await query(sql, [teamId, studentId]);
  return result.rows[0] || null;
};

const findProjectUpdates = async (teamId) => {
  const sql = `
    SELECT pu.id, pu.student_id, pu.team_id, pu.content, pu.git_repo, pu.student_progress, pu.progress, pu.admin_feedback, pu.reviewed_by, pu.reviewed_at, pu.created_at,
           s.name AS author_name, s.register_number,
           t.project_name, t.team_id AS team_code, t.git_repo AS team_git_repo, t.assigned_by, COALESCE(t.progress, 0) AS team_progress
    FROM project_updates pu
    JOIN students s ON pu.student_id = s.id
    LEFT JOIN teams t ON pu.team_id = t.id
    WHERE pu.team_id = $1
    ORDER BY pu.created_at DESC;
  `;
  const result = await query(sql, [teamId]);
  return result.rows;
};

const findAllProjectUpdates = async () => {
  const sql = `
    SELECT pu.id, pu.student_id, pu.team_id, pu.content, pu.git_repo, pu.student_progress, pu.progress, pu.admin_feedback, pu.reviewed_by, pu.reviewed_at, pu.created_at,
           s.name AS author_name, s.register_number,
           t.project_name, t.team_id AS team_code, t.git_repo AS team_git_repo, t.assigned_by, COALESCE(t.progress, 0) AS team_progress
    FROM project_updates pu
    JOIN students s ON pu.student_id = s.id
    LEFT JOIN teams t ON pu.team_id = t.id
    ORDER BY pu.created_at DESC;
  `;
  const result = await query(sql);
  return result.rows;
};

const getTeamMemberProgresses = async (teamId) => {
  const sql = `
    WITH team_students AS (
      SELECT s.id AS student_id, s.name, s.register_number
      FROM team_members tm
      JOIN students s ON tm.student_id = s.id
      WHERE tm.team_id = $1
      UNION
      SELECT s.id AS student_id, s.name, s.register_number
      FROM teams t
      JOIN students s ON t.lead_student_id = s.id
      WHERE t.id = $1
    ),
    latest_updates AS (
      SELECT DISTINCT ON (pu.student_id)
        pu.student_id,
        pu.student_progress,
        pu.progress AS admin_progress,
        COALESCE(pu.progress, pu.student_progress, 0) AS latest_score
      FROM project_updates pu
      WHERE pu.team_id = $1
      ORDER BY pu.student_id, pu.created_at DESC
    )
    SELECT ts.student_id, ts.name, ts.register_number,
           COALESCE(lu.student_progress, 0) AS student_progress,
           lu.admin_progress,
           COALESCE(lu.latest_score, 0) AS latest_score
    FROM team_students ts
    LEFT JOIN latest_updates lu ON ts.student_id = lu.student_id;
  `;
  const result = await query(sql, [teamId]);
  return result.rows;
};

const createProjectUpdate = async ({ student_id, team_id, content, git_repo, student_progress }) => {
  const parsedStudentProgress = student_progress !== undefined && student_progress !== null && !isNaN(Number(student_progress))
    ? Math.min(100, Math.max(0, Math.round(Number(student_progress))))
    : null;

  const sql = `
    INSERT INTO project_updates (student_id, team_id, content, git_repo, student_progress, created_at)
    VALUES ($1, $2, $3, $4, $5, NOW())
    RETURNING id, student_id, team_id, content, git_repo, student_progress, progress, admin_feedback, created_at;
  `;
  const result = await query(sql, [student_id, team_id, content, git_repo || null, parsedStudentProgress]);
  
  // If git_repo was provided, keep team git_repo synchronized
  if (git_repo && String(git_repo).trim()) {
    await query(`UPDATE teams SET git_repo = $1 WHERE id = $2`, [String(git_repo).trim(), team_id]);
  }

  return result.rows[0];
};

const updateUpdateProgress = async (updateId, { progress, admin_feedback, reviewed_by }) => {
  const sql = `
    UPDATE project_updates
    SET progress = $1,
        admin_feedback = $2,
        reviewed_by = $3,
        reviewed_at = NOW()
    WHERE id = $4
    RETURNING id, student_id, team_id, content, git_repo, student_progress, progress, admin_feedback, reviewed_by, reviewed_at, created_at;
  `;
  const result = await query(sql, [progress, admin_feedback || null, reviewed_by || null, updateId]);
  const updated = result.rows[0];
  
  if (updated && updated.team_id && progress !== undefined && progress !== null) {
    await query(`UPDATE teams SET progress = $1 WHERE id = $2`, [progress, updated.team_id]);
  }
  
  return updated;
};

const updateTeamProgress = async (teamId, progress) => {
  const sql = `
    UPDATE teams
    SET progress = $1
    WHERE id::text = $2::text OR team_id = $2
    RETURNING id, team_id, team_name, project_name, project_description, git_repo, progress, assigned_by;
  `;
  const result = await query(sql, [Number(progress), String(teamId)]);
  return result.rows[0] || null;
};

module.exports = {
  findTeamByStudentId,
  findTeamsByStudentId,
  findTeamMembers,
  findAllTeams,
  findTeamById,
  createTeam,
  updateTeamRepo,
  updateTeamProgress,
  updateTeamStatus,
  addTeamMember,
  removeTeamMember,
  findProjectUpdates,
  findAllProjectUpdates,
  getTeamMemberProgresses,
  createProjectUpdate,
  updateUpdateProgress
};

