const teamRepository = require("../repositories/teamRepository");

const enrichTeamWithProgress = async (team) => {
  if (!team) return null;
  const members = await teamRepository.findTeamMembers(team.id);
  const memberProgresses = await teamRepository.getTeamMemberProgresses(team.id);
  
  let totalScore = 0;
  const count = memberProgresses.length;
  if (count > 0) {
    for (const mp of memberProgresses) {
      totalScore += Number(mp.latest_score || 0);
    }
  }
  const memberAverage = count > 0 ? Math.round(totalScore / count) : Number(team.progress || 0);

  return {
    ...team,
    members: members || [],
    member_average: memberAverage,
    member_progresses: memberProgresses || []
  };
};

const getTeamByStudentId = async (studentId) => {
  const allTeams = await teamRepository.findTeamsByStudentId(studentId);
  if (!allTeams || allTeams.length === 0) return null;
  
  const populatedTeams = [];
  for (const team of allTeams) {
    const enriched = await enrichTeamWithProgress(team);
    populatedTeams.push(enriched);
  }
  
  const latestTeam = populatedTeams[0];
  latestTeam.history = populatedTeams.slice(1);
  return latestTeam;
};

const getTeamById = async (id) => {
  const team = await teamRepository.findTeamById(id);
  if (!team) return null;
  return await enrichTeamWithProgress(team);
};

const getAllTeams = async () => {
  const teams = await teamRepository.findAllTeams();
  const list = [];
  for (const team of teams) {
    const enriched = await enrichTeamWithProgress(team);
    list.push(enriched);
  }
  return list;
};

const createTeam = async (data) => {
  return await teamRepository.createTeam(data);
};

const addTeamMember = async (teamId, studentId) => {
  return await teamRepository.addTeamMember(teamId, studentId);
};

const removeTeamMember = async (teamId, studentId) => {
  return await teamRepository.removeTeamMember(teamId, studentId);
};

const updateTeamRepo = async (teamId, gitRepo) => {
  return await teamRepository.updateTeamRepo(teamId, gitRepo);
};

const getProjectUpdates = async (teamId = null) => {
  if (teamId) {
    return await teamRepository.findProjectUpdates(teamId);
  }
  return await teamRepository.findAllProjectUpdates();
};

const createProjectUpdate = async (data) => {
  const { student_id, content, git_repo, student_progress } = data;

  if (!student_id) {
    const error = new Error("student_id is required");
    error.statusCode = 400;
    error.errorCode = "VALIDATION_ERROR";
    throw error;
  }

  if (!content || !String(content).trim()) {
    const error = new Error("content is required");
    error.statusCode = 400;
    error.errorCode = "VALIDATION_ERROR";
    throw error;
  }

  // Find the team that this student belongs to
  const team = await teamRepository.findTeamByStudentId(student_id);

  if (!team) {
    const error = new Error("Student is not assigned to a team");
    error.statusCode = 404;
    error.errorCode = "TEAM_NOT_FOUND";
    throw error;
  }

  // Automatically use the student's actual database team ID
  return await teamRepository.createProjectUpdate({
    student_id,
    team_id: team.id,
    content: String(content).trim(),
    git_repo: git_repo ? String(git_repo).trim() : null,
    student_progress: student_progress !== undefined && student_progress !== null ? Number(student_progress) : null
  });
};

const updateProjectProgress = async (updateId, data) => {
  const { progress, admin_feedback, reviewed_by } = data;
  return await teamRepository.updateUpdateProgress(updateId, {
    progress: progress !== undefined && progress !== null ? parseInt(progress, 10) : null,
    admin_feedback: admin_feedback ? String(admin_feedback).trim() : null,
    reviewed_by: reviewed_by || null
  });
};

const updateTeamProgress = async (teamId, progress) => {
  return await teamRepository.updateTeamProgress(teamId, progress);
};

const updateTeamStatus = async (teamId, status) => {
  const updated = await teamRepository.updateTeamStatus(teamId, status);
  if (!updated) return null;
  return await enrichTeamWithProgress(updated);
};

module.exports = {
  getTeamByStudentId,
  getTeamById,
  getAllTeams,
  createTeam,
  updateTeamRepo,
  updateTeamProgress,
  updateTeamStatus,
  addTeamMember,
  removeTeamMember,
  getProjectUpdates,
  createProjectUpdate,
  updateProjectProgress
};



