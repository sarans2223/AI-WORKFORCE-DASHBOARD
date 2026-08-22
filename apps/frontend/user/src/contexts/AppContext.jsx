import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { assignedTaskService } from '../services/assignedTaskService'
import { projectService } from '../services/projectService'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [notifications, setNotifications] = useState([])
  const [toasts, setToasts] = useState([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isInitialLoad = useRef(true)
  const previousIds = useRef(new Set())

  // Keep track of read notifications in localStorage
  const [readIds, setReadIds] = useState(() => {
    try {
      const stored = localStorage.getItem('read_notif_ids')
      return stored ? new Set(JSON.parse(stored)) : new Set()
    } catch {
      return new Set()
    }
  })

  const addToast = useCallback((toast) => {
    setToasts(prev => [...prev, toast])
    // Auto-remove toast after 4 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== toast.id))
    }, 4000)
  }, [])

  const syncNotifications = useCallback(async () => {
    try {
      // 1. Fetch live full-stack data
      const [tasks, project, updates] = await Promise.all([
        assignedTaskService.getAll(),
        projectService.get(),
        projectService.getUpdates()
      ])

      const list = []

      // 2. Map Assigned Tasks to notifications
      if (tasks && tasks.length > 0) {
        tasks.forEach(t => {
          list.push({
            id: `task-${t.id}`,
            type: 'schedule',
            title: 'Task Assigned',
            message: `Task "${t.title}" was assigned to you by ${t.assignedBy}.`,
            time: t.dueDate,
            timestamp: new Date(t.dueDate).getTime() || Date.now()
          })
        })
      }

      // 3. Map Project Assignment to notification
      if (project && project.id) {
        list.push({
          id: `project-${project.id}`,
          type: 'system',
          title: 'Project Assigned',
          message: `You have been assigned to team: ${project.title} (Lead: ${project.lead}).`,
          time: 'Recently',
          timestamp: Date.now() - 3600000 // Mock timestamp 1 hour ago
        })
      }

      // 4. Map Project Updates to notifications
      if (updates && updates.length > 0) {
        updates.forEach(u => {
          list.push({
            id: `update-${u.id}`,
            type: 'activity',
            title: 'New Project Update',
            message: `${u.author} posted a new update: "${u.content}"`,
            time: 'Recently',
            timestamp: new Date(u.timestamp).getTime() || Date.now()
          })
        })
      }

      // Sort by newest timestamp
      list.sort((a, b) => b.timestamp - a.timestamp)

      // 5. Detect newly added items (popups/toasts)
      if (!isInitialLoad.current) {
        list.forEach(notif => {
          if (!previousIds.current.has(notif.id)) {
            // Trigger toast popup!
            addToast({
              id: notif.id,
              title: notif.title,
              message: notif.message,
              type: notif.type
            })
          }
        })
      }

      // 6. Update references
      const currentIds = new Set(list.map(n => n.id))
      previousIds.current = currentIds
      isInitialLoad.current = false

      // 7. Map read/unread status
      const mapped = list.map(n => ({
        ...n,
        read: readIds.has(n.id)
      }))

      setNotifications(mapped)
    } catch (e) {
      console.error('Failed to sync notifications', e)
    }
  }, [readIds, addToast])

  // Sync on mount and then poll every 6 seconds
  useEffect(() => {
    syncNotifications()
    const timer = setInterval(syncNotifications, 6000)
    return () => clearInterval(timer)
  }, [syncNotifications])

  const unreadCount = notifications.filter(n => !n.read).length

  const markAllRead = useCallback(() => {
    const allIds = notifications.map(n => n.id)
    setReadIds(prev => {
      const updated = new Set([...prev, ...allIds])
      localStorage.setItem('read_notif_ids', JSON.stringify(Array.from(updated)))
      return updated
    })
  }, [notifications])

  const markRead = useCallback((id) => {
    setReadIds(prev => {
      const updated = new Set(prev)
      updated.add(id)
      localStorage.setItem('read_notif_ids', JSON.stringify(Array.from(updated)))
      return updated
    })
  }, [])

  return (
    <AppContext.Provider value={{
      notifications,
      unreadCount,
      markAllRead,
      markRead,
      sidebarOpen,
      setSidebarOpen,
      toasts,
      syncNotifications
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
