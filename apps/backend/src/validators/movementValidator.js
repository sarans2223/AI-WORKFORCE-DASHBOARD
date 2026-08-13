/**
 * Validator for Movement Pass Management API requests
 */

const ALLOWED_PASS_TYPES = ["CAMPUS_LEAVE", "LAB_ACCESS", "OUTSTATION", "OTHER"];
const ALLOWED_PASS_STATUSES = ["PENDING", "APPROVED", "REJECTED", "CANCELLED", "EXPIRED"];

const validateCreateMovementPass = (data) => {
  if (!data || typeof data !== "object") {
    const error = new Error("Invalid request body");
    error.statusCode = 400;
    error.errorCode = "VALIDATION_ERROR";
    throw error;
  }

  const errors = [];

  // 1. student_id
  if (!data.student_id || typeof data.student_id !== "string" || !data.student_id.trim()) {
    errors.push("student_id is required");
  }

  // 2. purpose / reason
  const purpose = data.purpose || data.reason;
  if (!purpose || typeof purpose !== "string" || !purpose.trim()) {
    errors.push("purpose or reason is required");
  }

  // 3. out_time (or start_time)
  const out_time = data.out_time || data.start_time;
  if (!out_time || typeof out_time !== "string" || !out_time.trim()) {
    errors.push("out_time (or start_time) is required");
  }

  // 4. in_time (or end_time / expected_return_time)
  const in_time = data.in_time || data.expected_return_time || data.end_time;
  if (!in_time || typeof in_time !== "string" || !in_time.trim()) {
    errors.push("in_time (or expected_return_time / end_time) is required");
  }

  // 5. Check out_time < in_time
  if (out_time && in_time) {
    const outDate = new Date(out_time.trim());
    const inDate = new Date(in_time.trim());
    if (!isNaN(outDate.getTime()) && !isNaN(inDate.getTime())) {
      if (outDate >= inDate) {
        errors.push("out_time must be earlier than in_time");
      }
    }
  }

  // 6. pass_type (optional, default CAMPUS_LEAVE)
  let pass_type = "CAMPUS_LEAVE";
  if (data.pass_type || data.type) {
    const rawType = String(data.pass_type || data.type).trim().toUpperCase();
    if (!ALLOWED_PASS_TYPES.includes(rawType)) {
      errors.push(`pass_type must be one of: ${ALLOWED_PASS_TYPES.join(", ")}`);
    } else {
      pass_type = rawType;
    }
  }

  // 7. destination (optional)
  const destination = data.destination ? String(data.destination).trim() : null;

  if (errors.length > 0) {
    const error = new Error(errors.join(", "));
    error.statusCode = 400;
    error.errorCode = "VALIDATION_ERROR";
    throw error;
  }

  return {
    student_id: data.student_id.trim(),
    purpose: String(purpose).trim(),
    out_time: String(out_time).trim(),
    in_time: String(in_time).trim(),
    pass_type,
    destination,
    status: "PENDING",
  };
};

const validateUpdateMovementPass = (data) => {
  if (!data || typeof data !== "object") {
    const error = new Error("Invalid request body");
    error.statusCode = 400;
    error.errorCode = "VALIDATION_ERROR";
    throw error;
  }

  const sanitized = {};
  const errors = [];

  const purpose = data.purpose || data.reason;
  if (purpose !== undefined) {
    if (typeof purpose !== "string" || !purpose.trim()) {
      errors.push("purpose/reason cannot be empty");
    } else {
      sanitized.purpose = purpose.trim();
    }
  }

  const out_time = data.out_time || data.start_time;
  if (out_time !== undefined) {
    sanitized.out_time = String(out_time).trim();
  }

  const in_time = data.in_time || data.expected_return_time || data.end_time;
  if (in_time !== undefined) {
    sanitized.in_time = String(in_time).trim();
  }

  if (data.pass_type !== undefined || data.type !== undefined) {
    const rawType = String(data.pass_type || data.type).trim().toUpperCase();
    if (!ALLOWED_PASS_TYPES.includes(rawType)) {
      errors.push(`pass_type must be one of: ${ALLOWED_PASS_TYPES.join(", ")}`);
    } else {
      sanitized.pass_type = rawType;
    }
  }

  if (data.destination !== undefined) {
    sanitized.destination = data.destination ? String(data.destination).trim() : null;
  }

  if (data.status !== undefined) {
    const upperStatus = String(data.status).trim().toUpperCase();
    if (!ALLOWED_PASS_STATUSES.includes(upperStatus)) {
      errors.push(`status must be one of: ${ALLOWED_PASS_STATUSES.join(", ")}`);
    } else {
      sanitized.status = upperStatus;
    }
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
  ALLOWED_PASS_TYPES,
  ALLOWED_PASS_STATUSES,
  validateCreateMovementPass,
  validateUpdateMovementPass,
};
