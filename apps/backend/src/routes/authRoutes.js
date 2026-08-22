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

  // Admin management: List all admins
  if (method === "GET" && (pathName === "/api/auth/admins" || pathName === "/api/auth/admins/")) {
    await authController.listAdmins(req, res);
    return true;
  }

  // Admin management: Create a new admin account
  if (method === "POST" && (pathName === "/api/auth/admins" || pathName === "/api/auth/admins/")) {
    await authController.createAdmin(req, res);
    return true;
  }

  return false;
};

module.exports = handleAuthRoutes;
