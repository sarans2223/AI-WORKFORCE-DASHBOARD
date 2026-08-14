import React from 'react'
import { format, parseISO } from 'date-fns'
import { CalendarDays, Clock } from 'lucide-react'
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
    <div className="space-y-4">
      {leaves.map(lv => {
        const start = parseISO(lv.startDate)
        const end = parseISO(lv.endDate)
        const days = Math.round((end - start) / 86400000) + 1
        
        return (
          <div key={lv.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 transition-all hover:shadow-md hover:border-primary/20 group">
            {/* Calendar Tear-off Style Date */}
            <div className="flex sm:flex-col items-center sm:w-20 bg-gray-50 rounded-xl border border-gray-200 overflow-hidden shrink-0">
              <div className="bg-primary w-full text-center py-1.5 px-3 sm:px-0">
                <span className="text-[10px] font-bold text-white uppercase tracking-wider">{format(start, 'MMM')}</span>
              </div>
              <div className="flex-1 text-center py-2 px-4 sm:px-0 bg-white">
                <span className="text-xl sm:text-2xl font-black text-gray-900 leading-none">{format(start, 'dd')}</span>
              </div>
              {days > 1 && (
                <div className="bg-gray-100 w-full text-center py-1 border-t border-gray-200 px-3 sm:px-0">
                  <span className="text-[9px] font-bold text-gray-500 uppercase">to {format(end, 'dd MMM')}</span>
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 flex flex-col">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors">
                    {days} Day{days !== 1 ? 's' : ''} Leave
                  </h3>
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mt-0.5 font-medium">
                    <Clock className="w-3 h-3" />
                    <span>Applied on {format(parseISO(lv.submittedOn), 'dd MMM yyyy')}</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-bold tracking-wide uppercase shadow-sm">
                  Submitted
                </span>
              </div>

              <div className="mt-auto bg-gray-50/80 p-3 rounded-xl text-xs text-gray-700 leading-relaxed border border-gray-100">
                <span className="font-semibold text-gray-900">Reason: </span>
                {lv.reason}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
