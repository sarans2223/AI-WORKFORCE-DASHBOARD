import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  Calendar, MapPin, Sparkles, FileText, LayoutDashboard
} from 'lucide-react'

const BOTTOM_NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/weekly-calendar', icon: Calendar, label: 'Weekly' },
  { to: '/movement-pass', icon: MapPin, label: 'Passes' },
  { to: '/p-skills', icon: Sparkles, label: 'P-Skills' },
  { to: '/leave', icon: FileText, label: 'Leave' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-nav z-30 safe-bottom lg:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {BOTTOM_NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-150 ${
                isActive
                  ? 'text-primary'
                  : 'text-text-secondary hover:text-primary'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1.5 rounded-xl transition-all duration-150 ${isActive ? 'bg-primary-light' : ''}`}>
                  <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.8} />
                </div>
                <span className="text-[10px] font-semibold">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
