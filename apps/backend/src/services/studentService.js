const studentRepository = require("../repositories/studentRepository");
const userRepository = require("../repositories/userRepository");
const { validateCreateStudent, validateUpdateStudent } = require("../validators/studentValidator");
const bcrypt = require("bcryptjs");

/**
 * Service handling Student Management business logic
 */

const createStudent = async (studentData) => {
  // 1. Validate payload inputs
  const validated = validateCreateStudent(studentData);

  // 2. Check for duplicate Student ID (STRICT REQUIREMENT: NEVER generate Student ID, reject duplicates)
  const existingId = await studentRepository.findStudentByStudentId(validated.student_id);
  if (existingId) {
    const error = new Error("Student ID already exists");
    error.statusCode = 409;
    error.errorCode = "DUPLICATE_STUDENT_ID";
    throw error;
  }

  // 3. Check for duplicate Roll Number
  const existingRoll = await studentRepository.findStudentByRollNumber(validated.roll_number);
  if (existingRoll) {
    const error = new Error("Roll number already exists");
    error.statusCode = 409;
    error.errorCode = "DUPLICATE_ROLL_NUMBER";
    throw error;
  }

  // 4. Check for duplicate Email
  const existingEmail = await studentRepository.findStudentByEmail(validated.email);
  if (existingEmail) {
    const error = new Error("Email already exists");
    error.statusCode = 409;
    error.errorCode = "DUPLICATE_EMAIL";
    throw error;
  }

  // 5. Save to PostgreSQL database
  const createdStudent = await studentRepository.createStudent(validated);

  // 6. Automatically generate user login credentials using roll number (register_number) as password
  const passwordHash = await bcrypt.hash(createdStudent.register_number, 10);
  await userRepository.createUser({
    email: createdStudent.email,
    password: passwordHash,
    role: "STUDENT",
    studentId: createdStudent.id
  });

  return createdStudent;
};

const getAllStudents = async () => {
  const students = await studentRepository.findAllStudents();
  return students || [];
};

const getStudentById = async (id) => {
  if (!id || typeof id !== "string" || !id.trim()) {
    const error = new Error("Student ID is required");
    error.statusCode = 400;
    error.errorCode = "VALIDATION_ERROR";
    throw error;
  }

  const student = await studentRepository.findStudentById(id.trim());
  if (!student) {
    const error = new Error("Student not found");
    error.statusCode = 404;
    error.errorCode = "STUDENT_NOT_FOUND";
    throw error;
  }

  return student;
};

const updateStudent = async (id, updateData) => {
  if (!id || typeof id !== "string" || !id.trim()) {
    const error = new Error("Student ID is required");
    error.statusCode = 400;
    error.errorCode = "VALIDATION_ERROR";
    throw error;
  }

  const sanitizedId = id.trim();

  // 1. Verify student exists
  const existingStudent = await studentRepository.findStudentById(sanitizedId);
  if (!existingStudent) {
    const error = new Error("Student not found");
    error.statusCode = 404;
    error.errorCode = "STUDENT_NOT_FOUND";
    throw error;
  }

  // 2. Validate update data
  const validated = validateUpdateStudent(updateData);

  // 3. Check duplicate roll number if changed
  if (validated.roll_number && validated.roll_number !== existingStudent.roll_number) {
    const duplicateRoll = await studentRepository.findStudentByRollNumber(validated.roll_number);
    if (duplicateRoll) {
      const error = new Error("Roll number already exists");
      error.statusCode = 409;
      error.errorCode = "DUPLICATE_ROLL_NUMBER";
      throw error;
    }
  }

  // 4. Check duplicate email if changed
  if (validated.email && validated.email !== existingStudent.email) {
    const duplicateEmail = await studentRepository.findStudentByEmail(validated.email);
    if (duplicateEmail) {
      const error = new Error("Email already exists");
      error.statusCode = 409;
      error.errorCode = "DUPLICATE_EMAIL";
      throw error;
    }
  }

  // 5. Update in database
  const updatedStudent = await studentRepository.updateStudent(sanitizedId, validated);
  return updatedStudent;
};

const deleteStudent = async (id) => {
  if (!id || typeof id !== "string" || !id.trim()) {
    const error = new Error("Student ID is required");
    error.statusCode = 400;
    error.errorCode = "VALIDATION_ERROR";
    throw error;
  }

  const sanitizedId = id.trim();

  // 1. Verify student exists
  const existingStudent = await studentRepository.findStudentById(sanitizedId);
  if (!existingStudent) {
    const error = new Error("Student not found");
    error.statusCode = 404;
    error.errorCode = "STUDENT_NOT_FOUND";
    throw error;
  }

  // 2. Delete from database
  const deletedStudent = await studentRepository.deleteStudent(sanitizedId);
  return deletedStudent;
};

module.exports = {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
};
