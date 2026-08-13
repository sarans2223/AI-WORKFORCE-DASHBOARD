import { mockAttendance } from '../data/mockData'

const delay = (ms = 300) => new Promise(r => setTimeout(r, ms))

export const attendanceService = {
  getAll: async () => {
    await delay()
    return [...mockAttendance]
  },

  getSummary: async () => {
    await delay()
    const total = mockAttendance.length
    const present = mockAttendance.filter(a => a.status === 'PRESENT').length
    const absent = total - present
    return {
      total,
      present,
      absent,
      percentage: total > 0 ? Math.round((present / total) * 100) : 0,
    }
  },
}
