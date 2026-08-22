import React, { useEffect, useState } from 'react'
import { ShieldCheck, Plus, X, Eye, EyeOff, Mail, Lock, User, CheckCircle2, AlertCircle, Loader2, Calendar } from 'lucide-react'
import { adminService } from '../services/adminService'

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatAdminName(email) {
  if (!email) return 'Admin'
  const part = email.split('@')[0]
  return part.charAt(0).toUpperCase() + part.slice(1)
}

function getInitials(email) {
  if (!email) return 'A'
  return email.charAt(0).toUpperCase()
}

const AVATAR_COLORS = [
  'from-violet-500 to-indigo-500',
  'from-emerald-500 to-teal-500',
  'from-rose-500 to-pink-500',
  'from-amber-500 to-orange-500',
  'from-sky-500 to-blue-500',
  'from-fuchsia-500 to-purple-500',
]

export default function Admins() {
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState(null) // { type: 'success'|'error', message }

  const loadAdmins = async () => {
    setLoading(true)
    const data = await adminService.listAdmins()
    setAdmins(data)
    setLoading(false)
  }

  useEffect(() => {
    loadAdmins()
  }, [])

  const showToast = (type, message) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 4000)
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) return
    if (form.password.length < 6) {
      showToast('error', 'Password must be at least 6 characters.')
      return
    }
    setSubmitting(true)
    try {
      await adminService.createAdmin({ email: form.email.trim(), password: form.password })
      setShowModal(false)
      setForm({ email: '', password: '' })
      showToast('success', `Admin account for "${form.email.trim()}" was created successfully!`)
      loadAdmins()
    } catch (err) {
      showToast('error', err.message || 'Failed to create admin. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg animate-scale-in
          ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.type === 'success'
            ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
          <p className="text-sm font-semibold">{toast.message}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Manage Admins</h1>
          <p className="page-subtitle">{admins.length} administrator{admins.length !== 1 ? 's' : ''} registered</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-bold rounded-2xl hover:bg-primary/90 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Admin
        </button>
      </div>

      {/* Admin Cards */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : admins.length === 0 ? (
        <div className="card text-center py-16 text-text-muted">
          <ShieldCheck className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-semibold">No admin accounts found.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {admins.map((admin, i) => (
            <div
              key={admin.id}
              className="card border border-gray-100 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white text-lg font-black flex-shrink-0 bg-gradient-to-br ${AVATAR_COLORS[i % AVATAR_COLORS.length]} shadow-sm`}>
                  {getInitials(admin.email)}
                </div>
                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black text-text-primary truncate">{formatAdminName(admin.email)}</p>
                  <p className="text-[11px] text-text-muted truncate font-medium">{admin.email}</p>
                </div>
                {/* Role Badge */}
                <span className="text-[9px] font-black text-indigo-700 bg-indigo-50 px-2 py-1 rounded-full uppercase tracking-wider flex-shrink-0">
                  Admin
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-50 flex items-center gap-1.5 text-[10px] text-text-muted font-semibold">
                <Calendar className="w-3 h-3" />
                <span>Joined {formatDate(admin.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Admin Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => !submitting && setShowModal(false)}
        >
          <div
            className="bg-card rounded-card shadow-modal w-full max-w-md animate-scale-in"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-light to-primary-light/50 border border-primary/10 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-base font-black text-text-primary">Add New Admin</h2>
                  <p className="text-xs text-text-muted font-medium">Create a new administrator account</p>
                </div>
              </div>
              <button
                onClick={() => !submitting && setShowModal(false)}
                className="p-2 rounded-xl bg-background hover:bg-gray-100 transition-colors border border-gray-200"
              >
                <X className="w-4 h-4 text-text-secondary" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type="email"
                    required
                    placeholder="admin@gmail.com"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full pl-9 pr-4 py-2.5 text-sm bg-background border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-text-primary placeholder:text-text-muted/60"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="Minimum 6 characters"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    className="w-full pl-9 pr-10 py-2.5 text-sm bg-background border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-text-primary placeholder:text-text-muted/60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-text-muted font-medium px-1">
                  The new admin can change this after their first login.
                </p>
              </div>

              {/* Info Box */}
              <div className="bg-primary-light/30 border border-primary/10 rounded-xl p-3 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-text-secondary font-semibold leading-relaxed">
                  This account will have full <strong className="text-primary">ADMIN</strong> privileges — including student management, project assignment, pass approvals, and attendance control.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => !submitting && setShowModal(false)}
                  className="flex-1 py-2.5 text-sm font-bold text-text-secondary bg-background border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !form.email || !form.password}
                  className="flex-1 py-2.5 text-sm font-bold text-white bg-primary rounded-xl hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Create Admin
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
