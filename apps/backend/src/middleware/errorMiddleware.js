const { sendError } = require("../utils/response");
const env = require("../config/env");

/**
 * Centralized error handler for Core Node.js HTTP server.
 * Handles known custom errors and uncaught exceptions safely.
 */
const handleError = (err, req, res) => {
  if (env.NODE_ENV !== "production") {
    console.error("[ERROR]", err);
  } else {
    console.error("[ERROR]", err.message || "An unexpected error occurred");
  }

  // Handle standard error structures
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";
  const errorCode = err.errorCode || "INTERNAL_SERVER_ERROR";

  sendError(res, statusCode, message, errorCode);
};

module.exports = {
  handleError,
};
