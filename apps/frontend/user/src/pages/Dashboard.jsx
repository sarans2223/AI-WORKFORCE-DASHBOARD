import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarDays, FileText, MapPin, CheckCircle2, Clock, Plus, ArrowRight,
  ClipboardList, AlertCircle, XCircle
} from 'lucide-react'
import { format } from 'date-fns'
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
  const [loading, setLoading] = useState(true)
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [showMoreMobile, setShowMoreMobile] = useState(false)

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
      projectService.get()
    ]).then(([acts, passes, tasks, prof, proj]) => {
      setTodayActivities(acts)
      setActivePass(passes.find(p => p.status === 'ACTIVE' || p.date === todayStr))
      setAssignedTasks(tasks)
      setProfile(prof || user)
      setProject(proj)
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

      <div className="grid lg:grid-cols-3 gap-4">
        
        {/* Left Column (Activities & Quick Access) */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Quick links */}
          <div>
            <h2 className="text-base font-bold text-text-primary mb-3">Quick Access</h2>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {QUICK_LINKS.map(({ to, icon: Icon, label, color }) => {
                const colorMap = {
                  primary: 'bg-primary-light text-primary',
                  warning: 'bg-warning-soft text-amber-600',
                  success: 'bg-success-soft text-green-600',
                }
                return (
                  <Link
                    key={to}
                    to={to}
                    className="card flex flex-col items-center justify-center gap-2 py-4 px-1 sm:py-5 hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5 text-center"
                  >
                    <div className={`p-2.5 sm:p-3 rounded-2xl ${colorMap[color]}`}>
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <span className="text-[10px] sm:text-xs font-semibold text-text-primary leading-tight">{label}</span>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Project Card */}
          {project && (
            <div>
              <h2 className="text-base font-bold text-text-primary mb-3">My Project</h2>
              <button
                onClick={() => setShowProjectModal(true)}
                className="w-full card bg-primary-light border border-primary/20 hover:border-primary transition-all duration-200 text-left flex items-start justify-between gap-4"
              >
                <div>
                  <p className="text-xs font-semibold text-primary uppercase tracking-wide">Team: {project.teamId}</p>
                  <p className="text-lg font-bold text-text-primary mt-0.5">{project.title}</p>
                  <p className="text-sm text-text-secondary mt-1 line-clamp-1">{project.description}</p>
                </div>
                <div className="p-2 bg-white rounded-xl flex-shrink-0">
                  <ArrowRight className="w-5 h-5 text-primary" />
                </div>
              </button>
            </div>
          )}

          {/* Today's activities */}
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
        </div>

        {/* Mobile View More Toggle */}
        <div className="lg:hidden">
          <button
            onClick={() => setShowMoreMobile(!showMoreMobile)}
            className="w-full py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-text-primary shadow-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
          >
            {showMoreMobile ? 'Show Less Details' : 'View More Dashboard Details'}
            <ArrowRight className={`w-4 h-4 transition-transform duration-300 ${showMoreMobile ? '-rotate-90' : 'rotate-90'}`} />
          </button>
        </div>

        {/* Right Column (Tasks, Attendance, Movement Pass) */}
        <div className={`space-y-4 ${showMoreMobile ? 'block' : 'hidden lg:block'}`}>
          
          {/* Active Movement Pass */}
          {activePass && (
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
          )}

          {/* Simple Attendance */}
          <div>
            <h2 className="text-base font-bold text-text-primary mb-3">Today's Attendance</h2>
            <div className="card space-y-3">
              <div className="flex justify-between items-center bg-background px-4 py-3 rounded-xl">
                <span className="text-sm font-semibold text-text-secondary">Forenoon</span>
                <span className="inline-flex items-center gap-1 text-sm font-bold text-green-600">
                  <CheckCircle2 className="w-4 h-4" /> Present
                </span>
              </div>
              <div className="flex justify-between items-center bg-background px-4 py-3 rounded-xl">
                <span className="text-sm font-semibold text-text-secondary">Afternoon</span>
                {/* Mocking afternoon as not marked or present based on time */}
                <span className="inline-flex items-center gap-1 text-sm font-bold text-text-muted">
                  <Clock className="w-4 h-4" /> Not marked
                </span>
              </div>
            </div>
          </div>

          {/* Assigned Tasks */}
          <div>
            <h2 className="text-base font-bold text-text-primary mb-3">Assigned Tasks</h2>
            <div className="card">
              {assignedTasks.length === 0 ? (
                <div className="text-center py-6">
                  <ClipboardList className="w-8 h-8 text-primary-light mx-auto mb-2" />
                  <p className="text-sm font-semibold text-text-primary">No assigned tasks</p>
                  <p className="text-xs text-text-muted mt-1">You're all caught up!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {assignedTasks.map(task => (
                    <div key={task.id} className="flex items-start gap-3 bg-background p-3 rounded-xl">
                      <div className="flex-shrink-0 mt-0.5">
                        {task.status === 'COMPLETED' ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : task.status === 'PENDING' ? (
                          <AlertCircle className="w-4 h-4 text-warning" />
                        ) : (
                          <XCircle className="w-4 h-4 text-danger" />
                        )}
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${task.status === 'COMPLETED' ? 'text-text-secondary line-through' : 'text-text-primary'}`}>
                          {task.title}
                        </p>
                        <p className="text-xs text-text-muted mt-0.5">
                          Assigned by {task.assignedBy} • Due {task.dueDate}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Project Modal */}
      {project && (
        <Modal open={showProjectModal} onClose={() => setShowProjectModal(false)} title="Project Details" size="md">
          <div className="space-y-4">
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
          </div>
        </Modal>
      )}
    </div>
  )
}
