import React, { createContext, useContext, useState } from 'react'
import { mockAdmin } from '../data/mockData'

const AdminAuthContext = createContext(null)

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null)

  const login = (credentials) => {
    // Accept any credentials for now
    setAdmin(mockAdmin)
    return true
  }

  const logout = () => {
    setAdmin(null)
  }

  return (
    <AdminAuthContext.Provider value={{ admin, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  return useContext(AdminAuthContext)
}
