import React, { useEffect, useState } from 'react'
import {
  ClipboardList, Plus, X, Calendar, Users, FolderKanban, CheckCircle2, AlertCircle,
  Search, Loader2, ChevronRight, Eye, Mail, Info, UserCheck, Github, ExternalLink,
  Activity, Clock, TrendingUp, Send
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { adminService } from '../services/adminService'

const safeFormatDistance = (dateVal) => {
  if (!dateVal) return ''
  try {
    let d = typeof dateVal === 'string' || typeof dateVal === 'number' ? new Date(dateVal) : dateVal
    if (!d || isNaN(d.getTime())) return String(dateVal)
    
    const now = new Date()
    // If the parsed date is slightly in the future (within 2 minutes), treat as "just now"
    if (d > now) {
      const diffMs = d.getTime() - now.getTime()
      if (diffMs <= 2 * 60 * 1000) {
        return 'just now'
      }
      // If it's shifted by ~5.5 hours (UTC/IST mixup), subtract the 5.5 hour offset
      const diffHours = diffMs / (1000 * 60 * 60)
      if (diffHours >= 5 && diffHours <= 6) {
        d = new Date(d.getTime() - 5.5 * 60 * 60 * 1000)
      }
    }
    
    return formatDistanceToNow(d, { addSuffix: true })
  } catch (e) {
    return String(dateVal)
  }
}


// ─── Task History / Details Modal ──────────────────────────────────────────────
function TaskHistoryModal({ task, students, onClose }) {
  const completed = task.studentStatuses.filter(s => s.status === 'COMPLETED')
  const pending = task.studentStatuses.filter(s => s.status === 'PENDING')
  const getStudent = (id) => students.find(s => s.id === id)
  const progressPct = task.studentStatuses.length ? Math.round((completed.length / task.studentStatuses.length) * 100) : 0

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-card rounded-card shadow-modal w-full max-w-2xl flex flex-col max-h-[85vh] animate-scale-in" onClick={e => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0 bg-primary-light/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-text-primary">Task Activity Logs</h2>
              <p className="text-xs text-text-muted mt-0.5">Assigned: {task.assignedOn} • Due: {task.dueDate}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-background hover:bg-gray-150 transition-colors border border-gray-200">
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Overview Stat */}
          <div className="bg-background rounded-2xl p-4 border border-gray-150 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-text-secondary uppercase tracking-widest">Progress</span>
              <span className="text-sm font-black text-primary">{progressPct}% Completed</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progressPct}%` }} />
            </div>
            <div className="flex gap-4 text-xs font-semibold pt-1">
              <span className="text-green-700 bg-green-50 px-2 py-0.5 rounded-lg border border-green-100">
                {completed.length} Submitted
              </span>
              <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100">
                {pending.length} Pending
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Description</h3>
            <p className="text-xs text-text-secondary leading-relaxed bg-background p-4 border border-gray-150 rounded-2xl font-medium">
              {task.description}
            </p>
          </div>

          {/* Student Status List */}
          <div>
            <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-3">Student Submission Log</h3>
            <div className="space-y-2">
              {task.studentStatuses.map(status => {
                const s = getStudent(status.studentId)
                if (!s) return null
                const isCompleted = status.status === 'COMPLETED'
                return (
                  <div key={status.studentId} className="flex items-center justify-between p-3 bg-background border border-gray-100 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${isCompleted ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-text-primary">{s.name}</p>
                        <p className="text-[10px] text-text-muted font-mono">{s.registerNumber}</p>
                      </div>
                    </div>
                    <div>
                      {isCompleted ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                          <AlertCircle className="w-3 h-3" /> Pending
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Project History / Details Modal with Updates & Progress Reply ──────────────
function ProjectHistoryModal({ project, students, onUpdateProgressRate, onSendUpdateProgress, onCompleteProject, onReopenProject, onClose }) {
  const [activeTab, setActiveTab] = useState('updates') // 'updates' | 'roster'
  const [projectUpdates, setProjectUpdates] = useState([])
  const [loadingUpdates, setLoadingUpdates] = useState(true)

  // Overall Project Progress Editing
  const [isEditingOverallProgress, setIsEditingOverallProgress] = useState(false)
  const [overallProgressInput, setOverallProgressInput] = useState(project.progress || 0)
  const [isSavingOverallProgress, setIsSavingOverallProgress] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)

  // Update Item Review/Reply State
  const [reviewingUpdateId, setReviewingUpdateId] = useState(null)
  const [replyProgressInput, setReplyProgressInput] = useState(50)
  const [replyFeedbackInput, setReplyFeedbackInput] = useState('')
  const [isSendingReply, setIsSendingReply] = useState(false)

  const assignedStudents = students.filter(s => project.members.includes(s.id))

  const loadSpecificUpdates = async () => {
    setLoadingUpdates(true)
    try {
      const updates = await adminService.getSpecificProjectUpdates(project.id)
      setProjectUpdates(updates)
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingUpdates(false)
    }
  }

  useEffect(() => {
    loadSpecificUpdates()
  }, [project.id])

  const handleSaveOverallProgress = async () => {
    setIsSavingOverallProgress(true)
    try {
      if (onUpdateProgressRate) {
        await onUpdateProgressRate(project.id, overallProgressInput)
      }
      setIsEditingOverallProgress(false)
    } finally {
      setIsSavingOverallProgress(false)
    }
  }

  const handleConfirmComplete = async () => {
    if (!onCompleteProject) return
    setIsCompleting(true)
    try {
      await onCompleteProject(project.id)
    } finally {
      setIsCompleting(false)
    }
  }

  const handleStartReview = (upd) => {
    setReviewingUpdateId(upd.id)
    setReplyProgressInput(upd.progress !== null && upd.progress !== undefined ? upd.progress : 50)
    setReplyFeedbackInput(upd.adminFeedback || '')
  }

  const handleSendReply = async (updateId) => {
    setIsSendingReply(true)
    try {
      if (onSendUpdateProgress) {
        await onSendUpdateProgress(updateId, replyProgressInput, replyFeedbackInput)
      }
      setReviewingUpdateId(null)
      await loadSpecificUpdates()
    } finally {
      setIsSendingReply(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-card rounded-card shadow-modal w-full max-w-2xl flex flex-col max-h-[90vh] animate-scale-in" onClick={e => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 flex-shrink-0 bg-primary-light/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-sm">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-text-primary">{project.name}</h2>
                {project.status === 'COMPLETED' && (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase tracking-wider">
                    Completed
                  </span>
                )}
              </div>
              <p className="text-xs text-text-muted mt-0.5">Project ID: <span className="font-mono font-bold text-primary">{project.id}</span></p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-background hover:bg-gray-150 transition-colors border border-gray-200">
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Pinned Top Banner: GitHub Repository & Overall Progress */}
          <div className="bg-gray-900 text-white p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                <Github className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">GitHub Repository</p>
                {project.gitRepo ? (
                  <a
                    href={project.gitRepo.startsWith('http') ? project.gitRepo : `https://${project.gitRepo}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-white hover:text-primary-light hover:underline truncate block flex items-center gap-1"
                  >
                    <span>{project.gitRepo}</span>
                    <ExternalLink className="w-3 h-3 flex-shrink-0 opacity-75" />
                  </a>
                ) : (
                  <p className="text-xs text-gray-400 font-medium italic">No repository linked</p>
                )}
              </div>
            </div>

            {/* Overall Progress Control */}
            <div className="flex items-center gap-2.5 bg-white/10 px-3.5 py-2 rounded-xl border border-white/5 self-end sm:self-auto flex-shrink-0">
              {isEditingOverallProgress ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="w-16 px-2 py-1 text-xs font-black text-gray-900 bg-white rounded-lg border-0 focus:ring-2 focus:ring-primary"
                    value={overallProgressInput}
                    onChange={(e) => setOverallProgressInput(Math.min(100, Math.max(0, Number(e.target.value))))}
                  />
                  <span className="text-xs font-bold text-gray-300">%</span>
                  <button
                    onClick={handleSaveOverallProgress}
                    disabled={isSavingOverallProgress}
                    className="px-2.5 py-1 rounded-lg bg-green-500 hover:bg-green-600 text-white text-[10px] font-black transition-colors"
                  >
                    {isSavingOverallProgress ? '...' : 'Save'}
                  </button>
                  <button
                    onClick={() => setIsEditingOverallProgress(false)}
                    className="px-2 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-[10px] font-bold"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div>
                    <span className="text-[8px] uppercase tracking-wider text-gray-400 font-bold block text-right">Progress Rate</span>
                    <span className="text-sm font-black text-green-400">{project.progress || 0}%</span>
                  </div>
                  <button
                    onClick={() => {
                      setOverallProgressInput(project.progress || 0)
                      setIsEditingOverallProgress(true)
                    }}
                    className="px-2 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-gray-200 text-[10px] font-bold transition-colors"
                    title="Change overall project progress rate"
                  >
                    Edit Rate
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ─── Completion Status & Confirmation Banner ─── */}
          {project.status === 'COMPLETED' ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black">
                  ✓
                </div>
                <div>
                  <p className="text-xs font-black text-emerald-950">Project Completed & Archived to History</p>
                  <p className="text-[10px] text-emerald-700 font-medium">Final Rate: 100% • Moved to Completed History</p>
                </div>
              </div>
              {onReopenProject && (
                <button
                  onClick={() => onReopenProject(project.id)}
                  className="px-3 py-1.5 rounded-xl bg-white border border-emerald-300 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-colors"
                >
                  Re-open Project
                </button>
              )}
            </div>
          ) : (project.progress >= 100) ? (
            <div className="bg-gradient-to-r from-emerald-500/15 via-amber-500/10 to-emerald-500/15 border border-emerald-300 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in shadow-2xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs flex-shrink-0">
                  <CheckCircle2 className="w-4.5 h-4.5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-black text-emerald-950">Progress Rate is 100%!</p>
                  <p className="text-[10px] text-emerald-800 font-medium">Confirm completion to officially archive this project to history.</p>
                </div>
              </div>
              <button
                onClick={handleConfirmComplete}
                disabled={isCompleting}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer hover:scale-102 self-end sm:self-auto"
              >
                {isCompleting ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Confirm & Complete Project
                  </>
                )}
              </button>
            </div>
          ) : null}

          {/* Navigation Tabs */}
          <div className="flex border-b border-gray-150 gap-2">
            <button
              onClick={() => setActiveTab('updates')}
              className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                activeTab === 'updates' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-primary'
              }`}
            >
              <Activity className="w-3.5 h-3.5" /> Student Updates & Feedback
              {projectUpdates.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-primary-light text-primary">
                  {projectUpdates.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('roster')}
              className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                activeTab === 'roster' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-primary'
              }`}
            >
              <Users className="w-3.5 h-3.5" /> Team Members & Scope ({assignedStudents.length})
            </button>
          </div>

          {/* Tab 1: Updates & Feedback Feed */}
          {activeTab === 'updates' && (
            <div className="space-y-3 animate-fade-in">
              {loadingUpdates ? (
                <div className="text-center py-8 text-xs text-text-muted">Loading project updates...</div>
              ) : projectUpdates.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-gray-200 rounded-2xl bg-background/50">
                  <Activity className="w-8 h-8 text-text-muted mx-auto mb-2 opacity-40" />
                  <p className="text-xs font-bold text-text-secondary">No updates posted yet by this project team</p>
                  <p className="text-[10px] text-text-muted mt-0.5">When students submit updates, they will appear here for review and reply scoring.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {projectUpdates.map(u => {
                    const isReviewing = reviewingUpdateId === u.id
                    const isReviewed = u.progress !== null && u.progress !== undefined

                    return (
                      <div key={u.id} className="bg-background border border-gray-150 rounded-2xl p-4 space-y-3 shadow-xs">
                        {/* Header: Student Name + Roll Number + Git Repo */}
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-primary-light text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                              {u.studentName.charAt(0)}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-text-primary">{u.studentName}</p>
                              <p className="text-[10px] text-text-muted font-mono">{u.registerNumber}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] text-text-muted flex items-center gap-1 font-medium">
                              <Clock className="w-3 h-3 text-text-muted" />
                              {safeFormatDistance(u.timestamp)}
                            </span>
                          </div>
                        </div>

                        {/* Student Update Content */}
                        <p className="text-xs text-text-secondary leading-relaxed bg-white p-3 rounded-xl border border-gray-100 font-medium">
                          {u.content || u.message}
                        </p>

                        {/* Admin Review / Reply Section */}
                        {isReviewing ? (
                          <div className="bg-primary-light/15 border border-primary/20 rounded-xl p-3.5 space-y-3 animate-scale-in">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black text-primary flex items-center gap-1">
                                <TrendingUp className="w-3.5 h-3.5" /> Send Reply Progress Assessment
                              </span>
                              <span className="text-xs font-black px-2.5 py-0.5 bg-primary text-white rounded-md">
                                {replyProgressInput}%
                              </span>
                            </div>

                            {/* Progress slider & quick presets */}
                            <div className="space-y-2">
                              <input
                                type="range"
                                min="0"
                                max="100"
                                step="5"
                                value={replyProgressInput}
                                onChange={(e) => setReplyProgressInput(Number(e.target.value))}
                                className="w-full accent-primary h-2 bg-gray-200 rounded-lg cursor-pointer"
                              />
                              <div className="flex gap-1.5">
                                {[25, 50, 75, 100].map(val => (
                                  <button
                                    key={val}
                                    type="button"
                                    onClick={() => setReplyProgressInput(val)}
                                    className={`flex-1 py-1 text-[10px] font-bold rounded-lg border transition-all ${
                                      replyProgressInput === val ? 'bg-primary text-white border-primary' : 'bg-white text-text-secondary border-gray-200 hover:bg-gray-50'
                                    }`}
                                  >
                                    {val}%
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Feedback reply text input */}
                            <div>
                              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">
                                Reply Feedback to Student
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. Code reviewed. Good progress on authentication."
                                value={replyFeedbackInput}
                                onChange={(e) => setReplyFeedbackInput(e.target.value)}
                                className="input text-xs py-1.5"
                              />
                            </div>

                            <div className="flex gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => setReviewingUpdateId(null)}
                                className="btn-secondary text-xs py-1.5 px-3 flex-1"
                                disabled={isSendingReply}
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSendReply(u.id)}
                                disabled={isSendingReply}
                                className="btn-primary text-xs py-1.5 px-3 flex-1 flex items-center justify-center gap-1.5"
                              >
                                {isSendingReply ? (
                                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <>
                                    <Send className="w-3 h-3" /> Send Reply Progress
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        ) : isReviewed ? (
                          <div className="bg-green-50/70 border border-green-200/80 rounded-xl p-3 flex flex-col gap-1.5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 text-[10px] font-black text-green-800 uppercase tracking-wider">
                                <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                                <span>Progress Sent: <strong className="text-xs text-green-700 font-black">{u.progress}%</strong></span>
                              </div>
                              <button
                                onClick={() => handleStartReview(u)}
                                className="text-[10px] text-primary font-bold hover:underline"
                              >
                                Change Progress / Reply
                              </button>
                            </div>
                            {u.adminFeedback && (
                              <p className="text-xs text-green-950 font-medium italic bg-white/60 p-2 rounded-lg border border-green-100">
                                "{u.adminFeedback}"
                              </p>
                            )}
                            <div className="flex justify-between items-center text-[9px] text-green-700/70 pt-0.5">
                              <span>Reviewed by: {u.reviewedBy || 'Admin'}</span>
                              {u.reviewedAt && <span>{safeFormatDistance(u.reviewedAt)}</span>}
                            </div>
                          </div>
                        ) : (

                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[10px] text-amber-600 font-semibold flex items-center gap-1">
                              <Clock className="w-3 h-3 text-amber-500" /> Awaiting progress reply
                            </span>
                            <button
                              onClick={() => handleStartReview(u)}
                              className="btn-primary text-[10px] py-1 px-3 flex items-center gap-1"
                            >
                              <TrendingUp className="w-3 h-3" /> Send Progress Reply
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Team Members & Scope */}
          {activeTab === 'roster' && (
            <div className="space-y-4 animate-fade-in">
              {/* Description */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Project Scope</h3>
                  <p className="text-xs text-text-secondary leading-relaxed bg-background p-4 border border-gray-150 rounded-2xl font-medium">
                    {project.description}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-text-muted font-semibold px-1">
                  <UserCheck className="w-3.5 h-3.5 text-primary" />
                  <span>Assigned By: <strong className="text-text-primary">{project.assignedBy || 'Faculty Admin'}</strong></span>
                </div>
              </div>

              {/* Members List */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest">Assigned Team Members</h3>
                  <span className="text-xs font-bold text-primary">{assignedStudents.length} Students</span>
                </div>

                <div className="space-y-2">
                  {assignedStudents.map(s => (
                    <div key={s.id} className="flex items-center justify-between p-3 bg-background border border-gray-100 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-primary-light text-primary flex items-center justify-center font-bold text-xs">
                          {s.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-text-primary">{s.name}</p>
                          <p className="text-[10px] text-text-muted font-mono">{s.registerNumber}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-text-muted font-semibold bg-gray-100 px-2 py-0.5 rounded-lg flex items-center gap-1">
                          <Mail className="w-3 h-3 text-text-muted" /> {s.email}
                        </span>
                      </div>
                    </div>
                  ))}
                  {assignedStudents.length === 0 && (
                    <p className="text-xs text-text-muted italic py-4 text-center">No members assigned to this project yet</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main Assign / Assignments Page ───────────────────────────────────────────
export default function Assign() {
  const [activeTab, setActiveTab] = useState('tasks') // 'tasks' | 'projects'
  const [projectFilterTab, setProjectFilterTab] = useState('active') // 'active' | 'history'
  const [students, setStudents] = useState([])
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  // Search/Filters in Member Assignment Lists
  const [studentSearch, setStudentSearch] = useState('')

  // Modals state
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [selectedProject, setSelectedProject] = useState(null)

  // New Task Form
  const [taskForm, setTaskForm] = useState({ title: '', description: '', dueDate: '', assignType: 'all', selectedMembers: [] })
  const [taskError, setTaskError] = useState('')

  // New Project Form
  const [projectForm, setProjectForm] = useState({ id: '', name: '', description: '', gitRepo: '', selectedMembers: [] })
  const [projectError, setProjectError] = useState('')

  const [submitting, setSubmitting] = useState(false)

  const loadData = () => {
    Promise.all([
      adminService.getStudents(),
      adminService.getAssignedTasks(),
      adminService.getProjects()
    ]).then(([stus, tks, prjs]) => {
      setStudents(stus.sort((a,b) => a.name.localeCompare(b.name)))
      setTasks(tks)
      setProjects(prjs)
      setLoading(false)
    })
  }

  const handleUpdateProgressRate = async (projectId, progress) => {
    await adminService.updateProjectProgressRate(projectId, progress)
    setSelectedProject(prev => prev ? ({ ...prev, progress: Number(progress) }) : prev)
    loadData()
  }

  const handleSendUpdateProgress = async (updateId, progress, feedback) => {
    await adminService.sendUpdateProgress(updateId, { progress, admin_feedback: feedback })
    loadData()
  }

  const handleCompleteProject = async (projectId) => {
    await adminService.completeProject(projectId)
    setSelectedProject(prev => prev ? ({ ...prev, status: 'COMPLETED', progress: 100 }) : prev)
    loadData()
  }

  const handleReopenProject = async (projectId) => {
    await adminService.updateProjectStatus(projectId, 'ACTIVE')
    setSelectedProject(prev => prev ? ({ ...prev, status: 'ACTIVE' }) : prev)
    loadData()
  }


  useEffect(() => {
    loadData()
  }, [])

  // Filter students checklist by search query
  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.registerNumber.toLowerCase().includes(studentSearch.toLowerCase())
  )

  // Toggle specific student check state (Tasks Form)
  const handleToggleTaskMember = (id) => {
    setTaskForm(prev => {
      const idx = prev.selectedMembers.indexOf(id)
      const list = [...prev.selectedMembers]
      if (idx === -1) list.push(id)
      else list.splice(idx, 1)
      return { ...prev, selectedMembers: list }
    })
  }

  // Toggle specific student check state (Projects Form)
  const handleToggleProjectMember = (id) => {
    setProjectForm(prev => {
      const idx = prev.selectedMembers.indexOf(id)
      const list = [...prev.selectedMembers]
      if (idx === -1) list.push(id)
      else list.splice(idx, 1)
      return { ...prev, selectedMembers: list }
    })
  }

  const handleCreateTask = async (e) => {
    e.preventDefault()
    setTaskError('')
    const { title, description, dueDate, assignType, selectedMembers } = taskForm
    if (!title || !description || !dueDate) {
      setTaskError('Title, description and deadline are required.')
      return
    }

    if (assignType === 'specific' && selectedMembers.length === 0) {
      setTaskError('Please select at least one student member.')
      return
    }

    setSubmitting(true)
    try {
      // Setup status records
      const statuses = assignType === 'all'
        ? students.map(s => ({ studentId: s.id, status: 'PENDING' }))
        : selectedMembers.map(id => ({ studentId: id, status: 'PENDING' }))

      await adminService.addTask({
        title,
        description,
        dueDate,
        studentStatuses: statuses
      })

      // Reset form
      setTaskForm({ title: '', description: '', dueDate: '', assignType: 'all', selectedMembers: [] })
      setStudentSearch('')
      setShowTaskModal(false)
      loadData()
    } catch (err) {
      setTaskError('Failed to assign new task.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCreateProject = async (e) => {
    e.preventDefault()
    setProjectError('')
    const { id, name, description, gitRepo, selectedMembers } = projectForm
    if (!id || !name || !description) {
      setProjectError('Project ID, Title and description are required.')
      return
    }

    setSubmitting(true)
    try {
      await adminService.addProject({
        id,
        name,
        description,
        git_repo: gitRepo.trim(),
        members: selectedMembers
      })

      // Reset form
      setProjectForm({ id: '', name: '', description: '', gitRepo: '', selectedMembers: [] })
      setStudentSearch('')
      setShowProjectModal(false)
      loadData()
    } catch (err) {
      setProjectError('Failed to assign new project.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Assign Panel</h1>
          <p className="page-subtitle">Distribute projects, assign tasks, and view completion history logs</p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-card border border-gray-200 rounded-xl p-1 gap-1 shadow-sm w-fit">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5
              ${activeTab === 'tasks' ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
          >
            <ClipboardList className="w-4 h-4" /> Tasks
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5
              ${activeTab === 'projects' ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
          >
            <FolderKanban className="w-4 h-4" /> Team Project
          </button>
        </div>
      </div>

      {/* ─── Tasks Tab Content ──────────────────────────────────────────────────── */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-text-secondary uppercase tracking-widest">Assigned Tasks ({tasks.length})</h2>
            <button
              onClick={() => {
                setShowTaskModal(true)
                setTaskError('')
              }}
              className="btn-primary flex items-center gap-2 text-xs font-bold shadow-sm"
            >
              <Plus className="w-4 h-4" /> Assign New Task
            </button>
          </div>

          <div className="space-y-3">
            {tasks.map(task => {
              const completed = task.studentStatuses.filter(s => s.status === 'COMPLETED').length
              const total = task.studentStatuses.length
              return (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className="card border border-gray-150 hover:shadow-card-hover transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 px-5 bg-card"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center flex-shrink-0">
                      <ClipboardList className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors">{task.title}</p>
                        <span className="text-[10px] font-semibold text-text-muted bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-md">
                          By {task.assignedBy || 'Faculty'}
                        </span>
                      </div>
                      <p className="text-xs text-text-muted mt-0.5">Assigned: {task.assignedOn} • Due: {task.dueDate}</p>
                      <p className="text-xs text-text-secondary mt-1 line-clamp-1">{task.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0 self-end sm:self-auto">
                    <div className="text-right">
                      <span className="text-xs font-bold text-primary bg-primary-light px-3 py-1 rounded-full">
                        {completed} / {total} Completed
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors" />
                  </div>
                </div>
              )
            })}
            {tasks.length === 0 && (
              <div className="card text-center py-12 text-text-muted border border-dashed border-gray-200">
                <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No tasks assigned yet</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Projects Tab Content ───────────────────────────────────────────────── */}
      {activeTab === 'projects' && (() => {
        const activeProjects = projects.filter(p => p.status !== 'COMPLETED')
        const completedProjects = projects.filter(p => p.status === 'COMPLETED')
        const displayProjects = projectFilterTab === 'active' ? activeProjects : completedProjects

        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center bg-gray-100 p-1 rounded-xl">
                <button
                  onClick={() => setProjectFilterTab('active')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    projectFilterTab === 'active' ? 'bg-white text-text-primary shadow-xs' : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  Active Projects ({activeProjects.length})
                </button>
                <button
                  onClick={() => setProjectFilterTab('history')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    projectFilterTab === 'history' ? 'bg-white text-emerald-800 shadow-xs' : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  Completed History ({completedProjects.length})
                </button>
              </div>

              <button
                onClick={() => {
                  setShowProjectModal(true)
                  setProjectError('')
                }}
                className="btn-primary flex items-center gap-2 text-xs font-bold shadow-sm"
              >
                <Plus className="w-4 h-4" /> Assign New Project
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {displayProjects.map(proj => (
                <div
                  key={proj.id}
                  onClick={() => setSelectedProject(proj)}
                  className={`card border transition-all cursor-pointer group flex flex-col justify-between p-5 bg-card hover:-translate-y-0.5 ${
                    proj.status === 'COMPLETED' ? 'border-emerald-200 bg-emerald-50/20 hover:shadow-emerald-100' : 'border-gray-150 hover:shadow-card-hover'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-black text-primary bg-primary-light px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono">
                          {proj.id}
                        </span>
                        {proj.status === 'COMPLETED' ? (
                          <span className="text-[9px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300 uppercase tracking-wider">
                            ✔ Completed
                          </span>
                        ) : (
                          <span className="text-[9px] font-semibold text-text-muted bg-gray-100 px-2 py-0.5 rounded-md">
                            By {proj.assignedBy || 'Faculty'}
                          </span>
                        )}
                        {proj.gitRepo && (
                          <a
                            href={proj.gitRepo.startsWith('http') ? proj.gitRepo : `https://${proj.gitRepo}`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded bg-gray-900 text-white hover:bg-black"
                          >
                            <Github className="w-2.5 h-2.5" /> Repo
                          </a>
                        )}
                      </div>
                      <span className="text-xs text-text-muted flex items-center gap-1 font-semibold">
                        <Users className="w-3.5 h-3.5 text-text-muted" /> {proj.members.length} Members
                      </span>
                    </div>
                    <h3 className="text-sm font-black text-text-primary group-hover:text-primary transition-colors leading-snug">
                      {proj.name}
                    </h3>
                    <p className="text-xs text-text-secondary mt-1.5 leading-relaxed line-clamp-2">
                      {proj.description}
                    </p>

                    {/* Progress Bar in Card */}
                    <div className="pt-3 mt-3 border-t border-gray-100 space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className="text-text-muted uppercase tracking-wider">Project Progress</span>
                        <span className={proj.status === 'COMPLETED' ? 'text-emerald-700 font-black' : 'text-primary font-black'}>
                          {proj.progress || 0}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-primary/10 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${
                            proj.status === 'COMPLETED' ? 'bg-emerald-600' : 'bg-primary'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(0, proj.progress || 0))}%` }} 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-bold text-primary pt-3 mt-3 border-t border-gray-50 flex-shrink-0">
                    <span>View Details & History</span>
                    <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-primary transition-all translate-x-0 group-hover:translate-x-0.5" />
                  </div>
                </div>
              ))}
              {displayProjects.length === 0 && (
                <div className="col-span-2 card text-center py-12 text-text-muted border border-dashed border-gray-200">
                  <FolderKanban className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">
                    {projectFilterTab === 'active' ? 'No active projects currently' : 'No completed project history yet'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )
      })()}


      {/* ─── Create Task Modal ─── */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowTaskModal(false)}>
          <div className="bg-card rounded-card shadow-modal w-full max-w-xl flex flex-col max-h-[85vh] animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
              <h2 className="text-base font-black text-text-primary">Assign New Task</h2>
              <button onClick={() => setShowTaskModal(false)} className="p-2 rounded-xl bg-background hover:bg-gray-150 transition-colors">
                <X className="w-5 h-5 text-text-secondary" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {taskError && (
                  <div className="flex items-center gap-2 bg-danger-soft border border-red-150 text-red-700 text-xs rounded-xl p-3">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="font-semibold">{taskError}</span>
                  </div>
                )}

                <div>
                  <label className="label">Task Title *</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. Code Review & Refactoring"
                    value={taskForm.title}
                    onChange={e => setTaskForm(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <label className="label">Description *</label>
                  <textarea
                    rows="3"
                    className="input py-2 resize-none"
                    placeholder="Provide details about the task submission requirements..."
                    value={taskForm.description}
                    onChange={e => setTaskForm(prev => ({ ...prev, description: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <label className="label">Deadline Date *</label>
                  <input
                    type="date"
                    className="input"
                    value={taskForm.dueDate}
                    onChange={e => setTaskForm(prev => ({ ...prev, dueDate: e.target.value }))}
                    required
                  />
                </div>

                {/* Assignment Type */}
                <div>
                  <label className="label">Assign To</label>
                  <div className="flex gap-4 p-1 bg-background border border-gray-150 rounded-xl mb-3">
                    <button
                      type="button"
                      onClick={() => setTaskForm(prev => ({ ...prev, assignType: 'all', selectedMembers: [] }))}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all
                        ${taskForm.assignType === 'all' ? 'bg-primary text-white shadow-sm' : 'text-text-muted'}`}
                    >
                      All Students
                    </button>
                    <button
                      type="button"
                      onClick={() => setTaskForm(prev => ({ ...prev, assignType: 'specific' }))}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all
                        ${taskForm.assignType === 'specific' ? 'bg-primary text-white shadow-sm' : 'text-text-muted'}`}
                    >
                      Specific Members
                    </button>
                  </div>
                </div>

                {/* Specific Student Multiselect Checklist */}
                {taskForm.assignType === 'specific' && (
                  <div className="space-y-2 border border-gray-150 rounded-2xl p-4 bg-background/50">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                      <input
                        type="text"
                        className="input pl-9 py-2 text-xs"
                        placeholder="Search student names..."
                        value={studentSearch}
                        onChange={e => setStudentSearch(e.target.value)}
                      />
                    </div>

                    <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 mt-2">
                      {filteredStudents.map(s => {
                        const checked = taskForm.selectedMembers.includes(s.id)
                        return (
                          <div 
                            key={s.id} 
                            onClick={() => handleToggleTaskMember(s.id)}
                            className={`flex items-center gap-3 p-2.5 rounded-xl border border-gray-100 bg-card cursor-pointer hover:border-primary/30 transition-all select-none
                              ${checked ? 'ring-1 ring-primary/20 border-primary/20 bg-primary-light/5' : ''}`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              readOnly
                              className="accent-primary w-4 h-4 rounded"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-text-primary truncate">{s.name}</p>
                              <p className="text-[10px] text-text-muted font-mono">{s.registerNumber}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <div className="text-[10px] text-text-muted font-bold text-right">
                      {taskForm.selectedMembers.length} Selected
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-100 flex gap-3 flex-shrink-0">
                <button type="button" onClick={() => setShowTaskModal(false)} className="btn-secondary flex-1 py-2.5">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary flex-1 py-2.5 flex items-center justify-center gap-2">
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Assign Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Create Project Modal ─── */}
      {showProjectModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowProjectModal(false)}>
          <div className="bg-card rounded-card shadow-modal w-full max-w-xl flex flex-col max-h-[85vh] animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
              <h2 className="text-base font-black text-text-primary">Assign New Project</h2>
              <button onClick={() => setShowProjectModal(false)} className="p-2 rounded-xl bg-background hover:bg-gray-150 transition-colors">
                <X className="w-5 h-5 text-text-secondary" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {projectError && (
                  <div className="flex items-center gap-2 bg-danger-soft border border-red-150 text-red-700 text-xs rounded-xl p-3">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="font-semibold">{projectError}</span>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-1">
                    <label className="label">Project ID *</label>
                    <input
                      type="text"
                      className="input uppercase font-mono"
                      placeholder="PRJ-105"
                      value={projectForm.id}
                      onChange={e => setProjectForm(prev => ({ ...prev, id: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="label">Project Title *</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. AI Prescription Checker"
                      value={projectForm.name}
                      onChange={e => setProjectForm(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Description *</label>
                  <textarea
                    rows="3"
                    className="input py-2 resize-none"
                    placeholder="Scope of work and architecture parameters..."
                    value={projectForm.description}
                    onChange={e => setProjectForm(prev => ({ ...prev, description: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <label className="label flex items-center gap-1.5">
                    <Github className="w-3.5 h-3.5 text-text-primary" />
                    <span>GitHub Repository URL (Optional)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      className="input pl-9 text-xs"
                      placeholder="https://github.com/organization/repository..."
                      value={projectForm.gitRepo}
                      onChange={e => setProjectForm(prev => ({ ...prev, gitRepo: e.target.value }))}
                    />
                    <Github className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>


                {/* Team Members List */}
                <div className="space-y-2 border border-gray-150 rounded-2xl p-4 bg-background/50">
                  <div className="flex items-center justify-between mb-2">
                    <label className="label mb-0">Select Team Members</label>
                    <div className="relative w-44">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                      <input
                        type="text"
                        className="input pl-8 py-1 text-[10px] rounded-lg"
                        placeholder="Filter by name..."
                        value={studentSearch}
                        onChange={e => setStudentSearch(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                    {filteredStudents.map(s => {
                      const checked = projectForm.selectedMembers.includes(s.id)
                      return (
                        <div 
                          key={s.id} 
                          onClick={() => handleToggleProjectMember(s.id)}
                          className={`flex items-center gap-3 p-2.5 rounded-xl border border-gray-100 bg-card cursor-pointer hover:border-primary/30 transition-all select-none
                            ${checked ? 'ring-1 ring-primary/20 border-primary/20 bg-primary-light/5' : ''}`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            readOnly
                            className="accent-primary w-4 h-4 rounded"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-text-primary truncate">{s.name}</p>
                            <p className="text-[10px] text-text-muted font-mono">{s.registerNumber}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="text-[10px] text-text-muted font-bold text-right pt-1">
                    {projectForm.selectedMembers.length} Members Assigned
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 flex gap-3 flex-shrink-0">
                <button type="button" onClick={() => setShowProjectModal(false)} className="btn-secondary flex-1 py-2.5">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary flex-1 py-2.5 flex items-center justify-center gap-2">
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Assign Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Details Popup */}
      {selectedTask && (
        <TaskHistoryModal
          task={selectedTask}
          students={students}
          onClose={() => setSelectedTask(null)}
        />
      )}

      {/* Project Details Popup */}
      {selectedProject && (
        <ProjectHistoryModal
          project={selectedProject}
          students={students}
          onUpdateProgressRate={handleUpdateProgressRate}
          onSendUpdateProgress={handleSendUpdateProgress}
          onCompleteProject={handleCompleteProject}
          onReopenProject={handleReopenProject}
          onClose={() => setSelectedProject(null)}
        />
      )}


    </div>
  )
}
