import React, { useState, useEffect } from 'react'
import BottomSheet from '../common/BottomSheet'
import { CheckCircle2, Circle } from 'lucide-react'

export default function PSkillLevelSelector({ open, onClose, skill, onSave }) {
  const [completedLevels, setCompletedLevels] = useState([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (skill) {
      setCompletedLevels(skill.completedLevels || [])
    }
  }, [skill, open])

  if (!skill) return null

  const handleSave = async () => {
    setSaving(true)
    try {
      const completion = Math.round((completedLevels.length / skill.availableLevels.length) * 100)
      await onSave(skill.id, { completedLevels, completion })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="Update P-Skill">
      <div className="space-y-5">
        {/* Skill name */}
        <div className="px-4 py-3 bg-background rounded-xl">
          <p className="text-xs text-text-secondary font-medium">Skill</p>
          <p className="text-sm font-bold text-text-primary mt-0.5">{skill.name}</p>
        </div>

        {/* Level selection */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="label mb-0">Select Completed Levels</label>
            <span className="text-xs font-bold text-primary">
              {completedLevels.length} / {skill.availableLevels.length}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
            {skill.availableLevels.map(l => {
              const isSelected = completedLevels.includes(l)
              return (
                <button
                  key={l}
                  onClick={() => {
                    setCompletedLevels(prev => 
                      isSelected ? prev.filter(lvl => lvl !== l) : [...prev, l]
                    )
                  }}
                  className={`flex items-center gap-2 p-3 rounded-xl text-sm font-semibold border-2 transition-all duration-150 text-left ${
                    isSelected
                      ? 'border-primary bg-primary-light/30 text-primary'
                      : 'border-gray-200 bg-background text-text-secondary hover:border-primary/50 hover:text-primary'
                  }`}
                >
                  {isSelected ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <Circle className="w-4 h-4 flex-shrink-0" />}
                  <span className="truncate">{l}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Completion Preview */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs text-text-secondary font-medium mb-0">Auto-calculated Completion</label>
            <span className="text-sm font-bold text-primary">
              {Math.round((completedLevels.length / skill.availableLevels.length) * 100)}%
            </span>
          </div>
          <div className="progress-bar h-2">
            <div 
              className="progress-fill h-full transition-all duration-300" 
              style={{ width: `${Math.round((completedLevels.length / skill.availableLevels.length) * 100)}%` }} 
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button
            id="save-pskill-btn"
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex-1"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </BottomSheet>
  )
}
