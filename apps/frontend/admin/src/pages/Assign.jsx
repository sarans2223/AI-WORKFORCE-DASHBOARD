import React, { useEffect, useState } from 'react'
import { ClipboardList, Plus, X, Calendar, Users, FolderKanban, CheckCircle2, AlertCircle, Search, Loader2, ChevronRight, Eye, Mail, Info, UserCheck } from 'lucide-react'
import { adminService } from '../services/adminService'

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
          {/* Details Box */}
          <div className="bg-background border border-gray-150 rounded-2xl p-4 space-y-3">
            <div>
              <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">Task Title</h3>
              <p className="text-sm font-black text-text-primary mt-1">{task.title}</p>
            </div>
            <div>
              <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">Description</h3>
              <p className="text-xs text-text-secondary mt-1 leading-relaxed">{task.description}</p>
            </div>
            <div className="pt-2.5 border-t border-gray-100 flex items-center gap-1.5 text-xs text-text-muted font-semibold">
              <UserCheck className="w-3.5 h-3.5 text-primary" />
              <span>Assigned By: <strong className="text-text-primary">{task.assignedBy || 'Faculty Admin'}</strong></span>
            </div>
          </div>

          {/* Progress Section */}
          <div className="bg-gradient-to-br from-primary-light to-white border border-primary/10 rounded-2xl p-5">
            <div className="flex justify-between items-center text-xs text-text-secondary mb-1.5 font-bold">
              <span className="text-primary">Completion Status</span>
              <span>{completed.length} / {task.studentStatuses.length} Submitted</span>
            </div>
            <div className="h-2.5 bg-primary/10 rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${progressPct}%` }} />
            </div>
          </div>

          {/* Members Roster List */}
          <div>
            <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-3">Assigned Students & Submissions</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {task.studentStatuses.map(statusObj => {
                const s = getStudent(statusObj.studentId)
                if (!s) return null
                const isDone = statusObj.status === 'COMPLETED'
                return (
                  <div 
                    key={statusObj.studentId} 
                    className={`flex items-center justify-between p-3 border rounded-2xl
                      ${isDone ? 'bg-success-soft/20 border-green-150' : 'bg-danger-soft/20 border-red-150'}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-white
                        ${isDone ? 'bg-success' : 'bg-danger'}`}>
                        {s.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-text-primary truncate">{s.name}</p>
                        <p className="text-[10px] text-text-muted truncate font-mono">{s.registerNumber}</p>
                      </div>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0
                      ${isDone ? 'bg-success-soft text-green-700' : 'bg-danger-soft text-red-700'}`}>
                      {isDone ? 'Submitted' : 'Pending'}
                    </span>
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

// ─── Project History / Details Modal ───────────────────────────────────────────
function ProjectHistoryModal({ project, students, onClose }) {
  const assignedStudents = students.filter(s => project.members.includes(s.id))

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-card rounded-card shadow-modal w-full max-w-xl flex flex-col max-h-[80vh] animate-scale-in" onClick={e => e.stopPropagation()}>
        
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
          <div className="space-y-3">
            <div>
              <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Project Scope</h3>
              <p className="text-xs text-text-secondary leading-relaxed bg-background p-4 border border-gray-150 rounded-2xl">
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
      </div>
    </div>
  )
}

// ─── Main Assign / Assignments Page ───────────────────────────────────────────
export default function Assign() {
  const [activeTab, setActiveTab] = useState('tasks') // 'tasks' | 'projects'
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
  const [projectForm, setProjectForm] = useState({ id: '', name: '', description: '', selectedMembers: [] })
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
    const { id, name, description, selectedMembers } = projectForm
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
        members: selectedMembers
      })

      // Reset form
      setProjectForm({ id: '', name: '', description: '', selectedMembers: [] })
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
            <FolderKanban className="w-4 h-4" /> Projects
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
      {activeTab === 'projects' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-text-secondary uppercase tracking-widest">Active Projects ({projects.length})</h2>
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
            {projects.map(proj => (
              <div
                key={proj.id}
                onClick={() => setSelectedProject(proj)}
                className="card border border-gray-150 hover:shadow-card-hover transition-all cursor-pointer group flex flex-col justify-between p-5 bg-card hover:-translate-y-0.5"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-primary bg-primary-light px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono">
                        {proj.id}
                      </span>
                      <span className="text-[9px] font-semibold text-text-muted bg-gray-100 px-2 py-0.5 rounded-md">
                        By {proj.assignedBy || 'Faculty'}
                      </span>
                    </div>
                    <span className="text-xs text-text-muted flex items-center gap-1 font-semibold">
                      <Users className="w-3.5 h-3.5 text-text-muted" /> {proj.members.length} Members
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-text-primary group-hover:text-primary transition-colors leading-snug">
                    {proj.name}
                  </h3>
                  <p className="text-xs text-text-secondary mt-1.5 leading-relaxed line-clamp-3">
                    {proj.description}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] font-bold text-primary pt-4 mt-4 border-t border-gray-50 flex-shrink-0">
                  <span>View Details & History</span>
                  <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-primary transition-all translate-x-0 group-hover:translate-x-0.5" />
                </div>
              </div>
            ))}
            {projects.length === 0 && (
              <div className="col-span-2 card text-center py-12 text-text-muted border border-dashed border-gray-200">
                <FolderKanban className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No projects assigned yet</p>
              </div>
            )}
          </div>
        </div>
      )}

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
                          <label 
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
                          </label>
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
                        <label 
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
                        </label>
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
          onClose={() => setSelectedProject(null)}
        />
      )}

    </div>
  )
}
