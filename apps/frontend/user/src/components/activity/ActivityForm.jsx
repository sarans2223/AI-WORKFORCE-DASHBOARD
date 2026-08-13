import React, { useState, useEffect } from 'react'
import BottomSheet from '../common/BottomSheet'
import { format } from 'date-fns'

const today = format(new Date(), 'yyyy-MM-dd')

const EMPTY = { name: '', startTime: '09:00', endTime: '10:00', date: today }

export default function ActivityForm({ open, onClose, onSave, editActivity = null }) {
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (editActivity) {
      setForm({
        name: editActivity.name,
        startTime: editActivity.startTime,
        endTime: editActivity.endTime,
        date: editActivity.date,
      })
    } else {
      setForm(EMPTY)
    }
    setErrors({})
  }, [editActivity, open])

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Activity name is required'
    if (!form.startTime) e.startTime = 'Start time is required'
    if (!form.endTime) e.endTime = 'End time is required'
    if (form.startTime && form.endTime && form.startTime >= form.endTime)
      e.endTime = 'End time must be after start time'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    try {
      await onSave({ ...form })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const set = (key) => (e) => {
    setForm(f => ({ ...f, [key]: e.target.value }))
    setErrors(er => ({ ...er, [key]: undefined }))
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={editActivity ? 'Edit Activity' : 'Add Activity'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="label">Activity Name *</label>
          <input
            id="activity-name-input"
            className={`input ${errors.name ? 'border-danger' : ''}`}
            placeholder="e.g. Study System Design"
            value={form.name}
            onChange={set('name')}
          />
          {errors.name && <p className="text-xs text-danger mt-1">{errors.name}</p>}
        </div>

        {/* Date */}
        <div>
          <label className="label">Date</label>
          <input
            id="activity-date-input"
            type="date"
            className="input"
            value={form.date}
            min={today}
            onChange={set('date')}
          />
        </div>

        {/* Times */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Start Time *</label>
            <input
              id="activity-start-time"
              type="time"
              className={`input ${errors.startTime ? 'border-danger' : ''}`}
              value={form.startTime}
              onChange={set('startTime')}
            />
            {errors.startTime && <p className="text-xs text-danger mt-1">{errors.startTime}</p>}
          </div>
          <div>
            <label className="label">End Time *</label>
            <input
              id="activity-end-time"
              type="time"
              className={`input ${errors.endTime ? 'border-danger' : ''}`}
              value={form.endTime}
              onChange={set('endTime')}
            />
            {errors.endTime && <p className="text-xs text-danger mt-1">{errors.endTime}</p>}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button
            id="create-activity-btn"
            type="submit"
            disabled={saving}
            className="btn-primary flex-1"
          >
            {saving ? 'Saving…' : editActivity ? 'Save Changes' : 'Create Activity'}
          </button>
        </div>
      </form>
    </BottomSheet>
  )
}
