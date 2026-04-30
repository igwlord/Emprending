import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronDown, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import type { MentorWithAvailability, DiagnosticAnswers } from '../types'
import { supabase } from '../lib/supabaseClient'

const TOPICS = [
  'Ventas y Comercialización',
  'Marketing Digital y Publicidad',
  'Finanzas y Costos',
  'Tecnología y Software',
  'Propuesta de Valor y Producto',
  'E-commerce y Marketplaces',
  'Branding y Comunicación',
  'Estrategia y Modelo de Negocio',
  'Equipos y Liderazgo',
  'Socios e Inversión',
  'Procesos y Operaciones',
  'Impacto Social y Triple Impacto',
  'Gastronomía y Alimentos',
  'Productos Físicos y Fabricación',
  'IA y Automatización',
  'Inmobiliario y Real Estate',
  'Internacionalización y Expansión',
]

interface BookingDetail { topics: string[]; notes: string }

interface Props {
  selectedIds: number[]
  mentors: MentorWithAvailability[]
  diagnostic: DiagnosticAnswers | null
  onSuccess: (participantId: string) => void
}

export function RegistrationPage({ selectedIds, mentors, diagnostic, onSuccess }: Props) {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [startup, setStartup] = useState('')
  const [email, setEmail] = useState('')
  const [bookingDetails, setBookingDetails] = useState<Record<number, BookingDetail>>({})
  const [expandedMentor, setExpandedMentor] = useState<number | null>(selectedIds[0] ?? null)
  const [loading, setLoading] = useState(false)

  const selectedMentors = mentors.filter(m => selectedIds.includes(m.id))

  function getDetail(mentorId: number): BookingDetail {
    return bookingDetails[mentorId] ?? { topics: [], notes: '' }
  }

  function toggleTopic(mentorId: number, topic: string) {
    setBookingDetails(prev => {
      const cur = prev[mentorId] ?? { topics: [], notes: '' }
      const topics = cur.topics.includes(topic)
        ? cur.topics.filter(t => t !== topic)
        : [...cur.topics, topic]
      return { ...prev, [mentorId]: { ...cur, topics } }
    })
  }

  function setNotes(mentorId: number, notes: string) {
    setBookingDetails(prev => ({
      ...prev,
      [mentorId]: { ...(prev[mentorId] ?? { topics: [], notes: '' }), notes },
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (selectedIds.length === 0) { toast.error('Elegí al menos un mentor'); return }
    setLoading(true)

    const { data: existing } = await supabase
      .from('participants')
      .select('id')
      .eq('email', email.trim().toLowerCase())
      .single()

    if (existing) {
      toast.error('Este email ya está registrado')
      setLoading(false)
      return
    }

    const { data: participant, error: pErr } = await supabase
      .from('participants')
      .insert({ name: name.trim(), startup_name: startup.trim(), email: email.trim().toLowerCase(), diagnostic: diagnostic ?? null })
      .select()
      .single()

    if (pErr || !participant) {
      toast.error('Error al registrarse. Intentá de nuevo.')
      setLoading(false)
      return
    }

    const { data: currentBookings } = await supabase
      .from('bookings')
      .select('mentor_id')
      .in('mentor_id', selectedIds)

    const bookedCounts: Record<number, number> = {}
    for (const b of currentBookings ?? []) bookedCounts[b.mentor_id] = (bookedCounts[b.mentor_id] ?? 0) + 1

    const availableIds = selectedIds.filter(id => {
      const mentor = mentors.find(m => m.id === id)
      return mentor && (bookedCounts[id] ?? 0) < mentor.max_capacity
    })

    const fullMentors = selectedIds.filter(id => !availableIds.includes(id))
    if (fullMentors.length > 0) {
      const names = fullMentors.map(id => mentors.find(m => m.id === id)?.name).join(', ')
      toast.error(`${names} ya no tiene cupos. Volvé atrás y cambiá tu selección.`)
      await supabase.from('participants').delete().eq('id', participant.id)
      setLoading(false)
      return
    }

    const bookingRows = availableIds.map(mentor_id => ({
      participant_id: participant.id,
      mentor_id,
      topics: getDetail(mentor_id).topics,
      notes: getDetail(mentor_id).notes.trim() || null,
    }))

    const { error: bErr } = await supabase.from('bookings').insert(bookingRows)
    if (bErr) {
      toast.error('Error al reservar. Intentá de nuevo.')
      await supabase.from('participants').delete().eq('id', participant.id)
      setLoading(false)
      return
    }

    onSuccess(participant.id)
    navigate('/confirmation')
  }

  return (
    <div className="min-h-screen px-5 py-8 max-w-lg mx-auto">
      <button
        onClick={() => navigate('/mentors')}
        className="w-9 h-9 rounded-xl bg-[#12121f] border border-[#1e1e35] flex items-center justify-center text-gray-400 hover:text-white transition-colors mb-8"
      >
        <ArrowLeft size={18} />
      </button>

      <h2 className="text-2xl font-black text-white mb-1">Confirmá tu reserva</h2>
      <p className="text-gray-400 text-sm mb-6">
        Completá tus datos y elegí los temas que querés ver con cada tutor.
      </p>

      {/* Per-mentor topic selection */}
      <div className="mb-6">
        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3">
          Tus {selectedIds.length} tutores
        </p>
        <div className="flex flex-col gap-2">
          {selectedMentors.map(m => {
            const detail = getDetail(m.id)
            const isOpen = expandedMentor === m.id
            return (
              <div key={m.id} className="bg-[#12121f] border border-[#1e1e35] rounded-2xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpandedMentor(isOpen ? null : m.id)}
                  className="w-full flex items-center gap-3 p-3 text-left hover:bg-white/[0.02] transition-colors"
                >
                  <img
                    src={m.photo_url}
                    alt={m.name}
                    className="w-10 h-10 rounded-xl object-cover object-top bg-[#1e1e35] shrink-0"
                    onError={e => { e.currentTarget.style.display = 'none' }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-semibold truncate">{m.name}</div>
                    <div className="text-xs mt-0.5">
                      {detail.topics.length > 0
                        ? <span className="text-[#f97316]">{detail.topics.length} tema{detail.topics.length > 1 ? 's' : ''} seleccionado{detail.topics.length > 1 ? 's' : ''}</span>
                        : <span className="text-gray-600">Tocar para seleccionar temas</span>}
                    </div>
                  </div>
                  <ChevronDown
                    size={15}
                    className={`text-gray-500 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {isOpen && (
                  <div className="border-t border-[#1e1e35] px-4 pb-4 flex flex-col gap-4">
                    <div className="pt-4">
                      <p className="text-gray-400 text-xs font-semibold mb-2.5">
                        ¿Qué tema querés ver con este tutor?
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {TOPICS.map(topic => (
                          <button
                            key={topic}
                            type="button"
                            onClick={() => toggleTopic(m.id, topic)}
                            className={`text-xs px-2.5 py-1 rounded-full border transition-all
                              ${detail.topics.includes(topic)
                                ? 'bg-[#f97316]/15 text-[#f97316] border-[#f97316]/50'
                                : 'text-gray-500 border-[#1e1e35] hover:border-[#2a2a4a] hover:text-gray-400'}`}
                          >
                            {topic}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs font-semibold mb-1.5">
                        Contanos más (opcional)
                      </p>
                      <textarea
                        value={detail.notes}
                        onChange={e => setNotes(m.id, e.target.value)}
                        rows={2}
                        placeholder="¿Qué querés hablar puntualmente con este tutor?"
                        className="w-full bg-[#0f0f1a] border border-[#1e1e35] rounded-xl px-3 py-2.5 text-white text-xs placeholder-gray-600 outline-none focus:border-[#f97316]/40 resize-none transition-colors"
                      />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Personal data form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Tus datos</p>

        {[
          { id: 'name', label: 'Tu nombre', placeholder: 'Ej. María García', value: name, set: setName },
          { id: 'startup', label: 'Nombre del emprendimiento', placeholder: 'Ej. Cuña', value: startup, set: setStartup },
          { id: 'email', label: 'Tu email', placeholder: 'Ej. maria@cuña.com', value: email, set: setEmail },
        ].map(field => (
          <div key={field.id} className="flex flex-col gap-1.5">
            <label className="text-gray-300 text-sm font-medium">{field.label}</label>
            <input
              type={field.id === 'email' ? 'email' : 'text'}
              required
              value={field.value}
              onChange={e => field.set(e.target.value)}
              placeholder={field.placeholder}
              className="bg-[#12121f] border border-[#1e1e35] rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 outline-none focus:border-[#f97316]/40 transition-colors"
            />
          </div>
        ))}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full bg-[#f97316] hover:bg-[#ea6c0c] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all"
        >
          {loading ? <Loader2 size={20} className="animate-spin" /> : '🎉 Confirmar y reservar'}
        </button>
      </form>
    </div>
  )
}
