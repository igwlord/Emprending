import { useEffect, useState } from 'react'
import { X, Plus, Trash2, Mail, Phone, AtSign, ExternalLink, Check, Copy, ChevronDown, Pencil } from 'lucide-react'
import type { MentorWithAvailability } from '../types'
import type { MentorRecord, NoteEntry, ContactEntry } from '../hooks/useMentorNotes'
import { TagBadge } from './TagBadge'

interface Props {
  mentor: MentorWithAvailability
  record: MentorRecord
  onAddNote: (entry: Omit<NoteEntry, 'id'>) => void
  onEditNote: (noteId: string, updates: Omit<NoteEntry, 'id'>) => void
  onDeleteNote: (noteId: string) => void
  onAddContact: (entry: Omit<ContactEntry, 'id'>) => void
  onEditContact: (contactId: string, updates: Omit<ContactEntry, 'id'>) => void
  onDeleteContact: (contactId: string) => void
  onClose: () => void
}

// ─── Note colors ───────────────────────────────────────────────────────────
const NOTE_COLORS: { key: string; hex: string; label: string }[] = [
  { key: 'session', hex: '#10b981', label: 'Sesión' },
  { key: 'orange',  hex: '#f97316', label: 'General' },
  { key: 'blue',    hex: '#3b82f6', label: 'Aprendizaje' },
  { key: 'violet',  hex: '#8b5cf6', label: 'Idea' },
  { key: 'red',     hex: '#ef4444', label: 'Pendiente' },
]

function colorHex(key: string) { return NOTE_COLORS.find(c => c.key === key)?.hex ?? '#f97316' }
function colorLabel(key: string) { return NOTE_COLORS.find(c => c.key === key)?.label ?? 'General' }

// ─── Contact types ─────────────────────────────────────────────────────────
const CONTACT_TYPES: { key: ContactEntry['type']; label: string; icon: React.FC<{size?: number; className?: string}> }[] = [
  { key: 'email',     label: 'Email',     icon: Mail },
  { key: 'phone',     label: 'Teléfono',  icon: Phone },
  { key: 'instagram', label: 'Instagram', icon: AtSign },
  { key: 'other',     label: 'Otro',      icon: ExternalLink },
]

function contactTypeInfo(type: ContactEntry['type']) {
  return CONTACT_TYPES.find(t => t.key === type) ?? CONTACT_TYPES[CONTACT_TYPES.length - 1]
}

function contactHref(entry: ContactEntry): string | undefined {
  const v = entry.value.trim()
  if (!v) return undefined
  switch (entry.type) {
    case 'email':     return `mailto:${v}`
    case 'phone':     return `tel:${v}`
    case 'instagram': return `https://instagram.com/${v.replace('@', '')}`
    default:          return undefined
  }
}

function formatDate(iso: string) {
  try {
    const [y, m, d] = iso.split('-')
    const months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']
    return `${Number(d)} ${months[Number(m)-1]} ${y}`
  } catch { return iso }
}

function LinkedInLogo({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  )
}

type Tab = 'profile' | 'notes' | 'contact'

export function MentorModal({ mentor, record, onAddNote, onEditNote, onDeleteNote, onAddContact, onEditContact, onDeleteContact, onClose }: Props) {
  const today = new Date().toISOString().slice(0, 10)
  const [activeTab, setActiveTab] = useState<Tab>('profile')

  // Note add form state
  const [addingNote, setAddingNote] = useState(false)
  const [noteColor, setNoteColor] = useState('session')
  const [noteDate, setNoteDate] = useState(today)
  const [noteText, setNoteText] = useState('')

  // Note edit state
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [editNoteColor, setEditNoteColor] = useState('session')
  const [editNoteDate, setEditNoteDate] = useState(today)
  const [editNoteText, setEditNoteText] = useState('')

  // Note expanded / copied state
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set())
  const [copiedNote, setCopiedNote] = useState<string | null>(null)

  // Contact add form state
  const [addingContact, setAddingContact] = useState(false)
  const [contactType, setContactType] = useState<ContactEntry['type']>('email')
  const [contactValue, setContactValue] = useState('')
  const [contactLabel, setContactLabel] = useState('')

  // Contact edit state
  const [editingContactId, setEditingContactId] = useState<string | null>(null)
  const [editContactType, setEditContactType] = useState<ContactEntry['type']>('email')
  const [editContactValue, setEditContactValue] = useState('')
  const [editContactLabel, setEditContactLabel] = useState('')

  const sessionDone = record.notes.some(n => n.color === 'session')

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  function saveNote() {
    if (!noteText.trim()) return
    onAddNote({ date: noteDate, color: noteColor, text: noteText.trim() })
    setAddingNote(false)
    setNoteText('')
    setNoteColor('session')
    setNoteDate(today)
  }

  function saveContact() {
    if (!contactValue.trim()) return
    onAddContact({
      type: contactType,
      value: contactValue.trim(),
      label: contactType === 'other' ? contactLabel.trim() : undefined,
    })
    setAddingContact(false)
    setContactValue('')
    setContactLabel('')
    setContactType('email')
  }

  function startEditNote(note: NoteEntry) {
    setEditingNoteId(note.id)
    setEditNoteColor(note.color)
    setEditNoteDate(note.date)
    setEditNoteText(note.text)
    setAddingNote(false)
  }

  function saveEditNote() {
    if (!editNoteText.trim() || !editingNoteId) return
    onEditNote(editingNoteId, { date: editNoteDate, color: editNoteColor, text: editNoteText.trim() })
    setEditingNoteId(null)
  }

  function startEditContact(contact: ContactEntry) {
    setEditingContactId(contact.id)
    setEditContactType(contact.type)
    setEditContactValue(contact.value)
    setEditContactLabel(contact.label ?? '')
    setAddingContact(false)
  }

  function saveEditContact() {
    if (!editContactValue.trim() || !editingContactId) return
    onEditContact(editingContactId, {
      type: editContactType,
      value: editContactValue.trim(),
      label: editContactType === 'other' ? editContactLabel.trim() : undefined,
    })
    setEditingContactId(null)
  }

  const tabs: { key: Tab; label: string; badge?: number }[] = [
    { key: 'profile', label: 'Perfil' },
    { key: 'notes',   label: 'Notas',    badge: record.notes.length || undefined },
    { key: 'contact', label: 'Contacto', badge: record.contacts.length || undefined },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-3 sm:px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(4,6,24,0.80)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className="relative w-full sm:max-w-3xl rounded-[24px] overflow-hidden flex flex-col border border-white/[0.08]"
        style={{
          maxHeight: '90dvh',
          background: 'rgba(6,10,38,0.92)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          animation: 'scale-in 350ms cubic-bezier(0.16,1,0.3,1) both',
        }}
      >
        {/* Header */}
        <div className="flex items-start gap-3 sm:gap-5 px-4 sm:px-7 pt-4 sm:pt-6 pb-3 sm:pb-4 shrink-0">
          {/* Avatar */}
          <div className="relative shrink-0">
            <img
              src={mentor.photo_url}
              alt={mentor.name}
              className="w-12 h-12 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl object-cover object-[center_25%]"
              style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.1)' }}
            />
            {sessionDone && (
              <div
                className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-emerald-500 flex items-center justify-center"
                style={{ boxShadow: '0 0 8px rgba(16,185,129,0.6)' }}
              >
                <Check size={9} className="text-white" strokeWidth={3} />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 pt-0.5 sm:pt-2">
            <h2 className="text-white font-bold text-base sm:text-2xl leading-tight truncate" style={{ fontFamily: 'Outfit, sans-serif' }}>
              {mentor.name}
            </h2>
            <p className="text-white/45 text-xs sm:text-sm mt-0.5 truncate">{mentor.role_company}</p>
          </div>

          {/* LinkedIn + Close */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 pt-0.5 sm:pt-2">
            {mentor.linkedin_url && (
              <a
                href={mentor.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-[#0A66C2] hover:bg-[#0A66C2]/20 transition-all duration-150"
                style={{ background: 'rgba(10,102,194,0.12)', border: '1px solid rgba(10,102,194,0.25)' }}
              >
                <LinkedInLogo size={13} />
              </a>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white/50 hover:text-white transition-all duration-150"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-white/[0.07] px-4 sm:px-7 shrink-0">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 text-[13px] sm:text-[15px] font-semibold px-3 sm:px-5 py-2.5 sm:py-3 border-b-2 transition-all duration-150 ${
                activeTab === tab.key
                  ? 'text-[#f97316] border-[#f97316]'
                  : 'text-white/35 border-transparent hover:text-white/60'
              }`}
            >
              {tab.label}
              {tab.badge !== undefined && (
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{
                    background: activeTab === tab.key ? 'rgba(249,115,22,0.2)' : 'rgba(255,255,255,0.08)',
                    color: activeTab === tab.key ? '#f97316' : 'rgba(255,255,255,0.4)',
                  }}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="overflow-y-auto flex-1 px-4 sm:px-8 pt-4 sm:pt-6 pb-6 sm:pb-8">

          {/* ── PERFIL ── */}
          {activeTab === 'profile' && (
            <div className="flex flex-col gap-4 sm:gap-6">
              <p className="text-white/55 text-sm sm:text-base leading-relaxed">{mentor.bio}</p>
              <div>
                <p className="text-white/25 text-[10px] sm:text-xs font-semibold uppercase tracking-widest mb-2 sm:mb-3">Especialidades</p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {mentor.specialty_tags.map(tag => <TagBadge key={tag} tag={tag} />)}
                </div>
              </div>
            </div>
          )}

          {/* ── NOTAS ── */}
          {activeTab === 'notes' && (
            <div
              className="rounded-2xl p-4 sm:p-6"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <p className="text-white/30 text-[10px] sm:text-xs font-semibold uppercase tracking-widest">
                  Mis registros
                  {record.notes.length > 0 && (
                    <span className="ml-2 text-white/20 normal-case font-normal tracking-normal">
                      · {record.notes.filter(n => n.color === 'session').length} sesión{record.notes.filter(n => n.color === 'session').length !== 1 ? 'es' : ''},{' '}
                      {record.notes.filter(n => n.color !== 'session').length} nota{record.notes.filter(n => n.color !== 'session').length !== 1 ? 's' : ''}
                    </span>
                  )}
                </p>
                {!addingNote && (
                  <button
                    onClick={() => setAddingNote(true)}
                    className="flex items-center gap-1 text-[11px] sm:text-sm font-semibold text-[#f97316] hover:text-[#ea580c] transition-colors"
                  >
                    <Plus size={13} /> Nuevo
                  </button>
                )}
              </div>

              {addingNote && (
                <div
                  className="mb-3 sm:mb-4 rounded-xl p-3.5 sm:p-5 flex flex-col gap-3 sm:gap-4"
                  style={{ background: 'rgba(0,0,0,0.3)', border: `1px solid ${colorHex(noteColor)}40` }}
                >
                  {/* Type */}
                  <div className="flex gap-1.5 sm:gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                    {NOTE_COLORS.map(c => (
                      <button
                        key={c.key}
                        onClick={() => setNoteColor(c.key)}
                        className="shrink-0 flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-sm font-semibold transition-all duration-150"
                        style={{
                          background: noteColor === c.key ? `${c.hex}25` : 'rgba(255,255,255,0.05)',
                          border: `1px solid ${noteColor === c.key ? c.hex + '60' : 'rgba(255,255,255,0.08)'}`,
                          color: noteColor === c.key ? c.hex : 'rgba(255,255,255,0.4)',
                        }}
                      >
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: c.hex, opacity: noteColor === c.key ? 1 : 0.5 }} />
                        {c.label}
                      </button>
                    ))}
                  </div>
                  {/* Date */}
                  <input
                    type="date"
                    value={noteDate}
                    onChange={e => setNoteDate(e.target.value)}
                    className="text-sm sm:text-base text-white/70 rounded-xl px-3 sm:px-4 py-2 sm:py-3 outline-none w-full"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', colorScheme: 'dark' }}
                  />
                  {/* Text */}
                  <textarea
                    value={noteText}
                    onChange={e => setNoteText(e.target.value)}
                    rows={4}
                    autoFocus
                    placeholder={noteColor === 'session' ? '¿Qué vieron? ¿Qué te recomendó? Próximos pasos...' : '¿Qué aprendiste? ¿Qué idea tuviste?'}
                    className="w-full text-sm sm:text-base text-white placeholder-white/20 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 outline-none resize-none"
                    style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${colorHex(noteColor)}30` }}
                  />
                  <div className="flex gap-2 sm:gap-3">
                    <button
                      onClick={saveNote}
                      disabled={!noteText.trim()}
                      className="flex-1 py-2.5 sm:py-3.5 rounded-xl text-sm sm:text-base font-bold text-white disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ background: `linear-gradient(135deg, ${colorHex(noteColor)}, ${colorHex(noteColor)}bb)` }}
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => setAddingNote(false)}
                      className="px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-xl text-sm sm:text-base text-white/40 hover:text-white/70"
                      style={{ background: 'rgba(255,255,255,0.05)' }}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {record.notes.length === 0 && !addingNote ? (
                <div className="text-center py-6 sm:py-10">
                  <p className="text-white/20 text-sm sm:text-base">Sin registros todavía.</p>
                  <p className="text-white/15 text-xs sm:text-sm mt-1">Usá <span className="text-emerald-400/50">Sesión</span> para cada mentoría que hagas.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2 sm:gap-3">
                  {record.notes.map(note => {
                    const hex = colorHex(note.color)
                    const lines = note.text.split('\n')
                    const isLong = lines.length > 1 || note.text.length > 80
                    const isExpanded = expandedNotes.has(note.id)
                    const isCopied = copiedNote === note.id

                    function toggleExpand() {
                      setExpandedNotes(prev => {
                        const next = new Set(prev)
                        next.has(note.id) ? next.delete(note.id) : next.add(note.id)
                        return next
                      })
                    }

                    function copyNote() {
                      const text = `${mentor.name} · ${formatDate(note.date)}\n\n${note.text}`
                      navigator.clipboard.writeText(text).then(() => {
                        setCopiedNote(note.id)
                        setTimeout(() => setCopiedNote(null), 2000)
                      })
                    }

                    if (editingNoteId === note.id) {
                      const editHex = colorHex(editNoteColor)
                      return (
                        <div
                          key={note.id}
                          className="rounded-xl p-3 sm:p-4 flex flex-col gap-3"
                          style={{ background: `${editHex}0e`, border: `1px solid ${editHex}28` }}
                        >
                          <div className="flex gap-1.5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                            {NOTE_COLORS.map(c => (
                              <button
                                key={c.key}
                                onClick={() => setEditNoteColor(c.key)}
                                className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all duration-150"
                                style={{
                                  background: editNoteColor === c.key ? `${c.hex}25` : 'rgba(255,255,255,0.05)',
                                  border: `1px solid ${editNoteColor === c.key ? c.hex + '60' : 'rgba(255,255,255,0.08)'}`,
                                  color: editNoteColor === c.key ? c.hex : 'rgba(255,255,255,0.4)',
                                }}
                              >
                                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: c.hex, opacity: editNoteColor === c.key ? 1 : 0.5 }} />
                                {c.label}
                              </button>
                            ))}
                          </div>
                          <input
                            type="date"
                            value={editNoteDate}
                            onChange={e => setEditNoteDate(e.target.value)}
                            className="text-sm text-white/70 rounded-xl px-3 py-2 outline-none w-full"
                            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', colorScheme: 'dark' }}
                          />
                          <textarea
                            value={editNoteText}
                            onChange={e => setEditNoteText(e.target.value)}
                            rows={4}
                            autoFocus
                            className="w-full text-sm text-white placeholder-white/20 rounded-xl px-3 py-2.5 outline-none resize-none"
                            style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${editHex}30` }}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={saveEditNote}
                              disabled={!editNoteText.trim()}
                              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-40 disabled:cursor-not-allowed"
                              style={{ background: `linear-gradient(135deg, ${editHex}, ${editHex}bb)` }}
                            >
                              Guardar cambios
                            </button>
                            <button
                              onClick={() => setEditingNoteId(null)}
                              className="px-4 py-2.5 rounded-xl text-sm text-white/40 hover:text-white/70"
                              style={{ background: 'rgba(255,255,255,0.05)' }}
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      )
                    }

                    return (
                      <div
                        key={note.id}
                        className="rounded-xl p-3 sm:p-4 flex gap-2.5 sm:gap-3"
                        style={{ background: `${hex}0e`, border: `1px solid ${hex}28` }}
                      >
                        <div className="w-0.5 rounded-full shrink-0 self-stretch" style={{ background: hex, minHeight: 20 }} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1 sm:mb-1.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider" style={{ color: hex }}>{colorLabel(note.color)}</span>
                              <span className="text-white/25 text-[10px] sm:text-xs">· {formatDate(note.date)}</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                onClick={copyNote}
                                title="Copiar nota"
                                className="transition-colors duration-150"
                                style={{ color: isCopied ? '#10b981' : 'rgba(255,255,255,0.15)' }}
                              >
                                {isCopied ? <Check size={13} /> : <Copy size={13} />}
                              </button>
                              <button
                                onClick={() => startEditNote(note)}
                                title="Editar nota"
                                className="text-white/15 hover:text-[#f97316] transition-colors duration-150"
                              >
                                <Pencil size={13} />
                              </button>
                              <button onClick={() => onDeleteNote(note.id)} className="text-white/15 hover:text-red-400 transition-colors">
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                          <p
                            className="text-white/65 text-sm sm:text-base leading-relaxed"
                            style={!isExpanded && isLong ? {
                              overflow: 'hidden',
                              whiteSpace: 'nowrap',
                              textOverflow: 'ellipsis',
                            } : { whiteSpace: 'pre-wrap' }}
                          >{note.text}</p>
                          {isLong && (
                            <button
                              onClick={toggleExpand}
                              className="flex items-center gap-1 mt-1.5 text-[11px] sm:text-sm font-semibold transition-colors duration-150"
                              style={{ color: hex }}
                            >
                              <ChevronDown
                                size={13}
                                style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms' }}
                              />
                              {isExpanded ? 'Ver menos' : 'Ver más'}
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── CONTACTO ── */}
          {activeTab === 'contact' && (
            <div
              className="rounded-2xl p-4 sm:p-6"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="flex items-center justify-between mb-4 sm:mb-5">
                <p className="text-white/30 text-[10px] sm:text-xs font-semibold uppercase tracking-widest">Datos de contacto</p>
                {!addingContact && (
                  <button
                    onClick={() => setAddingContact(true)}
                    className="flex items-center gap-1 text-[11px] sm:text-sm font-semibold text-[#f97316] hover:text-[#ea580c] transition-colors"
                  >
                    <Plus size={13} /> Agregar
                  </button>
                )}
              </div>

              {/* Add contact form */}
              {addingContact && (
                <div
                  className="mb-4 sm:mb-5 rounded-xl p-3.5 sm:p-5 flex flex-col gap-3 sm:gap-4"
                  style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  {/* Type selector */}
                  <div>
                    <p className="text-white/25 text-[10px] sm:text-xs mb-2 sm:mb-3 uppercase tracking-widest">Tipo</p>
                    <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                      {CONTACT_TYPES.map(ct => (
                        <button
                          key={ct.key}
                          onClick={() => setContactType(ct.key)}
                          className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 text-left"
                          style={{
                            background: contactType === ct.key ? 'rgba(249,115,22,0.15)' : 'rgba(255,255,255,0.05)',
                            border: `1px solid ${contactType === ct.key ? 'rgba(249,115,22,0.4)' : 'rgba(255,255,255,0.08)'}`,
                            color: contactType === ct.key ? '#f97316' : 'rgba(255,255,255,0.45)',
                          }}
                        >
                          <ct.icon size={14} />
                          {ct.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom label (only for 'other') */}
                  {contactType === 'other' && (
                    <input
                      type="text"
                      value={contactLabel}
                      onChange={e => setContactLabel(e.target.value)}
                      placeholder="Nombre del campo (ej: Telegram)"
                      className="text-sm sm:text-base text-white rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 outline-none w-full placeholder-white/20"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}
                    />
                  )}

                  {/* Value */}
                  <input
                    type={contactType === 'email' ? 'email' : contactType === 'phone' ? 'tel' : 'text'}
                    value={contactValue}
                    onChange={e => setContactValue(e.target.value)}
                    autoFocus
                    placeholder={
                      contactType === 'email'     ? 'nombre@ejemplo.com' :
                      contactType === 'phone'     ? '+54 9 11 xxxx-xxxx' :
                      contactType === 'instagram' ? '@handle' :
                      'Valor'
                    }
                    className="text-sm sm:text-base text-white rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 outline-none w-full placeholder-white/20"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(249,115,22,0.25)' }}
                    onKeyDown={e => { if (e.key === 'Enter') saveContact() }}
                  />

                  <div className="flex gap-2 sm:gap-3">
                    <button
                      onClick={saveContact}
                      disabled={!contactValue.trim()}
                      className="flex-1 py-2.5 sm:py-3.5 rounded-xl text-sm sm:text-base font-bold text-white disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => { setAddingContact(false); setContactValue(''); setContactLabel('') }}
                      className="px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-xl text-sm sm:text-base text-white/40 hover:text-white/70"
                      style={{ background: 'rgba(255,255,255,0.05)' }}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {/* Contact list */}
              {record.contacts.length === 0 && !addingContact ? (
                <div className="text-center py-6 sm:py-10">
                  <p className="text-white/20 text-sm sm:text-base">Sin datos de contacto.</p>
                  <p className="text-white/15 text-xs sm:text-sm mt-1">Guardá el mail, teléfono o redes del mentor.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2 sm:gap-3">
                  {record.contacts.map(contact => {
                    const info = contactTypeInfo(contact.type)
                    const href = contactHref(contact)

                    if (editingContactId === contact.id) {
                      return (
                        <div
                          key={contact.id}
                          className="rounded-xl p-3.5 flex flex-col gap-3"
                          style={{ background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.2)' }}
                        >
                          <div className="grid grid-cols-2 gap-1.5">
                            {CONTACT_TYPES.map(ct => (
                              <button
                                key={ct.key}
                                onClick={() => setEditContactType(ct.key)}
                                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 text-left"
                                style={{
                                  background: editContactType === ct.key ? 'rgba(249,115,22,0.15)' : 'rgba(255,255,255,0.05)',
                                  border: `1px solid ${editContactType === ct.key ? 'rgba(249,115,22,0.4)' : 'rgba(255,255,255,0.08)'}`,
                                  color: editContactType === ct.key ? '#f97316' : 'rgba(255,255,255,0.45)',
                                }}
                              >
                                <ct.icon size={13} />
                                {ct.label}
                              </button>
                            ))}
                          </div>
                          {editContactType === 'other' && (
                            <input
                              type="text"
                              value={editContactLabel}
                              onChange={e => setEditContactLabel(e.target.value)}
                              placeholder="Nombre del campo (ej: Telegram)"
                              className="text-sm text-white rounded-xl px-3 py-2.5 outline-none w-full placeholder-white/20"
                              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}
                            />
                          )}
                          <input
                            type={editContactType === 'email' ? 'email' : editContactType === 'phone' ? 'tel' : 'text'}
                            value={editContactValue}
                            onChange={e => setEditContactValue(e.target.value)}
                            autoFocus
                            placeholder={
                              editContactType === 'email'     ? 'nombre@ejemplo.com' :
                              editContactType === 'phone'     ? '+54 9 11 xxxx-xxxx' :
                              editContactType === 'instagram' ? '@handle' : 'Valor'
                            }
                            className="text-sm text-white rounded-xl px-3 py-2.5 outline-none w-full placeholder-white/20"
                            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(249,115,22,0.25)' }}
                            onKeyDown={e => { if (e.key === 'Enter') saveEditContact() }}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={saveEditContact}
                              disabled={!editContactValue.trim()}
                              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-40 disabled:cursor-not-allowed"
                              style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
                            >
                              Guardar cambios
                            </button>
                            <button
                              onClick={() => setEditingContactId(null)}
                              className="px-4 py-2.5 rounded-xl text-sm text-white/40 hover:text-white/70"
                              style={{ background: 'rgba(255,255,255,0.05)' }}
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      )
                    }

                    return (
                      <div
                        key={contact.id}
                        className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl group"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                      >
                        <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(249,115,22,0.12)' }}>
                          <info.icon size={16} className="text-[#f97316]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white/35 text-[10px] sm:text-xs font-semibold uppercase tracking-wide">
                            {contact.type === 'other' && contact.label ? contact.label : info.label}
                          </p>
                          {href ? (
                            <a
                              href={href}
                              target={contact.type !== 'email' && contact.type !== 'phone' ? '_blank' : undefined}
                              rel="noopener noreferrer"
                              className="text-sm sm:text-base text-white/70 hover:text-[#f97316] transition-colors truncate block"
                            >
                              {contact.value}
                            </a>
                          ) : (
                            <p className="text-sm sm:text-base text-white/70 truncate">{contact.value}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button
                            onClick={() => startEditContact(contact)}
                            title="Editar contacto"
                            className="text-white/15 hover:text-[#f97316] transition-colors"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => onDeleteContact(contact.id)}
                            className="text-white/15 hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
