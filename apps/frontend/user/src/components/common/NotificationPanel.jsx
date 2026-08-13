import React, { useEffect, useRef } from 'react'
import { Bell, Activity, Calendar, Sparkles, Settings, CheckCheck } from 'lucide-react'
import { useApp } from '../../contexts/AppContext'

const TYPE_ICONS = {
  activity: Activity,
  system: Settings,
  pskill: Sparkles,
  schedule: Calendar,
}

export default function NotificationPanel({ onClose }) {
  const { notifications, markAllRead, markRead } = useApp()
  const panelRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full mt-2 w-80 bg-white rounded-modal shadow-modal border border-gray-100 z-50 animate-scale-in origin-top-right"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" />
          <h3 className="font-bold text-text-primary text-sm">Notifications</h3>
        </div>
        <button
          onClick={markAllRead}
          className="flex items-center gap-1 text-xs text-primary font-semibold hover:text-primary-dark transition-colors"
        >
          <CheckCheck className="w-3.5 h-3.5" />
          Mark all read
        </button>
      </div>

      {/* Items */}
      <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
        {notifications.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm text-text-muted">No notifications</p>
          </div>
        ) : (
          notifications.map(n => {
            const Icon = TYPE_ICONS[n.type] || Bell
            return (
              <button
                key={n.id}
                onClick={() => markRead(n.id)}
                className={`w-full flex items-start gap-3 px-5 py-3.5 hover:bg-background transition-colors text-left ${!n.read ? 'bg-primary-light/40' : ''}`}
              >
                <div className={`p-2 rounded-xl flex-shrink-0 ${n.read ? 'bg-gray-100' : 'bg-primary-light'}`}>
                  <Icon className={`w-4 h-4 ${n.read ? 'text-text-secondary' : 'text-primary'}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-semibold ${n.read ? 'text-text-secondary' : 'text-text-primary'}`}>
                    {n.title}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5 leading-relaxed">{n.message}</p>
                  <p className="text-[10px] text-text-muted mt-1">{n.time}</p>
                </div>
                {!n.read && (
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                )}
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
