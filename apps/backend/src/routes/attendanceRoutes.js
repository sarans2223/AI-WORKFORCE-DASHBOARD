const attendanceController = require("../controllers/attendanceController");

/**
 * Route handler for Attendance Management endpoints
 */
const handleAttendanceRoutes = async (req, res, pathName, method, queryParams = {}) => {
  // 1. Exact match /api/attendance
  if (pathName === "/api/attendance" || pathName === "/api/attendance/") {
    if (method === "POST") {
      await attendanceController.markAttendance(req, res);
      return true;
    }
    if (method === "GET") {
      await attendanceController.getAttendanceRecords(req, res, queryParams);
      return true;
    }
  }

  // 2. Parametrized match /api/attendance/:id
  if (pathName.startsWith("/api/attendance/")) {
    const idSegment = pathName.substring("/api/attendance/".length);
    const parts = idSegment.split("/").filter(Boolean);

    if (parts.length === 1) {
      const id = decodeURIComponent(parts[0]);
      if (method === "GET") {
        await attendanceController.getAttendanceById(req, res, id);
        return true;
      }
      if (method === "PUT") {
        await attendanceController.updateAttendance(req, res, id);
        return true;
      }
      if (method === "DELETE") {
        await attendanceController.deleteAttendance(req, res, id);
        return true;
      }
    }
  }

  return false;
};

module.exports = handleAttendanceRoutes;
