const leaveController = require("../controllers/leaveController");

/**
 * Route handler for Leave Management endpoints
 *
 * Routes:
 *   POST   /api/leave              - Apply for leave
 *   GET    /api/leave              - Get all leave applications (filters: student_id, status, start_date, end_date)
 *   GET    /api/leave/:id          - Get a specific leave application
 *   PUT    /api/leave/:id          - Update a PENDING leave application
 *   PATCH  /api/leave/:id/cancel   - Cancel a leave application (soft-cancel, status → CANCELLED)
 */
const handleLeaveRoutes = async (req, res, pathName, method, queryParams = {}) => {
  // 1. Exact match /api/leave
  if (pathName === "/api/leave" || pathName === "/api/leave/") {
    if (method === "POST") {
      await leaveController.applyForLeave(req, res);
      return true;
    }
    if (method === "GET") {
      await leaveController.getLeaveApplications(req, res, queryParams);
      return true;
    }
  }

  // 2. Parametrized /api/leave/:id
  if (pathName.startsWith("/api/leave/")) {
    const idSegment = pathName.substring("/api/leave/".length);
    const parts = idSegment.split("/").filter(Boolean);

    // /api/leave/:id
    if (parts.length === 1) {
      const id = decodeURIComponent(parts[0]);

      if (method === "GET") {
        await leaveController.getLeaveById(req, res, id);
        return true;
      }
      if (method === "PUT") {
        await leaveController.updateLeaveApplication(req, res, id);
        return true;
      }
      // Allow DELETE as a hard-delete alias (same as cancel for now)
      if (method === "DELETE") {
        await leaveController.cancelLeaveApplication(req, res, id);
        return true;
      }
    }

    // /api/leave/:id/cancel  (PATCH)
    if (parts.length === 2 && parts[1] === "cancel") {
      const id = decodeURIComponent(parts[0]);
      if (method === "PATCH" || method === "PUT") {
        await leaveController.cancelLeaveApplication(req, res, id);
        return true;
      }
    }
  }

  return false;
};

module.exports = handleLeaveRoutes;
