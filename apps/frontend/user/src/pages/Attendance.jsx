import React, { useState, useEffect } from 'react'
import { Search, CheckCircle2, XCircle } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { attendanceService } from '../services/attendanceService'

export default function Attendance() {
  const [records, setRecords] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    attendanceService.getAll().then((recs) => {
      setRecords(recs)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Group records by date
  const groupedRecords = records.reduce((acc, rec) => {
    if (!acc[rec.date]) {
      acc[rec.date] = { date: rec.date, forenoon: null, afternoon: null }
    }
    if (rec.session.toLowerCase().includes('forenoon')) acc[rec.date].forenoon = rec.status
    if (rec.session.toLowerCase().includes('afternoon')) acc[rec.date].afternoon = rec.status
    return acc
  }, {})

  const sortedDates = Object.values(groupedRecords)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .filter(rec => {
      const formattedDate = format(parseISO(rec.date), 'MMM dd yyyy').toLowerCase()
      return formattedDate.includes(searchQuery.toLowerCase())
    })

  const StatusBadge = ({ status }) => {
    if (!status) return <span className="text-text-muted text-xs font-bold">-</span>
    const isAbsent = status.toUpperCase() === 'ABSENT'
    return (
      <span className={`px-2 py-0.5 text-[10px] font-black rounded uppercase tracking-wider ${
        isAbsent ? 'bg-danger text-white' : 'bg-success text-white'
      }`}>
        {status}
      </span>
    )
  }

  const byMonth = sortedDates.reduce((acc, day) => {
    const month = format(parseISO(day.date), 'MMMM yyyy')
    if (!acc[month]) acc[month] = []
    acc[month].push(day)
    return acc
  }, {})

  const availableMonths = Object.keys(byMonth)
  const activeMonth = selectedMonth && availableMonths.includes(selectedMonth) 
    ? selectedMonth 
    : (availableMonths[0] || '')

  return (
    <div className="space-y-6">
      {/* Controls: Search and Filter */}
      <div className="pt-2 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search by date..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm font-semibold text-text-primary placeholder:text-text-muted shadow-sm transition-all bg-white"
          />
        </div>
        {availableMonths.length > 0 && (
          <select
            value={activeMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm font-semibold text-text-primary bg-white shadow-sm appearance-none min-w-[160px] cursor-pointer"
          >
            {availableMonths.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        )}
      </div>

      {/* Grid for Active Month */}
      {activeMonth && byMonth[activeMonth] && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-text-primary">{activeMonth}</h2>
            <p className="text-xs font-bold text-text-muted">{byMonth[activeMonth].length} records found</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {byMonth[activeMonth].map(day => {
              const isAbsent = day.forenoon === 'ABSENT' || day.afternoon === 'ABSENT'
              const dateObj = parseISO(day.date)
              
              return (
                <div key={day.date} className={`card bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow relative ${
                  isAbsent ? 'border border-danger-soft' : 'border border-gray-100'
                }`}>
                  {/* Status Indicator Stripe */}
                  <div className={`absolute left-0 top-0 w-1 h-full ${isAbsent ? 'bg-danger' : 'bg-success'}`} />
                  
                  <div className="p-3 pl-4 flex flex-col h-full justify-between space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[12px] font-black text-text-primary leading-none">{format(dateObj, 'MMM dd')}</p>
                        <p className="text-[9px] font-bold text-text-muted mt-1 uppercase tracking-wider">{format(dateObj, 'EEEE')}</p>
                      </div>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isAbsent ? 'bg-danger-soft text-danger' : 'bg-success-soft text-green-600'
                      }`}>
                        {isAbsent ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                    </div>

                    <div className="flex gap-1.5">
                      <div className="flex-1 bg-gray-50 rounded-md p-1.5 flex items-center justify-between border border-gray-100">
                        <span className="text-[9px] font-black text-text-secondary uppercase">FN</span>
                        <div className={`w-2 h-2 rounded-full ${!day.forenoon ? 'bg-gray-300' : day.forenoon === 'ABSENT' ? 'bg-danger' : 'bg-success'}`} />
                      </div>
                      <div className="flex-1 bg-gray-50 rounded-md p-1.5 flex items-center justify-between border border-gray-100">
                        <span className="text-[9px] font-black text-text-secondary uppercase">AN</span>
                        <div className={`w-2 h-2 rounded-full ${!day.afternoon ? 'bg-gray-300' : day.afternoon === 'ABSENT' ? 'bg-danger' : 'bg-success'}`} />
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
      
      {!activeMonth && (
        <div className="text-center py-10 bg-white rounded-xl border border-gray-100">
           <p className="text-sm font-semibold text-text-muted">No records match your search.</p>
        </div>
      )}
    </div>
  )
}
