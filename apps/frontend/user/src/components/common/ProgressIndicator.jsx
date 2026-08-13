import React from 'react'

export default function ProgressIndicator({ value = 0, showLabel = true, size = 'md', color = 'primary' }) {
  const clamped = Math.max(0, Math.min(100, value))
  const sizeMap = { sm: 'h-1.5', md: 'h-2', lg: 'h-3' }
  const colorMap = {
    primary: 'bg-primary',
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-danger',
  }

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-text-secondary font-medium">Progress</span>
          <span className="text-xs font-bold text-text-primary">{clamped}%</span>
        </div>
      )}
      <div className={`progress-bar ${sizeMap[size]}`}>
        <div
          className={`progress-fill ${colorMap[color] || 'bg-primary'}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}
