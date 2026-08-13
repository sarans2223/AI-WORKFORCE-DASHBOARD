import React from 'react'
import { Clock, CheckCircle2, XCircle, PlayCircle, Circle } from 'lucide-react'

const STATUS_MAP = {
  PLANNED: {
    className: 'badge-planned',
    icon: Circle,
    label: 'Planned',
  },
  IN_PROGRESS: {
    className: 'badge-in-progress',
    icon: PlayCircle,
    label: 'In Progress',
  },
  COMPLETED: {
    className: 'badge-completed',
    icon: CheckCircle2,
    label: 'Completed',
  },
  INCOMPLETE: {
    className: 'badge-incomplete',
    icon: XCircle,
    label: 'Incomplete',
  },
}

export default function StatusBadge({ status }) {
  const config = STATUS_MAP[status] || STATUS_MAP.PLANNED
  const Icon = config.icon
  return (
    <span className={config.className}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  )
}
