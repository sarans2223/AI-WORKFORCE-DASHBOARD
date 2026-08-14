import React, { useEffect, useState } from 'react'
import { FileText, Calendar, Eye } from 'lucide-react'
import { format } from 'date-fns'
import { adminService } from '../services/adminService'

export default function Leaves() {
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('all') // 'all' | 'past' | 'upcoming'

  useEffect(() => {
    adminService.getLeaves().then(data => {
      setLeaves(data)
      setLoading(false)
    })
  }, [])

  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const isUpcoming = (l) => l.startDate >= todayStr
  const isPast = (l) => l.endDate < todayStr

  const filteredLeaves = leaves.filter(lv => {
    if (filter === 'past') return isPast(lv)
    if (filter === 'upcoming') return isUpcoming(lv)
    return true
  })

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Leave Applications</h1>
          <p className="page-subtitle">View-only • {filteredLeaves.length} record{filteredLeaves.length !== 1 ? 's' : ''} found</p>
        </div>

        {/* Tab Filters */}
        <div className="flex bg-card border border-gray-200 rounded-xl p-1 gap-1 shadow-sm w-fit self-start sm:self-auto">
          {[
            { key: 'all', label: 'All' },
            { key: 'upcoming', label: 'Upcoming' },
            { key: 'past', label: 'Past' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all
                ${filter === key
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-muted hover:text-text-primary'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-card rounded-card shadow-modal w-full max-w-md p-6 animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-base font-black text-text-primary">{selected.studentName}</p>
                <p className="text-xs text-text-muted">{selected.registerNumber}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-background rounded-xl p-4">
                <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-1">Leave Period</p>
                <p className="text-sm font-bold text-text-primary">{selected.startDate} → {selected.endDate}</p>
              </div>
              <div className="bg-background rounded-xl p-4">
                <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-1">Reason</p>
                <p className="text-sm text-text-secondary leading-relaxed">{selected.reason}</p>
              </div>
              <div className="bg-background rounded-xl p-4">
                <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-1">Submitted On</p>
                <p className="text-sm font-semibold text-text-primary">{selected.submittedOn}</p>
              </div>
            </div>
            <button onClick={() => setSelected(null)} className="btn-secondary w-full mt-6">Close</button>
          </div>
        </div>
      )}

      {/* Leave Cards */}
      <div className="space-y-3">
        {filteredLeaves.map(lv => (
          <div
            key={lv.id}
            className="card border border-gray-100 flex items-start gap-4 hover:shadow-card-hover transition-shadow cursor-pointer p-4 sm:p-5"
            onClick={() => setSelected(lv)}
          >
            {/* Left: Icon */}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
              ${isUpcoming(lv) ? 'bg-warning-soft' : isPast(lv) ? 'bg-background' : 'bg-danger-soft'}`}>
              <Calendar className={`w-5 h-5 ${isUpcoming(lv) ? 'text-amber-600' : isPast(lv) ? 'text-text-muted' : 'text-red-600'}`} />
            </div>

            {/* Right: Balanced details and metadata layout */}
            <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-6 min-w-0">
              {/* Student details */}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-text-primary">{lv.studentName}</p>
                  <p className="text-[10px] font-mono font-bold text-text-muted bg-background border border-gray-150 px-2 py-0.2 rounded-md">{lv.registerNumber}</p>
                </div>
                <p className="text-xs text-text-secondary mt-1 line-clamp-2 sm:line-clamp-1">{lv.reason}</p>
              </div>

              {/* Date range & Status Badge & Action */}
              <div className="flex items-center gap-3 sm:gap-4 flex-wrap sm:flex-nowrap">
                <div className="text-left sm:text-right font-medium">
                  <p className="text-xs font-bold text-text-primary leading-tight">{lv.startDate}</p>
                  <p className="text-[10px] text-text-muted mt-0.5">to {lv.endDate}</p>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap
                  ${isUpcoming(lv) ? 'bg-warning-soft text-amber-700 border border-amber-200/50' : 
                    isPast(lv) ? 'bg-background text-text-muted border border-gray-200/50' : 
                    'bg-danger-soft text-red-700 border border-red-200/50'}`}>
                  {isUpcoming(lv) ? 'Upcoming' : isPast(lv) ? 'Past' : 'Active'}
                </span>
                <div className="p-1 rounded-lg bg-background border border-gray-150 hover:bg-gray-100 transition-colors hidden sm:block">
                  <Eye className="w-3.5 h-3.5 text-text-muted" />
                </div>
              </div>
            </div>
          </div>
        ))}
        {filteredLeaves.length === 0 && (
          <div className="card text-center py-12 text-text-muted border border-dashed border-gray-200">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No leave applications found in this tab</p>
          </div>
        )}
      </div>
    </div>
  )
}
