import React from 'react'

export default function EmptyState({ icon: Icon, heading, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary-light flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-primary" strokeWidth={1.5} />
      </div>
      <h3 className="text-lg font-bold text-text-primary mb-1">{heading}</h3>
      <p className="text-sm text-text-secondary max-w-xs">{description}</p>
      {action && (
        <div className="mt-5">
          {action}
        </div>
      )}
    </div>
  )
}
