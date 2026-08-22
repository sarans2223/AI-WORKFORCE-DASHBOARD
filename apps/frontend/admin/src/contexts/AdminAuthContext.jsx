import React, { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../services/api'
import { mockAdmin } from '../data/mockData'

const AdminAuthContext = createContext(null)

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check localStorage
    const storedToken = localStorage.getItem('admin_token')
    const storedUser = localStorage.getItem('admin_user')
    if (storedToken && storedUser) {
      setAdmin(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    if (!email || !password) {
      throw new Error('Email and password are required')
    }
    
    // Call backend API for real login
    const response = await api.post('/auth/login', { email, password })
    const { token, user } = response.data

    if (user.role !== 'ADMIN') {
      throw new Error('Unauthorized: Only admin users are allowed.')
    }

    // Format display name from email if name is missing/empty
    const namePart = user.email.split('@')[0]
    const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1)
    const displayName = user.name || formattedName
    
    const adminUser = {
      ...user,
      name: displayName
    }

    localStorage.setItem('admin_token', token)
    localStorage.setItem('admin_user', JSON.stringify(adminUser))
    setAdmin(adminUser)
    return adminUser
  }

  const logout = () => {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
    setAdmin(null)
  }

  return (
    <AdminAuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  return useContext(AdminAuthContext)
}
