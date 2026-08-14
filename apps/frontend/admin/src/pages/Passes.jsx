import React, { useEffect, useState } from 'react'
import { MapPin, Clock, User } from 'lucide-react'
import { adminService } from '../services/adminService'
import { format } from 'date-fns'

const todayStr = format(new Date(), 'yyyy-MM-dd')

export default function Passes() {
  const [passes, setPasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')

  useEffect(() => {
    adminService.getPasses().then(data => {
      setPasses(data)
      setLoading(false)
    })
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

      {/* Filter */}
      <div className="flex gap-2">
        {['ALL', 'ACTIVE', 'EXPIRED'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all
              ${filter === f ? 'bg-primary text-white shadow-sm' : 'bg-card text-text-muted hover:text-text-primary border border-gray-100'}`}
          >
            {f === 'ALL' ? 'All Passes' : f === 'ACTIVE' ? 'Active' : 'Expired'}
          </button>
        ))}
      </div>

      {/* Pass cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        {filtered.map(pass => (
          <div key={pass.id} className={`card border transition-all
            ${pass.status === 'ACTIVE' ? 'border-blue-100 bg-info-soft/20' : 'border-gray-100'}`}>
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                  ${pass.status === 'ACTIVE' ? 'bg-info-soft' : 'bg-background'}`}>
                  <MapPin className={`w-5 h-5 ${pass.status === 'ACTIVE' ? 'text-blue-600' : 'text-text-muted'}`} />
                </div>
                <div>
                  <p className="text-sm font-bold text-text-primary">{pass.studentName}</p>
                  <p className="text-xs text-text-muted">{pass.registerNumber}</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-badge flex-shrink-0
                ${pass.status === 'ACTIVE' ? 'bg-info-soft text-blue-700' : 'bg-background text-text-muted'}`}>
                {pass.status}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-text-secondary">
                <Clock className="w-3.5 h-3.5 text-text-muted" />
                <span>{pass.movementType} • {pass.timing}</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-text-secondary">
                <MapPin className="w-3.5 h-3.5 text-text-muted mt-0.5" />
                <span>{pass.reason}</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-50">
              <p className="text-[10px] text-text-muted">Date: {pass.date}</p>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-2 card text-center py-12 text-text-muted">
            <MapPin className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No passes found</p>
          </div>
        )}
      </div>
    </div>
  )
}
