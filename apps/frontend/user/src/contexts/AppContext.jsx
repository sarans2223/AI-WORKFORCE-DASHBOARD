import React, { createContext, useContext, useState, useCallback } from 'react'
import { mockNotifications } from '../data/mockData'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [notifications, setNotifications] = useState(mockNotifications)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const unreadCount = notifications.filter(n => !n.read).length

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }, [])

  const markRead = useCallback((id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }, [])

  return (
    <AppContext.Provider value={{
      notifications,
      unreadCount,
      markAllRead,
      markRead,
      sidebarOpen,
      setSidebarOpen,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
