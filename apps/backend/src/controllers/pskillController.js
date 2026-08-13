const pskillService = require("../services/pskillService");
const { parseJSONBody, sendSuccess } = require("../utils/response");
const { handleError } = require("../middleware/errorMiddleware");

/**
 * Controller for P-Skills Management APIs
 */

/* ─────────────────────────────────────────────
   P-SKILL CATALOG
───────────────────────────────────────────── */

const getAllPSkills = async (req, res) => {
  try {
    const result = await pskillService.getAllPSkills();
    return sendSuccess(res, 200, "P-Skills retrieved successfully", result);
  } catch (err) {
    handleError(err, req, res);
  }
};

const getPSkillById = async (req, res, id) => {
  try {
    const result = await pskillService.getPSkillById(id);
    return sendSuccess(res, 200, "P-Skill retrieved successfully", result);
  } catch (err) {
    handleError(err, req, res);
  }
};

/* ─────────────────────────────────────────────
   P-SKILL SLOTS
───────────────────────────────────────────── */

const getAllPSkillSlots = async (req, res) => {
  try {
    const result = await pskillService.getAllPSkillSlots();
    return sendSuccess(res, 200, "P-Skill slots retrieved successfully", result);
  } catch (err) {
    handleError(err, req, res);
  }
};

/* ─────────────────────────────────────────────
   STUDENT P-SKILL ASSIGNMENTS
───────────────────────────────────────────── */

const getStudentPSkills = async (req, res, queryParams = {}) => {
  try {
    const studentId = queryParams.student_id;
    if (!studentId) {
      const { sendError } = require("../utils/response");
      return sendError(res, 400, "student_id query parameter is required", "VALIDATION_ERROR");
    }
    const result = await pskillService.getStudentPSkills(studentId);
    return sendSuccess(res, 200, "Student P-Skills retrieved successfully", result);
  } catch (err) {
    handleError(err, req, res);
  }
};

const assignPSkill = async (req, res) => {
  try {
    const body = await parseJSONBody(req);
    const result = await pskillService.assignPSkill(body);
    return sendSuccess(res, 201, "P-Skill assigned successfully", result);
  } catch (err) {
    handleError(err, req, res);
  }
};

const updateStudentPSkill = async (req, res, id) => {
  try {
    const body = await parseJSONBody(req);
    const result = await pskillService.updateStudentPSkill(id, body);
    return sendSuccess(res, 200, "P-Skill assignment updated successfully", result);
  } catch (err) {
    handleError(err, req, res);
  }
};

const removeStudentPSkill = async (req, res, id) => {
  try {
    const result = await pskillService.removeStudentPSkill(id);
    return sendSuccess(res, 200, "P-Skill assignment removed successfully", result);
  } catch (err) {
    handleError(err, req, res);
  }
};

module.exports = {
  getAllPSkills,
  getPSkillById,
  getAllPSkillSlots,
  getStudentPSkills,
  assignPSkill,
  updateStudentPSkill,
  removeStudentPSkill,
};
