import React, { useState, useEffect, useRef } from 'react'
import { 
  format, parseISO, startOfMonth, endOfMonth, 
  startOfWeek, endOfWeek, eachDayOfInterval, 
  isSameMonth, isSameDay, subMonths, addMonths 
} from 'date-fns'
import { 
  Calendar as CalendarIcon, Clock, 
  MapPin, ChevronLeft, ChevronRight, ChevronDown, Search 
} from 'lucide-react'
import { attendanceService } from '../services/attendanceService'
import { movementService } from '../services/movementService'

// 7 Standard Academic Slots
const HOURLY_SLOTS = [
  { id: 1, startTime: '08:45 AM', endTime: '09:35 AM', session: 'Forenoon' },
  { id: 2, startTime: '09:35 AM', endTime: '10:25 AM', session: 'Forenoon' },
  { id: 3, startTime: '10:40 AM', endTime: '11:30 AM', session: 'Forenoon' },
  { id: 4, startTime: '11:30 AM', endTime: '12:20 PM', session: 'Forenoon' },
  { id: 5, startTime: '01:30 PM', endTime: '02:20 PM', session: 'Afternoon' },
  { id: 6, startTime: '02:20 PM', endTime: '03:10 PM', session: 'Afternoon' },
  { id: 7, startTime: '03:25 PM', endTime: '04:25 PM', session: 'Afternoon' }
]

export default function Attendance() {
  const [records, setRecords] = useState([])
  const [passes, setPasses] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Calendar states
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [showCalendar, setShowCalendar] = useState(false)

  // Search & Month filters states
  const [searchQuery, setSearchQuery] = useState('')
  const [availableMonths, setAvailableMonths] = useState([])

  // Hourly Log Filter state ('ALL', 'PRESENT', 'ABSENT', 'PASS')
  const [filter, setFilter] = useState('ALL')

  const calendarRef = useRef(null)

  useEffect(() => {
    Promise.all([
      attendanceService.getAll(),
      movementService.getAll()
    ]).then(([recs, passList]) => {
      setRecords(recs)
      setPasses(passList)
      
      // Calculate available months from records
      if (recs.length > 0) {
        const sortedRecs = [...recs].sort((a, b) => b.date.localeCompare(a.date))
        const latestRecordDate = parseISO(sortedRecs[0].date)
        setSelectedDate(latestRecordDate)
        setCurrentMonth(latestRecordDate)

        const uniqueMonths = Array.from(new Set(recs.map(r => 
          format(parseISO(r.date), 'MMMM yyyy')
        ))).sort((a, b) => new Date(b) - new Date(a))
        setAvailableMonths(uniqueMonths)
      }
      
      setLoading(false)
    })
  }, [])

  // Handle outside click to close calendar dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Parse time to minutes from midnight for mathematical overlap calculations
  const parseTimeToMinutes = (timeStr) => {
    if (!timeStr) return 0
    const clean = timeStr.trim().toLowerCase()
    const match = clean.match(/(\d+):(\d+)\s*(am|pm)/)
    if (!match) {
      const simpleMatch = clean.match(/(\d+)\s*(am|pm)/)
      if (simpleMatch) {
        let h = parseInt(simpleMatch[1])
        const period = simpleMatch[2]
        if (period === 'pm' && h < 12) h += 12
        if (period === 'am' && h === 12) h = 0
        return h * 60
      }
      return 0
    }
    let hr = parseInt(match[1])
    const min = parseInt(match[2])
    const ampm = match[3]
    if (ampm === 'pm' && hr < 12) hr += 12
    if (ampm === 'am' && hr === 12) hr = 0
    return hr * 60 + min
  }

  // Check if a movement pass overlaps with the hourly slot time range
  const getOverlappingPass = (pass, slotStartStr, slotEndStr) => {
    let timing = pass.timing || ''
    timing = timing.replace(/–/g, '-').replace(/to/g, '-')
    const parts = timing.split('-')
    if (parts.length < 2) return null
    
    const passStart = parseTimeToMinutes(parts[0])
    const passEnd = parseTimeToMinutes(parts[1])
    
    const slotStart = parseTimeToMinutes(slotStartStr)
    const slotEnd = parseTimeToMinutes(slotEndStr)
    
    // Overlap condition
    if (passStart < slotEnd && passEnd > slotStart) {
      return pass
    }
    return null
  }

  // Lookup attendance session statuses for a specific date
  const getDateStatus = (date) => {
    const formattedDate = format(date, 'yyyy-MM-dd')
    const recs = records.filter(r => r.date === formattedDate)
    const forenoon = recs.find(r => r.session.toLowerCase().includes('forenoon'))?.status
    const afternoon = recs.find(r => r.session.toLowerCase().includes('afternoon'))?.status
    return { forenoon, afternoon }
  }

  // Month navigation handlers
  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))

  // Handle Month dropdown select
  const handleMonthFilterChange = (e) => {
    const val = e.target.value
    if (!val) return
    const match = records.find(r => format(parseISO(r.date), 'MMMM yyyy') === val)
    if (match) {
      const parsedDate = parseISO(match.date)
      setSelectedDate(parsedDate)
      setCurrentMonth(parsedDate)
    }
  }

  // Handle Search Input change
  const handleSearchChange = (e) => {
    const query = e.target.value
    setSearchQuery(query)
    if (!query.trim()) return

    const q = query.toLowerCase()
    const match = records.find(r => {
      const parsed = parseISO(r.date)
      const formatted = format(parsed, 'dd MMM yyyy').toLowerCase()
      const formattedSimple = format(parsed, 'd MMM').toLowerCase()
      return formatted.includes(q) || formattedSimple.includes(q) || r.date.includes(q)
    })
    if (match) {
      const parsedDate = parseISO(match.date)
      setSelectedDate(parsedDate)
      setCurrentMonth(parsedDate)
    }
  }

  // Render Calendar Grid Days in Dropdown
  const renderCalendarDropdown = () => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 })
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 })
    const days = eachDayOfInterval({ start: startDate, end: endDate })

    const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

    return (
      <div className="absolute left-0 mt-2 w-72 bg-white border border-gray-150 rounded-xl shadow-modal p-4 z-50 animate-scale-in">
        {/* Navigation header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-black text-text-primary uppercase tracking-wider">
            {format(currentMonth, 'MMMM yyyy')}
          </h3>
          <div className="flex items-center gap-1">
            <button 
              type="button"
              onClick={handlePrevMonth} 
              className="p-1 hover:bg-gray-150 rounded-lg text-text-secondary transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              type="button"
              onClick={handleNextMonth} 
              className="p-1 hover:bg-gray-150 rounded-lg text-text-secondary transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Weekdays Labels */}
        <div className="grid grid-cols-7 gap-1 text-center mb-1">
          {weekdays.map(d => (
            <span key={d} className="text-[10px] font-bold text-text-muted uppercase tracking-wider py-1">{d}</span>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, idx) => {
            const isSameMonthDay = isSameMonth(day, currentMonth)
            const isSelected = isSameDay(day, selectedDate)
            const { forenoon, afternoon } = getDateStatus(day)
            const hasAbsence = forenoon === 'ABSENT' || afternoon === 'ABSENT'
            const hasPresence = forenoon === 'PRESENT' || afternoon === 'PRESENT'

            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSelectedDate(day)
                  setShowCalendar(false)
                }}
                className={`aspect-square flex flex-col items-center justify-center rounded-lg text-xs font-semibold relative transition-all duration-150 ${
                  !isSameMonthDay ? 'text-text-muted opacity-40 hover:bg-gray-50' : 
                  isSelected ? 'bg-primary text-white font-extrabold shadow-sm' : 
                  'text-text-primary hover:bg-primary-light/50'
                }`}
              >
                <span>{format(day, 'd')}</span>
                {/* Visual indicator dot under date */}
                {isSameMonthDay && (
                  <div className="absolute bottom-1 flex gap-0.5">
                    {hasAbsence && <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-danger'}`} />}
                    {hasPresence && !hasAbsence && <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-success'}`} />}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  // Render Hourly slots log list for selectedDate (Redesigned as vertical timeline)
  const renderHourlySlots = () => {
    const formattedSelectedDate = format(selectedDate, 'yyyy-MM-dd')
    const { forenoon, afternoon } = getDateStatus(selectedDate)
    
    // Fetch movement passes that match this date
    const datePasses = passes.filter(p => p.date === formattedSelectedDate)

    // Calculate slots after applying active tab filters
    const filteredSlots = HOURLY_SLOTS.filter(slot => {
      let hasPass = false
      for (let pass of datePasses) {
        if (getOverlappingPass(pass, slot.startTime, slot.endTime)) {
          hasPass = true
          break
        }
      }

      const isSessionAbsent = slot.session === 'Forenoon' ? forenoon === 'ABSENT' : afternoon === 'ABSENT'
      const isAbsent = isSessionAbsent && !hasPass

      if (filter === 'PRESENT') return !isAbsent
      if (filter === 'ABSENT') return isAbsent
      if (filter === 'PASS') return hasPass
      return true
    })

    return (
      <div className="card border border-gray-100 bg-white p-5 relative overflow-hidden">
        {/* Timeline Line */}
        <div className="relative pl-6 border-l border-gray-100 space-y-6">
          {filteredSlots.length === 0 ? (
            <div className="text-center text-xs font-bold text-text-muted italic py-6 pl-2">
              No hourly records found matching "{filter.toLowerCase()}" filter
            </div>
          ) : (
            filteredSlots.map((slot) => {
              // Check if there is an overlapping movement pass
              let matchedPass = null
              for (let pass of datePasses) {
                const overlap = getOverlappingPass(pass, slot.startTime, slot.endTime)
                if (overlap) {
                  matchedPass = overlap
                  break
                }
              }

              // Check absence in this slot session (FN or AN), taking movement pass into account
              const isAbsent = (slot.session === 'Forenoon' ? forenoon === 'ABSENT' : afternoon === 'ABSENT') && !matchedPass

              // Color configuration for nodes
              const nodeColorClass = matchedPass 
                ? 'bg-warning border-warning-soft' 
                : isAbsent 
                  ? 'bg-danger border-danger-soft' 
                  : 'bg-success border-success-soft'

              const timingColor = isAbsent ? 'text-danger' : matchedPass ? 'text-warning-dark' : 'text-text-primary'

              return (
                <div key={slot.id} className="relative flex flex-col gap-2 pl-2">
                  {/* Timeline Bullet Node */}
                  {isAbsent ? (
                    <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full border-[3px] border-danger bg-white shadow-xs z-10" />
                  ) : matchedPass ? (
                    <div className="absolute -left-[29px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white bg-warning shadow-xs" />
                  ) : (
                    <div className="absolute -left-[29px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white bg-success shadow-xs" />
                  )}

                  {/* Main Header Row: Timing, Session, Status Badge */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-black tracking-tight ${timingColor}`}>
                        {slot.startTime} - {slot.endTime}
                      </span>
                      <span className="text-[8px] font-black text-text-muted bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded uppercase leading-none">
                        {slot.session === 'Forenoon' ? 'FN' : 'AN'}
                      </span>
                    </div>

                    {/* Status Badges */}
                    <div className="flex items-center gap-1.5">
                      {matchedPass ? (
                        <span className="px-1.5 py-0.5 bg-warning text-white text-[8px] font-black rounded uppercase tracking-wider">
                          {matchedPass.skillName ? `P-Skill: ${matchedPass.skillName}` : 'Pass'}
                        </span>
                      ) : (
                        <span className={`px-1.5 py-0.5 text-[8px] font-black rounded uppercase tracking-wider ${
                          isAbsent ? 'bg-danger-soft text-danger' : 'bg-success-soft text-success'
                        }`}>
                          {isAbsent ? 'Absent' : 'Present'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Nested Pass details if applied */}
                  {matchedPass && (
                    <div className="ml-1 p-2.5 bg-warning-soft/30 border border-warning/15 rounded-xl space-y-1 flex flex-col">
                      <div className="flex items-center gap-1 text-[8px] text-warning font-black uppercase tracking-wider">
                        <MapPin className="w-2.5 h-2.5" /> Pass Details ({matchedPass.movementType})
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 text-[9px] text-text-secondary leading-normal">
                        <p>
                          <span className="font-bold text-text-primary block">Pass Timing:</span> {matchedPass.timing}
                        </p>
                        {matchedPass.skillName && (
                          <p>
                            <span className="font-bold text-text-primary block">Skill Name:</span> {matchedPass.skillName}
                          </p>
                        )}
                      </div>
                      {matchedPass.movementType !== 'PS slot' && (
                        <p className="text-[9px] text-text-secondary leading-normal pt-1 border-t border-warning/10">
                          <span className="font-bold text-text-primary">Reason:</span> {matchedPass.reason}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <h1 className="text-xl font-black text-text-primary tracking-tight">My Attendance</h1>
        <p className="text-xs text-text-secondary mt-0.5">View hourly logs and approved pass verifications</p>
      </div>

      {/* Control Bar: Search, Month Filter, Date Selector & Log Filter Options */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-xs">
        {/* Search Box */}
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search date (e.g. 15 Aug)..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-4 py-2 text-xs bg-background border border-gray-150 rounded-xl focus:border-primary/50 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all outline-none font-semibold text-text-primary"
          />
        </div>

        {/* Month Dropdown Selector */}
        {availableMonths.length > 0 && (
          <select
            value={format(currentMonth, 'MMMM yyyy')}
            onChange={handleMonthFilterChange}
            className="px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-primary/30 cursor-pointer min-w-[130px] font-bold text-text-primary"
          >
            {availableMonths.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        )}

        {/* Date Selector Trigger */}
        <div ref={calendarRef} className="relative">
          <button
            type="button"
            onClick={() => setShowCalendar(!showCalendar)}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl hover:border-primary/30 transition-all text-xs font-bold text-text-primary shadow-xs cursor-pointer focus:outline-none"
          >
            <CalendarIcon className="w-4 h-4 text-primary" />
            <span>{format(selectedDate, 'dd MMM yyyy')}</span>
            <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
          </button>
          {showCalendar && renderCalendarDropdown()}
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap gap-1 p-1 bg-gray-50 rounded-xl border border-gray-200/50">
          {[
            { id: 'ALL', label: 'All' },
            { id: 'PRESENT', label: 'Present' },
            { id: 'ABSENT', label: 'Absent' },
            { id: 'PASS', label: 'Pass' }
          ].map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setFilter(opt.id)}
              className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                filter === opt.id
                  ? 'bg-white text-primary shadow-xs border border-gray-100'
                  : 'text-text-secondary hover:text-text-primary border border-transparent'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Logs section (All slots visible on a single page in vertical timeline) */}
      <div className="space-y-3">
        <h2 className="text-xs font-black text-text-primary flex items-center gap-1.5 uppercase tracking-wider">
          <Clock className="w-4 h-4 text-primary" /> Logs for {format(selectedDate, 'EEEE, d MMM')}
        </h2>
        {renderHourlySlots()}
      </div>
    </div>
  )
}
