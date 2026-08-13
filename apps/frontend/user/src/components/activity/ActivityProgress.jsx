import React, { useState, useEffect } from 'react'
import BottomSheet from '../common/BottomSheet'

const STATUS_LABELS = {
  PLANNED: { color: 'bg-primary-light text-primary', next: 'Start Activity → IN_PROGRESS' },
  IN_PROGRESS: { color: 'bg-primary text-white', next: 'Complete → COMPLETED' },
  COMPLETED: { color: 'bg-success-soft text-green-700', next: null },
}

export default function ActivityProgress({ open, onClose, activity, onSave }) {
  const [progress, setProgress] = useState(0)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (activity) setProgress(activity.progress)
  }, [activity])

  if (!activity) return null

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(activity.id, progress)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const nextStatus =
    progress === 0 ? 'PLANNED' :
    progress === 100 ? 'COMPLETED' :
    'IN_PROGRESS'

  return (
    <BottomSheet open={open} onClose={onClose} title="Update Progress">
      <div className="space-y-5">
        {/* Activity name */}
        <div className="px-4 py-3 bg-background rounded-xl">
          <p className="text-xs text-text-secondary font-medium">Activity</p>
          <p className="text-sm font-bold text-text-primary mt-0.5">{activity.name}</p>
        </div>

        {/* Current status */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary font-medium">Current Status</span>
          <span className={`px-3 py-1 rounded-badge text-xs font-bold ${STATUS_LABELS[activity.status]?.color || ''}`}>
            {activity.status.replace('_', ' ')}
          </span>
        </div>

        {/* Progress slider */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="text-sm font-semibold text-text-primary">Progress</label>
            <span className="text-2xl font-bold text-primary">{progress}%</span>
          </div>
          <input
            id="progress-slider"
            type="range"
            min="0"
            max="100"
            step="5"
            value={progress}
            onChange={(e) => setProgress(Number(e.target.value))}
            className="w-full h-2 bg-primary-light rounded-full appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-xs text-text-muted mt-1">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Visual progress */}
        <div className="progress-bar h-3">
          <div className="progress-fill h-full" style={{ width: `${progress}%` }} />
        </div>

        {/* New status preview */}
        <div className="flex items-center justify-between px-4 py-3 bg-primary-light rounded-xl">
          <span className="text-xs font-semibold text-primary">Status after saving</span>
          <span className="text-xs font-bold text-primary">{nextStatus.replace('_', ' ')}</span>
        </div>

        {/* Quick set buttons */}
        <div className="flex gap-2">
          {[0, 25, 50, 75, 100].map(p => (
            <button
              key={p}
              onClick={() => setProgress(p)}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
                progress === p
                  ? 'bg-primary text-white'
                  : 'bg-background text-text-secondary hover:bg-primary-light hover:text-primary'
              }`}
            >
              {p}%
            </button>
          ))}
        </div>

        {/* Save */}
        <div className="flex gap-3 pt-1">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button
            id="save-progress-btn"
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex-1"
          >
            {saving ? 'Saving…' : 'Save Progress'}
          </button>
        </div>
      </div>
    </BottomSheet>
  )
}
