import React, { useState } from 'react'
import { Clock, Edit3, Timer, Trash2, CheckCircle2 } from 'lucide-react'
import StatusBadge from '../common/StatusBadge'

export default function ActivityCard({ activity, onExtend, onEdit, onDelete, onComplete }) {
  const { name, startTime, endTime, extendedEndTime, status, extensionReason } = activity

  const displayEndTime = extendedEndTime || endTime
  const isCompleted = status === 'COMPLETED'

  return (
    <div className={`card border transition-all duration-200 ${isCompleted ? 'border-emerald-200/80 bg-emerald-50/10' : 'border-gray-100 hover:border-primary/20'}`}>
      {/* Status indicator strip */}
      <div className={`-mx-5 -mt-5 mb-4 h-1 rounded-t-card ${
        isCompleted ? 'bg-success' :
        status === 'IN_PROGRESS' ? 'bg-primary' :
        status === 'INCOMPLETE' ? 'bg-danger' :
        'bg-primary-muted'
      }`} />

      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-text-primary text-base leading-snug">{name}</h3>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Time row */}
      <div className="flex items-center gap-4 mb-4 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs text-text-secondary">
          <Clock className="w-3.5 h-3.5 text-primary" />
          <span className="font-medium">{startTime}</span>
          <span>→</span>
          <span className={`font-medium ${extendedEndTime ? 'text-primary' : ''}`}>{displayEndTime}</span>
        </div>
        {extendedEndTime && (
          <div className="flex items-center gap-1 text-xs">
            <span className="text-text-muted line-through">{endTime}</span>
            <span className="badge-planned text-[10px] py-0.5 px-2">Extended</span>
          </div>
        )}
      </div>

      {/* Extension note */}
      {extendedEndTime && extensionReason && (
        <div className="mb-4 px-3 py-2.5 bg-primary-light rounded-xl">
          <p className="text-xs text-primary font-semibold mb-0.5">Extension Note</p>
          <p className="text-xs text-text-secondary">{extensionReason}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between gap-2 flex-wrap pt-1 border-t border-gray-100/70">
        <div className="flex items-center gap-2 flex-wrap">
          {!isCompleted && (
            <>
              {/* Option to click if it's completed */}
              <button
                id={`complete-${activity.id}`}
                onClick={() => onComplete && onComplete(activity.id)}
                className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 font-bold transition-all shadow-2xs cursor-pointer"
                title="Mark activity as completed"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Complete
              </button>

              {/* Extend option */}
              {(status === 'IN_PROGRESS' || status === 'PLANNED') && !extendedEndTime && (
                <button
                  id={`extend-${activity.id}`}
                  onClick={() => onExtend(activity)}
                  className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1 cursor-pointer"
                >
                  <Timer className="w-3.5 h-3.5" />
                  Extend
                </button>
              )}
            </>
          )}
        </div>


        <div className="flex items-center gap-1.5">
          {/* Edit option — only available when NOT completed */}
          {!isCompleted && (
            <button
              onClick={() => onEdit(activity)}
              className="btn-icon p-2 hover:bg-gray-100 transition-colors"
              aria-label="Edit activity"
              title="Edit activity"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}

          {/* Delete option */}
          <button
            onClick={() => onDelete(activity.id)}
            className="p-2 rounded-xl hover:bg-danger-soft text-text-secondary hover:text-red-500 transition-colors cursor-pointer"
            aria-label="Delete activity"
            title="Delete activity"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

