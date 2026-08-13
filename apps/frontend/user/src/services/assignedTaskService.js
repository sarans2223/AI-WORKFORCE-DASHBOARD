import { mockAssignedTasks } from '../data/mockData'

const delay = (ms) => new Promise(res => setTimeout(res, ms))

export const assignedTaskService = {
  getAll: async () => {
    await delay(500)
    return [...mockAssignedTasks]
  },
  
  getPending: async () => {
    await delay(300)
    return mockAssignedTasks.filter(t => t.status === 'PENDING')
  }
}
