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

const createAdmin = async ({ email, password, name }) => {
  if (!email || !password) {
    const error = new Error("Email and password are required");
    error.statusCode = 400;
    error.errorCode = "VALIDATION_ERROR";
    throw error;
  }

  // Check if user already exists
  const existing = await userRepository.findByEmail(email);
  if (existing) {
    const error = new Error("An account with this email already exists");
    error.statusCode = 409;
    error.errorCode = "EMAIL_EXISTS";
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const newUser = await userRepository.createUser({
    email: email.toLowerCase(),
    password: passwordHash,
    role: "ADMIN",
    studentId: null,
  });

  return {
    id: newUser.id,
    email: newUser.email,
    role: newUser.role,
    createdAt: newUser.created_at,
  };
};

const getAllAdmins = async () => {
  const { query } = require("../db/connection");
  const sql = `
    SELECT id, username AS email, user_type AS role, created_at
    FROM users
    WHERE user_type = 'ADMIN'
    ORDER BY created_at DESC;
  `;
  const result = await query(sql);
  return result.rows.map((r) => ({
    id: r.id,
    email: r.email,
    role: r.role,
    name: r.email ? r.email.split("@")[0].charAt(0).toUpperCase() + r.email.split("@")[0].slice(1) : "Admin",
    createdAt: r.created_at,
  }));
};

module.exports = {
  login,
  getCurrentUser,
  createAdmin,
  getAllAdmins,
};
