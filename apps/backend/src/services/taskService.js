const taskRepository = require("../repositories/taskRepository");

const formatAdminName = (email) => {
  if (!email) return 'Admin';
  if (email.includes('@')) {
    const part = email.split('@')[0];
    return part.charAt(0).toUpperCase() + part.slice(1);
  }
  return email;
};

const getTasksByStudentId = async (studentId) => {
  return await taskRepository.findTasksByStudentId(studentId);
};

const getAllTasks = async () => {
  const list = await taskRepository.findAllTasks();
  
  const groups = {};
  list.forEach(item => {
    const dateStr = item.due_date ? new Date(item.due_date).toISOString().split('T')[0] : '';
    const key = `${item.title}_${dateStr}`;
    
    if (!groups[key]) {
      groups[key] = {
        id: `ATASK-${item.id}`,
        title: item.title,
        description: item.description,
        assignedOn: item.created_at ? new Date(item.created_at).toISOString().split('T')[0] : '',
        dueDate: dateStr,
        assignedBy: formatAdminName(item.assigned_by),
        studentStatuses: []
      };
    }
    
    groups[key].studentStatuses.push({
      studentId: String(item.student_id),
      name: item.student_name,
      registerNumber: item.student_register_number,
      status: item.status
    });
  });
  
  return Object.values(groups);
};

const createTaskAssignment = async (data) => {
  if (Array.isArray(data.studentStatuses)) {
    const results = [];
    for (const statusObj of data.studentStatuses) {
      const assignment = await taskRepository.createTaskAssignment({
        student_id: statusObj.studentId,
        title: data.title,
        description: data.description,
        due_date: data.dueDate,
        assigned_by: data.assigned_by || data.assignedBy
      });
      results.push(assignment);
    }
    return results;
  } else {
    return await taskRepository.createTaskAssignment({
      student_id: data.student_id,
      title: data.title,
      description: data.description,
      due_date: data.due_date,
      assigned_by: data.assigned_by
    });
  }
};

const updateTaskStatus = async (id, status) => {
  return await taskRepository.updateTaskStatus(id, status);
};

module.exports = {
  getTasksByStudentId,
  getAllTasks,
  createTaskAssignment,
  updateTaskStatus
};
