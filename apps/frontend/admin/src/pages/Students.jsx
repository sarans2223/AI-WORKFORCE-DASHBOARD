import React, { useEffect, useState } from 'react'
import { Users, Search, Plus, X, Download, Upload, AlertCircle, Loader2, GitBranch, Phone, Mail, BookOpen, ListTodo, ChevronRight, Clock, Calendar, Trash2 } from 'lucide-react'
import { startOfWeek, addDays, isSameDay, format as formatDate } from 'date-fns'
import { adminService } from '../services/adminService'

// ─── Weekly Calendar Modal (Matches user Weekly Calendar layout exactly) ───────
function WeeklyCalendarModal({ student, activity, onClose }) {
  const monday = startOfWeek(new Date(), { weekStartsOn: 1 })
  
  // Create 7 days of the week: Mon, Tue, Wed, Thu, Fri, Sat, Sun
  const weekDates = [0, 1, 2, 3, 4, 5, 6].map(offset => {
    const d = addDays(monday, offset)
    return {
      dayName: formatDate(d, 'EEE'),
      dayNum: formatDate(d, 'd'),
      isTodayDate: isSameDay(d, new Date()),
      dayKey: formatDate(d, 'EEEE') // Matches mock days like 'Monday', 'Tuesday', etc.
    }
  })

  const weekStartStr = formatDate(monday, 'dd MMM')
  const weekEndStr = formatDate(addDays(monday, 6), 'dd MMM yyyy')

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-card rounded-card shadow-modal w-full max-w-2xl h-[80vh] flex flex-col overflow-hidden animate-scale-in" onClick={e => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0 bg-background/50">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary-light to-primary-light/50 border border-primary/10 flex items-center justify-center text-primary shadow-inner">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-text-primary leading-none mb-1">{student.name}'s Weekly Schedule</h2>
              <p className="text-xs font-bold text-text-secondary flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 rounded-full bg-primary/40 animate-pulse" />
                {weekStartStr} – {weekEndStr}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-background hover:bg-gray-100 transition-colors border border-gray-200">
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        {/* 7-Day Vertical Rows list */}
        <div className="flex-1 overflow-y-auto p-6 bg-background/30 space-y-4">
          {weekDates.map((dateInfo, idx) => {
            // Find matching goal for this week day in student's mock data
            const dayGoal = activity.weeklyPlan.find(w => w.day === dateInfo.dayKey)

            return (
              <div 
                key={idx} 
                className={`flex bg-white/40 border border-gray-100 rounded-3xl p-4 shadow-sm transition-all duration-200 items-start gap-4
                  ${dateInfo.isTodayDate ? 'ring-2 ring-primary/20 bg-primary-light/5' : 'hover:shadow-md'}`}
              >
                {/* Day Header Box */}
                <div className={`flex items-center justify-center w-20 sm:w-24 py-3 rounded-2xl border transition-all shadow-sm flex-shrink-0
                  ${dateInfo.isTodayDate 
                    ? 'bg-gradient-to-b from-primary to-primary-dark border-primary text-white shadow-primary/20' 
                    : 'bg-white border-gray-150 text-text-primary'}`}>
                  <span className={`text-[10px] font-extrabold uppercase tracking-wide ${dateInfo.isTodayDate ? 'text-white/80' : 'text-text-muted'}`}>
                    {dateInfo.dayName}
                  </span>
                  <span className="text-xl font-black leading-none ml-2">
                    {dateInfo.dayNum}
                  </span>
                </div>

                {/* Day Activities */}
                <div className="flex-1 space-y-2">
                  {dayGoal ? (
                    <div className="p-4 rounded-2xl bg-white border border-gray-150 border-l-[4px] border-l-green-500 shadow-xs flex flex-col gap-1 w-full hover:border-gray-250 transition-all">
                      <p className="text-xs sm:text-sm font-bold text-text-primary leading-snug break-words">{dayGoal.goal}</p>
                      <p className="text-[10px] sm:text-xs font-semibold text-text-muted">
                        09:30 – 11:00
                      </p>
                    </div>
                  ) : (
                    <div className="border border-dashed border-primary/20 rounded-2xl flex items-center justify-center bg-white/20 p-4 w-full min-h-[60px]">
                      <span className="text-[10px] font-black text-text-muted uppercase tracking-wider">EMPTY</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Student Activity Detail Drawer/Modal ──────────────────────────────────────
function StudentActivityModal({ studentId, student, onRemove, onClose }) {
  const [activity, setActivity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('plans') // 'plans' | 'tasks-skills'
  const [showWeekModal, setShowWeekModal] = useState(false)

  useEffect(() => {
    if (studentId) {
      setLoading(true)
      adminService.getStudentActivity(studentId).then(data => {
        setActivity(data)
        setLoading(false)
      })
    }
  }, [studentId])

  if (!studentId) return null

  const completedSkills = activity?.pskills.filter(s => s.status === 'COMPLETED') || []
  const totalSkills = activity?.pskills || []

  return (
    <div className="fixed inset-0 bg-black/45 backdrop-blur-xs z-50 flex items-center justify-end p-0 animate-fade-in" onClick={onClose}>
      <div
        className="bg-card w-full max-w-2xl h-screen shadow-2xl flex flex-col animate-slide-over"
        onClick={e => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0 bg-primary-light bg-opacity-30">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-sm">
              {student.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-base font-black text-text-primary">{student.name}</h2>
              <p className="text-xs text-text-secondary font-mono">{student.registerNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-background hover:bg-gray-150 transition-colors border border-gray-200">
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        {/* Drawer Body */}
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-xs text-text-muted mt-2">Loading profile logs...</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Contact Details Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-background border border-gray-150 rounded-2xl p-4 flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Email Address</p>
                  <p className="text-xs font-semibold text-text-primary truncate mt-0.5">{student.email}</p>
                </div>
              </div>
              <div className="bg-background border border-gray-150 rounded-2xl p-4 flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Phone Number</p>
                  <p className="text-xs font-semibold text-text-primary truncate mt-0.5">{student.phone || 'Not added'}</p>
                </div>
              </div>
              {/* GitHub Link row spans full width */}
              <div className="col-span-2 bg-background border border-gray-150 rounded-2xl p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <GitBranch className="w-4 h-4 text-primary flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold text-text-muted uppercase tracking-wider">GitHub Profile</p>
                    <p className="text-xs font-semibold text-text-primary truncate mt-0.5">
                      {student.github || 'Not linked'}
                    </p>
                  </div>
                </div>
                {student.github && (
                  <a
                    href={student.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary py-1.5 px-3 text-xs font-bold shadow-sm"
                  >
                    View Profile
                  </a>
                )}
              </div>
            </div>

            {/* Active Project Card */}
            {activity.project && (
              <div className="bg-gradient-to-br from-primary-light to-white border border-primary/10 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Assigned Project</span>
                </div>
                <h3 className="text-sm font-black text-text-primary leading-tight">{activity.project.name}</h3>
                <p className="text-xs text-primary font-bold mt-1">Role: {activity.project.role}</p>
                <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">{activity.project.description}</p>
              </div>
            )}

            {/* Tab Toggles */}
            <div className="flex bg-background rounded-xl p-1 gap-1 border border-gray-150">
              <button
                onClick={() => setActiveTab('plans')}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5
                  ${activeTab === 'plans' ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
              >
                <Clock className="w-4 h-4" /> Current Plans & Logs
              </button>
              <button
                onClick={() => setActiveTab('tasks-skills')}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5
                  ${activeTab === 'tasks-skills' ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
              >
                <ListTodo className="w-4 h-4" /> Skills & Tasks
              </button>
            </div>

            {/* Plans Tab Content */}
            {activeTab === 'plans' && (
              <div className="space-y-6">
                
                {/* Daily Activity Plan */}
                <div>
                  <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-3">Today's Daily Plan</h3>
                  <div className="relative border-l border-gray-200 pl-4 space-y-4 ml-2">
                    {activity.dailyPlan.map((d, idx) => (
                      <div key={idx} className="relative">
                        <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-primary-light" />
                        <span className="text-[10px] font-black text-primary">{d.time}</span>
                        <p className="text-xs font-semibold text-text-primary mt-0.5">{d.activity}</p>
                      </div>
                    ))}
                    {activity.dailyPlan.length === 0 && (
                      <p className="text-xs text-text-muted italic">No activity logged for today</p>
                    )}
                  </div>
                </div>

                {/* Weekly Plan Button */}
                <div className="pt-4 border-t border-gray-100">
                  <button
                    onClick={() => setShowWeekModal(true)}
                    className="w-full flex items-center justify-center gap-2 text-xs font-bold text-primary bg-primary-light hover:bg-primary-muted px-4 py-3 rounded-2xl transition-all active:scale-95 border border-primary/10 shadow-sm"
                  >
                    <Calendar className="w-4 h-4" /> View Weekly Schedule
                  </button>
                </div>

                {/* Remove Student Button inside Tab */}
                <div className="pt-3">
                  <button 
                    onClick={() => onRemove(student.id, student.name)}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-danger-soft hover:bg-red-100 text-red-650 font-bold text-xs border border-red-200/30 transition-all active:scale-95 shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" /> Remove Student from Directory
                  </button>
                </div>

              </div>
            )}

            {/* Skills & Tasks Tab Content */}
            {activeTab === 'tasks-skills' && (
              <div className="space-y-6">
                
                {/* P-Skills Progress - Filtered to ONLY completed */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest">P-Skills Completed</h3>
                    <span className="text-xs font-bold text-primary">{completedSkills.length} Completed</span>
                  </div>

                  {/* Skills Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    {completedSkills.map((s, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl border border-green-100 bg-success-soft/20">
                        <span className="text-xs font-semibold text-text-primary truncate pr-2">{s.name}</span>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 bg-success text-white">
                          Completed
                        </span>
                      </div>
                    ))}
                    {completedSkills.length === 0 && (
                      <p className="text-xs text-text-muted italic col-span-2 text-center py-4">No completed skills yet</p>
                    )}
                  </div>
                </div>

                {/* Assigned Tasks */}
                <div>
                  <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-3">Assigned Tasks Status</h3>
                  <div className="space-y-2">
                    {activity.tasks.map((t, idx) => {
                      const isDone = t.status === 'COMPLETED'
                      return (
                        <div key={idx} className={`flex items-center justify-between p-3.5 border rounded-2xl
                          ${isDone ? 'bg-success-soft/20 border-green-150' : 'bg-danger-soft/20 border-red-150'}`}>
                          <div>
                            <p className="text-xs font-bold text-text-primary">{t.title}</p>
                            <p className="text-[10px] text-text-muted mt-0.5">Due: {t.due}</p>
                          </div>
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full
                            ${isDone ? 'bg-success-soft text-green-700' : 'bg-danger-soft text-red-700'}`}>
                            {isDone ? 'Completed' : 'Pending'}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>

              </div>
            )}

          </div>
        )}
      </div>

      {/* Weekly Calendar Modal */}
      {showWeekModal && activity && (
        <WeeklyCalendarModal
          student={student}
          activity={activity}
          onClose={() => setShowWeekModal(false)}
        />
      )}
    </div>
  )
}

// ─── Main Students Page ───────────────────────────────────────────────────────
export default function Students() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [activeTab, setActiveTab] = useState('single')
  const [selectedStudent, setSelectedStudent] = useState(null)

  // Form states
  const [singleForm, setSingleForm] = useState({ name: '', registerNumber: '', email: '' })
  const [singleError, setSingleError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Bulk state
  const [bulkFile, setBulkFile] = useState(null)
  const [bulkStudents, setBulkStudents] = useState([])
  const [bulkError, setBulkError] = useState('')

  const loadStudents = () => {
    adminService.getStudents().then(data => {
      // Sort alphabetically by name
      const sorted = [...data].sort((a, b) => a.name.localeCompare(b.name))
      setStudents(sorted)
      setLoading(false)
    })
  }

  const handleRemoveStudent = async (studentId, studentName) => {
    if (window.confirm(`Are you sure you want to remove ${studentName}? This will also remove them from all projects and attendance rosters.`)) {
      await adminService.removeStudent(studentId)
      loadStudents()
    }
  }

  useEffect(() => {
    loadStudents()
  }, [])

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.registerNumber.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    (s.phone && s.phone.includes(search))
  )

  // Download Excel Spreadsheet Template
  const handleDownloadTemplate = () => {
    const xmlTemplate = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Worksheet ss:Name="Students Template">
  <Table>
   <Row>
    <Cell><Data ss:Type="String">Name</Data></Cell>
    <Cell><Data ss:Type="String">RollNumber</Data></Cell>
    <Cell><Data ss:Type="String">Email</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">John Doe</Data></Cell>
    <Cell><Data ss:Type="String">22CS150</Data></Cell>
    <Cell><Data ss:Type="String">john.doe@college.edu</Data></Cell>
   </Row>
  </Table>
 </Worksheet>
</Workbook>`

    const blob = new Blob([xmlTemplate], { type: 'application/vnd.ms-excel' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', 'student_import_template.xls')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Parse Excel XML or basic tabular file format
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setBulkFile(file)
    setBulkError('')

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const text = event.target.result
        
        // Simple XML / Tabular cell parsing
        const parsed = []
        if (text.includes('<Cell>')) {
          // Parse out XML Cell data
          const cellMatches = text.match(/<Data ss:Type="String">([^<]+)<\/Data>/g) || []
          const values = cellMatches.map(m => m.replace('<Data ss:Type="String">', '').replace('</Data>', '').trim())
          
          // Headers are: [Name, RollNumber, Email]. Process row sets (3 elements per row)
          for (let i = 3; i < values.length; i += 3) {
            if (values[i] && values[i+1] && values[i+2]) {
              parsed.push({
                name: values[i],
                registerNumber: values[i+1],
                email: values[i+2],
                phone: '',
                github: ''
              })
            }
          }
        } else {
          // Standard CSV fallback
          const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
          for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(',').map(c => c.trim())
            if (cols.length >= 3) {
              parsed.push({
                name: cols[0],
                registerNumber: cols[1],
                email: cols[2],
                phone: '',
                github: ''
              })
            }
          }
        }

        if (parsed.length === 0) {
          setBulkError('Could not read any student records from the Excel file.')
        } else {
          setBulkStudents(parsed)
        }
      } catch (err) {
        setBulkError('Error reading spreadsheet file format.')
      }
    }
    reader.readAsText(file)
  }

  const handleAddSingle = async (e) => {
    e.preventDefault()
    setSingleError('')
    const { name, registerNumber, email } = singleForm
    if (!name || !registerNumber || !email) {
      setSingleError('All fields are required.')
      return
    }

    setSubmitting(true)
    try {
      await adminService.addStudent({ name, registerNumber, email, phone: '', github: '' })
      setSingleForm({ name: '', registerNumber: '', email: '' })
      setShowAddModal(false)
      loadStudents()
    } catch (err) {
      setSingleError('Failed to register student.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddBulk = async () => {
    if (bulkStudents.length === 0) return
    setSubmitting(true)
    try {
      await adminService.addStudentsBulk(bulkStudents)
      setBulkFile(null)
      setBulkStudents([])
      setShowAddModal(false)
      loadStudents()
    } catch (err) {
      setBulkError('Failed to import student list.')
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
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Students</h1>
          <p className="page-subtitle">{students.length} registered students</p>
        </div>
        <button
          onClick={() => {
            setShowAddModal(true)
            setSingleError('')
            setBulkError('')
            setBulkStudents([])
            setBulkFile(null)
          }}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" /> Add Student
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          className="input pl-11"
          placeholder="Search by name, roll no., email, or phone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-primary-light bg-opacity-20">
                <th className="text-left px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wide hidden md:table-cell">S.No</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wide">Student Name</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wide">Reg. No.</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wide hidden sm:table-cell">Email ID</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wide hidden lg:table-cell">Phone Number</th>
                <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wide text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((student, idx) => (
                <tr
                  key={student.id}
                  onClick={() => setSelectedStudent(student)}
                  className="hover:bg-background transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-4 text-text-muted text-xs font-semibold hidden md:table-cell">{String(idx + 1).padStart(2, '0')}</td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-text-primary group-hover:text-primary transition-colors">{student.name}</p>
                  </td>
                  <td className="px-6 py-4 text-text-secondary font-mono text-xs font-semibold">{student.registerNumber}</td>
                  <td className="px-6 py-4 text-text-secondary text-xs hidden sm:table-cell">{student.email}</td>
                  <td className="px-6 py-4 text-text-secondary text-xs hidden lg:table-cell">{student.phone || <span className="text-text-muted italic">Not added</span>}</td>
                  <td className="px-6 py-4 text-right">
                    <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors inline-block" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-text-muted">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No students found</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowAddModal(false)}>
          <div className="bg-card rounded-card shadow-modal w-full max-w-lg flex flex-col max-h-[90vh] animate-scale-in" onClick={e => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
              <div>
                <h2 className="text-base font-black text-text-primary">Add Student Records</h2>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-2 rounded-xl bg-background hover:bg-gray-150 transition-colors">
                <X className="w-5 h-5 text-text-secondary" />
              </button>
            </div>

            {/* Tabs selector */}
            <div className="px-6 pt-4 flex-shrink-0">
              <div className="flex bg-background rounded-xl p-1 gap-1 border border-gray-150">
                <button
                  onClick={() => setActiveTab('single')}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all
                    ${activeTab === 'single' ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
                >
                  Individual Registration
                </button>
                <button
                  onClick={() => setActiveTab('bulk')}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all
                    ${activeTab === 'bulk' ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
                >
                  Excel Import
                </button>
              </div>
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto p-6 min-h-0">
              {activeTab === 'single' ? (
                <form onSubmit={handleAddSingle} className="space-y-4">
                  {singleError && (
                    <div className="flex items-center gap-2 bg-danger-soft border border-red-150 text-red-700 text-xs rounded-xl p-3">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span className="font-semibold">{singleError}</span>
                    </div>
                  )}
                  <div>
                    <label className="label">Student Name *</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. John Doe"
                      value={singleForm.name}
                      onChange={e => setSingleForm(f => ({ ...f, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Roll Number (Reg. No.) *</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. 22CS150"
                      value={singleForm.registerNumber}
                      onChange={e => setSingleForm(f => ({ ...f, registerNumber: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Email Address *</label>
                    <input
                      type="email"
                      className="input"
                      placeholder="e.g. john.doe@college.edu"
                      value={singleForm.email}
                      onChange={e => setSingleForm(f => ({ ...f, email: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-gray-50">
                    <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary flex-1 py-2.5">Cancel</button>
                    <button type="submit" disabled={submitting} className="btn-primary flex-1 py-2.5 flex items-center justify-center gap-2">
                      {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                      Add Student
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-5">
                  {bulkError && (
                    <div className="flex items-center gap-2 bg-danger-soft border border-red-150 text-red-700 text-xs rounded-xl p-3">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span className="font-semibold">{bulkError}</span>
                    </div>
                  )}

                  {/* Template Download Section */}
                  <div className="bg-primary-light/30 border border-primary/10 rounded-2xl p-4 flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xs font-bold text-primary uppercase tracking-wide">Excel Template Sheet</h3>
                    </div>
                    <button
                      onClick={handleDownloadTemplate}
                      className="btn-secondary py-2 px-3 text-xs font-bold flex items-center gap-1.5 flex-shrink-0 shadow-sm border border-primary/10"
                    >
                      <Download className="w-3.5 h-3.5" /> Download Template
                    </button>
                  </div>

                  {/* Upload Sheet Section */}
                  <div className="space-y-2">
                    <label className="border-2 border-dashed border-gray-200 hover:border-primary/50 transition-all rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer text-center group bg-background/50">
                      <input
                        type="file"
                        className="hidden"
                        accept=".xlsx,.xls"
                        onChange={handleFileChange}
                      />
                      <Upload className="w-8 h-8 text-text-muted group-hover:text-primary transition-colors mb-2" />
                      <p className="text-xs font-bold text-text-primary">
                        {bulkFile ? bulkFile.name : 'Select or drop filled template file'}
                      </p>
                    </label>
                  </div>

                  {/* Preview Log Rows */}
                  {bulkStudents.length > 0 && (
                    <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-100 rounded-xl p-3 bg-background/30">
                      <div className="flex justify-between items-center text-[10px] font-bold text-text-muted uppercase tracking-wider border-b border-gray-150 pb-1 mb-2">
                        <span>Preview ({bulkStudents.length} Students)</span>
                        <span className="text-green-600">Valid</span>
                      </div>
                      <div className="space-y-1">
                        {bulkStudents.slice(0, 5).map((s, idx) => (
                          <div key={idx} className="flex justify-between text-xs py-1 border-b border-gray-50 border-dashed last:border-0">
                            <span className="font-semibold text-text-primary truncate max-w-[150px]">{s.name}</span>
                            <span className="font-mono text-text-muted">{s.registerNumber}</span>
                          </div>
                        ))}
                        {bulkStudents.length > 5 && (
                          <p className="text-[10px] text-text-muted italic pt-1 text-center">
                            + {bulkStudents.length - 5} more students...
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-gray-50">
                    <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary flex-1 py-2.5">Cancel</button>
                    <button
                      onClick={handleAddBulk}
                      disabled={submitting || bulkStudents.length === 0}
                      className="btn-primary flex-1 py-2.5 flex items-center justify-center gap-2"
                    >
                      {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                      Import {bulkStudents.length > 0 ? `${bulkStudents.length} Students` : ''}
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Student Activity Detail Drawer */}
      {selectedStudent && (
        <StudentActivityModal
          studentId={selectedStudent.id}
          student={selectedStudent}
          onRemove={(id, name) => {
            handleRemoveStudent(id, name)
            setSelectedStudent(null)
          }}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </div>
  )
}
