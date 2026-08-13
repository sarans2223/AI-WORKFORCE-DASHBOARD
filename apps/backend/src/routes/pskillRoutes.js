const pskillController = require("../controllers/pskillController");

/**
 * Route handler for P-Skills Management endpoints
 *
 * Routes:
 *   GET  /api/p-skills                   - Get all P-Skill catalog entries
 *   GET  /api/p-skills/:id               - Get a single P-Skill by ID
 *   GET  /api/p-skills/slots             - Get all available P-Skill time slots
 *   GET  /api/student-p-skills           - Get P-Skills assigned to a student (?student_id=...)
 *   POST /api/student-p-skills           - Assign a P-Skill to a student
 *   PUT  /api/student-p-skills/:id       - Update a student's P-Skill assignment
 *   DELETE /api/student-p-skills/:id     - Remove a P-Skill assignment from a student
 */
const handlePSkillRoutes = async (req, res, pathName, method, queryParams = {}) => {
  // ── P-SKILL CATALOG ─────────────────────────────────
  if (pathName === "/api/p-skills" || pathName === "/api/p-skills/") {
    if (method === "GET") {
      await pskillController.getAllPSkills(req, res);
      return true;
    }
  }

  // GET /api/p-skills/slots  (must come before /:id to avoid collision)
  if (pathName === "/api/p-skills/slots") {
    if (method === "GET") {
      await pskillController.getAllPSkillSlots(req, res);
      return true;
    }
  }

  // GET /api/p-skills/:id
  if (pathName.startsWith("/api/p-skills/")) {
    const idSegment = pathName.substring("/api/p-skills/".length);
    const parts = idSegment.split("/").filter(Boolean);

    if (parts.length === 1 && parts[0] !== "slots") {
      const id = decodeURIComponent(parts[0]);
      if (method === "GET") {
        await pskillController.getPSkillById(req, res, id);
        return true;
      }
    }
  }

  // ── STUDENT P-SKILL ASSIGNMENTS ─────────────────────
  if (pathName === "/api/student-p-skills" || pathName === "/api/student-p-skills/") {
    if (method === "GET") {
      await pskillController.getStudentPSkills(req, res, queryParams);
      return true;
    }
    if (method === "POST") {
      await pskillController.assignPSkill(req, res);
      return true;
    }
  }

  // PUT /api/student-p-skills/:id  and  DELETE /api/student-p-skills/:id
  if (pathName.startsWith("/api/student-p-skills/")) {
    const idSegment = pathName.substring("/api/student-p-skills/".length);
    const parts = idSegment.split("/").filter(Boolean);

    if (parts.length === 1) {
      const id = decodeURIComponent(parts[0]);
      if (method === "PUT") {
        await pskillController.updateStudentPSkill(req, res, id);
        return true;
      }
      if (method === "DELETE") {
        await pskillController.removeStudentPSkill(req, res, id);
        return true;
      }
    }
  }

  return false;
};

module.exports = handlePSkillRoutes;
