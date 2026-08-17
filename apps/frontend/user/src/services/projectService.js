import { mockProject } from '../data/mockData'

const delay = (ms = 100) => new Promise(res => setTimeout(res, ms))

const mockUpdates = [
  {
    id: 'upd-1',
    author: 'Rahul Verma',
    avatar: 'RV',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    content: 'Completed the wireframe design for the dashboard and sidebar navigation.'
  },
  {
    id: 'upd-2',
    author: 'Neha Singh',
    avatar: 'NS',
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    content: 'Setup Vite React structure and Tailwind CSS configuration.'
  }
]

export const projectService = {
  get: async () => {
    await delay(100)
    return mockProject
  },

  getUpdates: async () => {
    await delay(100)
    return [...mockUpdates]
  },

  addUpdate: async (data) => {
    await delay(100)
    const newUpd = {
      id: 'upd-' + Math.random().toString(36).substr(2, 9),
      author: data.author,
      avatar: data.author.split(' ').map(n => n[0]).join(''),
      timestamp: new Date().toISOString(),
      content: data.content
    }
    mockUpdates.unshift(newUpd)
    return newUpd
  }
}
