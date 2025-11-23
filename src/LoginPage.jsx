import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from './api/supabaseClient'
import LoadingSpinner from './components/LoadingSpinner'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/citas'
  const cardHeight = 'min(520px, calc(100vh - 48px))'

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setErrorMessage(error.message)
    else navigate(from)
    setLoading(false)
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-200 opacity-30 blur-[160px]" />
        <div className="absolute right-1/4 top-1/2 h-80 w-80 translate-x-1/4 -translate-y-1/2 rounded-full bg-lime-200 opacity-40 blur-[150px]" />
      </div>

      <div
        className="relative z-10 w-full max-w-lg rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-2xl shadow-emerald-100 backdrop-blur"
        style={{ height: cardHeight }}
      >
        <div className="flex h-full flex-col justify-center">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-500">Natursur</p>
            <h1 className="mt-2 text-2xl font-semibold text-gray-900">Inicia sesión</h1>
            <p className="text-sm text-gray-500">Introduce tus credenciales para continuar.</p>
          </div>

          {errorMessage && (
            <div className="mt-4 rounded-2xl border border-red-100 bg-red-50/80 p-4 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          <form className="mt-6 space-y-4" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="text-sm font-semibold text-gray-700">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full rounded-2xl border border-gray-200 bg-white/95 px-4 py-3 text-gray-900 shadow-inner shadow-gray-100 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>

            <div>
              <label htmlFor="password" className="text-sm font-semibold text-gray-700">Contraseña</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 w-full rounded-2xl border border-gray-200 bg-white/95 px-4 py-3 text-gray-900 shadow-inner shadow-gray-100 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-lime-400 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-200 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <LoadingSpinner size={4} className="text-white" />
                  <span>Entrando…</span>
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
