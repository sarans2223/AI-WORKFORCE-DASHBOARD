import { mockStudents, mockTodayAttendance, mockLeaves, mockPasses, mockAdmin, mockAdminAssignedTasks, mockAttendanceHistory, getStudentActivityData, mockProjects, mockProjectUpdates } from '../data/mockData'

const delay = (ms) => new Promise(res => setTimeout(res, ms))

export const adminService = {
  getProfile: async () => {
    await delay(200)
    return { ...mockAdmin }
  },

  getStudents: async () => {
    await delay(300)
    return [...mockStudents]
  },

  addStudent: async (student) => {
    await delay(200)
    const newStudent = {
      id: `STU-${String(mockStudents.length + 1).padStart(3, '0')}`,
      name: student.name,
      registerNumber: student.registerNumber,
      email: student.email,
      phone: student.phone || '',
      github: student.github || ''
    }
    mockStudents.push(newStudent)
    
    // Auto-update active logs so new student exists in today's rosters
    mockTodayAttendance.forenoon.records.push({ studentId: newStudent.id, status: 'PRESENT' })
    mockTodayAttendance.afternoon.records.push({ studentId: newStudent.id, status: 'PRESENT' })
    return newStudent
  },

  addStudentsBulk: async (newStudents) => {
    await delay(400)
    newStudents.forEach((stu, idx) => {
      const newStudent = {
        id: `STU-${String(mockStudents.length + 1).padStart(3, '0')}`,
        name: stu.name,
        registerNumber: stu.registerNumber,
        email: stu.email,
        phone: stu.phone || '',
        github: stu.github || ''
      }
      mockStudents.push(newStudent)
      mockTodayAttendance.forenoon.records.push({ studentId: newStudent.id, status: 'PRESENT' })
      mockTodayAttendance.afternoon.records.push({ studentId: newStudent.id, status: 'PRESENT' })
    })
    return true
  },

  getTodayAttendance: async () => {
    await delay(300)
    return { ...mockTodayAttendance }
  },

  submitAttendance: async (session, records) => {
    await delay(500)
    mockTodayAttendance[session].records = records
    mockTodayAttendance[session].submitted = true
    return true
  },

  getLeaves: async () => {
    await delay(300)
    return [...mockLeaves]
  },

  getPasses: async () => {
    await delay(300)
    return [...mockPasses]
  },

  getAssignedTasks: async () => {
    await delay(300)
    return [...mockAdminAssignedTasks]
  },

  getAttendanceHistory: async () => {
    await delay(300)
    return [...mockAttendanceHistory]
  },

  getStudentActivity: async (studentId) => {
    await delay(300)
    return getStudentActivityData(studentId)
  },

  getProjects: async () => {
    await delay(300)
    return [...mockProjects]
  },

  addProject: async (project) => {
    await delay(300)
    const newProj = {
      id: project.id,
      name: project.name,
      description: project.description,
      members: project.members || [],
      assignedBy: mockAdmin.name
    }
    mockProjects.push(newProj)
    return newProj
  },

  addTask: async (task) => {
    await delay(300)
    const newTask = {
      id: `ATASK-${String(mockAdminAssignedTasks.length + 1).padStart(3, '0')}`,
      title: task.title,
      description: task.description,
      assignedOn: new Date().toISOString().split('T')[0],
      dueDate: task.dueDate,
      studentStatuses: task.studentStatuses || [],
      assignedBy: mockAdmin.name
    }
    mockAdminAssignedTasks.unshift(newTask)
    return newTask
  },

  removeProjectMember: async (projId, studentId) => {
    await delay(200)
    const proj = mockProjects.find(p => p.id === projId)
    if (proj) {
      proj.members = proj.members.filter(m => m !== studentId)
    }
    return proj
  },

  addProjectMembers: async (projId, studentIds) => {
    await delay(200)
    const proj = mockProjects.find(p => p.id === projId)
    if (proj) {
      studentIds.forEach(id => {
        if (!proj.members.includes(id)) {
          proj.members.push(id)
        }
      })
    }
    return proj
  },

  removeStudent: async (studentId) => {
    await delay(250)
    const idx = mockStudents.findIndex(s => s.id === studentId)
    if (idx !== -1) {
      mockStudents.splice(idx, 1)
    }
    // Clean up project memberships
    mockProjects.forEach(p => {
      p.members = p.members.filter(m => m !== studentId)
    })
    // Clean up today's attendance
    mockTodayAttendance.forenoon.records = mockTodayAttendance.forenoon.records.filter(r => r.studentId !== studentId)
    mockTodayAttendance.afternoon.records = mockTodayAttendance.afternoon.records.filter(r => r.studentId !== studentId)
    return true
  },

  getProjectUpdates: async () => {
    await delay(250)
    return [...mockProjectUpdates]
  },

  markUpdateAsRead: async (updateId) => {
    await delay(100)
    const update = mockProjectUpdates.find(u => u.id === updateId)
    if (update) {
      update.read = true
    }
    return true
  }
}
