const leaveController = require("../controllers/leaveController");

/**
 * Route handler for Leave Monitoring endpoints
 *
 * Routes:
 *   POST /api/leave       - Submit a leave record
 *   GET  /api/leave       - Get leave records
 *   GET  /api/leave/:id   - Get a specific leave record
 *
 * This is a MONITORING application.
 * No approve, reject, cancel, or update operations are provided.
 */

const handleLeaveRoutes = async (
  req,
  res,
  pathName,
  method,
  queryParams = {}
) => {
  // ============================================================
  // /api/leave
  // ============================================================
  if (pathName === "/api/leave" || pathName === "/api/leave/") {

    // Submit leave record
    if (method === "POST") {
      await leaveController.applyForLeave(req, res);
      return true;
    }

    // View leave records
    if (method === "GET") {
      await leaveController.getLeaveApplications(
        req,
        res,
        queryParams
      );
      return true;
    }
  }

  // ============================================================
  // /api/leave/:id
  // ============================================================
  if (pathName.startsWith("/api/leave/")) {

    const idSegment = pathName.substring(
      "/api/leave/".length
    );

    const parts = idSegment.split("/").filter(Boolean);

    // GET /api/leave/:id
    if (parts.length === 1) {

      const id = decodeURIComponent(parts[0]);

      if (method === "GET") {
        await leaveController.getLeaveById(
          req,
          res,
          id
        );
        return true;
      }
    }
  }

  // ============================================================
  // Any PUT / PATCH / DELETE request is intentionally rejected
  // because this application is for MONITORING only.
  // ============================================================

  return false;
};

module.exports = handleLeaveRoutes;