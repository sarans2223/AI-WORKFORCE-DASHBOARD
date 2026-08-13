const activityController = require("../controllers/activityController");

/**
 * Route handler for Activity Management endpoints
 */
const handleActivityRoutes = async (req, res, pathName, method, queryParams = {}) => {
  // 1. Exact match /api/activities
  if (pathName === "/api/activities" || pathName === "/api/activities/") {
    if (method === "POST") {
      await activityController.createActivity(req, res);
      return true;
    }
    if (method === "GET") {
      await activityController.getActivities(req, res, queryParams);
      return true;
    }
  }

  // 2. Parametrized matches under /api/activities/
  if (pathName.startsWith("/api/activities/")) {
    const idSegment = pathName.substring("/api/activities/".length);
    const parts = idSegment.split("/").filter(Boolean);

    // Case 2a: /api/activities/:id
    if (parts.length === 1) {
      const id = decodeURIComponent(parts[0]);
      if (method === "GET") {
        await activityController.getActivityById(req, res, id);
        return true;
      }
      if (method === "PUT") {
        await activityController.updateActivity(req, res, id);
        return true;
      }
      if (method === "DELETE") {
        await activityController.deleteActivity(req, res, id);
        return true;
      }
    }

    // Case 2b: /api/activities/:id/progress & /api/activities/:id/extend
    if (parts.length === 2) {
      const id = decodeURIComponent(parts[0]);
      const action = parts[1].toLowerCase();

      if (action === "progress" && method === "PUT") {
        await activityController.updateProgress(req, res, id);
        return true;
      }

      if (action === "extend" && method === "PUT") {
        await activityController.extendActivity(req, res, id);
        return true;
      }
    }
  }

  return false;
};

module.exports = handleActivityRoutes;
