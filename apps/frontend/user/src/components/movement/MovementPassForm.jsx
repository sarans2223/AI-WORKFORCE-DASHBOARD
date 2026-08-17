import React, { useState, useEffect } from 'react'
import { MapPin, Clock } from 'lucide-react'
import { movementService } from '../../services/movementService'
import { format } from 'date-fns'

const today = format(new Date(), 'yyyy-MM-dd')

const DYNAMIC_TYPES = ['PS slot', 'IECC', 'Library', 'Research park', 'MC', 'Other']
const PS_TIMINGS = ['8.45 AM - 9.45 AM', '10.00 AM - 11.00 AM', '11.20 AM - 12.20 PM', '1.30 PM - 2.30 PM', '3.20 PM - 4.20 PM']

export default function MovementPassForm({ onSubmit }) {
  const [form, setForm] = useState({
    date: today, movementType: '', slot: '', fromTime: '', toTime: '', reason: '', skillName: '',
  })
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.date) e.date = 'Date required'
    else if (form.date < today) e.date = 'Past dates are not allowed'

    if (!form.movementType) e.movementType = 'Movement type required'
    
    const currentTime = format(new Date(), 'HH:mm')

    if (form.movementType === 'PS slot') {
      if (!form.skillName.trim()) {
        e.skillName = 'Skill name required'
      }
      if (!form.slot) {
        e.slot = 'Slot required'
      } else if (form.date === today) {
        const startStr = form.slot.split(' - ')[0]
        const isPM = startStr.includes('PM')
        let [hours, mins] = startStr.replace(/(AM|PM)/, '').trim().split('.')
        let h = parseInt(hours, 10)
        if (isPM && h !== 12) h += 12
        if (!isPM && h === 12) h = 0
        const slotTime = `${String(h).padStart(2, '0')}:${mins}`
        
        if (slotTime < currentTime) {
          e.slot = 'Cannot select a past time slot for today'
        }
      }
    } else if (form.movementType) {
      if (!form.fromTime) {
        e.fromTime = 'From time required'
      } else if (form.date === today && form.fromTime < currentTime) {
        e.fromTime = 'Cannot select a past time'
      }
      
      if (!form.toTime) {
        e.toTime = 'To time required'
      } else if (form.fromTime && form.toTime <= form.fromTime) {
        e.toTime = 'To time must be after from time'
      }
      
      if (!form.reason.trim()) e.reason = 'Reason required'
    }
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    try {
      const payload = {
        date: form.date,
        movementType: form.movementType,
        slot: form.movementType === 'PS slot' ? form.slot : 'Custom Time',
        timing: form.movementType === 'PS slot' ? form.slot : `${form.fromTime} - ${form.toTime}`,
        reason: form.movementType === 'PS slot' ? `Attending P-Skill Session: ${form.skillName}` : form.reason,
        skillName: form.movementType === 'PS slot' ? form.skillName : '',
      }
      await onSubmit(payload)
      setSuccess(true)
      setForm({ date: today, movementType: '', slot: '', fromTime: '', toTime: '', reason: '', skillName: '' })
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
          ✓ Movement pass created successfully!
        </div>
      )}

      {/* Date */}
      <div>
        <label className="label">Date *</label>
        <input
          id="mp-date"
          type="date"
          className={`input ${errors.date ? 'border-danger' : ''}`}
          value={form.date}
          min={today}
          onChange={set('date')}
        />
        {errors.date && <p className="text-xs text-danger mt-1">{errors.date}</p>}
      </div>

      {/* Movement Type */}
      <div>
        <label className="label">Movement Type *</label>
        <select
          id="mp-movement-type"
          className={`input ${errors.movementType ? 'border-danger' : ''}`}
          value={form.movementType}
          onChange={(e) => {
            setForm(f => ({ ...f, movementType: e.target.value, slot: '', fromTime: '', toTime: '', reason: '', skillName: '' }))
            setErrors({})
          }}
        >
          <option value="">Select type…</option>
          {DYNAMIC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        {errors.movementType && <p className="text-xs text-danger mt-1">{errors.movementType}</p>}
      </div>

      {/* Dynamic Fields based on Type */}
      {form.movementType === 'PS slot' && (
        <div className="space-y-4">
          <div>
            <label className="label">Slot Timing *</label>
            <select
              id="mp-slot"
              className={`input ${errors.slot ? 'border-danger' : ''}`}
              value={form.slot}
              onChange={set('slot')}
            >
              <option value="">Select slot…</option>
              {PS_TIMINGS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {errors.slot && <p className="text-xs text-danger mt-1">{errors.slot}</p>}
          </div>

          <div>
            <label className="label">Skill Name *</label>
            <input
              id="mp-skill-name"
              type="text"
              placeholder="e.g. React, Node JS, Aptitude..."
              className={`input ${errors.skillName ? 'border-danger' : ''}`}
              value={form.skillName || ''}
              onChange={set('skillName')}
            />
            {errors.skillName && <p className="text-xs text-danger mt-1">{errors.skillName}</p>}
          </div>
        </div>
      )}

      {form.movementType && form.movementType !== 'PS slot' && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">From Time *</label>
              <input
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
              id="mp-reason"
              className={`input resize-none ${errors.reason ? 'border-danger' : ''}`}
              rows={3}
              placeholder="Reason for movement..."
              value={form.reason}
              onChange={set('reason')}
            />
            {errors.reason && <p className="text-xs text-danger mt-1">{errors.reason}</p>}
          </div>
        </>
      )}

      <button
        id="create-pass-btn"
        type="submit"
        disabled={saving}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        <MapPin className="w-4 h-4" />
        {saving ? 'Creating…' : 'Create Pass'}
      </button>
    </form>
  )
}
