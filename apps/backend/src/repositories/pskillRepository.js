const { query } = require("../db/connection");

/**
 * P-SKILL REPOSITORY
 *
 * ACTUAL DATABASE SCHEMA
 *
 * p_skills
 *   id
 *   name
 *   description
 *   created_at
 *
 * p_skill_levels
 *   id
 *   p_skill_id
 *   level_code
 *
 * student_pskills
 *   id
 *   student_id
 *   p_skill_level_id
 *   completed
 *   completed_at
 *
 * p_skill_slots
 *   id
 *   slot_name
 *   start_time
 *   end_time
 *   created_at
 */


/* ============================================================
   P-SKILL CATALOG
   ============================================================ */

/**
 * Get all P-Skills
 */
const findAllPSkills = async () => {
  const sql = `
    SELECT
      id,
      name,
      description,
      created_at
    FROM p_skills
    ORDER BY name ASC;
  `;

  const result = await query(sql);

  return result.rows;
};


/**
 * Get one P-Skill by ID
 */
const findPSkillById = async (id) => {
  const sql = `
    SELECT
      id,
      name,
      description,
      created_at
    FROM p_skills
    WHERE id = $1
    LIMIT 1;
  `;

  const result = await query(sql, [id]);

  return result.rows[0] || null;
};


/* ============================================================
   P-SKILL LEVELS
   ============================================================ */

/**
 * Get all levels for a particular P-Skill
 *
 * Example:
 * p_skill_id = 1
 *
 * Returns:
 * BASIC
 * INTERMEDIATE
 * ADVANCED
 */
const findPSkillLevels = async (pskillId) => {
  const sql = `
    SELECT
      id,
      p_skill_id,
      level_code
    FROM p_skill_levels
    WHERE p_skill_id = $1
    ORDER BY id ASC;
  `;

  const result = await query(sql, [pskillId]);

  return result.rows;
};


/**
 * Get one P-Skill level
 */
const findPSkillLevelById = async (levelId) => {
  const sql = `
    SELECT
      id,
      p_skill_id,
      level_code
    FROM p_skill_levels
    WHERE id = $1
    LIMIT 1;
  `;

  const result = await query(sql, [levelId]);

  return result.rows[0] || null;
};


/* ============================================================
   P-SKILL SLOTS
   ============================================================ */

/**
 * Get all P-Skill slots
 *
 * Actual table does NOT contain:
 *   pskill_id
 *   capacity
 *   updated_at
 */
const findAllPSkillSlots = async () => {
  const sql = `
    SELECT
      id,
      slot_name,
      start_time,
      end_time,
      created_at
    FROM p_skill_slots
    ORDER BY start_time ASC;
  `;

  const result = await query(sql);

  return result.rows;
};


/**
 * Get a slot by ID
 */
const findSlotById = async (slotId) => {
  const sql = `
    SELECT
      id,
      slot_name,
      start_time,
      end_time,
      created_at
    FROM p_skill_slots
    WHERE id = $1
    LIMIT 1;
  `;

  const result = await query(sql, [slotId]);

  return result.rows[0] || null;
};


/* ============================================================
   STUDENT P-SKILLS
   ============================================================ */

/**
 * Get all P-Skills assigned to a student.
 *
 * Relationship:
 *
 * student_pskills
 *       |
 *       | p_skill_level_id
 *       v
 * p_skill_levels
 *       |
 *       | p_skill_id
 *       v
 * p_skills
 */
const findStudentPSkills = async (studentId) => {
  const sql = `
    SELECT
      sp.id,
      sp.student_id,

      sp.p_skill_level_id,

      pl.p_skill_id,
      pl.level_code,

      sp.completed,
      sp.completed_at,

      p.name AS pskill_name,
      p.description AS pskill_description

    FROM student_pskills sp

    LEFT JOIN p_skill_levels pl
      ON sp.p_skill_level_id = pl.id

    LEFT JOIN p_skills p
      ON pl.p_skill_id = p.id

    WHERE sp.student_id = $1

    ORDER BY
      sp.id DESC;
  `;

  const result = await query(sql, [studentId]);

  return result.rows;
};


/**
 * Find whether a student already has
 * a particular P-Skill.
 *
 * Since student_pskills stores p_skill_level_id,
 * we join through p_skill_levels.
 */
const findStudentPSkillAssignment = async (
  studentId,
  pskillId,
  levelCode = null
) => {
  let sql = `
    SELECT
      sp.id,
      sp.student_id,
      sp.p_skill_level_id,
      pl.p_skill_id,
      pl.level_code,
      sp.completed,
      sp.completed_at
    FROM student_pskills sp
    LEFT JOIN p_skill_levels pl
      ON sp.p_skill_level_id = pl.id
    WHERE sp.student_id = $1
      AND pl.p_skill_id = $2
  `;
  const params = [studentId, pskillId];
  if (levelCode !== null) {
    sql += ` AND pl.level_code = $3`;
    params.push(levelCode);
  }
  sql += ` LIMIT 1;`;
  const result = await query(sql, params);
  return result.rows[0] || null;
};


/**
 * Get a student's P-Skill assignment by assignment ID
 */
const findStudentPSkillById = async (id) => {
  const sql = `
    SELECT
      sp.id,
      sp.student_id,

      sp.p_skill_level_id,

      pl.p_skill_id,
      pl.level_code,

      sp.completed,
      sp.completed_at,

      p.name AS pskill_name,
      p.description AS pskill_description

    FROM student_pskills sp

    LEFT JOIN p_skill_levels pl
      ON sp.p_skill_level_id = pl.id

    LEFT JOIN p_skills p
      ON pl.p_skill_id = p.id

    WHERE sp.id = $1

    LIMIT 1;
  `;

  const result = await query(sql, [id]);

  return result.rows[0] || null;
};


/* ============================================================
   ASSIGN P-SKILL TO STUDENT
   ============================================================ */

/**
 * Assign a P-Skill to a student.
 *
 * IMPORTANT:
 * student_pskills does NOT store pskill_id directly.
 *
 * It stores:
 *
 * p_skill_level_id
 *
 * Therefore we first find the level record using:
 *
 * p_skill_id + level_code
 */
const assignPSkillToStudent = async ({
  student_id,
  pskill_id,
  level,
  status,
  completed
}) => {

  /*
   * Find the corresponding P-Skill level.
   *
   * Example:
   *
   * pskill_id = 1
   * level = "BEGINNER"
   *
   * finds:
   *
   * p_skill_levels
   * id | p_skill_id | level_code
   *  1 |     1      | BEGINNER
   */

  const levelSql = `
    SELECT
      id,
      p_skill_id,
      level_code
    FROM p_skill_levels
    WHERE p_skill_id = $1
      AND level_code = $2
    LIMIT 1;
  `;

  const levelResult = await query(levelSql, [
    pskill_id,
    level
  ]);

  if (levelResult.rows.length === 0) {
    throw new Error(
      `P-Skill level not found for p_skill_id=${pskill_id}, level=${level}`
    );
  }

  const pSkillLevelId = levelResult.rows[0].id;

  /*
   * Convert status into boolean completed.
   */
  let isCompleted = false;

  if (completed !== undefined) {
    isCompleted = Boolean(completed);
  } else if (status) {
    isCompleted =
      status.toUpperCase() === "COMPLETED";
  }

  const sql = `
    INSERT INTO student_pskills (
      student_id,
      p_skill_level_id,
      completed,
      completed_at
    )
    VALUES (
      $1,
      $2,
      $3,
      CASE
        WHEN $3 = TRUE THEN NOW()
        ELSE NULL
      END
    )
    RETURNING
      id,
      student_id,
      p_skill_level_id,
      completed,
      completed_at;
  `;

  const result = await query(sql, [
    student_id,
    pSkillLevelId,
    isCompleted
  ]);

  return result.rows[0];
};


/* ============================================================
   UPDATE STUDENT P-SKILL
   ============================================================ */

/**
 * Update a student's P-Skill assignment.
 *
 * Supported:
 *   level
 *   status
 *   completed
 */
const updateStudentPSkill = async (id, fields) => {

  let completedValue = null;

  if (fields.completed !== undefined) {
    completedValue = Boolean(fields.completed);
  } else if (fields.status) {
    completedValue =
      fields.status.toUpperCase() === "COMPLETED";
  }

  /*
   * If level is being changed, find the new
   * p_skill_level_id.
   */
  let pSkillLevelId = null;

  if (
    fields.pskill_id !== undefined &&
    fields.level !== undefined
  ) {

    const levelSql = `
      SELECT id
      FROM p_skill_levels
      WHERE p_skill_id = $1
        AND level_code = $2
      LIMIT 1;
    `;

    const levelResult = await query(levelSql, [
      fields.pskill_id,
      fields.level
    ]);

    if (levelResult.rows.length === 0) {
      throw new Error(
        `P-Skill level not found for p_skill_id=${fields.pskill_id}, level=${fields.level}`
      );
    }

    pSkillLevelId = levelResult.rows[0].id;
  }

  /*
   * Update only the fields that are supplied.
   */
  const sql = `
    UPDATE student_pskills

    SET
      p_skill_level_id =
        COALESCE($1, p_skill_level_id),

      completed =
        COALESCE($2, completed),

      completed_at =
        CASE
          WHEN $2 = TRUE
            THEN COALESCE(completed_at, NOW())

          WHEN $2 = FALSE
            THEN NULL

          ELSE completed_at
        END

    WHERE id = $3

    RETURNING
      id,
      student_id,
      p_skill_level_id,
      completed,
      completed_at;
  `;

  const result = await query(sql, [
    pSkillLevelId,
    completedValue,
    id
  ]);

  return result.rows[0] || null;
};


/* ============================================================
   REMOVE STUDENT P-SKILL
   ============================================================ */

const removeStudentPSkill = async (id) => {

  const sql = `
    DELETE FROM student_pskills

    WHERE id = $1

    RETURNING
      id,
      student_id,
      p_skill_level_id,
      completed,
      completed_at;
  `;

  const result = await query(sql, [id]);

  return result.rows[0] || null;
};


/* ============================================================
   EXPORTS
   ============================================================ */

module.exports = {

  // P-Skill catalog
  findAllPSkills,
  findPSkillById,

  // P-Skill levels
  findPSkillLevels,
  findPSkillLevelById,

  // Slots
  findAllPSkillSlots,
  findSlotById,

  // Student assignments
  findStudentPSkills,
  findStudentPSkillAssignment,
  findStudentPSkillById,

  // Assignment operations
  assignPSkillToStudent,
  updateStudentPSkill,
  removeStudentPSkill
};