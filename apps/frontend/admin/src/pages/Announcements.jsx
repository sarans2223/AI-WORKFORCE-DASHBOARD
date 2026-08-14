import React, { useEffect, useState } from 'react'
import { Megaphone, Plus, Trash2, AlertTriangle, Info } from 'lucide-react'
import { format } from 'date-fns'
import { adminService } from '../services/adminService'

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', message: '', priority: 'normal' })
  const [saving, setSaving] = useState(false)

  const load = () => adminService.getAnnouncements().then(data => { setAnnouncements(data); setLoading(false) })
  useEffect(() => { load() }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.message.trim()) return
    setSaving(true)
    const newAnn = {
      id: `ANN-${Date.now()}`,
      ...form,
      createdAt: format(new Date(), 'yyyy-MM-dd'),
    }
    await adminService.addAnnouncement(newAnn)
    setAnnouncements(prev => [newAnn, ...prev])
    setForm({ title: '', message: '', priority: 'normal' })
    setShowForm(false)
    setSaving(false)
  }

  const handleDelete = async (id) => {
    await adminService.deleteAnnouncement(id)
    setAnnouncements(prev => prev.filter(a => a.id !== id))
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Announcements</h1>
          <p className="page-subtitle">Post notices visible to all students</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> New
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="card border border-primary/20 animate-scale-in">
          <h3 className="text-sm font-bold text-text-primary mb-4">New Announcement</h3>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="label">Title</label>
              <input className="input" placeholder="e.g. Mid-Semester Exams" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div>
              <label className="label">Message</label>
              <textarea rows={3} className="input resize-none" placeholder="Write the notice content..." value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
            </div>
            <div>
              <label className="label">Priority</label>
              <div className="flex gap-3">
                {['normal', 'high'].map(p => (
                  <button
                    type="button"
                    key={p}
                    onClick={() => setForm(f => ({ ...f, priority: p }))}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all capitalize
                      ${form.priority === p
                        ? p === 'high' ? 'bg-danger-soft text-red-700 border-red-200' : 'bg-primary-light text-primary border-primary/20'
                        : 'bg-background text-text-muted border-gray-200 hover:border-gray-300'}`}
                  >
                    {p === 'high' ? '🔴 High' : '🔵 Normal'}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary flex-1">
                {saving ? 'Posting...' : 'Post Announcement'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {announcements.map(ann => (
          <div key={ann.id} className={`card border flex gap-4 items-start
            ${ann.priority === 'high' ? 'border-red-100 bg-danger-soft/20' : 'border-gray-100'}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
              ${ann.priority === 'high' ? 'bg-danger-soft' : 'bg-primary-light'}`}>
              {ann.priority === 'high'
                ? <AlertTriangle className="w-5 h-5 text-red-600" />
                : <Info className="w-5 h-5 text-primary" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-bold text-text-primary">{ann.title}</p>
                <button
                  onClick={() => handleDelete(ann.id)}
                  className="flex-shrink-0 p-1.5 rounded-lg text-text-muted hover:text-red-500 hover:bg-danger-soft transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-text-secondary mt-1 leading-relaxed">{ann.message}</p>
              <p className="text-[10px] text-text-muted mt-2">{ann.createdAt}</p>
            </div>
          </div>
        ))}
        {announcements.length === 0 && (
          <div className="card text-center py-12 text-text-muted">
            <Megaphone className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No announcements yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
