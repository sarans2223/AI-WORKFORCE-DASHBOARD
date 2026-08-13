const activityRepository = require("../repositories/activityRepository");
const studentRepository = require("../repositories/studentRepository");
const {
  validateCreateActivity,
  validateUpdateActivity,
  validateProgressUpdate,
  validateExtension,
} = require("../validators/activityValidator");

/**
 * Service for Activity Management Business Logic
 */

const createActivity = async (activityData) => {
  // 1. Validate payload fields
  const validated = validateCreateActivity(activityData);

  // 2. Verify referenced student exists in PostgreSQL
  const student = await studentRepository.findStudentByStudentId(validated.student_id);
  if (!student) {
    const error = new Error("Referenced student does not exist");
    error.statusCode = 404;
    error.errorCode = "STUDENT_NOT_FOUND";
    throw error;
  }

  // 3. Create activity in database
  const activity = await activityRepository.createActivity(validated);
  return activity;
};

const getActivities = async (filters = {}) => {
  const activities = await activityRepository.findActivities(filters);
  return activities || [];
};

const getActivityById = async (id) => {
  if (!id) {
    const error = new Error("Activity ID is required");
    error.statusCode = 400;
    error.errorCode = "VALIDATION_ERROR";
    throw error;
  }

  const activity = await activityRepository.findActivityById(id);
  if (!activity) {
    const error = new Error("Activity not found");
    error.statusCode = 404;
    error.errorCode = "ACTIVITY_NOT_FOUND";
    throw error;
  }

  return activity;
};

const updateActivity = async (id, updateData) => {
  if (!id) {
    const error = new Error("Activity ID is required");
    error.statusCode = 400;
    error.errorCode = "VALIDATION_ERROR";
    throw error;
  }

  // 1. Verify activity exists
  const existing = await activityRepository.findActivityById(id);
  if (!existing) {
    const error = new Error("Activity not found");
    error.statusCode = 404;
    error.errorCode = "ACTIVITY_NOT_FOUND";
    throw error;
  }

  // 2. Validate update data
  const validated = validateUpdateActivity(updateData);

  // 3. Update activity
  const updated = await activityRepository.updateActivity(id, validated);
  return updated;
};

const updateProgress = async (id, progressData) => {
  if (!id) {
    const error = new Error("Activity ID is required");
    error.statusCode = 400;
    error.errorCode = "VALIDATION_ERROR";
    throw error;
  }

  // 1. Verify activity exists
  const existing = await activityRepository.findActivityById(id);
  if (!existing) {
    const error = new Error("Activity not found");
    error.statusCode = 404;
    error.errorCode = "ACTIVITY_NOT_FOUND";
    throw error;
  }

  // 2. Validate progress update
  const validated = validateProgressUpdate(progressData);

  // 3. Update progress in database
  const updated = await activityRepository.updateProgress(id, validated);
  return updated;
};

const extendActivity = async (id, extensionData) => {
  if (!id) {
    const error = new Error("Activity ID is required");
    error.statusCode = 400;
    error.errorCode = "VALIDATION_ERROR";
    throw error;
  }

  // 1. Verify activity exists
  const existing = await activityRepository.findActivityById(id);
  if (!existing) {
    const error = new Error("Activity not found");
    error.statusCode = 404;
    error.errorCode = "ACTIVITY_NOT_FOUND";
    throw error;
  }

  // 2. Validate extension payload
  const validated = validateExtension(extensionData);

  const payload = {
    original_end_time: existing.end_time,
    extension_duration: validated.extension_duration,
    new_end_time: validated.new_end_time || existing.end_time,
  };

  // 3. Extend activity in database
  const updated = await activityRepository.extendActivity(id, payload);
  return updated;
};

const deleteActivity = async (id) => {
  if (!id) {
    const error = new Error("Activity ID is required");
    error.statusCode = 400;
    error.errorCode = "VALIDATION_ERROR";
    throw error;
  }

  // 1. Verify activity exists
  const existing = await activityRepository.findActivityById(id);
  if (!existing) {
    const error = new Error("Activity not found");
    error.statusCode = 404;
    error.errorCode = "ACTIVITY_NOT_FOUND";
    throw error;
  }

  // 2. Delete activity
  const deleted = await activityRepository.deleteActivity(id);
  return deleted;
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
