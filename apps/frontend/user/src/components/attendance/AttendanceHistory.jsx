import React from 'react'
import { format, parseISO } from 'date-fns'
import { CheckCircle2, XCircle, CalendarDays } from 'lucide-react'

export default function AttendanceHistory({ records }) {
  if (!records?.length) return (
    <div className="text-center py-10">
      <p className="text-text-muted text-sm">No attendance records found.</p>
    </div>
  )

  // Group by month
  const byMonth = records.reduce((acc, rec) => {
    const month = format(parseISO(rec.date), 'MMMM yyyy')
    if (!acc[month]) acc[month] = []
    acc[month].push(rec)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {Object.entries(byMonth).reverse().map(([month, recs]) => (
        <div key={month}>
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-text-primary">{month}</h3>
            <span className="text-xs text-text-muted">
              ({recs.filter(r => r.status === 'PRESENT').length}/{recs.length} present)
            </span>
          </div>
          <div className="space-y-2">
            {recs.slice().reverse().map(rec => (
              <div key={rec.id} className="flex items-center justify-between px-4 py-3 bg-background rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${rec.status === 'PRESENT' ? 'bg-success-soft' : 'bg-danger-soft'}`}>
                    {rec.status === 'PRESENT'
                      ? <CheckCircle2 className="w-4 h-4 text-green-600" />
                      : <XCircle className="w-4 h-4 text-red-500" />
                    }
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">
                      {format(parseISO(rec.date), 'EEE, dd MMM yyyy')}
                    </p>
                    <p className="text-xs text-text-muted">{rec.session}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-badge text-xs font-semibold ${
                  rec.status === 'PRESENT'
                    ? 'bg-success-soft text-green-700'
                    : 'bg-danger-soft text-red-700'
                }`}>
                  {rec.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
