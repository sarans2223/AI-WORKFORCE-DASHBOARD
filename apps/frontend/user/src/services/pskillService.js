import { mockPSkills } from '../data/mockData'

let pskills = [...mockPSkills]
const delay = (ms = 300) => new Promise(r => setTimeout(r, ms))

export const pskillService = {
  getAll: async () => {
    await delay()
    return [...pskills]
  },

  update: async (id, updates) => {
    await delay()
    pskills = pskills.map(s =>
      s.id === id ? { ...s, ...updates } : s
    )
    return pskills.find(s => s.id === id)
  },
}
