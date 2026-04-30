import { useNavigate } from 'react-router-dom'
import { ArrowRight, Users, BookOpen, Zap } from 'lucide-react'

export function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-dvh relative overflow-hidden flex flex-col">
      {/* Ambient blobs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute rounded-full"
        style={{
          width: 600, height: 600,
          background: 'radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%)',
          filter: 'blur(60px)',
          top: '-15%', right: '-10%',
          animation: 'blob-float 12s ease-in-out infinite',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute rounded-full"
        style={{
          width: 500, height: 500,
          background: 'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)',
          filter: 'blur(60px)',
          bottom: '-10%', left: '-8%',
          animation: 'blob-float 15s ease-in-out infinite 3s',
        }}
      />

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-5 pt-20 pb-10 relative z-10">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs font-semibold text-[#f97316] mb-6"
          style={{ borderColor: 'rgba(249,115,22,0.3)' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#f97316] animate-pulse" />
          Emprending Hub 2026
        </div>

        {/* Headline */}
        <h1
          className="font-black leading-[1.0] tracking-[-0.02em] text-5xl sm:text-6xl lg:text-7xl mb-5"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          <span className="text-white">Tu red de</span>
          <br />
          <span
            className="inline-block"
            style={{
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            mentores.
          </span>
        </h1>

        <p className="text-white/55 text-lg max-w-sm leading-relaxed mb-8">
          Explorá todos los mentores, recibí recomendaciones personalizadas y llevá el registro de tus sesiones.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 items-center w-full max-w-sm mb-16">
          <button
            onClick={() => navigate('/diagnostic')}
            className="w-full flex items-center justify-center gap-2.5 text-white font-bold text-lg px-8 py-4 rounded-2xl transition-all duration-[200ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.03] active:scale-95"
            style={{
              fontFamily: 'Outfit, sans-serif',
              background: 'linear-gradient(135deg, #f97316, #ea580c)',
              boxShadow: '0 0 40px rgba(249,115,22,0.4)',
              animation: 'glow-pulse 2.5s ease-in-out infinite',
            }}
          >
            Comenzar diagnóstico <ArrowRight size={22} />
          </button>
        </div>

        <button
          onClick={() => navigate('/mentors')}
          className="text-white/45 text-sm hover:text-white/80 underline underline-offset-4 transition-colors duration-150 -mt-10 mb-16"
        >
          Ver todos los mentores sin diagnóstico
        </button>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl w-full mx-auto">
          {[
            {
              icon: <Users size={20} />,
              title: '61 mentores expertos',
              desc: 'Profesionales seleccionados con experiencia real en emprendimiento.',
            },
            {
              icon: <BookOpen size={20} />,
              title: 'Registro de sesiones',
              desc: 'Tomá notas de cada mentoría y seguí tu evolución en el tiempo.',
            },
            {
              icon: <Zap size={20} />,
              title: 'Match inteligente',
              desc: 'El diagnóstico identifica los tutores más relevantes para tu etapa.',
            },
          ].map(f => (
            <div
              key={f.title}
              className="glass rounded-[20px] p-6 text-left transition-all duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-white/[0.07] hover:-translate-y-1 hover:border-white/18 hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)]"
            >
              <div className="w-10 h-10 rounded-xl bg-[#f97316]/15 flex items-center justify-center text-[#f97316] mb-3">
                {f.icon}
              </div>
              <div className="font-bold text-[15px] text-white mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {f.title}
              </div>
              <div className="text-sm text-white/50 leading-relaxed">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Staff link */}
      <button
        onClick={() => navigate('/staff')}
        className="absolute bottom-4 right-4 text-white/15 text-xs hover:text-white/50 transition-colors duration-150"
      >
        Staff →
      </button>
    </div>
  )
}
