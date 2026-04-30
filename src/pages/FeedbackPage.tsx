import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Loader2, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabaseClient'
import { StarRating } from '../components/StarRating'

export function FeedbackPage() {
  const [params] = useSearchParams()
  const session = params.get('session') ?? 'General'

  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [participantName, setParticipantName] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (rating === 0) { toast.error('Elegí una calificación'); return }
    setLoading(true)

    const { error } = await supabase.from('feedback').insert({
      session_label: session,
      participant_name: participantName.trim() || null,
      rating,
      comment: comment.trim() || null,
    })

    if (error) { toast.error('Error al enviar. Intentá de nuevo.'); setLoading(false); return }
    setSent(true)
  }

  if (sent) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-5 text-center gap-6">
        <div className="w-20 h-20 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
          <CheckCircle size={40} className="text-emerald-400" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white mb-2">¡Gracias!</h2>
          <p className="text-gray-400 text-sm">Tu feedback ayuda a mejorar el programa.</p>
        </div>
        <div className="flex gap-1">
          {[1,2,3,4,5].map(s => (
            <span key={s} className={`text-2xl ${s <= rating ? '⭐' : '☆'}`}>{s <= rating ? '⭐' : ''}</span>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm flex flex-col gap-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#f97316] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-600/30">
            <span className="text-white font-black text-2xl">E.</span>
          </div>
          <h2 className="text-2xl font-black text-white mb-1">¿Cómo estuvo?</h2>
          <p className="text-gray-500 text-sm">{session}</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Stars */}
          <div className="bg-[#12121f] border border-[#1e1e35] rounded-2xl p-6 flex flex-col items-center gap-4">
            <p className="text-gray-300 text-sm text-center">¿Cómo calificás la clase?</p>
            <StarRating value={rating} onChange={setRating} />
            {rating > 0 && (
              <p className="text-gray-500 text-xs">
                {['', 'Muy mala', 'Regular', 'Buena', 'Muy buena', '¡Excelente!'][rating]}
              </p>
            )}
          </div>

          {/* Comment */}
          <div className="flex flex-col gap-1.5">
            <label className="text-gray-300 text-sm font-medium">Comentario (opcional)</label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="¿Qué te llevas? ¿Qué mejorarías?"
              rows={3}
              className="bg-[#12121f] border border-[#1e1e35] rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 outline-none focus:border-[#f97316]/40 transition-colors resize-none"
            />
          </div>

          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-gray-300 text-sm font-medium">Tu nombre (opcional)</label>
            <input
              type="text"
              value={participantName}
              onChange={e => setParticipantName(e.target.value)}
              placeholder="Ej. María García"
              className="bg-[#12121f] border border-[#1e1e35] rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 outline-none focus:border-[#f97316]/40 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading || rating === 0}
            className="w-full bg-[#f97316] hover:bg-[#ea6c0c] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : 'Enviar feedback'}
          </button>
        </form>
      </div>
    </div>
  )
}
