const activityService = require("../services/activityService");
const { parseJSONBody, sendSuccess } = require("../utils/response");
const { handleError } = require("../middleware/errorMiddleware");

/**
 * Controller for Activity Management APIs
 */

const createActivity = async (req, res) => {
  try {
    const body = await parseJSONBody(req);
    const result = await activityService.createActivity(body);
    return sendSuccess(res, 201, "Activity created successfully", result);
  } catch (err) {
    handleError(err, req, res);
  }
};

const getActivities = async (req, res, queryParams = {}) => {
  try {
    const result = await activityService.getActivities(queryParams);
    return sendSuccess(res, 200, "Activities retrieved successfully", result);
  } catch (err) {
    handleError(err, req, res);
  }
};

const getActivityById = async (req, res, id) => {
  try {
    const result = await activityService.getActivityById(id);
    return sendSuccess(res, 200, "Activity retrieved successfully", result);
  } catch (err) {
    handleError(err, req, res);
  }
};

const updateActivity = async (req, res, id) => {
  try {
    const body = await parseJSONBody(req);
    const result = await activityService.updateActivity(id, body);
    return sendSuccess(res, 200, "Activity updated successfully", result);
  } catch (err) {
    handleError(err, req, res);
  }
};

const updateProgress = async (req, res, id) => {
  try {
    const body = await parseJSONBody(req);
    const result = await activityService.updateProgress(id, body);
    return sendSuccess(res, 200, "Activity progress updated successfully", result);
  } catch (err) {
    handleError(err, req, res);
  }
};

const extendActivity = async (req, res, id) => {
  try {
    const body = await parseJSONBody(req);
    const result = await activityService.extendActivity(id, body);
    return sendSuccess(res, 200, "Activity extended successfully", result);
  } catch (err) {
    handleError(err, req, res);
  }
};

const deleteActivity = async (req, res, id) => {
  try {
    const result = await activityService.deleteActivity(id);
    return sendSuccess(res, 200, "Activity deleted successfully", result);
  } catch (err) {
    handleError(err, req, res);
  }
};

module.exports = {
  createActivity,
  getActivities,
  getActivityById,
  updateActivity,
  updateProgress,
  extendActivity,
  deleteActivity,
};
