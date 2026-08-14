import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, FileText, MapPin, LogOut,
  Menu, X, ClipboardCheck, ClipboardList
} from 'lucide-react'

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/attendance', icon: ClipboardCheck, label: 'Attendance' },
  { to: '/assign', icon: ClipboardList, label: 'Assign' },
  { to: '/students', icon: Users, label: 'Students' },
  { to: '/passes', icon: MapPin, label: 'Movement Pass' },
  { to: '/leaves', icon: FileText, label: 'Leaves' },
]

const BOTTOM_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/attendance', icon: ClipboardCheck, label: 'Attendance' },
  { to: '/assign', icon: ClipboardList, label: 'Assign' },
  { to: '/students', icon: Users, label: 'Students' },
]

export default function AdminShell({ children, adminName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = () => {
    navigate('/login')
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-sidebar shadow-sidebar z-40 flex flex-col transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 lg:z-auto lg:flex-shrink-0`}
      >
        {/* Logo */}
        <div className="px-6 py-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-white font-black text-sm">AI</span>
            </div>
            <div>
              <p className="text-white font-black text-sm leading-tight">AI Workforce</p>
              <p className="text-white/50 text-xs">Admin Portal</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => isActive ? 'nav-item-active' : 'nav-item'}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Admin info + Logout */}
        <div className="px-4 py-5 border-t border-white/10">
          <div className="flex items-center gap-3 mb-4 px-1">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-xs">{adminName?.charAt(0) || 'A'}</span>
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-semibold truncate">{adminName || 'Admin'}</p>
              <p className="text-white/40 text-[10px]">Faculty Coordinator</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="nav-item w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Bar */}
        <header className="bg-card border-b border-gray-100 px-4 sm:px-8 py-4 flex items-center justify-between flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 rounded-xl bg-background text-text-secondary hover:text-primary transition-colors"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs text-text-muted font-medium hidden sm:block">Live</span>
          </div>
        </header>

        {/* Page Content with bottom spacing to account for bottom navigation bar */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-background pb-20 lg:pb-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Hidden on Desktop) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100/80 flex items-center justify-around py-1 z-40 lg:hidden shadow-lg safe-bottom">
        {BOTTOM_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => 
              `flex flex-col items-center gap-0.5 py-0.5 px-3 min-w-[70px] select-none transition-all duration-200
               ${isActive ? 'text-primary' : 'text-text-muted hover:text-text-secondary'}`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300
                  ${isActive ? 'bg-primary-light text-primary shadow-xs' : 'bg-transparent text-text-muted'}`}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <span className="text-[9px] font-extrabold tracking-wide transition-colors">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  )
}
