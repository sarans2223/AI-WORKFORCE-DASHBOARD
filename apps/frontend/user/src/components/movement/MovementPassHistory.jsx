import React, { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { MapPin, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import EmptyState from '../common/EmptyState'

export default function MovementPassHistory({ passes }) {
  const [expanded, setExpanded] = useState(null)

  if (!passes?.length) {
    return (
      <EmptyState
        icon={MapPin}
        heading="No movement passes yet"
        description="Your created movement passes will appear here."
      />
    )
  }

  return (
    <div className="space-y-3">
      {passes.map(p => {
        const isOpen = expanded === p.id
        return (
          <div key={p.id} className="card border border-gray-100">
            <button
              onClick={() => setExpanded(isOpen ? null : p.id)}
              className="w-full flex items-center justify-between gap-4 text-left"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-text-primary">{p.movementType}</p>
                  <p className="text-xs text-text-secondary">
                    {format(parseISO(p.date), 'EEE, dd MMM yyyy')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="hidden sm:inline text-xs text-text-muted">{p.slot}</span>
                {isOpen
                  ? <ChevronUp className="w-4 h-4 text-text-muted" />
                  : <ChevronDown className="w-4 h-4 text-text-muted" />
                }
              </div>
            </button>

            {isOpen && (
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-3 animate-fade-in">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-background rounded-xl px-3 py-2.5">
                    <p className="text-[10px] text-text-muted font-semibold uppercase tracking-wide">Slot</p>
                    <p className="text-sm font-semibold text-text-primary mt-0.5">{p.slot}</p>
                  </div>
                  <div className="bg-background rounded-xl px-3 py-2.5">
                    <p className="text-[10px] text-text-muted font-semibold uppercase tracking-wide">Timing</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Clock className="w-3 h-3 text-primary" />
                      <p className="text-sm font-semibold text-text-primary">{p.timing}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-background rounded-xl px-3 py-2.5">
                  <p className="text-[10px] text-text-muted font-semibold uppercase tracking-wide mb-1">Reason</p>
                  <p className="text-sm text-text-secondary leading-relaxed">{p.reason}</p>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
