import { mockProfile } from '../data/mockData'

let profile = { ...mockProfile }
const delay = (ms = 300) => new Promise(r => setTimeout(r, ms))

export const profileService = {
  get: async () => {
    await delay()
    return { ...profile }
  },

  update: async (updates) => {
    await delay()
    // Only allowed fields: name, email, phone, github
    const { name, email, phone, github } = updates
    profile = { ...profile, name, email, phone, github }
    const stored = JSON.parse(localStorage.getItem('student_user') || '{}')
    localStorage.setItem('student_user', JSON.stringify({ ...stored, ...profile }))
    return { ...profile }
  },
}
