const pskillRepository = require("../repositories/pskillRepository");
const studentRepository = require("../repositories/studentRepository");
const { validateAssignPSkill, validateUpdateStudentPSkill } = require("../validators/pskillValidator");

/**
 * Service for P-Skills Management Business Logic
 */

/* ─────────────────────────────────────────────
   P-SKILL CATALOG
───────────────────────────────────────────── */

const getAllPSkills = async () => {
  const pskills = await pskillRepository.findAllPSkills();
  for (const s of pskills) {
    const levels = await pskillRepository.findPSkillLevels(s.id);
    s.levels = levels.map(l => l.level_code);
  }
  return pskills || [];
};

const getPSkillById = async (id) => {
  if (!id) {
    const error = new Error("P-Skill ID is required");
    error.statusCode = 400;
    error.errorCode = "VALIDATION_ERROR";
    throw error;
  }
  const pskill = await pskillRepository.findPSkillById(id);
  if (!pskill) {
    const error = new Error("P-Skill not found");
    error.statusCode = 404;
    error.errorCode = "PSKILL_NOT_FOUND";
    throw error;
  }
  return pskill;
};

/* ─────────────────────────────────────────────
   P-SKILL SLOTS
───────────────────────────────────────────── */

const getAllPSkillSlots = async () => {
  const slots = await pskillRepository.findAllPSkillSlots();
  return slots || [];
};

/* ─────────────────────────────────────────────
   STUDENT P-SKILL ASSIGNMENTS
───────────────────────────────────────────── */

const getStudentPSkills = async (studentId) => {
  if (!studentId) {
    const error = new Error("student_id is required");
    error.statusCode = 400;
    error.errorCode = "VALIDATION_ERROR";
    throw error;
  }

  // Verify student exists
  const student = await studentRepository.findStudentByStudentId(studentId);
  if (!student) {
    const error = new Error("Student not found");
    error.statusCode = 404;
    error.errorCode = "STUDENT_NOT_FOUND";
    throw error;
  }

  const assignments = await pskillRepository.findStudentPSkills(studentId);
  return assignments || [];
};

const assignPSkill = async (assignmentData) => {
  // 1. Validate payload
  const validated = validateAssignPSkill(assignmentData);

  // 2. Verify student exists
  const student = await studentRepository.findStudentByStudentId(validated.student_id);
  if (!student) {
    const error = new Error("Referenced student does not exist");
    error.statusCode = 404;
    error.errorCode = "STUDENT_NOT_FOUND";
    throw error;
  }

  // 3. Verify P-Skill exists
  const pskill = await pskillRepository.findPSkillById(validated.pskill_id);
  if (!pskill) {
    const error = new Error("Referenced P-Skill does not exist");
    error.statusCode = 404;
    error.errorCode = "PSKILL_NOT_FOUND";
    throw error;
  }

  // 4. If slot_id provided, validate slot and check capacity
  if (validated.slot_id) {
    const slot = await pskillRepository.findSlotById(validated.slot_id);
    if (!slot) {
      const error = new Error("Referenced P-Skill slot does not exist");
      error.statusCode = 404;
      error.errorCode = "PSKILL_SLOT_NOT_FOUND";
      throw error;
    }

    // Check slot capacity if the slot has a capacity limit
    if (slot.capacity !== null && slot.capacity !== undefined) {
      const enrolled = await pskillRepository.countSlotEnrollments(validated.slot_id);
      if (enrolled >= slot.capacity) {
        const error = new Error("P-Skill slot is at full capacity");
        error.statusCode = 409;
        error.errorCode = "SLOT_CAPACITY_EXCEEDED";
        throw error;
      }
    }
  }

  // 5. Check for duplicate assignment (same student + same P-Skill level)
  const existingAssignment = await pskillRepository.findStudentPSkillAssignment(
    validated.student_id,
    validated.pskill_id,
    validated.level
  );
  if (existingAssignment) {
    const error = new Error("Student is already assigned to this P-Skill level");
    error.statusCode = 409;
    error.errorCode = "DUPLICATE_PSKILL_ASSIGNMENT";
    throw error;
  }

  // 6. Create assignment in database
  const assignment = await pskillRepository.assignPSkillToStudent(validated);
  return assignment;
};

const updateStudentPSkill = async (id, updateData) => {
  if (!id) {
    const error = new Error("Assignment ID is required");
    error.statusCode = 400;
    error.errorCode = "VALIDATION_ERROR";
    throw error;
  }

  // 1. Verify assignment exists
  const existing = await pskillRepository.findStudentPSkillById(id);
  if (!existing) {
    const error = new Error("P-Skill assignment not found");
    error.statusCode = 404;
    error.errorCode = "PSKILL_ASSIGNMENT_NOT_FOUND";
    throw error;
  }

  // 2. Validate update data
  const validated = validateUpdateStudentPSkill(updateData);

  // 3. If changing slot, validate new slot and capacity
  if (validated.slot_id && validated.slot_id !== existing.slot_id) {
    const slot = await pskillRepository.findSlotById(validated.slot_id);
    if (!slot) {
      const error = new Error("Referenced P-Skill slot does not exist");
      error.statusCode = 404;
      error.errorCode = "PSKILL_SLOT_NOT_FOUND";
      throw error;
    }
    if (slot.capacity !== null && slot.capacity !== undefined) {
      const enrolled = await pskillRepository.countSlotEnrollments(validated.slot_id);
      if (enrolled >= slot.capacity) {
        const error = new Error("P-Skill slot is at full capacity");
        error.statusCode = 409;
        error.errorCode = "SLOT_CAPACITY_EXCEEDED";
        throw error;
      }
    }
  }

  // 4. Update in database
  const updated = await pskillRepository.updateStudentPSkill(id, validated);
  return updated;
};

const removeStudentPSkill = async (id) => {
  if (!id) {
    const error = new Error("Assignment ID is required");
    error.statusCode = 400;
    error.errorCode = "VALIDATION_ERROR";
    throw error;
  }

  // 1. Verify assignment exists
  const existing = await pskillRepository.findStudentPSkillById(id);
  if (!existing) {
    const error = new Error("P-Skill assignment not found");
    error.statusCode = 404;
    error.errorCode = "PSKILL_ASSIGNMENT_NOT_FOUND";
    throw error;
  }

  // 2. Remove from database
  const removed = await pskillRepository.removeStudentPSkill(id);
  return removed;
};

module.exports = {
  getAllPSkills,
  getPSkillById,
  getAllPSkillSlots,
  getStudentPSkills,
  assignPSkill,
  updateStudentPSkill,
  removeStudentPSkill,
};
