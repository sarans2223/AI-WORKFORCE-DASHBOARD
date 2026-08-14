const { query } = require("../db/connection");

/**
 * Repository for PostgreSQL P-Skill related tables:
 *
 *   p_skills
 *   p_skill_slots
 *   p_skill_levels
 *   student_pskills
 *
 * Expected schema:
 *   p_skills
 *     - id
 *     - name
 *     - description
 *     - created_at
 *
 *   p_skill_slots
 *     - id
 *     - slot_name
 *     - start_time
 *     - end_time
 *     - created_at
 *
 *   p_skill_levels
 *     - id
 *     - p_skill_id
 *     - level_code
 *
 *   student_pskills
 *     - id
 *     - student_id
 *     - p_skill_level_id
 *     - completed
 *     - completed_at
 */

/* =========================================================
   P-SKILL CATALOG
========================================================= */

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

/* =========================================================
   P-SKILL SLOTS
========================================================= */

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

const countSlotEnrollments = async (slotId) => {
  // Currently no slot_id relationship is defined
  // in student_pskills based on the provided schema.
  return 0;
};

/* =========================================================
   STUDENT P-SKILL ASSIGNMENTS
========================================================= */

const findStudentPSkills = async (studentId) => {
  const sql = `
    SELECT
      sp.id,
      sp.student_id,
      sp.p_skill_level_id,
      sp.completed,
      sp.completed_at,
      psl.level_code AS level,
      psl.p_skill_id,
      ps.name AS pskill_name,
      ps.description AS pskill_description
    FROM student_pskills sp
    LEFT JOIN p_skill_levels psl
      ON sp.p_skill_level_id = psl.id
    LEFT JOIN p_skills ps
      ON psl.p_skill_id = ps.id
    WHERE
      sp.student_id = $1
      OR sp.student_id IN (
        SELECT id
        FROM students
        WHERE register_number = $1::text
      )
    ORDER BY sp.completed_at DESC NULLS LAST;
  `;

  const result = await query(sql, [studentId]);
  return result.rows;
};

const findStudentPSkillAssignment = async (studentId, pskillId) => {
  const sql = `
    SELECT
      sp.id,
      sp.student_id,
      sp.p_skill_level_id,
      sp.completed,
      sp.completed_at
    FROM student_pskills sp
    JOIN p_skill_levels psl
      ON sp.p_skill_level_id = psl.id
    WHERE
      (
        sp.student_id = $1
        OR sp.student_id IN (
          SELECT id
          FROM students
          WHERE register_number = $1::text
        )
      )
      AND psl.p_skill_id = $2
    LIMIT 1;
  `;

  const result = await query(sql, [studentId, pskillId]);
  return result.rows[0] || null;
};

const findStudentPSkillById = async (id) => {
  const sql = `
    SELECT
      sp.id,
      sp.student_id,
      sp.p_skill_level_id,
      sp.completed,
      sp.completed_at,
      psl.level_code AS level,
      psl.p_skill_id,
      ps.name AS pskill_name,
      ps.description AS pskill_description
    FROM student_pskills sp
    LEFT JOIN p_skill_levels psl
      ON sp.p_skill_level_id = psl.id
    LEFT JOIN p_skills ps
      ON psl.p_skill_id = ps.id
    WHERE sp.id = $1
    LIMIT 1;
  `;

  const result = await query(sql, [id]);
  return result.rows[0] || null;
};

/* =========================================================
   P-SKILL LEVEL
========================================================= */

const getOrCreateSkillLevel = async (
  pskill_id,
  levelCode = "BEGINNER"
) => {
  const selectSql = `
    SELECT id
    FROM p_skill_levels
    WHERE
      p_skill_id = $1
      AND UPPER(level_code) = UPPER($2)
    LIMIT 1;
  `;

  const selectRes = await query(selectSql, [
    pskill_id,
    levelCode,
  ]);

  if (selectRes.rows[0]) {
    return selectRes.rows[0].id;
  }

  const insertSql = `
    INSERT INTO p_skill_levels (
      p_skill_id,
      level_code
    )
    VALUES ($1, $2)
    RETURNING id;
  `;

  const insertRes = await query(insertSql, [
    pskill_id,
    levelCode.toUpperCase(),
  ]);

  return insertRes.rows[0].id;
};

/* =========================================================
   ASSIGN P-SKILL TO STUDENT
========================================================= */

const assignPSkillToStudent = async ({
  student_id,
  pskill_id,
  level,
  status,
}) => {
  // Resolve register_number to numeric student ID
  let numericStudentId = student_id;

  if (isNaN(Number(student_id))) {
    const studentResult = await query(
      `
        SELECT id
        FROM students
        WHERE register_number = $1
        LIMIT 1;
      `,
      [student_id]
    );

    if (studentResult.rows[0]) {
      numericStudentId = studentResult.rows[0].id;
    }
  }

  // Get or create P-Skill level
  const levelId = await getOrCreateSkillLevel(
    pskill_id,
    level || "BEGINNER"
  );

  const isCompleted = status === "COMPLETED";

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
      ${isCompleted ? "NOW()" : "NULL"}
    )
    RETURNING
      id,
      student_id,
      p_skill_level_id,
      completed,
      completed_at;
  `;

  const values = [
    numericStudentId,
    levelId,
    isCompleted,
  ];

  const result = await query(sql, values);

  return result.rows[0];
};

/* =========================================================
   UPDATE STUDENT P-SKILL
========================================================= */

const updateStudentPSkill = async (id, fields) => {
  const isCompleted = fields.status === "COMPLETED";

  const sql = `
    UPDATE student_pskills
    SET
      completed = COALESCE($1, completed),
      completed_at = CASE
        WHEN $1 = true
          THEN COALESCE(completed_at, NOW())
        ELSE completed_at
      END
    WHERE id = $2
    RETURNING
      id,
      student_id,
      p_skill_level_id,
      completed,
      completed_at;
  `;

  const values = [
    fields.status !== undefined ? isCompleted : null,
    id,
  ];

  const result = await query(sql, values);

  return result.rows[0];
};

/* =========================================================
   REMOVE STUDENT P-SKILL
========================================================= */

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

  return result.rows[0];
};

/* =========================================================
   EXPORTS
========================================================= */

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