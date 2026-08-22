import React, { useState } from 'react'
import { CalendarDays } from 'lucide-react'
import { format } from 'date-fns'

export default function LeaveForm({ onSubmit }) {
  const today = format(new Date(), 'yyyy-MM-dd')
  const [form, setForm] = useState({ 
    startDate: today, 
    endDate: today, 
    fromTime: '09:00', 
    toTime: '17:00', 
    reason: '' 
  })
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.startDate) e.startDate = 'Start date required'
    else if (form.startDate < today) e.startDate = 'Start date cannot be in the past'
    
    if (!form.endDate) e.endDate = 'End date required'
    if (form.startDate && form.endDate && form.endDate < form.startDate)
      e.endDate = 'End date must be on or after start date'
    
    if (!form.fromTime) e.fromTime = 'From time required'
    if (!form.toTime) e.toTime = 'To time required'
    
    if (form.startDate && form.endDate && form.startDate === form.endDate) {
      if (form.fromTime && form.toTime && form.toTime <= form.fromTime) {
        e.toTime = 'To time must be after from time'
      }
    }

    if (!form.reason.trim()) e.reason = 'Reason is required'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    try {
      await onSubmit(form)
      setSuccess(true)
      setForm({ 
        startDate: today, 
        endDate: today, 
        fromTime: '09:00', 
        toTime: '17:00', 
        reason: '' 
      })
      setTimeout(() => setSuccess(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  const set = (key) => (e) => {
    setForm(f => ({ ...f, [key]: e.target.value }))
    setErrors(er => ({ ...er, [key]: undefined }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {success && (
        <div className="px-4 py-3 bg-success-soft rounded-xl text-sm text-green-700 font-semibold">
          ✓ Leave record saved successfully!
        </div>
      )}

      {/* Dates row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Start Date *</label>
          <input
            id="leave-start-date"
            type="date"
            className={`input ${errors.startDate ? 'border-danger' : ''}`}
            value={form.startDate}
            min={today}
            onChange={set('startDate')}
          />
          {errors.startDate && <p className="text-xs text-danger mt-1">{errors.startDate}</p>}
        </div>
        <div>
          <label className="label">End Date *</label>
          <input
            id="leave-end-date"
            type="date"
            className={`input ${errors.endDate ? 'border-danger' : ''}`}
            value={form.endDate}
            min={form.startDate || today}
            onChange={set('endDate')}
          />
          {errors.endDate && <p className="text-xs text-danger mt-1">{errors.endDate}</p>}
        </div>
      </div>

      {/* Times row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">From Time *</label>
          <input
            id="leave-from-time"
            type="time"
            className={`input ${errors.fromTime ? 'border-danger' : ''}`}
            value={form.fromTime}
            onChange={set('fromTime')}
          />
          {errors.fromTime && <p className="text-xs text-danger mt-1">{errors.fromTime}</p>}
        </div>
        <div>
          <label className="label">To Time *</label>
          <input
            id="leave-to-time"
            type="time"
            className={`input ${errors.toTime ? 'border-danger' : ''}`}
            value={form.toTime}
            onChange={set('toTime')}
          />
          {errors.toTime && <p className="text-xs text-danger mt-1">{errors.toTime}</p>}
        </div>
      </div>

      <div>
        <label className="label">Reason *</label>
        <textarea
          id="leave-reason"
          className={`input resize-none ${errors.reason ? 'border-danger' : ''}`}
          rows={4}
          placeholder="Describe the reason for your leave..."
          value={form.reason}
          onChange={set('reason')}
        />
        {errors.reason && <p className="text-xs text-danger mt-1">{errors.reason}</p>}
      </div>

      <button
        id="submit-leave-btn"
        type="submit"
        disabled={saving}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        <CalendarDays className="w-4 h-4" />
        {saving ? 'Saving…' : 'Log Leave'}
      </button>
    </form>
  )
}
