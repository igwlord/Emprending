import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import type { DiagnosticAnswers } from '../types'

interface Option {
  value: string
  label: string
  emoji: string
  description: string
}

interface Step {
  key: keyof DiagnosticAnswers
  question: string
  subtitle?: string
  multi?: boolean
  options: Option[]
}

const STEPS: Step[] = [
  {
    key: 'stage',
    question: '¿En qué etapa está tu emprendimiento?',
    options: [
      { value: 'idea',    label: 'Idea',           emoji: '💡', description: 'Todavía no tengo clientes' },
      { value: 'mvp',     label: 'MVP / Tracción',  emoji: '🚀', description: 'Tengo primeros clientes, estoy validando' },
      { value: 'growth',  label: 'Crecimiento',     emoji: '📈', description: 'Tengo clientes, busco escalar' },
      { value: 'company', label: 'Empresa',          emoji: '🏢', description: 'Estructura armada, busco optimizar' },
    ],
  },
  {
    key: 'problems',
    question: '¿Cuáles son tus mayores problemas hoy?',
    subtitle: 'Podés elegir más de una opción',
    multi: true,
    options: [
      { value: 'sales',      label: 'Conseguir clientes',  emoji: '🎯', description: 'Ventas y prospección' },
      { value: 'financing',  label: 'Financiarme',         emoji: '💰', description: 'Inversión, costos, socios' },
      { value: 'team',       label: 'Equipo y procesos',   emoji: '👥', description: 'Organizar mi empresa' },
      { value: 'product',    label: 'Mi producto',         emoji: '⚙️', description: 'Definir propuesta de valor' },
      { value: 'legal',      label: 'Legales',             emoji: '⚖️', description: 'Temas impositivos o societarios' },
      { value: 'marketing',  label: 'Marketing y marca',   emoji: '📣', description: 'Visibilidad y comunicación' },
      { value: 'scale',      label: 'Escalar / Exportar',  emoji: '🌎', description: 'Expansión o franquicias' },
    ],
  },
  {
    key: 'sector',
    question: '¿En qué sector operás?',
    options: [
      { value: 'gastronomy',    label: 'Gastronomía / Retail',      emoji: '🍽️', description: 'Restaurantes, tiendas, hospitalidad' },
      { value: 'tech',          label: 'Tecnología / SaaS',          emoji: '💻', description: 'Software, apps, e-commerce' },
      { value: 'services',      label: 'Servicios profesionales',    emoji: '🤝', description: 'Consultoría, agencias, B2B' },
      { value: 'manufacturing', label: 'Productos físicos',          emoji: '📦', description: 'Manufactura, deco, industrial' },
      { value: 'textile',       label: 'Textil / Moda',              emoji: '👗', description: 'Indumentaria, confección, diseño' },
      { value: 'media',         label: 'Medios / Música / Audiovisual', emoji: '🎬', description: 'Entretenimiento, contenido, producción' },
      { value: 'other',         label: 'Otro',                       emoji: '✨', description: 'Mi sector es diferente' },
    ],
  },
]

interface Props {
  onComplete: (answers: DiagnosticAnswers) => void
}

export function DiagnosticPage({ onComplete }: Props) {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const stepTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => () => { if (stepTimer.current) clearTimeout(stepTimer.current) }, [])
  const [stage, setStage] = useState<string | undefined>()
  const [problems, setProblems] = useState<string[]>([])
  const [sector, setSector] = useState<string | undefined>()

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1
  const progress = ((step + 1) / STEPS.length) * 100

  function getSelected(): string | string[] | undefined {
    if (current.key === 'stage')    return stage
    if (current.key === 'problems') return problems
    if (current.key === 'sector')   return sector
  }

  function isOptionSelected(value: string): boolean {
    if (current.key === 'problems') return problems.includes(value)
    return getSelected() === value
  }

  function handleSingleSelect(value: string) {
    if (current.key === 'stage')  setStage(value)
    if (current.key === 'sector') setSector(value)

    const newStage   = current.key === 'stage'  ? value : stage
    const newSector  = current.key === 'sector' ? value : sector
    const newAnswers: DiagnosticAnswers = { stage: newStage!, problems, sector: newSector! }

    if (isLast) {
      onComplete(newAnswers)
      navigate('/mentors')
    } else {
      stepTimer.current = setTimeout(() => setStep(s => s + 1), 200)
    }
  }

  function handleToggleProblem(value: string) {
    setProblems(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    )
  }

  function handleContinueMulti() {
    if (problems.length === 0) return
    if (isLast) {
      onComplete({ stage: stage!, problems, sector: sector! })
      navigate('/mentors')
    } else {
      setStep(s => s + 1)
    }
  }

  const canContinueMulti = current.multi && problems.length > 0

  return (
    <div className="min-h-dvh flex flex-col px-5 py-8 max-w-lg mx-auto relative overflow-hidden">
      {/* Ambient blob */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute rounded-full"
        style={{
          width: 400, height: 400,
          background: 'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)',
          filter: 'blur(60px)',
          top: '-10%', right: '-15%',
          animation: 'blob-float 15s ease-in-out infinite',
        }}
      />

      {/* Header */}
      <div className="flex items-center gap-3 mb-8 relative z-10">
        <button
          onClick={() => step === 0 ? navigate('/') : setStep(s => s - 1)}
          className="w-11 h-11 rounded-xl flex items-center justify-center text-white/50 hover:text-white transition-colors duration-150 shrink-0"
          style={{ background: 'rgba(6,10,38,0.55)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)' }}
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <div className="text-white/35 text-xs mb-1.5">Paso {step + 1} de {STEPS.length}</div>
          <div className="w-full bg-white/[0.06] rounded-full h-1.5 overflow-hidden">
            <div
              className="h-1.5 rounded-full transition-all duration-400"
              style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #f97316, #ea580c)' }}
            />
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="mb-6 relative z-10">
        <h2
          className="text-2xl sm:text-3xl font-black text-white leading-tight"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          {current.question}
        </h2>
        {current.subtitle && (
          <p className="text-white/40 text-sm mt-1.5">{current.subtitle}</p>
        )}
      </div>

      {/* Options */}
      <div className="flex flex-col gap-2.5 flex-1 relative z-10">
        {current.options.map(opt => {
          const selected = isOptionSelected(opt.value)
          return (
            <button
              key={opt.value}
              onClick={() => current.multi ? handleToggleProblem(opt.value) : handleSingleSelect(opt.value)}
              className={`flex items-center gap-4 p-4 rounded-[18px] text-left w-full transition-all duration-[200ms] ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98] ${!selected ? 'hover:-translate-y-0.5' : ''}`}
              style={{
                background: selected ? 'rgba(249,115,22,0.09)' : 'rgba(6,10,38,0.55)',
                border: `1px solid ${selected ? 'rgba(249,115,22,0.42)' : 'rgba(255,255,255,0.08)'}`,
                boxShadow: selected ? '0 0 28px rgba(249,115,22,0.18)' : 'none',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
              }}
            >
              <span className="text-2xl shrink-0">{opt.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-white text-[14px]" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {opt.label}
                </div>
                <div className="text-white/45 text-xs mt-0.5">{opt.description}</div>
              </div>
              {current.multi ? (
                <div
                  className="w-5 h-5 rounded-md shrink-0 flex items-center justify-center transition-all duration-200"
                  style={{
                    background: selected ? '#f97316' : 'transparent',
                    border: `1.5px solid ${selected ? '#f97316' : 'rgba(255,255,255,0.18)'}`,
                    boxShadow: selected ? '0 0 8px rgba(249,115,22,0.5)' : 'none',
                  }}
                >
                  {selected && <Check size={12} className="text-white" strokeWidth={3} />}
                </div>
              ) : (
                <div
                  className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center transition-all duration-200"
                  style={{
                    background: selected ? '#f97316' : 'transparent',
                    border: `1.5px solid ${selected ? '#f97316' : 'rgba(255,255,255,0.18)'}`,
                    boxShadow: selected ? '0 0 8px rgba(249,115,22,0.5)' : 'none',
                  }}
                >
                  {selected && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Continuar button — only for multi-select steps */}
      {current.multi && (
        <button
          onClick={handleContinueMulti}
          disabled={!canContinueMulti}
          className="mt-5 relative z-10 w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-white text-base transition-all duration-[200ms] ease-[cubic-bezier(0.16,1,0.3,1)] disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            fontFamily: 'Outfit, sans-serif',
            background: canContinueMulti
              ? 'linear-gradient(135deg, #f97316, #ea580c)'
              : 'rgba(255,255,255,0.06)',
            boxShadow: canContinueMulti ? '0 0 28px rgba(249,115,22,0.35)' : 'none',
          }}
        >
          {problems.length > 0 ? `Continuar con ${problems.length} problema${problems.length > 1 ? 's' : ''}` : 'Elegí al menos uno'}
          <ArrowRight size={18} />
        </button>
      )}

      {/* Skip */}
      <button
        onClick={() => navigate('/mentors')}
        className="mt-4 text-white/28 text-sm flex items-center justify-center gap-1 hover:text-white/60 transition-colors duration-150 relative z-10"
      >
        Saltar diagnóstico <ArrowRight size={14} />
      </button>
    </div>
  )
}
