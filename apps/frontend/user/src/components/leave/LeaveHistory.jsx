import React from 'react'
import { format, parseISO } from 'date-fns'
import { CalendarDays } from 'lucide-react'
import EmptyState from '../common/EmptyState'

export default function LeaveHistory({ leaves }) {
  if (!leaves?.length) {
    return (
      <EmptyState
        icon={CalendarDays}
        heading="No leave records yet"
        description="Your submitted leave applications will appear here."
      />
    )
  }

  return (
    <div className="space-y-3">
      {leaves.map(lv => {
        const start = parseISO(lv.startDate)
        const end = parseISO(lv.endDate)
        const days = Math.round((end - start) / 86400000) + 1
        return (
          <div key={lv.id} className="card border border-gray-100">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center flex-shrink-0">
                  <CalendarDays className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-text-primary">
                    {format(start, 'dd MMM')} – {format(end, 'dd MMM yyyy')}
                  </p>
                  <p className="text-xs text-text-muted">{days} day{days !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-badge bg-primary-light text-primary text-xs font-semibold flex-shrink-0">
                Submitted
              </span>
            </div>

            <p className="text-xs text-text-secondary bg-background px-3 py-2 rounded-xl leading-relaxed">
              {lv.reason}
            </p>

            <p className="text-[10px] text-text-muted mt-2">
              Applied on {format(parseISO(lv.submittedOn), 'dd MMM yyyy')}
            </p>
          </div>
        )
      })}
    </div>
  )
}
