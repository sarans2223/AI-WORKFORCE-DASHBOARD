import { mockProject } from '../data/mockData'

const delay = (ms) => new Promise(res => setTimeout(res, ms))

// In-memory store for project updates (seeded with mock updates)
let updates = []

export const projectService = {
  get: async () => {
    await delay(300)
    return mockProject
  },

  getUpdates: async () => {
    await delay(300)
    return [...updates].sort((a, b) => b.timestamp.localeCompare(a.timestamp))
  },

  addUpdate: async ({ author, role, content }) => {
    await delay(200)
    const newUpdate = {
      id: `upd-${Date.now()}`,
      projectId: 'PRJ-101',
      author,
      role,
      avatar: author.split(' ').map(n => n[0]).join(''),
      content,
      timestamp: new Date().toISOString()
    }
    updates = [newUpdate, ...updates]
    return newUpdate
  }
}

