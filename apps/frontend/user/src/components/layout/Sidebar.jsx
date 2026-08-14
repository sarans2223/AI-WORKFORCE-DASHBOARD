import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, CalendarDays, BarChart3, Sparkles,
  ClipboardCheck, MapPin, FileText, User, Calendar, X
} from 'lucide-react'

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/daily-plan', icon: CalendarDays, label: 'Daily Plan' },
  { to: '/weekly-calendar', icon: Calendar, label: 'Weekly Calendar' },
  { to: '/movement-pass', icon: MapPin, label: 'Movement Pass' },
  { to: '/p-skills', icon: Sparkles, label: 'P-Skills' },
  { to: '/attendance', icon: ClipboardCheck, label: 'Attendance' },
  { to: '/leave', icon: FileText, label: 'Leave' },
  { to: '/profile', icon: User, label: 'Profile' },
]

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-white z-50 flex flex-col
          shadow-modal transition-transform duration-300 ease-in-out
          lg:static lg:translate-x-0 lg:shadow-none lg:border-r lg:border-gray-100
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-text-primary">AI Workforce</p>
              <p className="text-xs text-text-secondary">Management Portal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 text-text-secondary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                isActive ? 'nav-item-active' : 'nav-item'
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-gray-100">
          <p className="text-xs text-text-muted text-center">AI Workforce v1.0</p>
        </div>
      </aside>
    </>
  )
}
