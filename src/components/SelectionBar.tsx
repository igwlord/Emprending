import { ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface Props {
  count: number
  max: number
}

export function SelectionBar({ count, max }: Props) {
  const navigate = useNavigate()
  if (count === 0) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="pointer-events-auto border-t border-white/[0.07]"
        style={{ background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}
      >
        <div className="max-w-[1400px] mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Left — count + dots */}
          <div className="flex flex-col gap-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-white font-black text-2xl leading-none" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {count}
              </span>
              <span className="text-white/45 text-xs">{count === 1 ? 'tutor elegido' : 'tutores elegidos'}</span>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: max }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i < count
                      ? 'bg-[#f97316] shadow-[0_0_6px_rgba(249,115,22,0.6)]'
                      : 'bg-white/15'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={() => navigate('/register')}
            className="shrink-0 bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white font-bold px-6 py-3 rounded-2xl flex items-center gap-2 transition-all duration-[200ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.03] hover:shadow-[0_0_40px_rgba(249,115,22,0.6)] active:scale-95"
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: '15px',
              animation: 'glow-pulse 2.5s ease-in-out infinite',
            }}
          >
            Continuar <ArrowRight size={17} />
          </button>
        </div>
      </div>
    </div>
  )
}
