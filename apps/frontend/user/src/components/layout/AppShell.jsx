import React, { useState } from 'react'
import { Outlet, Link } from 'react-router-dom'
import { Menu, Bell, LogOut } from 'lucide-react'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'
import NotificationPanel from '../common/NotificationPanel'
import { useAuth } from '../../contexts/AuthContext'
import { useApp } from '../../contexts/AppContext'

export default function AppShell() {
  const { user, logout } = useAuth()
  const { unreadCount, sidebarOpen, setSidebarOpen, toasts } = useApp()
  const [showNotifs, setShowNotifs] = useState(false)

  return (
    <div className="flex h-screen bg-background overflow-hidden relative">
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between flex-shrink-0 z-20">
          <div className="flex items-center gap-3">
            {/* Hamburger — mobile */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl hover:bg-primary-light text-text-secondary hover:text-primary transition-colors"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            {/* Greeting */}
            <div className="hidden sm:block">
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notifications */}
            <div className="relative">
              <button
                id="notifications-btn"
                onClick={() => setShowNotifs(v => !v)}
                className="relative p-2 rounded-xl hover:bg-primary-light text-text-secondary hover:text-primary transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              {showNotifs && (
                <NotificationPanel onClose={() => setShowNotifs(false)} />
              )}
            </div>

            {/* Logout */}
            <button
              onClick={logout}
              className="p-2 rounded-xl hover:bg-danger-soft text-text-secondary hover:text-red-600 transition-colors"
              aria-label="Logout"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>

            {/* Avatar */}
            <Link 
              to="/profile" 
              className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:shadow-md transition-shadow"
              aria-label="Go to Profile"
            >
              {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'S'}
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
          <div className="w-full px-4 py-6 lg:px-6 lg:py-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <BottomNav />

      {/* Floating Toast Popups Container */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none w-full max-w-sm">
        {toasts.map(toast => (
          <div 
            key={toast.id} 
            className="bg-white border-2 border-primary/20 rounded-2xl shadow-modal p-4 flex items-start gap-3 pointer-events-auto animate-scale-in"
          >
            <div className="w-8 h-8 rounded-full bg-primary-light text-primary flex items-center justify-center flex-shrink-0">
              <Bell className="w-4.5 h-4.5" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-text-primary">{toast.title}</p>
              <p className="text-[10px] font-semibold text-text-secondary mt-0.5 leading-normal">{toast.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
