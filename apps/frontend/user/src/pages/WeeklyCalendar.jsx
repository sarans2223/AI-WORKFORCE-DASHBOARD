import React, { useState, useEffect } from 'react'
import {
  startOfWeek, endOfWeek, addWeeks, subWeeks,
  eachDayOfInterval, format, isSameDay, isToday
} from 'date-fns'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import StatusBadge from '../components/common/StatusBadge'
import EmptyState from '../components/common/EmptyState'
import ActivityExtension from '../components/activity/ActivityExtension'
import { activityService } from '../services/activityService'

export default function WeeklyCalendar() {
  const [weekOffset, setWeekOffset] = useState(0)
  const [activities, setActivities] = useState([])
  const [extendActivity, setExtendActivity] = useState(null)
  const [loading, setLoading] = useState(true)

  const baseDate = addWeeks(new Date(), weekOffset)
  const weekStart = startOfWeek(baseDate, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(baseDate, { weekStartsOn: 1 })
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

  useEffect(() => {
    const start = format(weekStart, 'yyyy-MM-dd')
    const end = format(weekEnd, 'yyyy-MM-dd')
    activityService.getByDateRange(start, end).then(data => {
      setActivities(data)
      setLoading(false)
    })
  }, [weekOffset])

  const getActivitiesForDay = (day) =>
    activities.filter(a => a.date === format(day, 'yyyy-MM-dd'))

  const handleExtend = async (id, extendedEndTime, reason) => {
    const updated = await activityService.extendTime(id, extendedEndTime, reason)
    setActivities(prev => prev.map(a => a.id === id ? updated : a))
  }

  const statusColor = (status) => ({
    PLANNED: 'border-l-primary bg-primary-light text-primary',
    IN_PROGRESS: 'border-l-primary bg-primary text-white',
    COMPLETED: 'border-l-green-500 bg-success-soft text-green-700',
    INCOMPLETE: 'border-l-red-400 bg-danger-soft text-red-600',
  })[status] || 'border-l-gray-300 bg-gray-50 text-gray-500'

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="relative min-h-[calc(100vh-8rem)] -m-4 sm:-m-8 p-4 sm:p-8 bg-background overflow-x-hidden">
      {/* Decorative background blobs (Very subtle) */}
      <div className="absolute top-0 left-0 w-[40rem] h-[40rem] bg-primary-light/40 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[40rem] h-[40rem] bg-primary-light/30 rounded-full blur-3xl pointer-events-none translate-x-1/3 translate-y-1/3" />

      <div className="relative z-10 space-y-6">
        {/* Top Header Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/60 backdrop-blur-xl border border-white/80 p-4 sm:p-5 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-light to-primary-light/50 border border-primary/10 flex items-center justify-center text-primary shadow-inner">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight leading-none mb-1.5">Weekly Calendar</h1>
              <p className="text-xs sm:text-sm font-bold text-text-secondary flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary/40 animate-pulse" />
                {format(weekStart, 'dd MMM')} – {format(weekEnd, 'dd MMM yyyy')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-white/50 backdrop-blur-md p-1.5 rounded-2xl border border-white shadow-sm">
            <button
              onClick={() => setWeekOffset(0)}
              className="bg-white hover:bg-primary hover:text-white transition-colors text-text-primary text-xs font-bold px-4 py-2 rounded-xl shadow-sm"
            >
              Today
            </button>
            <button onClick={() => setWeekOffset(w => w - 1)} className="btn-icon hover:bg-white bg-transparent">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setWeekOffset(w => w + 1)} className="btn-icon hover:bg-white bg-transparent">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Responsive Week Grid Wrapper */}
        <div className="w-full overflow-x-auto pb-2 scrollbar-hide">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4 lg:gap-4">
            {weekDays.map(day => {
              const dayActs = getActivitiesForDay(day)
              const isTodayDate = isToday(day)
              
              return (
                <div 
                  key={day.toISOString()} 
                  className={`flex lg:flex-col bg-white/30 backdrop-blur-md rounded-3xl p-3 sm:p-4 shadow-sm border border-white/50 transition-colors ${isTodayDate ? 'ring-2 ring-primary/20 bg-white/40' : 'hover:bg-white/40'}`}
                >
                  {/* Day Header Box */}
                  <div className={`flex lg:flex-col items-center justify-center min-w-[4rem] px-3 lg:px-0 py-2.5 lg:mb-3 mr-4 lg:mr-0 rounded-2xl border transition-all shadow-sm flex-shrink-0 ${
                    isTodayDate 
                      ? 'bg-gradient-to-b from-primary to-primary-dark border-primary text-white shadow-primary/20' 
                      : 'bg-white/80 border-white text-text-primary'
                  }`}>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${isTodayDate ? 'text-white/80' : 'text-text-secondary'}`}>
                      {format(day, 'EEE')}
                    </span>
                    <span className="text-xl font-black leading-none lg:mt-1 ml-2 lg:ml-0">
                      {format(day, 'd')}
                    </span>
                  </div>

                  {/* Day Activities */}
                  <div className="flex-1 space-y-2.5">
                    {dayActs.length === 0 ? (
                      <div className="h-full min-h-[3.5rem] border-2 border-dashed border-primary/10 rounded-2xl flex items-center justify-center bg-white/20 p-2">
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Empty</span>
                      </div>
                    ) : (
                      dayActs
                        .sort((a, b) => a.startTime.localeCompare(b.startTime))
                        .map(act => {
                          let accent = 'border-l-gray-300'
                          if (act.status === 'COMPLETED') accent = 'border-l-success'
                          if (act.status === 'IN_PROGRESS') accent = 'border-l-primary'
                          if (act.status === 'INCOMPLETE') accent = 'border-l-danger'

                          return (
                            <div 
                              key={act.id} 
                              className={`p-3 rounded-2xl bg-white border border-gray-100 hover:border-gray-200 shadow-[0_2px_10px_rgb(0,0,0,0.02)] transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 cursor-pointer group border-l-[4px] ${accent} min-w-[150px]`}
                              onClick={() => act.status !== 'COMPLETED' && !act.extendedEndTime ? setExtendActivity(act) : null}
                              title={act.name}
                            >
                              <p className="text-xs font-bold leading-tight line-clamp-2 text-text-primary group-hover:text-primary transition-colors break-words">{act.name}</p>
                              <div className="flex items-center gap-1 mt-1.5">
                                <span className="text-[10px] font-semibold text-text-secondary whitespace-nowrap">
                                  {act.startTime} – {act.extendedEndTime || act.endTime}
                                </span>
                              </div>
                            </div>
                          )
                        })
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Sheets */}
      <ActivityExtension
        open={!!extendActivity}
        onClose={() => setExtendActivity(null)}
        activity={extendActivity}
        onSave={handleExtend}
      />
    </div>
  )
}
