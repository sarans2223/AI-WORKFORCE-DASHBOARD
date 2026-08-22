const teamController = require("../controllers/teamController");

const handleTeamRoutes = async (req, res, pathName, method, queryParams = {}) => {
  // 1. Exact match /api/teams
  if (pathName === "/api/teams" || pathName === "/api/teams/") {
    if (method === "GET") {
      await teamController.getAllTeams(req, res);
      return true;
    }
    if (method === "POST") {
      await teamController.createTeam(req, res);
      return true;
    }
  }

  // 2. Exact match /api/project-updates
  if (pathName === "/api/project-updates" || pathName === "/api/project-updates/") {
    if (method === "GET") {
      await teamController.getProjectUpdates(req, res, queryParams);
      return true;
    }
    if (method === "POST") {
      await teamController.createProjectUpdate(req, res);
      return true;
    }
  }

  // 2b. /api/project-updates/:id/progress
  if (pathName.startsWith("/api/project-updates/")) {
    const segment = pathName.substring("/api/project-updates/".length);
    const parts = segment.split("/").filter(Boolean);
    if (parts.length === 2 && parts[1] === "progress") {
      const updateId = decodeURIComponent(parts[0]);
      if (method === "PATCH" || method === "POST") {
        await teamController.updateProjectProgress(req, res, updateId);
        return true;
      }
    }
  }

  // 3. Parametrized matches starting with /api/teams/
  if (pathName.startsWith("/api/teams/")) {
    const segment = pathName.substring("/api/teams/".length);
    const parts = segment.split("/").filter(Boolean);

    // /api/teams/student/:studentId
    if (parts[0] === "student" && parts.length === 2) {
      const studentId = decodeURIComponent(parts[1]);
      if (method === "GET") {
        await teamController.getTeamByStudentId(req, res, studentId);
        return true;
      }
    }

    // /api/teams/:id/repo
    if (parts.length === 2 && parts[1] === "repo") {
      const teamId = decodeURIComponent(parts[0]);
      if (method === "PATCH" || method === "POST") {
        await teamController.updateTeamRepo(req, res, teamId);
        return true;
      }
    }

    // /api/teams/:id/progress
    if (parts.length === 2 && parts[1] === "progress") {
      const teamId = decodeURIComponent(parts[0]);
      if (method === "PATCH" || method === "POST") {
        await teamController.updateTeamProgress(req, res, teamId);
        return true;
      }
    }

    // /api/teams/:id/status or /api/teams/:id/complete
    if (parts.length === 2 && (parts[1] === "status" || parts[1] === "complete")) {
      const teamId = decodeURIComponent(parts[0]);
      if (method === "PATCH" || method === "POST") {
        await teamController.updateTeamStatus(req, res, teamId);
        return true;
      }
    }


    // /api/teams/:id/members
    if (parts.length === 2 && parts[1] === "members") {
      const teamId = decodeURIComponent(parts[0]);
      if (method === "POST") {
        await teamController.addTeamMember(req, res, teamId);
        return true;
      }
    }

    // /api/teams/:id/members/:studentId
    if (parts.length === 3 && parts[1] === "members") {
      const teamId = decodeURIComponent(parts[0]);
      const studentId = decodeURIComponent(parts[2]);
      if (method === "DELETE") {
        await teamController.removeTeamMember(req, res, teamId, studentId);
        return true;
      }
    }

    // /api/teams/:id
    if (parts.length === 1) {
      const teamId = decodeURIComponent(parts[0]);
      if (method === "GET") {
        await teamController.getTeamById(req, res, teamId);
        return true;
      }
    }
  }

  return false;
};

module.exports = handleTeamRoutes;

