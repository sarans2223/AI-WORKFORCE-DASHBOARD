import React, { useState, useEffect } from 'react'
import { MapPin } from 'lucide-react'
import MovementPassForm from '../components/movement/MovementPassForm'
import MovementPassHistory from '../components/movement/MovementPassHistory'
import { movementService } from '../services/movementService'

const TABS = ['Create Pass', 'History']

export default function MovementPass() {
  const [tab, setTab] = useState(0)
  const [passes, setPasses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    movementService.getAll().then(data => {
      setPasses(data)
      setLoading(false)
    })
  }, [])

  const handleSubmit = async (form) => {
    const newPass = await movementService.create(form)
    setPasses(prev => [newPass, ...prev])
    setTimeout(() => setTab(1), 800)
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
        <h1 className="page-title">Movement Pass</h1>
        <p className="page-subtitle">Create and view your movement passes</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-background p-1 rounded-2xl">
        {TABS.map((t, i) => (
          <button
            key={t}
            id={`mp-tab-${i}`}
            onClick={() => setTab(i)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
              tab === i
                ? 'bg-white text-primary shadow-sm'
                : 'text-text-secondary hover:text-primary'
            }`}
          >
            {t}
            {i === 1 && passes.length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full">
                {passes.length}
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
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-text-primary">New Movement Pass</h2>
            </div>
          </div>
          <MovementPassForm onSubmit={handleSubmit} />
        </div>
      ) : (
        <MovementPassHistory passes={passes} />
      )}
    </div>
  )
}
