import React from 'react'
import { Edit3, CheckCircle2 } from 'lucide-react'
import ProgressIndicator from '../common/ProgressIndicator'



export default function PSkillCard({ skill, onUpdate }) {
  const { name, description, completedLevels = [], availableLevels = [], completion, category } = skill

  return (
    <div className="card relative overflow-hidden border border-white hover:border-primary/30 shadow-sm hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] bg-gradient-to-br from-white via-white to-primary-light/10 transition-all duration-300 hover:-translate-y-1 flex flex-col gap-5">
      {/* Decorative Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />

      {/* Header */}
      <div className="flex items-start justify-between gap-3 relative z-10">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {completedLevels.length > 0 && completedLevels.length === availableLevels.length && (
              <span className="flex items-center gap-1 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-green-700 bg-green-100 rounded-lg">
                <CheckCircle2 className="w-3 h-3" /> Mastered
              </span>
            )}
          </div>
          <h3 className="font-black text-text-primary text-lg leading-tight line-clamp-2">{name}</h3>
        </div>
        <div className="flex flex-col gap-1 items-end flex-shrink-0 text-right">
          <span className="text-[11px] font-black text-text-secondary">
            <span className="text-primary text-sm">{completedLevels.length}</span> / {availableLevels.length}
          </span>
          <span className="text-[9px] font-bold uppercase text-text-muted">Levels</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-text-secondary leading-relaxed line-clamp-2 relative z-10">{description}</p>

      {/* Progress */}
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[11px] text-text-secondary font-bold uppercase tracking-wider">Completion</span>
          <span className="text-sm font-black text-primary">{completion}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-primary-dark transition-all duration-500 rounded-full"
            style={{ width: `${completion}%` }}
          />
        </div>
      </div>

      {/* Update button */}
      <button
        id={`update-pskill-${skill.id}`}
        onClick={() => onUpdate(skill)}
        className="w-full py-2.5 rounded-xl bg-gray-50 hover:bg-primary text-text-secondary hover:text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors border border-gray-100 hover:border-transparent relative z-10"
      >
        <Edit3 className="w-4 h-4" />
        Update Progress
      </button>
    </div>
  )
}
