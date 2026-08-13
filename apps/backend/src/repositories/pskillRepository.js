const { query } = require("../db/connection");

/**
 * Repository for PostgreSQL P-Skills table queries.
 *
 * Tables assumed (based on project migration file names):
 *   pskills            - catalog of all available P-Skills
 *   student_pskills    - student enrollment/assignment records
 *   pskill_slots       - predefined time slots for P-Skills
 */

/* ─────────────────────────────────────────────
   P-SKILL CATALOG
───────────────────────────────────────────── */

const findAllPSkills = async () => {
  const sql = `
    SELECT id, name, description, category, created_at, updated_at
    FROM pskills
    ORDER BY name ASC;
  `;
  const result = await query(sql);
  return result.rows;
};

const findPSkillById = async (id) => {
  const sql = `
    SELECT id, name, description, category, created_at, updated_at
    FROM pskills
    WHERE id = $1
    LIMIT 1;
  `;
  const result = await query(sql, [id]);
  return result.rows[0] || null;
};

/* ─────────────────────────────────────────────
   P-SKILL SLOTS
───────────────────────────────────────────── */

const findAllPSkillSlots = async () => {
  const sql = `
    SELECT id, pskill_id, slot_name, start_time, end_time, capacity, created_at, updated_at
    FROM pskill_slots
    ORDER BY start_time ASC;
  `;
  const result = await query(sql);
  return result.rows;
};

const findSlotById = async (slotId) => {
  const sql = `
    SELECT id, pskill_id, slot_name, start_time, end_time, capacity, created_at, updated_at
    FROM pskill_slots
    WHERE id = $1
    LIMIT 1;
  `;
  const result = await query(sql, [slotId]);
  return result.rows[0] || null;
};

const countSlotEnrollments = async (slotId) => {
  const sql = `
    SELECT COUNT(*) AS enrolled
    FROM student_pskills
    WHERE slot_id = $1;
  `;
  const result = await query(sql, [slotId]);
  return parseInt(result.rows[0]?.enrolled || 0, 10);
};

/* ─────────────────────────────────────────────
   STUDENT P-SKILL ASSIGNMENTS
───────────────────────────────────────────── */

const findStudentPSkills = async (studentId) => {
  const sql = `
    SELECT sp.id, sp.student_id, sp.pskill_id, sp.slot_id, sp.level, sp.status,
           sp.completed_at, sp.created_at, sp.updated_at,
           p.name AS pskill_name, p.description AS pskill_description, p.category,
           s.slot_name, s.start_time, s.end_time
    FROM student_pskills sp
    LEFT JOIN pskills p ON sp.pskill_id = p.id
    LEFT JOIN pskill_slots s ON sp.slot_id = s.id
    WHERE sp.student_id = $1
    ORDER BY sp.created_at DESC;
  `;
  const result = await query(sql, [studentId]);
  return result.rows;
};

const findStudentPSkillAssignment = async (studentId, pskillId) => {
  const sql = `
    SELECT id, student_id, pskill_id, slot_id, level, status, completed_at, created_at, updated_at
    FROM student_pskills
    WHERE student_id = $1 AND pskill_id = $2
    LIMIT 1;
  `;
  const result = await query(sql, [studentId, pskillId]);
  return result.rows[0] || null;
};

const findStudentPSkillById = async (id) => {
  const sql = `
    SELECT sp.id, sp.student_id, sp.pskill_id, sp.slot_id, sp.level, sp.status,
           sp.completed_at, sp.created_at, sp.updated_at,
           p.name AS pskill_name, p.description AS pskill_description, p.category,
           s.slot_name, s.start_time, s.end_time
    FROM student_pskills sp
    LEFT JOIN pskills p ON sp.pskill_id = p.id
    LEFT JOIN pskill_slots s ON sp.slot_id = s.id
    WHERE sp.id = $1
    LIMIT 1;
  `;
  const result = await query(sql, [id]);
  return result.rows[0] || null;
};

const assignPSkillToStudent = async ({ student_id, pskill_id, slot_id, level, status }) => {
  const sql = `
    INSERT INTO student_pskills (student_id, pskill_id, slot_id, level, status, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
    RETURNING id, student_id, pskill_id, slot_id, level, status, completed_at, created_at, updated_at;
  `;
  const values = [student_id, pskill_id, slot_id || null, level, status || "NOT_STARTED"];
  const result = await query(sql, values);
  return result.rows[0];
};

const updateStudentPSkill = async (id, fields) => {
  // Build completed_at logic: set when status becomes COMPLETED
  let completedAtSql = "completed_at";
  if (fields.status === "COMPLETED") {
    completedAtSql = "COALESCE(completed_at, NOW())";
  }

  const sql = `
    UPDATE student_pskills
    SET level = COALESCE($1, level),
        status = COALESCE($2, status),
        slot_id = COALESCE($3, slot_id),
        completed_at = ${completedAtSql},
        updated_at = NOW()
    WHERE id = $4
    RETURNING id, student_id, pskill_id, slot_id, level, status, completed_at, created_at, updated_at;
  `;
  const values = [
    fields.level || null,
    fields.status || null,
    fields.slot_id !== undefined ? fields.slot_id : null,
    id,
  ];
  const result = await query(sql, values);
  return result.rows[0];
};

const removeStudentPSkill = async (id) => {
  const sql = `
    DELETE FROM student_pskills
    WHERE id = $1
    RETURNING id, student_id, pskill_id, slot_id, level, status, completed_at, created_at, updated_at;
  `;
  const result = await query(sql, [id]);
  return result.rows[0];
};

module.exports = {
  findAllPSkills,
  findPSkillById,
  findAllPSkillSlots,
  findSlotById,
  countSlotEnrollments,
  findStudentPSkills,
  findStudentPSkillAssignment,
  findStudentPSkillById,
  assignPSkillToStudent,
  updateStudentPSkill,
  removeStudentPSkill,
};
