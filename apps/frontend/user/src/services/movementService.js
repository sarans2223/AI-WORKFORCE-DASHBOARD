import { mockMovementPasses, PSKILL_SLOTS } from '../data/mockData'
import { format } from 'date-fns'

let passes = [...mockMovementPasses]
const delay = (ms = 300) => new Promise(r => setTimeout(r, ms))

export const movementService = {
  getAll: async () => {
    await delay()
    return [...passes].sort((a, b) => b.date.localeCompare(a.date))
  },

  create: async ({ date, movementType, slot, reason, skillName }) => {
    await delay()
    const timing = PSKILL_SLOTS[slot]?.timing || slot.replace(/^.+?\((.+)\)$/, '$1')
    const newPass = {
      id: `mp-${Date.now()}`,
      date,
      movementType,
      slot,
      timing,
      reason,
      skillName: skillName || '',
    }
    passes = [newPass, ...passes]
    return newPass
  },

  getSlotTiming: (slot) => {
    return PSKILL_SLOTS[slot]?.timing || null
  },
}
