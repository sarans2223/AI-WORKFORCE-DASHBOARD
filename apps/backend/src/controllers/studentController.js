const studentService = require("../services/studentService");
const { parseJSONBody, sendSuccess } = require("../utils/response");
const { handleError } = require("../middleware/errorMiddleware");

/**
 * Controller for Student Management APIs
 */

const createStudent = async (req, res) => {
  try {
    const body = await parseJSONBody(req);
    const result = await studentService.createStudent(body);
    return sendSuccess(res, 201, "Student created successfully", result);
  } catch (err) {
    handleError(err, req, res);
  }
};

const getAllStudents = async (req, res) => {
  try {
    const result = await studentService.getAllStudents();
    return sendSuccess(res, 200, "Students retrieved successfully", result);
  } catch (err) {
    handleError(err, req, res);
  }
};

const getStudentById = async (req, res, id) => {
  try {
    const result = await studentService.getStudentById(id);
    return sendSuccess(res, 200, "Student retrieved successfully", result);
  } catch (err) {
    handleError(err, req, res);
  }
};

const updateStudent = async (req, res, id) => {
  try {
    const body = await parseJSONBody(req);
    const result = await studentService.updateStudent(id, body);
    return sendSuccess(res, 200, "Student updated successfully", result);
  } catch (err) {
    handleError(err, req, res);
  }
};

const deleteStudent = async (req, res, id) => {
  try {
    const result = await studentService.deleteStudent(id);
    return sendSuccess(res, 200, "Student deleted successfully", result);
  } catch (err) {
    handleError(err, req, res);
  }
};

module.exports = {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
};
