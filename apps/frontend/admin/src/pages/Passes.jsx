import React, { useEffect, useState } from 'react'
import { MapPin, Clock, User, Calendar } from 'lucide-react'
import { adminService } from '../services/adminService'

export default function Passes() {
  const [passes, setPasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')

  const loadPasses = () => {
    adminService.getPasses().then(data => {
      setPasses(data)
      setLoading(false)
    })
  }

  useEffect(() => {
    loadPasses()
  }, [])

  const filtered = filter === 'ALL' ? passes : passes.filter(p => p.status === filter)
  const activeCnt = passes.filter(p => p.status === 'ACTIVE').length

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Movement Passes</h1>
        <p className="page-subtitle">{activeCnt} active pass{activeCnt !== 1 ? 'es' : ''} right now</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'ALL', label: 'All Passes' },
          { key: 'ACTIVE', label: 'Active' },
          { key: 'UPCOMING', label: 'Upcoming' },
          { key: 'EXPIRED', label: 'Expired' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer
              ${filter === f.key ? 'bg-primary text-white shadow-sm' : 'bg-card text-text-muted hover:text-text-primary border border-gray-150'}`}
          >
            {f.label} ({f.key === 'ALL' ? passes.length : passes.filter(p => p.status === f.key).length})
          </button>
        ))}
      </div>

      {/* Pass cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(pass => (
          <div
            key={pass.id}
            className={`card border transition-all flex flex-col justify-between p-5 bg-card hover:-translate-y-0.5 ${
              pass.status === 'ACTIVE'
                ? 'border-primary/40 shadow-xs'
                : 'border-gray-150'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3.5">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      pass.status === 'ACTIVE'
                        ? 'bg-primary text-white shadow-xs'
                        : pass.status === 'UPCOMING'
                        ? 'bg-primary-light text-primary'
                        : 'bg-gray-100 text-text-muted'
                    }`}
                  >
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-text-primary truncate">{pass.studentName}</p>
                    <p className="text-xs text-text-muted font-mono">{pass.registerNumber}</p>
                  </div>
                </div>

                <span
                  className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex-shrink-0 flex items-center gap-1.5 ${
                    pass.status === 'ACTIVE'
                      ? 'bg-primary text-white shadow-xs'
                      : pass.status === 'UPCOMING'
                      ? 'bg-primary-light text-primary border border-primary/20 font-bold'
                      : 'bg-gray-100 text-text-muted border border-gray-200 font-semibold'
                  }`}
                >
                  {pass.status === 'ACTIVE' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  )}
                  {pass.status}
                </span>
              </div>

              <div className="space-y-1.5 bg-background p-3 rounded-xl border border-gray-100">
                <div className="flex items-center gap-2 text-xs">
                  <Clock className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
                  <span className="font-bold text-text-primary">{pass.movementType}</span>
                  <span className="text-text-muted">•</span>
                  <span className={pass.status === 'ACTIVE' ? 'font-bold text-primary' : 'font-medium text-text-secondary'}>
                    {pass.timing}
                  </span>
                </div>
                {pass.reason && (
                  <div className="flex items-start gap-2 text-xs text-text-secondary">
                    <MapPin className="w-3.5 h-3.5 text-text-muted mt-0.5 flex-shrink-0" />
                    <span className="leading-snug">{pass.reason}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-[10px] text-text-muted font-medium">
              <span className="flex items-center gap-1 font-mono">
                <Calendar className="w-3 h-3 text-text-muted" /> Date: {pass.date}
              </span>
              {pass.slot && (
                <span className={`text-[9px] px-2 py-0.5 rounded font-semibold ${
                  pass.status === 'ACTIVE' || pass.status === 'UPCOMING'
                    ? 'bg-primary-light text-primary font-bold'
                    : 'bg-gray-100 text-text-secondary'
                }`}>
                  {pass.slot}
                </span>
              )}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full card text-center py-12 text-text-muted border border-dashed border-gray-200">
            <MapPin className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No passes found</p>
          </div>
        )}
      </div>
    </div>
  )
}
