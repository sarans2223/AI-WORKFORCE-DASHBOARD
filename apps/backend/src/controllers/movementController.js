const movementService = require("../services/movementService");
const { parseJSONBody, sendSuccess } = require("../utils/response");
const { handleError } = require("../middleware/errorMiddleware");

/**
 * Controller for Movement Pass Management APIs
 */

const createMovementPass = async (req, res) => {
  try {
    const body = await parseJSONBody(req);
    const result = await movementService.createMovementPass(body);
    return sendSuccess(res, 201, "Movement pass created successfully", result);
  } catch (err) {
    handleError(err, req, res);
  }
};

const getMovementPasses = async (req, res, queryParams = {}) => {
  try {
    const result = await movementService.getMovementPasses(queryParams);
    return sendSuccess(res, 200, "Movement passes retrieved successfully", result);
  } catch (err) {
    handleError(err, req, res);
  }
};

const getMovementPassById = async (req, res, id) => {
  try {
    const result = await movementService.getMovementPassById(id);
    return sendSuccess(res, 200, "Movement pass retrieved successfully", result);
  } catch (err) {
    handleError(err, req, res);
  }
};

const updateMovementPass = async (req, res, id) => {
  try {
    const body = await parseJSONBody(req);
    const result = await movementService.updateMovementPass(id, body);
    return sendSuccess(res, 200, "Movement pass updated successfully", result);
  } catch (err) {
    handleError(err, req, res);
  }
};

const cancelMovementPass = async (req, res, id) => {
  try {
    const result = await movementService.cancelMovementPass(id);
    return sendSuccess(res, 200, "Movement pass cancelled successfully", result);
  } catch (err) {
    handleError(err, req, res);
  }
};

const approveMovementPass = async (req, res, id) => {
  try {
    const result = await movementService.approveMovementPass(id);
    return sendSuccess(res, 200, "Movement pass approved successfully", result);
  } catch (err) {
    handleError(err, req, res);
  }
};

const rejectMovementPass = async (req, res, id) => {
  try {
    const result = await movementService.rejectMovementPass(id);
    return sendSuccess(res, 200, "Movement pass rejected successfully", result);
  } catch (err) {
    handleError(err, req, res);
  }
};

module.exports = {
  createMovementPass,
  getMovementPasses,
  getMovementPassById,
  updateMovementPass,
  cancelMovementPass,
  approveMovementPass,
  rejectMovementPass,
};
