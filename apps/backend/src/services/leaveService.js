const leaveRepository = require("../repositories/leaveRepository");
const studentRepository = require("../repositories/studentRepository");
const { validateCreateLeave, validateUpdateLeave } = require("../validators/leaveValidator");

/**
 * Service for Leave Management Business Logic
 *
 * Per project spec:
 *  - Students apply for leave (no admin approval/rejection workflow for now)
 *  - Students can view their leave history
 *  - Overlapping non-cancelled leave is rejected
 *  - Students can cancel a PENDING leave application
 *  - PENDING applications can be edited before action
 */

const applyForLeave = async (leaveData) => {
  // 1. Validate payload
  const validated = validateCreateLeave(leaveData);

  // 2. Verify student exists
  const student = await studentRepository.findStudentByStudentId(validated.student_id);
  if (!student) {
    const error = new Error("Referenced student does not exist");
    error.statusCode = 404;
    error.errorCode = "STUDENT_NOT_FOUND";
    throw error;
  }

  // 3. Check for overlapping leave (excluding CANCELLED records)
  const overlap = await leaveRepository.findOverlappingLeave(
    validated.student_id,
    validated.start_date,
    validated.end_date
  );
  if (overlap) {
    const error = new Error(
      `Leave already exists for the selected dates (conflicts with leave ID ${overlap.id})`
    );
    error.statusCode = 409;
    error.errorCode = "LEAVE_CONFLICT";
    throw error;
  }

  // 4. Create leave application in PostgreSQL with status = PENDING
  const created = await leaveRepository.createLeaveApplication(validated);
  return created;
};

const getLeaveApplications = async (filters = {}) => {
  const records = await leaveRepository.findLeaveApplications(filters);
  return records || [];
};

const getLeaveById = async (id) => {
  if (!id) {
    const error = new Error("Leave application ID is required");
    error.statusCode = 400;
    error.errorCode = "VALIDATION_ERROR";
    throw error;
  }

  const record = await leaveRepository.findLeaveById(id);
  if (!record) {
    const error = new Error("Leave application not found");
    error.statusCode = 404;
    error.errorCode = "LEAVE_NOT_FOUND";
    throw error;
  }

  return record;
};

const updateLeaveApplication = async (id, updateData) => {
  if (!id) {
    const error = new Error("Leave application ID is required");
    error.statusCode = 400;
    error.errorCode = "VALIDATION_ERROR";
    throw error;
  }

  // 1. Verify record exists
  const existing = await leaveRepository.findLeaveById(id);
  if (!existing) {
    const error = new Error("Leave application not found");
    error.statusCode = 404;
    error.errorCode = "LEAVE_NOT_FOUND";
    throw error;
  }

  // 2. Only PENDING leave can be edited
  if (existing.status !== "PENDING") {
    const error = new Error(
      `Cannot update a leave application with status '${existing.status}'. Only PENDING applications can be edited.`
    );
    error.statusCode = 409;
    error.errorCode = "LEAVE_STATUS_CONFLICT";
    throw error;
  }

  // 3. Validate update fields
  const validated = validateUpdateLeave(updateData);

  // 4. Resolve effective dates for overlap check
  const effectiveStart = validated.start_date || existing.start_date;
  const effectiveEnd   = validated.end_date   || existing.end_date;

  // 5. If dates changed, check for overlap with other records (excluding self)
  if (validated.start_date || validated.end_date) {
    const overlap = await leaveRepository.findOverlappingLeave(
      existing.student_id,
      effectiveStart,
      effectiveEnd
    );
    if (overlap && String(overlap.id) !== String(id)) {
      const error = new Error(
        `Leave already exists for the selected dates (conflicts with leave ID ${overlap.id})`
      );
      error.statusCode = 409;
      error.errorCode = "LEAVE_CONFLICT";
      throw error;
    }
  }

  // 6. Update in database
  const updated = await leaveRepository.updateLeaveApplication(id, validated);
  return updated;
};

const cancelLeaveApplication = async (id) => {
  if (!id) {
    const error = new Error("Leave application ID is required");
    error.statusCode = 400;
    error.errorCode = "VALIDATION_ERROR";
    throw error;
  }

  // 1. Verify record exists
  const existing = await leaveRepository.findLeaveById(id);
  if (!existing) {
    const error = new Error("Leave application not found");
    error.statusCode = 404;
    error.errorCode = "LEAVE_NOT_FOUND";
    throw error;
  }

  // 2. Only PENDING leave can be cancelled
  if (existing.status === "CANCELLED") {
    const error = new Error("Leave application is already cancelled");
    error.statusCode = 409;
    error.errorCode = "LEAVE_ALREADY_CANCELLED";
    throw error;
  }

  // 3. Cancel in database (soft delete — status set to CANCELLED)
  const cancelled = await leaveRepository.cancelLeaveApplication(id);
  return cancelled;
};

module.exports = {
  applyForLeave,
  getLeaveApplications,
  getLeaveById,
  updateLeaveApplication,
  cancelLeaveApplication,
};
