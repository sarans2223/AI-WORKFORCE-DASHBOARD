const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userRepository = require("../repositories/userRepository");
const { validateLoginInput } = require("../validators/authValidator");
const env = require("../config/env");

/**
 * Authentication Business Logic Service
 */
const login = async (credentials) => {
  // 1. Validate input format
  const { email, password } = validateLoginInput(credentials);

  // 2. Query user from PostgreSQL users table
  const user = await userRepository.findByEmail(email);
  if (!user) {
    const error = new Error("Invalid credentials");
    error.statusCode = 401;
    error.errorCode = "INVALID_CREDENTIALS";
    throw error;
  }

  // 3. Verify password hash using bcrypt
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    const error = new Error("Invalid credentials");
    error.statusCode = 401;
    error.errorCode = "INVALID_CREDENTIALS";
    throw error;
  }

  // 4. Generate JWT authentication token
  const tokenPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
    student_id: user.student_id || null,
  };

  const token = jwt.sign(tokenPayload, env.jwtSecret, {
    expiresIn: "24h",
  });

  // 5. Construct user response (NEVER return password hash)
  const userResponse = {
    id: user.id,
    email: user.email,
    role: user.role,
    student_id: user.student_id || null,
    name: user.name || "",
  };

  return {
    token,
    user: userResponse,
  };
};

const getCurrentUser = async (identifier) => {
  if (!identifier) {
    const error = new Error("User identification missing");
    error.statusCode = 401;
    error.errorCode = "UNAUTHORIZED";
    throw error;
  }

  let user = null;
  if (typeof identifier === "number" || !isNaN(Number(identifier))) {
    user = await userRepository.findById(identifier);
  } else {
    user = await userRepository.findByEmail(identifier);
  }

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    error.errorCode = "USER_NOT_FOUND";
    throw error;
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    student_id: user.student_id || null,
    name: user.name || "",
  };
};

module.exports = {
  login,
  getCurrentUser,
};
