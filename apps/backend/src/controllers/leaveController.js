const leaveService = require("../services/leaveService");
const { parseJSONBody, sendSuccess } = require("../utils/response");
const { handleError } = require("../middleware/errorMiddleware");

/**
 * Controller for Leave Management APIs
 */

const applyForLeave = async (req, res) => {
  try {
    const body = await parseJSONBody(req);
    const result = await leaveService.applyForLeave(body);
    return sendSuccess(res, 201, "Leave application submitted successfully", result);
  } catch (err) {
    handleError(err, req, res);
  }
};

const getLeaveApplications = async (req, res, queryParams = {}) => {
  try {
    const result = await leaveService.getLeaveApplications(queryParams);
    return sendSuccess(res, 200, "Leave applications retrieved successfully", result);
  } catch (err) {
    handleError(err, req, res);
  }
};

const getLeaveById = async (req, res, id) => {
  try {
    const result = await leaveService.getLeaveById(id);
    return sendSuccess(res, 200, "Leave application retrieved successfully", result);
  } catch (err) {
    handleError(err, req, res);
  }
};

const updateLeaveApplication = async (req, res, id) => {
  try {
    const body = await parseJSONBody(req);
    const result = await leaveService.updateLeaveApplication(id, body);
    return sendSuccess(res, 200, "Leave application updated successfully", result);
  } catch (err) {
    handleError(err, req, res);
  }
};

const cancelLeaveApplication = async (req, res, id) => {
  try {
    const result = await leaveService.cancelLeaveApplication(id);
    return sendSuccess(res, 200, "Leave application cancelled successfully", result);
  } catch (err) {
    handleError(err, req, res);
  }
};

module.exports = {
  applyForLeave,
  getLeaveApplications,
  getLeaveById,
  updateLeaveApplication,
  cancelLeaveApplication,
};
