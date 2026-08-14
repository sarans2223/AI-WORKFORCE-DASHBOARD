import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users, CheckCircle2, XCircle, MapPin,
  X, Clock, Sun, Sunset, ChevronRight, Plus, Search, FolderKanban, Info, Activity
} from 'lucide-react'
import { format } from 'date-fns'
import { adminService } from '../services/adminService'

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
                <label 
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
                </label>
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
function ProjectDetailsModal({ project, students, onRemoveMember, onAddMembersClick, onClose }) {
  const projectMembers = students.filter(s => project.members.includes(s.id))

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-card rounded-card shadow-modal w-full max-w-xl flex flex-col max-h-[85vh] animate-scale-in" onClick={e => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0 bg-primary-light/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-text-primary">{project.name}</h2>
              <p className="text-xs text-text-muted mt-0.5">Project ID: {project.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-background hover:bg-gray-150 transition-colors border border-gray-200">
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Project Scope</h3>
            <p className="text-xs text-text-secondary leading-relaxed bg-background p-4 border border-gray-150 rounded-2xl">
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
      </div>
    </div>
  )
}

// ─── Project Updates History Modal ────────────────────────────────────────────
function ProjectUpdatesModal({ updates, updateFilter, setUpdateFilter, onToggleRead, onClose }) {
  const filtered = updates.filter(u => {
    if (updateFilter === 'unread') return !u.read
    if (updateFilter === 'read') return u.read
    return true
  })

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
              <p className="text-xs text-text-muted mt-0.5 font-medium">Full historical progress log from your team</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Read / Unread Tabs */}
            <div className="flex bg-background border border-gray-150 rounded-xl p-0.5 gap-0.5 shadow-sm">
              {[
                { key: 'unread', label: 'Unread' },
                { key: 'read', label: 'Read' }
              ].map(({ key, label }) => {
                const count = key === 'unread' ? updates.filter(u => !u.read).length : updates.filter(u => u.read).length
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
        <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-background/30">
          {filtered.map(u => {
            const initial = u.studentName.charAt(0)
            return (
              <div 
                key={u.id}
                onClick={() => onToggleRead(u.id, u.read)}
                className={`border transition-all rounded-2xl p-4 flex gap-4 cursor-pointer group select-none
                  ${!u.read ? 'bg-primary-light/10 border-primary/20 hover:bg-primary-light/20' : 'bg-background border-gray-100 hover:border-gray-205'}`}
              >
                <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-inner">
                  {initial}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-text-primary">{u.studentName}</span>
                      <span className="text-[10px] text-text-muted font-mono">{u.registerNumber}</span>
                      {!u.read && <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />}
                    </div>
                    <span className="text-[9px] font-bold text-primary bg-primary-light border border-primary/10 px-2 py-0.5 rounded-full font-mono">
                      {u.projectId} · {u.projectName}
                    </span>
                  </div>

                  <p className="text-xs text-text-secondary leading-relaxed font-semibold">
                    {u.message}
                  </p>

                  <div className="flex items-center gap-1 text-[10px] text-text-muted mt-2">
                    <Clock className="w-3.5 h-3.5 text-text-muted" />
                    <span>{u.timestamp}</span>
                    {!u.read && (
                      <span className="text-primary font-bold ml-1 text-[9px] hover:underline">Mark as Read</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-text-muted border border-dashed border-gray-250 rounded-2xl bg-background/30">
              <Activity className="w-8 h-8 mx-auto mb-2 opacity-30 text-text-muted" />
              <p className="text-xs font-bold">No {updateFilter} updates yet today</p>
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
  const ledProjects = projects.filter(p => p.assignedBy === 'Dr. Anitha Kumar')

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
    if (!isRead) {
      await adminService.markUpdateAsRead(updateId)
      loadData()
    }
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
              {getGreeting()}, <span className="text-primary">Dr. Anitha Kumar</span>
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

      {/* Stat Cards - Grid of 4 (Forced in one row as Square Boxes including Active Passes only on mobile; desktop shows 3 boxes) */}
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

      {/* Project Updates (Full width row) */}
      <div 
        onClick={() => setShowUpdatesModal(true)}
        className="card border border-gray-150 p-6 flex flex-col hover:border-primary/30 hover:shadow-card-hover cursor-pointer transition-all active:scale-[0.99] group bg-card"
        title="Click to expand updates log"
      >
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div>
            <h2 className="text-base font-black text-text-primary group-hover:text-primary transition-colors">Project Updates</h2>
            <p className="text-xs text-text-secondary mt-0.5 font-medium">Recent progress from your team</p>
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
                className={`border rounded-xl p-3 flex gap-3 transition-all duration-200
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
                    <div className="flex items-center gap-1 flex-wrap flex-shrink-0">
                      <span className="text-[8px] font-bold text-primary bg-primary-light border border-primary/10 px-2 py-0.5 rounded-md font-mono">
                        {u.projectId} · {u.projectName}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-text-secondary leading-relaxed font-semibold">
                    {u.message}
                  </p>

                  <div className="flex items-center gap-1.5 text-[9px] text-text-muted mt-1.5">
                    <Clock className="w-3 h-3 text-text-muted" />
                    <span>{u.timestamp}</span>
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

      {/* Projects You Lead & Active Passes split row (Passes is a widget side-panel on desktop, hidden on mobile) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={ledProjects.length > 0 ? 'lg:col-span-2' : 'col-span-3'}>
          {ledProjects.length > 0 && (
            <div className="card border border-gray-150 p-6 flex flex-col h-full min-h-[220px]">
              <div className="mb-4 flex-shrink-0">
                <h2 className="text-base font-black text-text-primary">Projects You Lead</h2>
                <p className="text-xs text-text-secondary mt-0.5 font-medium">Manage team rosters for projects assigned to you</p>
              </div>
              
              {/* Grid of Led Projects */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                {ledProjects.map(proj => (
                  <div
                    key={proj.id}
                    onClick={() => setSelectedProject(proj)}
                    className="bg-background border border-gray-200 hover:border-primary/30 hover:shadow-md p-5 rounded-2xl cursor-pointer active:scale-[0.98] transition-all flex items-center justify-between group h-fit"
                  >
                    <div className="min-w-0 pr-2">
                      <span className="text-[10px] font-black text-primary bg-primary-light border border-primary/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono">
                        {proj.id}
                      </span>
                      <h3 className="text-xs font-black text-text-primary group-hover:text-primary transition-colors mt-2 truncate">
                        {proj.name}
                      </h3>
                    </div>
                    <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Active Passes Side Panel (Only visible on Desktop viewports, hidden on Mobile viewports) */}
        <div className="hidden lg:flex lg:col-span-1">
          <div 
            onClick={() => navigate('/passes')}
            className="card border border-gray-150 p-6 flex flex-col w-full min-h-[220px] hover:border-primary/30 hover:shadow-card-hover cursor-pointer transition-all active:scale-[0.99] group bg-card"
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

      {/* Project Updates Expanded Modal */}
      {showUpdatesModal && (
        <ProjectUpdatesModal
          updates={updates}
          updateFilter={updateFilter}
          setUpdateFilter={setUpdateFilter}
          onToggleRead={handleToggleRead}
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

      {/* ─── Modals ─── */}

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
