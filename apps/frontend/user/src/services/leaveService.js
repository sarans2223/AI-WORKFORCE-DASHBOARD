import { mockLeaves } from '../data/mockData'
import { format } from 'date-fns'

let leaves = [...mockLeaves]
const delay = (ms = 300) => new Promise(r => setTimeout(r, ms))

export const leaveService = {
  getAll: async () => {
    await delay()
    return [...leaves].sort((a, b) => b.submittedOn.localeCompare(a.submittedOn))
  },

  apply: async ({ startDate, endDate, reason, fromTime, toTime }) => {
    await delay()
    const newLeave = {
      id: `lv-${Date.now()}`,
      startDate,
      endDate,
      fromTime: fromTime || '',
      toTime: toTime || '',
      reason,
      submittedOn: format(new Date(), 'yyyy-MM-dd'),
    }
    leaves = [newLeave, ...leaves]
    return newLeave
  },
}
