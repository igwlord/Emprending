import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useGuest } from '../context/GuestContext'

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

export function LoginPage() {
  const { user, loading, signInWithGoogle } = useAuth()
  const { enableGuestMode } = useGuest()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && user) navigate('/mentors', { replace: true })
  }, [user, loading, navigate])

  function handleGuest() {
    enableGuestMode()
    navigate('/diagnostic', { replace: true })
  }

  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center px-5"
      style={{ background: 'rgba(3,3,8,0.38)' }}
    >
      <div className="w-full max-w-xs flex flex-col items-center gap-7">

        {/* Título */}
        <div className="text-center">
          <h1
            className="font-black text-white leading-tight"
            style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.9rem' }}
          >
            Seguimiento de Tutorías
          </h1>
          <p className="text-white/45 text-sm mt-2 leading-relaxed">
            Registrá notas, experiencias y avances<br />de cada encuentro en un solo lugar.
          </p>
        </div>

        {/* Modal / card */}
        <div
          className="w-full rounded-[24px] p-6 flex flex-col gap-3"
          style={{
            background: 'rgba(6,10,38,0.72)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.10)',
          }}
        >
          {/* Google */}
          <button
            onClick={signInWithGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl font-semibold text-[#1a1a1a] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
            style={{ background: '#ffffff', boxShadow: '0 2px 16px rgba(0,0,0,0.35)' }}
          >
            <GoogleIcon />
            Continuar con Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <span className="text-white/25 text-xs">o</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
          </div>

          {/* Invitado */}
          <button
            onClick={handleGuest}
            className="w-full flex flex-col items-center gap-1 py-3 rounded-2xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.10)',
            }}
          >
            <span className="text-white/80 font-semibold text-sm">Entrar como invitado</span>
            <span className="text-white/30 text-xs">Las notas y contactos no se guardan en la nube</span>
          </button>
        </div>

        {/* Aviso legal */}
        <p className="text-white/20 text-xs text-center leading-relaxed px-2">
          Esta plataforma no representa un canal oficial de Emprending. Su uso está destinado únicamente al seguimiento interno de tutorías, mentorías, notas y avances.
        </p>

      </div>
    </div>
  )
}
