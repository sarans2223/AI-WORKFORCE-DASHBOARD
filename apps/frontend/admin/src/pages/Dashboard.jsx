import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users, CheckCircle2, XCircle, MapPin,
  X, Clock, Sun, Sunset, ChevronRight, Plus, Search, FolderKanban, Info, Activity,
  Github, ExternalLink, Send, TrendingUp, Check, Eye, EyeOff
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { adminService } from '../services/adminService'
import { useAdminAuth } from '../contexts/AdminAuthContext'

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


function getAutoSession() {
  const hour = new Date().getHours()
  return hour < 12 ? 'forenoon' : 'afternoon'
}

const getGreeting = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}


// ─── Add Team Member Modal ──────────────────────────────────────────────────
function AddMemberModal({ project, students, onAdd, onClose }) {
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState([])

  // Filter students who are NOT in the project already
  const candidates = students.filter(s =>
    !project.members.includes(s.id) &&
    (s.name.toLowerCase().includes(search.toLowerCase()) ||
     s.registerNumber.toLowerCase().includes(search.toLowerCase()))
  )

  const handleToggle = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-card rounded-card shadow-modal w-full max-w-md flex flex-col max-h-[80vh] animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="text-base font-black text-text-primary">Add Team Members</h2>
            <p className="text-xs text-text-muted mt-0.5">{project.name}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-background hover:bg-gray-150 transition-colors border border-gray-200">
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        <div className="p-6 flex-1 flex flex-col min-h-0 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              className="input pl-9 py-2 text-xs"
              placeholder="Search students..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {candidates.map(s => {
              const checked = selectedIds.includes(s.id)
              return (
                <div 
                  key={s.id} 
                  onClick={() => handleToggle(s.id)}
                  className={`flex items-center gap-3 p-3 rounded-2xl border border-gray-100 bg-background cursor-pointer hover:border-primary/30 transition-all select-none
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
            {candidates.length === 0 && (
              <p className="text-xs text-text-muted italic text-center py-6">No eligible students found</p>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 flex gap-3 flex-shrink-0">
          <button type="button" onClick={onClose} className="btn-secondary flex-1 py-2.5">Cancel</button>
          <button
            onClick={() => onAdd(selectedIds)}
            disabled={selectedIds.length === 0}
            className="btn-primary flex-1 py-2.5"
          >
            Add Members
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Project Details & Administration Modal ──────────────────────────────────
function ProjectDetailsModal({ project, students, onRemoveMember, onAddMembersClick, onUpdateProgressRate, onSendUpdateProgress, onCompleteProject, onReopenProject, onClose }) {
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

  const projectMembers = students.filter(s => project.members.includes(s.id))

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
      await onUpdateProgressRate(project.id, overallProgressInput)
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
    const initialProgress = upd.progress !== null && upd.progress !== undefined
      ? upd.progress
      : (upd.studentProgress !== null && upd.studentProgress !== undefined ? upd.studentProgress : 50)
    setReplyProgressInput(initialProgress)
    setReplyFeedbackInput(upd.adminFeedback || '')
  }

  const handleSendReply = async (updateId) => {
    setIsSendingReply(true)
    try {
      await onSendUpdateProgress(updateId, replyProgressInput, replyFeedbackInput)
      setReviewingUpdateId(null)
      await loadSpecificUpdates()
    } finally {
      setIsSendingReply(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
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
          <button onClick={onClose} className="p-2 rounded-xl bg-background hover:bg-gray-150 transition-colors border border-gray-200 cursor-pointer">
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Top Banner: Git Repo & Adjustable Progress Rate */}
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
                    className="px-2.5 py-1 rounded-lg bg-green-500 hover:bg-green-600 text-white text-[10px] font-black transition-colors cursor-pointer"
                  >
                    {isSavingOverallProgress ? '...' : 'Save'}
                  </button>
                  <button
                    onClick={() => setIsEditingOverallProgress(false)}
                    className="px-2 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-[10px] font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div>
                    <span className="text-[8px] uppercase tracking-wider text-gray-400 font-bold block text-right">PROGRESS RATE</span>
                    <span className="text-sm font-black text-green-400">{project.progress || 0}%</span>
                  </div>
                  <button
                    onClick={() => {
                      setOverallProgressInput(project.progress || 0)
                      setIsEditingOverallProgress(true)
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-gray-200 text-xs font-bold transition-colors cursor-pointer"
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
                  className="px-3 py-1.5 rounded-xl bg-white border border-emerald-300 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
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
              className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'updates' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-primary'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Project Updates ({projectUpdates.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('roster')}
              className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'roster' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-primary'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Team Roster ({projectMembers.length})</span>
            </button>
          </div>

          {/* Tab 1: Updates Feed */}
          {activeTab === 'updates' && (
            <div className="space-y-3">
              {loadingUpdates ? (
                <div className="flex items-center justify-center py-10">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : projectUpdates.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-gray-200 rounded-2xl bg-background/50">
                  <Activity className="w-8 h-8 text-text-muted mx-auto mb-2 opacity-40" />
                  <p className="text-xs font-bold text-text-secondary">No updates posted yet by this project team</p>
                  <p className="text-[10px] text-text-muted mt-0.5">When students submit progress updates, they will appear here for review and progress scoring.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {projectUpdates.map(u => {
                    const isReviewing = reviewingUpdateId === u.id
                    const isReviewed = u.progress !== null && u.progress !== undefined

                    return (
                      <div key={u.id} className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3 shadow-2xs">
                        {/* Header: Student Name + Roll Number + Timestamp */}
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-black flex-shrink-0">
                              {u.studentName.charAt(0)}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-text-primary leading-tight">{u.studentName}</p>
                              {u.registerNumber && (
                                <p className="text-[10px] text-text-muted font-mono">{u.registerNumber}</p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] text-text-muted flex items-center gap-1 font-medium">
                              <Clock className="w-3 h-3 text-text-muted" />
                              {safeFormatDistance(u.timestamp)}
                            </span>
                          </div>
                        </div>

                        {/* Student Update Message Content */}
                        <div className="text-xs text-text-secondary leading-relaxed bg-gray-50/80 p-3 rounded-xl border border-gray-150 font-medium">
                          {u.content || u.message}
                        </div>

                        {/* Student Claimed Completion Score */}
                        {u.studentProgress !== null && u.studentProgress !== undefined && (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50/90 border border-blue-200/70 text-[11px] font-bold text-blue-900">
                            <span className="text-[10px] uppercase tracking-wider text-blue-700 font-semibold">Student Score:</span>
                            <span className="px-1.5 py-0.2 bg-blue-600 text-white rounded font-black text-[10px]">
                              {u.studentProgress}%
                            </span>
                          </div>
                        )}

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
                                {[25, 50, 75, 90, 100].map(val => (
                                  <button
                                    key={val}
                                    type="button"
                                    onClick={() => setReplyProgressInput(val)}
                                    className={`flex-1 py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
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
                                placeholder="e.g. Completed backend database migrations and linked API routes. Good progress!"
                                value={replyFeedbackInput}
                                onChange={(e) => setReplyFeedbackInput(e.target.value)}
                                className="input text-xs py-1.5"
                                autoFocus
                              />
                            </div>

                            <div className="flex gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => setReviewingUpdateId(null)}
                                className="btn-secondary text-xs py-1.5 px-3 flex-1 cursor-pointer"
                                disabled={isSendingReply}
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSendReply(u.id)}
                                disabled={isSendingReply}
                                className="btn-primary text-xs py-1.5 px-3 flex-1 flex items-center justify-center gap-1.5 cursor-pointer"
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
                          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 text-xs font-black text-emerald-800">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                <span className="uppercase tracking-wider text-[11px]">PROGRESS SENT: {u.progress}%</span>
                              </div>
                              <button
                                onClick={() => handleStartReview(u)}
                                className="text-xs text-primary font-bold hover:underline cursor-pointer"
                              >
                                Change Progress / Reply
                              </button>
                            </div>
                            {u.adminFeedback && (
                              <div className="bg-white/90 p-3 rounded-xl border border-emerald-100 text-xs text-text-primary italic font-medium">
                                "{u.adminFeedback}"
                              </div>
                            )}
                            <div className="flex items-center justify-between text-[10px] text-text-muted">
                              <span>Reviewed by: <strong className="text-text-primary font-bold">{u.reviewedBy || 'Admin'}</strong></span>
                              {u.reviewedAt && <span>{safeFormatDistance(u.reviewedAt)}</span>}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[11px] text-amber-600 font-semibold flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-amber-500" /> Awaiting progress reply
                            </span>
                            <button
                              onClick={() => handleStartReview(u)}
                              className="btn-primary text-xs py-1.5 px-3.5 flex items-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              <TrendingUp className="w-3.5 h-3.5" /> Send Progress Reply
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
              <div>
                <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Project Scope</h3>
                <p className="text-xs text-text-secondary leading-relaxed bg-background p-4 border border-gray-150 rounded-2xl font-medium">
                  {project.description}
                </p>
              </div>

              {/* Members list */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest">Team Members</h3>
                  <button
                    onClick={onAddMembersClick}
                    className="flex items-center gap-1.5 text-xs font-bold text-primary bg-primary-light hover:bg-primary-muted px-3.5 py-1.5 rounded-xl transition-all active:scale-95 border border-primary/10 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Member
                  </button>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {projectMembers.map(s => (
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
                      <button
                        onClick={() => onRemoveMember(s.id, s.name)}
                        className="p-1.5 rounded-xl bg-danger-soft hover:bg-red-100 text-red-600 transition-colors"
                        title="Remove Member"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {projectMembers.length === 0 && (
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


// ─── Project Updates History Modal with Progress Review ──────────────────────
function ProjectUpdatesModal({ updates, updateFilter, setUpdateFilter, onToggleRead, onSendProgress, onOpenProject, onClose }) {
  const [reviewingId, setReviewingId] = useState(null)
  const [progressInput, setProgressInput] = useState(50)
  const [feedbackInput, setFeedbackInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const filtered = updates.filter(u => {
    if (updateFilter === 'unread') return !u.read
    if (updateFilter === 'read') return Boolean(u.read)
    return true
  })

  const handleStartReview = (u) => {
    setReviewingId(u.id)
    setProgressInput(u.progress !== null && u.progress !== undefined ? u.progress : 50)
    setFeedbackInput(u.adminFeedback || '')
  }

  const handleSubmitProgress = async (updateId) => {
    setIsSubmitting(true)
    try {
      await onSendProgress(updateId, progressInput, feedbackInput)
      setReviewingId(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-card rounded-card shadow-modal w-full max-w-2xl flex flex-col max-h-[85vh] animate-scale-in" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border-b border-gray-100 flex-shrink-0 bg-primary-light/30 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-text-primary">Project Updates Feed</h2>
              <p className="text-xs text-text-muted mt-0.5 font-medium">Review submissions and send progress feedback to teams</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* All / Unread / Read Tabs */}
            <div className="flex bg-background border border-gray-150 rounded-xl p-0.5 gap-0.5 shadow-sm">
              {[
                { key: 'all', label: 'All' },
                { key: 'unread', label: 'Unread' },
                { key: 'read', label: 'Read' }
              ].map(({ key, label }) => {
                const count = key === 'all' 
                  ? updates.length 
                  : key === 'unread' 
                    ? updates.filter(u => !u.read).length 
                    : updates.filter(u => u.read).length

                return (
                  <button
                    key={key}
                    onClick={() => setUpdateFilter(key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5
                      ${updateFilter === key ? 'bg-primary text-white shadow-xs' : 'text-text-muted hover:text-text-primary'}`}
                  >
                    {label}
                    <span className={`px-1.5 py-0.2 rounded-md text-[10px]
                      ${updateFilter === key ? 'bg-white/20 text-white' : 'bg-gray-100 text-text-muted'}`}>
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>

            <button onClick={onClose} className="p-2 rounded-xl bg-background hover:bg-gray-150 transition-colors border border-gray-200">
              <X className="w-5 h-5 text-text-secondary" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-background/30">
          {filtered.map(u => {
            const initial = u.studentName.charAt(0)
            const isEditing = reviewingId === u.id
            const hasProgress = u.progress !== null && u.progress !== undefined

            return (
              <div 
                key={u.id}
                className={`border transition-all rounded-2xl p-4 space-y-3 bg-card ${
                  !u.read ? 'border-primary/40 bg-primary-light/5 shadow-sm' : 'border-gray-150 shadow-xs hover:border-primary/30'
                }`}
              >
                {/* Header Row: Student + Git Repo + Project Badge + Read Toggle */}
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-inner">
                      {initial}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-text-primary">{u.studentName}</span>
                        <span className="text-[10px] text-text-muted font-mono">{u.registerNumber}</span>
                        {!u.read && (
                          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" title="Unread Update" />
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-[9px] text-text-muted mt-0.5">
                        <Clock className="w-3 h-3 text-text-muted" />
                        <span>{safeFormatDistance(u.timestamp)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Mark as Read / Unread toggle */}
                    <button
                      onClick={() => onToggleRead(u.id, u.read)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-bold border transition-colors ${
                        u.read 
                          ? 'bg-gray-100 text-text-muted border-gray-200 hover:bg-gray-200' 
                          : 'bg-primary-light text-primary border-primary/20 hover:bg-primary/20'
                      }`}
                      title={u.read ? 'Mark as Unread' : 'Mark as Read'}
                    >
                      {u.read ? <EyeOff className="w-2.5 h-2.5" /> : <Eye className="w-2.5 h-2.5" />}
                      {u.read ? 'Mark Unread' : 'Mark Read'}
                    </button>

                    {/* Git Repo Tag */}
                    {u.gitRepo && (
                      <a
                        href={u.gitRepo.startsWith('http') ? u.gitRepo : `https://${u.gitRepo}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-900 text-white rounded-lg text-[10px] font-bold hover:bg-black transition-colors shadow-xs"
                        title="View GitHub Repository"
                      >
                        <Github className="w-3 h-3 text-white" />
                        <span className="truncate max-w-[120px]">{u.gitRepo.replace(/^https?:\/\/(www\.)?github\.com\//, '')}</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                      </a>
                    )}

                    {/* Clickable Project Badge */}
                    <button
                      onClick={() => onOpenProject && onOpenProject(u.teamId || u.projectId)}
                      className="text-[9px] font-bold text-primary bg-primary-light hover:bg-primary hover:text-white transition-colors border border-primary/10 px-2.5 py-1 rounded-lg font-mono flex items-center gap-1"
                      title="Open this specific project modal"
                    >
                      <span>{u.projectId} · {u.projectName}</span>
                      <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                    </button>
                  </div>
                </div>

                {/* Message Content */}
                <p className="text-xs text-text-secondary leading-relaxed font-semibold bg-background p-3 rounded-xl border border-gray-100">
                  {u.message || u.content}
                </p>

                {/* Admin Progress Assessment & Feedback Box */}
                {isEditing ? (
                  <div className="bg-primary-light/15 border border-primary/20 rounded-xl p-3.5 space-y-3 animate-scale-in">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-primary flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" /> Set Progress for this Update
                      </span>
                      <span className="text-xs font-black px-2.5 py-0.5 bg-primary text-white rounded-md">
                        {progressInput}%
                      </span>
                    </div>

                    {/* Progress Slider & Quick Buttons */}
                    <div className="space-y-2">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={progressInput}
                        onChange={(e) => setProgressInput(Number(e.target.value))}
                        className="w-full accent-primary h-2 bg-gray-200 rounded-lg cursor-pointer"
                      />
                      <div className="flex gap-1.5">
                        {[25, 50, 75, 100].map(val => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setProgressInput(val)}
                            className={`flex-1 py-1 text-[10px] font-bold rounded-lg border transition-all ${
                              progressInput === val ? 'bg-primary text-white border-primary' : 'bg-white text-text-secondary border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            {val}%
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Feedback Input */}
                    <div>
                      <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">
                        Feedback / Remarks to Student
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Good progress on authentication module. Proceed with API tests."
                        value={feedbackInput}
                        onChange={(e) => setFeedbackInput(e.target.value)}
                        className="input text-xs py-1.5"
                      />
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setReviewingId(null)}
                        className="btn-secondary text-xs py-1.5 px-3 flex-1"
                        disabled={isSubmitting}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSubmitProgress(u.id)}
                        disabled={isSubmitting}
                        className="btn-primary text-xs py-1.5 px-3 flex-1 flex items-center justify-center gap-1.5"
                      >
                        {isSubmitting ? (
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <Send className="w-3 h-3" /> Send Progress
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : hasProgress ? (
                  <div className="bg-green-50/70 border border-green-200/80 rounded-xl p-3 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[10px] font-black text-green-800 uppercase tracking-wider">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                        <span>Progress Assessed: <strong className="text-xs text-green-700 font-black">{u.progress}%</strong></span>
                      </div>
                      <button
                        onClick={() => handleStartReview(u)}
                        className="text-[10px] text-primary font-bold hover:underline"
                      >
                        Edit Review
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
                      <Clock className="w-3 h-3 text-amber-500" /> No progress evaluated yet
                    </span>
                    <button
                      onClick={() => handleStartReview(u)}
                      className="btn-primary text-[10px] py-1 px-3 flex items-center gap-1"
                    >
                      <TrendingUp className="w-3 h-3" /> Send Progress
                    </button>
                  </div>
                )}
              </div>
            )
          })}
          {filtered.length === 0 && (
            <div className="py-12 text-center text-text-muted border border-dashed border-gray-250 rounded-2xl bg-background/50">
              <Activity className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-xs font-bold">No updates found in this view</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}



// ─── Generic Student List Modal ────────────────────────────────────────────────
function StudentListModal({ title, subtitle, students, badge, badgeColor, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-card rounded-card shadow-modal w-full max-w-md animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-base font-black text-text-primary">{title}</h2>
            {subtitle && <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-background hover:bg-gray-150 transition-colors">
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>
        <div className="p-6 space-y-2 max-h-96 overflow-y-auto">
          {students.length === 0 ? (
            <div className="text-center py-8 text-text-muted">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No students to show</p>
            </div>
          ) : students.map((s, i) => (
            <div key={s.id || i} className={`flex items-center justify-between p-3 rounded-xl border
              ${badgeColor === 'green' ? 'bg-success-soft/20 border-green-100' :
                badgeColor === 'red' ? 'bg-danger-soft/20 border-red-155' :
                'bg-warning-soft/20 border-amber-100'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black text-white
                  ${badgeColor === 'green' ? 'bg-success' : badgeColor === 'red' ? 'bg-danger' : 'bg-warning'}`}>
                  {s.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-text-primary">{s.name}</p>
                  <p className="text-xs text-text-muted">{s.registerNumber}</p>
                </div>
              </div>
              {badge && (
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full
                  ${badgeColor === 'green' ? 'bg-success-soft text-green-700' :
                    badgeColor === 'red' ? 'bg-danger-soft text-red-700' :
                    'bg-warning-soft text-amber-700'}`}>
                  {badge}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Square Stat Card ───────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color, onClick }) {
  const colorMap = {
    primary: { bg: 'bg-primary-light', text: 'text-primary', border: 'border-primary/20', hover: 'hover:border-primary/40' },
    success: { bg: 'bg-success-soft', text: 'text-green-600', border: 'border-green-200', hover: 'hover:border-green-400' },
    danger:  { bg: 'bg-danger-soft',  text: 'text-red-650',   border: 'border-red-200',   hover: 'hover:border-red-400' },
    warning: { bg: 'bg-warning-soft', text: 'text-amber-600', border: 'border-amber-200',  hover: 'hover:border-amber-400' },
  }
  const c = colorMap[color]
  const clickable = !!onClick
  return (
    <button
      onClick={onClick}
      disabled={!clickable}
      className={`card w-full aspect-square lg:aspect-auto lg:h-22 flex flex-col lg:flex-row items-center justify-center lg:justify-start text-center lg:text-left p-1 sm:p-4 lg:p-5 border-2 transition-all duration-200 relative rounded-2xl sm:rounded-3xl lg:gap-4
        ${c.border} ${clickable ? `${c.hover} hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer active:scale-95` : 'cursor-default'}`}
    >
      <div className={`w-7 h-7 sm:w-10 sm:h-10 lg:w-11 lg:h-11 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 mb-2 lg:mb-0 ${c.bg}`}>
        <Icon className={`w-3.5 h-3.5 sm:w-5 sm:h-5 lg:w-5.5 lg:h-5.5 ${c.text}`} />
      </div>
      <div className="w-full lg:min-w-0 lg:flex-1">
        <p className="text-sm sm:text-2xl font-black text-text-primary leading-none mb-1 sm:mb-1.5">{value}</p>
        <p className="text-[8px] sm:text-xs font-extrabold text-text-secondary leading-tight truncate w-full">{label}</p>
      </div>
      {clickable && (
        <ChevronRight className={`absolute right-1.5 top-1.5 lg:right-4 lg:top-1/2 lg:-translate-y-1/2 w-3.5 h-3.5 ${c.text} opacity-50 hidden sm:block`} />
      )}
    </button>
  )
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate()
  const { admin } = useAdminAuth()
  const [students, setStudents] = useState([])
  const [attendance, setAttendance] = useState(null)
  const [passes, setPasses] = useState([])
  const [leaves, setLeaves] = useState([])
  const [projects, setProjects] = useState([])
  const [updates, setUpdates] = useState([])
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(getAutoSession())

  // Modals
  const [modal, setModal] = useState(null) // 'present' | 'absent' | 'passes'
  const [selectedProject, setSelectedProject] = useState(null)
  const [activeAddMemberProj, setActiveAddMemberProj] = useState(null)
  const [showUpdatesModal, setShowUpdatesModal] = useState(false)

  // Updates tab filter: 'unread' | 'read'
  const [updateFilter, setUpdateFilter] = useState('unread')

  const loadData = () => {
    Promise.all([
      adminService.getStudents(),
      adminService.getTodayAttendance(),
      adminService.getPasses(),
      adminService.getLeaves(),
      adminService.getProjects(),
      adminService.getProjectUpdates(),
    ]).then(([stus, att, ps, lvs, prjs, upds]) => {
      setStudents(stus)
      setAttendance(att)
      setPasses(ps)
      setLeaves(lvs)
      setProjects(prjs)
      setUpdates(upds)
      setLoading(false)
    })
  }

  useEffect(() => {
    loadData()
  }, [])

  // Sync selectedProject details if state changes (e.g. member is added or removed)
  useEffect(() => {
    if (selectedProject) {
      const updated = projects.find(p => p.id === selectedProject.id)
      if (updated) {
        setSelectedProject(updated)
      }
    }
  }, [projects, selectedProject])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const sessionLabel = session === 'forenoon' ? 'Forenoon' : 'Afternoon'
  const sessionRecords = attendance?.[session]?.records || []
  const presentIds = sessionRecords.filter(r => r.status === 'PRESENT').map(r => r.studentId)
  const absentIds = sessionRecords.filter(r => r.status === 'ABSENT').map(r => r.studentId)
  const presentStudents = students.filter(s => presentIds.includes(s.id))
  const absentStudents = students.filter(s => absentIds.includes(s.id))
  const activePasses = passes.filter(p => p.status === 'ACTIVE')

  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const onLeaveToday = leaves.filter(l => l.startDate <= todayStr && l.endDate >= todayStr)
  const onLeaveTodayStudents = onLeaveToday.map(l => students.find(s => s.id === l.studentId)).filter(Boolean)

  // For absent modal: show absent + on leave with distinct badges
  const absentModalStudents = [
    ...absentStudents.map(s => ({ ...s, _badge: 'Absent', _color: 'red' })),
    ...onLeaveTodayStudents.map(s => ({ ...s, _badge: 'On Leave', _color: 'amber' })),
  ]

  // Filter projects led by the current coordinator
  const currentAdminName = admin?.name || (() => {
    try {
      const stored = localStorage.getItem('admin_user')
      if (stored) {
        const u = JSON.parse(stored)
        return u?.name
      }
    } catch (e) {}
    return 'Dr. Anitha Kumar'
  })()

  const ledProjects = projects.filter(p => 
    p.assignedBy && 
    p.assignedBy.trim().toLowerCase() === currentAdminName.trim().toLowerCase()
  )

  const handleRemoveMember = async (projId, memberId, memberName) => {
    if (window.confirm(`Are you sure you want to remove ${memberName} from this project?`)) {
      await adminService.removeProjectMember(projId, memberId)
      loadData()
    }
  }

  const handleAddMembers = async (selectedIds) => {
    if (!activeAddMemberProj) return
    await adminService.addProjectMembers(activeAddMemberProj.id, selectedIds)
    setActiveAddMemberProj(null)
    loadData()
  }

  const handleToggleRead = async (updateId, isRead) => {
    await adminService.markUpdateAsRead(updateId, !isRead)
    loadData()
  }


  const handleSendProgress = async (updateId, progress, feedback) => {
    await adminService.sendUpdateProgress(updateId, { progress, admin_feedback: feedback })
    loadData()
  }

  const handleUpdateProgressRate = async (projectId, progress) => {
    await adminService.updateProjectProgressRate(projectId, progress)
    setSelectedProject(prev => prev ? ({ ...prev, progress: Number(progress) }) : prev)
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

  const closeModal = () => setModal(null)


  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Premium Greeting Hero Box */}
      <div className="card bg-primary-light border border-primary/20 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 relative overflow-hidden gap-4">
        <div className="relative z-10 flex items-center gap-3.5">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white flex items-center justify-center text-primary text-lg sm:text-xl font-black shadow-sm border border-primary/5 flex-shrink-0">
            A
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-text-primary leading-tight">
              {getGreeting()}, <span className="text-primary">{admin?.name || 'Dr. Anitha Kumar'}</span>
            </h1>
            <p className="text-text-secondary text-[11px] sm:text-xs mt-0.5 font-medium tracking-wide">
              Admin Portal • {format(new Date(), 'EEEE, dd MMMM yyyy')}
            </p>
          </div>
        </div>
        
        {/* Session Toggle & Live Time Controls */}
        <div className="relative z-10 flex items-center gap-2 mt-2 sm:mt-0 flex-shrink-0 flex-wrap sm:flex-nowrap">
          <div className="flex bg-white/85 border border-primary/10 rounded-xl p-0.5 shadow-xs">
            {['forenoon', 'afternoon'].map(s => (
              <button
                key={s}
                onClick={() => setSession(s)}
                className={`px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-black transition-all capitalize
                  ${session === s ? 'bg-primary text-white shadow-xs' : 'text-text-muted hover:text-text-primary'}`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5 bg-white/85 border border-primary/10 rounded-xl px-2.5 py-1.5 shadow-xs">
            <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            <span className="text-[10px] sm:text-xs text-text-muted font-black">{format(new Date(), 'hh:mm a')}</span>
          </div>
        </div>

        <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
      </div>

      {/* Stat Cards - Grid of 4 */}
      <div className="grid grid-cols-4 lg:grid-cols-3 gap-2 sm:gap-4">
        <StatCard
          icon={Users}
          label="Total"
          value={students.length}
          color="primary"
        />
        <StatCard
          icon={CheckCircle2}
          label="Present"
          value={presentStudents.length}
          color="success"
          onClick={() => setModal('present')}
        />
        <StatCard
          icon={XCircle}
          label="Absent"
          value={absentStudents.length + onLeaveTodayStudents.length}
          color="danger"
          onClick={() => setModal('absent')}
        />
        <div className="lg:hidden w-full">
          <StatCard
            icon={MapPin}
            label="Passes"
            value={activePasses.length}
            color="warning"
            onClick={() => setModal('passes')}
          />
        </div>
      </div>

      {/* Project Updates & Active Passes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Updates Card */}
        <div className="lg:col-span-2">
          <div 
            onClick={() => setShowUpdatesModal(true)}
            className="card border border-gray-150 p-6 flex flex-col h-full hover:border-primary/30 hover:shadow-card-hover cursor-pointer transition-all active:scale-[0.99] group bg-card"
            title="Click to expand updates log"
          >
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <div>
                <h2 className="text-base font-black text-text-primary group-hover:text-primary transition-colors">Project Updates</h2>
                <p className="text-xs text-text-secondary mt-0.5 font-medium">Recent progress from your teams • Click to review</p>
              </div>
              <div className="flex items-center gap-2">
                {updates.filter(u => !u.read).length > 0 && (
                  <span className="bg-primary text-white text-[9px] font-bold px-2 py-0.5 rounded-full animate-pulse flex-shrink-0">
                    {updates.filter(u => !u.read).length} New
                  </span>
                )}
                <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors flex-shrink-0" />
              </div>
            </div>

            {/* Display only the top 2 updates */}
            <div className="space-y-2.5">
              {updates.slice(0, 2).map(u => {
                const initial = u.studentName.charAt(0)
                return (
                  <div 
                    key={u.id}
                    className={`border rounded-xl p-3.5 flex gap-3 transition-all duration-200
                      ${!u.read ? 'bg-primary-light/10 border-primary/20 shadow-xs' : 'bg-background border-gray-100 hover:border-gray-205'}`}
                  >
                    {/* Avatar circle */}
                    <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-inner">
                      {initial}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1.5 mb-1.5">
                        <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                          <span className="text-xs font-bold text-text-primary truncate">{u.studentName}</span>
                          <span className="text-[9px] text-text-muted font-mono flex-shrink-0">{u.registerNumber}</span>
                          {!u.read && <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse flex-shrink-0" />}
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap flex-shrink-0">
                          {u.gitRepo && (
                            <span className="inline-flex items-center gap-1 text-[8px] font-bold px-2 py-0.5 rounded bg-gray-900 text-white">
                              <Github className="w-2.5 h-2.5" /> Repo
                            </span>
                          )}
                          <span className="text-[8px] font-bold text-primary bg-primary-light border border-primary/10 px-2 py-0.5 rounded-md font-mono">
                            {u.projectId} · {u.projectName}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-text-secondary leading-relaxed font-semibold">
                        {u.message}
                      </p>

                      <div className="flex items-center justify-between gap-2 text-[9px] text-text-muted mt-2 pt-1 border-t border-gray-100/60">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-text-muted" />
                          <span>{u.timestamp}</span>
                        </div>
                        {u.progress !== null && u.progress !== undefined ? (
                          <span className="font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                            Progress: {u.progress}%
                          </span>
                        ) : (
                          <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Needs Review
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
              {updates.length === 0 && (
                <div className="py-12 text-center text-text-muted border border-dashed border-gray-250 rounded-2xl bg-background/30">
                  <Info className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-xs font-bold">No updates yet today</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Active Passes Side Panel */}
        <div className="hidden lg:flex lg:col-span-1">
          <div 
            onClick={() => navigate('/passes')}
            className="card border border-gray-150 p-6 flex flex-col w-full hover:border-primary/30 hover:shadow-card-hover cursor-pointer transition-all active:scale-[0.99] group bg-card"
            title="Click to view movement passes directory"
          >
            <div className="mb-4 flex-shrink-0 flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-text-primary group-hover:text-primary transition-colors">Active Passes</h2>
                <p className="text-[10px] text-text-secondary mt-0.5">{activePasses.length} student{activePasses.length !== 1 ? 's' : ''} currently out</p>
              </div>
              <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors font-bold" />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[220px] pr-1">
              {activePasses.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-6 text-text-muted border border-dashed border-gray-250 rounded-2xl bg-background/30">
                  <MapPin className="w-7 h-7 mx-auto mb-1.5 opacity-30" />
                  <p className="text-[11px] font-bold">No active passes today</p>
                </div>
              ) : (
                activePasses.map(pass => (
                  <div 
                    key={pass.id} 
                    className="bg-info-soft/30 border border-blue-100 p-3 rounded-2xl space-y-1.5 animate-fade-in"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-text-primary truncate">{pass.studentName}</p>
                        <p className="text-[9px] font-semibold text-text-muted font-mono">{pass.registerNumber}</p>
                      </div>
                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 uppercase flex-shrink-0">
                        {pass.movementType}
                      </span>
                    </div>
                    <div className="bg-white/60 rounded-xl p-2 border border-blue-100/50">
                      <p className="text-[9px] font-bold text-text-secondary leading-snug">{pass.reason}</p>
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-text-muted pt-1 border-t border-blue-100/30">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-blue-500" /> {pass.timing}
                      </span>
                      <span className="font-bold text-blue-700">OUT</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Projects You Lead (Full width card) */}
      {ledProjects.length > 0 && (
        <div className="card border border-gray-150 p-6 flex flex-col min-h-[220px] bg-card">
          <div className="mb-4 flex-shrink-0">
            <h2 className="text-base font-black text-text-primary">Projects You Lead</h2>
            <p className="text-xs text-text-secondary mt-0.5 font-medium">Manage team rosters and progress for projects assigned to you</p>
          </div>
          
          {/* Grid of Led Projects */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ledProjects.map(proj => (
              <div
                key={proj.id}
                onClick={() => setSelectedProject(proj)}
                className="bg-background border border-gray-200 hover:border-primary/30 hover:shadow-md p-4 rounded-2xl cursor-pointer active:scale-[0.98] transition-all flex flex-col justify-between gap-3 group"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-black text-primary bg-primary-light border border-primary/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono">
                      {proj.id}
                    </span>
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
                  <h3 className="text-xs font-black text-text-primary group-hover:text-primary transition-colors truncate">
                    {proj.name}
                  </h3>
                  {proj.description && (
                    <p className="text-[11px] text-text-secondary line-clamp-2 leading-relaxed">
                      {proj.description}
                    </p>
                  )}
                </div>

                {/* Progress Bar in Card */}
                <div className="pt-2 border-t border-gray-150/70 space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-text-muted uppercase tracking-wider">Progress</span>
                    <span className="text-primary font-black">{proj.progress || 0}%</span>
                  </div>
                  <div className="h-1.5 bg-primary/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-300" 
                      style={{ width: `${Math.min(100, Math.max(0, proj.progress || 0))}%` }} 
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Project Updates Expanded Modal */}
      {showUpdatesModal && (
        <ProjectUpdatesModal
          updates={updates}
          updateFilter={updateFilter}
          setUpdateFilter={setUpdateFilter}
          onToggleRead={handleToggleRead}
          onSendProgress={handleSendProgress}
          onOpenProject={(projId) => {
            const found = projects.find(p => String(p.id) === String(projId) || p.name === projId || p.teamCode === projId)
            if (found) {
              setSelectedProject(found)
              setShowUpdatesModal(false)
            } else {
              navigate('/assign')
            }
          }}
          onClose={() => setShowUpdatesModal(false)}
        />
      )}


      {/* Project Details Modal */}
      {selectedProject && (
        <ProjectDetailsModal
          project={selectedProject}
          students={students}
          onRemoveMember={(memberId, memberName) => handleRemoveMember(selectedProject.id, memberId, memberName)}
          onAddMembersClick={() => setActiveAddMemberProj(selectedProject)}
          onUpdateProgressRate={handleUpdateProgressRate}
          onSendUpdateProgress={handleSendProgress}
          onCompleteProject={handleCompleteProject}
          onReopenProject={handleReopenProject}
          onClose={() => setSelectedProject(null)}
        />
      )}

      {/* Add Team Member Modal */}
      {activeAddMemberProj && (
        <AddMemberModal
          project={activeAddMemberProj}
          students={students}
          onAdd={handleAddMembers}
          onClose={() => setActiveAddMemberProj(null)}
        />
      )}


      {modal === 'present' && (
        <StudentListModal
          title={`Present Students`}
          subtitle={`${sessionLabel} session • ${presentStudents.length} students`}
          students={presentStudents}
          badge="Present"
          badgeColor="green"
          onClose={closeModal}
        />
      )}

      {modal === 'absent' && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={closeModal}>
          <div className="bg-card rounded-card shadow-modal w-full max-w-md animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-base font-black text-text-primary">Absent / On Leave</h2>
                <p className="text-xs text-text-muted mt-0.5">{sessionLabel} session • {absentModalStudents.length} students</p>
              </div>
              <button onClick={closeModal} className="p-2 rounded-xl bg-background hover:bg-gray-150 transition-colors">
                <X className="w-5 h-5 text-text-secondary" />
              </button>
            </div>
            <div className="p-6 space-y-2 max-h-96 overflow-y-auto">
              {absentModalStudents.length === 0 ? (
                <div className="text-center py-8 text-text-muted">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-30 text-green-500" />
                  <p className="text-sm">Everyone is present!</p>
                </div>
              ) : absentModalStudents.map(s => (
                <div key={s.id} className={`flex items-center justify-between p-3 rounded-xl border
                  ${s._badge === 'On Leave' ? 'bg-warning-soft/20 border-amber-100' : 'bg-danger-soft/20 border-red-150'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black text-white
                      ${s._badge === 'On Leave' ? 'bg-warning' : 'bg-danger'}`}>
                      {s.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-text-primary">{s.name}</p>
                      <p className="text-xs text-text-muted">{s.registerNumber}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full
                    ${s._badge === 'On Leave' ? 'bg-warning-soft text-amber-700' : 'bg-danger-soft text-red-700'}`}>
                    {s._badge}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Active Passes Modal */}
      {modal === 'passes' && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={closeModal}>
          <div className="bg-card rounded-card shadow-modal w-full max-w-md animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-base font-black text-text-primary">Active Movement Passes</h2>
                <p className="text-xs text-text-muted mt-0.5">{activePasses.length} student{activePasses.length !== 1 ? 's' : ''} currently out</p>
              </div>
              <button onClick={closeModal} className="p-2 rounded-xl bg-background hover:bg-gray-150 transition-colors">
                <X className="w-5 h-5 text-text-secondary" />
              </button>
            </div>
            <div className="p-6 space-y-3 max-h-96 overflow-y-auto bg-background/30">
              {activePasses.length === 0 ? (
                <div className="text-center py-8 text-text-muted">
                  <MapPin className="w-8 h-8 mx-auto mb-2 opacity-30 text-text-muted" />
                  <p className="text-sm font-bold">No active passes right now</p>
                </div>
              ) : activePasses.map(pass => (
                <div key={pass.id} className="bg-card border border-gray-150 p-4 rounded-2xl space-y-2 hover:shadow-xs transition-shadow">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-text-primary">{pass.studentName}</p>
                      <p className="text-[10px] font-semibold text-text-muted font-mono">{pass.registerNumber}</p>
                    </div>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-blue-150 text-blue-700 uppercase">
                      {pass.movementType}
                    </span>
                  </div>
                  
                  <div className="bg-background rounded-xl p-3 border border-gray-100">
                    <p className="text-[11px] font-bold text-text-secondary leading-snug">{pass.reason}</p>
                  </div>
                  
                  <div className="flex items-center justify-between text-[10px] text-text-muted pt-1 border-t border-gray-50">
                    <span className="flex items-center gap-1 font-bold">
                      <Clock className="w-3.5 h-3.5 text-blue-500" /> {pass.timing}
                    </span>
                    <span className="font-bold text-blue-700">OUT</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
