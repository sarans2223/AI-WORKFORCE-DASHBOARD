/**
 * Validator for P-Skills Management API requests
 *
 * IMPORTANT:
 * P-Skill levels are NOT hard-coded here.
 * The actual valid level_code is validated against
 * the p_skill_levels table in the repository/service layer.
 */

const ALLOWED_PSKILL_COMPLETION_STATUSES = [
  "NOT_STARTED",
  "IN_PROGRESS",
  "COMPLETED",
];

/**
 * Validate assignment request.
 *
 * Level is intentionally accepted as a string because the database
 * contains values such as:
 *   1, 2, 3
 *   1A, 1B, 1C
 *   3A, 3B
 *   etc.
 *
 * The actual pskill_id + level combination must be checked
 * against PostgreSQL p_skill_levels before insertion.
 */
const validateAssignPSkill = (data) => {
  if (!data || typeof data !== "object") {
    const error = new Error("Invalid request body");
    error.statusCode = 400;
    error.errorCode = "VALIDATION_ERROR";
    throw error;
  }

  const errors = [];

  // student_id
  if (
    data.student_id === undefined ||
    data.student_id === null ||
    String(data.student_id).trim() === ""
  ) {
    errors.push("student_id is required");
  }

  // pskill_id
  if (
    data.pskill_id === undefined ||
    data.pskill_id === null ||
    String(data.pskill_id).trim() === ""
  ) {
    errors.push("pskill_id is required");
  }

  // Optional slot_id
  let slot_id = null;

  if (data.slot_id !== undefined && data.slot_id !== null) {
    if (String(data.slot_id).trim() === "") {
      errors.push("slot_id must be a valid ID");
    } else {
      slot_id = String(data.slot_id).trim();
    }
  }

  // Level
  //
  // Do NOT restrict this to BEGINNER/INTERMEDIATE/etc.
  // Actual validation happens against p_skill_levels.
  let level = null;

  if (data.level !== undefined && data.level !== null) {
    level = String(data.level).trim();

    if (!level) {
      errors.push("level cannot be empty");
    }
  }

  // Status
  let status = "NOT_STARTED";

  if (data.status !== undefined && data.status !== null) {
    const upperStatus = String(data.status).trim().toUpperCase();

    if (!ALLOWED_PSKILL_COMPLETION_STATUSES.includes(upperStatus)) {
      errors.push(
        `status must be one of: ${ALLOWED_PSKILL_COMPLETION_STATUSES.join(
          ", "
        )}`
      );
    } else {
      status = upperStatus;
    }
  }

  if (errors.length > 0) {
    const error = new Error(errors.join(", "));
    error.statusCode = 400;
    error.errorCode = "VALIDATION_ERROR";
    throw error;
  }

  return {
    student_id: String(data.student_id).trim(),
    pskill_id: String(data.pskill_id).trim(),
    slot_id,
    level,
    status,
  };
};

/**
 * Validate update request.
 *
 * Level is accepted as a string and must later be verified
 * against the corresponding P-Skill's available levels.
 */
const validateUpdateStudentPSkill = (data) => {
  if (!data || typeof data !== "object") {
    const error = new Error("Invalid request body");
    error.statusCode = 400;
    error.errorCode = "VALIDATION_ERROR";
    throw error;
  }

  const sanitized = {};
  const errors = [];

  // Optional level
  if (data.level !== undefined && data.level !== null) {
    const level = String(data.level).trim();

    if (!level) {
      errors.push("level cannot be empty");
    } else {
      sanitized.level = level;
    }
  }

  // Optional status
  if (data.status !== undefined && data.status !== null) {
    const upperStatus = String(data.status).trim().toUpperCase();

    if (!ALLOWED_PSKILL_COMPLETION_STATUSES.includes(upperStatus)) {
      errors.push(
        `status must be one of: ${ALLOWED_PSKILL_COMPLETION_STATUSES.join(
          ", "
        )}`
      );
    } else {
      sanitized.status = upperStatus;
    }
  }

  // Optional slot_id
  if (data.slot_id !== undefined) {
    sanitized.slot_id =
      data.slot_id !== null ? String(data.slot_id).trim() : null;
  }

  if (errors.length > 0) {
    const error = new Error(errors.join(", "));
    error.statusCode = 400;
    error.errorCode = "VALIDATION_ERROR";
    throw error;
  }

  return sanitized;
};

module.exports = {
  ALLOWED_PSKILL_COMPLETION_STATUSES,
  validateAssignPSkill,
  validateUpdateStudentPSkill,
};
