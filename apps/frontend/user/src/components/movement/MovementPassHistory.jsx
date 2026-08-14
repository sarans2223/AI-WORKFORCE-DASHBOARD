import React, { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { MapPin, Clock, ChevronDown, ChevronUp, Calendar } from 'lucide-react'
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

  // Color mapping based on type
  const getTypeColor = (type) => {
    switch (type) {
      case 'PS slot': return 'bg-purple-500'
      case 'IECC': return 'bg-blue-500'
      case 'Library': return 'bg-emerald-500'
      case 'Research park': return 'bg-amber-500'
      case 'MC': return 'bg-rose-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-4">
      {passes.map(p => {
        const isOpen = expanded === p.id
        const typeColor = getTypeColor(p.movementType)
        
        return (
          <div key={p.id} className="relative bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-md">
            {/* Left Accent Strip */}
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${typeColor}`} />
            
            <button
              onClick={() => setExpanded(isOpen ? null : p.id)}
              className="w-full p-4 pl-5 flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className={`w-12 h-12 rounded-full ${typeColor} bg-opacity-10 flex items-center justify-center flex-shrink-0`}>
                  <MapPin className={`w-6 h-6 ${typeColor.replace('bg-', 'text-')}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-base font-bold text-gray-900 tracking-tight">{p.movementType}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs font-semibold text-gray-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{format(parseISO(p.date), 'dd MMM yyyy')}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                    <Clock className="w-3.5 h-3.5" />
                    <span>{p.timing}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 bg-gray-50 p-2 rounded-full">
                {isOpen
                  ? <ChevronUp className="w-5 h-5 text-gray-400" />
                  : <ChevronDown className="w-5 h-5 text-gray-400" />
                }
              </div>
            </button>

            {/* Ticket details (collapsible) */}
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="px-5 pb-5">
                {/* Dashed separator like a ticket */}
                <div className="w-full border-t-2 border-dashed border-gray-200 my-2 relative">
                  <div className="absolute -left-6 -top-2 w-4 h-4 rounded-full bg-background border-r-2 border-gray-200" />
                  <div className="absolute -right-6 -top-2 w-4 h-4 rounded-full bg-background border-l-2 border-gray-200" />
                </div>
                
                <div className="mt-4 bg-gray-50 rounded-xl p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Slot Reference</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{p.slot}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Duration</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{p.timing}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Reason for Movement</p>
                    <p className="text-sm text-gray-700 leading-relaxed font-medium">{p.reason}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
