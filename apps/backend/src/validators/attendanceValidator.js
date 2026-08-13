/**
 * Validator for Attendance Management API requests
 */

const ALLOWED_ATTENDANCE_STATUSES = ["PRESENT", "ABSENT", "LATE", "LEAVE", "ON_DUTY"];

const validateCreateAttendance = (data) => {
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

  // 2. Status
  let status = "PRESENT";
  if (!data.status || typeof data.status !== "string" || !data.status.trim()) {
    errors.push("status is required");
  } else {
    const upperStatus = data.status.trim().toUpperCase();
    if (!ALLOWED_ATTENDANCE_STATUSES.includes(upperStatus)) {
      errors.push(`status must be one of: ${ALLOWED_ATTENDANCE_STATUSES.join(", ")}`);
    } else {
      status = upperStatus;
    }
  }

  // 3. Date validation
  let date = new Date().toISOString().split("T")[0];
  if (data.date && typeof data.date === "string" && data.date.trim()) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(data.date.trim())) {
      errors.push("date must be in YYYY-MM-DD format");
    } else {
      date = data.date.trim();
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
    status,
    date,
    remarks: data.remarks && typeof data.remarks === "string" ? data.remarks.trim() : "",
    check_in_time: data.check_in_time && typeof data.check_in_time === "string" ? data.check_in_time.trim() : null,
    check_out_time: data.check_out_time && typeof data.check_out_time === "string" ? data.check_out_time.trim() : null,
  };
};

const validateUpdateAttendance = (data) => {
  if (!data || typeof data !== "object") {
    const error = new Error("Invalid request body");
    error.statusCode = 400;
    error.errorCode = "VALIDATION_ERROR";
    throw error;
  }

  const sanitized = {};
  const errors = [];

  if (data.status !== undefined) {
    if (typeof data.status !== "string" || !data.status.trim()) {
      errors.push("status cannot be empty");
    } else {
      const upperStatus = data.status.trim().toUpperCase();
      if (!ALLOWED_ATTENDANCE_STATUSES.includes(upperStatus)) {
        errors.push(`status must be one of: ${ALLOWED_ATTENDANCE_STATUSES.join(", ")}`);
      } else {
        sanitized.status = upperStatus;
      }
    }
  }

  if (data.date !== undefined) {
    if (typeof data.date !== "string" || !data.date.trim()) {
      errors.push("date cannot be empty");
    } else {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(data.date.trim())) {
        errors.push("date must be in YYYY-MM-DD format");
      } else {
        sanitized.date = data.date.trim();
      }
    }
  }

  if (data.remarks !== undefined) {
    sanitized.remarks = typeof data.remarks === "string" ? data.remarks.trim() : "";
  }

  if (data.check_in_time !== undefined) {
    sanitized.check_in_time = typeof data.check_in_time === "string" ? data.check_in_time.trim() : null;
  }

  if (data.check_out_time !== undefined) {
    sanitized.check_out_time = typeof data.check_out_time === "string" ? data.check_out_time.trim() : null;
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
  ALLOWED_ATTENDANCE_STATUSES,
  validateCreateAttendance,
  validateUpdateAttendance,
};
