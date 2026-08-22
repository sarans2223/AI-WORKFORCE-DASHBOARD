const activityRepository = require("../repositories/activityRepository");

/**
 * Get activities
 */
const getActivities = async (filters = {}) => {
  const activities = await activityRepository.findActivities(filters);
  return activities || [];
};

/**
 * Get one activity by ID
 */
const getActivityById = async (id) => {
  const activity = await activityRepository.findActivityById(id);

  if (!activity) {
    const error = new Error("Activity not found");
    error.statusCode = 404;
    error.errorCode = "ACTIVITY_NOT_FOUND";
    throw error;
  }

  return activity;
};

/**
 * Create activity
 */
const createActivity = async (data) => {
  return await activityRepository.createActivity(data);
};

/**
 * Update activity
 */
const updateActivity = async (id, data) => {
  const activity = await activityRepository.updateActivity(id, data);

  if (!activity) {
    const error = new Error("Activity not found");
    error.statusCode = 404;
    error.errorCode = "ACTIVITY_NOT_FOUND";
    throw error;
  }

  return activity;
};

/**
 * Update activity progress
 */
const updateProgress = async (id, data) => {
  const activity = await activityRepository.updateProgress(id, data);

  if (!activity) {
    const error = new Error("Activity not found");
    error.statusCode = 404;
    error.errorCode = "ACTIVITY_NOT_FOUND";
    throw error;
  }

  return activity;
};

/**
 * Extend activity
 */
const extendActivity = async (id, data) => {
  const activity = await activityRepository.extendActivity(id, data);

  if (!activity) {
    const error = new Error("Activity not found");
    error.statusCode = 404;
    error.errorCode = "ACTIVITY_NOT_FOUND";
    throw error;
  }

  return activity;
};

/**
 * Delete activity
 */
const deleteActivity = async (id) => {
  const activity = await activityRepository.deleteActivity(id);

  if (!activity) {
    const error = new Error("Activity not found");
    error.statusCode = 404;
    error.errorCode = "ACTIVITY_NOT_FOUND";
    throw error;
  }

  return activity;
};

module.exports = {
  getActivities,
  getActivityById,
  createActivity,
  updateActivity,
  updateProgress,
  extendActivity,
  deleteActivity,
};