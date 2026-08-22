/**
 * Validator for Leave Monitoring API requests
 *
 * This application is MONITORING ONLY.
 *
 * Leave records contain:
 *   student_id
 *   start_date
 *   end_date
 *   start_time
 *   end_time
 *   reason
 *
 * No approve/reject/cancel status is used.
 */

const validateCreateLeave = (data) => {
  if (!data || typeof data !== "object") {
    const error = new Error("Invalid request body");
    error.statusCode = 400;
    error.errorCode = "VALIDATION_ERROR";
    throw error;
  }

  const errors = [];

  // ============================================================
  // STUDENT ID
  // ============================================================

  if (
    data.student_id === undefined ||
    data.student_id === null ||
    String(data.student_id).trim() === ""
  ) {
    errors.push("student_id is required");
  } else if (!/^\d+$/.test(String(data.student_id).trim())) {
    errors.push("student_id must be a valid number");
  }

  // ============================================================
  // REASON
  // ============================================================

  if (
    !data.reason ||
    typeof data.reason !== "string" ||
    !data.reason.trim()
  ) {
    errors.push("reason is required");
  }

  // ============================================================
  // START DATE
  // ============================================================

  if (
    !data.start_date ||
    typeof data.start_date !== "string" ||
    !data.start_date.trim()
  ) {
    errors.push("start_date is required");
  } else {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (!dateRegex.test(data.start_date.trim())) {
      errors.push("start_date must be in YYYY-MM-DD format");
    }
  }

  // ============================================================
  // END DATE
  // ============================================================

  if (
    !data.end_date ||
    typeof data.end_date !== "string" ||
    !data.end_date.trim()
  ) {
    errors.push("end_date is required");
  } else {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (!dateRegex.test(data.end_date.trim())) {
      errors.push("end_date must be in YYYY-MM-DD format");
    }
  }

  // ============================================================
  // DATE RANGE
  // ============================================================

  if (
    data.start_date &&
    data.end_date &&
    /^\d{4}-\d{2}-\d{2}$/.test(String(data.start_date).trim()) &&
    /^\d{4}-\d{2}-\d{2}$/.test(String(data.end_date).trim())
  ) {
    if (
      new Date(data.start_date.trim()) >
      new Date(data.end_date.trim())
    ) {
      errors.push("start_date cannot be after end_date");
    }
  }

  // ============================================================
  // START TIME
  // ============================================================

  if (
    !data.start_time ||
    typeof data.start_time !== "string" ||
    !data.start_time.trim()
  ) {
    errors.push("start_time is required");
  } else {
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/;

    if (!timeRegex.test(data.start_time.trim())) {
      errors.push("start_time must be in HH:MM or HH:MM:SS format");
    }
  }

  // ============================================================
  // END TIME
  // ============================================================

  if (
    !data.end_time ||
    typeof data.end_time !== "string" ||
    !data.end_time.trim()
  ) {
    errors.push("end_time is required");
  } else {
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/;

    if (!timeRegex.test(data.end_time.trim())) {
      errors.push("end_time must be in HH:MM or HH:MM:SS format");
    }
  }

  // ============================================================
  // TIME RANGE
  // ============================================================

  if (
    data.start_time &&
    data.end_time &&
    typeof data.start_time === "string" &&
    typeof data.end_time === "string"
  ) {
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/;

    if (
      timeRegex.test(data.start_time.trim()) &&
      timeRegex.test(data.end_time.trim())
    ) {
      const startParts = data.start_time
        .trim()
        .split(":")
        .map(Number);

      const endParts = data.end_time
        .trim()
        .split(":")
        .map(Number);

      const startMinutes =
        startParts[0] * 60 + startParts[1];

      const endMinutes =
        endParts[0] * 60 + endParts[1];

      if (endMinutes <= startMinutes) {
        errors.push("end_time must be after start_time");
      }
    }
  }

  // ============================================================
  // RETURN VALIDATION ERRORS
  // ============================================================

  if (errors.length > 0) {
    const error = new Error(errors.join(", "));
    error.statusCode = 400;
    error.errorCode = "VALIDATION_ERROR";
    throw error;
  }

  // ============================================================
  // RETURN CLEAN DATA
  // ============================================================

  return {
    student_id: String(data.student_id).trim(),

    reason: data.reason.trim(),

    start_date: data.start_date.trim(),

    end_date: data.end_date.trim(),

    start_time: data.start_time.trim(),

    end_time: data.end_time.trim(),
  };
};


// ================================================================
// UPDATE VALIDATION
// ================================================================
// Monitoring application does not use update operations.
// Kept only so existing imports do not break.

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
    if (
      typeof data.reason !== "string" ||
      !data.reason.trim()
    ) {
      errors.push("reason cannot be empty");
    } else {
      sanitized.reason = data.reason.trim();
    }
  }

  if (data.start_date !== undefined) {
    if (typeof data.start_date !== "string") {
      errors.push("start_date must be a string");
    } else if (
      !/^\d{4}-\d{2}-\d{2}$/.test(data.start_date.trim())
    ) {
      errors.push("start_date must be in YYYY-MM-DD format");
    } else {
      sanitized.start_date = data.start_date.trim();
    }
  }

  if (data.end_date !== undefined) {
    if (typeof data.end_date !== "string") {
      errors.push("end_date must be a string");
    } else if (
      !/^\d{4}-\d{2}-\d{2}$/.test(data.end_date.trim())
    ) {
      errors.push("end_date must be in YYYY-MM-DD format");
    } else {
      sanitized.end_date = data.end_date.trim();
    }
  }

  if (data.start_time !== undefined) {
    if (typeof data.start_time !== "string") {
      errors.push("start_time must be a string");
    } else if (
      !/^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/.test(
        data.start_time.trim()
      )
    ) {
      errors.push(
        "start_time must be in HH:MM or HH:MM:SS format"
      );
    } else {
      sanitized.start_time = data.start_time.trim();
    }
  }

  if (data.end_time !== undefined) {
    if (typeof data.end_time !== "string") {
      errors.push("end_time must be a string");
    } else if (
      !/^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/.test(
        data.end_time.trim()
      )
    ) {
      errors.push(
        "end_time must be in HH:MM or HH:MM:SS format"
      );
    } else {
      sanitized.end_time = data.end_time.trim();
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
  validateCreateLeave,
  validateUpdateLeave,
};