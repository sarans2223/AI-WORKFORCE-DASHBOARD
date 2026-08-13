const attendanceService = require("../services/attendanceService");
const { parseJSONBody, sendSuccess } = require("../utils/response");
const { handleError } = require("../middleware/errorMiddleware");

/**
 * Controller for Attendance Management APIs
 */

const markAttendance = async (req, res) => {
  try {
    const body = await parseJSONBody(req);
    const result = await attendanceService.markAttendance(body);
    return sendSuccess(res, 201, "Attendance marked successfully", result);
  } catch (err) {
    handleError(err, req, res);
  }
};

const getAttendanceRecords = async (req, res, queryParams = {}) => {
  try {
    const result = await attendanceService.getAttendanceRecords(queryParams);
    return sendSuccess(res, 200, "Attendance retrieved successfully", result);
  } catch (err) {
    handleError(err, req, res);
  }
};

const getAttendanceById = async (req, res, id) => {
  try {
    const result = await attendanceService.getAttendanceById(id);
    return sendSuccess(res, 200, "Attendance record retrieved successfully", result);
  } catch (err) {
    handleError(err, req, res);
  }
};

const updateAttendance = async (req, res, id) => {
  try {
    const body = await parseJSONBody(req);
    const result = await attendanceService.updateAttendance(id, body);
    return sendSuccess(res, 200, "Attendance record updated successfully", result);
  } catch (err) {
    handleError(err, req, res);
  }
};

const deleteAttendance = async (req, res, id) => {
  try {
    const result = await attendanceService.deleteAttendance(id);
    return sendSuccess(res, 200, "Attendance record deleted successfully", result);
  } catch (err) {
    handleError(err, req, res);
  }
};

module.exports = {
  markAttendance,
  getAttendanceRecords,
  getAttendanceById,
  updateAttendance,
  deleteAttendance,
};
