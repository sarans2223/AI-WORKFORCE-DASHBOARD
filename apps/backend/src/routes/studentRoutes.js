const studentController = require("../controllers/studentController");

/**
 * Route handler for Student Management endpoints
 */
const handleStudentRoutes = async (req, res, pathName, method) => {
  // 1. Exact match /api/students
  if (pathName === "/api/students" || pathName === "/api/students/") {
    if (method === "POST") {
      await studentController.createStudent(req, res);
      return true;
    }
    if (method === "GET") {
      await studentController.getAllStudents(req, res);
      return true;
    }
  }

  // 2. Parametrized match /api/students/:id
  if (pathName.startsWith("/api/students/")) {
    const idSegment = pathName.substring("/api/students/".length);
    const id = decodeURIComponent(idSegment);

    if (id && !id.includes("/")) {
      if (method === "GET") {
        await studentController.getStudentById(req, res, id);
        return true;
      }
      if (method === "PUT") {
        await studentController.updateStudent(req, res, id);
        return true;
      }
      if (method === "DELETE") {
        await studentController.deleteStudent(req, res, id);
        return true;
      }
    }
  }

  return false;
};

module.exports = handleStudentRoutes;
