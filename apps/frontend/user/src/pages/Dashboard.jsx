import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarDays, FileText, MapPin, CheckCircle2, Clock, Plus, ArrowRight,
  ClipboardList, AlertCircle, XCircle, Send, Info
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import StatusBadge from '../components/common/StatusBadge'
import ProgressIndicator from '../components/common/ProgressIndicator'
import Modal from '../components/common/Modal'
import { useAuth } from '../contexts/AuthContext'
import { activityService } from '../services/activityService'
import { movementService } from '../services/movementService'
import { assignedTaskService } from '../services/assignedTaskService'
import { profileService } from '../services/profileService'
import { projectService } from '../services/projectService'

const QUICK_LINKS = [
  { to: '/daily-plan', icon: CalendarDays, label: 'Daily Plan', color: 'primary' },
  { to: '/leave', icon: FileText, label: 'Apply Leave', color: 'warning' },
  { to: '/movement-pass', icon: MapPin, label: 'Movement Pass', color: 'success' },
]

export default function Dashboard() {
  const { user } = useAuth()
  const [todayActivities, setTodayActivities] = useState([])
  const [activePass, setActivePass] = useState(null)
  const [assignedTasks, setAssignedTasks] = useState([])
  const [profile, setProfile] = useState(null)
  const [project, setProject] = useState(null)
  const [updates, setUpdates] = useState([])
  const [loading, setLoading] = useState(true)
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [showPastTasksModal, setShowPastTasksModal] = useState(false)

  // Project Updates Modal Tabs & Posting State
  const [modalTab, setModalTab] = useState('details')
  const [isPosting, setIsPosting] = useState(false)
  const [newUpdateContent, setNewUpdateContent] = useState('')
  const [isSubmittingUpdate, setIsSubmittingUpdate] = useState(false)

  const handleCompleteTask = async (id) => {
    await assignedTaskService.markCompleted(id)
    setAssignedTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'COMPLETED' } : t))
  }

  const handlePostUpdate = async (e) => {
    e.preventDefault()
    if (!newUpdateContent.trim()) return
    setIsSubmittingUpdate(true)
    try {
      const authorName = profile?.name || user?.name || 'Priya Ramesh'
      const authorRole = 'Member'
      const newUpd = await projectService.addUpdate({
        author: authorName,
        role: authorRole,
        content: newUpdateContent
      })
      setUpdates(prev => [newUpd, ...prev])
      setNewUpdateContent('')
      setIsPosting(false)
      setModalTab('history')
    } catch (error) {
      console.error("Failed to post update", error)
    } finally {
      setIsSubmittingUpdate(false)
    }
  }

  const handleCloseProjectModal = () => {
    setShowProjectModal(false)
    setModalTab('details')
    setIsPosting(false)
    setNewUpdateContent('')
  }

  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  useEffect(() => {
    Promise.all([
      activityService.getByDate(todayStr),
      movementService.getAll(),
      assignedTaskService.getAll(),
      profileService.get(),
      projectService.get(),
      projectService.getUpdates()
    ]).then(([acts, passes, tasks, prof, proj, upds]) => {
      setTodayActivities(acts)
      setActivePass(passes.find(p => p.status === 'ACTIVE' || p.date === todayStr))
      setAssignedTasks(tasks)
      setProfile(prof || user)
      setProject(proj)
      setUpdates(upds)
      setLoading(false)
    })
  }, [todayStr, user])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const renderMyProjectCard = () => {
    return (
      <div>
        <h2 className="text-base font-bold text-text-primary mb-3">My Team</h2>
        {project ? (
          <button
            onClick={() => { setModalTab('details'); setShowProjectModal(true); }}
            className="w-full card bg-primary-light border border-primary/20 hover:border-primary transition-all duration-200 text-left flex items-start justify-between gap-4"
          >
            <div className="space-y-1 flex-1">
              <p className="text-[10px] font-black text-primary uppercase tracking-wide">Team: {project.teamId}</p>
              <p className="text-base font-bold text-text-primary mt-0.5 leading-snug">{project.title}</p>
              <div className="pt-2 border-t border-primary/10 mt-2 space-y-1 text-xs">
                <p className="text-text-primary font-medium">
                  <span className="font-bold text-primary">Lead:</span> {project.lead}
                </p>
                <p className="text-text-secondary font-medium">
                  <span className="font-bold text-text-primary">Members:</span> {project.members.join(', ')}
                </p>
              </div>
            </div>
            <div className="p-2 bg-white rounded-xl flex-shrink-0 mt-1">
              <ArrowRight className="w-4 h-4 text-primary" />
            </div>
          </button>
        ) : (
          <div className="w-full card bg-gray-50 border border-gray-150 p-4 text-center">
            <p className="text-xs font-black text-text-muted uppercase tracking-wider">Project Title</p>
            <p className="text-sm font-bold text-text-secondary mt-1">Not Assigned</p>
          </div>
        )}
      </div>
    )
  }

  const renderAssignedTasks = () => {
    const pendingTasks = assignedTasks.filter(t => t.status === 'PENDING')
    return (
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-text-primary">Assigned Tasks</h2>
          <button onClick={() => setShowPastTasksModal(true)} className="flex items-center gap-1 text-xs text-primary font-semibold hover:text-primary-dark transition-colors">
            View Past <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="card">
          {pendingTasks.length === 0 ? (
            <div className="flex items-center gap-3 py-1">
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-text-primary">No assigned tasks</p>
                <p className="text-xs text-text-muted mt-0.5">You're all caught up!</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingTasks.map(task => (
                <div key={task.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-background p-3 rounded-xl hover:shadow-md cursor-pointer transition-all border border-transparent hover:border-primary/20 group">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <AlertCircle className="w-4 h-4 text-warning" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text-primary">{task.title}</p>
                      <p className="text-xs text-text-muted mt-0.5">Assigned by {task.assignedBy} • Due {task.dueDate}</p>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleCompleteTask(task.id); }} 
                    className="self-end sm:self-auto shrink-0 px-3 py-1.5 bg-primary-light text-primary text-xs font-bold rounded-lg hover:bg-primary hover:text-white transition-colors flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Complete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderActivePass = () => {
    return (
      <div>
        <h2 className="text-base font-bold text-text-primary mb-3">Active Movement Pass</h2>
        <div className="card bg-success-soft border border-green-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-green-800">{activePass.movementType}</p>
              <p className="text-xs text-green-700 font-medium mt-0.5">{activePass.timing}</p>
            </div>
          </div>
          <div className="bg-white/60 px-3 py-2 rounded-xl mt-3">
            <p className="text-xs text-green-800">{activePass.reason}</p>
          </div>
        </div>
      </div>
    )
  }

  const renderAssignedTasksWithFallback = () => {
    const pendingTasks = assignedTasks.filter(t => t.status === 'PENDING')
    if (pendingTasks.length > 0) {
      return renderAssignedTasks()
    }
    if (activePass) {
      return (
        <div>
          <h2 className="text-base font-bold text-text-primary mb-3">Active Movement Pass</h2>
          <div className="card bg-success-soft border border-green-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-green-800 font-semibold uppercase tracking-wide">Active Pass (No pending tasks)</p>
                <p className="text-sm font-bold text-green-800 mt-0.5">{activePass.movementType}</p>
                <p className="text-xs text-green-700 font-medium mt-0.5">{activePass.timing}</p>
              </div>
            </div>
            <div className="bg-white/60 px-3 py-2 rounded-xl mt-3">
              <p className="text-xs text-green-800">{activePass.reason}</p>
            </div>
          </div>
        </div>
      )
    }
    return renderAssignedTasks()
  }

  const renderTodayActivities = () => {
    return (
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-text-primary">Today's Activities</h2>
          <Link to="/daily-plan" className="flex items-center gap-1 text-xs text-primary font-semibold hover:text-primary-dark transition-colors">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {todayActivities.length === 0 ? (
          <div className="card text-center py-10">
            <CalendarDays className="w-10 h-10 text-primary-light mx-auto mb-3" />
            <p className="text-sm font-semibold text-text-primary">No activities today</p>
            <p className="text-xs text-text-muted mt-1">Head to Daily Plan to add your first activity</p>
            <Link to="/daily-plan" className="btn-primary inline-flex items-center gap-2 mt-4 text-sm">
              <Plus className="w-4 h-4" />
              Add Activity
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {todayActivities.slice(0, 3).map(act => (
              <div key={act.id} className="card border border-gray-100">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-text-primary leading-snug">{act.name}</p>
                    <p className="text-xs text-text-secondary mt-0.5">{act.startTime} – {act.extendedEndTime || act.endTime}</p>
                  </div>
                  <StatusBadge status={act.status} />
                </div>
                <ProgressIndicator value={act.progress} />
              </div>
            ))}
            {todayActivities.length > 3 && (
              <Link to="/daily-plan" className="block text-center py-3 text-sm text-primary font-semibold hover:text-primary-dark transition-colors">
                +{todayActivities.length - 3} more activities →
              </Link>
            )}
          </div>
        )}
      </div>
    )
  }

  const renderProjectUpdatesWidget = () => {
    return (
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-text-primary">Project Updates</h2>
          <button 
            onClick={() => { setModalTab('history'); setShowProjectModal(true); }} 
            className="text-xs text-primary font-semibold hover:text-primary-dark transition-colors flex items-center gap-0.5"
          >
            View History <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <div className="card space-y-3">
          {updates.length === 0 ? (
            <div className="text-center py-6 text-text-muted text-xs">
              No updates posted yet
            </div>
          ) : (
            <div className="divide-y divide-gray-100 -my-2.5">
              {updates.slice(0, 3).map((upd) => (
                <div key={upd.id} className="py-2.5 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="w-5 h-5 rounded-full bg-primary-light text-primary flex items-center justify-center text-[9px] font-bold flex-shrink-0">
                      {upd.avatar}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-text-primary truncate max-w-[120px] inline-block align-middle">{upd.author}</p>
                      <span className="text-[9px] text-text-muted ml-1.5 inline-block align-middle">{formatDistanceToNow(new Date(upd.timestamp), { addSuffix: true })}</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-text-secondary line-clamp-2 leading-relaxed pl-6">
                    {upd.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Premium Greeting Hero */}
      <div className="card bg-primary-light border border-primary/20 shadow-sm flex items-center justify-between p-6 relative overflow-hidden">
        <div className="relative z-10 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-primary text-2xl font-black shadow-sm">
            {profile?.name?.charAt(0) || 'S'}
          </div>
          <div>
            <h1 className="text-xl font-black text-text-primary">
              {greeting()}, <span className="text-primary">{profile?.name?.split(' ')[0] || 'Student'}</span>
            </h1>
            <p className="text-text-secondary text-sm mt-0.5 font-medium tracking-wide">
              {format(new Date(), 'EEEE, dd MMMM yyyy')} • Let's make today productive.
            </p>
          </div>
        </div>
        <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
      </div>

      {/* Today's Attendance (Compact on Mobile) */}
      <div className="card bg-white border border-gray-100 flex flex-row items-center justify-between gap-2 p-2.5 sm:p-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary-light flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-text-primary">Today's Attendance</h2>
            <p className="text-[10px] sm:text-xs text-text-muted hidden sm:block">Marked successfully for Forenoon</p>
          </div>
        </div>
        <div className="flex flex-row gap-1.5 sm:gap-4">
          <div className="flex flex-col sm:flex-row sm:justify-between items-center bg-background px-2 py-1.5 sm:px-4 sm:py-2.5 rounded-lg sm:rounded-xl sm:min-w-[140px]">
            <span className="text-[9px] sm:text-sm font-semibold text-text-secondary sm:mr-4">Forenoon</span>
            <span className="inline-flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-sm font-bold text-green-600">
              <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Present</span>
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between items-center bg-background px-2 py-1.5 sm:px-4 sm:py-2.5 rounded-lg sm:rounded-xl sm:min-w-[140px]">
            <span className="text-[9px] sm:text-sm font-semibold text-text-secondary sm:mr-4">Afternoon</span>
            <span className="inline-flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-sm font-bold text-text-muted">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Pending</span>
            </span>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:grid lg:grid-cols-3 gap-4 animate-fade-in">
        {/* Desktop Left Column */}
        <div className="lg:col-span-2 space-y-4">
          {renderAssignedTasks()}
          {renderTodayActivities()}
        </div>
        {/* Desktop Right Column */}
        <div className="space-y-4">
          {activePass && renderActivePass()}
          {renderMyProjectCard()}
          {renderProjectUpdatesWidget()}
        </div>
      </div>

      {/* Responsive/Mobile Layout */}
      <div className="lg:hidden space-y-4 animate-fade-in">
        {renderMyProjectCard()}
        {renderAssignedTasksWithFallback()}
        {renderTodayActivities()}
        {renderProjectUpdatesWidget()}
      </div>

      {/* Project Modal */}
      {project && (
        <Modal open={showProjectModal} onClose={handleCloseProjectModal} title="Project Details" size="md">
          {/* Modal Tabs */}
          <div className="flex border-b border-gray-100 mb-4 -mx-6 px-6">
            <button
              onClick={() => { setModalTab('details'); setIsPosting(false); }}
              className={`pb-2 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                modalTab === 'details' && !isPosting
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              Details
            </button>
            <button
              onClick={() => { setModalTab('history'); setIsPosting(false); }}
              className={`pb-2 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 ${
                modalTab === 'history'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              History
              {updates.length > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  modalTab === 'history' ? 'bg-primary-light text-primary' : 'bg-gray-100 text-text-secondary'
                }`}>
                  {updates.length}
                </span>
              )}
            </button>
          </div>

          {modalTab === 'details' ? (
            !isPosting ? (
              <div className="space-y-4 animate-scale-in">
                <div>
                  <p className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">Project Title</p>
                  <p className="text-base font-bold text-text-primary">{project.title}</p>
                </div>
                <div>
                  <p className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">Description</p>
                  <p className="text-sm text-text-secondary leading-relaxed">{project.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-background rounded-xl p-3">
                    <p className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">Team ID</p>
                    <p className="text-sm font-bold text-text-primary">{project.teamId}</p>
                  </div>
                  <div className="bg-background rounded-xl p-3">
                    <p className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">Lead</p>
                    <p className="text-sm font-bold text-text-primary">{project.lead}</p>
                  </div>
                </div>
                <div className="bg-background rounded-xl p-3">
                  <p className="text-[10px] text-text-muted font-semibold uppercase tracking-wider mb-2">Members</p>
                  <ul className="space-y-1">
                    {project.members.map((member, i) => (
                      <li key={i} className="text-sm font-semibold text-text-primary flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {member}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => setIsPosting(true)}
                    className="w-full btn-primary flex items-center justify-center gap-1.5 text-xs py-2.5"
                  >
                    <Plus className="w-4 h-4" /> Post Update
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handlePostUpdate} className="space-y-4 animate-scale-in">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-text-primary">Post Project Update</h3>
                  <span className="text-[10px] text-text-muted">Posting as {profile?.name || user?.name || 'Priya Ramesh'}</span>
                </div>
                
                <div>
                  <label htmlFor="update-content" className="label">Update Message</label>
                  <textarea
                    id="update-content"
                    className="input min-h-[120px] resize-none text-xs leading-relaxed"
                    placeholder="Describe your progress or update details..."
                    value={newUpdateContent}
                    onChange={(e) => setNewUpdateContent(e.target.value)}
                    required
                  />
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => { setIsPosting(false); setNewUpdateContent(''); }}
                    className="flex-1 btn-secondary text-xs py-2.5"
                    disabled={isSubmittingUpdate}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-primary text-xs py-2.5 flex items-center justify-center gap-1.5"
                    disabled={isSubmittingUpdate || !newUpdateContent.trim()}
                  >
                    {isSubmittingUpdate ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" /> Post Update
                      </>
                    )}
                  </button>
                </div>
              </form>
            )
          ) : (
            <div className="space-y-3.5 max-h-[360px] overflow-y-auto pr-1 animate-scale-in">
              {updates.length === 0 ? (
                <div className="text-center py-8 text-text-muted text-sm">
                  No updates found in this project.
                </div>
              ) : (
                updates.map((upd) => (
                  <div key={upd.id} className="flex gap-3 bg-background p-3 rounded-xl border border-gray-100/50">
                    <div className="w-8 h-8 rounded-full bg-primary-light text-primary flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      {upd.avatar}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                        <div>
                          <span className="text-xs font-bold text-text-primary">{upd.author}</span>
                          <span className="text-[10px] text-text-muted font-semibold ml-1.5">({upd.role})</span>
                        </div>
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed whitespace-pre-wrap">
                        {upd.content}
                      </p>
                      <p className="text-[10px] text-text-muted mt-1.5 font-medium">
                        {formatDistanceToNow(new Date(upd.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </Modal>
      )}

      {/* Past Assigned Tasks Modal */}
      <Modal open={showPastTasksModal} onClose={() => setShowPastTasksModal(false)} title="Past Assignments" size="md">
        <div className="space-y-3">
          {assignedTasks.filter(t => t.status === 'COMPLETED').length === 0 ? (
            <div className="text-center py-6">
              <ClipboardList className="w-8 h-8 text-primary-light mx-auto mb-2" />
              <p className="text-sm font-semibold text-text-primary">No completed tasks yet</p>
            </div>
          ) : (
            assignedTasks.filter(t => t.status === 'COMPLETED').map(task => (
              <div key={task.id} className="flex items-start gap-3 bg-background p-3 rounded-xl border border-gray-100">
                <div className="flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-secondary line-through">
                    {task.title}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">
                    Assigned by {task.assignedBy} • Due {task.dueDate}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>
    </div>
  )
}
