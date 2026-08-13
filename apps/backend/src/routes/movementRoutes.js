const movementController = require("../controllers/movementController");

/**
 * Route handler for Movement Pass Management endpoints
 *
 * Routes:
 *   POST   /api/movement-passes              - Create a movement pass
 *   GET    /api/movement-passes              - Get movement passes (filters: student_id, status, pass_type)
 *   GET    /api/movement-passes/:id          - Get a specific movement pass
 *   PUT    /api/movement-passes/:id          - Update a PENDING movement pass
 *   PATCH  /api/movement-passes/:id/cancel   - Cancel a movement pass
 *   PATCH  /api/movement-passes/:id/approve  - Approve a movement pass
 *   PATCH  /api/movement-passes/:id/reject   - Reject a movement pass
 */
const handleMovementRoutes = async (req, res, pathName, method, queryParams = {}) => {
  // 1. Exact match /api/movement-passes
  if (pathName === "/api/movement-passes" || pathName === "/api/movement-passes/") {
    if (method === "POST") {
      await movementController.createMovementPass(req, res);
      return true;
    }
    if (method === "GET") {
      await movementController.getMovementPasses(req, res, queryParams);
      return true;
    }
  }

  // 2. Parametrized /api/movement-passes/:id
  if (pathName.startsWith("/api/movement-passes/")) {
    const idSegment = pathName.substring("/api/movement-passes/".length);
    const parts = idSegment.split("/").filter(Boolean);

    // /api/movement-passes/:id
    if (parts.length === 1) {
      const id = decodeURIComponent(parts[0]);

      if (method === "GET") {
        await movementController.getMovementPassById(req, res, id);
        return true;
      }
      if (method === "PUT") {
        await movementController.updateMovementPass(req, res, id);
        return true;
      }
      if (method === "DELETE") {
        await movementController.cancelMovementPass(req, res, id);
        return true;
      }
    }

    // /api/movement-passes/:id/action  (cancel | approve | reject)
    if (parts.length === 2) {
      const id = decodeURIComponent(parts[0]);
      const action = parts[1].toLowerCase();

      if (action === "cancel" && (method === "PATCH" || method === "PUT")) {
        await movementController.cancelMovementPass(req, res, id);
        return true;
      }
      if (action === "approve" && (method === "PATCH" || method === "PUT")) {
        await movementController.approveMovementPass(req, res, id);
        return true;
      }
      if (action === "reject" && (method === "PATCH" || method === "PUT")) {
        await movementController.rejectMovementPass(req, res, id);
        return true;
      }
    }
  }

  return false;
};

module.exports = handleMovementRoutes;
