import React, { useState, useEffect } from 'react'
import { FileText } from 'lucide-react'
import LeaveForm from '../components/leave/LeaveForm'
import LeaveHistory from '../components/leave/LeaveHistory'
import { leaveService } from '../services/leaveService'

const TABS = ['Apply Leave', 'Leave History']

export default function Leave() {
  const [tab, setTab] = useState(0)
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    leaveService.getAll().then(data => {
      setLeaves(data)
      setLoading(false)
    })
  }, [])

  const handleSubmit = async (form) => {
    const newLeave = await leaveService.apply(form)
    setLeaves(prev => [newLeave, ...prev])
    setTimeout(() => setTab(1), 800) // switch to history after submit
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Leave</h1>
        <p className="page-subtitle">Apply for leave and view your leave history</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-background p-1 rounded-2xl">
        {TABS.map((t, i) => (
          <button
            key={t}
            id={`leave-tab-${i}`}
            onClick={() => setTab(i)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
              tab === i
                ? 'bg-white text-primary shadow-sm'
                : 'text-text-secondary hover:text-primary'
            }`}
          >
            {t}
            {i === 1 && leaves.length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full">
                {leaves.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === 0 ? (
        <div className="card">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 bg-primary-light rounded-xl">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-text-primary">Apply for Leave</h2>
              <p className="text-xs text-text-muted">Fill in the details below</p>
            </div>
          </div>
          <LeaveForm onSubmit={handleSubmit} />
        </div>
      ) : (
        <LeaveHistory leaves={leaves} />
      )}
    </div>
  )
}
