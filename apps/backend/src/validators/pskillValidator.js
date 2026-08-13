/**
 * Validator for P-Skills Management API requests
 */

const ALLOWED_PSKILL_LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"];
const ALLOWED_PSKILL_COMPLETION_STATUSES = ["NOT_STARTED", "IN_PROGRESS", "COMPLETED"];

const validateAssignPSkill = (data) => {
  if (!data || typeof data !== "object") {
    const error = new Error("Invalid request body");
    error.statusCode = 400;
    error.errorCode = "VALIDATION_ERROR";
    throw error;
  }

  const errors = [];

  if (!data.student_id || typeof data.student_id !== "string" || !data.student_id.trim()) {
    errors.push("student_id is required");
  }

  if (!data.pskill_id || (typeof data.pskill_id !== "string" && typeof data.pskill_id !== "number")) {
    errors.push("pskill_id is required");
  }

  // Optional slot assignment
  let slot_id = null;
  if (data.slot_id !== undefined && data.slot_id !== null) {
    if (typeof data.slot_id !== "string" && typeof data.slot_id !== "number") {
      errors.push("slot_id must be a valid ID");
    } else {
      slot_id = String(data.slot_id).trim();
    }
  }

  // Optional level
  let level = "BEGINNER";
  if (data.level) {
    const upperLevel = String(data.level).trim().toUpperCase();
    if (!ALLOWED_PSKILL_LEVELS.includes(upperLevel)) {
      errors.push(`level must be one of: ${ALLOWED_PSKILL_LEVELS.join(", ")}`);
    } else {
      level = upperLevel;
    }
  }

  if (errors.length > 0) {
    const error = new Error(errors.join(", "));
    error.statusCode = 400;
    error.errorCode = "VALIDATION_ERROR";
    throw error;
  }

  return {
    student_id: data.student_id.trim(),
    pskill_id: String(data.pskill_id).trim(),
    slot_id,
    level,
    status: "NOT_STARTED",
  };
};

const validateUpdateStudentPSkill = (data) => {
  if (!data || typeof data !== "object") {
    const error = new Error("Invalid request body");
    error.statusCode = 400;
    error.errorCode = "VALIDATION_ERROR";
    throw error;
  }

  const sanitized = {};
  const errors = [];

  if (data.level !== undefined) {
    const upperLevel = String(data.level).trim().toUpperCase();
    if (!ALLOWED_PSKILL_LEVELS.includes(upperLevel)) {
      errors.push(`level must be one of: ${ALLOWED_PSKILL_LEVELS.join(", ")}`);
    } else {
      sanitized.level = upperLevel;
    }
  }

  if (data.status !== undefined) {
    const upperStatus = String(data.status).trim().toUpperCase();
    if (!ALLOWED_PSKILL_COMPLETION_STATUSES.includes(upperStatus)) {
      errors.push(`status must be one of: ${ALLOWED_PSKILL_COMPLETION_STATUSES.join(", ")}`);
    } else {
      sanitized.status = upperStatus;
    }
  }

  if (data.slot_id !== undefined) {
    sanitized.slot_id = data.slot_id !== null ? String(data.slot_id).trim() : null;
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
  ALLOWED_PSKILL_LEVELS,
  ALLOWED_PSKILL_COMPLETION_STATUSES,
  validateAssignPSkill,
  validateUpdateStudentPSkill,
};
