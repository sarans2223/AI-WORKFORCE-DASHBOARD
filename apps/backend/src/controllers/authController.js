const authService = require("../services/authService");
const { parseJSONBody, sendSuccess } = require("../utils/response");
const { handleError } = require("../middleware/errorMiddleware");

/**
 * Auth Controller for Core Node.js HTTP Server
 */
const login = async (req, res) => {
  try {
    const body = await parseJSONBody(req);
    const result = await authService.login(body);
    return sendSuccess(res, 200, "Login successful", result);
  } catch (err) {
    handleError(err, req, res);
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const { authenticate } = require("../middleware/authMiddleware");
    const userPayload = authenticate(req);
    const result = await authService.getCurrentUser(userPayload.id || userPayload.email);
    return sendSuccess(res, 200, "Current user retrieved successfully", result);
  } catch (err) {
    handleError(err, req, res);
  }
};

module.exports = {
  login,
  getCurrentUser,
};
