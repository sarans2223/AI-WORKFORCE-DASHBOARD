// activityService.js
// All functions currently operate on in-memory mock state.
// To connect to a real API, replace each function body with an api.* call.

import { mockActivities } from '../data/mockData'
import { format } from 'date-fns'

let activities = [...mockActivities]

const delay = (ms = 300) => new Promise(r => setTimeout(r, ms))

const computeStatus = (activity) => {
  const now = new Date()
  const dateStr = format(now, 'yyyy-MM-dd')
  const currentTime = format(now, 'HH:mm')

  if (activity.date < dateStr) return 'COMPLETED'
  if (activity.date > dateStr) return 'PLANNED'

  const end = activity.extendedEndTime || activity.endTime
  if (currentTime >= end) return 'COMPLETED'
  if (currentTime >= activity.startTime) return 'IN_PROGRESS'
  return 'PLANNED'
}

export const activityService = {
  getAll: async () => {
    await delay()
    return activities.map(a => ({ ...a, status: computeStatus(a) }))
  },

  getByDate: async (dateStr) => {
    await delay()
    return activities
      .filter(a => a.date === dateStr)
      .map(a => ({ ...a, status: computeStatus(a) }))
  },

  getByDateRange: async (startDate, endDate) => {
    await delay()
    return activities
      .filter(a => a.date >= startDate && a.date <= endDate)
      .map(a => ({ ...a, status: computeStatus(a) }))
  },

  create: async (data) => {
    await delay()
    const newActivity = {
      id: `act-${Date.now()}`,
      extendedEndTime: null,
      extensionReason: null,
      ...data,
    }
    activities = [newActivity, ...activities]
    return { ...newActivity, status: computeStatus(newActivity) }
  },

  update: async (id, updates) => {
    await delay()
    activities = activities.map(a => a.id === id ? { ...a, ...updates } : a)
    const updated = activities.find(a => a.id === id)
    return { ...updated, status: computeStatus(updated) }
  },

  extendTime: async (id, extendedEndTime, reason) => {
    await delay()
    activities = activities.map(a =>
      a.id === id
        ? { ...a, extendedEndTime, extensionReason: reason }
        : a
    )
    const updated = activities.find(a => a.id === id)
    return { ...updated, status: computeStatus(updated) }
  },

  delete: async (id) => {
    await delay()
    activities = activities.filter(a => a.id !== id)
  },
}
