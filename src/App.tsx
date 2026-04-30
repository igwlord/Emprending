import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import type { DiagnosticAnswers } from './types'
import { AuthProvider, useAuth } from './context/AuthContext'
import { GuestProvider, useGuest } from './context/GuestContext'
import { supabase } from './lib/supabaseClient'
import { LoginPage } from './pages/LoginPage'
import { DiagnosticPage } from './pages/DiagnosticPage'
import { MentorBoardPage } from './pages/MentorBoardPage'
import { FeedbackPage } from './pages/FeedbackPage'
import { StaffPage } from './pages/StaffPage'

function Spinner() {
  return (
    <div className="min-h-dvh flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-[#f97316] border-t-transparent animate-spin" />
    </div>
  )
}

function RequireAuth({ children }: { children: React.ReactNode; diagnostic: DiagnosticAnswers | null }) {
  const { user } = useAuth()
  const { guestMode } = useGuest()
  if (!user && !guestMode) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AppRoutes() {
  const { user, loading } = useAuth()
  const { guestMode } = useGuest()
  const [diagnostic, setDiagnostic] = useState<DiagnosticAnswers | null>(null)
  const [diagInit, setDiagInit] = useState(false)

  useEffect(() => {
    if (!loading) {
      setDiagnostic((user?.user_metadata?.diagnostic as DiagnosticAnswers | undefined) ?? null)
      setDiagInit(true)
    }
  }, [loading, user?.id])

  // For guests, skip the diagInit wait
  if (loading || (!diagInit && !guestMode)) return <Spinner />

  async function handleDiagnosticComplete(answers: DiagnosticAnswers) {
    setDiagnostic(answers)
    if (user) await supabase.auth.updateUser({ data: { diagnostic: answers } })
  }

  async function handleRetakeDiagnostic() {
    setDiagnostic(null)
    if (user) await supabase.auth.updateUser({ data: { diagnostic: null } })
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/diagnostic"
        element={
          !user && !guestMode ? <Navigate to="/login" replace /> :
          diagnostic ? <Navigate to="/mentors" replace /> :
          <DiagnosticPage onComplete={handleDiagnosticComplete} />
        }
      />
      <Route
        path="/mentors"
        element={
          <RequireAuth diagnostic={diagnostic}>
            <MentorBoardPage diagnostic={diagnostic} onRetakeDiagnostic={handleRetakeDiagnostic} />
          </RequireAuth>
        }
      />
      <Route path="/feedback" element={<FeedbackPage />} />
      <Route path="/staff" element={<StaffPage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <GuestProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              style: { background: '#1a1a2e', color: '#fff', border: '1px solid #2a2a4a', borderRadius: '12px' },
              error: { style: { borderColor: '#ef4444' } },
              success: { style: { borderColor: '#10b981' } },
            }}
          />
          <AppRoutes />
        </GuestProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
