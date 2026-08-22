const movementService = require("../services/movementService");
const { parseJSONBody, sendSuccess } = require("../utils/response");
const { handleError } = require("../middleware/errorMiddleware");
const { authenticate, authorize, authorizeStudentAccess } = require("../middleware/authMiddleware");

/**
 * Controller for Movement Pass Management APIs
 */

const createMovementPass = async (req, res) => {
  try {
    const user = authenticate(req);
    const body = await parseJSONBody(req);
    
    // Force student_id if logged in as STUDENT
    if (user.role === "STUDENT") {
      body.student_id = String(user.student_id);
    }
    
    const result = await movementService.createMovementPass(body);
    return sendSuccess(res, 201, "Movement pass created successfully", result);
  } catch (err) {
    handleError(err, req, res);
  }
};

const getMovementPasses = async (req, res, queryParams = {}) => {
  try {
    const user = authenticate(req);
    
    // Students can only see their own passes
    if (user.role === "STUDENT") {
      queryParams.student_id = String(user.student_id);
    }
    
    const result = await movementService.getMovementPasses(queryParams);
    return sendSuccess(res, 200, "Movement passes retrieved successfully", result);
  } catch (err) {
    handleError(err, req, res);
  }
};

const getMovementPassById = async (req, res, id) => {
  try {
    const user = authenticate(req);
    const result = await movementService.getMovementPassById(id);
    
    // Verify access
    authorizeStudentAccess(user, result.student_id);
    
    return sendSuccess(res, 200, "Movement pass retrieved successfully", result);
  } catch (err) {
    handleError(err, req, res);
  }
};

const updateMovementPass = async (req, res, id) => {
  try {
    const user = authenticate(req);
    const existing = await movementService.getMovementPassById(id);
    
    // Verify access
    authorizeStudentAccess(user, existing.student_id);
    
    const body = await parseJSONBody(req);
    const result = await movementService.updateMovementPass(id, body);
    return sendSuccess(res, 200, "Movement pass updated successfully", result);
  } catch (err) {
    handleError(err, req, res);
  }
};

const cancelMovementPass = async (req, res, id) => {
  try {
    const user = authenticate(req);
    const existing = await movementService.getMovementPassById(id);
    
    // Verify access
    authorizeStudentAccess(user, existing.student_id);
    
    const result = await movementService.cancelMovementPass(id);
    return sendSuccess(res, 200, "Movement pass cancelled successfully", result);
  } catch (err) {
    handleError(err, req, res);
  }
};

const approveMovementPass = async (req, res, id) => {
  try {
    const user = authenticate(req);
    authorize(user, ["ADMIN"]);
    
    const result = await movementService.approveMovementPass(id);
    return sendSuccess(res, 200, "Movement pass approved successfully", result);
  } catch (err) {
    handleError(err, req, res);
  }
};

const rejectMovementPass = async (req, res, id) => {
  try {
    const user = authenticate(req);
    authorize(user, ["ADMIN"]);
    
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
