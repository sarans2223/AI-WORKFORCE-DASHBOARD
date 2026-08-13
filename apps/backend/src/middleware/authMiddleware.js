const jwt = require("jsonwebtoken");
const env = require("../config/env");

/**
 * Core Node.js Compatible Authentication & Authorization Middleware / Utilities
 */

/**
 * Authenticates incoming request by verifying Bearer JWT token.
 * Returns decoded user payload.
 */
const authenticate = (req) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    const error = new Error("Authentication token required");
    error.statusCode = 401;
    error.errorCode = "UNAUTHORIZED";
    throw error;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    return decoded;
  } catch (err) {
    const error = new Error("Invalid or expired authentication token");
    error.statusCode = 401;
    error.errorCode = "UNAUTHORIZED";
    throw error;
  }
};

/**
 * Verifies user has one of the allowed roles (e.g. ['ADMIN'] or ['STUDENT']).
 */
const authorize = (user, allowedRoles = []) => {
  if (!user || !user.role) {
    const error = new Error("User authentication context missing");
    error.statusCode = 401;
    error.errorCode = "UNAUTHORIZED";
    throw error;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    const error = new Error("Access denied: insufficient permissions");
    error.statusCode = 403;
    error.errorCode = "FORBIDDEN";
    throw error;
  }
};

/**
 * Prevents students from accessing another student's protected data.
 * Admins are granted full access.
 */
const authorizeStudentAccess = (user, targetStudentId) => {
  if (!user) {
    const error = new Error("User authentication context missing");
    error.statusCode = 401;
    error.errorCode = "UNAUTHORIZED";
    throw error;
  }

  // Admin has access to all student records
  if (user.role === "ADMIN") {
    return true;
  }

  // Student can only access their own student record/data
  if (user.role === "STUDENT" && user.student_id === targetStudentId) {
    return true;
  }

  const error = new Error("Access denied: cannot access another student's data");
  error.statusCode = 403;
  error.errorCode = "FORBIDDEN";
  throw error;
};

module.exports = {
  authenticate,
  authorize,
  authorizeStudentAccess,
};
