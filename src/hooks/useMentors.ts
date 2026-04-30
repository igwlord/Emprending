import { useState, useEffect, useCallback } from 'react'
import type { MentorWithAvailability } from '../types'
import mentorsData from '../data/mentors.json'

const BASE_MENTORS = mentorsData as MentorWithAvailability[]

async function fetchBookingCounts(): Promise<Record<number, number>> {
  // bookings table not yet provisioned — return empty to avoid 404 errors
  return {}
}

export function useMentors() {
  const [mentors, setMentors] = useState<MentorWithAvailability[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const counts = await fetchBookingCounts()
    const enriched = BASE_MENTORS.map(m => ({
      ...m,
      booked_spots: counts[m.id] ?? 0,
      available_spots: m.max_capacity - (counts[m.id] ?? 0),
      is_full: (counts[m.id] ?? 0) >= m.max_capacity,
    }))
    setMentors(enriched)
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { mentors, loading, refresh }
}
