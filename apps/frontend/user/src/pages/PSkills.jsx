import React, { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import PSkillCard from '../components/pskill/PSkillCard'
import PSkillLevelSelector from '../components/pskill/PSkillLevelSelector'
import EmptyState from '../components/common/EmptyState'
import { pskillService } from '../services/pskillService'

export default function PSkills() {
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSkill, setSelectedSkill] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    pskillService.getAll().then(data => {
      setSkills(data)
      setLoading(false)
    })
  }, [])

  const handleSave = async (id, updates) => {
    const updated = await pskillService.update(id, updates)
    setSkills(prev => prev.map(s => s.id === id ? updated : s))
  }



  const filtered = skills.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase())
  )

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
        <h1 className="page-title">P-Skills</h1>
        <p className="page-subtitle">Track and update your personalized skill progress</p>
      </div>



      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          id="pskill-search"
          className="input pl-10"
          placeholder="Search skills…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Skills grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          heading="No skills found"
          description="Try a different search term."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(skill => (
            <PSkillCard
              key={skill.id}
              skill={skill}
              onUpdate={s => setSelectedSkill(s)}
            />
          ))}
        </div>
      )}

      {/* Selector */}
      <PSkillLevelSelector
        open={!!selectedSkill}
        onClose={() => setSelectedSkill(null)}
        skill={selectedSkill}
        onSave={handleSave}
      />
    </div>
  )
}
