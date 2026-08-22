const taskController = require("../controllers/taskController");

const handleTaskRoutes = async (req, res, pathName, method, queryParams = {}) => {
  // 1. Exact match /api/assigned-tasks
  if (pathName === "/api/assigned-tasks" || pathName === "/api/assigned-tasks/") {
    if (method === "GET") {
      await taskController.getTasks(req, res, queryParams);
      return true;
    }
    if (method === "POST") {
      await taskController.createTask(req, res);
      return true;
    }
  }

  // 2. Parametrized match /api/assigned-tasks/:id
  if (pathName.startsWith("/api/assigned-tasks/")) {
    const idSegment = pathName.substring("/api/assigned-tasks/".length);
    const id = decodeURIComponent(idSegment);

    if (id && !id.includes("/")) {
      if (method === "PUT") {
        await taskController.updateTaskStatus(req, res, id);
        return true;
      }
    }
  }

  return false;
};

module.exports = handleTaskRoutes;
