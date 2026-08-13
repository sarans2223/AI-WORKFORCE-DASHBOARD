import { mockProfile } from '../data/mockData'

let currentUser = null

export const authService = {
  login: async (email, password) => {
    // Mock auth — replace with api.post('/auth/login', { email, password })
    await new Promise(r => setTimeout(r, 800))
    if (email === 'priya@college.edu' && password === 'student123') {
      currentUser = { ...mockProfile, token: 'mock-jwt-token' }
      localStorage.setItem('student_token', currentUser.token)
      localStorage.setItem('student_user', JSON.stringify(currentUser))
      return currentUser
    }
    throw new Error('Invalid email or password')
  },

  logout: () => {
    currentUser = null
    localStorage.removeItem('student_token')
    localStorage.removeItem('student_user')
  },

  getCurrentUser: () => {
    if (currentUser) return currentUser
    const stored = localStorage.getItem('student_user')
    if (stored) {
      currentUser = JSON.parse(stored)
      return currentUser
    }
    return null
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('student_token')
  },
}
