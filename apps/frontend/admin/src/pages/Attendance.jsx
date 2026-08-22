import React, { useEffect, useState } from 'react'
import {
  Save, Loader2, CheckCircle2, ClipboardList, AlertTriangle, CalendarDays, History, X, Search, ChevronRight, Sun, Sunset,
  FileSpreadsheet, Download
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { adminService } from '../services/adminService'
import { exportAttendanceExcel } from '../utils/excelExport'

function getAutoSession() {
  const hour = new Date().getHours()
  return hour < 12 ? 'forenoon' : 'afternoon'
}

// ─── Quick Attendance Excel Export Modal ──────────────────────────────────────
function ExportModal({ onClose, students, todayAttendance }) {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [isExporting, setIsExporting] = useState(false)
  const [previewData, setPreviewData] = useState(null)
  const [loadingPreview, setLoadingPreview] = useState(false)

  useEffect(() => {
    let isMounted = true
    setLoadingPreview(true)
    adminService.getAttendanceByDate(selectedDate).then(data => {
      if (isMounted) {
        setPreviewData(data)
        setLoadingPreview(false)
      }
    }).catch(() => {
      if (isMounted) setLoadingPreview(false)
    })
    return () => { isMounted = false }
  }, [selectedDate])

  const handleDownload = async () => {
    setIsExporting(true)
    try {
      let attData = previewData
      if (!attData) {
        attData = await adminService.getAttendanceByDate(selectedDate)
      }

      exportAttendanceExcel({
        date: selectedDate,
        students,
        attendance: attData || { forenoon: { records: [] }, afternoon: { records: [] } }
      })
      onClose()
    } catch (e) {
      console.error('Export failed', e)
    } finally {
      setIsExporting(false)
    }
  }

  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const yesterdayDate = new Date()
  yesterdayDate.setDate(yesterdayDate.getDate() - 1)
  const yesterdayStr = format(yesterdayDate, 'yyyy-MM-dd')

  const parsedDate = typeof selectedDate === 'string' && selectedDate.includes('-') ? parseISO(selectedDate) : new Date(selectedDate)
  const formattedPreviewDate = isNaN(parsedDate.getTime()) ? selectedDate : format(parsedDate, 'dd MMM yyyy (EEEE)')

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-card rounded-card shadow-modal w-full max-w-md p-6 space-y-4 animate-scale-in" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-green-100 text-green-700 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-text-primary">Download Attendance Excel</h2>
              <p className="text-[10px] text-text-muted">Export complete daily attendance spreadsheet</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-text-secondary">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Date Selectors */}
        <div className="space-y-3">
          <div>
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">
              Select Attendance Date
            </label>
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={() => setSelectedDate(todayStr)}
                className={`flex-1 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                  selectedDate === todayStr ? 'bg-primary text-white border-primary shadow-xs' : 'bg-gray-50 text-text-secondary border-gray-200 hover:bg-gray-100'
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setSelectedDate(yesterdayStr)}
                className={`flex-1 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                  selectedDate === yesterdayStr ? 'bg-primary text-white border-primary shadow-xs' : 'bg-gray-50 text-text-secondary border-gray-200 hover:bg-gray-100'
                }`}
              >
                Yesterday
              </button>
            </div>
            <input
              type="date"
              className="input text-xs py-2 w-full"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
            />
          </div>

          {/* Preview Box */}
          <div className="bg-primary-light/15 border border-primary/20 rounded-xl p-3 space-y-1.5 text-xs">
            <div className="flex justify-between items-center text-[10px] font-bold text-text-muted uppercase tracking-wider">
              <span>Date Summary</span>
              <span>{formattedPreviewDate}</span>
            </div>
            {loadingPreview ? (
              <div className="flex items-center justify-center py-2 text-primary">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                <div className="bg-white/80 p-2 rounded-lg border border-primary/10">
                  <span className="text-[9px] text-text-muted block font-bold">Forenoon</span>
                  <span className="font-bold text-text-primary">
                    {previewData?.forenoon?.records?.filter(r => r.status === 'PRESENT').length || 0} Present / {students.length} Total
                  </span>
                </div>
                <div className="bg-white/80 p-2 rounded-lg border border-primary/10">
                  <span className="text-[9px] text-text-muted block font-bold">Afternoon</span>
                  <span className="font-bold text-text-primary">
                    {previewData?.afternoon?.records?.filter(r => r.status === 'PRESENT').length || 0} Present / {students.length} Total
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 btn-secondary text-xs py-2.5 cursor-pointer"
            disabled={isExporting}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={isExporting}
            className="flex-1 btn-primary text-xs py-2.5 flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700 border-green-600 text-white cursor-pointer"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Download className="w-3.5 h-3.5" /> Download (.xlsx)
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Attendance History Modal ──────────────────────────────────────────────────
function HistoryModal({ onClose, students }) {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchDate, setSearchDate] = useState('')
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [selectedSession, setSelectedSession] = useState('forenoon')
  const [exportingDate, setExportingDate] = useState(null)

  useEffect(() => {
    adminService.getAttendanceHistory().then(data => {
      // Sort history descending by date
      const sorted = [...data].sort((a, b) => b.date.localeCompare(a.date))
      setHistory(sorted)
      setLoading(false)
    })
  }, [])

  const filteredHistory = history.filter(h => {
    if (!searchDate) return true
    return h.date.includes(searchDate)
  })

  const getStudent = (id) => students.find(s => s.id === id)

  const handleExportDate = async (dateStr, record) => {
    setExportingDate(dateStr)
    try {
      let attData = record
      if (!attData || !attData.forenoon) {
        attData = await adminService.getAttendanceByDate(dateStr)
      }
      exportAttendanceExcel({
        date: dateStr,
        students,
        attendance: attData
      })
    } catch (e) {
      console.error(`Failed to export attendance for ${dateStr}`, e)
    } finally {
      setExportingDate(null)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-card rounded-card shadow-modal w-full max-w-4xl h-[85vh] flex flex-col animate-scale-in" onClick={e => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center">
              <History className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-black text-text-primary">Attendance History</h2>
              <p className="text-xs text-text-muted mt-0.5">Search, view, and download past attendance logs</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-background hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 min-h-0 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-100">
          
          {/* Left panel: Log List */}
          <div className="w-full md:w-2/5 p-6 flex flex-col min-h-0">
            {/* Search Filter */}
            <div className="relative mb-4 flex-shrink-0">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="date"
                className="input pl-10 py-2.5 text-xs"
                value={searchDate}
                onChange={e => setSearchDate(e.target.value)}
              />
              {searchDate && (
                <button
                  onClick={() => setSearchDate('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-text-muted hover:text-text-primary"
                >
                  Clear
                </button>
              )}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : filteredHistory.length === 0 ? (
                <div className="text-center py-12 text-text-muted">
                  <CalendarDays className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No history records found</p>
                </div>
              ) : (
                filteredHistory.map(item => {
                  const isSelected = selectedRecord?.date === item.date
                  return (
                    <div
                      key={item.date}
                      onClick={() => {
                        setSelectedRecord(item)
                        // Auto-select forenoon on date switch
                        setSelectedSession('forenoon')
                      }}
                      className={`w-full text-left card border p-3.5 flex items-center justify-between transition-all active:scale-98 cursor-pointer group ${
                        isSelected
                          ? 'border-primary bg-primary-light/30 shadow-sm'
                          : 'border-gray-100 hover:border-gray-200 hover:shadow-sm'
                      }`}
                    >
                      <div>
                        <p className="text-sm font-bold text-text-primary">
                          {format(parseISO(item.date), 'dd MMM yyyy')}
                        </p>
                        <p className="text-xs text-text-muted mt-0.5">
                          {format(parseISO(item.date), 'EEEE')}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleExportDate(item.date, item)
                          }}
                          disabled={exportingDate === item.date}
                          className="p-1.5 rounded-lg bg-white/80 border border-gray-200 text-gray-500 hover:text-green-700 hover:bg-green-50 hover:border-green-300 transition-colors shadow-2xs"
                          title={`Download ${item.date} Attendance Excel`}
                        >
                          {exportingDate === item.date ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-green-600" />
                          ) : (
                            <Download className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <ChevronRight className={`w-4 h-4 transition-colors ${isSelected ? 'text-primary' : 'text-text-muted'}`} />
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Right panel: Log Details */}
          <div className="w-full md:w-3/5 p-6 flex flex-col min-h-0 bg-background/30">
            {selectedRecord ? (
              <div className="flex-1 flex flex-col min-h-0">
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4 flex-shrink-0">
                  <div>
                    <h3 className="text-sm font-black text-text-primary">
                      Details for {format(parseISO(selectedRecord.date), 'dd MMMM yyyy')}
                    </h3>
                    <p className="text-xs text-text-muted mt-0.5">
                      {format(parseISO(selectedRecord.date), 'EEEE')}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Export Excel Button for Active Date */}
                    <button
                      type="button"
                      onClick={() => handleExportDate(selectedRecord.date, selectedRecord)}
                      disabled={exportingDate === selectedRecord.date}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-xl text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer"
                      title="Download this date as Excel (.xlsx)"
                    >
                      {exportingDate === selectedRecord.date ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <FileSpreadsheet className="w-3.5 h-3.5 text-green-600" />
                      )}
                      <span>Export Excel</span>
                    </button>

                    {/* Session Toggle buttons */}
                    <div className="flex bg-card border border-gray-200 rounded-xl p-1 shadow-sm w-fit">
                      {['forenoon', 'afternoon'].map(s => (
                        <button
                          key={s}
                          onClick={() => setSelectedSession(s)}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all capitalize cursor-pointer ${
                            selectedSession === s ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-text-primary'
                          }`}
                        >
                          {s === 'forenoon' ? <Sun className="w-3.5 h-3.5" /> : <Sunset className="w-3.5 h-3.5" />}
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Session specific records list */}
                <div className="flex-1 overflow-y-auto pt-4 space-y-2 pr-1">
                  {selectedRecord[selectedSession]?.records.map(rec => {
                    const stu = getStudent(rec.studentId)
                    if (!stu) return null
                    const isPresent = rec.status === 'PRESENT'
                    return (
                      <div
                        key={rec.studentId}
                        className={`flex items-center justify-between p-3.5 rounded-2xl border ${
                          isPresent
                            ? 'bg-success-soft/20 border-green-100'
                            : 'bg-danger-soft/20 border-red-100'
                        }`}
                      >
                        <div>
                          <p className="text-sm font-semibold text-text-primary">{stu.name}</p>
                          <p className="text-[10px] font-mono text-text-muted mt-0.5">{stu.registerNumber}</p>
                        </div>
                        <span className={`text-[10px] font-black px-3 py-1 rounded-full ${
                          isPresent
                            ? 'bg-success text-white'
                            : 'bg-danger text-white'
                        }`}>
                          {isPresent ? 'Present' : 'Absent'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-text-muted p-12 text-center">
                <History className="w-12 h-12 mb-3 opacity-20 text-primary animate-pulse" />
                <p className="text-sm font-semibold text-text-primary">Select a Date</p>
                <p className="text-xs text-text-muted mt-1 max-w-xs">
                  Choose an attendance register record from the list on the left to view detail logs or download Excel reports.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

export default function Attendance() {
  const [students, setStudents] = useState([])
  const [attendance, setAttendance] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [records, setRecords] = useState({ forenoon: {}, afternoon: {} })
  const [showHistory, setShowHistory] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)

  const activeSession = getAutoSession()

  useEffect(() => {
    Promise.all([adminService.getStudents(), adminService.getTodayAttendance()])
      .then(([stus, att]) => {
        // Sort students alphabetically by name
        const sortedStus = [...stus].sort((a, b) => a.name.localeCompare(b.name))
        setStudents(sortedStus)
        setAttendance(att)
        const fn = {}
        att.forenoon.records.forEach(r => { fn[r.studentId] = r.status })
        const an = {}
        att.afternoon.records.forEach(r => { an[r.studentId] = r.status })
        setRecords({ forenoon: fn, afternoon: an })
        setLoading(false)
      })
  }, [])

  const handleToggle = (studentId, status) => {
    setSaved(false)
    setRecords(prev => ({
      ...prev,
      [activeSession]: { ...prev[activeSession], [studentId]: status }
    }))
  }

  const handleMarkAll = (status) => {
    setSaved(false)
    const all = {}
    students.forEach(s => { all[s.id] = status })
    setRecords(prev => ({ ...prev, [activeSession]: all }))
  }

  const handleSubmit = async () => {
    setSaving(true)
    const recs = Object.entries(records[activeSession]).map(([studentId, status]) => ({ studentId, status }))
    await adminService.submitAttendance(activeSession, recs)
    setSaved(true)
    setSaving(false)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const currentRecords = records[activeSession] || {}
  const presentCount = Object.values(currentRecords).filter(s => s === 'PRESENT').length
  const absentCount = Object.values(currentRecords).filter(s => s === 'ABSENT').length
  const sessionLabel = activeSession === 'forenoon' ? 'Forenoon' : 'Afternoon'
  const sessionTime = activeSession === 'forenoon' ? '9:00 AM – 12:00 PM' : '1:00 PM – 4:00 PM'

  return (
    <div className="space-y-5 animate-fade-in">

      {/* Page Header with action buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="page-title">Mark Attendance</h1>
            
            <button
              onClick={() => setShowHistory(true)}
              className="flex items-center gap-1.5 px-3 py-1 bg-primary-light hover:bg-primary-muted text-primary text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95 mt-1 border border-primary/15 cursor-pointer"
            >
              <History className="w-3.5 h-3.5" /> History
            </button>

            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-1.5 px-3 py-1 bg-green-50 hover:bg-green-100 text-green-700 text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95 mt-1 border border-green-200 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" /> Download Excel
            </button>
          </div>
          <p className="page-subtitle">{format(new Date(), 'EEEE, dd MMMM yyyy')} • {sessionLabel} Session</p>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleMarkAll('PRESENT')}
            className="flex items-center gap-1.5 px-3 py-2 bg-success-soft text-green-700 text-xs font-bold rounded-xl hover:bg-green-100 transition-colors border border-green-200 cursor-pointer"
          >
            <span className="w-5 h-5 rounded bg-success text-white flex items-center justify-center text-[10px] font-black">P</span>
            All Present
          </button>
          <button
            onClick={() => handleMarkAll('ABSENT')}
            className="flex items-center gap-1.5 px-3 py-2 bg-danger-soft text-red-700 text-xs font-bold rounded-xl hover:bg-red-100 transition-colors border border-red-200 cursor-pointer"
          >
            <span className="w-5 h-5 rounded bg-danger text-white flex items-center justify-center text-[10px] font-black">A</span>
            All Absent
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="btn-primary flex items-center gap-2 text-sm cursor-pointer"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Submit Attendance
          </button>
        </div>
      </div>

      {/* Success Banner */}
      {saved && (
        <div className="flex items-center gap-3 bg-success-soft border border-green-200 text-green-800 rounded-2xl px-5 py-3.5 animate-scale-in">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-green-600" />
          <div>
            <p className="text-sm font-bold">Attendance Submitted Successfully</p>
            <p className="text-xs text-green-600 mt-0.5">
              {sessionLabel} session · {format(new Date(), 'dd MMM yyyy, hh:mm a')} · {presentCount} Present, {absentCount} Absent
            </p>
          </div>
        </div>
      )}

      {/* Attendance Register Table */}
      <div className="card p-0 overflow-hidden border border-gray-200">
        {/* Table Header */}
        <div className="bg-primary-light border-b border-primary/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ClipboardList className="w-5 h-5 text-primary" />
            <div>
              <p className="text-primary font-bold text-sm">Attendance Register</p>
              <p className="text-primary/70 text-[10px] mt-0.5">Session Timings: {sessionTime}</p>
            </div>
          </div>
        </div>


        {/* Column Labels */}
        <div className="grid grid-cols-[1fr_140px] sm:grid-cols-[50px_1fr_150px_170px] border-b border-gray-100 bg-background px-4 sm:px-6 py-2.5">
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-wide hidden sm:block">S.No</p>
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-wide">Student Name</p>
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-wide hidden sm:block">Roll No.</p>
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-wide text-center">Status</p>
        </div>

        {/* Student Rows */}
        <div className="divide-y divide-gray-50">
          {students.map((student, idx) => {
            const status = currentRecords[student.id] || 'PRESENT'
            const isPresent = status === 'PRESENT'

            return (
              <div
                key={student.id}
                className={`grid grid-cols-[1fr_140px] sm:grid-cols-[50px_1fr_150px_170px] items-center px-4 sm:px-6 py-3 transition-colors ${
                  isPresent ? 'hover:bg-success-soft/10' : 'hover:bg-danger-soft/10 bg-red-50/30'
                }`}
              >
                {/* S.No */}
                <p className="text-xs text-text-muted font-semibold hidden sm:block">{String(idx + 1).padStart(2, '0')}</p>

                {/* Student Name */}
                <div className="min-w-0 pr-2">
                  <p className="text-sm font-semibold text-text-primary truncate">{student.name}</p>
                  <p className="text-[10px] font-mono font-bold text-text-muted mt-0.5 sm:hidden">{student.registerNumber}</p>
                </div>

                {/* Roll No */}
                <p className="text-xs font-mono font-semibold text-text-secondary hidden sm:block">{student.registerNumber}</p>

                {/* Status Toggle */}
                <div className="flex items-center justify-center gap-1.5">
                  <button
                    onClick={() => handleToggle(student.id, 'PRESENT')}
                    className={`px-3 py-1.5 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all cursor-pointer ${
                      isPresent
                        ? 'bg-success text-white shadow-sm shadow-green-200 scale-105'
                        : 'bg-white text-text-muted border border-gray-200 hover:border-green-400 hover:text-green-600 hover:bg-success-soft'
                    }`}
                  >
                    Present
                  </button>
                  <button
                    onClick={() => handleToggle(student.id, 'ABSENT')}
                    className={`px-3 py-1.5 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all cursor-pointer ${
                      !isPresent
                        ? 'bg-danger text-white shadow-sm shadow-red-200 scale-105'
                        : 'bg-white text-text-muted border border-gray-200 hover:border-red-400 hover:text-red-600 hover:bg-danger-soft'
                    }`}
                  >
                    Absent
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 bg-background px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {absentCount > 0 && (
              <div className="flex items-center gap-1.5 text-amber-700 bg-warning-soft border border-amber-200 rounded-lg px-3 py-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span className="text-xs font-bold">{absentCount} student{absentCount > 1 ? 's' : ''} marked absent</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          onClose={() => setShowExportModal(false)}
          students={students}
          todayAttendance={attendance}
        />
      )}

      {/* History Modal */}
      {showHistory && (
        <HistoryModal
          onClose={() => setShowHistory(false)}
          students={students}
        />
      )}
    </div>
  )
}
