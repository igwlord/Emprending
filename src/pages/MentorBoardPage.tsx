import { useState, useMemo } from 'react'
import { Search, SlidersHorizontal, LogOut, RotateCcw } from 'lucide-react'
import type { DiagnosticAnswers, MentorWithAvailability } from '../types'
import { useMentors } from '../hooks/useMentors'
import { useMentorNotes } from '../hooks/useMentorNotes'
import { scoreMentors } from '../lib/recommendations'
import { MentorCard } from '../components/MentorCard'
import { MentorModal } from '../components/MentorModal'
import { SkeletonCard } from '../components/SkeletonCard'
import { FilterBar } from '../components/FilterBar'
import { useAuth } from '../context/AuthContext'

interface Props {
  diagnostic: DiagnosticAnswers | null
  onRetakeDiagnostic: () => void
}

const FILTER_TAGS = [
  'Ventas B2B', 'Marketing Digital', 'Finanzas', 'Legales', 'Tecnología',
  'Procesos', 'E-commerce', 'Gastronomía', 'Productos físicos', 'Triple impacto', 'AI / Automatización',
]

export function MentorBoardPage({ diagnostic, onRetakeDiagnostic }: Props) {
  const { user, signOut } = useAuth()
  const { mentors, loading } = useMentors()
  const notes = useMentorNotes(user?.id)
  const [search, setSearch] = useState('')
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(!diagnostic)
  const [filterSession, setFilterSession] = useState(false)
  const [modalMentor, setModalMentor] = useState<MentorWithAvailability | null>(null)
  const [searchFocused, setSearchFocused] = useState(false)
  const [avatarError, setAvatarError] = useState(false)

  const sorted = useMemo<MentorWithAvailability[]>(() => {
    if (!diagnostic) return mentors
    return scoreMentors(mentors, diagnostic)
  }, [mentors, diagnostic])

  const filtered = useMemo(() => {
    return sorted.filter(m => {
      const matchSearch = !search ||
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.role_company.toLowerCase().includes(search.toLowerCase()) ||
        m.specialty_tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
      const matchTag = !activeTag ||
        m.specialty_tags.some(t => t.toLowerCase().includes(activeTag.toLowerCase()))
      const matchSession = !filterSession ||
        notes.get(m.id).notes.some(n => n.color === 'session')
      return matchSearch && matchTag && matchSession
    })
  }, [sorted, search, activeTag, filterSession, notes])

  const recommended = useMemo(() =>
    sorted.filter(m => (m.score ?? 0) > 0).slice(0, 7),
    [sorted]
  )

  const displayMentors = showAll ? filtered : recommended.filter(m => {
    const matchSearch = !search ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.specialty_tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
    const matchSession = !filterSession ||
      notes.get(m.id).notes.some(n => n.color === 'session')
    return matchSearch && matchSession
  })

  return (
    <div className="min-h-dvh flex flex-col">
      {/* Sticky header — solo search + filtros */}
      <div
        className="sticky top-0 z-40 border-b border-white/[0.06] px-4 sm:px-6 py-3"
        style={{ background: 'rgba(4,7,28,0.82)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}
      >
        <div className="max-w-[1800px] mx-auto flex flex-col gap-2.5">
          {/* Search + user */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search
                size={16}
                className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-150 ${
                  searchFocused ? 'text-[#f97316]' : 'text-white/30'
                }`}
              />
              <input
                type="text"
                placeholder="Buscar mentor o especialidad..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="w-full glass rounded-2xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/25 outline-none transition-all duration-150"
                style={searchFocused ? {
                  borderColor: 'rgba(249,115,22,0.3)',
                  boxShadow: '0 0 0 3px rgba(249,115,22,0.08)',
                } : undefined}
              />
            </div>
            {user && (
              <div className="flex items-center gap-1.5 shrink-0">
                {user.user_metadata?.avatar_url && !avatarError ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt=""
                    onError={() => setAvatarError(true)}
                    className="w-9 h-9 rounded-full object-cover shrink-0"
                    style={{ border: '1px solid rgba(255,255,255,0.15)' }}
                  />
                ) : (
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                    style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)', border: '1px solid rgba(255,255,255,0.15)' }}
                  >
                    {(user.user_metadata?.full_name ?? user.email ?? 'U')[0].toUpperCase()}
                  </div>
                )}
                <button
                  onClick={onRetakeDiagnostic}
                  title="Repetir diagnóstico"
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-[#a78bfa] transition-colors"
                  style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)' }}
                >
                  <RotateCcw size={13} />
                </button>
                <button
                  onClick={signOut}
                  title="Cerrar sesión"
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white/80 transition-colors"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <LogOut size={13} />
                </button>
              </div>
            )}
          </div>

          {/* Toggles + Filters */}
          <div className="flex items-center gap-2 min-w-0">
            {diagnostic && (
              <button
                onClick={() => setShowAll(s => !s)}
                className={`shrink-0 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border font-semibold transition-all duration-150
                  ${!showAll
                    ? 'bg-[#7c3aed]/15 text-[#a78bfa] border-[#7c3aed]/30'
                    : 'glass text-white/40 hover:text-white/70'
                  }`}
              >
                <SlidersHorizontal size={12} />
                {showAll ? 'Ver recomendados' : 'Ver todos'}
              </button>
            )}
            <button
              onClick={() => setFilterSession(s => !s)}
              className={`shrink-0 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border font-semibold transition-all duration-150
                ${filterSession
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : 'glass text-white/40 hover:text-white/70'
                }`}
            >
              ✓ Con sesión
            </button>
            <FilterBar tags={FILTER_TAGS} active={activeTag} onSelect={setActiveTag} />
          </div>
        </div>
      </div>

      {/* Page title — grande y centrado */}
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 pt-8 pb-2 text-center">
        <h1
          className="text-3xl sm:text-4xl font-black text-white leading-tight"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          {diagnostic && !showAll
            ? 'Tus recomendados'
            : filterSession
              ? 'Con sesión'
              : activeTag ?? 'Todos los mentores'}
        </h1>
        <div className="flex items-center justify-center gap-3 mt-2">
          <p className="text-white/35 text-sm">{displayMentors.length} mentores</p>
          {notes.sessionCount > 0 && (
            <button
              onClick={() => setFilterSession(s => !s)}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full transition-all duration-150 ${
                filterSession
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'glass text-emerald-400 hover:bg-emerald-500/10'
              }`}
            >
              ✓ {notes.sessionCount} sesión{notes.sessionCount !== 1 ? 'es' : ''}
            </button>
          )}
        </div>
        {diagnostic && !showAll && (
          <p className="text-white/30 text-xs mt-2">
            Basado en tu diagnóstico —{' '}
            <button onClick={() => setShowAll(true)} className="text-[#f97316] underline underline-offset-2 hover:text-[#ea580c] transition-colors">
              explorar todos
            </button>
          </p>
        )}
      </div>

      {/* Grid */}
      <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 py-4 flex-1">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3">
            {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : displayMentors.length === 0 ? (
          <div className="text-center py-20 text-white/30">
            {filterSession
              ? 'Todavía no tenés sesiones registradas.'
              : 'No encontramos mentores con ese filtro.'}
            <br />
            <button
              onClick={() => { setSearch(''); setActiveTag(null); setFilterSession(false) }}
              className="text-[#f97316] underline mt-2 text-sm hover:text-[#ea580c] transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3">
            {displayMentors.map((m, i) => {
              const note = notes.get(m.id)
              return (
                <MentorCard
                  key={m.id}
                  mentor={m}
                  isRecommended={!showAll && (m.score ?? 0) > 0}
                  sessionDone={note.notes.some(n => n.color === 'session')}
                  hasNotes={note.notes.length > 0}
                  index={i}
                  onOpenModal={setModalMentor}
                />
              )
            })}
          </div>
        )}
      </div>

      {modalMentor && (
        <MentorModal
          mentor={modalMentor}
          record={notes.get(modalMentor.id)}
          onAddNote={entry => notes.addNote(modalMentor.id, entry)}
          onEditNote={(noteId, updates) => notes.editNote(modalMentor.id, noteId, updates)}
          onDeleteNote={noteId => notes.deleteNote(modalMentor.id, noteId)}
          onAddContact={entry => notes.addContact(modalMentor.id, entry)}
          onEditContact={(contactId, updates) => notes.editContact(modalMentor.id, contactId, updates)}
          onDeleteContact={contactId => notes.deleteContact(modalMentor.id, contactId)}
          onClose={() => setModalMentor(null)}
        />
      )}

      {/* Footer */}
      <div className="text-center py-6">
        <a
          href="https://neptunestudios.netlify.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium transition-all duration-200 hover:opacity-100"
          style={{
            color: 'rgba(52,211,153,0.55)',
            textShadow: '0 0 12px rgba(52,211,153,0.25)',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(52,211,153,0.9)'
            ;(e.currentTarget as HTMLAnchorElement).style.textShadow = '0 0 16px rgba(52,211,153,0.5)'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(52,211,153,0.55)'
            ;(e.currentTarget as HTMLAnchorElement).style.textShadow = '0 0 12px rgba(52,211,153,0.25)'
          }}
        >
          powered by Neptune
        </a>
      </div>
    </div>
  )
}
