import React, { useState, useEffect } from 'react'
import BottomSheet from '../common/BottomSheet'
import { Clock, ArrowRight, Timer } from 'lucide-react'

export default function ActivityExtension({ open, onClose, activity, onSave }) {
  const [extendedEnd, setExtendedEnd] = useState('')
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (activity) {
      setExtendedEnd(activity.endTime)
      setReason('')
      setError('')
    }
  }, [activity, open])

  if (!activity) return null

  const handleSave = async () => {
    if (!extendedEnd) { setError('Please select a new end time'); return }
    if (extendedEnd <= activity.endTime) { setError('New end time must be after original end time'); return }
    setSaving(true)
    try {
      await onSave(activity.id, extendedEnd, reason)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="Extend Activity Time">
      <div className="space-y-5">
        {/* Activity name */}
        <div className="px-4 py-3 bg-background rounded-xl">
          <p className="text-xs text-text-secondary font-medium">Activity</p>
          <p className="text-sm font-bold text-text-primary mt-0.5">{activity.name}</p>
        </div>

        {/* Original timing */}
        <div>
          <p className="label">Original Timing</p>
          <div className="flex items-center gap-3 px-4 py-3 bg-background rounded-xl">
            <Clock className="w-4 h-4 text-text-secondary flex-shrink-0" />
            <span className="text-sm font-semibold text-text-primary">{activity.startTime}</span>
            <ArrowRight className="w-4 h-4 text-text-muted" />
            <span className="text-sm font-semibold text-text-primary">{activity.endTime}</span>
            <span className="ml-auto text-xs text-text-muted">Original End</span>
          </div>
        </div>

        {/* New end time */}
        <div>
          <label className="label">New End Time *</label>
          <input
            id="extension-end-time"
            type="time"
            className={`input ${error ? 'border-danger' : ''}`}
            value={extendedEnd}
            onChange={(e) => { setExtendedEnd(e.target.value); setError('') }}
          />
          {error && <p className="text-xs text-danger mt-1">{error}</p>}
        </div>

        {/* New timing preview */}
        {extendedEnd && extendedEnd > activity.endTime && (
          <div className="flex items-center gap-3 px-4 py-3 bg-primary-light rounded-xl">
            <Timer className="w-4 h-4 text-primary flex-shrink-0" />
            <div>
              <p className="text-xs text-primary font-semibold">Extended Schedule</p>
              <p className="text-sm font-bold text-text-primary">
                {activity.startTime} → {extendedEnd}
              </p>
            </div>
          </div>
        )}

        {/* Reason */}
        <div>
          <label className="label">Reason for Extension</label>
          <textarea
            id="extension-reason"
            className="input resize-none"
            rows={3}
            placeholder="Why do you need more time?"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button
            id="save-extension-btn"
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex-1"
          >
            {saving ? 'Saving…' : 'Extend Time'}
          </button>
        </div>
      </div>
    </BottomSheet>
  )
}
