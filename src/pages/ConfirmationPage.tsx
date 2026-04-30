import { CheckCircle, ExternalLink } from 'lucide-react'
import type { MentorWithAvailability } from '../types'

interface Props {
  selectedIds: number[]
  mentors: MentorWithAvailability[]
}

export function ConfirmationPage({ selectedIds, mentors }: Props) {
  const selectedMentors = mentors.filter(m => selectedIds.includes(m.id))

  return (
    <div className="min-h-dvh relative overflow-hidden flex flex-col items-center px-5 py-12">
      {/* Blobs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute rounded-full"
        style={{
          width: 500, height: 500,
          background: 'radial-gradient(circle, rgba(249,115,22,0.09) 0%, transparent 70%)',
          filter: 'blur(60px)',
          top: '-15%', right: '-10%',
          animation: 'blob-float 12s ease-in-out infinite',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute rounded-full"
        style={{
          width: 400, height: 400,
          background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)',
          filter: 'blur(60px)',
          bottom: '-10%', left: '-8%',
          animation: 'blob-float 15s ease-in-out infinite 3s',
        }}
      />

      <div className="relative z-10 w-full max-w-lg flex flex-col items-center">
        {/* Success icon */}
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
          style={{
            background: 'linear-gradient(135deg, #34d399, #059669)',
            boxShadow: '0 0 40px rgba(16,185,129,0.45)',
          }}
        >
          <CheckCircle size={36} className="text-white" />
        </div>

        <h1
          className="text-3xl font-black text-white text-center mb-2"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          ¡Todo listo!
        </h1>
        <p className="text-white/55 text-center text-sm mb-8 leading-relaxed">
          Tus {selectedMentors.length} tutores están reservados.<br />Nos vemos en la maratón 🚀
        </p>

        {/* Mentor list */}
        <div className="w-full glass rounded-[20px] overflow-hidden mb-6">
          <div className="px-4 py-3 border-b border-white/[0.06]">
            <span className="text-white/35 text-[10px] font-semibold uppercase tracking-widest">
              Tus tutores reservados
            </span>
          </div>
          {selectedMentors.map((m, i) => (
            <div
              key={m.id}
              className={`flex items-center gap-3 px-4 py-3 transition-colors duration-150 hover:bg-white/[0.03] ${
                i < selectedMentors.length - 1 ? 'border-b border-white/[0.05]' : ''
              }`}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
              >
                <span className="text-white text-xs font-black" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {i + 1}
                </span>
              </div>
              <img
                src={m.photo_url}
                alt={m.name}
                className="w-10 h-10 rounded-xl object-cover object-top bg-white/5"
                onError={e => { e.currentTarget.style.display = 'none' }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm font-semibold truncate" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {m.name}
                </div>
                <div className="text-white/50 text-xs truncate">{m.role_company}</div>
              </div>
              {m.linkedin_url && (
                <a
                  href={m.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/25 hover:text-[#f97316] transition-colors duration-150 shrink-0"
                >
                  <ExternalLink size={15} />
                </a>
              )}
            </div>
          ))}
        </div>

        {/* Info box */}
        <div
          className="w-full rounded-2xl p-4 text-center"
          style={{
            background: 'rgba(249,115,22,0.08)',
            border: '1px solid rgba(249,115,22,0.18)',
          }}
        >
          <p className="text-[#f97316] text-sm leading-relaxed">
            📅 Recordá que la asignación final de horarios la comunica el equipo de Emprending por WhatsApp.
          </p>
        </div>
      </div>
    </div>
  )
}
