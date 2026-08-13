const authController = require("../controllers/authController");

/**
 * Route handler for Authentication endpoints
 */
const handleAuthRoutes = async (req, res, pathName, method) => {
  if (method === "POST" && (pathName === "/api/auth/login" || pathName === "/api/auth/login/")) {
    await authController.login(req, res);
    return true;
  }

  if (method === "GET" && (pathName === "/api/auth/me" || pathName === "/api/auth/me/")) {
    await authController.getCurrentUser(req, res);
    return true;
  }

  return false;
};

module.exports = handleAuthRoutes;
