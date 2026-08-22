const leaveRepository = require("../repositories/leaveRepository");
const studentRepository = require("../repositories/studentRepository");
const { validateCreateLeave } = require("../validators/leaveValidator");

/**
 * Service for Leave Monitoring
 *
 * This application is MONITORING ONLY.
 *
 * The system:
 *  - Records leave information
 *  - Allows leave history to be viewed
 *  - Does NOT approve leave
 *  - Does NOT reject leave
 *  - Does NOT cancel leave
 *  - Does NOT edit leave
 *  - Does NOT block overlapping leave
 */

const applyForLeave = async (leaveData) => {
  // 1. Validate the submitted leave data
  const validated = validateCreateLeave(leaveData);

  // 2. Verify that the student exists
  const student = await studentRepository.findStudentByStudentId(
    validated.student_id
  );

  if (!student) {
    const error = new Error("Referenced student does not exist");
    error.statusCode = 404;
    error.errorCode = "STUDENT_NOT_FOUND";
    throw error;
  }

  // 3. Monitoring application:
  //    Do NOT check for overlapping leave.
  //    Every submitted leave record should simply be stored.

  // 4. Create the leave record
  const created =
    await leaveRepository.createLeaveApplication(validated);

  return created;
};


const getLeaveApplications = async (filters = {}) => {
  const records =
    await leaveRepository.findLeaveApplications(filters);

  return records || [];
};


const getLeaveById = async (id) => {
  if (!id) {
    const error = new Error(
      "Leave application ID is required"
    );

    error.statusCode = 400;
    error.errorCode = "VALIDATION_ERROR";

    throw error;
  }

  const record =
    await leaveRepository.findLeaveById(id);

  if (!record) {
    const error = new Error(
      "Leave application not found"
    );

    error.statusCode = 404;
    error.errorCode = "LEAVE_NOT_FOUND";

    throw error;
  }

  return record;
};


module.exports = {
  applyForLeave,
  getLeaveApplications,
  getLeaveById,
};