/**
 * Validator for Activity Management API requests
 */

const ALLOWED_STATUSES = ["PLANNED", "STARTED", "IN_PROGRESS", "COMPLETED"];

const validateCreateActivity = (data) => {
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

  // 2. Activity Name
  if (!data.activity_name || typeof data.activity_name !== "string" || !data.activity_name.trim()) {
    errors.push("activity_name is required");
  }

  // 3. Start Time & End Time
  if (!data.start_time || typeof data.start_time !== "string" || !data.start_time.trim()) {
    errors.push("start_time is required");
  }

  if (!data.end_time || typeof data.end_time !== "string" || !data.end_time.trim()) {
    errors.push("end_time is required");
  }

  // 4. Status validation
  let status = "PLANNED";
  if (data.status) {
    const upperStatus = String(data.status).trim().toUpperCase();
    if (!ALLOWED_STATUSES.includes(upperStatus)) {
      errors.push(`status must be one of: ${ALLOWED_STATUSES.join(", ")}`);
    } else {
      status = upperStatus;
    }
  }

  // 5. Progress validation
  let progress = 0;
  if (data.progress !== undefined && data.progress !== null) {
    const prog = Number(data.progress);
    if (isNaN(prog) || prog < 0 || prog > 100) {
      errors.push("progress must be a number between 0 and 100");
    } else {
      progress = Math.round(prog);
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
    activity_name: data.activity_name.trim(),
    description: data.description && typeof data.description === "string" ? data.description.trim() : "",
    start_time: data.start_time.trim(),
    end_time: data.end_time.trim(),
    status,
    progress,
    date: data.date && typeof data.date === "string" ? data.date.trim() : new Date().toISOString().split("T")[0],
  };
};

const validateUpdateActivity = (data) => {
  if (!data || typeof data !== "object") {
    const error = new Error("Invalid request body");
    error.statusCode = 400;
    error.errorCode = "VALIDATION_ERROR";
    throw error;
  }

  const sanitized = {};
  const errors = [];

  if (data.activity_name !== undefined) {
    if (typeof data.activity_name !== "string" || !data.activity_name.trim()) {
      errors.push("activity_name cannot be empty");
    } else {
      sanitized.activity_name = data.activity_name.trim();
    }
  }

  if (data.description !== undefined) {
    sanitized.description = typeof data.description === "string" ? data.description.trim() : "";
  }

  if (data.start_time !== undefined) {
    if (typeof data.start_time !== "string" || !data.start_time.trim()) {
      errors.push("start_time cannot be empty");
    } else {
      sanitized.start_time = data.start_time.trim();
    }
  }

  if (data.end_time !== undefined) {
    if (typeof data.end_time !== "string" || !data.end_time.trim()) {
      errors.push("end_time cannot be empty");
    } else {
      sanitized.end_time = data.end_time.trim();
    }
  }

  if (data.status !== undefined) {
    const upperStatus = String(data.status).trim().toUpperCase();
    if (!ALLOWED_STATUSES.includes(upperStatus)) {
      errors.push(`status must be one of: ${ALLOWED_STATUSES.join(", ")}`);
    } else {
      sanitized.status = upperStatus;
    }
  }

  if (data.progress !== undefined) {
    const prog = Number(data.progress);
    if (isNaN(prog) || prog < 0 || prog > 100) {
      errors.push("progress must be a number between 0 and 100");
    } else {
      sanitized.progress = Math.round(prog);
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

const validateProgressUpdate = (data) => {
  if (!data || typeof data !== "object" || data.progress === undefined) {
    const error = new Error("progress field is required");
    error.statusCode = 400;
    error.errorCode = "VALIDATION_ERROR";
    throw error;
  }

  const prog = Number(data.progress);
  if (isNaN(prog) || prog < 0 || prog > 100) {
    const error = new Error("progress must be a number between 0 and 100");
    error.statusCode = 400;
    error.errorCode = "VALIDATION_ERROR";
    throw error;
  }

  const result = { progress: Math.round(prog) };

  if (data.status) {
    const upperStatus = String(data.status).trim().toUpperCase();
    if (!ALLOWED_STATUSES.includes(upperStatus)) {
      const error = new Error(`status must be one of: ${ALLOWED_STATUSES.join(", ")}`);
      error.statusCode = 400;
      error.errorCode = "VALIDATION_ERROR";
      throw error;
    }
    result.status = upperStatus;
  } else if (result.progress === 100) {
    result.status = "COMPLETED";
  }

  return result;
};

const validateExtension = (data) => {
  if (!data || typeof data !== "object" || data.extension_duration === undefined) {
    const error = new Error("extension_duration field is required");
    error.statusCode = 400;
    error.errorCode = "VALIDATION_ERROR";
    throw error;
  }

  const duration = Number(data.extension_duration);
  if (isNaN(duration) || duration <= 0) {
    const error = new Error("extension_duration must be a positive number");
    error.statusCode = 400;
    error.errorCode = "VALIDATION_ERROR";
    throw error;
  }

  return {
    extension_duration: duration,
    new_end_time: data.new_end_time && typeof data.new_end_time === "string" ? data.new_end_time.trim() : null,
  };
};

module.exports = {
  validateCreateActivity,
  validateUpdateActivity,
  validateProgressUpdate,
  validateExtension,
};
