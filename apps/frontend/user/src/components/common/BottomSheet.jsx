import React, { useEffect } from 'react'
import { X } from 'lucide-react'

export default function BottomSheet({ open, onClose, title, children }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center sm:p-4">
      {/* Overlay */}
      <div className="overlay" onClick={onClose} />

      {/* Sheet */}
      <div
        className={`
          relative bg-white w-full sm:max-w-md sm:rounded-modal shadow-modal
          rounded-t-[28px] animate-slide-up sm:animate-scale-in z-50
          max-h-[90vh] overflow-y-auto
        `}
        role="dialog"
        aria-modal="true"
      >
        {/* Drag indicator */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-text-primary">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-text-secondary transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 pb-8">
          {children}
        </div>
      </div>
    </div>
  )
}
