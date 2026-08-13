const { sendSuccess, sendError, setCORSHeaders } = require("./utils/response");
const { handleError } = require("./middleware/errorMiddleware");
const handleAuthRoutes = require("./routes/authRoutes");
const handleStudentRoutes = require("./routes/studentRoutes");
const handleBulkImportRoutes = require("./routes/bulkImportRoutes");
const handleActivityRoutes = require("./routes/activityRoutes");
const handleAttendanceRoutes = require("./routes/attendanceRoutes");
const handlePSkillRoutes = require("./routes/pskillRoutes");
const handleLeaveRoutes = require("./routes/leaveRoutes");
const handleMovementRoutes = require("./routes/movementRoutes");
const handleWeeklyRoutes = require("./routes/weeklyRoutes");

/**
 * Main application HTTP request listener for Core Node.js.
 */
const app = async (req, res) => {
  try {
    // Handle CORS preflight OPTIONS request
    if (req.method === "OPTIONS") {
      setCORSHeaders(res);
      res.writeHead(204);
      return res.end();
    }

    const host = req.headers.host || "localhost";
    const parsedUrl = new URL(req.url, `http://${host}`);
    const pathName = parsedUrl.pathname;
    const method = req.method.toUpperCase();
    const queryParams = Object.fromEntries(parsedUrl.searchParams.entries());

    // 1. Health check endpoint (Preserved)
    if (method === "GET" && pathName === "/api/health") {
      return sendSuccess(res, 200, "AI Workforce Dashboard backend is running");
    }

    // 2. Bulk Import routes (must check before general student routes)
    const isBulkImportRoute = await handleBulkImportRoutes(req, res, pathName, method);
    if (isBulkImportRoute) return;

    // 3. Weekly Analysis routes
    const isWeeklyRoute = await handleWeeklyRoutes(req, res, pathName, method, queryParams);
    if (isWeeklyRoute) return;

    // 4. Movement Pass Management routes
    const isMovementRoute = await handleMovementRoutes(req, res, pathName, method, queryParams);
    if (isMovementRoute) return;

    // 5. Leave Management routes
    const isLeaveRoute = await handleLeaveRoutes(req, res, pathName, method, queryParams);
    if (isLeaveRoute) return;

    // 6. P-Skills Management routes
    const isPSkillRoute = await handlePSkillRoutes(req, res, pathName, method, queryParams);
    if (isPSkillRoute) return;

    // 7. Attendance Management routes
    const isAttendanceRoute = await handleAttendanceRoutes(req, res, pathName, method, queryParams);
    if (isAttendanceRoute) return;

    // 8. Activity Management routes
    const isActivityRoute = await handleActivityRoutes(req, res, pathName, method, queryParams);
    if (isActivityRoute) return;

    // 9. Student Management routes
    const isStudentRoute = await handleStudentRoutes(req, res, pathName, method);
    if (isStudentRoute) return;

    // 10. Authentication routes
    const isAuthRoute = await handleAuthRoutes(req, res, pathName, method);
    if (isAuthRoute) return;

    // 11. 404 Not Found for unmatched routes
    return sendError(res, 404, `Route ${method} ${pathName} not found`, "ROUTE_NOT_FOUND");
  } catch (err) {
    handleError(err, req, res);
  }
};

module.exports = app;
