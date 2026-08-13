/**
 * Validator for authentication requests
 */

const validateLoginInput = (data) => {
  const errors = [];

  if (!data.email || typeof data.email !== "string" || !data.email.trim()) {
    errors.push("Email is required");
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email.trim())) {
      errors.push("Invalid email format");
    }
  }

  if (!data.password || typeof data.password !== "string" || !data.password.trim()) {
    errors.push("Password is required");
  }

  if (errors.length > 0) {
    const error = new Error(errors.join(", "));
    error.statusCode = 400;
    error.errorCode = "VALIDATION_ERROR";
    throw error;
  }

  return {
    email: data.email.trim().toLowerCase(),
    password: data.password,
  };
};

module.exports = {
  validateLoginInput,
};
