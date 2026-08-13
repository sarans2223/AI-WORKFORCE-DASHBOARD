import React, { useState } from 'react'
import { CalendarDays } from 'lucide-react'
import { format } from 'date-fns'

export default function LeaveForm({ onSubmit }) {
  const today = format(new Date(), 'yyyy-MM-dd')
  const [form, setForm] = useState({ startDate: today, endDate: today, reason: '' })
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.startDate) e.startDate = 'Start date required'
    if (!form.endDate) e.endDate = 'End date required'
    if (form.startDate && form.endDate && form.endDate < form.startDate)
      e.endDate = 'End date must be on or after start date'
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
      setForm({ startDate: today, endDate: today, reason: '' })
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
          ✓ Leave application submitted successfully!
        </div>
      )}

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
        {saving ? 'Submitting…' : 'Submit Leave'}
      </button>
    </form>
  )
}
