/**
 * Validator for Leave Management API requests
 */

const ALLOWED_LEAVE_STATUSES = ["PENDING", "APPROVED", "REJECTED", "CANCELLED"];
const ALLOWED_LEAVE_TYPES = ["SICK", "PERSONAL", "ACADEMIC", "EMERGENCY", "OTHER"];

const validateCreateLeave = (data) => {
  if (!data || typeof data !== "object") {
    const error = new Error("Invalid request body");
    error.statusCode = 400;
    error.errorCode = "VALIDATION_ERROR";
    throw error;
  }

  const errors = [];

  // 1. Student ID
  if (!data.student_id || typeof data.student_id !== "string" || !data.student_id.trim()) {
    errors.push("student_id is required");
  }

  // 2. Reason
  if (!data.reason || typeof data.reason !== "string" || !data.reason.trim()) {
    errors.push("reason is required");
  }

  // 3. Start date — required
  if (!data.start_date || typeof data.start_date !== "string" || !data.start_date.trim()) {
    errors.push("start_date is required");
  } else {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(data.start_date.trim())) {
      errors.push("start_date must be in YYYY-MM-DD format");
    }
  }

  // 4. End date — required
  if (!data.end_date || typeof data.end_date !== "string" || !data.end_date.trim()) {
    errors.push("end_date is required");
  } else {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(data.end_date.trim())) {
      errors.push("end_date must be in YYYY-MM-DD format");
    }
  }

  // 5. start_date must not be after end_date
  if (
    data.start_date &&
    data.end_date &&
    /^\d{4}-\d{2}-\d{2}$/.test(data.start_date.trim()) &&
    /^\d{4}-\d{2}-\d{2}$/.test(data.end_date.trim())
  ) {
    if (new Date(data.start_date.trim()) > new Date(data.end_date.trim())) {
      errors.push("start_date cannot be after end_date");
    }
  }

  // 6. Leave type (optional, defaults to OTHER)
  let leave_type = "OTHER";
  if (data.leave_type) {
    const upperType = String(data.leave_type).trim().toUpperCase();
    if (!ALLOWED_LEAVE_TYPES.includes(upperType)) {
      errors.push(`leave_type must be one of: ${ALLOWED_LEAVE_TYPES.join(", ")}`);
    } else {
      leave_type = upperType;
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
    reason: data.reason.trim(),
    start_date: data.start_date.trim(),
    end_date: data.end_date.trim(),
    leave_type,
    status: "PENDING",
  };
};

const validateUpdateLeave = (data) => {
  if (!data || typeof data !== "object") {
    const error = new Error("Invalid request body");
    error.statusCode = 400;
    error.errorCode = "VALIDATION_ERROR";
    throw error;
  }

  const sanitized = {};
  const errors = [];

  if (data.reason !== undefined) {
    if (typeof data.reason !== "string" || !data.reason.trim()) {
      errors.push("reason cannot be empty");
    } else {
      sanitized.reason = data.reason.trim();
    }
  }

  if (data.start_date !== undefined) {
    if (typeof data.start_date !== "string") {
      errors.push("start_date must be a string");
    } else {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(data.start_date.trim())) {
        errors.push("start_date must be in YYYY-MM-DD format");
      } else {
        sanitized.start_date = data.start_date.trim();
      }
    }
  }

  if (data.end_date !== undefined) {
    if (typeof data.end_date !== "string") {
      errors.push("end_date must be a string");
    } else {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(data.end_date.trim())) {
        errors.push("end_date must be in YYYY-MM-DD format");
      } else {
        sanitized.end_date = data.end_date.trim();
      }
    }
  }

  if (data.leave_type !== undefined) {
    const upperType = String(data.leave_type).trim().toUpperCase();
    if (!ALLOWED_LEAVE_TYPES.includes(upperType)) {
      errors.push(`leave_type must be one of: ${ALLOWED_LEAVE_TYPES.join(", ")}`);
    } else {
      sanitized.leave_type = upperType;
    }
  }

  // Validate date range if both are present in this update
  const start = sanitized.start_date || null;
  const end = sanitized.end_date || null;
  if (start && end && new Date(start) > new Date(end)) {
    errors.push("start_date cannot be after end_date");
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
  ALLOWED_LEAVE_STATUSES,
  ALLOWED_LEAVE_TYPES,
  validateCreateLeave,
  validateUpdateLeave,
};
