const attendanceRepository = require("../repositories/attendanceRepository");
const studentRepository = require("../repositories/studentRepository");
const { validateCreateAttendance, validateUpdateAttendance } = require("../validators/attendanceValidator");

/**
 * Service for Attendance Management Business Logic
 */

const markAttendance = async (attendanceData) => {
  // 1. Validate payload inputs
  const validated = validateCreateAttendance(attendanceData);

  // 2. Verify referenced student exists in PostgreSQL
  const student = await studentRepository.findStudentByStudentId(validated.student_id);
  if (!student) {
    const error = new Error("Referenced student does not exist");
    error.statusCode = 404;
    error.errorCode = "STUDENT_NOT_FOUND";
    throw error;
  }

  // 3. Check for duplicate attendance record for the same student and date
  const existingRecord = await attendanceRepository.findAttendanceByStudentAndDate(
    validated.student_id,
    validated.date
  );
  if (existingRecord) {
    const error = new Error("Attendance already exists for this student and date");
    error.statusCode = 409;
    error.errorCode = "DUPLICATE_ATTENDANCE";
    throw error;
  }

  // 4. Save to PostgreSQL database
  const createdRecord = await attendanceRepository.createAttendance(validated);
  return createdRecord;
};

const getAttendanceRecords = async (filters = {}) => {
  const records = await attendanceRepository.findAttendanceRecords(filters);
  return records || [];
};

const getAttendanceById = async (id) => {
  if (!id) {
    const error = new Error("Attendance ID is required");
    error.statusCode = 400;
    error.errorCode = "VALIDATION_ERROR";
    throw error;
  }

  const record = await attendanceRepository.findAttendanceById(id);
  if (!record) {
    const error = new Error("Attendance record not found");
    error.statusCode = 404;
    error.errorCode = "ATTENDANCE_NOT_FOUND";
    throw error;
  }

  return record;
};

const updateAttendance = async (id, updateData) => {
  if (!id) {
    const error = new Error("Attendance ID is required");
    error.statusCode = 400;
    error.errorCode = "VALIDATION_ERROR";
    throw error;
  }

  // 1. Verify record exists
  const existingRecord = await attendanceRepository.findAttendanceById(id);
  if (!existingRecord) {
    const error = new Error("Attendance record not found");
    error.statusCode = 404;
    error.errorCode = "ATTENDANCE_NOT_FOUND";
    throw error;
  }

  // 2. Validate update data
  const validated = validateUpdateAttendance(updateData);

  // 3. Check for duplicate date if date is being updated to another date
  if (validated.date && validated.date !== existingRecord.date) {
    const duplicate = await attendanceRepository.findAttendanceByStudentAndDate(
      existingRecord.student_id,
      validated.date
    );
    if (duplicate) {
      const error = new Error("Attendance already exists for this student and date");
      error.statusCode = 409;
      error.errorCode = "DUPLICATE_ATTENDANCE";
      throw error;
    }
  }

  // 4. Update in database
  const updatedRecord = await attendanceRepository.updateAttendance(id, validated);
  return updatedRecord;
};

const deleteAttendance = async (id) => {
  if (!id) {
    const error = new Error("Attendance ID is required");
    error.statusCode = 400;
    error.errorCode = "VALIDATION_ERROR";
    throw error;
  }

  // 1. Verify record exists
  const existingRecord = await attendanceRepository.findAttendanceById(id);
  if (!existingRecord) {
    const error = new Error("Attendance record not found");
    error.statusCode = 404;
    error.errorCode = "ATTENDANCE_NOT_FOUND";
    throw error;
  }

  // 2. Delete from database
  const deletedRecord = await attendanceRepository.deleteAttendance(id);
  return deletedRecord;
};

module.exports = {
  markAttendance,
  getAttendanceRecords,
  getAttendanceById,
  updateAttendance,
  deleteAttendance,
};
