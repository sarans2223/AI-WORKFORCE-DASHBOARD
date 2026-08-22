import React, { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import { Plus, CalendarDays } from 'lucide-react'
import ActivityCard from '../components/activity/ActivityCard'
import ActivityForm from '../components/activity/ActivityForm'
import ActivityExtension from '../components/activity/ActivityExtension'
import EmptyState from '../components/common/EmptyState'
import { activityService } from '../services/activityService'

export default function DailyPlan() {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editActivity, setEditActivity] = useState(null)
  const [extendActivity, setExtendActivity] = useState(null)
  const today = format(new Date(), 'yyyy-MM-dd')

  const loadActivities = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await activityService.getByDate(today)
      setActivities(data)
    } catch (err) {
      setError(err.message || 'Failed to load activities')
    } finally {
      setLoading(false)
    }
  }, [today])

  useEffect(() => { loadActivities() }, [loadActivities])

  const handleSave = async (formData) => {
    try {
      if (editActivity) {
        const updated = await activityService.update(editActivity.id, formData)
        setActivities(prev => prev.map(a => a.id === editActivity.id ? updated : a))
      } else {
        const created = await activityService.create({ ...formData, date: today })
        setActivities(prev => [created, ...prev])
      }
      setEditActivity(null)
    } catch (err) {
      alert(err.message || 'Failed to save activity')
    }
  }

  const handleExtend = async (id, extendedEndTime, reason) => {
    try {
      const updated = await activityService.extendTime(id, extendedEndTime, reason)
      setActivities(prev => prev.map(a => a.id === id ? updated : a))
    } catch (err) {
      alert(err.message || 'Failed to extend activity time')
    }
  }

  const handleComplete = async (id) => {
    try {
      const updated = await activityService.update(id, { status: 'COMPLETED', progress: 100 })
      setActivities(prev => prev.map(a => a.id === id ? updated : a))
    } catch (err) {
      alert(err.message || 'Failed to mark activity as completed')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this activity?')) return
    try {
      await activityService.delete(id)
      setActivities(prev => prev.filter(a => a.id !== id))
    } catch (err) {
      alert(err.message || 'Failed to delete activity')
    }
  }

  const openEdit = (activity) => {
    if (activity.status === 'COMPLETED') {
      alert('Completed activities cannot be edited.')
      return
    }
    setEditActivity(activity)
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditActivity(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="card p-6 border border-red-200 text-center space-y-4 max-w-md mx-auto mt-10">
        <p className="text-red-500 font-semibold">{error}</p>
        <button onClick={loadActivities} className="btn-primary text-xs px-4 py-2">
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="page-header mb-0">
          <h1 className="page-title">Daily Plan</h1>
          <p className="page-subtitle">{format(new Date(), 'EEEE, dd MMMM yyyy')}</p>
        </div>
        <button
          id="add-activity-btn"
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Activity</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Summary chips */}
      {activities.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {[
            { label: 'All', count: activities.length, filter: null },
            { label: 'Planned', count: activities.filter(a => a.status === 'PLANNED').length, filter: 'PLANNED' },
            { label: 'In Progress', count: activities.filter(a => a.status === 'IN_PROGRESS').length, filter: 'IN_PROGRESS' },
            { label: 'Completed', count: activities.filter(a => a.status === 'COMPLETED').length, filter: 'COMPLETED' },
          ].map(({ label, count }) => (
            <span key={label} className="px-3 py-1.5 bg-background rounded-xl text-xs font-semibold text-text-secondary">
              {label}: <span className="text-primary font-bold">{count}</span>
            </span>
          ))}
        </div>
      )}

      {/* Activities */}
      {activities.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          heading="No activities planned today"
          description="Start planning your day by adding your first activity."
          action={
            <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Activity
            </button>
          }
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {activities.map(act => (
            <ActivityCard
              key={act.id}
              activity={act}
              onExtend={(a) => setExtendActivity(a)}
              onEdit={openEdit}
              onDelete={handleDelete}
              onComplete={handleComplete}
            />
          ))}
        </div>
      )}

      {/* Modals / sheets */}
      <ActivityForm
        open={showForm}
        onClose={closeForm}
        onSave={handleSave}
        editActivity={editActivity}
      />

      <ActivityExtension
        open={!!extendActivity}
        onClose={() => setExtendActivity(null)}
        activity={extendActivity}
        onSave={handleExtend}
      />
    </div>
  )
}
