import React from 'react'

export default function StatCard({ icon: Icon, label, value, sub, color = 'primary', className = '' }) {
  const colorMap = {
    primary: { bg: 'bg-primary-light', text: 'text-primary', icon: 'text-primary' },
    success: { bg: 'bg-success-soft', text: 'text-green-700', icon: 'text-green-600' },
    danger: { bg: 'bg-danger-soft', text: 'text-red-700', icon: 'text-red-500' },
    warning: { bg: 'bg-warning-soft', text: 'text-amber-700', icon: 'text-amber-500' },
    info: { bg: 'bg-info-soft', text: 'text-blue-700', icon: 'text-blue-500' },
  }
  const c = colorMap[color] || colorMap.primary

  return (
    <div className={`card flex items-start gap-4 ${className}`}>
      <div className={`p-3 rounded-2xl ${c.bg} flex-shrink-0`}>
        <Icon className={`w-6 h-6 ${c.icon}`} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-text-secondary font-medium">{label}</p>
        <p className={`text-2xl font-bold mt-0.5 ${c.text}`}>{value}</p>
        {sub && <p className="text-xs text-text-muted mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}
