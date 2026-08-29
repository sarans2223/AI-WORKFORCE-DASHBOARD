const leaveService = require("../services/leaveService");
const { parseJSONBody, sendSuccess } = require("../utils/response");
const { handleError } = require("../middleware/errorMiddleware");

/**
 * Controller for Leave Monitoring
 *
 * This application is monitoring-only.
 *
 * Supported operations:
 *   POST /api/leave
 *   GET  /api/leave
 *   GET  /api/leave/:id
 *
 * No approve/reject/update/cancel operations are performed.
 */

/**
 * Submit a leave record
 */
const applyForLeave = async (req, res) => {
  try {
    const body = await parseJSONBody(req);

    const result = await leaveService.applyForLeave(body);

    return sendSuccess(
      res,
      201,
      "Leave record submitted successfully",
      result
    );
  } catch (err) {
    handleError(err, req, res);
  }
};

/**
 * Get all leave records
 *
 * Optional filters:
 *   ?student_id=4
 *   ?start_date=2026-08-20
 *   ?end_date=2026-08-25
 */
const getLeaveApplications = async (req, res, queryParams = {}) => {
  try {
    const result = await leaveService.getLeaveApplications(queryParams);

    return sendSuccess(
      res,
      200,
      "Leave records retrieved successfully",
      result
    );
  } catch (err) {
    handleError(err, req, res);
  }
};

/**
 * Get a single leave record
 */
const getLeaveById = async (req, res, id) => {
  try {
    const result = await leaveService.getLeaveById(id);

    return sendSuccess(
      res,
      200,
      "Leave record retrieved successfully",
      result
    );
  } catch (err) {
    handleError(err, req, res);
  }
};

module.exports = {
  applyForLeave,
  getLeaveApplications,
  getLeaveById,
};