const weeklyController = require("../controllers/weeklyController");

/**
 * Route handler for Weekly Analysis endpoints
 *
 * Routes:
 *   GET /api/weekly-analysis  - Get weekly analysis metrics (query params: student_id, week_start, week_end, date)
 */
const handleWeeklyRoutes = async (req, res, pathName, method, queryParams = {}) => {
  if (pathName === "/api/weekly-analysis" || pathName === "/api/weekly-analysis/") {
    if (method === "GET") {
      await weeklyController.getWeeklyAnalysis(req, res, queryParams);
      return true;
    }
  }

  return false;
};

module.exports = handleWeeklyRoutes;
