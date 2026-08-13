/**
 * Validator for Student Management API requests
 */

const validateCreateStudent = (data) => {
  const errors = [];

  if (!data || typeof data !== "object") {
    const error = new Error("Invalid request body");
    error.statusCode = 400;
    error.errorCode = "VALIDATION_ERROR";
    throw error;
  }

  // 1. Validate Student ID (Must be provided manually by admin, never generated)
  if (!data.student_id || typeof data.student_id !== "string" || !data.student_id.trim()) {
    errors.push("Student ID is required");
  }

  // 2. Validate Student Name
  if (!data.name || typeof data.name !== "string" || !data.name.trim()) {
    errors.push("Student name is required");
  }

  // 3. Validate Roll Number
  if (!data.roll_number || typeof data.roll_number !== "string" || !data.roll_number.trim()) {
    errors.push("Roll number is required");
  }

  // 4. Validate Email
  if (!data.email || typeof data.email !== "string" || !data.email.trim()) {
    errors.push("Email is required");
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email.trim())) {
      errors.push("Invalid email format");
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
    name: data.name.trim(),
    roll_number: data.roll_number.trim(),
    email: data.email.trim().toLowerCase(),
    phone: data.phone && typeof data.phone === "string" ? data.phone.trim() : null,
    github_url: data.github_url && typeof data.github_url === "string" ? data.github_url.trim() : null,
  };
};

const validateUpdateStudent = (data) => {
  if (!data || typeof data !== "object") {
    const error = new Error("Invalid request body");
    error.statusCode = 400;
    error.errorCode = "VALIDATION_ERROR";
    throw error;
  }

  const sanitized = {};
  const errors = [];

  if (data.name !== undefined) {
    if (typeof data.name !== "string" || !data.name.trim()) {
      errors.push("Name cannot be empty");
    } else {
      sanitized.name = data.name.trim();
    }
  }

  if (data.roll_number !== undefined) {
    if (typeof data.roll_number !== "string" || !data.roll_number.trim()) {
      errors.push("Roll number cannot be empty");
    } else {
      sanitized.roll_number = data.roll_number.trim();
    }
  }

  if (data.email !== undefined) {
    if (typeof data.email !== "string" || !data.email.trim()) {
      errors.push("Email cannot be empty");
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email.trim())) {
        errors.push("Invalid email format");
      } else {
        sanitized.email = data.email.trim().toLowerCase();
      }
    }
  }

  if (data.phone !== undefined) {
    sanitized.phone = typeof data.phone === "string" ? data.phone.trim() : null;
  }

  if (data.github_url !== undefined) {
    sanitized.github_url = typeof data.github_url === "string" ? data.github_url.trim() : null;
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
  validateCreateStudent,
  validateUpdateStudent,
};
