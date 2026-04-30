import { useState } from 'react'

const MAX_SELECTION = 7

export function useSelection() {
  const [selected, setSelected] = useState<number[]>([])

  function toggle(mentorId: number) {
    setSelected(prev => {
      if (prev.includes(mentorId)) return prev.filter(id => id !== mentorId)
      if (prev.length >= MAX_SELECTION) return prev
      return [...prev, mentorId]
    })
  }

  function isSelected(mentorId: number) {
    return selected.includes(mentorId)
  }

  function canSelect(mentorId: number) {
    return selected.includes(mentorId) || selected.length < MAX_SELECTION
  }

  return { selected, toggle, isSelected, canSelect, count: selected.length, max: MAX_SELECTION }
}
