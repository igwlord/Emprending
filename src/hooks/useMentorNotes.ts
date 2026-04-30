import { useState, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export interface NoteEntry {
  id: string
  date: string
  color: string
  text: string
}

export interface ContactEntry {
  id: string
  type: 'email' | 'phone' | 'instagram' | 'other'
  label?: string
  value: string
}

export interface MentorRecord {
  notes: NoteEntry[]
  contacts: ContactEntry[]
}

const STORAGE_KEY = 'emprending_mentor_notes_v3'

function loadLocal(): Record<number, MentorRecord> {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
    const migrated: Record<number, MentorRecord> = {}
    for (const [k, v] of Object.entries(raw)) {
      const rec = v as Partial<MentorRecord>
      migrated[Number(k)] = { notes: rec.notes ?? [], contacts: rec.contacts ?? [] }
    }
    return migrated
  } catch { return {} }
}

function saveLocal(data: Record<number, MentorRecord>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function empty(): MentorRecord {
  return { notes: [], contacts: [] }
}

export function useMentorNotes(userId?: string) {
  const useCloud = Boolean(userId)

  const [data, setData] = useState<Record<number, MentorRecord>>(
    useCloud ? {} : loadLocal
  )
  const [syncing, setSyncing] = useState(useCloud)

  // Fetch from Supabase when logged in
  useEffect(() => {
    if (!userId) return
    setSyncing(true)
    Promise.all([
      supabase.from('mentor_notes').select('*').eq('user_id', userId),
      supabase.from('mentor_contacts').select('*').eq('user_id', userId),
    ]).then(([{ data: notes }, { data: contacts }]) => {
      const record: Record<number, MentorRecord> = {}

      for (const n of notes ?? []) {
        if (!record[n.mentor_id]) record[n.mentor_id] = empty()
        record[n.mentor_id].notes.push({ id: n.id, date: n.date, color: n.color, text: n.text })
      }
      for (const c of contacts ?? []) {
        if (!record[c.mentor_id]) record[c.mentor_id] = empty()
        record[c.mentor_id].contacts.push({ id: c.id, type: c.type, value: c.value, label: c.label ?? undefined })
      }

      // Sort notes newest-first
      for (const r of Object.values(record)) {
        r.notes.sort((a, b) => b.id.localeCompare(a.id))
      }

      setData(record)
      setSyncing(false)
    })
  }, [userId])

  const addNote = useCallback(async (mentorId: number, entry: Omit<NoteEntry, 'id'>) => {
    if (userId) {
      const { data: row } = await supabase
        .from('mentor_notes')
        .insert({ user_id: userId, mentor_id: mentorId, ...entry })
        .select()
        .single()
      if (row) {
        const note: NoteEntry = { id: row.id, date: row.date, color: row.color, text: row.text }
        setData(prev => {
          const current = prev[mentorId] ?? empty()
          return { ...prev, [mentorId]: { ...current, notes: [note, ...current.notes] } }
        })
      }
    } else {
      setData(prev => {
        const current = prev[mentorId] ?? empty()
        const note: NoteEntry = { ...entry, id: `${Date.now()}-${Math.random()}` }
        const next = { ...prev, [mentorId]: { ...current, notes: [note, ...current.notes] } }
        saveLocal(next)
        return next
      })
    }
  }, [userId])

  const deleteNote = useCallback(async (mentorId: number, noteId: string) => {
    if (userId) {
      await supabase.from('mentor_notes').delete().eq('id', noteId)
    }
    setData(prev => {
      const current = prev[mentorId] ?? empty()
      const next = { ...prev, [mentorId]: { ...current, notes: current.notes.filter(n => n.id !== noteId) } }
      if (!userId) saveLocal(next)
      return next
    })
  }, [userId])

  const addContact = useCallback(async (mentorId: number, entry: Omit<ContactEntry, 'id'>) => {
    if (userId) {
      const { data: row } = await supabase
        .from('mentor_contacts')
        .insert({ user_id: userId, mentor_id: mentorId, ...entry })
        .select()
        .single()
      if (row) {
        const contact: ContactEntry = { id: row.id, type: row.type, value: row.value, label: row.label ?? undefined }
        setData(prev => {
          const current = prev[mentorId] ?? empty()
          return { ...prev, [mentorId]: { ...current, contacts: [...current.contacts, contact] } }
        })
      }
    } else {
      setData(prev => {
        const current = prev[mentorId] ?? empty()
        const contact: ContactEntry = { ...entry, id: `${Date.now()}-${Math.random()}` }
        const next = { ...prev, [mentorId]: { ...current, contacts: [...current.contacts, contact] } }
        saveLocal(next)
        return next
      })
    }
  }, [userId])

  const editNote = useCallback(async (mentorId: number, noteId: string, updates: Omit<NoteEntry, 'id'>) => {
    if (userId) {
      await supabase.from('mentor_notes').update(updates).eq('id', noteId)
    }
    setData(prev => {
      const current = prev[mentorId] ?? empty()
      const next = { ...prev, [mentorId]: { ...current, notes: current.notes.map(n => n.id === noteId ? { ...n, ...updates } : n) } }
      if (!userId) saveLocal(next)
      return next
    })
  }, [userId])

  const editContact = useCallback(async (mentorId: number, contactId: string, updates: Omit<ContactEntry, 'id'>) => {
    if (userId) {
      await supabase.from('mentor_contacts').update(updates).eq('id', contactId)
    }
    setData(prev => {
      const current = prev[mentorId] ?? empty()
      const next = { ...prev, [mentorId]: { ...current, contacts: current.contacts.map(c => c.id === contactId ? { ...c, ...updates } : c) } }
      if (!userId) saveLocal(next)
      return next
    })
  }, [userId])

  const deleteContact = useCallback(async (mentorId: number, contactId: string) => {
    if (userId) {
      await supabase.from('mentor_contacts').delete().eq('id', contactId)
    }
    setData(prev => {
      const current = prev[mentorId] ?? empty()
      const next = { ...prev, [mentorId]: { ...current, contacts: current.contacts.filter(c => c.id !== contactId) } }
      if (!userId) saveLocal(next)
      return next
    })
  }, [userId])

  const get = useCallback((mentorId: number): MentorRecord =>
    data[mentorId] ?? empty(),
    [data]
  )

  const sessionCount = Object.values(data).filter(r =>
    r.notes.some(n => n.color === 'session')
  ).length

  return { get, addNote, editNote, deleteNote, addContact, editContact, deleteContact, sessionCount, syncing }
}
